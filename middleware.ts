import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const PARTNER_COOKIE = 'tdi_partnership_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function handleAdminApiAuth(req: NextRequest): Promise<NextResponse> {
  const supabaseUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.LEARNING_HUB_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  let response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          req.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const normalizedEmail = (user.email || '').toLowerCase().trim();

  const { data: members, error: memberError } = await adminSupabase
    .from('tdi_team_members')
    .select('id')
    .eq('is_active', true)
    .or(`user_id.eq.${user.id},email.ilike.${normalizedEmail}`)
    .limit(1);

  if (memberError || !members || members.length === 0) {
    return NextResponse.json({ error: 'Forbidden: not a team member' }, { status: 403 });
  }

  return response;
}

function handlePartnershipCookie(req: NextRequest): NextResponse {
  const response = NextResponse.next();
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

  return response;
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/tdi-admin/')) {
    return handleAdminApiAuth(req);
  }

  return handlePartnershipCookie(req);
}

export const config = {
  matcher: [
    '/api/tdi-admin/:path*',
    '/((?!api|_next|favicon.ico).*)',
  ],
};
