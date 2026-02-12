// IMPORTANT: Add this URL to Supabase Auth Redirect URLs:
// https://www.teachersdeserveit.com/creator-portal/auth/callback

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    // No code provided - redirect back with error
    return NextResponse.redirect(
      `${origin}/creator-portal?error=no_code&error_description=No authorization code provided`
    );
  }

  try {
    // Create Supabase client for auth operations
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

    // Exchange the code for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session?.user?.email) {
      console.error('[creator-portal-callback] Session error:', sessionError);
      return NextResponse.redirect(
        `${origin}/creator-portal?error=auth_failed&error_description=Failed to authenticate with Google`
      );
    }

    const userEmail = sessionData.session.user.email;

    // Create service role client to check if email exists in our tables (bypasses RLS)
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const normalizedEmail = userEmail.toLowerCase().trim();

    // Check creators table first
    const { data: creatorData } = await serviceRoleClient
      .from('creators')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (creatorData) {
      // User is a creator - redirect to dashboard
      return NextResponse.redirect(`${origin}/creator-portal/dashboard`);
    }

    // Check admin_users table
    const { data: adminData } = await serviceRoleClient
      .from('admin_users')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (adminData) {
      // User is an admin - redirect to admin panel
      return NextResponse.redirect(`${origin}/admin/creators`);
    }

    // User is not registered - sign them out and redirect with error
    await supabase.auth.signOut();

    return NextResponse.redirect(
      `${origin}/creator-portal?error=not_registered&error_description=This email isn't registered as a creator. Contact hello@teachersdeserveit.com`
    );

  } catch (error) {
    console.error('[creator-portal-callback] Unexpected error:', error);
    return NextResponse.redirect(
      `${origin}/creator-portal?error=server_error&error_description=An unexpected error occurred`
    );
  }
}
