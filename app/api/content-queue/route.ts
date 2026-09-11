import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyApproved, notifyWaiting } from '@/lib/content-queue/notify'
import { parseSlides, carouselProblems } from '@/lib/content-queue/carousel'
import {
  TRANSITIONS, OWNER_OF, actorHoldsRole, isSelfReview, legalFrom, canRequestChanges, canFlagBlocked,
  isTransition, hasContent, canRecordBoardDecision,
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
  channel: string
  status: Status
  body: string | null
  owner: string | null
  approver: string | null
  approved_at: string | null
  artifact_rendered_at: string | null
  artifact_refs: unknown
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

    const NON_TRANSITIONS = ['flag_blocked', 'record_board_decision']
    if (!action || (isTransition(action) ? !TRANSITIONS[action] : !NON_TRANSITIONS.includes(action))) {
      return NextResponse.json(
        { error: `Unknown action "${action}". Known: ${Object.keys(TRANSITIONS).join(', ')}, ${NON_TRANSITIONS.join(', ')}` },
        { status: 400 })
    }
    if (!actor) return NextResponse.json({ error: 'actor is required, so the log names who did this' }, { status: 400 })

    // ── a decision made on the board, written down here ──
    if (action === 'record_board_decision') {
      const rid = body.id
      const decidedBy = typeof body.decided_by === 'string' ? body.decided_by.trim() : ''
      const boardId = typeof body.board_approval_id === 'string' ? body.board_approval_id.trim() : ''
      const decision = body.decision

      if (!rid) return NextResponse.json({ error: 'id is required' }, { status: 400 })
      if (!decidedBy) return NextResponse.json({ error: 'decided_by is required: name the person who actually decided.' }, { status: 400 })
      if (!boardId) return NextResponse.json({ error: 'board_approval_id is required: a decision with no board record behind it is not a decision.' }, { status: 400 })
      if (decision !== 'approved' && decision !== 'denied') {
        return NextResponse.json({ error: 'decision must be "approved" or "denied".' }, { status: 400 })
      }
      if (decision === 'denied' && !note) {
        return NextResponse.json({ error: 'A denial needs the note the board gave, so the writer knows what to change.' }, { status: 400 })
      }

      const { data: brow, error: bErr } = await supabase
        .from('content_queue_items').select('id, title, channel, status, feedback_log').eq('id', rid).single()
      if (bErr || !brow) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

      const verdict = canRecordBoardDecision(actor, decidedBy, brow as { status: Status })
      if (!verdict.allowed) return NextResponse.json({ error: verdict.reason }, { status: 403 })

      const to = decision === 'approved' ? 'approved' : 'changes_requested'
      const bEntry = {
        at: new Date().toISOString(), actor, action, from: brow.status, to,
        note: note || null,
        decided_by: decidedBy, board_approval_id: boardId, relayed_by: actor,
      }
      if (dryRun) return NextResponse.json({ dryRun: true, wouldMove: rid, to, logEntry: bEntry })

      const bPatch: Record<string, unknown> = {
        status: to,
        owner: OWNER_OF[to as Status],
        feedback_log: [...((brow.feedback_log as unknown[]) ?? []), bEntry],
      }
      if (decision === 'approved') {
        // The person approved it, not the agent that typed it in.
        bPatch.approved_by = decidedBy
        bPatch.approved_at = new Date().toISOString()
      }

      const { error: bUp } = await supabase.from('content_queue_items').update(bPatch).eq('id', rid)
      if (bUp) return NextResponse.json({ success: false, refusedBy: 'database gate', error: bUp.message }, { status: 400 })

      if (decision === 'approved') {
        const told = notifyApproved({ id: rid, title: brow.title, channel: brow.channel, approved_by: decidedBy })
        return NextResponse.json({ success: true, id: rid, to, approved_by: decidedBy, notified: told.attempted, notified_note: told.reason })
      }
      return NextResponse.json({ success: true, id: rid, to, decided_by: decidedBy })
    }

    // ── flagging does not move the row ──
    //
    // A gate that cannot judge a piece parks it in place. Sending it back to the
    // writer asks for something the writer cannot produce, which is how the
    // 9 September loop happened.
    if (action === 'flag_blocked') {
      const fid = body.id
      if (!fid) return NextResponse.json({ error: 'id is required' }, { status: 400 })
      if (!note) return NextResponse.json({ error: 'flag_blocked requires a note saying what is missing and who decides.' }, { status: 400 })

      const { data: frow, error: fErr } = await supabase
        .from('content_queue_items').select('id, status, feedback_log').eq('id', fid).single()
      if (fErr || !frow) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

      const verdict = canFlagBlocked(actor, frow as { status: string; feedback_log?: unknown[] })
      if (!verdict.allowed) return NextResponse.json({ error: verdict.reason }, { status: 403 })

      const fEntry = { at: new Date().toISOString(), actor, action, from: frow.status, to: frow.status, note }
      if (dryRun) return NextResponse.json({ dryRun: true, wouldFlag: fid, staysIn: frow.status, logEntry: fEntry })

      const { error: upErr } = await supabase.from('content_queue_items')
        .update({ feedback_log: [...((frow.feedback_log as unknown[]) ?? []), fEntry] })
        .eq('id', fid)
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

      return NextResponse.json({ success: true, id: fid, flagged: true, status: frow.status, note })
    }


    if (!isTransition(action)) return NextResponse.json({ error: `"${action}" is not a transition.` }, { status: 400 })
    const rule = TRANSITIONS[action]

    // ── placing a brief creates the row ──
    if (action === 'place_brief') {
      const { channel, content_type, title, brief, audience_tag, approver, scheduled_for } = body
      for (const [k, v] of Object.entries({ channel, content_type, audience_tag })) {
        if (!v || !String(v).trim()) {
          return NextResponse.json({ error: `${k} is required` }, { status: 400 })
        }
      }
      if (!actorHoldsRole(actor, rule.role)) {
        return NextResponse.json({ error: `"${actor}" cannot place a brief. That is the orchestrator's step.` }, { status: 403 })
      }
      // A brief may be placed straight onto a day. This was silently dropped
      // until 8 September: the field was accepted, ignored, and a 200 returned,
      // so every brief Nora placed sat in "no day yet" forever.
      if (scheduled_for != null && !/^\d{4}-\d{2}-\d{2}$/.test(String(scheduled_for))) {
        return NextResponse.json({ error: 'scheduled_for must be YYYY-MM-DD' }, { status: 400 })
      }
      const entry = { at: new Date().toISOString(), actor, action, to: 'brief', note: note || null }
      if (dryRun) return NextResponse.json({ dryRun: true, wouldCreate: { channel, content_type, title, audience_tag, scheduled_for: scheduled_for ?? null, status: 'brief' }, logEntry: entry })

      const { data, error } = await supabase.from('content_queue_items').insert({
        channel, content_type, title: title ?? null, brief: brief ?? null,
        audience_tag, approver: approver ?? null, scheduled_for: scheduled_for ?? null,
        status: 'brief', owner: OWNER_OF.brief, feedback_log: [entry],
      // Echo the stored date back. A caller that asked for a day and got a 200
      // should be able to see whether the day actually landed.
      }).select('id, status, owner, scheduled_for').single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true, ...data })
    }

    // ── everything else moves an existing row ──
    const id = body.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { data: row, error: readErr } = await supabase
      .from('content_queue_items')
      .select('id, title, channel, status, body, owner, approver, approved_at, artifact_rendered_at, artifact_refs, feedback_log')
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
    // request_changes has no single role: three gates and two approvers can all
    // refuse, and a writer can recall a submit nobody has touched yet.
    if (action === 'request_changes') {
      const verdict = canRequestChanges(actor, item)
      if (!verdict.allowed) return NextResponse.json({ error: verdict.reason }, { status: 403 })
    }
    // Nothing empty moves past drafting. A gate cannot judge what is not there,
    // and on 9 September one passed QA on a row with no body at all.
    const NEEDS_CONTENT = ['submit', 'pass_qa', 'pass_creative', 'pass_editorial', 'approve']
    if (NEEDS_CONTENT.includes(action)) {
      const incoming = typeof body.body === 'string' ? body.body : null
      const merged = { body: incoming ?? item.body, artifact_refs: body.artifact_refs ?? item.artifact_refs }
      if (!hasContent(merged)) {
        return NextResponse.json({
          error: action === 'submit'
            ? 'Nothing to submit. Send the draft as "body", or attach what you rendered as "artifact_refs". An empty row is not a draft.'
            : `Cannot ${action}: this item has no body and no rendered artifact. There is nothing to review.`,
        }, { status: 400 })
      }
    }
    if (rule.needsNote && !note) {
      return NextResponse.json({ error: `${action} requires a note saying why.` }, { status: 400 })
    }

    const entry: Record<string, unknown> = { at: new Date().toISOString(), actor, action, from: item.status, to: rule.to, note: note || null }
    const patch: Record<string, unknown> = {
      status: rule.to,
      owner: OWNER_OF[rule.to],
      feedback_log: [...(item.feedback_log ?? []), entry],
    }

    // artifact_rendered_at claims something was rendered. It used to be stamped
    // on every submit whether or not anything had been, which made it a field
    // that asserts proof and supplies none. Only record it when there is one.
    if (action === 'submit') {
      if (typeof body.body === 'string' && body.body.trim()) patch.body = body.body
      if (body.artifact_refs !== undefined) patch.artifact_refs = body.artifact_refs

      // A carousel's slides are derived from its body, so there is no separate
      // render step an agent could skip or fake. Build them here, and refuse the
      // submit if they cannot be built: a carousel that cannot be rendered is
      // not a carousel yet, and that was the judgement Lily's gate had no way to
      // make.
      if (item.channel === 'instagram') {
        const text = (typeof body.body === 'string' ? body.body : item.body) ?? null
        const slides = parseSlides(text)
        const problems = carouselProblems(slides)
        if (problems.length > 0) {
          return NextResponse.json({
            error: 'This carousel cannot be built yet, so it is not ready for review.',
            problems,
            hint: 'Slides are separated by a blank line. The first is the hook, the last is the ask.',
          }, { status: 400 })
        }
        patch.artifact_refs = slides.map(sl => ({
          kind: 'carousel_slide',
          index: sl.index,
          slide_kind: sl.kind,
          url: `/api/content-queue/carousel?id=${id}&slide=${sl.index}`,
        }))
        patch.artifact_rendered_at = new Date().toISOString()
      }

      const refs = patch.artifact_refs ?? body.artifact_refs ?? item.artifact_refs
      if (body.artifact_rendered_at) patch.artifact_rendered_at = body.artifact_rendered_at
      else if (Array.isArray(refs) && refs.length > 0 && !patch.artifact_rendered_at) {
        patch.artifact_rendered_at = new Date().toISOString()
      }
    }
    if (action === 'pass_qa') patch.qa_spec_version = body.qa_spec_version ?? null
    // Reaching an approver is the moment a person is needed. Announcing it only
    // after they act tells them something they already know.
    if (rule.to === 'pending_approval') {
      // Deliberately silent here. Reaching a person raises a board approval in
      // Paperclip, which is where Rae already works and which wakes the
      // requesting agent with the result. A Slack message as well would be a
      // second place to be asked for the same decision.
      entry.awaiting_board = true
    }
    if (action === 'approve') {
      patch.approved_by = actor
      patch.approved_at = new Date().toISOString()
      // Tell whoever has to publish it. The outcome goes into the same log entry,
      // so "nobody was told" is a fact on the record rather than a silence.
      const told = notifyApproved({ id, title: item.title, channel: item.channel, approved_by: actor })
      entry.notified = told.attempted
      entry.notified_note = told.reason
    }
    if (action === 'schedule') {
      if (!body.scheduled_for) return NextResponse.json({ error: 'scheduled_for is required, as YYYY-MM-DD' }, { status: 400 })
      patch.scheduled_for = body.scheduled_for
    }
    if (action === 'mark_published') {
      // A publish claim without a URL is somebody saying they saw it. On
      // 9 September a gate wrote a quality assessment of an empty row, so a
      // claim that names nothing is not accepted here.
      const url = typeof body.published_url === 'string' ? body.published_url.trim() : ''
      if (!url) {
        return NextResponse.json({
          error: 'mark_published requires published_url: the actual address where you found it. If you cannot point at it, you have not confirmed it is live.',
        }, { status: 400 })
      }
      patch.published_at = body.published_at ?? new Date().toISOString()
      patch.published_url = url
    }
    if (action === 'verify') {
      // Same rule one step later: say what you checked, not that you checked.
      if (!note || !note.trim()) {
        return NextResponse.json({
          error: 'verify requires a note saying what you actually looked at and what you saw. "Confirmed" on its own is not a verification.',
        }, { status: 400 })
      }
      patch.verified_at = new Date().toISOString()
      patch.verification_note = note
    }

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
