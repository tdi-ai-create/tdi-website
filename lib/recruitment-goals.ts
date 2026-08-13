/**
 * Recruitment targets and Bella's action queue.
 *
 * Two problems this solves. The pipeline had no notion of a goal, so nobody
 * could tell a good week from a bad one until a quarter had passed. And the
 * follow-up cron marked candidates as due, wrote a note, and told nobody, so
 * the work sat there. Both are the same failure the whole system already had
 * once: something changed and no human heard about it.
 */

/** New candidates sourced per week. */
export const WEEKLY_SOURCING_TARGET = 5
/** Candidates converted to creators per month. */
export const MONTHLY_CONVERSION_TARGET = 2

/** Days after outreach before Bella should nudge. Matches recruitment-followup. */
export const FOLLOW_UP_1_DAYS = 5
export const FOLLOW_UP_2_DAYS = 12
export const NO_RESPONSE_DAYS = 19

/** A stage sitting untouched this long is drifting, not progressing. */
export const STALE_STAGE_DAYS = 10

export type QueueReason =
  | 'approve_outreach'
  | 'send_outreach'
  | 'follow_up_1'
  | 'follow_up_2'
  | 'decide_no_response'
  | 'revisit_due'
  | 'stalled'

export type QueueItem = {
  id: string
  name: string
  stage: string
  reason: QueueReason
  /** Days waiting, for sorting and for showing Bella what is oldest. */
  days: number
  detail: string
}

export const QUEUE_LABELS: Record<QueueReason, string> = {
  approve_outreach: 'Approve outreach',
  send_outreach: 'Send it',
  follow_up_1: 'First follow up',
  follow_up_2: 'Second follow up',
  decide_no_response: 'Close it out',
  revisit_due: 'Revisit now due',
  stalled: 'Stalled, needs a nudge',
}

/** Most urgent first. Sending something already approved beats new triage. */
const REASON_RANK: Record<QueueReason, number> = {
  send_outreach: 0,
  follow_up_2: 1,
  decide_no_response: 2,
  follow_up_1: 3,
  revisit_due: 4,
  approve_outreach: 5,
  stalled: 6,
}

export type CandidateRow = {
  id: string
  name: string
  stage: string
  created_at: string
  updated_at: string | null
  outreach_sent_at: string | null
  outreach_follow_up_1_at: string | null
  outreach_follow_up_2_at: string | null
  revisit_date: string | null
}

function daysSince(iso: string | null, now: number): number {
  if (!iso) return 0
  return Math.floor((now - new Date(iso).getTime()) / 86_400_000)
}

/**
 * What Bella actually has to do, derived from stage and clock rather than
 * asked of her. A candidate appears at most once, under its most urgent reason.
 */
export function buildActionQueue(rows: CandidateRow[], now = Date.now()): QueueItem[] {
  const items: QueueItem[] = []

  for (const c of rows) {
    const push = (reason: QueueReason, days: number, detail: string) =>
      items.push({ id: c.id, name: c.name, stage: c.stage, reason, days, detail })

    if (c.stage === 'suggested') {
      const days = daysSince(c.created_at, now)
      push('approve_outreach', days, `Waiting ${days} day${days === 1 ? '' : 's'} for a decision`)
      continue
    }

    if (c.stage === 'outreach_approved') {
      const days = daysSince(c.updated_at || c.created_at, now)
      push('send_outreach', days, `Approved ${days} day${days === 1 ? '' : 's'} ago, not marked sent`)
      continue
    }

    if (c.stage === 'outreach_sent' && c.outreach_sent_at) {
      const days = daysSince(c.outreach_sent_at, now)
      if (days >= NO_RESPONSE_DAYS) {
        push('decide_no_response', days, `${days} days with no reply after two follow ups`)
      } else if (days >= FOLLOW_UP_2_DAYS && !c.outreach_follow_up_2_at) {
        push('follow_up_2', days, `${days} days since outreach, try a different angle`)
      } else if (days >= FOLLOW_UP_1_DAYS && !c.outreach_follow_up_1_at) {
        push('follow_up_1', days, `${days} days since outreach, no reply yet`)
      }
      continue
    }

    if (c.stage === 'revisit' && c.revisit_date) {
      const due = new Date(c.revisit_date).getTime()
      if (due <= now) {
        const days = Math.floor((now - due) / 86_400_000)
        push('revisit_due', days, days > 0 ? `Revisit was due ${days} day${days === 1 ? '' : 's'} ago` : 'Revisit is due today')
      }
      continue
    }

    // Mid-pipeline stages have no clock of their own, so they quietly rot.
    if (['interested', 'evaluation', 'call_scheduled', 'committed'].includes(c.stage)) {
      const days = daysSince(c.updated_at || c.created_at, now)
      if (days >= STALE_STAGE_DAYS) {
        push('stalled', days, `No movement in ${days} days at "${c.stage.replace(/_/g, ' ')}"`)
      }
    }
  }

  return items.sort((a, b) => {
    const rank = REASON_RANK[a.reason] - REASON_RANK[b.reason]
    return rank !== 0 ? rank : b.days - a.days
  })
}

export type GoalProgress = {
  sourced_this_week: number
  sourcing_target: number
  converted_this_month: number
  conversion_target: number
  active_pipeline: number
  needs_action: number
}

export function summarizeGoals(
  rows: CandidateRow[],
  convertedThisMonth: number,
  queue: QueueItem[],
  now = Date.now()
): GoalProgress {
  const weekAgo = now - 7 * 86_400_000
  const sourced = rows.filter(c => new Date(c.created_at).getTime() >= weekAgo).length
  const active = rows.filter(
    c => !['archived', 'declined', 'no_response'].includes(c.stage)
  ).length

  return {
    sourced_this_week: sourced,
    sourcing_target: WEEKLY_SOURCING_TARGET,
    converted_this_month: convertedThisMonth,
    conversion_target: MONTHLY_CONVERSION_TARGET,
    active_pipeline: active,
    needs_action: queue.length,
  }
}
