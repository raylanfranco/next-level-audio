import * as fs from 'fs';
import * as path from 'path';

// --- Config ---
const CLOVER_API_BASE_URL = process.env.CLOVER_API_BASE_URL || 'https://api.clover.com';
const CLOVER_API_TOKEN = process.env.CLOVER_API_TOKEN;
const CLOVER_MERCHANT_ID = process.env.CLOVER_MERCHANT_ID;

const CACHE_FILE = path.join(process.cwd(), 'data', 'product-images.json');
const UPCITEMDB_BASE = 'https://api.upcitemdb.com/prod/trial';

const RATE_LIMIT_PER_MIN = 6;
const DAILY_LIMIT = 100;
const DELAY_BETWEEN_REQUESTS_MS = Math.ceil(60_000 / RATE_LIMIT_PER_MIN) + 500; // ~10.5s

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');

// --- Types ---
interface CacheEntry {
  imageUrl: string | null;
  source: 'upcitemdb_upc' | 'upcitemdb_search' | 'not_found' | 'no_code' | 'error';
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

interface UPCItemDBResponse {
  code: string;
  total: number;
  offset: number;
  items?: Array<{
    ean: string;
    title: string;
    brand: string;
    images: string[];
  }>;
}

// --- Helpers ---
function loadCache(): ImageCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
  } catch (err) {
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
    const valid = items.filter((item) => !item.hidden && !item.deleted);
    allItems.push(...valid);

    console.log(`  Fetched ${allItems.length} items so far (offset=${offset})...`);

    if (items.length < limit) break;
    offset += limit;

    // Small delay to avoid Clover rate limits
    await sleep(500);
  }

  console.log(`Total inventory items: ${allItems.length}\n`);
  return allItems;
}

async function lookupByUPC(upc: string): Promise<string | null> {
  try {
    const url = `${UPCITEMDB_BASE}/lookup?upc=${encodeURIComponent(upc)}`;
    const res = await fetch(url);

    if (res.status === 429) {
      console.log('  Rate limited by UPCitemdb. Stopping for today.');
      return '__RATE_LIMITED__';
    }

    if (!res.ok) return null;

    const data: UPCItemDBResponse = await res.json();
    if (data.items && data.items.length > 0 && data.items[0].images.length > 0) {
      return data.items[0].images[0];
    }
    return null;
  } catch {
    return null;
  }
}

async function searchByName(name: string): Promise<string | null> {
  try {
    // Clean the name: remove generic terms that pollute search
    const cleaned = name
      .replace(/\b(installation|install|labor|service|custom)\b/gi, '')
      .trim();

    if (cleaned.length < 3) return null;

    const url = `${UPCITEMDB_BASE}/search?s=${encodeURIComponent(cleaned)}&type=product`;
    const res = await fetch(url);

    if (res.status === 429) {
      console.log('  Rate limited by UPCitemdb. Stopping for today.');
      return '__RATE_LIMITED__';
    }

    if (!res.ok) return null;

    const data: UPCItemDBResponse = await res.json();
    if (data.items && data.items.length > 0 && data.items[0].images.length > 0) {
      return data.items[0].images[0];
    }
    return null;
  } catch {
    return null;
  }
}

// --- Main ---
async function main() {
  loadEnv();

  console.log('=== Product Image Fetcher ===');
  console.log(`Cache file: ${CACHE_FILE}`);
  console.log(`Force mode: ${FORCE}`);
  console.log(`Dry run: ${DRY_RUN}\n`);

  const items = await fetchAllCloverItems();
  const cache = FORCE ? {} : loadCache();

  // Filter to items not yet cached
  const uncached = items.filter((item) => !cache[item.id]);
  console.log(`Already cached: ${items.length - uncached.length}`);
  console.log(`To process: ${uncached.length}`);
  console.log(`Daily limit: ${DAILY_LIMIT} requests\n`);

  if (DRY_RUN) {
    console.log('Dry run mode - not making any UPC lookups.');
    console.log('\nSample items without cache:');
    uncached.slice(0, 20).forEach((item) => {
      console.log(`  [${item.id}] ${item.name} | UPC: ${item.code || 'none'} | SKU: ${item.sku || 'none'}`);
    });

    // Count how many have UPC codes
    const withCode = uncached.filter((i) => i.code);
    const withSku = uncached.filter((i) => i.sku);
    console.log(`\nItems with UPC code: ${withCode.length}/${uncached.length}`);
    console.log(`Items with SKU: ${withSku.length}/${uncached.length}`);
    return;
  }

  let requestCount = 0;
  let foundCount = 0;
  let notFoundCount = 0;

  for (let i = 0; i < uncached.length; i++) {
    if (requestCount >= DAILY_LIMIT) {
      console.log(`\nReached daily limit of ${DAILY_LIMIT} requests. Run again tomorrow!`);
      break;
    }

    const item = uncached[i];
    const progress = `[${i + 1}/${uncached.length}]`;

    let imageUrl: string | null = null;
    let source: CacheEntry['source'] = 'not_found';

    if (item.code) {
      // Try UPC lookup first
      console.log(`${progress} Looking up UPC "${item.code}" for "${item.name}"...`);
      imageUrl = await lookupByUPC(item.code);
      requestCount++;

      if (imageUrl === '__RATE_LIMITED__') {
        console.log('\nRate limited! Saving progress and exiting.');
        saveCache(cache);
        return;
      }

      if (imageUrl) {
        source = 'upcitemdb_upc';
        foundCount++;
        console.log(`  ✓ Found image via UPC`);
      } else {
        console.log(`  ✗ No image via UPC`);
      }

      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }

    // If no UPC image, try name search (only for items that look like real products)
    if (!imageUrl && !item.code) {
      // Skip generic service/labor items
      const skipPatterns = /\b(labor|service|install|custom|misc|deposit|gift card|tax)\b/i;
      if (skipPatterns.test(item.name)) {
        source = 'no_code';
        console.log(`${progress} Skipping "${item.name}" (service/labor item)`);
      } else if (requestCount < DAILY_LIMIT) {
        console.log(`${progress} Searching by name "${item.name}"...`);
        imageUrl = await searchByName(item.name);
        requestCount++;

        if (imageUrl === '__RATE_LIMITED__') {
          console.log('\nRate limited! Saving progress and exiting.');
          saveCache(cache);
          return;
        }

        if (imageUrl) {
          source = 'upcitemdb_search';
          foundCount++;
          console.log(`  ✓ Found image via search`);
        } else {
          notFoundCount++;
          console.log(`  ✗ No image found`);
        }

        await sleep(DELAY_BETWEEN_REQUESTS_MS);
      }
    } else if (!imageUrl) {
      notFoundCount++;
    }

    cache[item.id] = {
      imageUrl,
      source,
      name: item.name,
      upc: item.code || null,
      fetchedAt: new Date().toISOString(),
    };

    // Save every 10 items for crash resilience
    if ((i + 1) % 10 === 0) {
      saveCache(cache);
      console.log(`  (Cache saved - ${Object.keys(cache).length} entries)\n`);
    }
  }

  // Final save
  saveCache(cache);

  console.log('\n=== Summary ===');
  console.log(`Total cached: ${Object.keys(cache).length}`);
  console.log(`Found images this run: ${foundCount}`);
  console.log(`Not found this run: ${notFoundCount}`);
  console.log(`API requests used: ${requestCount}/${DAILY_LIMIT}`);
  console.log(`Remaining uncached: ${items.length - Object.keys(cache).length}`);
}

main().catch(console.error);
