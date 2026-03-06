import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";
import { fetchAndAggregate } from "@/lib/best-sellers/aggregate";

export async function POST() {
  try {
    const aggregated = await fetchAndAggregate();

    if (aggregated.length === 0) {
      return NextResponse.json({
        message: "No order data found to aggregate",
        count: 0,
      });
    }

    const supabase = createServerClient();

    // Upsert all aggregated products into the best_sellers table
    const rows = aggregated.map((p) => ({
      clover_item_id: p.cloverItemId,
      item_name: p.itemName,
      total_quantity_sold: p.totalQuantitySold,
      total_revenue_cents: p.totalRevenueCents,
      order_count: p.orderCount,
      last_sold_at: p.lastSoldAt,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("best_sellers")
      .upsert(rows, { onConflict: "clover_item_id" });

    if (error) {
      console.error("Best sellers upsert error:", error);
      return NextResponse.json(
        { error: "Failed to save best sellers data", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Best sellers refreshed successfully",
      count: aggregated.length,
      topSeller: aggregated[0]
        ? `${aggregated[0].itemName} (${aggregated[0].totalQuantitySold} sold)`
        : null,
    });
  } catch (error) {
    console.error("Best sellers refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh best sellers", details: String(error) },
      { status: 500 }
    );
  }
}
