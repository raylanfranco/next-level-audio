import { NextRequest, NextResponse } from "next/server";
import { resolveProductImage, resolveProductImages } from "@/lib/productImages";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Single item lookup
  const id = searchParams.get("id");
  if (id) {
    const imageUrl = await resolveProductImage(id);
    return NextResponse.json({ imageUrl });
  }

  // Batch lookup
  const ids = searchParams.get("ids");
  if (ids) {
    const idList = ids.split(",").filter(Boolean);
    const images = await resolveProductImages(idList);
    return NextResponse.json({ images });
  }

  return NextResponse.json(
    { error: 'Provide "id" or "ids" query parameter' },
    { status: 400 }
  );
}
