import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createServerClient } from "@/lib/supabase/client";
import { resolveProductImage } from "@/lib/productImages";

const BUCKET = "product-images";
const TABLE = "product_image_overrides";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** GET ?id= — current resolved image + whether it's a manual override. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: 'Missing "id"' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: override } = await supabase
    .from(TABLE)
    .select("image_url, storage_path, updated_at")
    .eq("clover_item_id", id)
    .maybeSingle();

  const imageUrl = await resolveProductImage(id);
  return NextResponse.json({
    imageUrl,
    isOverride: !!override,
    override: override ?? null,
  });
}

/** PUT — set the image from a URL. Body: { cloverItemId, imageUrl }. */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: { cloverItemId?: string; imageUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { cloverItemId, imageUrl } = body;
  if (!cloverItemId || !imageUrl) {
    return NextResponse.json(
      { error: "cloverItemId and imageUrl are required" },
      { status: 400 }
    );
  }

  try {
    const u = new URL(imageUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
  } catch {
    return NextResponse.json(
      { error: "imageUrl must be a valid http(s) URL" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // If this item previously had an uploaded file, remember it so we can clean up.
  const { data: existing } = await supabase
    .from(TABLE)
    .select("storage_path")
    .eq("clover_item_id", cloverItemId)
    .maybeSingle();

  const { error } = await supabase.from(TABLE).upsert(
    {
      clover_item_id: cloverItemId,
      image_url: imageUrl,
      storage_path: null,
      updated_at: new Date().toISOString(),
      updated_by: auth.userId,
    } as never,
    { onConflict: "clover_item_id" }
  );

  if (error) {
    console.error("product-image override upsert error:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }

  const oldPath = (existing as { storage_path: string | null } | null)?.storage_path;
  if (oldPath) {
    await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
  }

  return NextResponse.json({ ok: true, imageUrl, isOverride: true });
}

/** POST — upload a file (multipart). Fields: file, cloverItemId. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  const cloverItemId = String(form.get("cloverItemId") || "");

  if (!cloverItemId) {
    return NextResponse.json({ error: "cloverItemId is required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${cloverItemId}/${Date.now()}.${ext}`;

  const supabase = createServerClient();
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("product-image upload error:", uploadError);
    return NextResponse.json(
      { error: "Upload failed (is the 'product-images' bucket created?)", details: uploadError.message },
      { status: 500 }
    );
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const imageUrl = pub.publicUrl;

  // Remove any previously uploaded file for this item.
  const { data: existing } = await supabase
    .from(TABLE)
    .select("storage_path")
    .eq("clover_item_id", cloverItemId)
    .maybeSingle();

  const { error } = await supabase.from(TABLE).upsert(
    {
      clover_item_id: cloverItemId,
      image_url: imageUrl,
      storage_path: storagePath,
      updated_at: new Date().toISOString(),
      updated_by: auth.userId,
    } as never,
    { onConflict: "clover_item_id" }
  );

  if (error) {
    console.error("product-image override upsert error:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }

  const oldPath = (existing as { storage_path: string | null } | null)?.storage_path;
  if (oldPath && oldPath !== storagePath) {
    await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
  }

  return NextResponse.json({ ok: true, imageUrl, isOverride: true });
}

/** DELETE ?id= — remove the override and revert to the scraper's baseline. */
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: 'Missing "id"' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from(TABLE)
    .select("storage_path")
    .eq("clover_item_id", id)
    .maybeSingle();

  const { error } = await supabase.from(TABLE).delete().eq("clover_item_id", id);
  if (error) {
    console.error("product-image override delete error:", error);
    return NextResponse.json({ error: "Failed to revert image" }, { status: 500 });
  }

  const oldPath = (existing as { storage_path: string | null } | null)?.storage_path;
  if (oldPath) {
    await supabase.storage.from(BUCKET).remove([oldPath]).catch(() => {});
  }

  // Return the now-current (baseline) image so the UI can update.
  const imageUrl = await resolveProductImage(id);
  return NextResponse.json({ ok: true, imageUrl, isOverride: false });
}
