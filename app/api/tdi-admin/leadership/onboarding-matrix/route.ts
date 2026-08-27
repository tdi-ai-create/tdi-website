import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { createClient } from '@supabase/supabase-js';
import { getHubServiceClient, isEngagementAction } from '@/lib/hub/partnership-members';

/**
 * Where every active partnership stands, on one screen.
 *
 * This is the single definition of onboarding progress. There used to be five,
 * and they disagreed:
 *
 *   - The Onboarding Pipeline tab bucketed partners on invite_accepted_at,
 *     which an auth check stamps automatically rather than a person finishing
 *     anything. It reads true for schools that have never logged in and false
 *     for schools that log in weekly.
 *   - api/partnerships/[id]/onboarding-checklist queried Hub tables through the
 *     portal client and joined an empty table, so four of its five items were
 *     false for every partnership permanently and the fifth passed for anyone
 *     whose status was active.
 *   - api/partnerships/[id]/activation-score selected partnerships.staff_count,
 *     a column that does not exist, so every school scored zero.
 *   - The partner dashboard computed its own checklist inline, and it was the
 *     most correct of the five while being the one TDI staff never saw.
 *   - partner-onboarding-reminders worked out its own roster coverage rule,
 *     documented it in a comment, and shared it with nothing.
 *
 * A step is complete when the outcome exists, whichever system produced it.
 * St. Mary's roster was loaded by hand straight into the Hub and never reached
 * the portal, and it still counts, because eleven educators genuinely have
 * access.
 */

export const dynamic = 'force-dynamic';

type StepState = 'done' | 'partial' | 'gap' | 'na';

export interface MatrixStep {
  key: string;
  label: string;
  state: StepState;
  evidence: string;
}

export interface MatrixRow {
  id: string;
  orgName: string;
  slug: string | null;
  contactName: string | null;
  phase: string | null;
  partnershipType: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  seatsContracted: number;
  seatsProvisioned: number;
  rosterCount: number;
  activeEducators: number;
  /**
   * The Engagement view of the same table. Counted over the seats that belong
   * to this partnership, from the same reads that decide the onboarding marks,
   * so the two views can never disagree about the same school.
   */
  engagement: {
    quickWinsViewed: number;
    lessonsViewed: number;
    coursesCompleted: number;
    checkIns: number;
    questionsAsked: number;
    recognitions: number;
  };
  steps: MatrixStep[];
  /** Steps complete over steps that apply. Not a score, a fraction. */
  completed: number;
  applicable: number;
}

/**
 * The Engagement view of the matrix. Order matters: the component renders these
 * left to right and reads the matching keys off row.engagement.
 */
export const ENGAGEMENT_LABELS = [
  { key: 'seatsProvisioned', label: 'Seats' },
  { key: 'activeEducators', label: 'Signed in' },
  { key: 'quickWinsViewed', label: 'Quick Wins' },
  { key: 'lessonsViewed', label: 'Lessons' },
  { key: 'coursesCompleted', label: 'Courses done' },
  { key: 'checkIns', label: 'Check-ins' },
  { key: 'questionsAsked', label: 'Questions' },
  { key: 'recognitions', label: 'Recognitions' },
] as const;

const STEP_LABELS = [
  'Dashboard access',
  'Roster loaded',
  'Hub seats provisioned',
  'Team using the Hub',
  'Kickoff scheduled',
  'Goals set',
  'Service dates confirmed',
];

function pluraliseDays(n: number) {
  return n === 1 ? '1 day' : `${n} days`;
}

