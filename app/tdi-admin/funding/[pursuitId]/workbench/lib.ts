// Shared derivations for the workbench view.
//
// Everything here runs off the single /api/funding/pursuits/[id] payload. The
// page it replaces fetched the same data five to seven times, once per tab,
// which is what let the action count and the action list disagree: the badge
// came from the page's copy and the list from the tab's, and the tab had no
// way to tell the page it had changed. One source removes the class of bug
// rather than patching that instance of it.

import { isPersonOwned, isSchoolOwned } from '@/lib/funding-ownership'
import { isWindowOpen } from '@/lib/funding-rules'

export const CLOSED_STATUSES = ['denied', 'awarded', 'closed', 'cancelled']
export const DEAD_ITEM_STATUSES = ['done', 'skipped', 'cancelled']
/** Already with the funder. Not closed, but nothing left for us to send. */
export const FILED_STATUSES = ['applied', 'submitted']

export type Owner = 'you' | 'school' | 'agent'

export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return Math.floor((Date.now() - t) / 86_400_000)
}

export function daysUntil(dateOnly: string | null | undefined): number | null {
  if (!dateOnly) return null
  const t = new Date(`${dateOnly}T00:00:00`).getTime()
  if (Number.isNaN(t)) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((t - today.getTime()) / 86_400_000)
}

export function isLiveItem(a: any): boolean {
  return !DEAD_ITEM_STATUSES.includes(a?.status)
}

export function isLivePath(o: any): boolean {
  return !CLOSED_STATUSES.includes(o?.status)
}

/**
 * The one thing most worth doing, chosen by what it costs to ignore rather
 * than by date order.
 *
 * An application sitting with a funder outranks an overdue task on purpose.
 * The funder replies to the school and not to us, so an answer can already
 * exist and never reach anyone here, and money we have won can sit unclaimed
 * while nothing on the page suggests anyone should ask.
 */
export function pickTheOneThing(opportunities: any[], actionItems: any[]) {
  const waiting = (opportunities ?? [])
    .filter(o => o.client_submitted && o.waiting_on === 'funder' && isLivePath(o))
    .map(o => ({ o, days: daysSince(o.client_submitted_at) ?? 0 }))
    .filter(x => x.days >= 30)
    .sort((a, b) => b.days - a.days)[0]

  if (waiting) {
    return {
      kind: 'funder' as const,
      severity: waiting.days >= 60 ? ('critical' as const) : ('warning' as const),
      flag: `With the funder ${waiting.days} days`,
      title: `${waiting.o.name} has had no decision recorded`,
      why:
        `Submitted ${(waiting.o.client_submitted_at ?? '').slice(0, 10)}, ${waiting.days} days ago. ` +
        `The funder replies to the school rather than to us, so a decision may already exist that ` +
        `never reached anyone here.` +
        (waiting.o.amount ? ` $${Number(waiting.o.amount).toLocaleString()} is sitting on the answer.` : ''),
      opportunityId: waiting.o.id,
    }
  }

  const overdue = (actionItems ?? [])
    .filter(isLiveItem)
    .map(a => ({ a, late: daysUntil(a.due_date) }))
    .filter(x => x.late !== null && (x.late as number) < 0)
    .sort((a, b) => (a.late as number) - (b.late as number))[0]

  if (overdue) {
    const late = Math.abs(overdue.late as number)
    return {
      kind: 'task' as const,
      severity: late >= 14 ? ('critical' as const) : ('warning' as const),
      flag: `${late} day${late === 1 ? '' : 's'} past due`,
      title: overdue.a.client_label || overdue.a.title,
      why: overdue.a.description || '',
      actionId: overdue.a.id,
      owner: isSchoolOwned(overdue.a) ? ('school' as Owner) : ('you' as Owner),
    }
  }

  const next = (actionItems ?? [])
    .filter(isLiveItem)
    .filter(a => a.due_date)
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))[0]

  if (next) {
    return {
      kind: 'task' as const,
      severity: 'calm' as const,
      flag: `Due ${next.due_date}`,
      title: next.client_label || next.title,
      why: next.description || '',
      actionId: next.id,
      owner: isSchoolOwned(next) ? ('school' as Owner) : ('you' as Owner),
    }
  }

  return null
}

