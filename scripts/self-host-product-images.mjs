/**
 * Self-Host Product Images Script
 *
 * Downloads all product images from external URLs, converts to WebP,
 * uploads to Supabase Storage, and updates product-images.json.
 *
 * Usage: node scripts/self-host-product-images.mjs
 *
 * Prerequisites:
 * - Create a "product-images" bucket in Supabase Storage (public)
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load env
const envPath = path.join(ROOT, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  if (line.startsWith('#') || !line.includes('=')) continue;
  const [key, ...rest] = line.split('=');
  env[key.trim()] = rest.join('=').trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'product-images';
const MAX_WIDTH = 800;
const WEBP_QUALITY = 80;
const CONCURRENCY = 5;
const TIMEOUT_MS = 15000;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const dataPath = path.join(ROOT, 'data', 'product-images.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const entries = Object.entries(data).filter(([, v]) => v.imageUrl);
console.log(`Found ${entries.length} images to process.`);

let succeeded = 0;
let failed = 0;
let skipped = 0;

async function downloadImage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (NLA Image Downloader)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) throw new Error('Image too small (likely error page)');
    return buffer;
  } finally {
    clearTimeout(timeout);
  }
}

async function convertToWebp(buffer) {
  return sharp(buffer)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

async function uploadToSupabase(fileName, buffer) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${fileName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
}

function getPublicUrl(fileName) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
}

async function processImage(id, entry) {
  const fileName = `${id}.webp`;

  // Check if already uploaded (has supabase URL)
  if (entry.imageUrl?.includes('supabase.co/storage')) {
    skipped++;
    return;
  }

  try {
    const raw = await downloadImage(entry.imageUrl);
    const webp = await convertToWebp(raw);
    await uploadToSupabase(fileName, webp);

    // Update the entry with the new self-hosted URL
    entry.originalUrl = entry.imageUrl;
    entry.imageUrl = getPublicUrl(fileName);
    entry.source = 'self-hosted';
    succeeded++;
  } catch (err) {
    failed++;
    if (failed <= 10) {
      console.error(`  FAIL [${id}]: ${err.message} (${entry.imageUrl})`);
    }
  }
}

// Process in batches
async function processAll() {
  const startTime = Date.now();

  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(([id, entry]) => processImage(id, entry)));

    // Progress
    const done = Math.min(i + CONCURRENCY, entries.length);
    if (done % 50 === 0 || done === entries.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(`  [${done}/${entries.length}] succeeded=${succeeded} failed=${failed} skipped=${skipped} (${elapsed}s)`);
    }
  }

  // Save updated JSON
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\nDone in ${elapsed}s!`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Updated: ${dataPath}`);
}

processAll().catch(console.error);
