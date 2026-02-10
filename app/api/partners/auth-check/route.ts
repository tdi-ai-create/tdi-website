import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Check if TDI admin
function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

// POST - Verify user access to a partnership by slug
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, userId, userEmail } = body;

    console.log('=== AUTH-CHECK API ===');
    console.log('Slug:', slug);
    console.log('UserID:', userId);
    console.log('UserEmail:', userEmail);

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Look up partnership by slug (using service role bypasses RLS)
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('slug', slug)
      .single();

    console.log('Partnership query result:', partnership?.id, 'error:', pError?.message);

    if (pError || !partnership) {
      console.log('Partnership not found for slug:', slug);
      return NextResponse.json(
        { success: false, error: 'Partnership not found', code: pError?.code },
        { status: 404 }
      );
    }

    // Check authorization
    const isAdmin = userEmail ? isTDIAdmin(userEmail) : false;
    console.log('Is TDI Admin:', isAdmin);

    if (!isAdmin) {
      // Check if user is linked to this partnership
      const { data: puData, error: puError } = await supabase
        .from('partnership_users')
        .select('id, role')
        .eq('partnership_id', partnership.id)
        .eq('user_id', userId)
        .maybeSingle();

      console.log('Partnership user link:', puData, 'error:', puError?.message);

      if (!puData) {
        return NextResponse.json(
          { success: false, error: 'User not authorized for this partnership' },
          { status: 403 }
        );
      }
    }

    console.log('=== AUTH-CHECK SUCCESS ===');

    return NextResponse.json({
      success: true,
      partnership,
    });
  } catch (error) {
    console.error('Error in auth-check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify access' },
      { status: 500 }
    );
  }
}
