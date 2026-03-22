import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    return NextResponse.json({
      success: true,
      paymentEvent
    })
  } catch (error) {
    console.error('[Invoices API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
