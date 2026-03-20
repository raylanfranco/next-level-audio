import { NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import type { CloverItemsResponse } from "@/types/clover";
import * as fs from "fs";
import * as path from "path";

const CLOSEOUT_CATEGORY_ID = "01WBX75J473WY";

interface CacheEntry {
  imageUrl: string | null;
  source: string;
  name: string;
  upc: string | null;
  fetchedAt: string;
}

type ImageCache = Record<string, CacheEntry>;

function getImageCache(): ImageCache {
  const cachePath = path.join(process.cwd(), "data", "product-images.json");
  try {
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    }
  } catch {}
  return {};
}

export async function GET() {
  if (!isCloverConfigured) {
    return NextResponse.json({ items: [] });
  }

  try {
    const data = await cloverFetch<CloverItemsResponse>(
      `/categories/${CLOSEOUT_CATEGORY_ID}/items`,
      { params: { limit: "50", expand: "categories,itemStock" } }
    );

    const imageCache = getImageCache();

    const items = (data.elements || [])
      .filter((item) => !item.hidden && !item.deleted)
      .map((item) => ({
        ...item,
        stockCount: item.itemStock?.quantity ?? item.stockCount ?? 0,
        imageUrl: imageCache[item.id]?.imageUrl || null,
      }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Closeout products fetch error:", error);
    return NextResponse.json({ items: [] });
  }
}
