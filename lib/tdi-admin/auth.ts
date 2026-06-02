import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Shared auth gate for all /api/tdi-admin/* routes.
 *
 * Validates the Supabase session cookie and checks the user is an active
 * member in the tdi_team_members table. Returns the team member record
 * on success, or a 401/403 NextResponse on failure.
 *
 * Usage:
 *   const auth = await requireAdminAuth();
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.user, auth.member are available
 */
export async function requireAdminAuth(): Promise<
  | NextResponse
  | { user: { id: string; email: string }; member: { id: string; email: string; role: string; permissions: any } }
> {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check team membership using service role (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: members, error } = await adminClient
      .from('tdi_team_members')
      .select('*')
      .eq('is_active', true)
      .or(`user_id.eq.${user.id},email.ilike.${user.email.toLowerCase()}`)
      .limit(1);

    if (error || !members || members.length === 0) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
    }

    return {
      user: { id: user.id, email: user.email },
      member: members[0],
    };
  } catch {
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
