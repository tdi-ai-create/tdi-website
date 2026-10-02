import { NextRequest, NextResponse } from 'next/server';
import { clientFacingServiceName, plannedDateNote } from '@/lib/partnerships/service-names';
import { engagementTrend, type EngagementTrend } from '@/lib/partners/popularity';
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
 * quarantine-ok: this comment explains why we do NOT trust the stale field.
 *
 * Who has ever actually used the Hub, read live rather than from a copy.
 *
 * `staff_members.hub_login_date` is written once a day by  // quarantine-ok
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
  /**
   * Distinct people across the whole window. Ranks the list and feeds reports.
   *
   * The partner dashboard stopped printing this on 2 October 2026. A school
   * sees a share, never a headcount.
   */
  people: number;
  opens: number;
  /**
   * Distinct people in the last 30 days.
   *
   * The numerator the dashboard divides by `activeThisMonth`, so both halves of
   * that share describe the same 30 days. Pairing the 90 day `people` with a 30
   * day denominator would read over 100% for anything popular last quarter.
   */
  peopleRecent: number;
  trend: EngagementTrend;
}

export interface HubEngagementDetail {
  topContent: EngagementItem[];
  /** Distinct courses and quick wins opened, uncapped. topContent is sliced to 8. */
  distinctContent: number;
  /**
   * The same picture, per building, for districts whose staff are placed.
   * Keyed by building id. Empty for a school, or for a district whose roster
   * has never carried a school column.
   */
  byBuilding: Record<string, { activeThisWeek: number; activeThisMonth: number; topContent: EngagementItem[]; distinctContent: number }>;
  activeThisWeek: number;
  activeThisMonth: number;
  lastActiveAt: string | null;
  windowDays: number;
  /** True when the activity read hit the cap, so the page can say so. */
  truncated: boolean;
  unknown: boolean;
}

const ENGAGEMENT_WINDOW_DAYS = 90;

/**
 * The five areas a Vibe Check asks about.
 *
 * Four are scored 1 to 5 and higher is better. `needs` is not scored at all: it
 * is a word choice, and it is arguably the most useful of the five to a leader
 * because it is the only one where staff say what they want rather than how
 * they feel.
 *
 * Never "Wellbeing" in anything a person reads. Always Vibe Check.
 */
const VIBE_AREAS = [
  { key: 'mood', label: 'Mood', blurb: 'How the day is actually going' },
  { key: 'energy', label: 'Energy', blurb: 'What is left in the tank' },
  { key: 'belonging', label: 'Belonging', blurb: 'Whether this feels like their place' },
  { key: 'purpose', label: 'Purpose', blurb: 'Whether the work still means something' },
] as const;

/**
 * Below this many people, an area reports no average.
 *
 * Two reasons, and the second is the one that matters. A mean of one answer is
 * not a measurement. And in a school where the leader knows everybody, a single
 * response is that person's private answer with a number on it, which breaks
 * the promise that a leader sees the school and never the individual.
 */
const VIBE_MIN_PEOPLE = 3;

export interface VibeArea {
  key: string;
  label: string;
  blurb: string;
  /** Average out of 5. Null when fewer than VIBE_MIN_PEOPLE have answered. */
  avg: number | null;
  people: number;
  responses: number;
  /** Month by month, oldest first, for the trend line. */
  trend: { month: string; avg: number; responses: number }[];
}

export interface VibeCheckDetail {
  areas: VibeArea[];
  /** What staff said they need, most chosen first. Never scored. */
  needs: { word: string; count: number }[];
  /** Distinct people who have completed any check, across all five areas. */
  people: number;
  responses: number;
  lastAt: string | null;
  /** True when the Hub could not be reached, so a zero is not read as a real zero. */
  unknown: boolean;
}

/**
 * Every Vibe Check this school's staff have completed, by area and by month.
 *
 * Rae, 1 October 2026: all five areas on the current year tab, with quick
 * insight and progress across the year.
 *
 * Aggregate only. Individual results are private to the educator and no name
 * leaves this function, because the moment a leader can read one person's score
 * the staff stop answering honestly and the number stops being worth having.
 */
