import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { invoicePaid } from '@/lib/billing-slack'

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

    // Update invoice status to paid
    const { error: invoiceError } = await supabase
      .from('intelligence_invoices')
      .update({ status: 'paid' })
      .eq('id', id)

    if (invoiceError) {
      console.error('[Invoices API] Update error:', invoiceError)
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Update any linked deliverables to paid
    await supabase
      .from('contract_deliverables')
      .update({ delivery_status: 'paid', updated_at: new Date().toISOString() })
      .eq('invoice_id', id)
      .eq('invoice_type', 'intelligence_invoice')

    // Update collections_workflow to paid stage
    const { error: workflowError } = await supabase
      .from('collections_workflow')
      .update({
        current_stage: 'paid',
        risk_flag: 'none'
      })
      .eq('invoice_id', id)

    if (workflowError) {
      console.error('[Invoices API] Workflow update error:', workflowError)
    }

    // Create payment_event record
    const summary = [
      `Received $${parseFloat(amount_received || '0').toLocaleString()}`,
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
        amount_received: amount_received ? parseFloat(amount_received) : null,
      })
      .select()
      .single()

    if (eventError) {
      console.error('[Invoices API] Event error:', eventError)
      return NextResponse.json({ error: eventError.message }, { status: 500 })
    }

    // Send payment confirmation email to school
    const { data: invoiceData } = await supabase
      .from('intelligence_invoices')
      .select('recipient_email, recipient_name, school_name, invoice_number, amount')
      .eq('id', id)
      .single()

    if (invoiceData?.recipient_email) {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Teachers Deserve It <noreply@teachersdeserveit.com>',
            to: [invoiceData.recipient_email],
            subject: `Payment Received - ${invoiceData.school_name || 'Your Partnership'}`,
            html: `
              <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
                <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height: 40px; margin-bottom: 24px;" />
                <h2 style="color: #111827; margin: 0 0 12px;">Payment received. Thank you!</h2>
                <p style="color: #4b5563; margin: 0 0 16px;">
                  Hi ${(invoiceData.recipient_name || '').split(' ')[0] || 'there'},
                </p>
                <p style="color: #4b5563; margin: 0 0 16px;">
                  We have received your payment${invoiceData.invoice_number ? ` for invoice <strong>${invoiceData.invoice_number}</strong>` : ''}. Your account is up to date.
                </p>
                <p style="color: #4b5563; margin: 0 0 16px;">
                  Thank you for your partnership with Teachers Deserve It. We are grateful to be working with ${invoiceData.school_name || 'your team'}.
                </p>
                <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0;">
                  Questions about billing? Contact <a href="mailto:Billing@Teachersdeserveit.com" style="color: #d97706;">Billing@Teachersdeserveit.com</a>
                </p>
              </div>`,
          }),
        }).catch(err => console.error('[invoice-pay] Payment confirmation email failed:', err))
      }
    }

    // Slack notification to #financials
    invoicePaid(
      invoiceData?.invoice_number || id,
      invoiceData?.school_name || 'Unknown school',
      amount_received ? parseFloat(amount_received) : Number(invoiceData?.amount || 0)
    )

    return NextResponse.json({
      success: true,
      paymentEvent
    })
  } catch (error) {
    console.error('[Invoices API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
