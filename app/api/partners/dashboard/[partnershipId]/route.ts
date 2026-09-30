import { NextRequest, NextResponse } from 'next/server';
import { clientFacingServiceName, plannedDateNote } from '@/lib/partnerships/service-names';
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

export interface EngagementItem {
  kind: 'course' | 'quick_win';
  title: string;
  /** Distinct people, which is the number that means something. */
  people: number;
  opens: number;
}

export interface HubEngagementDetail {
  topContent: EngagementItem[];
  activeThisWeek: number;
  activeThisMonth: number;
  lastActiveAt: string | null;
  windowDays: number;
  /** True when the activity read hit the cap, so the page can say so. */
  truncated: boolean;
  unknown: boolean;
}

const ENGAGEMENT_WINDOW_DAYS = 90;
const ACTIVITY_ROW_CAP = 5000;

/**
 * What a school's team is actually working on, read live from the Hub.
 *
 * Bonnie Osborne asked for this on 30 September 2026: she could see that people
 * had logged in and nothing about what they did next. Every ingredient was
 * already being recorded, just never shown to the client. `lesson_viewed`
 * carries `course_title`, and the quick win actions carry `quick_win_title`.
 *
 * Ranked by distinct people rather than opens. Eight paras in one course is a
 * signal about the school; one para opening the same course thirty times is a
 * signal about one para.
 *
 * Bounded to 90 days because "trending" that includes last spring is not
 * trending, and because it keeps the row count sane. If the cap is hit we say
 * so rather than quietly reporting a partial picture as the whole one.
 */
