import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { approverFor } from '@/lib/content-queue/approver'

export const dynamic = 'force-dynamic'

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** What is waiting on a person, and the piece itself so they can read it. */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const id = request.nextUrl.searchParams.get('id')
  const supabase = db()

  if (id) {
    const { data, error } = await supabase
      .from('content_queue_items')
      .select('id, channel, content_type, title, body, status, owner, audience_tag, scheduled_for, artifact_refs, artifact_rendered_at, approved_by, approved_at, feedback_log, created_at')
      .eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    return NextResponse.json({ item: data, you: approverFor(auth.member.email) })
  }

  // Everything a person could act on, not only what is formally waiting. A piece
  // parked in a gate is worth seeing here too, because the alternative is a page
  // that looks empty while the queue is stuck.
  const { data, error } = await supabase
    .from('content_queue_items')
    .select('id, channel, content_type, title, status, owner, audience_tag, scheduled_for, updated_at')
    .in('status', ['pending_approval', 'approved', 'pending_qa', 'pending_creative', 'pending_editorial', 'changes_requested'])
    .order('updated_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items = data ?? []
  return NextResponse.json({
    you: approverFor(auth.member.email),
    waiting_on_you: items.filter(i => i.status === 'pending_approval').length,
    count: items.length,
    items,
  })
}

// There is deliberately no POST here.
//
// Approving used to live on this route. Rae's call on 11 September: the decision
// belongs on the Paperclip board, which already carries every other approval,
// already has four pending, and wakes the agent that raised one as soon as she
// answers. Two write paths to the same state would drift, and a second place to
// be asked is the thing she was objecting to. This route reads.
