import { NextRequest, NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import { createServerClient } from "@/lib/supabase/client";
import type { CloverItemsResponse } from "@/types/clover";
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

function getImageCache(): ImageCache {
  const cachePath = path.join(process.cwd(), "data", "product-images.json");
  try {
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    }
  } catch {}
  return {};
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest) {
  if (!isCloverConfigured) {
    return NextResponse.json({ items: [] });
  }

  const { searchParams } = new URL(request.url);
  const count = Math.min(parseInt(searchParams.get("count") || "6", 10), 12);

  try {
    const imageCache = getImageCache();
    const idsWithImages = new Set(
      Object.entries(imageCache)
        .filter(([, entry]) => entry.imageUrl)
        .map(([id]) => id)
    );

    if (idsWithImages.size === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch a large batch of items in a single Clover API call
    const data = await cloverFetch<CloverItemsResponse>("/items", {
      params: { limit: "200", offset: "0", expand: "categories" },
    });

    const allItems = (data.elements || []).filter(
      (item) => !item.hidden && !item.deleted && idsWithImages.has(item.id)
    );

    // Try to order by best sellers from Supabase cache
    let selected: typeof allItems;
    try {
      const supabase = createServerClient();
      const { data: bestSellers } = await supabase
        .from("best_sellers")
        .select("clover_item_id, total_quantity_sold")
        .order("total_quantity_sold", { ascending: false })
        .limit(count * 3);

      if (bestSellers && bestSellers.length > 0) {
        // Build a rank map from best sellers data
        const rankMap = new Map<string, number>();
        bestSellers.forEach((bs, idx) => rankMap.set(bs.clover_item_id, idx));

        // Sort items: best sellers first (by rank), then the rest shuffled
        const bestSellerItems = allItems
          .filter((item) => rankMap.has(item.id))
          .sort((a, b) => (rankMap.get(a.id) ?? 999) - (rankMap.get(b.id) ?? 999));
        const otherItems = shuffle(
          allItems.filter((item) => !rankMap.has(item.id))
        );

        selected = [...bestSellerItems, ...otherItems].slice(0, count);
      } else {
        // No best sellers data yet — fall back to random
        selected = shuffle(allItems).slice(0, count);
      }
    } catch {
      // Supabase error — fall back to random
      selected = shuffle(allItems).slice(0, count);
    }

    return NextResponse.json({
      items: selected.map((item) => ({
        ...item,
        imageUrl: imageCache[item.id].imageUrl,
      })),
    });
  } catch (error) {
    console.error("Featured products error:", error);
    return NextResponse.json({ items: [] });
  }
}
