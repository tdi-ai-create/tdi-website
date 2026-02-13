import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cache the supabase admin client
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

// GET - Fetch admin stats (bypasses RLS)
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const [
      usersResult,
      enrollmentsResult,
      completionsResult,
      certificatesResult,
      pdHoursResult,
    ] = await Promise.all([
      // Total users
      supabase
        .from('hub_profiles')
        .select('*', { count: 'exact', head: true }),
      // Total enrollments
      supabase
        .from('hub_enrollments')
        .select('*', { count: 'exact', head: true }),
      // Total completions
      supabase
        .from('hub_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      // Total certificates
      supabase
        .from('hub_certificates')
        .select('*', { count: 'exact', head: true }),
      // PD hours from certificates
      supabase
        .from('hub_certificates')
        .select('pd_hours')
        .limit(2000),
    ]);

    // Calculate total PD hours
    const pdData = pdHoursResult.data as { pd_hours: number }[] | null;
    const totalPdHours = pdData?.reduce((sum, c) => sum + (c.pd_hours || 0), 0) || 0;

    // Get stress scores from activity log (stress_checkin actions)
    const { data: stressData } = await supabase
      .from('hub_activity_log')
      .select('user_id, metadata')
      .eq('action', 'stress_checkin')
      .order('created_at', { ascending: false })
      .limit(500);

    // Calculate average stress score (latest per user)
    const latestScores = new Map<string, number>();
    const stressItems = stressData as { user_id: string; metadata: { score?: number } }[] | null;
    stressItems?.forEach((item) => {
      if (!latestScores.has(item.user_id) && item.metadata?.score) {
        latestScores.set(item.user_id, item.metadata.score);
      }
    });
    const scores = Array.from(latestScores.values());
    const avgStressScore = scores.length > 0
      ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1)
      : 'N/A';

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      totalEnrollments: enrollmentsResult.count || 0,
      totalCompletions: completionsResult.count || 0,
      totalCertificates: certificatesResult.count || 0,
      totalPdHours,
      avgStressScore,
    });
  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
