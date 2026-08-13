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

export function classify(c: GateInput, now: Date = new Date()): GateVerdict {
  const daysSinceJoin = daysSince(c.created_at, now);

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
      reason: `joined ${daysSinceJoin} days ago, still inside the ${AGREEMENT_GRACE_DAYS} day window`,
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
    .select('id, name, email, created_at, agreement_signed_at, status, lifecycle_state, publish_status, is_test_account');

  if (error) {
    console.error('[agreement-gate] Failed to load creators:', error);
    return [];
  }

  const eligible = (creators || []).filter(
    (c: Record<string, unknown>) =>
      c.status === 'active' &&
      (!c.lifecycle_state || c.lifecycle_state === 'active') &&
      c.publish_status !== 'published' &&
      !c.is_test_account
  );

  if (eligible.length === 0) return [];

  const { data: milestones } = await supabase
    .from('creator_milestones')
    .select('creator_id, completed_at')
    .not('completed_at', 'is', null);

  const lastMilestone = new Map<string, string>();
  for (const m of (milestones || []) as { creator_id: string; completed_at: string }[]) {
    const cur = lastMilestone.get(m.creator_id);
    if (!cur || new Date(m.completed_at) > new Date(cur)) {
      lastMilestone.set(m.creator_id, m.completed_at);
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
        agreement_signed_at: c.agreement_signed_at,
        lastMilestoneAt: lastMilestone.get(c.id as string) || null,
        lastLoginAt: c.email ? lastLogin.get(c.email.trim().toLowerCase()) || null : null,
      },
      now
    )
  );
}
