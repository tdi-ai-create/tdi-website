import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  TRANSITIONS, OWNER_OF, actorHoldsRole, isSelfReview, legalFrom,
  type Action, type Status,
} from '@/lib/content-queue/workflow'

/**
 * The Content Queue API.
 *
 * Modelled deliberately on /api/hub/content-sync, which Paperclip agents already
 * call every day: same bearer token, same action verbs, same error shape. There
 * is nothing new for an agent to learn, which is most of why this is not a
 * Paperclip plugin.
 *
 * Every write appends to feedback_log in the same statement as the status change.
 * That is not bookkeeping, it is what the database's approval gate detects: a
 * direct write sets status alone and gets refused.
 *
 * ?dryRun=1 on any action reports the decision and writes nothing.
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY, the same one content-sync uses.
 */

export const maxDuration = 60

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function authorize(request: NextRequest): boolean {
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) return false
  return request.headers.get('authorization') === `Bearer ${syncKey}`
}

type Row = {
  id: string
  title: string | null
  status: Status
  body: string | null
  owner: string | null
  approver: string | null
  approved_at: string | null
  artifact_rendered_at: string | null
  feedback_log: unknown[]
  created_by?: string | null
}

/**
 * Who wrote the current draft.
 *
 * NOT the first log entry. That is the brief, whose actor is the orchestrator
 * who placed it, so reading it there made the self-review guard compare the
 * wrong two names and let a writer pass a gate on their own work. Caught on
 * 8 September 2026 only because the guard was actually exercised rather than
 * assumed, by temporarily granting the writer a gate role.
 *
 * The writer is whoever last submitted, or last picked it up if it has been
 * sent back and not yet resubmitted.
 */
function authorOf(row: { feedback_log: unknown[] }): string | null {
  const log = (row.feedback_log ?? []) as Array<Record<string, unknown>>
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i]
    if ((e.action === 'submit' || e.action === 'pick_up') && typeof e.actor === 'string') {
      return e.actor
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = db()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const owner = searchParams.get('owner')

  let q = supabase.from('content_queue_items')
    .select('id, channel, content_type, title, status, owner, approver, audience_tag, scheduled_for, artifact_rendered_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(200)
  if (status) q = q.eq('status', status)
  if (owner) q = q.eq('owner', owner)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // An empty result is only a measured zero because the query ran, so the filter
  // used is reported back. Three filters silently failed to filter this week.
  return NextResponse.json({
    count: data?.length ?? 0,
    filter: { status: status ?? '(any)', owner: owner ?? '(any)' },
    items: data ?? [],
  })
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'

  try {
    const body = await request.json()
    const action = body.action as Action
    const actor = String(body.actor ?? '').trim().toLowerCase()
    const note = typeof body.note === 'string' ? body.note.trim() : ''
    const supabase = db()

    if (!action || !TRANSITIONS[action]) {
      return NextResponse.json(
        { error: `Unknown action "${action}". Known: ${Object.keys(TRANSITIONS).join(', ')}` },
        { status: 400 })
    }
    if (!actor) return NextResponse.json({ error: 'actor is required, so the log names who did this' }, { status: 400 })

    const rule = TRANSITIONS[action]

    // ── placing a brief creates the row ──
    if (action === 'place_brief') {
      const { channel, content_type, title, brief, audience_tag, approver } = body
      for (const [k, v] of Object.entries({ channel, content_type, audience_tag })) {
        if (!v || !String(v).trim()) {
          return NextResponse.json({ error: `${k} is required` }, { status: 400 })
        }
      }
      if (!actorHoldsRole(actor, rule.role)) {
        return NextResponse.json({ error: `"${actor}" cannot place a brief. That is the orchestrator's step.` }, { status: 403 })
      }
      const entry = { at: new Date().toISOString(), actor, action, to: 'brief', note: note || null }
      if (dryRun) return NextResponse.json({ dryRun: true, wouldCreate: { channel, content_type, title, audience_tag, status: 'brief' }, logEntry: entry })

      const { data, error } = await supabase.from('content_queue_items').insert({
        channel, content_type, title: title ?? null, brief: brief ?? null,
        audience_tag, approver: approver ?? null,
        status: 'brief', owner: OWNER_OF.brief, feedback_log: [entry],
      }).select('id, status, owner').single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true, ...data })
    }

    // ── everything else moves an existing row ──
    const id = body.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data: row, error: readErr } = await supabase
      .from('content_queue_items')
      .select('id, title, status, body, owner, approver, approved_at, artifact_rendered_at, feedback_log')
      .eq('id', id).single()

    if (readErr || !row) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    const item = row as Row

    if (!legalFrom(action, item.status)) {
      return NextResponse.json({
        error: `Cannot ${action} from "${item.status}". Legal from: ${rule.from.join(', ') || '(none)'}.`,
      }, { status: 409 })
    }
    if (!actorHoldsRole(actor, rule.role)) {
      return NextResponse.json({
        error: `"${actor}" does not hold the ${rule.role} role, so cannot ${action}.`,
      }, { status: 403 })
    }
    // The writer never passes a gate on their own work.
    const isGate = ['pass_qa', 'pass_creative', 'pass_editorial', 'approve'].includes(action)
    if (isGate && isSelfReview(actor, authorOf(item))) {
      return NextResponse.json({
        error: `"${actor}" wrote this, so cannot also ${action} it. Reviewing your own work is a second draft, not a review.`,
      }, { status: 403 })
    }
    if (rule.needsNote && !note) {
      return NextResponse.json({ error: `${action} requires a note saying why.` }, { status: 400 })
    }

    const entry = { at: new Date().toISOString(), actor, action, from: item.status, to: rule.to, note: note || null }
    const patch: Record<string, unknown> = {
      status: rule.to,
      owner: OWNER_OF[rule.to],
      feedback_log: [...(item.feedback_log ?? []), entry],
    }

    if (action === 'submit') patch.artifact_rendered_at = body.artifact_rendered_at ?? new Date().toISOString()
    if (action === 'pass_qa') patch.qa_spec_version = body.qa_spec_version ?? null
    if (action === 'approve') { patch.approved_by = actor; patch.approved_at = new Date().toISOString() }
    if (action === 'schedule') {
      if (!body.scheduled_for) return NextResponse.json({ error: 'scheduled_for is required, as YYYY-MM-DD' }, { status: 400 })
      patch.scheduled_for = body.scheduled_for
    }
    if (action === 'mark_published') { patch.published_at = new Date().toISOString(); patch.published_url = body.published_url ?? null }
    if (action === 'verify') { patch.verified_at = new Date().toISOString(); patch.verification_note = note || null }

    if (dryRun) {
      return NextResponse.json({
        dryRun: true, id, from: item.status, to: rule.to,
        owner: OWNER_OF[rule.to], logEntry: entry,
        note: 'Nothing was written. The database gates still apply on a real call.',
      })
    }

    const { error: writeErr } = await supabase.from('content_queue_items').update(patch).eq('id', id)
    if (writeErr) {
      // A gate refusing is a normal, expected answer, not a server fault.
      const refused = /Content queue:/.test(writeErr.message)
      return NextResponse.json({ success: false, refusedBy: refused ? 'database gate' : 'database', error: writeErr.message },
        { status: refused ? 422 : 500 })
    }

    return NextResponse.json({ success: true, id, from: item.status, to: rule.to, owner: OWNER_OF[rule.to] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