async function vibeCheckDetail(profileIds: string[]): Promise<VibeCheckDetail> {
  const empty: VibeCheckDetail = {
    areas: VIBE_AREAS.map(a => ({ ...a, avg: null, people: 0, responses: 0, trend: [] })),
    needs: [],
    people: 0,
    responses: 0,
    lastAt: null,
    unknown: false,
  };
  if (profileIds.length === 0) return empty;

  const hub = getHubSupabase();
  if (!hub) return { ...empty, unknown: true };

  const { data: rows, error } = await hub
    .from('hub_assessments')
    .select('user_id, question_category, stress_score, response_text, created_at')
    .in('user_id', profileIds)
    .eq('type', 'daily_check_in')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[partners/dashboard] vibe check detail failed:', error.message);
    return { ...empty, unknown: true };
  }

  const everyone = new Set<string>();
  let lastAt: string | null = null;
  const needCounts = new Map<string, number>();
  const byArea = new Map<string, { scores: number[]; people: Set<string>; months: Map<string, number[]> }>();

  for (const row of rows || []) {
    const uid = String(row.user_id);
    everyone.add(uid);
    lastAt = row.created_at as string;

    const cat = String(row.question_category || '');

    if (cat === 'needs') {
      const word = (row.response_text || '').trim().toLowerCase();
      if (word) needCounts.set(word, (needCounts.get(word) || 0) + 1);
      continue;
    }

    const score = typeof row.stress_score === 'number' ? row.stress_score : null;
    if (score === null) continue;

    const entry = byArea.get(cat) || { scores: [], people: new Set<string>(), months: new Map<string, number[]>() };
    entry.scores.push(score);
    entry.people.add(uid);
    // Month key built from the parts, never parsed, so a check-in on the first
    // of a month is not filed under the previous one in a western timezone.
    const d = new Date(row.created_at as string);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!entry.months.has(mk)) entry.months.set(mk, []);
    entry.months.get(mk)!.push(score);
    byArea.set(cat, entry);
  }

  const round1 = (n: number) => Math.round(n * 10) / 10;

  const areas: VibeArea[] = VIBE_AREAS.map(a => {
    const e = byArea.get(a.key);
    if (!e || e.scores.length === 0) return { ...a, avg: null, people: 0, responses: 0, trend: [] };
    const enough = e.people.size >= VIBE_MIN_PEOPLE;
    return {
      ...a,
      avg: enough ? round1(e.scores.reduce((x, y) => x + y, 0) / e.scores.length) : null,
      people: e.people.size,
      responses: e.scores.length,
      trend: (enough ? [...e.months.entries()] : [])
        .sort((x, y) => x[0].localeCompare(y[0]))
        .map(([month, scores]) => ({
          month,
          avg: round1(scores.reduce((x, y) => x + y, 0) / scores.length),
          responses: scores.length,
        })),
    };
  });

  return {
    areas,
    needs: [...needCounts.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, 10),
    people: everyone.size,
    responses: (rows || []).length,
    lastAt,
    unknown: false,
  };
}
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
async function hubEngagementDetail(
  profileIds: string[],
  buildingByProfile: Map<string, string> = new Map(),
): Promise<HubEngagementDetail> {
  const empty: HubEngagementDetail = {
    topContent: [],
    distinctContent: 0,
    byBuilding: {},
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
  // The 30 days before the last 30, which is what a trend compares against.
  // Inside the 90 day read, so the older half is always fully present unless
  // the row cap truncated it.
  const twoMonthsAgo = Date.now() - 60 * 86400000;
  const week = new Set<string>();
  const month = new Set<string>();
  let lastActiveAt: string | null = null;

  // key -> { kind, title, people:Set, opens:number }
  const perBuilding = new Map<
    string,
    { week: Set<string>; month: Set<string>; content: Map<string, { kind: 'course' | 'quick_win'; title: string; people: Set<string>; recent: Set<string>; prior: Set<string>; opens: number }> }
  >();

  const byContent = new Map<
    string,
    { kind: 'course' | 'quick_win'; title: string; people: Set<string>; recent: Set<string>; prior: Set<string>; opens: number }
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

    // Per building, for a district whose staff are actually placed. Same rows,
    // same rules, so a building can never disagree with the district total.
    const bid = buildingByProfile.get(userId);
    if (bid) {
      const b = perBuilding.get(bid) || { week: new Set<string>(), month: new Set<string>(), content: new Map<string, { kind: 'course' | 'quick_win'; title: string; people: Set<string>; recent: Set<string>; prior: Set<string>; opens: number }>() };
      if (at >= weekAgo) b.week.add(userId);
      if (at >= monthAgo) b.month.add(userId);
      perBuilding.set(bid, b);
    }

    if (!kind || !title) continue;
    const key = `${kind}:${title}`;
    const entry = byContent.get(key) || { kind, title, people: new Set<string>(), recent: new Set<string>(), prior: new Set<string>(), opens: 0 };
    entry.people.add(userId);
    if (at >= monthAgo) entry.recent.add(userId);
    else if (at >= twoMonthsAgo) entry.prior.add(userId);
    entry.opens += 1;
    byContent.set(key, entry);

    if (bid) {
      const b = perBuilding.get(bid)!;
      const be = b.content.get(key) || { kind, title, people: new Set<string>(), recent: new Set<string>(), prior: new Set<string>(), opens: 0 };
      be.people.add(userId);
      if (at >= monthAgo) be.recent.add(userId);
      else if (at >= twoMonthsAgo) be.prior.add(userId);
      be.opens += 1;
      b.content.set(key, be);
    }
  }

  const truncated = (rows?.length ?? 0) >= ACTIVITY_ROW_CAP;

  /**
   * Turn an accumulated entry into what the dashboard renders.
   *
   * A truncated read drops the oldest rows, which are exactly the prior 30 day
   * half, so every item would read as rising. We return no direction at all
   * rather than a flattering one.
   */
  const shape = (e: { kind: 'course' | 'quick_win'; title: string; people: Set<string>; recent: Set<string>; prior: Set<string>; opens: number }): EngagementItem => ({
    kind: e.kind,
    title: e.title,
    people: e.people.size,
    opens: e.opens,
    peopleRecent: e.recent.size,
    trend: engagementTrend(e.recent.size, e.prior.size, truncated),
  });

  const byBuilding: HubEngagementDetail['byBuilding'] = {};
  for (const [bid, b] of perBuilding) {
    byBuilding[bid] = {
      activeThisWeek: b.week.size,
      activeThisMonth: b.month.size,
      distinctContent: b.content.size,
      topContent: Array.from(b.content.values())
        .map(shape)
        .sort((a, b2) => b2.people - a.people || b2.opens - a.opens)
        .slice(0, 6),
    };
  }

  const topContent = Array.from(byContent.values())
    .map(shape)
    .sort((a, b) => b.people - a.people || b.opens - a.opens)
    .slice(0, 8);

  return {
    topContent,
    // Uncapped, because reports print this as "N classroom tools and strategies
    // explored" and topContent is sliced to 8 for display.
    distinctContent: byContent.size,
    byBuilding,
    activeThisWeek: week.size,
    activeThisMonth: month.size,
    lastActiveAt,
    windowDays: ENGAGEMENT_WINDOW_DAYS,
    truncated,
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
      // Suggestions reach the page too. A goal proposed before a school's
      // onboarding meeting is still something they should be able to read and
      // argue with, and the card badges it as a suggestion rather than showing
      // it as a commitment. Paused, achieved and at_risk stay out.
      .in('status', ['active', 'suggested'])
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
      // quarantine-ok: fallback only; emailsActiveInHub is the live source above
    .select('id, first_name, last_name, email, role_title, hub_enrolled, hub_login_date, building_id')
      .eq('partnership_id', partnershipId)
      // Only people who still work there.
      //
      // Without this, every denominator on the dashboard counted departed staff.
      // Saunemin's setup card read "29 educators on your roster" while its year
      // tab read 27, because two rows are deactivated. Tidioute read 3 after a
      // duplicate was removed, when the school has two para-educators.
      //
      // It also quietly deflates every percentage: activation is active people
      // over roster size, so a leaver makes a school look worse forever.
      .eq('is_active', true);

    // Live from the Hub. Null means the Hub could not be reached, in which case
    // we fall back to the once-a-day column rather than claiming nobody is active.
    const rosterEmails = (staffMembers || []).map(s => s.email).filter(Boolean) as string[];
    const activeEmails = await emailsActiveInHub(rosterEmails);

    // What the team is actually working on. Same roster, same matching by email,
    // so this panel can never disagree with the login count above it.
    let engagement: HubEngagementDetail | null = null;
    let vibe: VibeCheckDetail | null = null;
    const hubForIds = getHubSupabase();
    if (hubForIds && rosterEmails.length > 0) {
      const { data: idRows, error: idError } = await hubForIds
        .from('hub_profiles')
        .select('id, email')
        .in('email', rosterEmails.map(e => e.toLowerCase()));
      if (idError) {
        console.error('[partners/dashboard] profile id lookup failed:', idError.message);
      } else {
        // Email is the only join between the two databases, so the building a
        // Hub profile belongs to has to be carried across by address.
        const buildingByEmail = new Map<string, string>();
        for (const s of staffMembers || []) {
          if (s.email && s.building_id) buildingByEmail.set(s.email.toLowerCase(), String(s.building_id));
        }
        const buildingByProfile = new Map<string, string>();
        for (const r of idRows || []) {
          const b = buildingByEmail.get(String(r.email || '').toLowerCase());
          if (b) buildingByProfile.set(String(r.id), b);
        }
        const ids = (idRows || []).map(r => String(r.id));
        engagement = await hubEngagementDetail(ids, buildingByProfile);
        vibe = await vibeCheckDetail(ids);
      }
    }

    // quarantine-ok: deliberate fallback when the Hub cannot be reached
  const isActive = (s: { email?: string | null; hub_login_date?: string | null }) =>
      activeEmails
        ? activeEmails.has((s.email || '').toLowerCase())
        // quarantine-ok: fallback when the Hub is unreachable
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

    /* ─── WHAT ACTIVATION LOOKS LIKE AT A TYPICAL PARTNER SCHOOL ───
       Rae, 1 October 2026. Every dashboard quoted the 10% industry average from
       research and never our own fleet, which is the more credible number and
       was already in the database. Saunemin saw 44% with no idea that is
       mid-pack; St Mary saw 83% with no idea it is the best we have.

       Computed here rather than stored, so it needs no data entry per client and
       keeps working as the fleet grows. Counted across partnerships with a real
       roster only, because a school with nobody on its roster would drag the
       median to nothing and say more about our onboarding than about anyone's
       engagement. Suppressed below four schools: a median of two is not a
       benchmark, it is a coin toss. */
    /* What activation looks like at a typical partner school.
       Named typicalActivation and not "cohort", because Cohort is the name of a
       TDI offering and reusing it for a statistic made Rae think a client had
       bought one. Nothing here touches that product.

       Only the median leaves this function.
       Rae, 1 October 2026: "we should not say the # of schools at all! we do not
       tell other school buildings how many other schools we work with or their
       names". My first version printed "across the 8 schools we run", which is
       an internal figure. The school count, the ranking and the best performer
       are all computed below because the median needs them, and none of them is
       returned, so a future change cannot surface one by accident. */
    let typicalActivation: { median: number } | null = null;
    try {
      const { data: peers } = await supabase
        .from('partnerships')
        .select('id, status')
        .neq('status', 'completed');
      const peerIds = (peers || []).map(p => String(p.id));
      if (peerIds.length > 0) {
        const { data: peerStaff } = await supabase
          .from('staff_members')
          .select('partnership_id, email')
          .in('partnership_id', peerIds)
          .eq('is_active', true);
        const rosterByPartnership = new Map<string, string[]>();
        for (const r of peerStaff || []) {
          if (!r.email) continue;
          const k = String(r.partnership_id);
          if (!rosterByPartnership.has(k)) rosterByPartnership.set(k, []);
          rosterByPartnership.get(k)!.push(r.email.toLowerCase());
        }
        const allEmails = [...rosterByPartnership.values()].flat();
        const activeAcrossFleet = await emailsActiveInHub(allEmails);
        if (activeAcrossFleet) {
          const rates: { id: string; rate: number }[] = [];
          for (const [pid, emails] of rosterByPartnership) {
            if (emails.length === 0) continue;
            const live = emails.filter(e => activeAcrossFleet.has(e)).length;
            rates.push({ id: pid, rate: Math.round((live / emails.length) * 100) });
          }
          if (rates.length >= 4) {
            const sorted = [...rates].sort((a, b) => a.rate - b.rate);
            const mid = Math.floor(sorted.length / 2);
            const median = sorted.length % 2
              ? sorted[mid].rate
              : Math.round((sorted[mid - 1].rate + sorted[mid].rate) / 2);
            const ranked = [...rates].sort((a, b) => b.rate - a.rate);
            // Deliberately median only. See the note above.
            void ranked;
            typicalActivation = { median };
          }
        }
      }
    } catch (err) {
      console.error('[partners/dashboard] typical activation failed:', err);
    }

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
      // email is included so a leader can write to their own staff from their own
      // dashboard. It is their roster, and they already hold these addresses.
      staffMembers: (staffMembers || []).map(s => ({ id: s.id, name: `${s.first_name || ''} ${s.last_name || ''}`.trim(), email: s.email, role: s.role_title, hubActive: isActive(s), buildingId: s.building_id ?? null })),
      engagement,
      vibe,
      typicalActivation,
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
