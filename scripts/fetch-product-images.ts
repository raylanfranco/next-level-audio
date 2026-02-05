import * as fs from 'fs';
import * as path from 'path';
import { chromium, type Browser, type Page } from 'playwright';

// --- Config ---
const CACHE_FILE = path.join(process.cwd(), 'data', 'product-images.json');
const DELAY_BETWEEN_SEARCHES_MS = 3000; // 3s between searches to avoid CAPTCHAs
const BATCH_SIZE = 200; // No daily limit with Playwright — process in batches for safety

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0') || 0;

// --- Types ---
interface CacheEntry {
  imageUrl: string | null;
  source: 'google_images' | 'google_upc' | 'not_found' | 'skipped' | 'error';
  name: string;
  upc: string | null;
  fetchedAt: string;
}

interface ImageCache {
  [cloverItemId: string]: CacheEntry;
}

interface CloverItem {
  id: string;
  name: string;
  code?: string;
  sku?: string;
  price: number;
  hidden?: boolean;
  deleted?: boolean;
}

// --- Helpers ---
function loadCache(): ImageCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch {
    console.warn('Warning: Could not read cache file, starting fresh.');
  }
  return {};
}

function saveCache(cache: ImageCache) {
  const dir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Load .env.local manually since we're running outside Next.js
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function fetchAllCloverItems(): Promise<CloverItem[]> {
  const token = process.env.CLOVER_API_TOKEN;
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const baseUrl = process.env.CLOVER_API_BASE_URL || 'https://api.clover.com';

  if (!token || !merchantId) {
    throw new Error('Missing CLOVER_API_TOKEN or CLOVER_MERCHANT_ID in .env.local');
  }

  const allItems: CloverItem[] = [];
  let offset = 0;
  const limit = 100;

  console.log('Fetching inventory from Clover...');

  while (true) {
    const url = `${baseUrl}/v3/merchants/${merchantId}/items?limit=${limit}&offset=${offset}&expand=categories`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Clover API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    const items: CloverItem[] = data.elements || [];

    // Filter out hidden/deleted
    const valid = items.filter((item: CloverItem) => !item.hidden && !item.deleted);
    allItems.push(...valid);

    console.log(`  Fetched ${allItems.length} items so far (offset=${offset})...`);

    if (items.length < limit) break;
    offset += limit;

    await sleep(500);
  }

  console.log(`Total inventory items: ${allItems.length}\n`);
  return allItems;
}

/**
 * Clean a product name into a good Google Images search query.
 */
function buildSearchQuery(item: CloverItem): string | null {
  const skipPatterns = /\b(labor|service|install|installation|custom|misc|deposit|gift card|tax|tint service|intoxalock)\b/i;
  if (skipPatterns.test(item.name)) return null;

  // Clean name: remove brackets, extra whitespace, "NLA" prefix (Next Level Audio internal)
  let query = item.name
    .replace(/\[.*?\]/g, '') // remove bracketed text like [Full SUV]
    .replace(/\bNLA\b/gi, '')
    .replace(/\b(w\/|w\/o)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (query.length < 3) return null;

  // Add "car audio" context for generic names
  return `${query} product`;
}

/**
 * Search Google Images using Playwright and return the first product image URL.
 * Clicks on the first thumbnail to reveal the full-resolution source URL.
 */
async function searchGoogleImages(page: Page, query: string): Promise<string | null> {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&udm=2`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for thumbnails to appear
    await page.waitForSelector('#search img, #islrg img, [data-ri] img', { timeout: 8000 }).catch(() => {});
    await sleep(1000);

    // Click the first image thumbnail to open the side panel with the full-res URL
    const clicked = await page.evaluate(() => {
      // Google Images thumbnails are inside anchor/div containers with data-ri attributes
      const containers = document.querySelectorAll('[data-ri="0"], #islrg .isv-r:first-child');
      for (const container of containers) {
        const img = container.querySelector('img');
        if (img) {
          img.click();
          return true;
        }
      }
      // Fallback: click the first non-tiny image
      const allImgs = document.querySelectorAll('#search img, #islrg img');
      for (const img of allImgs) {
        const el = img as HTMLImageElement;
        if (el.width > 40 && el.height > 40 && !el.src.includes('gstatic')) {
          el.click();
          return true;
        }
      }
      return false;
    });

    if (!clicked) {
      // Fallback: try to find any usable image URL from the page
      return extractAnyImageUrl(page);
    }

    // Wait for the side panel / expanded view to load
    await sleep(2000);

    // Extract the full-resolution image from the expanded panel
    const fullImageUrl = await page.evaluate(() => {
      // The expanded image panel contains full-res images
      // Look for large images that loaded after clicking
      const imgs = document.querySelectorAll('img[src^="http"]');
      const candidates: string[] = [];

      for (const img of imgs) {
        const el = img as HTMLImageElement;
        const src = el.src;
        if (
          src.startsWith('http') &&
          !src.includes('google.com') &&
          !src.includes('gstatic.com') &&
          !src.includes('googleapis.com') &&
          !src.includes('youtube.com') &&
          el.naturalWidth > 100
        ) {
          candidates.push(src);
        }
      }

      // Also check for image URLs in anchor hrefs (Google sometimes wraps images in links)
      const anchors = document.querySelectorAll('a[href*="imgurl="]');
      for (const a of anchors) {
        const href = a.getAttribute('href') || '';
        const match = href.match(/imgurl=([^&]+)/);
        if (match) {
          candidates.unshift(decodeURIComponent(match[1]));
        }
      }

      return candidates.length > 0 ? candidates[0] : null;
    });

    return fullImageUrl;
  } catch {
    return null;
  }
}

/**
 * Fallback: extract any usable image URL from the current page without clicking.
 */
async function extractAnyImageUrl(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    // Check for image URLs in the page's script data (Google embeds URLs in JSON)
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const text = script.textContent || '';
      // Google embeds original image URLs in various data structures
      const matches = text.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
      if (matches) {
        for (const url of matches) {
          if (
            !url.includes('google') &&
            !url.includes('gstatic') &&
            !url.includes('googleapis') &&
            url.length < 500
          ) {
            return url;
          }
        }
      }
    }
    return null;
  });
}

/**
 * Try UPC-based Google search first (more accurate), then name-based.
 */
async function findProductImage(
  page: Page,
  item: CloverItem
): Promise<{ imageUrl: string | null; source: CacheEntry['source'] }> {
  // Try UPC search first if available
  if (item.code && item.code.length >= 8) {
    const upcUrl = await searchGoogleImages(page, `${item.code} product`);
    if (upcUrl) {
      return { imageUrl: upcUrl, source: 'google_upc' };
    }
    await sleep(DELAY_BETWEEN_SEARCHES_MS);
  }

  // Fall back to name search
  const query = buildSearchQuery(item);
  if (!query) {
    return { imageUrl: null, source: 'skipped' };
  }

  const nameUrl = await searchGoogleImages(page, query);
  return {
    imageUrl: nameUrl,
    source: nameUrl ? 'google_images' : 'not_found',
  };
}

// --- Main ---
async function main() {
  loadEnv();

  console.log('=== Product Image Fetcher (Playwright) ===');
  console.log(`Cache file: ${CACHE_FILE}`);
  console.log(`Force mode: ${FORCE}`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log(`Batch size: ${LIMIT || BATCH_SIZE}\n`);

  const items = await fetchAllCloverItems();
  const cache = FORCE ? {} : loadCache();

  // Filter to items not yet cached (or cached without images if --force)
  const uncached = items.filter((item) => !cache[item.id]);
  const maxToProcess = LIMIT || BATCH_SIZE;

  console.log(`Already cached: ${items.length - uncached.length}`);
  console.log(`To process: ${uncached.length}`);
  console.log(`Will process: ${Math.min(uncached.length, maxToProcess)}\n`);

  if (DRY_RUN) {
    console.log('Dry run mode — not launching browser.');
    console.log('\nSample items without cache:');
    uncached.slice(0, 20).forEach((item) => {
      const query = buildSearchQuery(item);
      console.log(`  [${item.id}] ${item.name}`);
      console.log(`    UPC: ${item.code || 'none'} | Query: ${query || '(skipped)'}`);
    });

    const skippable = uncached.filter((i) => !buildSearchQuery(i));
    console.log(`\nWould skip: ${skippable.length} (service/labor items)`);
    console.log(`Would search: ${uncached.length - skippable.length}`);
    return;
  }

  // Launch headless browser
  console.log('Launching headless browser...');
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled'],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // Accept Google cookies if prompted
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const acceptBtn = await page.$('button:has-text("Accept all"), button:has-text("I agree")');
    if (acceptBtn) await acceptBtn.click();
    await sleep(1000);

    let searchCount = 0;
    let foundCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    const toProcess = uncached.slice(0, maxToProcess);

    for (let i = 0; i < toProcess.length; i++) {
      const item = toProcess[i];
      const progress = `[${i + 1}/${toProcess.length}]`;

      // Check if item should be skipped
      const query = buildSearchQuery(item);
      if (!query) {
        skippedCount++;
        console.log(`${progress} Skipping "${item.name}" (service/labor item)`);
        cache[item.id] = {
          imageUrl: null,
          source: 'skipped',
          name: item.name,
          upc: item.code || null,
          fetchedAt: new Date().toISOString(),
        };
        continue;
      }

      // Delay between searches
      if (searchCount > 0) {
        await sleep(DELAY_BETWEEN_SEARCHES_MS);
      }

      console.log(`${progress} Searching for "${item.name}"...`);
      if (item.code) console.log(`  UPC: ${item.code}`);

      const result = await findProductImage(page, item);
      searchCount++;

      if (result.imageUrl) {
        foundCount++;
        console.log(`  ✓ Found image (${result.source}): ${result.imageUrl.substring(0, 80)}...`);
      } else if (result.source === 'skipped') {
        skippedCount++;
        console.log(`  — Skipped`);
      } else {
        notFoundCount++;
        console.log(`  ✗ No image found`);
      }

      cache[item.id] = {
        imageUrl: result.imageUrl,
        source: result.source,
        name: item.name,
        upc: item.code || null,
        fetchedAt: new Date().toISOString(),
      };

      // Save every 10 items for crash resilience
      if ((i + 1) % 10 === 0) {
        saveCache(cache);
        console.log(`  (Cache saved — ${Object.keys(cache).length} entries)\n`);
      }
    }

    // Final save
    saveCache(cache);

    const totalWithImages = Object.values(cache).filter((e) => e.imageUrl).length;

    console.log('\n=== Summary ===');
    console.log(`Searches performed: ${searchCount}`);
    console.log(`Images found this run: ${foundCount}`);
    console.log(`Not found this run: ${notFoundCount}`);
    console.log(`Skipped (service items): ${skippedCount}`);
    console.log(`Total cached: ${Object.keys(cache).length}`);
    console.log(`Total with images: ${totalWithImages}`);
    console.log(`Remaining uncached: ${items.length - Object.keys(cache).length}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\nBrowser closed.');
    }
  }
}

main().catch(console.error);
