import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/client';

/**
 * Next Level VIP membership ($199/year Stripe subscription).
 *
 * Stripe runs against Ben's own Stripe account (the same one Who's Next
 * booking deposits land in) — plain API keys, no Connect. The webhook route
 * (/api/stripe/webhook) keeps vip_memberships in sync; everything here reads
 * that table, so a Stripe outage never blocks the storefront.
 */

export const VIP_DISCOUNT_PERCENT = 10;

/** Included per membership year. */
export const VIP_BENEFITS = {
  diagnostic: 2,
  checkup: 2,
} as const;

export type VipBenefitType = keyof typeof VIP_BENEFITS;

export interface VipMembership {
  profile_id: string;
  member_number: number;
  status: 'inactive' | 'active' | 'past_due' | 'canceled';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

let stripeSingleton: Stripe | null = null;

/** Server-only Stripe client. Throws if STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_VIP_PRICE_ID;
}

/** Format a member number as printed on the card (e.g. 1 -> "NLV0001"). */
export function formatMemberNumber(n: number): string {
  return `NLV${String(n).padStart(4, '0')}`;
}

export async function getMembership(profileId: string): Promise<VipMembership | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('vip_memberships')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) {
    console.error('vip_memberships read error:', error);
    return null;
  }
  return (data as VipMembership) ?? null;
}

/** Active VIP = subscription in good standing right now. */
export async function isActiveVip(profileId: string): Promise<boolean> {
  const m = await getMembership(profileId);
  return m?.status === 'active';
}

/**
 * Benefit usage within the current membership year. Falls back to the last
 * 365 days if period dates are missing (shouldn't happen once webhooks run).
 */
export async function getBenefitUsage(
  membership: VipMembership
): Promise<Record<VipBenefitType, { used: number; total: number }>> {
  const supabase = createServerClient();
  const periodStart =
    membership.current_period_start ??
    new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('vip_benefit_usage')
    .select('benefit_type')
    .eq('profile_id', membership.profile_id)
    .gte('used_at', periodStart);

  const counts: Record<string, number> = {};
  if (error) {
    console.error('vip_benefit_usage read error:', error);
  } else {
    for (const row of (data || []) as { benefit_type: string }[]) {
      counts[row.benefit_type] = (counts[row.benefit_type] || 0) + 1;
    }
  }

  return {
    diagnostic: { used: counts.diagnostic || 0, total: VIP_BENEFITS.diagnostic },
    checkup: { used: counts.checkup || 0, total: VIP_BENEFITS.checkup },
  };
}

/**
 * Upsert the membership row from a Stripe subscription. Used by the webhook
 * and the post-checkout sync. Newer Stripe API versions expose the period on
 * the subscription item; older ones on the subscription itself — handle both.
 */
export async function syncMembershipFromSubscription(
  profileId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = createServerClient();

  const item = subscription.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_start?: number; current_period_end?: number })
    | undefined;
  const legacy = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
  };
  const periodStart = item?.current_period_start ?? legacy.current_period_start;
  const periodEnd = item?.current_period_end ?? legacy.current_period_end;

  const status = mapStripeStatus(subscription.status);

  const { error } = await supabase.from('vip_memberships').upsert(
    {
      profile_id: profileId,
      status,
      stripe_customer_id:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer?.id ?? null,
      stripe_subscription_id: subscription.id,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: 'profile_id' }
  );

  if (error) {
    console.error('vip_memberships upsert error:', error);
    throw new Error('Failed to sync membership');
  }
}

function mapStripeStatus(s: Stripe.Subscription.Status): VipMembership['status'] {
  switch (s) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'inactive'; // incomplete, paused
  }
}
