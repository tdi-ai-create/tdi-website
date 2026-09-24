// ---------------------------------------------------------------------------
// What is due, and what is expected.
//
// A month view of grant work only helps if it shows more than the handful of
// dates a funder happens to have published. Measured 22 September 2026: of 21
// live grant paths across the three schools, 5 carry an application deadline
// and 6 have a window explicitly marked unknown. A calendar built from
// confirmed dates alone would display a few entries while sixteen grants stayed
// invisible, which is the failure the funding portal already has.
//
// So there are two kinds of entry and the difference is stated on screen:
//
//   confirmed  a real obligation with a real date. A funder closes. A task is
//              due. Missing it costs something.
//   predicted  derived from how long the work normally takes. Nothing is owed
//              on that day. It exists so a week can be seen in advance rather
//              than only the things already late.
//
// Every predicted entry carries `derivation`, a sentence explaining how its
// date was reached. A prediction whose reasoning cannot be shown is a guess
// wearing a date, and the point of this file is to not do that.
// ---------------------------------------------------------------------------

import {
  DRAFT_SILENCE_HOURS,
  QA_SILENCE_HOURS,
  BELLA_SILENCE_HOURS,
  SEND_SILENCE_HOURS,
} from '@/lib/funding-rules';
import { isLive } from '@/lib/funding-status';
import { isSchoolOwned } from '@/lib/funding-ownership';

/**
 * What the entry is about, which decides its colour.
 *
 * Semantic, not decorative. `send` is the only one that reaches a school.
 */
export type EntryKind = 'send' | 'decide' | 'chase' | 'deadline';

