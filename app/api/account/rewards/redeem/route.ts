import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPointsBalance, awardPoints } from '@/lib/rewards';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { couponId } = await request.json();

  if (!couponId) {
    return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
  }

  // Look up the coupon
  const adminClient = createServerClient();
  const { data: coupon, error: couponError } = await adminClient
    .from('coupons')
    .select('*')
    .eq('id', couponId)
    .single();

  if (couponError || !coupon) {
    return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
  }

  if (!coupon.is_active) {
    return NextResponse.json({ error: 'Coupon is not active' }, { status: 400 });
  }

  if (coupon.points_cost <= 0) {
    return NextResponse.json({ error: 'This coupon cannot be redeemed with points' }, { status: 400 });
  }

  // Check user has enough points
  const balance = await getPointsBalance(user.id);
  if (balance < coupon.points_cost) {
    return NextResponse.json(
      { error: `Not enough points. Need ${coupon.points_cost}, have ${balance}.` },
      { status: 400 }
    );
  }

  // Deduct points
  await awardPoints(user.id, -coupon.points_cost, 'redemption', couponId);

  return NextResponse.json({
    success: true,
    couponCode: coupon.code,
    pointsSpent: coupon.points_cost,
    newBalance: balance - coupon.points_cost,
  });
}
