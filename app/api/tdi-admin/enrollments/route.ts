import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let cachedSupabase: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  cachedSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return cachedSupabase;
}

// GET - Fetch all enrollments with user and course data (bypasses RLS)
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('hub_enrollments')
      .select(`
        id,
        course_id,
        status,
        progress_pct,
        created_at,
        enrolled_at,
        completed_at,
        user:hub_profiles!hub_enrollments_user_id_fkey(id, display_name),
        course:hub_courses!hub_enrollments_course_id_fkey(title)
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[Enrollments API] Error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }

    return NextResponse.json({ enrollments: data });
  } catch (error) {
    console.error('[Enrollments API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
