import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip i18n for API routes and admin routes
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    // Admin auth protection
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      const { supabase, response } = createMiddlewareClient(request);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return response;
    }

    if (pathname === '/admin/login') {
      const { supabase, response } = createMiddlewareClient(request);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return response;
    }

    return NextResponse.next();
  }

  // Run next-intl middleware first (handles locale detection + rewriting)
  const response = intlMiddleware(request);

  // Determine the actual pathname after locale prefix removal
  // e.g. /es/account/orders → /account/orders
  const localePrefix = routing.locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  const strippedPathname = localePrefix
    ? pathname.replace(`/${localePrefix}`, '') || '/'
    : pathname;

  // Protect /account routes (except /account/login and /account/signup)
  if (
    strippedPathname.startsWith('/account') &&
    !strippedPathname.startsWith('/account/login') &&
    !strippedPathname.startsWith('/account/signup')
  ) {
    const { supabase } = createMiddlewareClient(request);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const loginUrl = new URL(
        localePrefix ? `/${localePrefix}/account/login` : '/account/login',
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // If logged in and hitting /account/login, redirect to /account
  if (strippedPathname === '/account/login') {
    const { supabase } = createMiddlewareClient(request);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const accountUrl = new URL(
        localePrefix ? `/${localePrefix}/account` : '/account',
        request.url
      );
      return NextResponse.redirect(accountUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except static files
    '/((?!_next|.*\\..*).*)',
  ],
};
