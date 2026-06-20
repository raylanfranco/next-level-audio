-- ============================================================================
-- MIGRATION 001 — Fix the profiles table (production hotfix)
-- ============================================================================
-- WHY: Production's `profiles` table was an empty stub { id bigint, created_at }
-- with 0 rows, no `role`/`email`/etc., and no signup trigger. The app (auth,
-- admin role gate, account area, referrals, rewards) expects the full profiles
-- schema with a UUID id referencing auth.users. This recreates the real table,
-- the signup trigger, backfills existing users, and grants admin.
--
-- SAFE: the stub has 0 rows, so dropping it loses nothing. All OTHER tables
-- (coupons, referrals, reward_points, orders, etc.) are already correct and are
-- NOT touched. Run in the Supabase SQL Editor.
--
-- Run order matters; this is wrapped in a transaction so it's all-or-nothing.
-- ============================================================================

begin;

-- 1. Drop the empty/malformed stub. (Verified: 0 rows.)
drop table if exists public.profiles cascade;

-- 2. Create the real profiles table the app expects.
create table public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text not null default '',
  email         text unique,
  phone         text,
  role          text not null default 'customer' check (role in ('customer', 'admin')),
  referral_code text unique,
  referred_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_referral_code on public.profiles(referral_code);

-- 3. Row Level Security — a user can read/update only their own profile.
--    Service role (used by server API routes) bypasses RLS for admin reads.
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Service role manages profiles" on public.profiles
  for all to service_role using (true) with check (true);

-- 4. Auto-create a profile row on every new signup (this trigger was MISSING).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    upper(substring(md5(new.id::text) from 1 for 8))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Backfill profile rows for the 3 EXISTING auth users (the trigger only
--    fires on NEW signups, so existing users need rows created manually).
insert into public.profiles (id, email, full_name, referral_code)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  upper(substring(md5(u.id::text) from 1 for 8))
from auth.users u
on conflict (id) do nothing;

-- 6. Grant admin to all current accounts (per your call). Tighten later by
--    setting any that shouldn't be admin back to 'customer'.
update public.profiles set role = 'admin';

commit;

-- ============================================================================
-- VERIFY (run after the migration — should show 3 rows, all role = 'admin'):
--   select id, email, role, referral_code from public.profiles order by created_at;
-- ============================================================================
