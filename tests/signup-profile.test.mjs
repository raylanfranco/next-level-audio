import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';

test('signup persists optional phone before confirmation without changing profile defaults', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE SCHEMA auth;
      CREATE ROLE auth_writer;
      CREATE TABLE auth.users (
        id uuid PRIMARY KEY,
        email text,
        raw_user_meta_data jsonb,
        email_confirmed_at timestamptz
      );
      CREATE TABLE public.profiles (
        id uuid PRIMARY KEY REFERENCES auth.users(id),
        email text,
        full_name text,
        phone text,
        referral_code text UNIQUE,
        role text DEFAULT 'customer'
      );
      CREATE FUNCTION public.handle_new_user() RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, referral_code)
        VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
          UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8)));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      GRANT USAGE ON SCHEMA auth TO auth_writer;
      GRANT INSERT ON auth.users TO auth_writer;
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ('00000000-0000-0000-0000-000000000001', 'existing@example.test',
        '{"full_name":"Existing Customer"}');
      UPDATE public.profiles SET phone = 'existing contact';
    `);

    const migration = readFileSync(new URL('../supabase/migrations/20261121233955_persist_signup_phone.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration);

    const cases = [
      { metadata: { full_name: 'VIP Customer', phone: '  (570) 555-0123  ', role: 'admin' }, phone: '(570) 555-0123' },
      { metadata: { full_name: 'Blank Phone', phone: '   ' }, phone: null },
      { metadata: { full_name: 'No Phone' }, phone: null },
      { metadata: { full_name: 'Null Phone', phone: null }, phone: null },
      { metadata: null, phone: null },
    ];

    for (const [index, { metadata, phone }] of cases.entries()) {
      const id = `00000000-0000-0000-0000-${String(index + 2).padStart(12, '0')}`;
      const email = `signup-${index}@example.test`;
      await db.exec('SET ROLE auth_writer;');
      await db.query('INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3)',
        [id, email, metadata === null ? null : JSON.stringify(metadata)]);
      await db.exec('RESET ROLE;');

      const { rows } = await db.query('SELECT * FROM public.profiles WHERE id = $1', [id]);
      assert.deepEqual(rows[0], {
        id,
        email,
        full_name: metadata?.full_name ?? '',
        phone,
        referral_code: createHash('md5').update(id).digest('hex').slice(0, 8).toUpperCase(),
        role: 'customer',
      });
      const confirmation = await db.query('SELECT email_confirmed_at FROM auth.users WHERE id = $1', [id]);
      assert.equal(confirmation.rows[0].email_confirmed_at, null);
    }

    const existing = await db.query("SELECT phone FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001'");
    assert.equal(existing.rows[0].phone, 'existing contact');
  } finally {
    await db.close();
  }
});
