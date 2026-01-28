import { NextRequest, NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import type { CloverCustomersResponse } from "@/types/clover";

export async function GET(request: NextRequest) {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: "Clover API not configured", customers: [] }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";

    const data = await cloverFetch<CloverCustomersResponse>("/customers", {
      params: { limit, offset },
    });

    return NextResponse.json({
      customers: data.elements || [],
      count: data.elements?.length || 0,
      href: data.href,
    });
  } catch (error) {
    console.error("Clover customers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Clover customers", details: String(error) },
      { status: 500 }
    );
  }
}
