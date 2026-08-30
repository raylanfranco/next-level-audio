import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getMembership, getStripe, isStripeConfigured } from '@/lib/vip';

/**
 * POST — start a Stripe Checkout session for the $199/year VIP membership.
 * Requires a signed-in customer; the webhook activates the membership.
 */
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'VIP signup is not available right now' }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to join VIP' }, { status: 401 });
  }

  const existing = await getMembership(user.id);
  if (existing?.status === 'active') {
    return NextResponse.json({ error: 'You are already a VIP member' }, { status: 400 });
  }

  const origin = request.headers.get('origin') || new URL(request.url).origin;
  const stripe = getStripe();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_VIP_PRICE_ID!, quantity: 1 }],
      success_url: `${origin}/account/membership?vip=success`,
      cancel_url: `${origin}/account/membership?vip=cancelled`,
      client_reference_id: user.id,
      // Reuse the Stripe customer across a lapse/rejoin so Ben's Stripe
      // dashboard shows one customer per person.
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email || undefined }),
      subscription_data: { metadata: { profileId: user.id } },
      metadata: { profileId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('VIP checkout session error:', err);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}
