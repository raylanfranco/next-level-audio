import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const sort = searchParams.get("sort") === "revenue" ? "total_revenue_cents" : "total_quantity_sold";

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("best_sellers")
      .select("*")
      .order(sort, { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Best sellers fetch error:", error);
      // Return empty list gracefully (table may not exist yet)
      return NextResponse.json({ items: [], count: 0 });
    }

    return NextResponse.json({
      items: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("Best sellers error:", error);
    return NextResponse.json(
      { items: [], error: "Failed to fetch best sellers" },
      { status: 500 }
    );
  }
}
