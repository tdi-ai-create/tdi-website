import { createHash } from 'crypto'
import { NEUTRAL_TASK_LABEL } from '@/lib/funding-followup-email'

/**
 * Deciding which drafts cannot go to a school as written, and finding the
 * action item whose wording has to be fixed for them to.
 *
 * A client email describes the task it is chasing. That description comes from
 * the action item's `client_label`, and when nobody wrote one the generator
 * substitutes neutral wording rather than send our own words to a school. That
 * substitution is the safe outcome, not the good one: the recipient reads "this
 * funding step is a key piece of the funding", which tells them nothing about
 * what we actually need.
 *
 * Fifteen of the seventeen live items have no client_label, so most of what
 * the queue produces reads that way. This module is what lets the queue say so
 * at the point of sending, rather than leaving a person to notice.
 */

/**
 * The identity of an underlying task, stable as its email wording escalates.
 *
 * This must stay identical to the value the follow-up cron writes, or a draft
 * cannot be matched back to the item it came from. It lives here so there is
 * one definition rather than a copy in each caller, which is the failure that
 * produced two disagreeing client-label safelists in August.
 */
export function sourceItemKeyFor(toEmail: string, itemTitle: string): string {
  return createHash('sha256')
    .update(`${toEmail}::${itemTitle}`)
    .digest('hex')
    .slice(0, 32)
}

/** The draft is describing its task with neutral filler because no label exists. */
export function usesPlaceholder(body: string | null | undefined): boolean {
  return (body ?? '').includes(NEUTRAL_TASK_LABEL)
}

export interface LabelCandidate {
  id: string
  title: string
  client_label: string | null
  status: string | null
}

/**
 * Which action item produced this draft.
 *
 * Two routes, because the queue holds drafts from both sides of the fix that
 * introduced the key. Newer drafts carry `source_item_key` and match exactly.
 * Older ones predate it and carry NULL, but they also predate the neutral
 * substitution, so their body contains the item's raw title and can be matched
 * on that. Longest title first, so a title that contains another does not lose
 * to its own substring.
 */
export function matchActionItem(
  draft: { to_email: string | null; body: string | null; source_item_key: string | null },
  items: LabelCandidate[]
): LabelCandidate | null {
  if (draft.source_item_key && draft.to_email) {
    const exact = items.find(
      i => sourceItemKeyFor(draft.to_email as string, i.title) === draft.source_item_key
    )
    if (exact) return exact
  }

  const body = draft.body ?? ''
  if (!body) return null

  // Match on the client_label as well as the title, and prefer it.
  //
  // The label is what actually reached the draft, because the generator used
  // to return it unchecked. So a draft carrying our pricing ladder contains
  // the label text and not the title, and matching on titles alone found
  // nothing on all six drafts that needed this. Longest first, so a string
  // containing another does not lose to its own substring.
  const candidates = items
    .flatMap(i => [
      ...(i.client_label ? [{ item: i, text: i.client_label }] : []),
      { item: i, text: i.title },
    ])
    .filter(c => c.text.length > 12)
    .sort((a, b) => b.text.length - a.text.length)

  return candidates.find(c => body.includes(c.text))?.item ?? null
}
