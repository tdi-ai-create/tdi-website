import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase credentials');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from('hub_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('onboarding_completed', true);

    if (error) {
      console.error('[CommunityCount] Error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
    }

    return NextResponse.json(
      { count: count ?? 0 },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' } }
    );
  } catch (err) {
    console.error('[CommunityCount] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
