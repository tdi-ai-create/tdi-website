import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { isTDIAdmin } from '@/lib/is-tdi-admin'
import { invoicePaid } from '@/lib/billing-slack'
import { asPaid } from '@/lib/billing/state'

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !(await isTDIAdmin(email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { invoice_id, payment_date, payment_method, check_number, notes } = await request.json()
  if (!invoice_id) {
    return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // 1. Get the invoice
  const { data: invoice } = await supabase
    .from('quote_invoices')
    .select('*, quotes(quote_number, contact_organization)')
    .eq('id', invoice_id)
    .single()

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  // 2. Mark invoice as paid, recording HOW it was paid.
  //
  // Bella reported on 2026-08-18 that this "records as paid but doesnt save the check
  // number". She was right. All four payment fields were destructured above and then
  // dropped, because quote_invoices had no columns for them. The columns were added on
  // 2026-08-25. payment_events was not an option here: its invoice_id foreign key
  // points at intelligence_invoices, which is a different invoice system.
  //
  // The error was also being discarded, so a failed write reported success.
  const { error: invoiceError } = await supabase
    .from('quote_invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_method: payment_method?.trim() || null,
      check_number: check_number?.trim() || null,
      payment_date: payment_date || null,
      payment_notes: notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoice_id)

  if (invoiceError) {
    console.error('[mark-paid] Invoice not marked paid, nothing was changed:', invoiceError)
    return NextResponse.json(
      { error: `The invoice was not marked paid, so nothing was changed. ${invoiceError.message}` },
      { status: 500 }
    )
  }

  // 3. Flip all linked deliverables to paid
  const { data: updated, error: deliverablesError } = await supabase
    .from('contract_deliverables')
    .update({
      ...asPaid(),
      updated_at: new Date().toISOString(),
    })
    .eq('invoice_id', invoice_id)
    .select('quote_id')

  if (deliverablesError) {
    console.error('[mark-paid] Invoice is paid but deliverables did not flip:', deliverablesError)
    return NextResponse.json(
      {
        error:
          `The invoice was marked paid, but its deliverables were not updated. ` +
          `They will still show as unpaid. ${deliverablesError.message}`,
      },
      { status: 500 }
    )
  }

  // 4. Update sales_opportunity payment_received if all deliverables for that quote are paid
  if (updated?.length) {
    const quoteId = updated[0].quote_id
    const { data: remaining } = await supabase
      .from('contract_deliverables')
      .select('id')
      .eq('quote_id', quoteId)
      .neq('billing_state', 'paid')
      .neq('delivery_state', 'cancelled')
      .eq('is_complimentary', false)

    // If no unpaid billable deliverables remain, mark opportunity as paid
    if (!remaining?.length) {
      // Find sales opportunity linked to this district
      const { data: quote } = await supabase
        .from('quotes')
        .select('district_id')
        .eq('id', quoteId)
        .single()

      if (quote?.district_id) {
        // Not fatal. The invoice and its deliverables are already paid and correct;
        // this only mirrors that onto the opportunity. Log it rather than failing the
        // request, but never let it fail in silence, because a missing
        // payment_received is invisible until someone chases a school that has paid.
        const { error: opportunityError } = await supabase
          .from('sales_opportunities')
          .update({
            payment_received: true,
            payment_received_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('district_id', quote.district_id)
          .eq('stage', 'signed')

        if (opportunityError) {
          console.error(
            `[mark-paid] Invoice ${invoice_id} is paid but sales_opportunities was not ` +
            `updated for district ${quote.district_id}. It will still read as unpaid in the CRM:`,
            opportunityError
          )
        }
      }
    }
  }

  // 5. Slack notification
  const org = (invoice as any).quotes?.contact_organization || ''
  invoicePaid(invoice.invoice_number, org, Number(invoice.amount)).catch(() => {})

  // 6. Send payment confirmation email to school contact
  const quoteForEmail = invoice.quote_id
    ? (await supabase.from('quotes').select('contact_email, contact_name, contact_organization, quote_number').eq('id', invoice.quote_id).single()).data
    : null

  if (quoteForEmail?.contact_email) {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Teachers Deserve It <noreply@teachersdeserveit.com>',
          to: [quoteForEmail.contact_email],
          subject: `Payment Received - ${quoteForEmail.contact_organization || 'Your Partnership'}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
              <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height: 40px; margin-bottom: 24px;" />
              <h2 style="color: #111827; margin: 0 0 12px;">Payment received. Thank you!</h2>
              <p style="color: #4b5563; margin: 0 0 16px;">
                Hi ${(quoteForEmail.contact_name || '').split(' ')[0] || 'there'},
              </p>
              <p style="color: #4b5563; margin: 0 0 16px;">
                We have received your payment for invoice <strong>${invoice.invoice_number}</strong>. Your account is up to date.
              </p>
              <p style="color: #4b5563; margin: 0 0 16px;">
                Thank you for your partnership with Teachers Deserve It. We are grateful to be working with ${quoteForEmail.contact_organization || 'your team'}.
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0;">
                Questions about billing? Contact <a href="mailto:Billing@Teachersdeserveit.com" style="color: #d97706;">Billing@Teachersdeserveit.com</a>
              </p>
            </div>`,
        }),
      }).catch(err => console.error('[mark-paid] Payment confirmation email failed:', err))
    }
  }

  return NextResponse.json({
    success: true,
    message: `Invoice ${invoice.invoice_number} marked as paid. ${updated?.length || 0} deliverables updated.`,
  })
}
