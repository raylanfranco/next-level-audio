-- Career applications contain applicant PII and are only accessed through
-- server routes backed by the Supabase service role. Browser roles should
-- never query or mutate this table directly.

alter table public.career_applications enable row level security;

revoke all on table public.career_applications from anon, authenticated;

grant select, insert, update, delete
  on table public.career_applications
  to service_role;

comment on table public.career_applications is
  'Applicant PII. Access is restricted to server-side service-role routes.';
