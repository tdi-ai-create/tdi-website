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

/**
 * The Learning Hub, where activity actually happens. Separate database from the
 * portal, so staff are matched across by email.
 */
function getHubSupabase() {
  const url =
    process.env.LEARNING_HUB_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key =
    process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Who has ever actually used the Hub, read live rather than from a copy.
 *
 * `staff_members.hub_login_date` is written once a day by
 * `/api/cron/sync-hub-login-dates` at 10:30 UTC. That cron works, but a teacher
 * who signs in at 15:10 is invisible until the following morning. On 23 Sep two
 * Roosevelt teachers signed in during the onboarding call and their own
 * principal's dashboard showed them as never having logged in, next to an
 * aggregate percentage that already counted them, because the percentage comes
 * from the Hub live and the per-person list did not. One screen, two answers.
 *
 * Returns a set of lower-cased emails with any Hub activity ever, excluding
 * `account_provisioned`, which is us creating the account rather than them using
 * it.
 *
 * Returns null, not an empty set, when the Hub cannot be reached. An empty set
 * would render as "nobody has ever logged in", which is the same shape of lie
 * this function exists to remove.
 */
async function emailsActiveInHub(emails: string[]): Promise<Set<string> | null> {
  const wanted = emails.map(e => e.toLowerCase()).filter(Boolean);
  if (wanted.length === 0) return new Set();

  const hub = getHubSupabase();
  if (!hub) return null;

  const { data: profiles, error: profileError } = await hub
    .from('hub_profiles')
    .select('id, email')
    .in('email', wanted);

  if (profileError) {
    console.error('[partners/dashboard] hub profile lookup failed:', profileError.message);
    return null;
  }

  const idToEmail = new Map<string, string>();
  for (const p of profiles || []) {
    if (p.id && p.email) idToEmail.set(p.id, String(p.email).toLowerCase());
  }
  if (idToEmail.size === 0) return new Set();

  const { data: activity, error: activityError } = await hub
    .from('hub_activity_log')
    .select('user_id')
    .in('user_id', Array.from(idToEmail.keys()))
    .neq('action', 'account_provisioned');

  if (activityError) {
    console.error('[partners/dashboard] hub activity lookup failed:', activityError.message);
    return null;
  }

  const active = new Set<string>();
  for (const row of activity || []) {
    const email = idToEmail.get(row.user_id as string);
    if (email) active.add(email);
  }
  return active;
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
    // Service counts come back with the partnership because the goal cards use
    // them to decide what sharper measurement to offer a school. A Hub only
    // partnership is measured by asking teachers; one with observation days is
    // measured by watching classrooms, and the tooltip says so either way.
    const { data: partnership } = await supabase
      .from('partnerships')
      .select('staff_enrolled, observation_days_total, virtual_sessions_total, executive_sessions_total')
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
      .select('kpi_key, kpi_label, target_value, target_unit, current_value, benchmark_low, benchmark_high, benchmark_label, data_source, how_tdi_delivers, deeper_measurement, suggested_offering, status')
      .eq('partnership_id', partnershipId)
      .eq('status', 'active')
      .order('sort_order');

    // Get staff login stats (for hub_login tracking)
    const { data: staffMembers } = await supabase
      .from('staff_members')
      .select('id, first_name, last_name, email, role_title, hub_enrolled, hub_login_date')
      .eq('partnership_id', partnershipId);

    // Live from the Hub. Null means the Hub could not be reached, in which case
    // we fall back to the once-a-day column rather than claiming nobody is active.
    const activeEmails = await emailsActiveInHub(
      (staffMembers || []).map(s => s.email).filter(Boolean) as string[]
    );

    const isActive = (s: { email?: string | null; hub_login_date?: string | null }) =>
      activeEmails
        ? activeEmails.has((s.email || '').toLowerCase())
        : !!s.hub_login_date;

    // Use actual staff_members count for total (not staff_enrolled from partnership table)
    // staff_enrolled is the contract number, staff_members is the actual roster
    const staffStats = {
      total: staffMembers?.length || 0,
      hubLoggedIn: (staffMembers || []).filter(isActive).length,
      contractedTotal: partnership?.staff_enrolled || 0,
      // So a reader can tell a real zero from the Hub being unreachable.
      hubLoginSource: activeEmails ? 'live' : 'daily_sync',
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
      staffMembers: (staffMembers || []).map(s => ({ id: s.id, name: `${s.first_name || ''} ${s.last_name || ''}`.trim(), role: s.role_title, hubActive: isActive(s) })),
      metricSnapshots: Object.values(latestMetrics),
      buildings: buildings || [],
      activityLog: activityLog || [],
      timelineEvents: timelineEvents || [],
      teacherQuotes: teacherQuotes || [],
      sessionRecords: sessionRecords || [],
      kpis: kpis || [],
      contract: {
        observation_days_total: partnership?.observation_days_total ?? 0,
        virtual_sessions_total: partnership?.virtual_sessions_total ?? 0,
        executive_sessions_total: partnership?.executive_sessions_total ?? 0,
      },
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
