import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  const { code, subtotalCents } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !coupon) {
    return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
  }

  // Validate coupon
  if (!coupon.is_active) {
    return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
  }

  if (coupon.min_order_cents && subtotalCents < coupon.min_order_cents) {
    const minOrder = (coupon.min_order_cents / 100).toFixed(2);
    return NextResponse.json(
      { error: `Minimum order of $${minOrder} required for this coupon` },
      { status: 400 }
    );
  }

  // Calculate discount
  let discountCents = 0;
  if (coupon.type === 'percent') {
    discountCents = Math.round((subtotalCents * coupon.value) / 100);
  } else {
    // Fixed amount in cents
    discountCents = Math.min(coupon.value, subtotalCents);
  }

  return NextResponse.json({
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountCents,
    },
  });
}
