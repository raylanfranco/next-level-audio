import { NextRequest, NextResponse } from "next/server";
import { cloverFetch, isCloverConfigured } from "@/lib/clover/client";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type { CloverPaymentsResponse } from "@/types/clover";

// Admin only — payment data is sensitive.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  if (!isCloverConfigured) {
    return NextResponse.json({ error: "Clover API not configured", payments: [] }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const data = await cloverFetch<CloverPaymentsResponse>("/payments", {
      params: {
        limit,
        offset,
        expand: "tender,order",
      },
    });

    return NextResponse.json({
      payments: data.elements || [],
      count: data.elements?.length || 0,
      href: data.href,
    });
  } catch (error) {
    console.error("Clover payments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Clover payments", details: String(error) },
      { status: 500 }
    );
  }
}
