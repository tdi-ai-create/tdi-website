import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { postFundingEvent, allocationEvent } from '@/lib/funding-slack'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET — list allocations for a pursuit or opportunity
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const url = request.nextUrl
  const pursuitId = url.searchParams.get('pursuitId')
  const opportunityId = url.searchParams.get('opportunityId')

  const supabase = db()

  let query = supabase.from('award_allocations').select('*').order('allocated_at', { ascending: true })
  if (opportunityId) query = query.eq('funding_opportunity_id', opportunityId)
  else if (pursuitId) query = query.eq('pursuit_id', pursuitId)
  else return NextResponse.json({ error: 'pursuitId or opportunityId required' }, { status: 400 })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ allocations: data || [] })
}

// POST — create a new allocation
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const supabase = db()

  const { data, error } = await supabase
    .from('award_allocations')
    .insert({
      pursuit_id: body.pursuitId,
      funding_opportunity_id: body.opportunityId,
      quote_package_id: body.quotePackageId || null,
      line_item_key: body.lineItemKey,
      allocated_amount: body.allocatedAmount,
      allocated_by: body.allocatedBy || 'rae+client',
      line_item_status: 'allocated',
      allocated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Slack narration
  const { data: pursuit } = await supabase.from('funding_pursuits').select('pursuit_name').eq('id', body.pursuitId).single()
  postFundingEvent(allocationEvent(body.pursuitId, pursuit?.pursuit_name || 'Unknown', body.lineItemKey, body.allocatedAmount, 'allocated')).catch(() => {})

  return NextResponse.json({ success: true, allocation: data })
}

// PATCH — update an allocation (handoff, status change)
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = db()
  const updates: Record<string, unknown> = {}

  if (body.line_item_status) updates.line_item_status = body.line_item_status
  if (body.handToTrainer) {
    updates.handed_to_trainer_at = new Date().toISOString()
    updates.line_item_status = 'delivered'
  }
  if (body.handToFinance) {
    updates.handed_to_finance_at = new Date().toISOString()
    updates.line_item_status = 'invoiced'
  }

  const { error } = await supabase
    .from('award_allocations')
    .update(updates)
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Slack narration for handoffs
  if (body.handToTrainer || body.handToFinance) {
    const { data: alloc } = await supabase.from('award_allocations').select('pursuit_id, line_item_key, allocated_amount').eq('id', body.id).single()
    if (alloc) {
      const { data: pursuit } = await supabase.from('funding_pursuits').select('pursuit_name').eq('id', alloc.pursuit_id).single()
      postFundingEvent(allocationEvent(alloc.pursuit_id, pursuit?.pursuit_name || 'Unknown', alloc.line_item_key, alloc.allocated_amount, body.handToTrainer ? 'delivered' : 'invoiced')).catch(() => {})
    }
  }

  return NextResponse.json({ success: true })
}

// DELETE — remove an allocation
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = db()
  const { error } = await supabase.from('award_allocations').delete().eq('id', body.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
