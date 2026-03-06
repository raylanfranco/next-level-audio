import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET — list all coupons (admin only)
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: coupons, error } = await adminClient
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }

  return NextResponse.json({ coupons: coupons || [] });
}

// POST — create a coupon (admin only)
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { code, type, value, min_order_cents, max_uses, points_cost, expires_at } = body;

  if (!code || !type || value === undefined) {
    return NextResponse.json({ error: 'code, type, and value are required' }, { status: 400 });
  }

  if (!['percent', 'fixed'].includes(type)) {
    return NextResponse.json({ error: 'type must be "percent" or "fixed"' }, { status: 400 });
  }

  const { data: coupon, error } = await adminClient
    .from('coupons')
    .insert({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      min_order_cents: min_order_cents ? Number(min_order_cents) : null,
      max_uses: max_uses ? Number(max_uses) : null,
      points_cost: points_cost ? Number(points_cost) : 0,
      expires_at: expires_at || null,
      is_active: true,
      used_count: 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 });
    }
    console.error('Failed to create coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }

  return NextResponse.json({ coupon }, { status: 201 });
}

// PATCH — update a coupon (admin only)
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
  }

  const { data: coupon, error } = await adminClient
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }

  return NextResponse.json({ coupon });
}
