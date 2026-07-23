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

    // Get partnership (for staff_enrolled count)
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('staff_enrolled')
      .eq('id', partnershipId)
      .single();

    // Get organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('partnership_id', partnershipId)
      .maybeSingle();

    // Get action items (only partner-visible ones for the client dashboard)
    const { data: actionItems } = await supabase
      .from('action_items')
      .select('*')
      .eq('partnership_id', partnershipId)
      .neq('visible_to_partner', false)
      .order('sort_order', { ascending: true });

    // Get partnership KPIs (if set)
    const { data: kpis } = await supabase
      .from('partnership_kpis')
      .select('kpi_key, kpi_label, target_value, target_unit, current_value, benchmark_low, benchmark_high, benchmark_label, how_tdi_delivers, status')
      .eq('partnership_id', partnershipId)
      .eq('status', 'active')
      .order('sort_order');

    // Get staff login stats (for hub_login tracking)
    const { data: staffMembers } = await supabase
      .from('staff_members')
      .select('id, first_name, last_name, role_title, hub_enrolled, hub_login_date')
      .eq('partnership_id', partnershipId);

    // Use actual staff_members count for total (not staff_enrolled from partnership table)
    // staff_enrolled is the contract number, staff_members is the actual roster
    const staffStats = {
      total: staffMembers?.length || 0,
      hubLoggedIn: staffMembers?.filter(s => s.hub_login_date).length || 0,
      contractedTotal: partnership?.staff_enrolled || 0,
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

    // Get timeline events from dedicated table
    const { data: timelineEvents } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('sort_order', { ascending: true });

    // Get teacher quotes for Our Partnership tab
    const { data: teacherQuotes } = await supabase
      .from('teacher_quotes')
      .select('id, quote_text, teacher_role, session_type, created_at')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get session records for Our Partnership tab
    const { data: sessionRecords } = await supabase
      .from('session_records')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('session_date', { ascending: false });

    return NextResponse.json({
      success: true,
      organization,
      actionItems: actionItems || [],
      staffStats,
      staffMembers: (staffMembers || []).map(s => ({ id: s.id, name: `${s.first_name || ''} ${s.last_name || ''}`.trim(), role: s.role_title, hubActive: !!s.hub_login_date })),
      metricSnapshots: Object.values(latestMetrics),
      buildings: buildings || [],
      activityLog: activityLog || [],
      timelineEvents: timelineEvents || [],
      teacherQuotes: teacherQuotes || [],
      sessionRecords: sessionRecords || [],
      kpis: kpis || [],
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
