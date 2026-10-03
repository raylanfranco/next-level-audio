-- Business-facing VIP tracking and concurrency-safe benefit redemption.

alter table public.vip_memberships
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists canceled_at timestamptz;

alter table public.vip_benefit_usage
  add column if not exists voided_at timestamptz,
  add column if not exists voided_by uuid references auth.users (id),
  add column if not exists void_reason text;

create index if not exists vip_memberships_status_period_idx
  on public.vip_memberships (status, current_period_end);

create index if not exists vip_benefit_usage_active_period_idx
  on public.vip_benefit_usage (profile_id, benefit_type, used_at)
  where voided_at is null;

-- Lock the member row while counting and recording a benefit so two staff
-- requests cannot redeem the last available visit at the same time.
create or replace function public.record_vip_benefit_usage(
  p_profile_id uuid,
  p_benefit_type text,
  p_note text,
  p_recorded_by uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_status text;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_used integer;
  v_usage_id uuid;
begin
  if p_benefit_type not in ('diagnostic', 'checkup') then
    raise exception 'Unknown VIP benefit';
  end if;

  if p_note is not null and length(p_note) > 500 then
    raise exception 'Benefit note is too long';
  end if;

  select
    membership.status,
    coalesce(membership.current_period_start, now() - interval '365 days'),
    membership.current_period_end
  into v_status, v_period_start, v_period_end
  from public.vip_memberships as membership
  where membership.profile_id = p_profile_id
  for update;

  if not found then
    raise exception 'VIP membership not found';
  end if;

  if v_status <> 'active' or (v_period_end is not null and v_period_end <= now()) then
    raise exception 'VIP membership is not active';
  end if;

  select count(*)::integer
  into v_used
  from public.vip_benefit_usage as usage
  where usage.profile_id = p_profile_id
    and usage.benefit_type = p_benefit_type
    and usage.used_at >= v_period_start
    and usage.voided_at is null;

  if v_used >= 2 then
    raise exception 'VIP benefit limit reached';
  end if;

  insert into public.vip_benefit_usage (
    profile_id,
    benefit_type,
    note,
    recorded_by
  )
  values (
    p_profile_id,
    p_benefit_type,
    nullif(trim(p_note), ''),
    p_recorded_by
  )
  returning id into v_usage_id;

  return v_usage_id;
end;
$$;

revoke execute on function public.record_vip_benefit_usage(uuid, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.record_vip_benefit_usage(uuid, text, text, uuid)
  to service_role;
