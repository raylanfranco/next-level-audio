import { NextRequest, NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import type { CloverItem } from "@/types/clover";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: "Clover API not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, price, cost, code, description, categoryId, stockCount } = body;

    // Update the item fields
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (cost !== undefined) updateData.cost = cost || null;
    if (code !== undefined) updateData.code = code || null;
    if (description !== undefined) updateData.description = description || null;

    const item = await cloverFetch<CloverItem>(`/items/${id}`, {
      method: "POST", // Clover uses POST for updates
      body: updateData,
    });

    // Update category association if provided
    if (categoryId !== undefined) {
      // First remove existing category associations
      const existingItem = await cloverFetch<CloverItem>(`/items/${id}`, {
        params: { expand: "categories" },
      });
      if (existingItem.categories?.elements) {
        for (const cat of existingItem.categories.elements) {
          await cloverFetch(`/category_items`, {
            method: "DELETE",
            body: { elements: [{ item: { id }, category: { id: cat.id } }] },
          }).catch(() => {});
        }
      }
      // Add new category
      if (categoryId) {
        await cloverFetch(`/category_items`, {
          method: "POST",
          body: { elements: [{ item: { id }, category: { id: categoryId } }] },
        }).catch(() => {});
      }
    }

    // Update stock if provided
    if (stockCount !== undefined) {
      await cloverFetch(`/item_stocks/${id}`, {
        method: "POST",
        body: { quantity: stockCount },
      }).catch(() => {});
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Clover update item error:", error);
    return NextResponse.json({ error: "Failed to update item", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: "Clover API not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    await cloverFetch(`/items/${id}`, { method: "DELETE" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clover delete item error:", error);
    return NextResponse.json({ error: "Failed to delete item", details: String(error) }, { status: 500 });
  }
}
