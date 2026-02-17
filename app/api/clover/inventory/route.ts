import { NextRequest, NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import type { CloverItem, CloverItemsResponse } from "@/types/clover";

export async function POST(request: NextRequest) {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: "Clover API not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, price, cost, code, description, categoryId, stockCount } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: "name and price are required" }, { status: 400 });
    }

    // Create the item
    const item = await cloverFetch<CloverItem>("/items", {
      method: "POST",
      body: { name, price, cost: cost || undefined, code: code || undefined, description: description || undefined },
    });

    // Assign to category if provided
    if (categoryId) {
      await cloverFetch(`/category_items`, {
        method: "POST",
        body: { elements: [{ item: { id: item.id }, category: { id: categoryId } }] },
      }).catch(() => {}); // best-effort
    }

    // Set stock if provided
    if (stockCount != null && stockCount > 0) {
      await cloverFetch(`/item_stocks/${item.id}`, {
        method: "POST",
        body: { quantity: stockCount },
      }).catch(() => {}); // best-effort
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Clover create item error:", error);
    return NextResponse.json({ error: "Failed to create item", details: String(error) }, { status: 500 });
  }
}

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
    const expand = searchParams.get("expand") || "categories,tags,itemStock";

    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");

    // If filtering by category, use the category-items endpoint
    const endpoint = categoryId
      ? `/categories/${categoryId}/items`
      : "/items";

    const params: Record<string, string> = { limit, offset, expand };

    // Clover supports server-side filtering with the `filter` param
    if (search) {
      params.filter = `name LIKE %${search}%`;
    }

    const data = await cloverFetch<CloverItemsResponse>(endpoint, {
      params,
    });

    // Filter out hidden/deleted/offline items for the storefront
    const rawElements = data.elements || [];
    const items = rawElements
      .filter((item) => !item.hidden && !item.deleted)
      .map((item) => ({
        ...item,
        // Use expanded itemStock quantity when available
        stockCount: item.itemStock?.quantity ?? item.stockCount ?? 0,
      }));

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
