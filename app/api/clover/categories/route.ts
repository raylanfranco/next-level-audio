import { NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import type { CloverCategoriesResponse } from "@/types/clover";

export async function GET() {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: "Clover API not configured", categories: [] }, { status: 503 });
  }

  try {
    const data = await cloverFetch<CloverCategoriesResponse>("/categories", {
      params: { limit: "100" },
    });

    const categories = (data.elements || [])
      .filter((c) => !c.deleted)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return NextResponse.json({
      categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Clover categories fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Clover categories", details: String(error) },
      { status: 500 }
    );
  }
}
