import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createServerClient } from "@/lib/supabase/client";
import { getBaselineEntries } from "@/lib/productImages";

const OVERRIDES_TABLE = "product_image_overrides";
const REVIEWS_TABLE = "product_image_reviews";

export interface QueueItem {
  cloverItemId: string;
  name: string;
  upc: string | null;
  imageUrl: string | null;
  source: string;
  fetchedAt: string;
}

/**
 * GET — list scraped images awaiting approval.
 *
 * Pending = baseline cache entries the scraper wrote as status:pending, minus
 * anything already decided (a row in product_image_reviews) or already given
 * a manual override. `missing` lists new products the scraper found no image
 * for, so they can be uploaded manually from Inventory.
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const baseline = getBaselineEntries();
  const candidates = Object.entries(baseline).filter(
    ([, entry]) => entry.status !== "approved" && entry.source !== "skipped"
  );

  const ids = candidates.map(([id]) => id);
  const decided = new Set<string>();

  if (ids.length > 0) {
    const supabase = createServerClient();
    const [reviews, overrides] = await Promise.all([
      supabase.from(REVIEWS_TABLE).select("clover_item_id").in("clover_item_id", ids),
      supabase.from(OVERRIDES_TABLE).select("clover_item_id").in("clover_item_id", ids),
    ]);
    for (const row of (reviews.data || []) as { clover_item_id: string }[]) {
      decided.add(row.clover_item_id);
    }
    for (const row of (overrides.data || []) as { clover_item_id: string }[]) {
      decided.add(row.clover_item_id);
    }
  }

  const toItem = ([id, entry]: [string, ReturnType<typeof getBaselineEntries>[string]]): QueueItem => ({
    cloverItemId: id,
    name: entry.name,
    upc: entry.upc,
    imageUrl: entry.imageUrl,
    source: entry.source,
    fetchedAt: entry.fetchedAt,
  });

  const undecided = candidates.filter(([id]) => !decided.has(id));
  const newestFirst = (a: QueueItem, b: QueueItem) => b.fetchedAt.localeCompare(a.fetchedAt);

  const pending = undecided.filter(([, e]) => e.imageUrl).map(toItem).sort(newestFirst);
  const missing = undecided.filter(([, e]) => !e.imageUrl).map(toItem).sort(newestFirst);

  return NextResponse.json({ pending, missing });
}

/** POST — decide a queue item. Body: { cloverItemId, action: 'approve' | 'reject' }. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: { cloverItemId?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { cloverItemId, action } = body;
  if (!cloverItemId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json(
      { error: 'cloverItemId and action ("approve" | "reject") are required' },
      { status: 400 }
    );
  }

  const entry = getBaselineEntries()[cloverItemId];
  if (!entry) {
    return NextResponse.json({ error: "Unknown item" }, { status: 404 });
  }

  const supabase = createServerClient();
  const now = new Date().toISOString();

  if (action === "approve") {
    if (!entry.imageUrl) {
      return NextResponse.json({ error: "Item has no image to approve" }, { status: 400 });
    }
    // Approval goes live by pinning the URL as an admin override — the
    // baseline stays pending, so the scraper can never resurrect it unvetted.
    const { error: overrideError } = await supabase.from(OVERRIDES_TABLE).upsert(
      {
        clover_item_id: cloverItemId,
        image_url: entry.imageUrl,
        storage_path: null,
        updated_at: now,
        updated_by: auth.userId,
      } as never,
      { onConflict: "clover_item_id" }
    );
    if (overrideError) {
      console.error("image-queue approve override error:", overrideError);
      return NextResponse.json({ error: "Failed to approve image" }, { status: 500 });
    }
  }

  const { error: reviewError } = await supabase.from(REVIEWS_TABLE).upsert(
    {
      clover_item_id: cloverItemId,
      status: action === "approve" ? "approved" : "rejected",
      image_url: entry.imageUrl,
      reviewed_at: now,
      reviewed_by: auth.userId,
    } as never,
    { onConflict: "clover_item_id" }
  );
  if (reviewError) {
    console.error("image-queue review upsert error:", reviewError);
    return NextResponse.json({ error: "Failed to record decision" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, action, imageUrl: action === "approve" ? entry.imageUrl : null });
}
