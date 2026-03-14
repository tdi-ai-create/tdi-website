import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Get the current user from the session
async function getCurrentUser() {
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
  return user;
}

// Service Supabase client (bypasses RLS)
function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TDI admin - redirect to admin portal
    if (user.email?.toLowerCase().endsWith('@teachersdeserveit.com')) {
      return NextResponse.json({ redirect: '/tdi-admin/leadership' });
    }

    const supabase = getServiceSupabase();

    // Look up which partnership this user belongs to
    const { data: partnerUser, error: puError } = await supabase
      .from('partnership_users')
      .select('partnership_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (puError) {
      console.error('Error fetching partnership user:', puError);
      return NextResponse.json(
        { error: 'Failed to look up partnership' },
        { status: 500 }
      );
    }

    if (!partnerUser) {
      return NextResponse.json(
        { error: 'No partnership found for this account. Please contact TDI support.' },
        { status: 404 }
      );
    }

    // Get the partnership details
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('id, slug, legacy_dashboard_url, status')
      .eq('id', partnerUser.partnership_id)
      .single();

    if (pError || !partnership) {
      console.error('Error fetching partnership:', pError);
      return NextResponse.json(
        { error: 'Partnership not found. Please contact TDI support.' },
        { status: 404 }
      );
    }

    // Use legacy_dashboard_url if available, otherwise fall back to slug-based URL
    const dashboardUrl = partnership.legacy_dashboard_url ||
      (partnership.slug ? `/partners/${partnership.slug}-dashboard` : null);

    if (!dashboardUrl) {
      return NextResponse.json(
        { error: 'Dashboard not configured for this partnership. Please contact TDI support.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      redirect: dashboardUrl,
      partnership: {
        id: partnership.id,
        slug: partnership.slug,
        status: partnership.status,
      },
    });
  } catch (error) {
    console.error('Error in /api/partners/me:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
