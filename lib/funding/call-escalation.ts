/**
 * The call rung.
 *
 * The escalation ladder that already exists moves an unanswered item from the
 * school's named contact, to a backup, to Rae. Every rung is an email. So when
 * somebody has ignored eleven emails, the system's answer is to email a
 * different person, and there is no step that says stop typing and pick up the
 * phone.
 *
 * That gap has a number attached. Teri was emailed 31 times between 21 July
 * and 17 August, Paula 18 times. On 17 August the rule that automation never
 * emails a school took effect, correctly, and every one of those tasks was set
 * to blocked on the same day. Nothing reads blocked, so the chase went from 31
 * emails straight to twelve days of silence while $10,000 of Walmart Spark
 * Good ran down to a 31 August deadline with the applications written, marked
 * ready, and unsubmitted.
 *
 * This module decides when an item stops being an email problem and becomes a
 * phone call, and supplies what to say. It is pure so the board and the cron
 * can both use it and agree.
 */

type CallReason = 'deadline' | 'silence' | 'blocked' | 'stale'

export interface CallTrigger {
  reason: CallReason
  /** One line, for the row. Says what is true, not what to feel. */
  headline: string
  /** What to say when they answer. Written to be read aloud. */
  script: string[]
  /** Small note on how to run the call. */
  note: string
}

/** Business days between two dates, counting whole days only. */
function bizDaysBetween(from: Date, to: Date): number {
  if (to <= from) return 0
  let days = 0
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1)
    const d = cursor.getDay()
    if (d !== 0 && d !== 6) days++
  }
  return days
}

/** Thresholds. Generous on purpose: an unnecessary call costs minutes, a
 *  missed one costs a grant. */
const CALL_AFTER_NUDGES = 3
const CALL_AFTER_BLOCKED_BIZ_DAYS = 3
const CALL_AFTER_OVERDUE_BIZ_DAYS = 10
const CALL_WITHIN_DAYS_OF_CLOSE = 7

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n.toLocaleString()}`

/**
 * Does this task warrant a call, and why. Returns null when email is still a
 * reasonable channel.
 *
 * `closingSoon` is passed in rather than derived here because the deadline
 * lives on the opportunity, not the task, and it overrides every count below:
 * a deadline does not care how polite the sequence has been.
 */
export function callTriggerFor(
  task: { status?: string | null; due_date?: string | null; nudge_count?: number | null },
  ctx: {
    today: Date
    contactName: string
    schoolName: string
    /** Set when a linked grant closes within CALL_WITHIN_DAYS_OF_CLOSE and is unsubmitted. */
    closingSoon?: { grantName: string; daysLeft: number; amount: number; blockedBy?: string | null } | null
  },
): CallTrigger | null {
  const { today, contactName, schoolName, closingSoon } = ctx
  const first = contactName.split(' ')[0] || 'there'
  const nudges = task.nudge_count ?? 0

  // ── Deadline. Fires immediately, ignores every count. ──
  if (closingSoon) {
    const { grantName, daysLeft, amount, blockedBy } = closingSoon
    const when = daysLeft <= 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`

    // A prerequisite nobody resolved is a different call from simple silence.
    // Paula was reminded five times to submit an application she could not
    // submit, because the account it goes through was never set up. Asking
    // again would have failed a sixth time.
    if (blockedBy) {
      return {
        reason: 'deadline',
        headline: `${grantName} closes ${when} and ${first} cannot submit it yet. ${blockedBy} is unresolved. ${money(amount)} at stake.`,
        script: [
          `Hi ${first}, it's Bella from Teachers Deserve It. I think I have been asking you the wrong question.`,
          `I kept asking whether you had submitted the ${grantName} application, and I do not think you can, because ${blockedBy.toLowerCase()}. That is on our side to have spotted sooner.`,
          `It closes ${when} and it is ${money(amount)}. Can we sort it together right now, it takes a few minutes and then the submission itself is quick.`,
        ],
        note: 'Stay on the line and finish the prerequisite. Asking them to do it and call back reopens the same gap.',
      }
    }

    return {
      reason: 'deadline',
      headline: `${grantName} closes ${when}, written and not submitted. ${money(amount)} at stake.`,
      script: [
        `Hi ${first}, it's Bella from Teachers Deserve It. This is a quick one with a clock on it.`,
        `The ${grantName} we wrote for ${schoolName} closes ${when} and it has not been submitted. It is ${money(amount)} and the application is finished.`,
        `I need about ten minutes of someone's time before then. If it is not you, tell me who and I will call them instead.`,
      ],
      note: 'Name the amount and the date in the first fifteen seconds. Everything after that is logistics.',
    }
  }

  // ── Silence. The channel has stopped working. ──
  if (nudges >= CALL_AFTER_NUDGES) {
    return {
      reason: 'silence',
      headline: `Chased ${nudges} times with no reply. Email is not reaching ${first}.`,
      script: [
        `Hi ${first}, it's Bella from Teachers Deserve It. I am not chasing you, I promise.`,
        `I wanted to check my emails are actually reaching you, because I have sent a few and I would rather find out my address is landing in a spam folder than assume you are ignoring me.`,
        `Can I walk you through what is outstanding now while we are on, it takes about ten minutes.`,
      ],
      note: 'If they cannot do it now, get a specific time today or tomorrow and call back then. Do not revert to email.',
    }
  }

  // ── Blocked. Somebody judged it stuck and then nothing happened. ──
  if (task.status === 'blocked') {
    const since = task.due_date ? new Date(task.due_date + 'T00:00:00') : today
    if (bizDaysBetween(since, today) >= CALL_AFTER_BLOCKED_BIZ_DAYS) {
      return {
        reason: 'blocked',
        headline: `Marked blocked and nothing has moved it since. Needs a person.`,
        script: [
          `Hi ${first}, it's Bella from Teachers Deserve It.`,
          `We have something for ${schoolName} that is stuck on our board, and I would rather ask you directly than guess at what is holding it up.`,
          `Have you got five minutes to tell me where this actually sits on your end?`,
        ],
        note: 'The goal is a diagnosis, not a nudge. Find out what is genuinely in the way and record it.',
      }
    }
  }

  // ── Stale. Two working weeks past due is not a scheduling problem. ──
  if (task.due_date) {
    const due = new Date(task.due_date + 'T00:00:00')
    if (bizDaysBetween(due, today) >= CALL_AFTER_OVERDUE_BIZ_DAYS) {
      return {
        reason: 'stale',
        headline: `Two working weeks past due with no movement.`,
        script: [
          `Hi ${first}, it's Bella from Teachers Deserve It.`,
          `Something for ${schoolName} has been sitting a while and I do not want it to quietly expire. I would rather close it properly than leave it open.`,
          `Is this still worth pursuing at your end, and if so what do you need from me to move it?`,
        ],
        note: 'A clean no is a good outcome here. An item that will never move should be closed with its reason.',
      }
    }
  }

  return null
}
