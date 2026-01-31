import { NextRequest, NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import type { CloverItemsResponse } from "@/types/clover";

export async function GET(request: NextRequest) {
  if (!isCloverConfigured) {
    return NextResponse.json(
      { error: "Clover API not configured", items: [] },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";
    const expand = searchParams.get("expand") || "categories,tags";

    const categoryId = searchParams.get("category");

    // If filtering by category, use the category-items endpoint
    const endpoint = categoryId
      ? `/categories/${categoryId}/items`
      : "/items";

    const data = await cloverFetch<CloverItemsResponse>(endpoint, {
      params: { limit, offset, expand },
    });

    // Filter out hidden/deleted/offline items for the storefront
    const rawElements = data.elements || [];
    const items = rawElements.filter(
      (item) => !item.hidden && !item.deleted
    );

    return NextResponse.json({
      items,
      count: items.length,
      rawCount: rawElements.length,
      href: data.href,
    });
  } catch (error) {
    console.error("Clover inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Clover inventory", details: String(error) },
      { status: 500 }
    );
  }
}
