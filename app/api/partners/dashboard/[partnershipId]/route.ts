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

// GET - Get all dashboard data for a partnership
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partnershipId: string }> }
) {
  try {
    const { partnershipId } = await params;
    const userId = request.headers.get('x-user-id');

    if (!partnershipId) {
      return NextResponse.json(
        { success: false, error: 'Partnership ID required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('partnership_id', partnershipId)
      .maybeSingle();

    // Get action items
    const { data: actionItems } = await supabase
      .from('action_items')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('sort_order', { ascending: true });

    // Get staff stats
    const { data: staffMembers } = await supabase
      .from('staff_members')
      .select('id, hub_enrolled, hub_login_date')
      .eq('partnership_id', partnershipId);

    const staffStats = {
      total: staffMembers?.length || 0,
      hubLoggedIn: staffMembers?.filter(s => s.hub_login_date).length || 0,
    };

    // Get latest metric snapshots
    const { data: metricSnapshots } = await supabase
      .from('metric_snapshots')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('recorded_at', { ascending: false });

    // Get unique latest metric per metric_name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const latestMetrics: Record<string, any> = {};
    if (metricSnapshots) {
      for (const m of metricSnapshots) {
        if (!latestMetrics[m.metric_name]) {
          latestMetrics[m.metric_name] = m;
        }
      }
    }

    // Get buildings (for districts)
    const { data: buildings } = await supabase
      .from('buildings')
      .select('*')
      .eq('organization_id', organization?.id || '');

    // Get recent activity (last 10)
    const { data: activityLog } = await supabase
      .from('activity_log')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      organization,
      actionItems: actionItems || [],
      staffStats,
      metricSnapshots: Object.values(latestMetrics),
      buildings: buildings || [],
      activityLog: activityLog || [],
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
