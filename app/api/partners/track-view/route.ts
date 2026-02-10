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

// POST - Track dashboard tab view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnership_id, user_id, tab_name, duration_seconds } = body;

    if (!partnership_id || !tab_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only track if duration is meaningful (at least 1 second)
    if (duration_seconds < 1) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const supabase = getServiceSupabase();

    // Insert dashboard view record
    await supabase.from('dashboard_views').insert({
      partnership_id,
      user_id: user_id || null,
      tab_name,
      duration_seconds: Math.min(duration_seconds, 3600), // Cap at 1 hour to handle edge cases
      viewed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    // Don't fail the request for tracking errors
    return NextResponse.json({ success: true, error: 'Tracking failed silently' });
  }
}
