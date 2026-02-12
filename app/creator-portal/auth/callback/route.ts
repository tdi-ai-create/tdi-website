// IMPORTANT: Add this URL to Supabase Auth Redirect URLs:
// https://www.teachersdeserveit.com/creator-portal/auth/callback

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/creator-portal?error=no_code&error_description=No authorization code provided`
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    console.error('[creator-portal-callback] Missing environment variables');
    return NextResponse.redirect(
      `${origin}/creator-portal?error=config&error_description=Server configuration error`
    );
  }

  try {
    // Create auth client to exchange code for session
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: sessionData, error: sessionError } = await authClient.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session?.user?.email) {
      console.error('[creator-portal-callback] Session error:', sessionError);
      return NextResponse.redirect(
        `${origin}/creator-portal?error=auth_failed&error_description=Failed to authenticate with Google`
      );
    }

    const userEmail = sessionData.session.user.email;
    const normalizedEmail = userEmail.toLowerCase().trim();

    // Create service role client to check if email exists in our tables (bypasses RLS)
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check creators table first
    const { data: creatorData } = await serviceClient
      .from('creators')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (creatorData) {
      // User is a creator - redirect to dashboard
      return NextResponse.redirect(`${origin}/creator-portal/dashboard`);
    }

    // Check admin_users table
    const { data: adminData } = await serviceClient
      .from('admin_users')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (adminData) {
      // User is an admin - redirect to admin panel
      return NextResponse.redirect(`${origin}/admin/creators`);
    }

    // User is not registered - sign them out and redirect with error
    await authClient.auth.signOut();

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
