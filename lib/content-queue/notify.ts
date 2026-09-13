import { slackNotify } from '@/lib/slack-notify'

/**
 * Channels where a person does the publishing, so a person has to be told.
 *
 * Social is deliberately absent. Rae's call, 8 September: the queue never writes
 * to Buffer, because a post written into Buffer goes out on its own and that is
 * publishing without anyone pressing anything. Approved social reaches Zara
 * through her ready list instead, as part of the Monday refill she already does.
 */
export const PERSON_PUBLISHES = ['substack', 'email'] as const

export function needsPersonHandoff(channel: string): boolean {
  return (PERSON_PUBLISHES as readonly string[]).includes(channel)
}

const SITE = 'https://www.teachersdeserveit.com'

/**
 * Something has reached a person and is waiting.
 *
 * This is the message that actually matters. The original build only announced
 * an approval after it happened, which is the moment a human has already acted;
 * nothing announced that one was needed. On 10 September a finished post sat in
 * pending_approval for thirteen hours and nobody was told.
 */
export function waitingMessage(item: {
  id: string
  title: string | null
  channel: string
}): string {
  return [
    `*Needs approving*`,
    `${item.title || '(untitled)'}`,
    `Cleared QA, creative and editorial. Read it and approve it, or send it back.`,
    `${SITE}/tdi-admin/hub/review`,
  ].join('\n')
}

export function notifyWaiting(item: {
  id: string
  title: string | null
  channel: string
}): { attempted: boolean; reason: string } {
  if (!process.env.SLACK_WEBHOOK_RAE) {
    return { attempted: false, reason: 'SLACK_WEBHOOK_RAE is not set, so nobody was told it needs approving' }
  }
  slackNotify('rae', waitingMessage(item))
  return { attempted: true, reason: 'told #rae-actions it needs approving' }
}

export function approvalMessage(item: {
  id: string
  title: string | null
  channel: string
  approved_by?: string | null
}): string {
  const who = item.approved_by ? `Approved by ${item.approved_by}` : 'Approved'
  const where = item.channel === 'email' ? 'send' : 'publish on Substack'
  return [
    `*Ready to ${where}*`,
    `${item.title || '(untitled)'}`,
    `${who}. Nothing else is waiting on you in the queue for this one.`,
    `${SITE}/tdi-admin/hub/schedule`,
    `id ${item.id}`,
  ].join('\n')
}

/**
 * Tell a person their piece is ready.
 *
 * Returns what actually happened rather than nothing. slackNotify is
 * fire-and-forget and returns silently when the webhook is unconfigured, which
 * is precisely the failure that matters here: an approval nobody hears about
 * looks identical to an approval nobody acted on. The result is written into the
 * item's log so a missing message is discoverable afterwards.
 */
export function notifyApproved(item: {
  id: string
  title: string | null
  channel: string
  approved_by?: string | null
}): { attempted: boolean; reason: string } {
  if (!needsPersonHandoff(item.channel)) {
    return { attempted: false, reason: `${item.channel} goes to Zara's ready list, not to a person` }
  }
  if (!process.env.SLACK_WEBHOOK_RAE) {
    return { attempted: false, reason: 'SLACK_WEBHOOK_RAE is not set, so nobody was told' }
  }
  slackNotify('rae', approvalMessage(item))
  return { attempted: true, reason: 'sent to #rae-actions' }
}
