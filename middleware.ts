import { NextRequest, NextResponse } from 'next/server';

const PARTNER_COOKIE = 'tdi_partnership_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function middleware(req: NextRequest) {
  try {
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

    // ── Supabase session cookie refresh (best-effort) ──
    // Dynamic import so a module-load failure in @supabase/ssr
    // cannot crash the middleware at instantiation.
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const { createServerClient } = await import('@supabase/ssr');
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

        await supabase.auth.getUser();
      }
    } catch (inner) {
      console.error('[middleware] supabase session refresh failed', inner);
    }

    return response;
  } catch (outer) {
    // Absolute last-resort: never let middleware surface as MIDDLEWARE_INVOCATION_FAILED.
    console.error('[middleware] outer failure', outer);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
