import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { notifyCreatorOfNote } from '@/lib/creator-note-notify'

/**
 * Admin API for managing creator draft notes (Anne Marie's check-in notes)
 *
 * GET ?status=pending_approval -- drafts awaiting review, enriched with the
 *   creator's current pause state and their latest internal note
 *
 * POST actions:
 *   approve         -- publish now and email, or hold with scheduled_send_at
 *   approve_edited  -- same, with edited content
 *   reject          -- record why, so note-quality issues stay separable from
 *                      business decisions
 *   unschedule      -- pull a scheduled note back into the review queue
 */

const REJECTION_CATEGORIES = [
  'note_content',
  'system_decision',
  'creator_state',
  'already_handled',
  'other',
] as const

/** Creator states where sending an unprompted check-in is probably wrong. */
function contactWarning(creator: { lifecycle_state?: string | null; status?: string | null; paused_at?: string | null }) {
  if (creator.lifecycle_state === 'paused') {
    return {
      blocked: true,
      reason: creator.paused_at
        ? `This creator was paused on ${new Date(creator.paused_at).toLocaleDateString()}`
        : 'This creator is paused',
    }
  }
  if (creator.status && creator.status !== 'active') {
    return { blocked: true, reason: `This creator's status is "${creator.status}"` }
  }
  return { blocked: false, reason: null }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending_approval'
  const supabase = getServiceSupabase()

  const { data: notes, error } = await supabase
    .from('creator_notes')
    .select(
      'id, creator_id, content, author, draft_status, draft_reason, created_at, created_by, scheduled_send_at, scheduled_by'
    )
    .eq('draft_status', status)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const creatorIds = [...new Set((notes || []).map(n => n.creator_id))]
  const idFilter = creatorIds.length > 0 ? creatorIds : ['none']

  const { data: creators } = await supabase
    .from('creators')
    .select('id, name, email, course_title, lifecycle_state, status, paused_at, pause_reason')
    .in('id', idFilter)

  // Latest internal note per creator, so the reviewer sees the documented
  // context ("holding until she confirms her timeline") next to the draft.
  const { data: internalNotes } = await supabase
    .from('creator_notes')
    .select('id, creator_id, content, author, created_at, reminder_at, reminder_completed_at')
    .in('creator_id', idFilter)
    .eq('visible_to_creator', false)
    .eq('draft_status', 'internal')
    .order('created_at', { ascending: false })

  const creatorMap = new Map((creators || []).map(c => [c.id, c]))
  const latestInternal = new Map<string, NonNullable<typeof internalNotes>[number]>()
  for (const n of internalNotes || []) {
    if (!latestInternal.has(n.creator_id)) latestInternal.set(n.creator_id, n)
  }

  const enriched = (notes || []).map(n => {
    const creator = creatorMap.get(n.creator_id)
    const warning = creator ? contactWarning(creator) : { blocked: false, reason: null }
    const internal = latestInternal.get(n.creator_id)

    return {
      ...n,
      creator_name: creator?.name || 'Unknown',
      creator_email: creator?.email || '',
      course_title: creator?.course_title || '',
      lifecycle_state: creator?.lifecycle_state || null,
      creator_status: creator?.status || null,
      paused_at: creator?.paused_at || null,
      pause_reason: creator?.pause_reason || null,
      contact_blocked: warning.blocked,
      contact_blocked_reason: warning.reason,
      internal_note: internal
        ? {
            id: internal.id,
            content: internal.content,
            author: internal.author,
            created_at: internal.created_at,
            reminder_at: internal.reminder_at,
            reminder_completed_at: internal.reminder_completed_at,
          }
        : null,
    }
  })

  return NextResponse.json({ notes: enriched, count: enriched.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, note_id, approved_by } = body
  const supabase = getServiceSupabase()

  if (!note_id) return NextResponse.json({ error: 'note_id required' }, { status: 400 })

  if (action === 'approve' || action === 'approve_edited') {
    const { content, scheduled_send_at, override_paused } = body

    if (action === 'approve_edited' && !content) {
      return NextResponse.json({ error: 'content required for edited approval' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('creator_notes')
      .select('id, creator_id, draft_status')
      .eq('id', note_id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Re-check pause state at approval time, not just at draft time. A note
    // drafted while someone was active can sit in the queue for days and be
    // approved after they pause, which is how a paused creator gets a
    // "just checking in" email.
    const { data: creator } = await supabase
      .from('creators')
      .select('lifecycle_state, status, paused_at')
      .eq('id', existing.creator_id)
      .single()

    if (creator) {
      const warning = contactWarning(creator)
      if (warning.blocked && !override_paused) {
        return NextResponse.json(
          { error: warning.reason, contact_blocked: true, requires_override: true },
          { status: 409 }
        )
      }
    }

    let scheduledFor: string | null = null
    if (scheduled_send_at) {
      const when = new Date(scheduled_send_at)
      if (Number.isNaN(when.getTime())) {
        return NextResponse.json({ error: 'scheduled_send_at is not a valid date' }, { status: 400 })
      }
      if (when.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: 'Scheduled send time is in the past. Pick a future time or send now.' },
          { status: 400 }
        )
      }
      scheduledFor = when.toISOString()
    }

    // Scoped to pending_approval so a double click cannot publish twice and
    // email the creator twice.
    const { data: note, error } = await supabase
      .from('creator_notes')
      .update({
        ...(action === 'approve_edited' ? { content } : {}),
        ...(scheduledFor
          ? {
              draft_status: 'scheduled',
              scheduled_send_at: scheduledFor,
              scheduled_by: approved_by || null,
              visible_to_creator: false,
            }
          : {
              draft_status: 'published',
              visible_to_creator: true,
              scheduled_send_at: null,
            }),
      })
      .eq('id', note_id)
      .eq('draft_status', 'pending_approval')
      .select('id, creator_id')
      .single()

    if (error || !note) {
      return NextResponse.json(
        { error: error?.message || 'Draft not found or already approved' },
        { status: 404 }
      )
    }

    if (scheduledFor) {
      return NextResponse.json({
        success: true,
        note_id: note.id,
        scheduled_send_at: scheduledFor,
        emailed: false,
      })
    }

    const notified = await notifyCreatorOfNote(supabase, note.creator_id, {
      source: 'creator-notes-approve',
      actor: approved_by,
    })

    // The note is published either way. Report the email outcome so the admin
    // knows to follow up by hand rather than assuming it went out.
    return NextResponse.json({
      success: true,
      note_id: note.id,
      emailed: notified.sent,
      email_error: notified.reason ?? null,
    })
  }

  if (action === 'reject') {
    const { rejection_category, rejection_reason, rejected_by } = body

    if (!rejection_category || !REJECTION_CATEGORIES.includes(rejection_category)) {
      return NextResponse.json(
        { error: `rejection_category must be one of: ${REJECTION_CATEGORIES.join(', ')}` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('creator_notes')
      .update({
        draft_status: 'rejected',
        rejection_category,
        rejection_reason: rejection_reason?.trim() || null,
        rejected_by: rejected_by || approved_by || null,
        rejected_at: new Date().toISOString(),
      })
      .eq('id', note_id)
      .in('draft_status', ['pending_approval', 'scheduled'])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Pull a scheduled note back before it goes out.
  if (action === 'unschedule') {
    const { error } = await supabase
      .from('creator_notes')
      .update({
        draft_status: 'pending_approval',
        scheduled_send_at: null,
        scheduled_by: null,
      })
      .eq('id', note_id)
      .eq('draft_status', 'scheduled')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
