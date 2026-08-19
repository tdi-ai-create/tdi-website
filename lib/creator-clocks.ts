// ---------------------------------------------------------------------------
// Creator side clocks.
//
// The waiting on TDI list catches when we are the blocker. This catches when
// the creator is. Walter Cullin Jr had not moved since 18 February, Amy Storer
// since 28 May, Jay Jackson and Joe Vercellino since early June. Every one of
// them had a clear next step and no date on it, and nothing would ever have
// said so.
//
// The date is a recommendation and never a deadline. Rae was explicit: a
// creator can move it themselves, with one button and no explanation asked for.
// Nothing here penalises anyone for using it. What it does track is a step
// pushed repeatedly, because a third extension means something a date cannot
// fix and that belongs with a person.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

// How long each step is expected to take lives on milestones.allowance_days,
// and a database trigger stamps opened_at and due_on whenever a step becomes
// available. Fourteen separate places in this codebase open a step, and a copy
// of this logic in each of them is precisely the duplication that caused the
// bugs found today, so none of them needs to know about dates at all.

/** Days a creator gets to extend by, each time they ask. */
export const EXTENSION_DAYS = 14;

/** Extensions on one step before it quietly reaches Bella. */
export const EXTENSIONS_BEFORE_A_PERSON = 3;

/** Days past the date before the creator hears anything at all. */
const GRACE_DAYS = 3;

/** Days between reminders, so a passed date never produces a daily email. */
const REMINDER_INTERVAL_DAYS = 10;

/** Days past the date before it stops being a reminder and becomes Bella's. */
const ESCALATE_AFTER_DAYS = 24;

/**
 * Whether reminders actually send. Off until Rae has read the first dry run,
 * because backdating the clock honestly would have made five creators overdue
 * on the day it launched, one of them by 168 days.
 */
export const STEP_REMINDERS_ENABLED = false;

export function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

type ClockOutcome =
  /** Inside the window, or not far enough past it to say anything. */
  | 'fine'
  /** Past the date. A friendly reminder is due. */
  | 'nudge'
  /** Well past, or extended repeatedly. Needs a person, not another email. */
  | 'person';

export interface ClockVerdict {
  milestoneRecordId: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string | null;
  step: string;
  dueOn: string;
  daysPastDue: number;
  extensions: number;
  outcome: ClockOutcome;
  /** Plain sentence for Slack and the audit note. */
  reason: string;
}

/**
 * Classifies every open creator step. One function, so the Slack preview and
 * the job that sends can never disagree about who is overdue. That split is
 * what made the re-engagement ladder mail nineteen people who had never
 * onboarded.
 *
 * Team steps are excluded. Those belong to the waiting on TDI list, and a
 * creator must never be reminded about work that is ours.
 */
export async function classifyClocks(
  supabase: DbClient,
  now: Date = new Date()
): Promise<ClockVerdict[]> {
  const { data: creators, error } = await supabase
    .from('creators')
    .select('id, name, email, status, lifecycle_state, is_test_account');

  if (error) {
    console.error('[clocks] Failed to load creators:', error);
    return [];
  }

  const live = (creators || []).filter(
    (c: Record<string, unknown>) =>
      c.status === 'active' &&
      (!c.lifecycle_state || c.lifecycle_state === 'active') &&
      !c.is_test_account
  );
  if (live.length === 0) return [];

  const byId = new Map(live.map((c: Record<string, any>) => [c.id, c]));

  const { data: rows } = await supabase
    .from('creator_milestones')
    .select('id, creator_id, due_on, extension_count, last_nudged_at, escalated_at, milestones!inner(name, requires_team_action, is_collapsed_into)')
    .eq('status', 'available')
    .in('creator_id', Array.from(byId.keys()));

  const out: ClockVerdict[] = [];

  for (const r of (rows || []) as Array<Record<string, any>>) {
    const ms = r.milestones;
    if (!ms || ms.requires_team_action || ms.is_collapsed_into) continue;
    if (!r.due_on) continue;

    const creator = byId.get(r.creator_id) as Record<string, any> | undefined;
    if (!creator) continue;

    const daysPastDue = Math.floor(
      (now.getTime() - new Date(`${r.due_on}T00:00:00Z`).getTime()) / 86400000
    );
    const extensions = r.extension_count ?? 0;

    const base = {
      milestoneRecordId: r.id as string,
      creatorId: r.creator_id as string,
      creatorName: (creator.name as string) || 'Unnamed creator',
      creatorEmail: (creator.email as string) || null,
      step: ms.name as string,
      dueOn: r.due_on as string,
      daysPastDue,
      extensions,
    };

    // Asking for longer is fine. Asking three times is a conversation.
    if (extensions >= EXTENSIONS_BEFORE_A_PERSON) {
      out.push({
        ...base,
        outcome: 'person',
        reason: `moved this date ${extensions} times, so something here is not about time`,
      });
      continue;
    }

    if (daysPastDue >= ESCALATE_AFTER_DAYS) {
      out.push({
        ...base,
        outcome: 'person',
        reason: `${daysPastDue} days past the date and reminders have not moved it`,
      });
      continue;
    }

    if (daysPastDue < GRACE_DAYS) {
      out.push({ ...base, outcome: 'fine', reason: daysPastDue < 0 ? `due ${r.due_on}` : 'just past the date, leaving it' });
      continue;
    }

    // Do not repeat a reminder that was sent recently.
    if (r.last_nudged_at) {
      const sinceNudge = Math.floor((now.getTime() - new Date(r.last_nudged_at).getTime()) / 86400000);
      if (sinceNudge < REMINDER_INTERVAL_DAYS) {
        out.push({ ...base, outcome: 'fine', reason: `reminded ${sinceNudge} days ago, next one is not due yet` });
        continue;
      }
    }

    out.push({
      ...base,
      outcome: 'nudge',
      reason: `${daysPastDue} days past the suggested date`,
    });
  }

  return out.sort((a, b) => b.daysPastDue - a.daysPastDue);
}