async function hubEngagementDetail(profileIds: string[]): Promise<HubEngagementDetail> {
  const empty: HubEngagementDetail = {
    topContent: [],
    activeThisWeek: 0,
    activeThisMonth: 0,
    lastActiveAt: null,
    windowDays: ENGAGEMENT_WINDOW_DAYS,
    truncated: false,
    unknown: false,
  };
  if (profileIds.length === 0) return empty;

  const hub = getHubSupabase();
  if (!hub) return { ...empty, unknown: true };

  const since = new Date(Date.now() - ENGAGEMENT_WINDOW_DAYS * 86400000).toISOString();

  const { data: rows, error } = await hub
    .from('hub_activity_log')
    .select('user_id, action, metadata, created_at')
    .in('user_id', profileIds)
    .neq('action', 'account_provisioned')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(ACTIVITY_ROW_CAP);

  if (error) {
    console.error('[partners/dashboard] engagement detail failed:', error.message);
    return { ...empty, unknown: true };
  }

  const weekAgo = Date.now() - 7 * 86400000;
  const monthAgo = Date.now() - 30 * 86400000;
  const week = new Set<string>();
  const month = new Set<string>();
  let lastActiveAt: string | null = null;

  // key -> { kind, title, people:Set, opens:number }
  const byContent = new Map<
    string,
    { kind: 'course' | 'quick_win'; title: string; people: Set<string>; opens: number }
  >();

  for (const row of rows || []) {
    const userId = String(row.user_id);
    const at = new Date(row.created_at as string).getTime();
    if (!lastActiveAt) lastActiveAt = row.created_at as string;
    if (at >= weekAgo) week.add(userId);
    if (at >= monthAgo) month.add(userId);

    const meta = (row.metadata || {}) as Record<string, unknown>;
    let kind: 'course' | 'quick_win' | null = null;
    let title: string | null = null;

    if (row.action === 'lesson_viewed' && typeof meta.course_title === 'string') {
      kind = 'course';
      title = meta.course_title;
    } else if (
      ['quick_win_viewed', 'quick_win_saved', 'quick_win_downloaded'].includes(String(row.action)) &&
      typeof meta.quick_win_title === 'string'
    ) {
      kind = 'quick_win';
      title = meta.quick_win_title;
    }

    if (!kind || !title) continue;
    const key = `${kind}:${title}`;
    const entry = byContent.get(key) || { kind, title, people: new Set<string>(), opens: 0 };
    entry.people.add(userId);
    entry.opens += 1;
    byContent.set(key, entry);
  }

  const topContent = Array.from(byContent.values())
    .map(e => ({ kind: e.kind, title: e.title, people: e.people.size, opens: e.opens }))
    .sort((a, b) => b.people - a.people || b.opens - a.opens)
    .slice(0, 8);

  return {
    topContent,
    activeThisWeek: week.size,
    activeThisMonth: month.size,
    lastActiveAt,
    windowDays: ENGAGEMENT_WINDOW_DAYS,
    truncated: (rows?.length ?? 0) >= ACTIVITY_ROW_CAP,
    unknown: false,
  };
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

    // Check-ins feeding those goals, with how many people have answered.
    // A goal below its min_responses threshold renders blank on purpose, and a
    // leader running the check-in in a staff meeting cannot tell that apart from
    // a broken form without a count.
    const { data: checkinRows, error: checkinError } = await supabase
      .from('partner_checkins')
      .select('id, code, kpi_key, min_responses, status')
      .eq('partnership_id', partnershipId)
      .not('kpi_key', 'is', null)
      .neq('status', 'draft');

    if (checkinError) {
      console.error('[partner dashboard] could not read check-ins:', checkinError.message);
    }

    let checkins: {
      kpi_key: string;
      code: string;
      responses: number;
      min_responses: number;
      status: string;
    }[] = [];

    if (checkinRows && checkinRows.length > 0) {
      // Counted in JS from the ids rather than grouped in SQL: PostgREST has no
      // group by, and a school's check-in is a dozen rows.
      const { data: responseRows, error: responseError } = await supabase
        .from('partner_checkin_responses')
        .select('checkin_id')
        .in('checkin_id', checkinRows.map((c) => c.id));

      if (responseError) {
        console.error('[partner dashboard] could not count check-in responses:', responseError.message);
      }

      const counts = new Map<string, number>();
      for (const row of responseRows || []) {
        counts.set(row.checkin_id, (counts.get(row.checkin_id) || 0) + 1);
      }

      checkins = checkinRows.map((c) => ({
        kpi_key: c.kpi_key as string,
        code: c.code as string,
        responses: counts.get(c.id) || 0,
        min_responses: c.min_responses as number,
        status: c.status as string,
      }));
    }

    // Get staff login stats (for hub_login tracking)
    const { data: staffMembers } = await supabase
      .from('staff_members')
      .select('id, first_name, last_name, email, role_title, hub_enrolled, hub_login_date')
      .eq('partnership_id', partnershipId);

    // Live from the Hub. Null means the Hub could not be reached, in which case
    // we fall back to the once-a-day column rather than claiming nobody is active.
    const rosterEmails = (staffMembers || []).map(s => s.email).filter(Boolean) as string[];
    const activeEmails = await emailsActiveInHub(rosterEmails);

    // What the team is actually working on. Same roster, same matching by email,
    // so this panel can never disagree with the login count above it.
    let engagement: HubEngagementDetail | null = null;
    const hubForIds = getHubSupabase();
    if (hubForIds && rosterEmails.length > 0) {
      const { data: idRows, error: idError } = await hubForIds
        .from('hub_profiles')
        .select('id')
        .in('email', rosterEmails.map(e => e.toLowerCase()));
      if (idError) {
        console.error('[partners/dashboard] profile id lookup failed:', idError.message);
      } else {
        engagement = await hubEngagementDetail((idRows || []).map(r => String(r.id)));
      }
    }

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
    const { data: timelineEvents, error: timelineError } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('sort_order', { ascending: true });
    if (timelineError) console.error('[partners/dashboard] timeline:', timelineError.message);

    /**
     * The dates a school is waiting to hear.
     *
     * Planned dates live on contract_deliverables and, until 23 September 2026,
     * were visible only in Billing. A school looking at their own dashboard saw
     * "Dates will appear here as they are confirmed" while the visit sat booked
     * in our system. Rae asked for every client to see their dates.
     *
     * These are built rather than written into timeline_events, so the contract
     * line stays the single source of truth and a date changed in Billing shows
     * here immediately instead of drifting from a copy.
     *
     * Grant held lines are excluded by having no planned date at all, which is
     * correct: the work cannot be scheduled until the award lands, and putting
     * it in front of a school would promise something no funder has agreed.
     */
    const { data: plannedLines, error: plannedError } = await supabase
      .from('contract_deliverables')
      .select('id, service_type, planned_date, planned_confidence, sequence_number, sequence_total, delivery_state')
      .eq('partnership_id', partnershipId)
      .eq('delivery_state', 'scheduled')
      .not('planned_date', 'is', null)
      .order('planned_date', { ascending: true });
    if (plannedError) console.error('[partners/dashboard] planned dates:', plannedError.message);

    const plannedEvents = (plannedLines ?? []).map((l, i) => ({
      id: `planned-${l.id}`,
      // Never the contract label. It carries discounts and internal wording.
      event_title: clientFacingServiceName(l.service_type, l.sequence_number, l.sequence_total),
      event_date: l.planned_date,
      event_type: l.service_type,
      status: 'upcoming' as const,
      notes: plannedDateNote(l.planned_confidence),
      sort_order: 1000 + i,
    }));

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
      engagement,
      metricSnapshots: Object.values(latestMetrics),
      buildings: buildings || [],
      activityLog: activityLog || [],
      timelineEvents: [...(timelineEvents || []), ...plannedEvents],
      teacherQuotes: teacherQuotes || [],
      sessionRecords: sessionRecords || [],
      kpis: kpis || [],
      checkins,
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
