import * as fs from 'fs';
import * as path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'data', 'product-images.json');
const DELAY_MS = 6000; // UPCitemdb free tier allows ~100/day, need longer delays

interface CacheEntry {
  imageUrl: string | null;
  source: string;
  name: string;
  upc: string | null;
  fetchedAt: string;
}

interface ImageCache {
  [id: string]: CacheEntry;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadCache(): ImageCache {
  return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
}

function saveCache(cache: ImageCache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ── UPCitemdb lookup ──────────────────────────────────────

async function lookupUPC(upc: string, retried = false): Promise<string | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    if (res.status === 429) {
      if (retried) {
        console.log('  ⚠ Rate limited again — skipping');
        return null;
      }
      console.log('  ⚠ Rate limited — waiting 90s...');
      await sleep(90000);
      return lookupUPC(upc, true);
    }

    if (!res.ok) return null;

    const data = await res.json();
    const images = data.items?.[0]?.images;
    if (images && images.length > 0) {
      return images[0];
    }
    return null;
  } catch {
    return null;
  }
}

// ── Brand-specific CDN patterns ───────────────────────────

const BRAND_PATTERNS: { match: RegExp; buildUrl: (name: string) => string[] }[] = [
  {
    // Kicker: extract model number like 46CXA1800.1, CXA360.4, etc.
    match: /\bkicker\b/i,
    buildUrl: (name) => {
      // Try to extract model numbers
      const models = name.match(/\b(\d{0,2}[A-Z]{2,4}\d{2,5}\.?\d?)\b/gi) || [];
      return models.map((m) => `https://www.kicker.com/media/catalog/product/${m.replace(/\s/g, '')}.png`);
    },
  },
  {
    // JBL: try common CDN patterns
    match: /\bjbl\b/i,
    buildUrl: (name) => {
      const models = name.match(/\b(STAGE3?\s*\w+|CLUB\s*\w+|GTO\w+)\b/gi) || [];
      return models.map((m) => `https://www.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/${m.replace(/\s/g, '_')}.png`);
    },
  },
];

async function tryBrandCDN(name: string): Promise<string | null> {
  for (const pattern of BRAND_PATTERNS) {
    if (!pattern.match.test(name)) continue;
    const urls = pattern.buildUrl(name);
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        if (res.ok) return url;
      } catch {
        continue;
      }
    }
  }
  return null;
}

// ── Google Shopping fallback via SerpAPI-style search ──────

async function searchCseImage(query: string): Promise<string | null> {
  // Use Google's public favicon/thumbnail service as a last resort
  // This won't work for all, but try a direct product search on known retailers
  const retailers = [
    `https://www.sonicelectronix.com/query.php?query=${encodeURIComponent(query)}`,
    `https://www.crutchfield.com/S-${encodeURIComponent(query.replace(/\s/g, ''))}/`,
  ];

  // For now, skip retailer scraping — just return null
  // The UPC lookup covers most cases
  return null;
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const cache = loadCache();

  // Find null-image entries that aren't skipped
  const nullEntries = Object.entries(cache).filter(
    ([_, v]) => v.imageUrl === null && v.source !== 'skipped'
  );

  console.log(`=== Fill Missing Images ===`);
  console.log(`Total null entries (not skipped): ${nullEntries.length}`);

  const withUpc = nullEntries.filter(([_, v]) => v.upc && v.upc.length >= 8);
  const noUpc = nullEntries.filter(([_, v]) => !v.upc || v.upc.length < 8);

  console.log(`With valid UPC: ${withUpc.length}`);
  console.log(`Without UPC: ${noUpc.length}\n`);

  let found = 0;
  let attempted = 0;

  // Phase 1: UPC lookups
  console.log('── Phase 1: UPCitemdb lookups ──\n');
  for (const [id, entry] of withUpc) {
    attempted++;
    const progress = `[${attempted}/${withUpc.length}]`;
    console.log(`${progress} ${entry.name} (UPC: ${entry.upc})`);

    const imageUrl = await lookupUPC(entry.upc!);

    if (imageUrl) {
      found++;
      cache[id] = { ...entry, imageUrl, source: 'upcitemdb', fetchedAt: new Date().toISOString() };
      console.log(`  ✓ ${imageUrl.substring(0, 80)}...`);
    } else {
      console.log(`  ✗ No image from UPCitemdb`);
    }

    await sleep(DELAY_MS);

    // Save every 10
    if (attempted % 10 === 0) {
      saveCache(cache);
      console.log('  (saved)\n');
    }
  }

  saveCache(cache);
  console.log(`\nPhase 1 complete: ${found} found from ${withUpc.length} UPC lookups\n`);

  // Phase 2: Brand CDN patterns for no-UPC items
  console.log('── Phase 2: Brand CDN patterns ──\n');
  let brandFound = 0;

  for (const [id, entry] of noUpc) {
    console.log(`  ${entry.name}`);
    const imageUrl = await tryBrandCDN(entry.name);

    if (imageUrl) {
      brandFound++;
      cache[id] = { ...entry, imageUrl, source: 'brand_cdn', fetchedAt: new Date().toISOString() };
      console.log(`    ✓ ${imageUrl}`);
    } else {
      console.log(`    ✗ No brand CDN match`);
    }
  }

  saveCache(cache);

  // Phase 3: Re-check remaining nulls that had UPCs but UPCitemdb missed — try brand CDN too
  const stillNull = Object.entries(cache).filter(
    ([_, v]) => v.imageUrl === null && v.source !== 'skipped'
  );

  console.log(`\n── Phase 3: Brand CDN for remaining ${stillNull.length} nulls ──\n`);
  let phase3Found = 0;

  for (const [id, entry] of stillNull) {
    const imageUrl = await tryBrandCDN(entry.name);
    if (imageUrl) {
      phase3Found++;
      cache[id] = { ...entry, imageUrl, source: 'brand_cdn', fetchedAt: new Date().toISOString() };
      console.log(`  ✓ ${entry.name} → ${imageUrl}`);
    }
  }

  saveCache(cache);

  // Summary
  const totalNull = Object.values(cache).filter((v) => v.imageUrl === null && v.source !== 'skipped').length;
  const totalImages = Object.values(cache).filter((v) => v.imageUrl !== null).length;

  console.log(`\n=== Summary ===`);
  console.log(`UPCitemdb found: ${found}`);
  console.log(`Brand CDN found: ${brandFound + phase3Found}`);
  console.log(`Total with images: ${totalImages}`);
  console.log(`Remaining nulls: ${totalNull}`);
}

main().catch(console.error);
