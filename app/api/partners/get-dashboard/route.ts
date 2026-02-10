import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Supabase client
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

// GET - Get user's partnership dashboard slug
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // Get user's partnership
    const { data: partnershipUser, error: puError } = await supabase
      .from('partnership_users')
      .select('partnership_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (puError || !partnershipUser) {
      return NextResponse.json(
        { success: false, error: 'No partnership found' },
        { status: 404 }
      );
    }

    // Get partnership slug
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('slug, status')
      .eq('id', partnershipUser.partnership_id)
      .single();

    if (pError || !partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      slug: partnership.slug,
      status: partnership.status,
      partnershipId: partnershipUser.partnership_id,
    });
  } catch (error) {
    console.error('Error getting dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get dashboard' },
      { status: 500 }
    );
  }
}
