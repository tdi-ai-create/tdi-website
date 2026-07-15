import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { invoiceCreated } from '@/lib/billing-slack'

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !isTDIAdmin(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { deliverable_ids } = await request.json()

  if (!deliverable_ids?.length) {
    return NextResponse.json({ error: 'deliverable_ids required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  // Fetch deliverables and validate
  const { data: deliverables, error: fetchErr } = await supabase
    .from('contract_deliverables')
    .select('*, quotes(id, quote_number, title, contact_name, contact_email, contact_organization, district_id, payment_instructions)')
    .in('id', deliverable_ids)

  if (fetchErr || !deliverables?.length) {
    return NextResponse.json({ error: fetchErr?.message || 'No deliverables found' }, { status: 400 })
  }

  // Validate all are delivered + not yet invoiced + not complimentary
  const invalid = deliverables.filter(
    (d: any) => d.delivery_status !== 'delivered' || d.invoice_id || d.is_complimentary
  )
  if (invalid.length > 0) {
    return NextResponse.json({
      error: `${invalid.length} deliverable(s) not eligible for invoicing (must be delivered, not yet invoiced, and not complimentary)`,
    }, { status: 400 })
  }

  // All deliverables should belong to the same quote
  const quoteIds = [...new Set(deliverables.map((d: any) => d.quote_id))]
  if (quoteIds.length > 1) {
    return NextResponse.json({ error: 'All deliverables must belong to the same contract' }, { status: 400 })
  }

  const quote = (deliverables[0] as any).quotes
  const districtId = quote.district_id

  // Generate invoice number
  const { data: lastInvoice } = await supabase
    .from('quote_invoices')
    .select('invoice_number')
    .like('invoice_number', 'TDI-INV-2026-%')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let nextSeq = 1
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/TDI-INV-2026-(\d+)/)
    if (match) nextSeq = parseInt(match[1]) + 1
  }
  const invoiceNumber = `TDI-INV-2026-${String(nextSeq).padStart(3, '0')}`

  // Build line items for invoice
  const lineItems = deliverables.map((d: any) => ({
    label: d.label,
    service_type: d.service_type,
    quantity: d.quantity,
    unit_price: Number(d.unit_price),
    total: Number(d.total_amount),
    delivery_date: d.delivery_date,
    deliverable_id: d.id,
  }))

  const totalAmount = lineItems.reduce((s: number, li: any) => s + li.total, 0)

  // Create invoice
  const { data: invoice, error: invoiceErr } = await supabase
    .from('quote_invoices')
    .insert({
      quote_id: quoteIds[0],
      district_id: districtId,
      invoice_number: invoiceNumber,
      title: `Invoice for ${quote.contact_organization || quote.title}`,
      line_items: lineItems,
      amount: totalAmount,
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'draft',
    })
    .select()
    .single()

  if (invoiceErr) {
    return NextResponse.json({ error: invoiceErr.message }, { status: 500 })
  }

  // Update deliverables with invoice link
  const now = new Date().toISOString()
  await supabase
    .from('contract_deliverables')
    .update({
      delivery_status: 'invoiced',
      invoice_id: invoice.id,
      invoice_type: 'quote_invoice',
      invoiced_at: now,
      updated_at: now,
    })
    .in('id', deliverable_ids)

  // Slack notification
  invoiceCreated(invoiceNumber, quote.contact_organization || quote.title, totalAmount, lineItems.length).catch(() => {})

  return NextResponse.json({
    success: true,
    invoice: {
      id: invoice.id,
      invoice_number: invoiceNumber,
      amount: totalAmount,
      line_items: lineItems.length,
      contact: quote.contact_name,
      organization: quote.contact_organization,
    },
    message: `Invoice ${invoiceNumber} created for $${totalAmount.toLocaleString()} (${lineItems.length} services)`,
  })
}
