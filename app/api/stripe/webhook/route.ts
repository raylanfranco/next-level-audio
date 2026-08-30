import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/client';
import { getStripe, syncMembershipFromSubscription } from '@/lib/vip';

/**
 * Stripe webhook — keeps vip_memberships in sync with subscription state.
 * Configure the endpoint in Ben's Stripe dashboard pointing at
 * https://nextlevelaudiopa.com/api/stripe/webhook with events:
 *   checkout.session.completed, customer.subscription.updated,
 *   customer.subscription.deleted, invoice.payment_failed
 * and put the signing secret in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const profileId = session.client_reference_id || session.metadata?.profileId;
        if (!profileId || !session.subscription) break;
        const subscription = await getStripe().subscriptions.retrieve(
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id
        );
        await syncMembershipFromSubscription(profileId, subscription);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const profileId = await resolveProfileId(subscription);
        if (profileId) {
          await syncMembershipFromSubscription(profileId, subscription);
        } else {
          console.warn(`Stripe webhook: no profile for subscription ${subscription.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        // subscription.updated (status past_due) follows and does the sync;
        // log here so failed renewals are visible in Vercel logs.
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`VIP renewal payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        break; // Unhandled event types are fine — Stripe sends what we subscribe to.
    }
  } catch (err) {
    // Non-2xx makes Stripe retry with backoff, which is what we want.
    console.error(`Stripe webhook handler error for ${event.type}:`, err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** Find the owning profile: subscription metadata first, then our table. */
async function resolveProfileId(subscription: Stripe.Subscription): Promise<string | null> {
  if (subscription.metadata?.profileId) return subscription.metadata.profileId;

  const supabase = createServerClient();
  const { data } = await supabase
    .from('vip_memberships')
    .select('profile_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();
  return (data as { profile_id: string } | null)?.profile_id ?? null;
}
