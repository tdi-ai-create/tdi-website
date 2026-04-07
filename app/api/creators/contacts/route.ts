import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/creators/contacts
// Returns creator contact list for internal agent use.
// Auth: Authorization: Bearer ${CRON_SECRET}
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { searchParams } = new URL(request.url);
    const publishStatus = searchParams.get('publish_status');
    const phase = searchParams.get('phase');

    let query = supabase
      .from('creators')
      .select(
        'id, name, email, current_phase, publish_status, last_followed_up_at, target_completion_date, content_path, course_title'
      )
      .order('name');

    if (publishStatus) {
      query = query.eq('publish_status', publishStatus);
    }
    if (phase) {
      query = query.eq('current_phase', phase);
    }

    const { data: creators, error } = await query;

    if (error) {
      console.error('[creators/contacts] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      creators: creators ?? [],
      total: creators?.length ?? 0,
    });
  } catch (error) {
    console.error('[creators/contacts] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
