import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

// GET: List deliverables with filtering
export async function GET(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !isTDIAdmin(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const partnershipId = searchParams.get('partnership_id')
  const quoteId = searchParams.get('quote_id')
  const status = searchParams.get('status')
  const fundingType = searchParams.get('funding_type')
  const invoiceReady = searchParams.get('invoice_ready')

  const supabase = getServiceSupabase()

  let query = supabase
    .from('contract_deliverables')
    .select(`
      *,
      quotes!inner(quote_number, title, contact_name, contact_email, contact_organization),
      partnerships(slug, contact_name)
    `)
    .order('created_at', { ascending: true })

  if (partnershipId) query = query.eq('partnership_id', partnershipId)
  if (quoteId) query = query.eq('quote_id', quoteId)
  if (status) query = query.eq('delivery_status', status)
  if (fundingType) query = query.eq('funding_type', fundingType)

  // Invoice-ready: delivered, not invoiced, not complimentary
  if (invoiceReady === 'true') {
    query = query
      .eq('delivery_status', 'delivered')
      .is('invoice_id', null)
      .eq('is_complimentary', false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deliverables: data })
}

// PATCH: Update deliverable status (manual overrides)
export async function PATCH(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !isTDIAdmin(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id, delivery_status, delivery_date, delivery_notes, delivered_by } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'deliverable id required' }, { status: 400 })
  }

  const supabase = getServiceSupabase()

  const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (delivery_status) updateFields.delivery_status = delivery_status
  if (delivery_date) updateFields.delivery_date = delivery_date
  if (delivery_notes !== undefined) updateFields.delivery_notes = delivery_notes
  if (delivered_by) updateFields.delivered_by = delivered_by

  const { data, error } = await supabase
    .from('contract_deliverables')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deliverable: data })
}
