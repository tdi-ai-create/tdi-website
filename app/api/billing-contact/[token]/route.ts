import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { resolveBillingContact } from '@/lib/billing-contact'
import { billingContactChanged } from '@/lib/billing-slack'

/**
 * The no-login billing contact page.
 *
 * Deliberate limits, because a link that redirects invoices is a known fraud
 * pattern in K-12 and this one travels in email:
 *
 *  - It can change WHERE an invoice is sent. It exposes nothing about payment
 *    methods, bank details, or amounts, and it cannot see other schools.
 *  - It never reveals the previous email address, so a forwarded link does not
 *    leak a contact list.
 *  - Every change notifies the previous contact and #financials, so a change
 *    nobody meant is visible within minutes rather than at the next invoice.
 *  - The token is separate from invite_token, which grants account setup.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function clean(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t) return null
  return t.slice(0, max)
}

async function loadByToken(token: string) {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('partnerships')
    .select('id, org_name, contact_name, contact_email, primary_contact_name, primary_contact_email, billing_contact_name, billing_contact_email, billing_contact_title, billing_contact_source, billing_token')
    .eq('billing_token', token)
    .maybeSingle()
  return { supabase, partnership: data }
}

// GET - what the page needs to render. Intentionally minimal.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!token || token.length < 20) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { partnership } = await loadByToken(token)
  if (!partnership) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const current = resolveBillingContact(partnership)

  // Only ever echo back a billing contact the school set themselves. If we are
  // still falling back to the signer, we show nothing rather than exposing an
  // address to whoever holds the link.
  return NextResponse.json({
    orgName: partnership.org_name,
    hasBillingContact: !current.isFallback,
    billingContactName: current.isFallback ? null : current.name,
    billingContactTitle: current.isFallback ? null : current.title,
    relationshipContactFirstName:
      (partnership.primary_contact_name || partnership.contact_name || '').trim().split(/\s+/)[0] || null,
  })
}

// POST - set the billing contact.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  if (!token || token.length < 20) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { supabase, partnership } = await loadByToken(token)
  if (!partnership) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Could not read that request.' }, { status: 400 })
  }

  const name = clean(body.name, 120)
  const email = clean(body.email, 200)?.toLowerCase() ?? null
  const title = clean(body.title, 120)

  if (!name) {
    return NextResponse.json({ error: 'Please add a name.' }, { status: 400 })
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 })
  }

  const previous = resolveBillingContact(partnership)

  const { error } = await supabase
    .from('partnerships')
    .update({
      billing_contact_name: name,
      billing_contact_email: email,
      billing_contact_title: title,
      billing_contact_source: 'school',
      billing_contact_updated_at: new Date().toISOString(),
    })
    .eq('id', partnership.id)

  if (error) {
    console.error('[billing-contact] Update failed:', error)
    return NextResponse.json(
      { error: 'We could not save that. Please try again, or reply to your invoice email.' },
      { status: 500 }
    )
  }

  const org = partnership.org_name || 'a partner school'

  // Tell the previous contact, so a change nobody intended surfaces immediately.
  // Never block the response on it, and never leak the new address to them
  // beyond the name, since they may no longer be the right audience.
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && previous.email && previous.email.toLowerCase() !== email) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Teachers Deserve It <noreply@teachersdeserveit.com>',
        to: [previous.email],
        subject: `Billing contact updated for ${org}`,
        html: `
          <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height:40px;margin-bottom:24px;" />
            <p style="color:#4b5563;">Quick note so you are not surprised.</p>
            <p style="color:#4b5563;">Invoices for <strong>${org}</strong> will now go to <strong>${name}</strong> instead of you. Everything else still comes to you as before.</p>
            <p style="color:#4b5563;">If that was not expected, just reply to this email and we will put it back.</p>
            <p style="color:#6b7280;font-size:13px;margin-top:24px;">Teachers Deserve It &middot; <a href="mailto:Billing@teachersdeserveit.com" style="color:#B8860B;">Billing@teachersdeserveit.com</a></p>
          </div>`,
      }),
    }).catch(err => console.error('[billing-contact] Heads-up email failed:', err))
  }

  billingContactChanged(
    org,
    { name: previous.name, email: previous.email },
    { name, email },
    'school'
  ).catch(() => {})

  return NextResponse.json({ success: true, name, email })
}
