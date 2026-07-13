import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET -- list action items for a pursuit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const url = request.nextUrl
  const ownerType = url.searchParams.get('ownerType')
  const status = url.searchParams.get('status')
  const opportunityId = url.searchParams.get('opportunityId')

  const supabase = db()

  let query = supabase
    .from('funding_action_items')
    .select('*')
    .eq('pursuit_id', pursuitId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (ownerType) query = query.eq('owner_type', ownerType)
  if (status) query = query.eq('status', status)
  if (opportunityId) query = query.eq('opportunity_id', opportunityId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ actions: data || [] })
}

// POST -- create a new action item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const body = await request.json()

  const supabase = db()

  const { data, error } = await supabase
    .from('funding_action_items')
    .insert({
      pursuit_id: pursuitId,
      opportunity_id: body.opportunityId || null,
      owner_type: body.ownerType || 'tdi',
      owner_email: body.ownerEmail || null,
      owner_name: body.ownerName || null,
      title: body.title,
      description: body.description || null,
      status: body.status || 'pending',
      due_date: body.dueDate || null,
      prepared_materials: body.preparedMaterials || null,
      prepared_document_url: body.preparedDocumentUrl || null,
      sort_order: body.sortOrder || 0,
      category: body.category || null,
      action_size: body.actionSize || 'standard',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, action: data })
}

// PATCH -- update an action item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  if (!body.actionId) return NextResponse.json({ error: 'actionId required' }, { status: 400 })

  const supabase = db()
  const actorEmail = auth.member?.email || auth.user?.email

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  const fields = [
    'title', 'description', 'status', 'due_date', 'owner_type', 'owner_email',
    'owner_name', 'prepared_materials', 'prepared_document_url', 'sort_order', 'category',
    'client_label', 'cancel_reason', 'action_size',
  ]
  fields.forEach(f => {
    const camelKey = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    if (body[camelKey] !== undefined) updates[f] = body[camelKey]
    if (body[f] !== undefined) updates[f] = body[f]
  })

  // Handle completion
  if (body.status === 'done' || body.markDone) {
    updates.status = 'done'
    updates.completed_at = new Date().toISOString()
    updates.completed_by = actorEmail
  }

  // Handle reopen
  if (body.reopen) {
    updates.status = 'pending'
    updates.completed_at = null
    updates.completed_by = null
  }

  // Handle cancel
  if (body.cancel) {
    updates.status = 'cancelled'
    updates.cancel_reason = body.cancelReason || body.cancel_reason || null
    updates.completed_at = new Date().toISOString()
    updates.completed_by = actorEmail
  }

  const { error } = await supabase
    .from('funding_action_items')
    .update(updates)
    .eq('id', body.actionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // When a client action is completed, update the linked opportunity's last_activity_at
  if (updates.status === 'done') {
    const { data: action } = await supabase
      .from('funding_action_items')
      .select('opportunity_id, owner_type')
      .eq('id', body.actionId)
      .single()

    if (action?.opportunity_id) {
      await supabase
        .from('funding_opportunities')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', action.opportunity_id)
    }
  }

  return NextResponse.json({ success: true })
}