export async function GET(_request: NextRequest) {
  try {
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

    const portal = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const hub = getHubServiceClient();

    const { data: partnerships, error: partnershipError } = await portal
      .from('partnerships')
      .select(
        'id, org_name, contact_name, slug, partnership_type, contract_phase, contract_start, contract_end, staff_enrolled, observation_days_total, virtual_sessions_total, executive_sessions_total'
      )
      .eq('status', 'active')
      .order('org_name');

    if (partnershipError) {
      console.error('[onboarding-matrix] partnerships read failed:', partnershipError.message);
      return NextResponse.json({ error: partnershipError.message }, { status: 500 });
    }

    const rows = partnerships ?? [];
    const ids = rows.map((p) => p.id);
    if (ids.length === 0) {
      return NextResponse.json({ partnerships: [], stepLabels: STEP_LABELS, asOf: new Date().toISOString() });
    }

    // Everything below is fetched once for all partnerships rather than per
    // row. Nine partnerships today, but a per-row loop is how a page like this
    // quietly becomes unusable at forty.
    const [staffRes, kpiRes, actionRes, activityRes, seatRes, profileRes] = await Promise.all([
      portal.from('staff_members').select('partnership_id, email, is_active').in('partnership_id', ids),
      portal.from('partnership_kpis').select('partnership_id, status').in('partnership_id', ids),
      portal.from('action_items').select('partnership_id, title, category, status').in('partnership_id', ids),
      portal.from('activity_log').select('partnership_id, action, created_at').in('partnership_id', ids),
      hub
        .from('hub_memberships')
        .select('user_id, partnership_id')
        .in('partnership_id', ids)
        .eq('tier', 'all_access')
        .eq('status', 'active'),
      hub.from('hub_profiles').select('id, partnership_slug').not('partnership_slug', 'is', null),
    ]);

    for (const [name, res] of [
      ['staff_members', staffRes],
      ['partnership_kpis', kpiRes],
      ['action_items', actionRes],
      ['activity_log', activityRes],
      ['hub_memberships', seatRes],
      ['hub_profiles', profileRes],
    ] as const) {
      // Surface rather than swallow. A discarded error here would produce a
      // matrix that looks authoritative and reports everyone as behind.
      if (res.error) {
        console.error(`[onboarding-matrix] ${name} read failed:`, res.error.message);
        return NextResponse.json({ error: `${name}: ${res.error.message}` }, { status: 500 });
      }
    }

    // Seats by partnership, with a slug fallback for schools provisioned by
    // hand. St. Mary is the live case: eleven seats carrying the slug but no
    // partnership_id, because they skipped the official provisioning route.
    const slugToId = new Map<string, string>();
    for (const p of rows) if (p.slug) slugToId.set(p.slug, p.id);

    const seatUserIds = new Map<string, Set<string>>();
    for (const s of seatRes.data ?? []) {
      const key = String(s.partnership_id);
      if (!seatUserIds.has(key)) seatUserIds.set(key, new Set());
      seatUserIds.get(key)!.add(s.user_id as string);
    }
    const profileByPartnership = new Map<string, Set<string>>();
    for (const pr of profileRes.data ?? []) {
      const pid = slugToId.get(String(pr.partnership_slug));
      if (!pid) continue;
      if (!profileByPartnership.has(pid)) profileByPartnership.set(pid, new Set());
      profileByPartnership.get(pid)!.add(pr.id as string);
    }
    // Only fall back for partnerships with no linked seats at all, and only
    // count a profile if it actually holds a live seat. A profile is not an
    // entitlement: someone who has left still has one.
    const fallbackCandidates = [...profileByPartnership.entries()].filter(
      ([pid]) => (seatUserIds.get(pid)?.size ?? 0) === 0
    );
    if (fallbackCandidates.length > 0) {
      const candidateIds = [...new Set(fallbackCandidates.flatMap(([, set]) => [...set]))];
      const { data: fallbackSeats, error: fallbackError } = await hub
        .from('hub_memberships')
        .select('user_id')
        .in('user_id', candidateIds)
        .eq('tier', 'all_access')
        .eq('status', 'active');

      if (fallbackError) {
        console.error('[onboarding-matrix] fallback seat read failed:', fallbackError.message);
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }

      const seated = new Set((fallbackSeats ?? []).map((s) => s.user_id as string));
      for (const [pid, set] of fallbackCandidates) {
        seatUserIds.set(pid, new Set([...set].filter((u) => seated.has(u))));
      }
    }

    // Genuine activity only, via the one shared allowlist. Everything it
    // leaves out was written by TDI rather than earned by the educator: the
    // seat we created, the welcome we sent, the perk we granted. Counting any
    // of it reports a school as active on the strength of our own outbound.
    const allSeatIds = [...new Set([...seatUserIds.values()].flatMap((s) => [...s]))];
    const activeByPartnership = new Map<string, Set<string>>();
    const actionCounts = new Map<string, Map<string, number>>();

    const emptyEngagement = () => ({
      quickWinsViewed: 0,
      lessonsViewed: 0,
      coursesCompleted: 0,
      checkIns: 0,
      questionsAsked: 0,
      recognitions: 0,
    });

    const qaByPartnership = new Map<string, number>();
    const recognitionsByPartnership = new Map<string, number>();

    if (allSeatIds.length > 0) {
      const [activityRes2, qaRes, recognitionRes] = await Promise.all([
        hub.from('hub_activity_log').select('user_id, action').in('user_id', allSeatIds),
        // parent_id null is a question rather than a reply, matching the
        // definition the per-school Hub depth panel already uses.
        hub.from('hub_qa_posts').select('user_id, parent_id').in('user_id', allSeatIds),
        hub.from('hub_earned_recognitions').select('user_id').in('user_id', allSeatIds),
      ]);

      for (const [label, res] of [
        ['hub_activity_log', activityRes2],
        ['hub_qa_posts', qaRes],
        ['hub_earned_recognitions', recognitionRes],
      ] as const) {
        if (res.error) {
          console.error(`[onboarding-matrix] ${label} read failed:`, res.error.message);
          return NextResponse.json({ error: res.error.message }, { status: 500 });
        }
      }

      const genuine = (activityRes2.data ?? []).filter((a) =>
        isEngagementAction(a.action as string | null)
      );
      const activeUsers = new Set(genuine.map((a) => a.user_id as string));

      const partnershipOfUser = new Map<string, string>();
      for (const [pid, set] of seatUserIds) {
        activeByPartnership.set(pid, new Set([...set].filter((u) => activeUsers.has(u))));
        for (const uid of set) partnershipOfUser.set(uid, pid);
      }

      for (const row of genuine) {
        const pid = partnershipOfUser.get(row.user_id as string);
        if (!pid) continue;
        if (!actionCounts.has(pid)) actionCounts.set(pid, new Map());
        const bucket = actionCounts.get(pid)!;
        const action = row.action as string;
        bucket.set(action, (bucket.get(action) ?? 0) + 1);
      }

      for (const row of qaRes.data ?? []) {
        if (row.parent_id) continue;
        const pid = partnershipOfUser.get(row.user_id as string);
        if (!pid) continue;
        qaByPartnership.set(pid, (qaByPartnership.get(pid) ?? 0) + 1);
      }

      for (const row of recognitionRes.data ?? []) {
        const pid = partnershipOfUser.get(row.user_id as string);
        if (!pid) continue;
        recognitionsByPartnership.set(pid, (recognitionsByPartnership.get(pid) ?? 0) + 1);
      }
    }

    const engagementFor = (pid: string) => {
      const bucket = actionCounts.get(pid);
      if (!bucket) return emptyEngagement();
      const n = (action: string) => bucket.get(action) ?? 0;
      return {
        quickWinsViewed: n('quick_win_viewed'),
        lessonsViewed: n('lesson_viewed'),
        coursesCompleted: n('course_completed'),
        checkIns: n('checkin_completed'),
        questionsAsked: qaByPartnership.get(pid) ?? 0,
        recognitions: recognitionsByPartnership.get(pid) ?? 0,
      };
    };

    const rosterByPartnership = new Map<string, number>();
    for (const s of staffRes.data ?? []) {
      if (s.is_active === false) continue;
      rosterByPartnership.set(s.partnership_id, (rosterByPartnership.get(s.partnership_id) ?? 0) + 1);
    }

    const kpisByPartnership = new Map<string, number>();
    for (const k of kpiRes.data ?? []) {
      if (k.status === 'paused') continue;
      kpisByPartnership.set(k.partnership_id, (kpisByPartnership.get(k.partnership_id) ?? 0) + 1);
    }

    const actionsByPartnership = new Map<string, { title: string; category: string; status: string }[]>();
    for (const a of actionRes.data ?? []) {
      if (!actionsByPartnership.has(a.partnership_id)) actionsByPartnership.set(a.partnership_id, []);
      actionsByPartnership.get(a.partnership_id)!.push(a as never);
    }

    const loginByPartnership = new Map<string, string>();
    for (const ev of activityRes.data ?? []) {
      if (ev.action !== 'login' && ev.action !== 'dashboard_viewed') continue;
      const prev = loginByPartnership.get(ev.partnership_id);
      if (!prev || ev.created_at > prev) loginByPartnership.set(ev.partnership_id, ev.created_at);
    }

    const now = Date.now();

    const result: MatrixRow[] = rows.map((p) => {
      const seats = seatUserIds.get(p.id)?.size ?? 0;
      const active = activeByPartnership.get(p.id)?.size ?? 0;
      const roster = rosterByPartnership.get(p.id) ?? 0;
      const contracted = p.staff_enrolled ?? 0;
      const kpis = kpisByPartnership.get(p.id) ?? 0;
      const actions = actionsByPartnership.get(p.id) ?? [];
      const lastLogin = loginByPartnership.get(p.id) ?? null;

      const services =
        (p.observation_days_total ?? 0) + (p.virtual_sessions_total ?? 0) + (p.executive_sessions_total ?? 0);

      const kickoffDone = actions.some(
        (a) => a.status === 'completed' && (a.category === 'scheduling' || /kickoff|walkthrough/i.test(a.title))
      );
      const datesDone = actions.some(
        (a) => a.status === 'completed' && /observation|session|date/i.test(a.title)
      );

      const daysSinceStart = p.contract_start
        ? Math.floor((now - new Date(p.contract_start).getTime()) / 86_400_000)
        : null;

      const steps: MatrixStep[] = [
        {
          key: 'dashboard_access',
          label: STEP_LABELS[0],
          state: lastLogin ? 'done' : 'gap',
          evidence: lastLogin
            ? `Leader last seen ${new Date(lastLogin).toISOString().slice(0, 10)}.`
            : 'The leader has never opened their dashboard. Invite acceptance is not counted here because an auth check stamps it automatically.',
        },
        {
          key: 'roster_loaded',
          label: STEP_LABELS[1],
          state: roster === 0 && seats === 0 ? 'gap' : roster >= contracted || seats >= contracted ? 'done' : 'partial',
          evidence:
            roster === 0 && seats > 0
              ? `No roster in the portal, but ${seats} seats exist in the Hub. Loaded by hand rather than through the roster flow, and it still counts.`
              : roster === 0
              ? 'No roster rows and no seats.'
              : `${roster} on the roster against ${contracted} contracted.`,
        },
        {
          key: 'seats_provisioned',
          label: STEP_LABELS[2],
          state: seats === 0 ? 'gap' : seats >= contracted ? 'done' : 'partial',
          evidence:
            seats === 0
              ? contracted > 0
                ? `Zero of ${contracted} seats provisioned${daysSinceStart !== null && daysSinceStart > 0 ? `, ${pluraliseDays(daysSinceStart)} into the contract` : ''}.`
                : 'No seats provisioned.'
              : `${seats} of ${contracted} seats live.`,
        },
        {
          key: 'team_using',
          label: STEP_LABELS[3],
          state: active === 0 ? 'gap' : active >= Math.max(3, Math.ceil(seats * 0.25)) ? 'done' : 'partial',
          evidence:
            seats === 0
              ? 'No seats, so nobody can be using it.'
              : `${active} of ${seats} educators have genuinely used the Hub. Provisioning events are excluded.`,
        },
        {
          key: 'kickoff',
          label: STEP_LABELS[4],
          state: kickoffDone ? 'done' : 'gap',
          // Calls held on the calendar are invisible here. Nothing writes a
          // completed action item when a meeting happens, so Glen Ellyn and
          // Oak Grove both read as not scheduled despite real accepted calls.
          evidence: kickoffDone
            ? 'Kickoff marked complete.'
            : 'No completed scheduling item. A call held on the calendar does not reach this yet.',
        },
        {
          key: 'goals',
          label: STEP_LABELS[5],
          state: kpis > 0 ? 'done' : 'gap',
          evidence: kpis > 0 ? `${kpis} goals set.` : 'No goals set.',
        },
        {
          key: 'service_dates',
          label: STEP_LABELS[6],
          state: services === 0 ? 'na' : datesDone ? 'done' : 'gap',
          evidence:
            services === 0
              ? 'No observation days, virtual or executive sessions in this contract.'
              : `${services} contracted service ${services === 1 ? 'day or session' : 'days and sessions'}, none confirmed.`,
        },
      ];

      const applicable = steps.filter((s) => s.state !== 'na').length;
      const completed = steps.filter((s) => s.state === 'done').length;

      return {
        id: p.id,
        orgName: p.org_name ?? p.contact_name ?? 'Unnamed partnership',
        slug: p.slug ?? null,
        contactName: p.contact_name ?? null,
        phase: p.contract_phase ?? null,
        partnershipType: p.partnership_type ?? null,
        contractStart: p.contract_start ?? null,
        contractEnd: p.contract_end ?? null,
        seatsContracted: contracted,
        seatsProvisioned: seats,
        rosterCount: roster,
        activeEducators: active,
        engagement: engagementFor(p.id),
        steps,
        completed,
        applicable,
      };
    });

    return NextResponse.json({
      partnerships: result,
      stepLabels: STEP_LABELS,
      engagementLabels: ENGAGEMENT_LABELS,
      asOf: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[onboarding-matrix] failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
