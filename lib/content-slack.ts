/**
 * Slack notifications for the Content Queue.
 *
 * Reads its webhook out of funding_notification_settings, which is how partner,
 * billing, sales, creator and funding alerts all work. The content queue used to
 * read SLACK_WEBHOOK_KRISTIN and SLACK_WEBHOOK_RAE from the environment. Neither
 * has ever been set in Vercel, so every notification it wrote returned
 * attempted: false. It was the only sender using environment variables and the
 * only one that never fired.
 *
 * Follows the same shape as partner-slack.ts, with one difference: this reports
 * what happened instead of logging and returning nothing. The caller writes the
 * outcome into the item's feedback_log, so an alert nobody received is a fact on
 * the record rather than a silence.
 */

import { createClient } from '@supabase/supabase-js'

const LOG = '[content-slack]'

/** Which of the two content webhooks to use. */
export type ContentAlert = 'approval' | 'publish'

const COLUMN: Record<ContentAlert, string> = {
  approval: 'content_approval_webhook_url',
  publish: 'content_publish_webhook_url',
}

const WHO: Record<ContentAlert, string> = {
  approval: 'the approver',
  publish: 'whoever publishes it',
}

export type AlertResult = { attempted: boolean; reason: string }

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getWebhook(which: ContentAlert): Promise<{ url: string | null; enabled: boolean; error: string | null }> {
  // Both columns are selected with a literal string rather than interpolating
  // the one we want. Supabase types the select at compile time by parsing the
  // string, and a template literal it cannot read turns the whole row into a
  // parser error type.
  const { data, error } = await db()
    .from('funding_notification_settings')
    .select('slack_enabled, content_approval_webhook_url, content_publish_webhook_url')
    .limit(1)
    .single()

  // A read that failed is not the same as a webhook that is not configured, and
  // saying so is the difference between "nobody set this up" and "the lookup
  // broke". Both end in nobody being told; only one of them is a bug.
  if (error) return { url: null, enabled: false, error: error.message }

  const row = data as unknown as Record<string, unknown> | null
  const raw = row?.[COLUMN[which]]
  const url = typeof raw === 'string' && raw.trim() ? raw.trim() : null
  return { url, enabled: Boolean(row?.slack_enabled), error: null }
}

/**
 * Post a content queue alert. Never throws: a notification failing must not
 * fail the transition that triggered it.
 */
export async function postContentAlert(which: ContentAlert, text: string): Promise<AlertResult> {
  let url: string | null
  let enabled: boolean
  let error: string | null
  try {
    ({ url, enabled, error } = await getWebhook(which))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(LOG, 'could not read notification settings:', message)
    return { attempted: false, reason: `could not read notification settings, so ${WHO[which]} was not told: ${message}` }
  }

  if (error) {
    console.error(LOG, 'could not read notification settings:', error)
    return { attempted: false, reason: `could not read notification settings, so ${WHO[which]} was not told: ${error}` }
  }
  if (!enabled) {
    return { attempted: false, reason: `Slack notifications are switched off in settings, so ${WHO[which]} was not told` }
  }
  if (!url) {
    return { attempted: false, reason: `no ${COLUMN[which]} is set in admin settings, so ${WHO[which]} was not told` }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      console.error(LOG, 'Slack rejected the post:', res.status)
      return { attempted: false, reason: `Slack rejected the message with ${res.status}, so ${WHO[which]} was not told` }
    }
    return { attempted: true, reason: `told ${WHO[which]} on Slack` }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(LOG, 'Slack post failed:', message)
    return { attempted: false, reason: `the Slack post failed, so ${WHO[which]} was not told: ${message}` }
  }
}
