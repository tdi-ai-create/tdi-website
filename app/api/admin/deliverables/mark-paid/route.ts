import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { invoicePaid } from '@/lib/billing-slack'

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !isTDIAdmin(email)) {
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

  // 2. Mark invoice as paid
  await supabase
    .from('quote_invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', invoice_id)

  // 3. Flip all linked deliverables to paid
  const { data: updated } = await supabase
    .from('contract_deliverables')
    .update({
      delivery_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('invoice_id', invoice_id)
    .select('quote_id')

  // 4. Update sales_opportunity payment_received if all deliverables for that quote are paid
  if (updated?.length) {
    const quoteId = updated[0].quote_id
    const { data: remaining } = await supabase
      .from('contract_deliverables')
      .select('id')
      .eq('quote_id', quoteId)
      .neq('delivery_status', 'paid')
      .neq('delivery_status', 'cancelled')
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
        await supabase
          .from('sales_opportunities')
          .update({
            payment_received: true,
            payment_received_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('district_id', quote.district_id)
          .eq('stage', 'signed')
      }
    }
  }

  // 5. Slack notification
  const org = (invoice as any).quotes?.contact_organization || ''
  invoicePaid(invoice.invoice_number, org, Number(invoice.amount)).catch(() => {})

  return NextResponse.json({
    success: true,
    message: `Invoice ${invoice.invoice_number} marked as paid. ${updated?.length || 0} deliverables updated.`,
  })
}
