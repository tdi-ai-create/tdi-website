// Shared derivations for the workbench view.
//
// Everything here runs off the single /api/funding/pursuits/[id] payload. The
// page it replaces fetched the same data five to seven times, once per tab,
// which is what let the action count and the action list disagree: the badge
// came from the page's copy and the list from the tab's, and the tab had no
// way to tell the page it had changed. One source removes the class of bug
// rather than patching that instance of it.

export const CLOSED_STATUSES = ['denied', 'awarded', 'closed', 'cancelled']
export const DEAD_ITEM_STATUSES = ['done', 'skipped', 'cancelled']

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
      owner: overdue.a.owner_type === 'client' ? ('school' as Owner) : ('you' as Owner),
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
      owner: next.owner_type === 'client' ? ('school' as Owner) : ('you' as Owner),
    }
  }

  return null
}

/** Work split by who has to move, which is the only grouping that changes what you do next. */
export function groupWork(actionItems: any[], opportunities: any[]) {
  const live = (actionItems ?? []).filter(isLiveItem)
  return {
    you: live.filter(a => a.owner_type !== 'client'),
    school: live.filter(a => a.owner_type === 'client'),
    agent: (opportunities ?? []).filter(o =>
      ['requested', 'drafting', 'qa_review'].includes(o.narrative_status) && isLivePath(o)),
    finished: (actionItems ?? []).filter(a => !isLiveItem(a)),
  }
}
