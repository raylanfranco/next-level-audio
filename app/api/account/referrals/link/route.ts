import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  const { referralCode, newUserId } = await request.json();

  if (!referralCode || !newUserId) {
    return NextResponse.json({ error: 'Missing referralCode or newUserId' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Find the referrer by their referral code
  const { data: referrer, error: referrerError } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode.toUpperCase())
    .single();

  if (referrerError || !referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
  }

  // Don't let users refer themselves
  if (referrer.id === newUserId) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
  }

  // Update the new user's profile with referred_by
  await supabase
    .from('profiles')
    .update({ referred_by: referrer.id })
    .eq('id', newUserId);

  // Create referral record
  const { error: insertError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referred_id: newUserId,
      bonus_awarded: false,
    });

  if (insertError) {
    console.error('Failed to create referral record:', insertError);
    // Non-critical — the referred_by link is already set
  }

  return NextResponse.json({ success: true });
}
