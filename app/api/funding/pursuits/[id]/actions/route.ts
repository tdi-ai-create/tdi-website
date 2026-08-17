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

/**
 * What an answer means for the work. Fixed set, because "what happens next" is
 * a decision with consequences and free text would let it be dodged.
 *
 *   proceed        the path continues
 *   stop_path      this path is not viable, close it
 *   still_blocked  answered, but it does not unblock us yet
 */
const VALID_OUTCOMES = ['proceed', 'stop_path', 'still_blocked']

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
    'client_label', 'cancel_reason', 'action_size', 'notes', 'link',
    // Decision record. See the completion guard below for why these exist.
    'requires_answer', 'answer', 'answered_by', 'answered_at', 'outcome',
  ]
  fields.forEach(f => {
    const camelKey = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    if (body[camelKey] !== undefined) updates[f] = body[camelKey]
    if (body[f] !== undefined) updates[f] = body[f]
  })

  // Handle completion
  if (body.status === 'done' || body.markDone) {
    // A question cannot close without an answer.
    //
    // "Ask Paula Poche if the school has an NEA member teacher" was created on
    // 21 July and marked done on 27 July, with one note reading "Nudge sent to
    // bella@teachersdeserveit.com". No answer was ever recorded, so the record
    // read resolved while the question was still open. Nobody noticed for three
    // weeks, and by then the same unanswered question had stalled a second
    // school.
    //
    // Marking done meant "somebody clicked done", never "we learned something".
    // A green tick and an unanswered question looked identical.
    //
    // Only items flagged requires_answer are held to this. A contract signature
    // is a task, where doing it is the whole story. A question is different:
    // doing it tells you nothing, the reply does.
    const { data: existing } = await supabase
      .from('funding_action_items')
      .select('requires_answer, answer, outcome, title, notes')
      .eq('id', body.actionId)
      .single()

    if (existing?.requires_answer) {
      const answer = (updates.answer ?? existing.answer) as string | null
      const outcome = (updates.outcome ?? existing.outcome) as string | null

      // No step can be skipped, but every step can be overridden with a reason
      // that is recorded.
      //
      // A gate that can never be passed is a trap. A gate that can be passed
      // silently is decoration. A gate that can be passed on the record is a
      // rule, and that is the only one of the three worth having.
      //
      // Without this, a question the school will never answer — a contact who
      // has left, a programme that closed, a query overtaken by events — would
      // sit open forever with no way to close it honestly. The override says
      // out loud that we closed it without an answer, and why.
      const skipReason = (body.closeWithoutAnswer ?? '').toString().trim()
      if (skipReason) {
        updates.answer = null
        updates.outcome = 'still_blocked'
        updates.answered_by = actorEmail
        updates.answered_at = new Date().toISOString()
        updates.notes = [
          existing.notes,
          `[closed without an answer by ${actorEmail}] ${skipReason}`,
        ].filter(Boolean).join('\n')
      } else if (!answer || !String(answer).trim()) {
        return NextResponse.json({
          error: `"${existing.title}" is a question. Record what you were told before closing it.`,
          requires: { field: 'answer', label: 'What did they say?' },
          // Stated in the response itself, so nobody has to hunt for the way out.
          override: {
            field: 'closeWithoutAnswer',
            label: 'Or close it without an answer, and say why',
            note: 'Recorded on the item. Use when an answer is never coming.',
          },
        }, { status: 400 })
      }
      if (!outcome || !VALID_OUTCOMES.includes(String(outcome))) {
        return NextResponse.json({
          error: `"${existing.title}" needs to say what the answer means before closing.`,
          requires: {
            field: 'outcome',
            label: 'What does this mean for the work?',
            options: VALID_OUTCOMES,
          },
        }, { status: 400 })
      }

      // Stamp who answered, if the caller supplied an answer without saying.
      if (updates.answer !== undefined && !updates.answered_by) {
        updates.answered_by = actorEmail
        updates.answered_at = new Date().toISOString()
      }
    }

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
