/**
 * Slack notifications for the Creator Studio system.
 * Posts events to the #bella-actions channel via creator_webhook_url.
 * Follows the same pattern as billing-slack.ts.
 */

import { createClient } from '@supabase/supabase-js'

const LOG = '[creator-slack]'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getWebhook(
  channel: 'creator' | 'rae' = 'creator'
): Promise<{ url: string | null; enabled: boolean }> {
  const { data } = await db()
    .from('funding_notification_settings')
    .select('slack_enabled, creator_webhook_url, partner_webhook_url')
    .limit(1)
    .single()
  // creator_webhook_url is #bella-actions, partner_webhook_url is #rae-actions.
  const url = channel === 'rae' ? data?.partner_webhook_url : data?.creator_webhook_url
  return { url: url || null, enabled: data?.slack_enabled || false }
}

async function postToSlack(text: string, channel: 'creator' | 'rae' = 'creator') {
  const { url, enabled } = await getWebhook(channel)
  if (!enabled || !url) {
    console.log(LOG, '[DRY RUN]', text)
    return
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch (err) {
    console.error(LOG, 'Slack post failed:', err)
  }
}

/**
 * Posts a message already composed elsewhere. Used by the waiting on TDI list,
 * which builds its own body so the wording lives next to the data it describes.
 */
export async function postCreatorMessage(text: string, channel: 'creator' | 'rae' = 'creator') {
  await postToSlack(text, channel)
}

// Creator Studio Events

export async function creatorApplicationReceived(
  applicantName: string,
  wants: string,
  waitingCount: number
) {
  const queue = waitingCount > 1 ? `\n${waitingCount} applications are now waiting on an answer.` : ''
  await postToSlack(
    `*New Creator Application* | ${applicantName}\nWants to make: ${wants || 'not stated'}\nAccept, hold or decline: https://www.teachersdeserveit.com/tdi-admin/creators/applications${queue}`
  )
}

/**
 * Confirms what a decision actually did, including whether the email left.
 * A copy landing in an inbox proves a send was attempted; this says plainly
 * whether it succeeded, which a blind copy cannot.
 */
export async function creatorApplicationDecided(
  applicantName: string,
  decision: string,
  decidedBy: string,
  emailSent: boolean,
  sendsEmail: boolean
) {
  const mail = !sendsEmail
    ? 'No email is sent for this outcome.'
    : emailSent
      ? 'Email sent, copy in your inbox.'
      : 'EMAIL DID NOT SEND. Nobody was contacted, this needs another look.'
  await postToSlack(
    `*Application ${decision}* | ${applicantName}\nBy ${decidedBy}\n${mail}\nQueue: https://www.teachersdeserveit.com/tdi-admin/creators/applications`
  )
}

export async function creatorApplicationsWaiting(count: number, oldestDays: number) {
  await postToSlack(
    `*Applications waiting* | ${count} unanswered, oldest ${oldestDays} days\nNobody has heard back yet: https://www.teachersdeserveit.com/tdi-admin/creators/applications`
  )
}

/**
 * A creator saving the same step repeatedly is one event, not four.
 *
 * On 26 August this fired four times in three hours for one creator on one
 * milestone, versions 1, 1, 2 and 1, because it posts on every save rather than
 * on the first submission of a step. The reviewer still has exactly one thing
 * to look at, so the extra three are pure noise.
 *
 * Kept in memory rather than a table on purpose: this only needs to survive the
 * minutes during which someone is actively editing, and a cold start losing it
 * costs one duplicate message, which is the thing we already had.
 */
const recentSubmissions = new Map<string, number>()
const SUBMISSION_QUIET_MS = 30 * 60 * 1000

export async function creatorSubmittedDeliverable(creatorName: string, milestoneName: string, submissionVersion: number) {
  const key = `${creatorName}::${milestoneName}`
  const now = Date.now()
  const last = recentSubmissions.get(key)

  if (last && now - last < SUBMISSION_QUIET_MS) {
    console.log(`[creator-slack] Suppressed repeat submission for ${key}`)
    return
  }
  recentSubmissions.set(key, now)

  // Keep the map from growing forever in a long-lived runtime.
  if (recentSubmissions.size > 500) {
    for (const [k, t] of recentSubmissions) {
      if (now - t > SUBMISSION_QUIET_MS) recentSubmissions.delete(k)
    }
  }

  await postToSlack(
    `*Deliverable Submitted* | ${creatorName}\nMilestone: ${milestoneName} | Version ${submissionVersion}\nNeeds review in Creator Studio.`
  )
}

export async function feedbackDraftReady(creatorName: string, milestoneName: string, draftedBy: string) {
  await postToSlack(
    `*Feedback Draft Ready* | ${creatorName}\nMilestone: ${milestoneName} | Drafted by ${draftedBy}\nApprove or edit in Creator Studio before it goes to the creator.`
  )
}

export async function noteDraftReady(creatorName: string, reason: string) {
  await postToSlack(
    `*Check-in Note Draft Ready* | ${creatorName}\nReason: ${reason}\nReview and approve in the Creator Studio Action Center:\nhttps://www.teachersdeserveit.com/tdi-admin/creators`
  )
}

export async function feedbackApproved(creatorName: string, milestoneName: string, approvedBy: string) {
  await postToSlack(
    `*Feedback Approved* | ${creatorName}\nMilestone: ${milestoneName} | Approved by ${approvedBy}\nFeedback sent to creator.`
  )
}

export async function creatorRequestedCall(creatorName: string, milestoneName: string) {
  await postToSlack(
    `*Call Requested* | ${creatorName}\nMilestone: ${milestoneName}\nCreator wants to discuss their feedback. Schedule a call.`
  )
}

export async function creatorCriticalStall(creatorName: string, daysSinceActivity: number, courseName: string) {
  await postToSlack(
    `*Creator Stalled* | ${creatorName}\nCourse: ${courseName} | ${daysSinceActivity} days inactive\nNeeds intervention or re-engagement.`
  )
}

export async function creatorReengagementComplete(creatorName: string, outcome: string) {
  await postToSlack(
    `*Re-engagement Complete* | ${creatorName}\nOutcome: ${outcome}`
  )
}

// Recruitment Events

export async function recruitmentCandidateSuggested(candidateName: string, gapCategory: string, source: string) {
  await postToSlack(
    `*New Recruitment Candidate* | ${candidateName}\nGap: ${gapCategory || 'none specified'} | Source: ${source || 'unknown'}\nCandidate suggested for content gap.`
  )
}

export async function recruitmentOutreachApproved(candidateName: string, approvedBy: string) {
  await postToSlack(
    `*Outreach Approved* | ${candidateName}\nApproved by: ${approvedBy}\nReady to send outreach.`
  )
}

export async function recruitmentCandidateResponded(candidateName: string, newStage: string) {
  await postToSlack(
    `*Candidate Responded* | ${candidateName}\nMoved to: ${newStage}\nCandidate responded to outreach.`
  )
}

export async function recruitmentCandidateConverted(candidateName: string, creatorName: string, contentPath: string) {
  await postToSlack(
    `*Candidate Converted to Creator* | ${candidateName}\nCreator: ${creatorName} | Content path: ${contentPath}\nRecruitment pipeline conversion complete.`
  )
}

export async function recruitmentRevisitDue(candidateName: string, reason: string) {
  await postToSlack(
    `*Revisit Candidate Due* | ${candidateName}\nReason: ${reason}\nCandidate is due for re-engagement.`
  )
}

const RECRUITMENT_TAB_URL = 'https://www.teachersdeserveit.com/tdi-admin/creators'

/** A candidate is sitting in "suggested" and needs Bella to approve outreach. */
export async function recruitmentNeedsApproval(
  candidateName: string,
  gapCategory: string,
  hasDraft: boolean
) {
  const draftLine = hasDraft
    ? 'Outreach draft is ready to review.'
    : 'No outreach draft yet. Use Edit and Approve to write one.'
  await postToSlack(
    `*Candidate Needs Your Approval* | ${candidateName}\n` +
      `Gap: ${gapCategory || 'not linked to a gap'}\n` +
      `${draftLine}\n${RECRUITMENT_TAB_URL}`
  )
}

/** Weekly summary of what the Hub content scan changed. */
export async function recruitmentGapScanComplete(
  created: number,
  updated: number,
  resolved: number,
  criticalCategories: string[]
) {
  const criticalLine = criticalCategories.length
    ? `Critical: ${criticalCategories.join(', ')}`
    : 'No critical gaps this week.'
  await postToSlack(
    `*Weekly Content Gap Scan* | ${created} new, ${updated} refreshed, ${resolved} resolved\n` +
      `${criticalLine}\n${RECRUITMENT_TAB_URL}`
  )
}

/** Critical gaps exist but nobody has entered the pipeline in two weeks. */
export async function recruitmentPipelineStalled(criticalGaps: number, activeCandidates: number) {
  await postToSlack(
    `*Recruitment Pipeline Is Quiet* | ${criticalGaps} critical gap${criticalGaps === 1 ? '' : 's'} open\n` +
      `No new candidates in 14 days. ${activeCandidates} candidate${activeCandidates === 1 ? '' : 's'} active in the pipeline.\n` +
      `Worth a look, or nudge Anne Marie for fresh research.\n${RECRUITMENT_TAB_URL}`
  )
}

export type DigestCandidate = {
  name: string
  role: string | null
  org: string | null
  gap: string
  contact: string
  why: string
  draft: string
}

/**
 * The weekly handoff to Bella. Everything she needs is inline so she can copy
 * an outreach draft straight out of Slack without opening the portal first.
 */
export async function recruitmentWeeklyDigest(candidates: DigestCandidate[], target: number) {
  if (candidates.length === 0) return

  const header =
    `*This Week's Creator Candidates* | ${candidates.length} of ${target}\n` +
    `Researched by Anne Marie. Each one is ready to send once you approve it.\n`

  const body = candidates
    .map((c, i) => {
      const who = [c.role, c.org].filter(Boolean).join(', ')
      return (
        `\n\n*${i + 1}. ${c.name}*` +
        (who ? `\n${who}` : '') +
        `\nGap: ${c.gap}` +
        `\nContact: ${c.contact}` +
        `\nWhy: ${c.why}` +
        `\n\n\`\`\`${c.draft}\`\`\``
      )
    })
    .join('')

  const footer =
    `\n\nApprove, edit, or dismiss each one here:\n${RECRUITMENT_TAB_URL}`

  await postToSlack(header + body + footer)
}

/** Friday check for Rae: the week came up short of the recruitment target. */
export async function recruitmentWeeklyShortfall(
  actual: number,
  target: number,
  openCriticalGaps: number
) {
  await postToSlack(
    `*Recruitment Came Up Short This Week* | ${actual} of ${target}\n` +
      `${openCriticalGaps} critical gap${openCriticalGaps === 1 ? '' : 's'} still open with nobody sourced.\n` +
      `${RECRUITMENT_TAB_URL}`,
    'rae'
  )
}

export type FollowUpItem = { name: string; days: number; note: string }

/**
 * Daily "here is what you owe someone" note to Bella.
 *
 * The follow-up cron used to mark a candidate as due, write a note into a table
 * nobody reads, and stop. That is how outreach quietly died on the vine. One
 * consolidated message per day rather than one per candidate, so it stays
 * readable on a busy week.
 */
export async function recruitmentFollowUpDigest(
  dueNow: FollowUpItem[],
  revisits: FollowUpItem[],
  closedOut: FollowUpItem[],
  /**
   * Candidates who already said yes and have gone quiet since. Nothing used to
   * watch this stage at all, so the warmest people in the pipeline were the
   * only ones nobody chased.
   */
  warmButQuiet: FollowUpItem[] = []
) {
  if (dueNow.length === 0 && revisits.length === 0 && closedOut.length === 0 && warmButQuiet.length === 0) return

  const section = (title: string, items: FollowUpItem[]) =>
    items.length
      ? `\n\n*${title}*\n` + items.map(i => `• ${i.name} | ${i.note}`).join('\n')
      : ''

  const total = dueNow.length + revisits.length + warmButQuiet.length
  const header =
    total > 0
      ? `*Recruitment Follow Ups* | ${total} need${total === 1 ? 's' : ''} you today`
      : `*Recruitment Follow Ups* | nothing owed, ${closedOut.length} closed out`

  await postToSlack(
    header +
      section('They said yes and it has gone quiet', warmButQuiet) +
      section('Send a follow up', dueNow) +
      section('Revisit is due', revisits) +
      section('Closed out after no reply', closedOut) +
      `\n\n${RECRUITMENT_TAB_URL}`
  )
}

/** The research job itself failed. Silence is what broke this the first time. */
export async function recruitmentResearchFailed(reason: string) {
  await postToSlack(
    `*Recruitment Research Failed* | no candidates were produced this run\n` +
      `Reason: ${reason}\n` +
      `The pipeline will be short this week unless someone nominates manually.\n${RECRUITMENT_TAB_URL}`,
    'rae'
  )
}

// -- Scheduled check-in notes --

/** A scheduled note came due but the creator should no longer be contacted. */
export async function scheduledNoteHeld(creatorName: string, reason: string) {
  await postToSlack(
    `*Scheduled Check-in Held* | ${creatorName}\nReason: ${reason}\nThe note was not sent and is back in the review queue.`
  )
}

/** The note published but the creator was never told. Needs a human. */
export async function scheduledNoteEmailFailed(creatorName: string, reason: string) {
  await postToSlack(
    `*Scheduled Check-in Email Failed* | ${creatorName}\nThe note is live in their portal but the email did not send: ${reason}\nReach out to them directly.`
  )
}
