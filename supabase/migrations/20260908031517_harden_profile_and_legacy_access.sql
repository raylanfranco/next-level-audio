BEGIN;

-- Users may edit contact details, never their role or identity email.
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
DO $$
DECLARE column_name text;
BEGIN
  FOR column_name IN SELECT a.attname FROM pg_attribute a
    WHERE a.attrelid = 'public.profiles'::regclass AND a.attnum > 0 AND NOT a.attisdropped
  LOOP
    EXECUTE format('REVOKE UPDATE (%I) ON public.profiles FROM anon, authenticated', column_name);
  END LOOP;
END $$;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- The legacy bookings table is no longer a public booking API. NLA now uses
-- the authenticated Who's Next bridge; retain historical rows for operators.
REVOKE ALL ON public.bookings FROM anon, authenticated;
DROP POLICY IF EXISTS "Allow public booking inserts" ON public.bookings;
DROP POLICY IF EXISTS "Admin can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can manage bookings" ON public.bookings;

-- Storefront reads remain public. Product changes go through server APIs.
DROP POLICY IF EXISTS "Authenticated can manage products" ON public.products;
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon, authenticated;

COMMIT;
