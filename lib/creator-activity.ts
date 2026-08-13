// ---------------------------------------------------------------------------
// Creator activity: one definition, used everywhere
//
// Before this existed there were two answers to "when did this creator last do
// something". The admin dashboard read the most recent milestone completion.
// The re-engagement cron read creators.updated_at, which changes whenever
// anyone edits the record, including bulk scripts. A bulk edit on 19 Jul 2026
// therefore enrolled 19 creators in a six week email sequence without any of
// them having gone quiet, and an admin fixing a typo read to the system as the
// creator coming back.
//
// Activity here means the creator did something: touched the portal, completed
// a milestone, or signed in. The re-engagement cron enrols on
// last_portal_activity_at alone, which this exposes separately as
// daysSincePortalActivity so admin previews stay honest about what the cron
// will do. creators.updated_at is never consulted.
// ---------------------------------------------------------------------------

/** Where the most recent activity came from. Drives the "why" text in admin. */
export type ActivitySource = 'portal' | 'milestone' | 'login' | 'never';

export interface CreatorActivity {
  creatorId: string;
  lastMilestoneAt: string | null;
  lastLoginAt: string | null;
  lastPortalAt: string | null;
  /** Most recent real activity of any kind. Falls back to created_at. */
  lastActivityAt: string;
  daysSinceActivity: number;
  /**
   * Days since last_portal_activity_at specifically. This is the field the
   * re-engagement cron enrols on, so any admin preview of what that cron will
   * do has to use this rather than the broader figure above, or it shows Bella
   * a list the cron will not act on.
   */
  daysSincePortalActivity: number;
  source: ActivitySource;
  /** Short human readable reason, e.g. "last milestone 18 Feb, never signed in" */
  explanation: string;
}

/** Minimal shape we need. Supabase clients are loosely typed across this app. */
interface CreatorRow {
  id: string;
  email: string | null;
  created_at: string;
  last_portal_activity_at: string | null;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysBetween(from: string, to: Date): number {
  return Math.floor((to.getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Builds the sentence Bella reads on a creator row. The point is that a stalled
 * creator should never be a mystery: the row says what signal it is missing.
 */
function describe(
  source: ActivitySource,
  lastMilestoneAt: string | null,
  lastLoginAt: string | null
): string {
  if (source === 'never') {
    return 'never signed in, no milestones completed';
  }

  const parts: string[] = [];

  if (lastMilestoneAt) {
    parts.push(`last milestone ${shortDate(lastMilestoneAt)}`);
  } else {
    parts.push('no milestones completed');
  }

  if (lastLoginAt) {
    parts.push(`signed in ${shortDate(lastLoginAt)}`);
  } else {
    parts.push('never signed in');
  }

  return parts.join(', ');
}

/**
 * Returns activity for every creator, keyed by creator id.
 *
 * Two round trips regardless of roster size: one for milestone completions, one
 * for auth users. The roster is well under a thousand people, so callers can
 * safely filter the result in memory rather than pushing predicates into
 * Postgres. That matters because "stalled" can no longer be expressed as a
 * single column comparison.
 *
 * @param supabase A service-role client. auth.admin is required for sign-ins.
 */
export async function getCreatorActivity(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  now: Date = new Date()
): Promise<Map<string, CreatorActivity>> {
  const activity = new Map<string, CreatorActivity>();

  const { data: creators, error: creatorsError } = await supabase
    .from('creators')
    .select('id, email, created_at, last_portal_activity_at');

  if (creatorsError) {
    console.error('[creator-activity] Failed to load creators:', creatorsError);
    return activity;
  }

  // Most recent milestone completion per creator.
  const { data: milestones, error: milestonesError } = await supabase
    .from('creator_milestones')
    .select('creator_id, completed_at')
    .not('completed_at', 'is', null);

  if (milestonesError) {
    console.error('[creator-activity] Failed to load milestones:', milestonesError);
  }

  const lastMilestone = new Map<string, string>();
  for (const m of (milestones || []) as { creator_id: string; completed_at: string }[]) {
    const current = lastMilestone.get(m.creator_id);
    if (!current || new Date(m.completed_at) > new Date(current)) {
      lastMilestone.set(m.creator_id, m.completed_at);
    }
  }

  // Most recent portal sign-in per email. Same approach as
  // app/api/tdi-admin/hub-analytics/tdi-effect/route.ts.
  const lastLogin = new Map<string, string>();
  try {
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 5000 });
    for (const u of (authUsers?.users || []) as { email?: string; last_sign_in_at?: string }[]) {
      if (!u.email || !u.last_sign_in_at) continue;
      lastLogin.set(u.email.trim().toLowerCase(), u.last_sign_in_at);
    }
  } catch (e) {
    // A missing auth read should degrade to milestone-only, never throw. Losing
    // the login signal makes someone look less active, which is the safe
    // direction for a read but the wrong direction for sending them email, so
    // callers that send should treat this as a reason not to enrol.
    console.error('[creator-activity] Failed to load auth users:', e);
  }

  for (const creator of (creators || []) as CreatorRow[]) {
    const milestoneAt = lastMilestone.get(creator.id) || null;
    const loginAt = creator.email
      ? lastLogin.get(creator.email.trim().toLowerCase()) || null
      : null;

    const portalAt = creator.last_portal_activity_at || null;

    // Widest view of "did this person do anything", across all three signals.
    const candidates: { at: string; source: ActivitySource }[] = [];
    if (portalAt) candidates.push({ at: portalAt, source: 'portal' });
    if (milestoneAt) candidates.push({ at: milestoneAt, source: 'milestone' });
    if (loginAt) candidates.push({ at: loginAt, source: 'login' });

    candidates.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    const winner = candidates[0];
    const source: ActivitySource = winner ? winner.source : 'never';
    const lastActivityAt = winner ? winner.at : creator.created_at;

    activity.set(creator.id, {
      creatorId: creator.id,
      lastMilestoneAt: milestoneAt,
      lastLoginAt: loginAt,
      lastPortalAt: portalAt,
      lastActivityAt,
      daysSinceActivity: daysBetween(lastActivityAt, now),
      daysSincePortalActivity: daysBetween(portalAt || creator.created_at, now),
      source,
      explanation: describe(source, milestoneAt, loginAt),
    });
  }

  return activity;
}
