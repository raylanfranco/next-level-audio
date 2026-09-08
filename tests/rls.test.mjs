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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
GRANT ALL ON public.profiles, public.bookings, public.products TO authenticated, anon, service_role;
INSERT INTO public.profiles VALUES ('00000000-0000-0000-0000-000000000001','Customer','123','customer@example.test','customer');
INSERT INTO public.profiles VALUES ('00000000-0000-0000-0000-000000000002','Other','456','other@example.test','customer');`);
await db.exec(readFileSync(new URL('../supabase/migrations/20260908031517_harden_profile_and_legacy_access.sql', import.meta.url), 'utf8'));
await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';`);
await db.exec(`UPDATE public.profiles SET full_name = 'Updated' WHERE id = auth.uid()`);
assert.equal((await db.query('SELECT full_name FROM public.profiles')).rows[0].full_name, 'Updated');
for (const sql of [`UPDATE public.profiles SET role='admin' WHERE id=auth.uid()`, `UPDATE public.profiles SET email='other@example.test' WHERE id=auth.uid()`, `SELECT * FROM public.bookings`, `DELETE FROM public.products`]) {
  await assert.rejects(db.exec(sql), /permission denied/);
}
assert.equal((await db.query(`UPDATE public.profiles SET full_name='Hacked' WHERE id='00000000-0000-0000-0000-000000000002' RETURNING id`)).rows.length, 0);
await db.exec('RESET ROLE; SET ROLE service_role;');
await db.exec(`UPDATE public.profiles SET role='admin' WHERE id='00000000-0000-0000-0000-000000000001'`);
await db.close();
console.log('PASS: profile contact update allowed; role/email changes and cross-user update blocked; legacy booking reads and product deletion blocked; service-role admin maintenance allowed.');