/** Work split by who has to move, which is the only grouping that changes what you do next. */
/** A path that will not move until a named person does one named thing. */
export interface StuckPath {
  id: string
  name: string
  /** Why it stopped, in a sentence Bella can act on. */
  reason: string
  /** How long it has been sitting, in days. */
  since: number | null
  /** Ordering weight. Lower sorts first. */
  weight: number
}

/**
 * The paths that need a person, which the three work lists never showed.
 *
 * `groupWork` grouped by who holds something: you, the school, or an agent. A
 * narrative in `escalated`, `approval` or `ready` belongs to a person and
 * matched none of those, so it appeared nowhere. QA could give up on a grant
 * and hand it to Bella with nothing on her screen saying so, and a finished
 * application could sit unsent for a fortnight without a word.
 *
 * Measured 22 September 2026: three escalations and two finished-but-unsent
 * narratives were live across the three pursuits, and not one of them was
 * visible in the work summary on this page.
 *
 * `ready` is here deliberately even though it has no time limit in the SLA
 * table. Never going loud is not the same as never being shown, and Cox
 * Charities reached nine days from its deadline, written and approved, because
 * nothing ever mentioned it.
 */
export function stuckPaths(opportunities: any[]): StuckPath[] {
  const out: StuckPath[] = []

  for (const o of opportunities ?? []) {
    if (!isLivePath(o)) continue
    const since = daysSince(o.narrative_status_changed_at)
    const esc = o.qa_escalation || {}

    if (o.narrative_status === 'escalated' && !esc.awaiting_client) {
      out.push({
        id: o.id, name: o.name, since, weight: 0,
        reason: 'QA stopped after three tries. Open it to choose what happens next.',
      })
      continue
    }

    if (o.narrative_status === 'approval' || (o.narrative_status === 'qa_review' && o.qa_passed === true)) {
      out.push({
        id: o.id, name: o.name, since, weight: 1,
        reason: 'Passed QA. Approve it, or send it back with a note.',
      })
      continue
    }

    // Written, approved, and nobody has sent it.
    //
    // `applied` and a recorded client submission both mean it has already gone,
    // and the narrative simply stays `ready` afterwards. Allenwood's NEA grant
    // was filed in June and still reads `ready` today, so without this check the
    // group would have told Bella to send something the funder already has.
    if (o.narrative_status === 'ready' && !FILED_STATUSES.includes(o.status) && o.client_submitted !== true) {
      out.push({
        id: o.id, name: o.name, since, weight: 2,
        reason: 'Written and approved. It does nothing for the school until somebody sends it.',
      })
      continue
    }

    // Requested, but no agent can pick it up. The old grouping showed these as
    // "queued for a writer", which was untrue: the queue filters on an open
    // window, so nobody was ever going to see it.
    if (o.narrative_status === 'requested' && !isWindowOpen(o)) {
      out.push({
        id: o.id, name: o.name, since, weight: 3,
        reason: 'Marked as being written, but the application window is not open, so no writer can see it. Reopen the window or drop the path.',
      })
    }
  }

  return out.sort((a, b) => a.weight - b.weight || (b.since ?? 0) - (a.since ?? 0))
}

export function groupWork(actionItems: any[], opportunities: any[]) {
  const live = (actionItems ?? []).filter(isLiveItem)
  const stuck = stuckPaths(opportunities)
  const stuckIds = new Set(stuck.map(s => s.id))
  return {
    // Paths that stopped and need a person. Listed first because everything
    // else on this page is either moving or somebody else's.
    stuck,
    // This page already had the right rule. The board's school card had a
    // second one that demoted seven of Bella's items to an agent's. Both now
    // call the same helper so a third answer cannot appear.
    you: live.filter(isPersonOwned),
    school: live.filter(isSchoolOwned),
    // Genuinely moving. A requested path nobody can see is no longer counted
    // here, because saying it is with a writer when no writer can reach it is
    // the thing that let these sit for weeks.
    agent: (opportunities ?? []).filter(o =>
      ['requested', 'qa_review'].includes(o.narrative_status)
      && isLivePath(o)
      && !stuckIds.has(o.id)),
    finished: (actionItems ?? []).filter(a => !isLiveItem(a)),
  }
}
