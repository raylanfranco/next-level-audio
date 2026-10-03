import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  formatMemberNumber,
  getBenefitUsage,
  getMembership,
  getStripe,
  isStripeConfigured,
  syncMembershipFromSubscription,
} from '@/lib/vip';

/** GET — the signed-in user's VIP membership + benefits remaining. */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checkoutSessionId = request.nextUrl.searchParams.get('session_id');
  if (checkoutSessionId && isStripeConfigured()) {
    try {
      const checkout = await getStripe().checkout.sessions.retrieve(checkoutSessionId);
      const profileId = checkout.client_reference_id || checkout.metadata?.profileId;
      if (profileId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (checkout.status === 'complete' && checkout.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(
          typeof checkout.subscription === 'string'
            ? checkout.subscription
            : checkout.subscription.id
        );
        await syncMembershipFromSubscription(user.id, subscription);
      }
    } catch (error) {
      console.error('VIP post-checkout sync failed:', error);
      return NextResponse.json({ error: 'Unable to confirm VIP checkout' }, { status: 400 });
    }
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
      cancelAtPeriodEnd: membership.cancel_at_period_end,
    },
    benefits,
    joinable: isStripeConfigured(),
  });
}
