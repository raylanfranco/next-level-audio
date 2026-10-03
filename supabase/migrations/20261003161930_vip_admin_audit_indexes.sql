create index if not exists vip_benefit_usage_recorded_by_idx
  on public.vip_benefit_usage (recorded_by)
  where recorded_by is not null;

create index if not exists vip_benefit_usage_voided_by_idx
  on public.vip_benefit_usage (voided_by)
  where voided_by is not null;
