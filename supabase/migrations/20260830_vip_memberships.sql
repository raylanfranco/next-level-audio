-- ============================================================================
-- Next Level VIP membership ($199/year via Stripe subscription)
-- ----------------------------------------------------------------------------
-- One membership row per profile (member_number is assigned once and survives
-- lapses/renewals). Status mirrors the Stripe subscription, driven by the
-- /api/stripe/webhook route. Benefit usage (2 diagnostic visits + 2 system
-- checkups per membership year) is a ledger; "remaining" is computed against
-- the current period start.
--
-- Service-role access only (via API routes) — RLS enabled, no public policies,
-- same model as product_image_overrides.
--
-- Run once in the Supabase SQL editor (Dashboard > SQL > New query).
-- ============================================================================

create sequence if not exists vip_member_number_seq start 1;

create table if not exists public.vip_memberships (
  profile_id             uuid primary key references public.profiles (id) on delete cascade,
  member_number          integer not null default nextval('vip_member_number_seq'),
  status                 text not null default 'inactive'
                         check (status in ('inactive', 'active', 'past_due', 'canceled')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create unique index if not exists vip_memberships_stripe_sub_idx
  on public.vip_memberships (stripe_subscription_id)
  where stripe_subscription_id is not null;

create table if not exists public.vip_benefit_usage (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  benefit_type text not null check (benefit_type in ('diagnostic', 'checkup')),
  used_at      timestamptz not null default now(),
  note         text,
  recorded_by  uuid references auth.users (id)
);

create index if not exists vip_benefit_usage_profile_idx
  on public.vip_benefit_usage (profile_id, benefit_type, used_at);

alter table public.vip_memberships enable row level security;
alter table public.vip_benefit_usage enable row level security;
-- No policies on purpose: service-role key bypasses RLS; all access goes
-- through the API routes.
