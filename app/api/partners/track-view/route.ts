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

    // There is no viewed_at column on this table. Writing one made every
    // insert fail with 42703, the error was discarded, and the route returned
    // success, so dashboard_views held zero rows for every partnership since
    // it was written. The column that records when is created_at, and it
    // defaults to now(), so it does not need to be sent at all.
    const { error } = await supabase.from('dashboard_views').insert({
      partnership_id,
      user_id: user_id || null,
      tab_name,
      duration_seconds: Math.min(duration_seconds, 3600), // Cap at 1 hour to handle edge cases
    });

    // Still a 200, because a partner reading their dashboard must not see an
    // error over analytics. But it says tracked: false and it is logged, so
    // the next silent failure is visible instead of invisible.
    if (error) {
      console.error('[partners/track-view] dashboard_views insert failed:', error.message);
      return NextResponse.json({ success: true, tracked: false, error: error.message });
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('[partners/track-view] unexpected failure:', error);
    return NextResponse.json({ success: true, tracked: false, error: String(error) });
  }
}
