import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

interface CacheEntry {
  imageUrl: string | null;
  source: string;
  name: string;
  upc: string | null;
  fetchedAt: string;
}

type ImageCache = Record<string, CacheEntry>;

let cache: ImageCache | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL = 60_000; // reload from disk every 60s

function getCache(): ImageCache {
  const now = Date.now();
  if (cache && now - cacheLoadedAt < CACHE_TTL) return cache;

  const cachePath = path.join(process.cwd(), "data", "product-images.json");
  try {
    if (fs.existsSync(cachePath)) {
      cache = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      cacheLoadedAt = now;
      return cache!;
    }
  } catch {
    // ignore read errors
  }
  cache = {};
  cacheLoadedAt = now;
  return cache;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageCache = getCache();

  // Single item lookup
  const id = searchParams.get("id");
  if (id) {
    const entry = imageCache[id];
    return NextResponse.json({
      imageUrl: entry?.imageUrl || null,
    });
  }

  // Batch lookup
  const ids = searchParams.get("ids");
  if (ids) {
    const idList = ids.split(",").filter(Boolean);
    const images: Record<string, string | null> = {};
    for (const itemId of idList) {
      images[itemId] = imageCache[itemId]?.imageUrl || null;
    }
    return NextResponse.json({ images });
  }

  return NextResponse.json(
    { error: 'Provide "id" or "ids" query parameter' },
    { status: 400 }
  );
}
