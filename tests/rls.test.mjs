import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT current_setting('request.jwt.claim.sub', true)::uuid $$;
GRANT USAGE ON SCHEMA public, auth TO authenticated, anon, service_role;
CREATE TABLE public.profiles (id uuid PRIMARY KEY, full_name text, phone text, email text, role text);
CREATE TABLE public.bookings (id int);
CREATE TABLE public.products (id int);
CREATE TABLE public.career_applications (
  id uuid PRIMARY KEY,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  status text DEFAULT 'pending'
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
GRANT ALL ON public.profiles, public.bookings, public.products, public.career_applications TO authenticated, anon, service_role;
INSERT INTO public.profiles VALUES ('00000000-0000-0000-0000-000000000001','Customer','123','customer@example.test','customer');
INSERT INTO public.profiles VALUES ('00000000-0000-0000-0000-000000000002','Other','456','other@example.test','customer');`);
await db.exec(readFileSync(new URL('../supabase/migrations/20260908031517_harden_profile_and_legacy_access.sql', import.meta.url), 'utf8'));
await db.exec(readFileSync(new URL('../supabase/migrations/20261003220130_career_applications_rls.sql', import.meta.url), 'utf8'));
assert.equal((await db.query(`SELECT relrowsecurity FROM pg_class WHERE oid = 'public.career_applications'::regclass`)).rows[0].relrowsecurity, true);
for (const role of ['anon', 'authenticated']) {
  await db.exec(`SET ROLE ${role};`);
  for (const sql of [
    `SELECT * FROM public.career_applications`,
    `INSERT INTO public.career_applications (id, applicant_name, applicant_email) VALUES ('10000000-0000-0000-0000-000000000001', 'Applicant', 'applicant@example.test')`,
    `UPDATE public.career_applications SET status = 'reviewed'`,
    `DELETE FROM public.career_applications`,
  ]) {
    await assert.rejects(db.exec(sql), /permission denied/);
  }
  await db.exec('RESET ROLE;');
}
await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';`);
await db.exec(`UPDATE public.profiles SET full_name = 'Updated' WHERE id = auth.uid()`);
assert.equal((await db.query('SELECT full_name FROM public.profiles')).rows[0].full_name, 'Updated');
for (const sql of [`UPDATE public.profiles SET role='admin' WHERE id=auth.uid()`, `UPDATE public.profiles SET email='other@example.test' WHERE id=auth.uid()`, `SELECT * FROM public.bookings`, `DELETE FROM public.products`]) {
  await assert.rejects(db.exec(sql), /permission denied/);
}
assert.equal((await db.query(`UPDATE public.profiles SET full_name='Hacked' WHERE id='00000000-0000-0000-0000-000000000002' RETURNING id`)).rows.length, 0);
await db.exec('RESET ROLE; SET ROLE service_role;');
await db.exec(`UPDATE public.profiles SET role='admin' WHERE id='00000000-0000-0000-0000-000000000001'`);
await db.exec(`INSERT INTO public.career_applications (id, applicant_name, applicant_email) VALUES ('10000000-0000-0000-0000-000000000001', 'Applicant', 'applicant@example.test')`);
await db.exec(`UPDATE public.career_applications SET status='reviewed' WHERE id='10000000-0000-0000-0000-000000000001'`);
assert.equal((await db.query(`SELECT status FROM public.career_applications WHERE id='10000000-0000-0000-0000-000000000001'`)).rows[0].status, 'reviewed');
await db.exec(`DELETE FROM public.career_applications WHERE id='10000000-0000-0000-0000-000000000001'`);
await db.close();
console.log('PASS: profile contact update allowed; role/email changes and cross-user update blocked; legacy booking reads and product deletion blocked; career applications denied to browser roles and available to service-role maintenance.');
