/**
 * The follow-up alert on a lead.
 *
 * Rae, 24 September 2026: follow-up notes "that everyone can read that is
 * editable as an alert for follow up and then its also documented in notes".
 *
 * Two jobs that pull in opposite directions, so they are kept as two things:
 *
 *   The alert is the CURRENT instruction. One per lead, overwritten in place.
 *   It answers "what is owed on this lead right now, by whom, by when" and it
 *   is only useful if it is short and there is exactly one of it.
 *
 *   The note history is the RECORD. Every edit to the alert writes a note, so
 *   the sequence of what was owed and who was asked survives the overwrite.
 *
 * An alert that accumulated would become a second note history that nobody
 * trims, which is the thing the board already has.
 */

export const FOLLOWUP_KINDS = ['call', 'email', 'meeting', 'other'] as const
export type FollowupKind = (typeof FOLLOWUP_KINDS)[number]

export interface Followup {
  text: string | null
  kind: string | null
  owner: string | null
  /** ISO date, no time. The day it is owed by, not a timestamp. */
  due: string | null
  setBy: string | null
  setAt: string | null
}

export function asFollowupKind(value: unknown): FollowupKind | null {
  return typeof value === 'string' && (FOLLOWUP_KINDS as readonly string[]).includes(value)
    ? (value as FollowupKind)
    : null
}

/** A lead has a live alert only when there is text. Owner and date alone are not an instruction. */
export function hasFollowup(f: Pick<Followup, 'text'> | null | undefined): boolean {
  return typeof f?.text === 'string' && f.text.trim().length > 0
}

export type FollowupUrgency = 'overdue' | 'today' | 'soon' | 'later' | 'undated'

/**
 * How loudly to draw the alert.
 *
 * `today` compares calendar days in local time rather than milliseconds,
 * because a follow-up due "today" is owed all day. Comparing timestamps makes
 * an alert set this morning read as overdue by the afternoon.
 */
export function urgency(due: string | null | undefined, now: Date = new Date()): FollowupUrgency {
  if (!due) return 'undated'
  const d = new Date(due + 'T00:00:00')
  if (isNaN(d.getTime())) return 'undated'
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  if (days <= 7) return 'soon'
  return 'later'
}

export const URGENCY_COLOR: Record<FollowupUrgency, { bg: string; fg: string; border: string }> = {
  overdue: { bg: '#FEF2F2', fg: '#991B1B', border: '#FCA5A5' },
  today:   { bg: '#FFF7ED', fg: '#9A3412', border: '#FDBA74' },
  soon:    { bg: '#FFFBEB', fg: '#854D0E', border: '#FDE68A' },
  later:   { bg: '#F0F9FF', fg: '#075985', border: '#BAE6FD' },
  undated: { bg: '#F3F4F6', fg: '#374151', border: '#D1D5DB' },
}

/** "Sep 26". Short, because it sits inside a pill on a card. */
export function shortDate(due: string | null | undefined): string | null {
  if (!due) return null
  const d = new Date(due + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Sort key for the outreach queue. Overdue first, then by date, then undated.
 * Undated last rather than first: an alert with no date is a reminder, an alert
 * with a date past is a broken promise.
 */
export function followupRank(due: string | null | undefined): number {
  if (!due) return Number.MAX_SAFE_INTEGER
  const d = new Date(due + 'T00:00:00')
  return isNaN(d.getTime()) ? Number.MAX_SAFE_INTEGER : d.getTime()
}
