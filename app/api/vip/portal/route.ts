import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMembership, getStripe } from '@/lib/vip';

/**
 * POST — open the Stripe customer portal (update card, cancel, invoices).
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await getMembership(user.id);
  if (!membership?.stripe_customer_id) {
    return NextResponse.json({ error: 'No membership on file' }, { status: 404 });
  }

  const origin = request.headers.get('origin') || new URL(request.url).origin;

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: membership.stripe_customer_id,
      return_url: `${origin}/account/membership`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('VIP portal session error:', err);
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
  }
}
