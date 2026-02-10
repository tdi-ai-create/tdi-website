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

// POST - Log partner activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action, details } = body;

    if (!user_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get user's partnership
    const { data: partnershipUser } = await supabase
      .from('partnership_users')
      .select('partnership_id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (!partnershipUser) {
      return NextResponse.json(
        { success: false, error: 'No partnership found' },
        { status: 404 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipUser.partnership_id,
      user_id,
      action,
      details: details || {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
