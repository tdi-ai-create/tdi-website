import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { notifyCreatorOfNote } from '@/lib/creator-note-notify'

/**
 * Admin API for managing creator draft notes (Anne Marie's check-in notes)
 *
 * GET ?status=pending_approval -- list notes waiting for Bella's review
 * POST { action: 'approve', note_id: '...' } -- approve, publish, and email the creator
 * POST { action: 'reject', note_id: '...' } -- reject the draft
 * POST { action: 'approve_edited', note_id: '...', content: '...' } -- edit, publish, and email
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending_approval'
  const supabase = getServiceSupabase()

  const query = supabase
    .from('creator_notes')
    .select('id, creator_id, content, author, draft_status, draft_reason, created_at, created_by')
    .eq('draft_status', status)
    .order('created_at', { ascending: false })

  const { data: notes, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with creator names
  const creatorIds = [...new Set((notes || []).map(n => n.creator_id))]
  const { data: creators } = await supabase
    .from('creators')
    .select('id, name, email, course_title')
    .in('id', creatorIds.length > 0 ? creatorIds : ['none'])

  const creatorMap = new Map((creators || []).map(c => [c.id, c]))

  const enriched = (notes || []).map(n => ({
    ...n,
    creator_name: creatorMap.get(n.creator_id)?.name || 'Unknown',
    creator_email: creatorMap.get(n.creator_id)?.email || '',
    course_title: creatorMap.get(n.creator_id)?.course_title || '',
  }))

  return NextResponse.json({ notes: enriched, count: enriched.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, note_id, approved_by } = body
  const supabase = getServiceSupabase()

  if (!note_id) return NextResponse.json({ error: 'note_id required' }, { status: 400 })

  if (action === 'approve' || action === 'approve_edited') {
    const { content } = body
    if (action === 'approve_edited' && !content) {
      return NextResponse.json({ error: 'content required for edited approval' }, { status: 400 })
    }

    // Scope the update to notes still awaiting approval so a double click cannot
    // publish twice and email the creator twice.
    const { data: note, error } = await supabase
      .from('creator_notes')
      .update({
        ...(action === 'approve_edited' ? { content } : {}),
        draft_status: 'published',
        visible_to_creator: true,
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
    const { error } = await supabase
      .from('creator_notes')
      .update({ draft_status: 'rejected' })
      .eq('id', note_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
