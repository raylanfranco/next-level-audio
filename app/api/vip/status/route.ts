import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatMemberNumber, getBenefitUsage, getMembership, isStripeConfigured } from '@/lib/vip';

/** GET — the signed-in user's VIP membership + benefits remaining. */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await getMembership(user.id);
  if (!membership || membership.status === 'inactive') {
    return NextResponse.json({ membership: null, joinable: isStripeConfigured() });
  }

  const benefits = await getBenefitUsage(membership);

  return NextResponse.json({
    membership: {
      status: membership.status,
      memberNumber: formatMemberNumber(membership.member_number),
      currentPeriodEnd: membership.current_period_end,
    },
    benefits,
    joinable: isStripeConfigured(),
  });
}
