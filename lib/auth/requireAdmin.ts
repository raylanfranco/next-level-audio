import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Server-side admin guard for API routes.
 *
 * Verifies (1) there is an authenticated user, and (2) that user's
 * profiles.role === 'admin'. The role is read with the service-role client
 * so RLS can't hide it, but the USER identity comes from their own cookie
 * session — so a customer can never read as someone else.
 *
 * Returns `{ ok: true, userId }` when authorized, or `{ ok: false, response }`
 * with a ready 401/403 to return from the route.
 *
 * Usage:
 *   const auth = await requireAdmin();
 *   if (!auth.ok) return auth.response;
 */
export async function requireAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id };
}

/**
 * Lighter guard for dual-use endpoints (admin sees everything; a regular
 * authenticated user sees only their own data). Returns the authenticated
 * user's id, email, and whether they are an admin — or a 401 response.
 */
export async function getAuthedUser(): Promise<
  | { ok: true; userId: string; email: string | null; isAdmin: boolean }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  return {
    ok: true,
    userId: user.id,
    email: profile?.email ?? user.email ?? null,
    isAdmin: profile?.role === 'admin',
  };
}
