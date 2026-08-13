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

async function getWebhook(): Promise<{ url: string | null; enabled: boolean }> {
  const { data } = await db()
    .from('funding_notification_settings')
    .select('slack_enabled, creator_webhook_url')
    .limit(1)
    .single()
  return { url: data?.creator_webhook_url || null, enabled: data?.slack_enabled || false }
}

async function postToSlack(text: string) {
  const { url, enabled } = await getWebhook()
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

// Creator Studio Events

export async function creatorSubmittedDeliverable(creatorName: string, milestoneName: string, submissionVersion: number) {
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
