/**
 * Slack notifications for contracts and invoicing.
 * Reuses the same webhook from funding_notification_settings.
 */

import { createClient } from '@supabase/supabase-js'

const LOG = '[billing-slack]'

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
    .select('slack_enabled, billing_webhook_url')
    .limit(1)
    .single()
  return { url: data?.billing_webhook_url || null, enabled: data?.slack_enabled || false }
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

// ── Contract Events ──

export async function contractDrafted(quoteNumber: string, org: string, amount: number) {
  await postToSlack(
    `*Contract Drafted* — ${quoteNumber}\n${org} | $${amount.toLocaleString()}\nReady for review and sending.`
  )
}

export async function contractSent(quoteNumber: string, org: string, contactEmail: string) {
  await postToSlack(
    `*Contract Sent* — ${quoteNumber}\n${org} | Sent to ${contactEmail}\nWaiting for client to review and sign.`
  )
}

export async function contractViewed(quoteNumber: string, org: string, viewCount: number) {
  await postToSlack(
    `*Contract Viewed* — ${quoteNumber}\n${org} | View #${viewCount}\nClient is reviewing the agreement.`
  )
}

export async function contractSigned(
  quoteNumber: string,
  org: string,
  signedBy: string,
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
    `*Contract Signed* -- ${quoteNumber}`,
    `${org} | Signed by ${signedBy} | $${amount.toLocaleString()}`,
    'Deliverables created. Ready for onboarding.',
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

// ── Invoice Events ──

export async function invoiceCreated(invoiceNumber: string, org: string, amount: number, serviceCount: number) {
  await postToSlack(
    `*Invoice Created* — ${invoiceNumber}\n${org} | $${amount.toLocaleString()} | ${serviceCount} service${serviceCount > 1 ? 's' : ''}`
  )
}

export async function invoiceSent(invoiceNumber: string, org: string, amount: number, sentTo: string) {
  await postToSlack(
    `*Invoice Sent* — ${invoiceNumber}\n${org} | $${amount.toLocaleString()} | Sent to ${sentTo}`
  )
}

export async function invoicePaid(invoiceNumber: string, org: string, amount: number) {
  await postToSlack(
    `*Invoice Paid* — ${invoiceNumber}\n${org} | $${amount.toLocaleString()}\nPayment received.`
  )
}

// ── Delivery Events ──

export async function serviceDelivered(partnershipSlug: string, org: string, serviceLabel: string, deliveredBy: string) {
  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'
  await postToSlack(
    `*Service Delivered* — ${serviceLabel}\n${org} | Delivered by ${deliveredBy.split('@')[0]}\n<${portalUrl}/tdi-admin/leadership/${partnershipSlug}|View partnership>`
  )
}

// ── Grant Events ──

export async function grantUnlockedServices(pursuitName: string, count: number) {
  await postToSlack(
    `*Grant Confirmed* — ${pursuitName}\n${count} service${count > 1 ? 's' : ''} unlocked for delivery and invoicing.`
  )
}

export async function billingContactChanged(
  org: string,
  previous: { name: string | null; email: string | null },
  next: { name: string | null; email: string | null },
  changedBy: 'school' | 'tdi' | 'onboarding'
) {
  const who = changedBy === 'school' ? 'The school updated' : 'Updated';
  await postToSlack(
    `${who} the billing contact for *${org}*.\n` +
    `Was: ${previous.name || 'not set'} ${previous.email ? `<${previous.email}>` : ''}\n` +
    `Now: ${next.name || 'not set'} ${next.email ? `<${next.email}>` : ''}\n` +
    `Invoices and payment reminders will go to the new address from here.`
  );
}
