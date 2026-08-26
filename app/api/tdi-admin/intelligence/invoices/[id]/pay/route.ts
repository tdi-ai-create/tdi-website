import { NextRequest, NextResponse } from 'next/server'
import { resolveBillingContact, greetingName, billingContactFooterHtml } from '@/lib/billing-contact'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { invoicePaid } from '@/lib/billing-slack'
import { asPaid } from '@/lib/billing/state'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// POST - Mark invoice as paid
//
// Order matters here. The payment record is written first, so that a failure
// leaves the invoice untouched rather than paid with the payment detail lost.
// The previous version flipped the invoice to paid, then failed on the insert,
// then returned early and never sent the school their confirmation email.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      amount_received,
      payment_date,
      payment_method,
      check_number,
      notes,
    } = body

    const parsedAmount = amount_received ? parseFloat(amount_received) : null

    // 1. Record the payment first. If this fails, nothing has changed yet.
    const summary = [
      parsedAmount !== null ? `Received $${parsedAmount.toLocaleString()}` : 'Payment received',
      payment_method ? `via ${payment_method}` : null,
      check_number ? `(Check #${check_number})` : null,
      notes ? `- ${notes}` : null,
    ].filter(Boolean).join(' ')

    const { data: paymentEvent, error: eventError } = await supabase
      .from('payment_events')
      .insert({
        invoice_id: id,
        event_type: 'paid',
        event_date: payment_date || new Date().toISOString().split('T')[0],
        summary,
        payment_method: payment_method || null,
        check_number: check_number?.trim() || null,
        amount_received: parsedAmount,
      })
      .select()
      .single()

    if (eventError) {
      console.error('[invoice-pay] Could not record payment, invoice left unchanged:', eventError)
      return NextResponse.json(
        { error: `Payment was not recorded, so the invoice was left unchanged. ${eventError.message}` },
        { status: 500 }
      )
    }

    // 2. Now flip the invoice, its deliverables, and the collections stage.
    const { error: invoiceError } = await supabase
      .from('intelligence_invoices')
      .update({ status: 'paid' })
      .eq('id', id)

    if (invoiceError) {
      console.error('[invoice-pay] Invoice update error:', invoiceError)
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    await supabase
      .from('contract_deliverables')
      .update({ ...asPaid(), updated_at: new Date().toISOString() })
      .eq('invoice_id', id)
      .eq('invoice_type', 'intelligence_invoice')

    const { error: workflowError } = await supabase
      .from('collections_workflow')
      .update({
        current_stage: 'paid',
        risk_flag: 'none'
      })
      .eq('invoice_id', id)

    if (workflowError) {
      console.error('[invoice-pay] Workflow update error:', workflowError)
    }

    // 3. Work out who to thank.
    //
    // intelligence_invoices holds no contact fields. The earlier version
    // selected recipient_email, recipient_name and school_name from it, none
    // of which exist, so the lookup always failed and no email ever sent.
    // The contact lives on the partnership, reached through the deliverable,
    // which is the same path send-invoice uses to mail the invoice out.
    const { data: invoiceRow } = await supabase
      .from('intelligence_invoices')
      .select('invoice_number, amount, sent_to, district_id')
      .eq('id', id)
      .single()

    const { data: deliverable } = await supabase
      .from('contract_deliverables')
      .select('partnership_id')
      .eq('invoice_id', id)
      .eq('invoice_type', 'intelligence_invoice')
      .limit(1)
      .maybeSingle()

    const { data: partnership } = deliverable?.partnership_id
      ? await supabase
          .from('partnerships')
          .select('org_name, contact_name, contact_email, primary_contact_name, primary_contact_email, billing_contact_name, billing_contact_email, billing_contact_title, billing_contact_source, billing_token')
          .eq('id', deliverable.partnership_id)
          .maybeSingle()
      : { data: null }

    const { data: district } = invoiceRow?.district_id
      ? await supabase
          .from('districts')
          .select('name')
          .eq('id', invoiceRow.district_id)
          .maybeSingle()
      : { data: null }

    // A receipt is a billing email, so it follows the billing contact like the
    // invoice and the reminders do. sent_to still wins, since that is who we
    // actually mailed this specific invoice to.
    const billing = resolveBillingContact(partnership)
    const recipientEmail = invoiceRow?.sent_to || billing.email
    const schoolName = partnership?.org_name || district?.name || 'your team'
    const firstName = greetingName(billing.name)
    const billingFooter = billingContactFooterHtml(partnership?.billing_token, billing.isFallback)

    // 4. Send the confirmation, and report whether it actually went.
    let emailSent = false
    let emailError: string | null = null

    if (!recipientEmail) {
      emailError = 'No contact email on the partnership for this invoice'
    } else if (!process.env.RESEND_API_KEY) {
      emailError = 'RESEND_API_KEY is not set in this environment'
    } else {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Teachers Deserve It <noreply@teachersdeserveit.com>',
            to: [recipientEmail],
            subject: `Payment Received - ${schoolName}`,
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
                <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height: 40px; margin-bottom: 24px;" />
                <h2 style="color: #111827; margin: 0 0 12px;">Payment received. Thank you!</h2>
                <p style="color: #4b5563; margin: 0 0 16px;">
                  Hi ${firstName},
                </p>
                <p style="color: #4b5563; margin: 0 0 16px;">
                  We have received your payment${invoiceRow?.invoice_number ? ` for invoice <strong>${invoiceRow.invoice_number}</strong>` : ''}. Your account is up to date.
                </p>
                <p style="color: #4b5563; margin: 0 0 16px;">
                  Thank you for your partnership with Teachers Deserve It. We are grateful to be working with ${schoolName}.
                </p>
                <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0;">
                  Questions about billing? Contact <a href="mailto:Billing@Teachersdeserveit.com" style="color: #d97706;">Billing@Teachersdeserveit.com</a>
                </p>
                ${billingFooter}
              </div>`,
          }),
        })
        if (res.ok) {
          emailSent = true
        } else {
          emailError = `Resend returned ${res.status}`
          console.error('[invoice-pay] Confirmation email rejected:', res.status, await res.text())
        }
      } catch (err) {
        emailError = 'Confirmation email request failed'
        console.error('[invoice-pay] Confirmation email failed:', err)
      }
    }

    // 5. Slack the financials channel.
    invoicePaid(
      invoiceRow?.invoice_number || id,
      schoolName,
      parsedAmount ?? Number(invoiceRow?.amount || 0)
    )

    return NextResponse.json({
      success: true,
      paymentEvent,
      emailSent,
      emailError,
      recipientEmail,
    })
  } catch (error) {
    console.error('[invoice-pay] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
