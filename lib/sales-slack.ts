/**
 * Slack notifications for the Sales system.
 * Posts events to the #sales channel via sales_webhook_url.
 * Follows the same pattern as billing-slack.ts.
 */

import { createClient } from '@supabase/supabase-js'

const LOG = '[sales-slack]'

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
    .select('slack_enabled, sales_webhook_url')
    .limit(1)
    .single()
  return { url: data?.sales_webhook_url || null, enabled: data?.slack_enabled || false }
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

// -- Sales Events --

export async function newPDPlanRequest(contactName: string, org: string, email: string, audience: string, scope: string) {
  await postToSlack(
    `*New PD Plan Request* -- ${contactName}\n${org} | ${email}\nAudience: ${audience} | Scope: ${scope}`
  )
}

export async function leadStageChanged(contactName: string, org: string, fromStage: string, toStage: string) {
  await postToSlack(
    `*Lead Stage Changed* -- ${contactName}\n${org} | ${fromStage} -> ${toStage}`
  )
}

export async function quoteViewed(contactName: string, org: string, quoteTitle: string) {
  await postToSlack(
    `*Quote Viewed* -- ${contactName}\n${org} | ${quoteTitle}\nClient is reviewing the quote.`
  )
}

export async function quoteSigned(
  contactName: string,
  org: string,
  quoteTitle: string,
  amount: number,
  details?: {
    partnershipStatus?: 'new' | 'matched';
    observations?: number;
    virtuals?: number;
    executives?: number;
    hubSeats?: number;
    grantSupported?: boolean;
    partnershipSlug?: string;
  }
) {
  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'
  const lines: string[] = [
    `*Quote Signed* -- ${contactName}`,
    `${org} | ${quoteTitle} | $${amount.toLocaleString()}`,
  ]
  if (details) {
    if (details.partnershipStatus === 'new') {
      lines.push('New partnership created.')
    } else if (details.partnershipStatus === 'matched') {
      lines.push('Matched to existing partnership.')
    }
    const sessions: string[] = []
    if (details.observations) sessions.push(`${details.observations} observation${details.observations !== 1 ? 's' : ''}`)
    if (details.virtuals) sessions.push(`${details.virtuals} virtual${details.virtuals !== 1 ? 's' : ''}`)
    if (details.executives) sessions.push(`${details.executives} executive session${details.executives !== 1 ? 's' : ''}`)
    if (details.hubSeats) sessions.push(`${details.hubSeats} Hub seat${details.hubSeats !== 1 ? 's' : ''}`)
    if (sessions.length > 0) lines.push(sessions.join(' | '))
    if (details.grantSupported) lines.push('Grant funding pursuit created.')
    if (details.partnershipSlug) lines.push(`<${portalUrl}/tdi-admin/leadership/${details.partnershipSlug}|View partnership>`)
  }
  await postToSlack(lines.join('\n'))
}

export async function quoteExpired(contactName: string, org: string, quoteTitle: string) {
  await postToSlack(
    `*Quote Expired* -- ${contactName}\n${org} | ${quoteTitle}\nQuote expired without signature.`
  )
}

export async function leadGoneCold(contactName: string, org: string, daysSinceActivity: number) {
  await postToSlack(
    `*Lead Gone Cold* -- ${contactName}\n${org} | ${daysSinceActivity} days with no activity`
  )
}

export async function emailBounced(contactName: string, email: string, reason: string) {
  await postToSlack(
    `*Email Bounced* -- ${contactName}\n${email} | ${reason}`
  )
}

export async function quoteDrafted(quoteNumber: string, org: string, title: string, amount: number) {
  await postToSlack(
    `*Quote Drafted* -- ${quoteNumber}\n${org} | ${title} | $${amount.toLocaleString()}\nReady for review and sending.`
  )
}

export async function quoteSent(quoteNumber: string, org: string, contactName: string, amount: number) {
  await postToSlack(
    `*Quote Sent* -- ${quoteNumber}\n${org} | Sent to ${contactName} | $${amount.toLocaleString()}\nWaiting for signature.`
  )
}
