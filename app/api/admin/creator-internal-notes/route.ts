import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * Internal TDI documentation on a creator, with an optional follow-up date.
 *
 * These are stored as creator_notes rows with visible_to_creator = false and
 * draft_status = 'internal'. That keeps them on the creator's record and in
 * the existing notes panel, so context written while reviewing a draft
 * outlives the draft itself.
 *
 * Nothing here is ever shown to a creator or emailed anywhere.
 *
 * GET                       -- open reminders that have come due
 * GET ?creator_id=...       -- all internal notes for one creator
 * POST { action: 'save' }   -- write a note, optionally with a reminder date
 * POST { action: 'complete_reminder' } -- mark a reminder handled
 * POST { action: 'clear_reminder' }    -- drop the date, keep the note
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const creatorId = searchParams.get('creator_id')
  const supabase = getServiceSupabase()

  if (creatorId) {
    const { data, error } = await supabase
      .from('creator_notes')
      .select('id, creator_id, content, author, created_at, reminder_at, reminder_completed_at')
      .eq('creator_id', creatorId)
      .eq('visible_to_creator', false)
      .eq('draft_status', 'internal')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ notes: data || [] })
  }

  // Due reminders: today or earlier, not yet completed.
  const today = new Date().toISOString().slice(0, 10)

  const { data: due, error } = await supabase
    .from('creator_notes')
    .select('id, creator_id, content, author, created_at, reminder_at')
    .eq('visible_to_creator', false)
    .eq('draft_status', 'internal')
    .not('reminder_at', 'is', null)
    .is('reminder_completed_at', null)
    .lte('reminder_at', today)
    .order('reminder_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const creatorIds = [...new Set((due || []).map(n => n.creator_id))]
  const { data: creators } = await supabase
    .from('creators')
    .select('id, name, lifecycle_state')
    .in('id', creatorIds.length > 0 ? creatorIds : ['none'])

  const creatorMap = new Map((creators || []).map(c => [c.id, c]))

  const enriched = (due || []).map(n => ({
    ...n,
    creator_name: creatorMap.get(n.creator_id)?.name || 'Unknown',
    lifecycle_state: creatorMap.get(n.creator_id)?.lifecycle_state || null,
    overdue_days: Math.max(
      0,
      Math.floor((Date.now() - new Date(n.reminder_at).getTime()) / 86_400_000)
    ),
  }))

  return NextResponse.json({ reminders: enriched, count: enriched.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body
  const supabase = getServiceSupabase()

  if (action === 'save') {
    const { creator_id, content, reminder_at, author } = body

    if (!creator_id || !content?.trim()) {
      return NextResponse.json({ error: 'creator_id and content required' }, { status: 400 })
    }

    if (reminder_at && Number.isNaN(new Date(reminder_at).getTime())) {
      return NextResponse.json({ error: 'reminder_at is not a valid date' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('creator_notes')
      .insert({
        creator_id,
        content: content.trim(),
        author: author || 'TDI Admin',
        visible_to_creator: false,
        draft_status: 'internal',
        reminder_at: reminder_at || null,
      })
      .select('id, creator_id, content, author, created_at, reminder_at, reminder_completed_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, note: data })
  }

  if (action === 'complete_reminder' || action === 'clear_reminder') {
    const { note_id, completed_by } = body
    if (!note_id) return NextResponse.json({ error: 'note_id required' }, { status: 400 })

    const { error } = await supabase
      .from('creator_notes')
      .update(
        action === 'complete_reminder'
          ? {
              reminder_completed_at: new Date().toISOString(),
              reminder_completed_by: completed_by || null,
            }
          : { reminder_at: null }
      )
      .eq('id', note_id)
      .eq('draft_status', 'internal')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
