import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PARTNER_COOKIE = 'tdi_partnership_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  // ── Partner attribution cookie (existing logic, preserved) ──
  const partnerParam = req.nextUrl.searchParams.get('partnership_id');
  if (partnerParam) {
    response.cookies.set(PARTNER_COOKIE, partnerParam, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  // ── Supabase session cookie refresh ──
  // Syncs the auth session to cookies so server-side routes
  // (requireAdminAuth via @supabase/ssr) can read it.
  // This does NOT block unauthenticated requests — it only
  // refreshes the session cookie if one exists.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });

          // Re-apply partner cookie if it was set above
          if (partnerParam) {
            response.cookies.set(PARTNER_COOKIE, partnerParam, {
              maxAge: COOKIE_MAX_AGE,
              httpOnly: false,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            });
          }
        },
      },
    });

    // This refreshes the session. If a session cookie exists it refreshes the
    // token; if not, it is a no-op.
    //
    // This must never be allowed to throw. Middleware runs on every route in
    // the matcher, so an unhandled rejection here does not degrade one page,
    // it returns MIDDLEWARE_INVOCATION_FAILED for the entire site.
    //
    // That is exactly what happened to every Preview deployment. Preview had
    // its own NEXT_PUBLIC_SUPABASE_URL pointing at a Supabase project that no
    // longer exists, so this fetch failed at DNS. The env guard above did not
    // help, because the values were present, just wrong.
    //
    // A failed session refresh is worth degrading for: the visitor may appear
    // signed out and server routes fall back to their own auth checks. That is
    // recoverable. A blank 500 on every page is not.
    try {
      await supabase.auth.getUser();
    } catch (err) {
      console.error('[middleware] Session refresh failed, continuing without it:', err);
    }
  }

  return response;
}

// Expanded to include /api routes so session cookies are available
// to requireAdminAuth() on server-side API calls.
// Excludes _next/static, _next/image, and favicon.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
