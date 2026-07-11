import * as fs from 'fs';
import * as path from 'path';
import { createServerClient } from '@/lib/supabase/client';

/**
 * Product image resolution.
 *
 * Priority: admin overrides (Supabase `product_image_overrides`) win over the
 * nightly scraper's baseline in `data/product-images.json`. This lets an admin
 * pin a stable, self-hosted image that the scraper can never clobber.
 *
 * All lookups are keyed by Clover item id.
 */

interface CacheEntry {
  imageUrl: string | null;
  source: string;
  name: string;
  upc: string | null;
  fetchedAt: string;
}

type ImageCache = Record<string, CacheEntry>;

let jsonCache: ImageCache | null = null;
let jsonLoadedAt = 0;
const JSON_TTL = 60_000; // reload the baseline file at most once a minute

function getJsonCache(): ImageCache {
  const now = Date.now();
  if (jsonCache && now - jsonLoadedAt < JSON_TTL) return jsonCache;

  const cachePath = path.join(process.cwd(), 'data', 'product-images.json');
  try {
    if (fs.existsSync(cachePath)) {
      jsonCache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      jsonLoadedAt = now;
      return jsonCache!;
    }
  } catch {
    // ignore read errors — fall through to empty
  }
  jsonCache = {};
  jsonLoadedAt = now;
  return jsonCache;
}

/**
 * Fetch admin overrides for the given Clover item ids. Uses the service-role
 * client (server-only). Returns a map of id -> image_url. Fails soft: any
 * error (missing table, no service key) yields an empty map so callers still
 * get the JSON baseline.
 */
async function getOverrides(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('product_image_overrides')
      .select('clover_item_id, image_url')
      .in('clover_item_id', ids);
    if (error) return {};
    const map: Record<string, string> = {};
    for (const row of (data || []) as { clover_item_id: string; image_url: string | null }[]) {
      if (row.image_url) map[row.clover_item_id] = row.image_url;
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Resolve images for many Clover item ids at once (override → JSON → null).
 */
export async function resolveProductImages(
  ids: string[]
): Promise<Record<string, string | null>> {
  const json = getJsonCache();
  const overrides = await getOverrides(ids);
  const out: Record<string, string | null> = {};
  for (const id of ids) {
    out[id] = overrides[id] ?? json[id]?.imageUrl ?? null;
  }
  return out;
}

/**
 * Resolve a single Clover item id (override → JSON → null).
 */
export async function resolveProductImage(id: string): Promise<string | null> {
  const map = await resolveProductImages([id]);
  return map[id] ?? null;
}