export interface CalendarEntry {
  id: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  kind: EntryKind;
  /** Short enough to read inside a calendar cell. */
  label: string;
  /** The school this belongs to. */
  schoolId: string;
  schoolName: string;
  /** The grant, when the entry is about one. */
  opportunityId?: string | null;
  /** True when a real obligation falls on this date. */
  confirmed: boolean;
  /** Present on every predicted entry. How the date was reached. */
  derivation?: string;
  /** Longer context for the popup. */
  detail?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** yyyy-mm-dd for a Date, in local terms rather than UTC. */
function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** A date that many hours after another, as a plain day. */
function plusHours(from: string | null | undefined, hours: number): string | null {
  if (!from) return null;
  const t = new Date(from).getTime();
  if (Number.isNaN(t)) return null;
  return iso(new Date(t + hours * 3_600_000));
}

/**
 * The same day one year on.
 *
 * Used only for a funder whose last published deadline is known and whose
 * current cycle is not. Several of these run to a fixed annual rhythm, and a
 * greyed entry saying "last cycle closed on this date" is more use than nothing
 * at all, provided nobody mistakes it for a commitment.
 */
function sameDayNextYear(dateOnly: string): string | null {
  const [y, m, d] = dateOnly.split('-').map(Number);
  if (!y || !m || !d) return null;
  return `${y + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function hoursWord(h: number): string {
  return h % 24 === 0 ? `${h / 24} day${h / 24 === 1 ? '' : 's'}` : `${h} hours`;
}

/** Trim a grant name to something that fits a calendar cell. */
function short(name: string, max = 34): string {
  const clean = String(name ?? '').replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

export interface CalendarInput {
  pursuits: any[];
  opportunities: any[];
  actionItems: any[];
}

/**
 * Every entry for a set of schools, confirmed and predicted together.
 *
 * Callers filter by month. Building the whole set and filtering afterwards
 * keeps the prediction rules in one place rather than making each caller decide
 * what counts as a month.
 */
export function buildCalendar(input: CalendarInput): CalendarEntry[] {
  const { pursuits, opportunities, actionItems } = input;
  const out: CalendarEntry[] = [];

  const schoolById = new Map<string, any>();
  for (const p of pursuits ?? []) schoolById.set(p.id, p);

  const nameOf = (pursuitId: string) =>
    schoolById.get(pursuitId)?.district_name ?? 'Unknown school';

  // ── Confirmed: a task with a due date ───────────────────────────────────
  //
  // These are already somebody's obligation. The board calls them overdue; the
  // calendar just puts them on the day they were due.
  for (const a of actionItems ?? []) {
    if (!a?.due_date) continue;
    if (['done', 'skipped', 'cancelled'].includes(a.status)) continue;
    if (!schoolById.has(a.pursuit_id)) continue;

    const forSchool = isSchoolOwned(a);
    out.push({
      id: `task-${a.id}`,
      date: a.due_date,
      kind: forSchool ? 'chase' : 'decide',
      label: short(a.client_label || a.title),
      schoolId: a.pursuit_id,
      schoolName: nameOf(a.pursuit_id),
      opportunityId: a.opportunity_id ?? null,
      confirmed: true,
      detail: a.description ?? undefined,
    });
  }

  // ── Confirmed: a funder closes ──────────────────────────────────────────
  for (const o of opportunities ?? []) {
    if (!schoolById.has(o.pursuit_id)) continue;
    if (!isLive(o.status)) continue;
    if (!o.application_closes) continue;

    out.push({
      id: `close-${o.id}`,
      date: o.application_closes,
      kind: 'deadline',
      label: `${short(o.name, 26)} closes`,
      schoolId: o.pursuit_id,
      schoolName: nameOf(o.pursuit_id),
      opportunityId: o.id,
      confirmed: true,
      detail: o.amount ? `Asking ${Number(o.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}.` : undefined,
    });
  }

  // ── Predicted: the work clocks that already exist ───────────────────────
  //
  // These are not new rules. lib/funding-rules.ts already says how long each
  // state may sit before the portal says something, and those same numbers are
  // the honest estimate of when the next step lands. Reusing them means the
  // calendar and the board can never disagree about what "late" means.
  for (const o of opportunities ?? []) {
    if (!schoolById.has(o.pursuit_id)) continue;
    if (!isLive(o.status)) continue;

    const since = o.narrative_status_changed_at ?? o.updated_at ?? null;
    const school = { schoolId: o.pursuit_id, schoolName: nameOf(o.pursuit_id), opportunityId: o.id };

    if (o.narrative_status === 'requested') {
      const when = plusHours(since, DRAFT_SILENCE_HOURS);
      if (when) out.push({
        id: `pred-draft-${o.id}`, date: when, kind: 'decide', confirmed: false,
        label: `${short(o.name, 24)} draft due`, ...school,
        derivation: `Sent to ${o.assigned_agent || 'a writer'} on ${String(since).slice(0, 10)}. A draft has ${hoursWord(DRAFT_SILENCE_HOURS)} before the board calls it late, so this is when it is expected rather than when it is owed.`,
      });
    }

    if (o.narrative_status === 'qa_review') {
      const when = plusHours(since, QA_SILENCE_HOURS);
      if (when) out.push({
        id: `pred-qa-${o.id}`, date: when, kind: 'decide', confirmed: false,
        label: `${short(o.name, 24)} QA verdict`, ...school,
        derivation: `With Julie since ${String(since).slice(0, 10)}. QA normally answers well inside ${hoursWord(QA_SILENCE_HOURS)}, which is the point the board would flag it.`,
      });
    }

    if (o.narrative_status === 'approval') {
      const when = plusHours(since, BELLA_SILENCE_HOURS);
      if (when) out.push({
        id: `pred-approve-${o.id}`, date: when, kind: 'decide', confirmed: false,
        label: `${short(o.name, 22)} approval due`, ...school,
        derivation: `Passed QA on ${String(since).slice(0, 10)} and waiting on a person. ${hoursWord(BELLA_SILENCE_HOURS)} is the allowance before it reads as stuck.`,
      });
    }

    // An escalated narrative is waiting on a person in exactly the way an
    // approval is, and it was the only such state with nothing on the calendar.
    // QA has given up, the grant cannot move, and until now that showed up only
    // if an action item happened to exist alongside it.
    // A date we set ourselves, because the funder published none. It is
    // confirmed, not predicted: nobody derived it, somebody chose it.
    if (o.internal_target_date && !o.application_closes) {
      out.push({
        id: `target-${o.id}`, date: String(o.internal_target_date), kind: 'decide', confirmed: true,
        label: `${short(o.name, 20)}, our target`, ...school,
        detail: o.internal_target_note
          ? `We set this date. ${o.internal_target_note}`
          : 'We set this date. The funder has not published one, so this is our own intention and nothing enforces it but us.',
      });
    }

    if (o.narrative_status === 'escalated') {
      const when = plusHours(since, BELLA_SILENCE_HOURS);
      if (when) out.push({
        id: `pred-escalate-${o.id}`, date: when, kind: 'decide', confirmed: false,
        label: `${short(o.name, 22)} needs your decision`, ...school,
        derivation: `QA could not get this through and stopped on ${String(since).slice(0, 10)}. ${hoursWord(BELLA_SILENCE_HOURS)} is the allowance before it reads as stuck. Nothing moves until somebody chooses.`,
      });
    }

    if (o.narrative_status === 'ready' && !['applied', 'submitted'].includes(o.status) && o.client_submitted !== true) {
      const when = plusHours(since, SEND_SILENCE_HOURS);
      if (when) out.push({
        id: `pred-send-${o.id}`, date: when, kind: 'send', confirmed: false,
        label: `${short(o.name, 22)} packet to school`, ...school,
        derivation: `Approved on ${String(since).slice(0, 10)} and nobody has sent it. ${hoursWord(SEND_SILENCE_HOURS)} is the allowance, and this is the most expensive state to leave sitting: the work is finished and the school is expecting it.`,
      });
    }

    // A funder we have a past deadline for and no current one. Shown greyed on
    // the anniversary, because several of these run to a fixed annual rhythm
    // and "last cycle closed on this date" beats an empty calendar. It is
    // explicitly not a commitment, and the derivation says so.
    if (!o.application_closes && o.window_closes) {
      const when = sameDayNextYear(String(o.window_closes).slice(0, 10));
      if (when) out.push({
        id: `pred-window-${o.id}`, date: when, kind: 'deadline', confirmed: false,
        label: `${short(o.name, 20)} may close`, ...school,
        derivation: `No current deadline is confirmed for this funder. Their last recorded cycle closed on ${String(o.window_closes).slice(0, 10)}, and this is the same date a year on. Treat it as a prompt to check, not as a deadline.`,
      });
    }
  }

  return out.sort((a, b) =>
    a.date.localeCompare(b.date)
    || Number(b.confirmed) - Number(a.confirmed)
    || a.label.localeCompare(b.label));
}

/** Entries falling inside one month, `month` being 1 to 12. */
export function entriesInMonth(all: CalendarEntry[], year: number, month: number): CalendarEntry[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  return all.filter(e => e.date.startsWith(prefix));
}
