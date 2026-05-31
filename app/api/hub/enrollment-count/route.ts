import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase credentials');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ error: 'Missing courseId parameter' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from('hub_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (error) {
      console.error('[enrollment-count] Error:', error.message);
      // Return safe fallback instead of exposing internal errors
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json(
      { count: count ?? 0 },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } }
    );
  } catch (err) {
    console.error('[enrollment-count] Error:', err);
    return NextResponse.json({ count: 0 });
  }
}
