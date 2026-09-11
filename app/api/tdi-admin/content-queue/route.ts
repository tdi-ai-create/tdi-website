import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { approverFor, approverRefusal } from '@/lib/content-queue/approver'

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

/**
 * Approve, or send it back.
 *
 * This does not reimplement the rules. It authenticates the person, decides
 * which approver they are, and calls the same endpoint every agent calls, so
 * there is exactly one path through the state machine and one audit trail. A
 * second implementation here is how the two would drift.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  // Shape first, identity second.
  //
  // The other order reads more naturally and is how this was first written, but
  // it means the identity refusal answers every malformed request too, so the
  // validation below can never be observed failing and could rot unnoticed. That
  // masking has hidden three separate bugs in this system already. The caller is
  // an authenticated team member either way, so telling them their request is
  // malformed leaks nothing.
  const body = await request.json().catch(() => ({}))
  const { id, action, note } = body as { id?: string; action?: string; note?: string }

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  if (action !== 'approve' && action !== 'request_changes') {
    return NextResponse.json({ error: 'action must be approve or request_changes' }, { status: 400 })
  }
  if (action === 'request_changes' && !note?.trim()) {
    return NextResponse.json({ error: 'Say what needs to change. A refusal with no note is not feedback.' }, { status: 400 })
  }

  const actor = approverFor(auth.member.email)
  if (!actor) {
    return NextResponse.json({ error: approverRefusal(auth.member.email) }, { status: 403 })
  }

  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) {
    return NextResponse.json({ error: 'PAPERCLIP_SYNC_KEY is not configured, so this cannot reach the queue.' }, { status: 500 })
  }

  const res = await fetch(`${request.nextUrl.origin}/api/content-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${syncKey}` },
    body: JSON.stringify({ id, action, actor, note: note ?? null }),
  })
  const json = await res.json().catch(() => ({ error: 'The queue returned something unreadable.' }))
  return NextResponse.json(json, { status: res.status })
}
