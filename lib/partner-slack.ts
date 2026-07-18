/**
 * Slack notifications for the Partner Health system.
 * Posts events to the #rae-actions channel via partner_webhook_url.
 * Follows the same pattern as billing-slack.ts.
 */

import { createClient } from '@supabase/supabase-js'

const LOG = '[partner-slack]'

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
    .select('slack_enabled, partner_webhook_url')
    .limit(1)
    .single()
  return { url: data?.partner_webhook_url || null, enabled: data?.slack_enabled || false }
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

// -- Partner Health Events --

export async function healthScoreDropped(schoolName: string, oldTier: string, newTier: string, score: number) {
  await postToSlack(
    `*Health Score Dropped* -- ${schoolName}\n${oldTier} -> ${newTier} | Score: ${score}\nNeeds attention.`
  )
}

export async function allDeliverablesComplete(schoolName: string, contractTitle: string) {
  await postToSlack(
    `*All Deliverables Complete* -- ${schoolName}\nContract: ${contractTitle}\nAll services delivered. Trigger renewal conversation.`
  )
}

export async function deliverableOverdue(schoolName: string, deliverableName: string, daysOverdue: number) {
  await postToSlack(
    `*Deliverable Overdue* -- ${schoolName}\n${deliverableName} | ${daysOverdue} days overdue`
  )
}

export async function partnerOnboarded(schoolName: string, contractValue: number) {
  await postToSlack(
    `*Partner Onboarded* -- ${schoolName}\nContract value: $${contractValue.toLocaleString()}`
  )
}
