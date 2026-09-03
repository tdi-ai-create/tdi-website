// ---------------------------------------------------------------------------
// The agreement gate: one classifier, used by the cron and the admin view
//
// Answers "what should happen to this creator" in exactly one place, so the
// preview Bella reads in the Re-engagement tab can never disagree with what the
// job actually does. The re-engagement sequence had that exact problem: the
// dashboard and the cron each had their own idea of "stalled".
// ---------------------------------------------------------------------------

import {
  AGREEMENT_GRACE_DAYS,
  AGREEMENT_WORK_WINDOW_DAYS,
  AGREEMENT_LOGIN_WINDOW_DAYS,
} from './reengagement-config';

export type GateOutcome =
  /** Signed. Handled by the normal re-engagement ladder. */
  | 'signed'
  /** Too new to judge. */
  | 'grace'
  /** Unsigned but doing real work. Needs a person, not automation. */
  | 'unsigned_working'
  /** Unsigned, past grace, nothing behind it. Closes automatically. */
  | 'close';

export interface GateVerdict {
  creatorId: string;
  name: string | null;
  email: string | null;
  outcome: GateOutcome;
  daysSinceJoin: number;
  lastMilestoneAt: string | null;
  lastLoginAt: string | null;
  /** Plain sentence for the admin UI and the audit note. */
  reason: string;
}

export interface GateInput {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  /**
   * When they most recently restarted, if they did. The clock runs from this
   * rather than created_at, because a creator who restarts has not been sitting
   * on an unsigned agreement for the whole time since their first application.
   */
  restarted_at?: string | null;
  agreement_signed_at: string | null;
  lastMilestoneAt: string | null;
  lastLoginAt: string | null;
}

function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * The date the agreement clock runs from.
 *
 * Re-accepting a creator resets their status, their pause state and their
 * steps, and used to leave this alone. Rebecca Blahus was re-accepted on
 * 1 September carrying 132 days of age from an April application, and the gate
 * closed her the next day. She had no window in which to sign anything.
 */
function clockStart(c: GateInput): string {
  if (!c.restarted_at) return c.created_at;
  return new Date(c.restarted_at) > new Date(c.created_at) ? c.restarted_at : c.created_at;
}

export function classify(c: GateInput, now: Date = new Date()): GateVerdict {
  const daysSinceJoin = daysSince(clockStart(c), now);

  const base = {
    creatorId: c.id,
    name: c.name,
    email: c.email,
    daysSinceJoin,
    lastMilestoneAt: c.lastMilestoneAt,
    lastLoginAt: c.lastLoginAt,
  };

  if (c.agreement_signed_at) {
    return { ...base, outcome: 'signed', reason: `signed ${shortDate(c.agreement_signed_at)}` };
  }

  if (daysSinceJoin <= AGREEMENT_GRACE_DAYS) {
    return {
      ...base,
      outcome: 'grace',
      reason: `${c.restarted_at ? 'restarted' : 'joined'} ${daysSinceJoin} ${daysSinceJoin === 1 ? 'day' : 'days'} ago, still inside the ${AGREEMENT_GRACE_DAYS} day window`,
    };
  }

  const workingByMilestone =
    !!c.lastMilestoneAt && daysSince(c.lastMilestoneAt, now) <= AGREEMENT_WORK_WINDOW_DAYS;

  if (workingByMilestone) {
    return {
      ...base,
      outcome: 'unsigned_working',
      reason: `no agreement, but completed work ${shortDate(c.lastMilestoneAt!)}`,
    };
  }

  const workingByLogin =
    !!c.lastLoginAt && daysSince(c.lastLoginAt, now) <= AGREEMENT_LOGIN_WINDOW_DAYS;

  if (workingByLogin) {
    return {
      ...base,
      outcome: 'unsigned_working',
      reason: `no agreement, but signed in ${shortDate(c.lastLoginAt!)}`,
    };
  }

  const never = !c.lastMilestoneAt
    ? 'never completed anything'
    : `nothing since ${shortDate(c.lastMilestoneAt)}`;

  return {
    ...base,
    outcome: 'close',
    reason: `no agreement after ${daysSinceJoin} days, ${never}`,
  };
}

/**
 * Loads every active creator and classifies them. Shared by the gate cron and
 * the admin pipeline endpoint.
 */
export async function classifyRoster(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  now: Date = new Date()
): Promise<GateVerdict[]> {
  const { data: creators, error } = await supabase
    .from('creators')
    .select('id, name, email, created_at, restarted_at, agreement_signed_at, status, lifecycle_state, publish_status, published_date, is_test_account');

  if (error) {
    console.error('[agreement-gate] Failed to load creators:', error);
    return [];
  }

  const eligible = (creators || []).filter(
    (c: Record<string, unknown>) =>
      c.status === 'active' &&
      (!c.lifecycle_state || c.lifecycle_state === 'active') &&
      c.publish_status !== 'published' &&
      // Someone whose work we published is never a candidate for closure,
      // whatever publish_status happens to say. Publishing happens on Substack,
      // outside this system, so publish_status is only as good as the last
      // person who remembered to set it. published_date is the second chance.
      !c.published_date &&
      !c.is_test_account
  );

  if (eligible.length === 0) return [];

  // Read every COMPLETED milestone, not just the ones carrying a date.
  //
  // This used to filter on `.not('completed_at','is',null)`, which meant a row
  // marked status='completed' with a null completed_at was invisible here. 39
  // such rows exist across 18 creators, and the gate read every one of those
  // creators as having done nothing. On 2026-08-25 that closed Dr. Stephanie
  // Nardi with the reason "never completed anything" and emailed her a closing
  // note, five months after we published her work to 22,612 readers.
  //
  // completed_at stays the preferred signal. updated_at is the fallback, and it
  // is the conservative direction to err in: it can only make someone look more
  // recently active, never less, and the failure mode we are avoiding is closing
  // an account that should have been protected.
  const { data: milestones } = await supabase
    .from('creator_milestones')
    .select('creator_id, completed_at, updated_at, status');

  const lastMilestone = new Map<string, string>();
  for (const m of (milestones || []) as {
    creator_id: string;
    completed_at: string | null;
    updated_at: string | null;
    status: string | null;
  }[]) {
    if (m.status !== 'completed') continue;
    const at = m.completed_at ?? m.updated_at;
    if (!at) continue;
    const cur = lastMilestone.get(m.creator_id);
    if (!cur || new Date(at) > new Date(cur)) {
      lastMilestone.set(m.creator_id, at);
    }
  }

  const lastLogin = new Map<string, string>();
  try {
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 5000 });
    for (const u of (authUsers?.users || []) as { email?: string; last_sign_in_at?: string }[]) {
      if (!u.email || !u.last_sign_in_at) continue;
      lastLogin.set(u.email.trim().toLowerCase(), u.last_sign_in_at);
    }
  } catch (e) {
    // Losing the login signal would make someone look less active, which here
    // means closing an account that should have been protected. Refuse to
    // classify rather than risk that.
    console.error('[agreement-gate] Auth read failed, refusing to classify:', e);
    return [];
  }

  return (eligible as Record<string, string | null>[]).map((c) =>
    classify(
      {
        id: c.id as string,
        name: c.name,
        email: c.email,
        created_at: c.created_at as string,
        restarted_at: (c.restarted_at as string | null) ?? null,
        agreement_signed_at: c.agreement_signed_at,
        lastMilestoneAt: lastMilestone.get(c.id as string) || null,
        lastLoginAt: c.email ? lastLogin.get(c.email.trim().toLowerCase()) || null : null,
      },
      now
    )
  );
}
