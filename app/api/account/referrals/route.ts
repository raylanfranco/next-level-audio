import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createServerClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role to join profiles for referred user names
  const adminClient = createServerClient();
  const { data: referrals, error } = await adminClient
    .from('referrals')
    .select('id, referred_id, bonus_awarded, created_at')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch referrals:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }

  // Fetch referred user names
  const referredIds = (referrals || []).map((r) => r.referred_id);
  let nameMap: Record<string, string> = {};

  if (referredIds.length > 0) {
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .in('id', referredIds);

    if (profiles) {
      nameMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));
    }
  }

  const enriched = (referrals || []).map((r) => ({
    id: r.id,
    referred_name: nameMap[r.referred_id] || 'Unknown',
    bonus_awarded: r.bonus_awarded,
    created_at: r.created_at,
  }));

  return NextResponse.json({ referrals: enriched });
}
