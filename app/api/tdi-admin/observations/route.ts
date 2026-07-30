import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const partnershipId = searchParams.get('partnershipId')
    const visitId = searchParams.get('visitId')
    const supabase = getServiceSupabase()

    // Full visit details with notes and summary
    if (visitId) {
      const { data: visit, error: visitError } = await supabase
        .from('observation_visits')
        .select('*')
        .eq('id', visitId)
        .single()

      if (visitError || !visit) {
        return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
      }

      const { data: notes } = await supabase
        .from('observation_notes')
        .select('*')
        .eq('visit_id', visitId)
        .order('educator_name')

      const { data: summary } = await supabase
        .from('observation_summaries')
        .select('*')
        .eq('visit_id', visitId)
        .single()

      return NextResponse.json({
        visit,
        notes: notes || [],
        summary: summary || null,
      })
    }

    // List all visits for a partnership
    if (partnershipId) {
      const { data: visits, error: visitsError } = await supabase
        .from('observation_visits')
        .select('*')
        .eq('partnership_id', partnershipId)
        .order('visit_date', { ascending: false })

      if (visitsError) {
        console.error('[Observations] List error:', visitsError)
        return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 })
      }

      // Get note counts for each visit
      const visitIds = (visits || []).map((v: any) => v.id)
      let noteCounts: Record<string, { total: number; sent: number }> = {}

      if (visitIds.length > 0) {
        const { data: notes } = await supabase
          .from('observation_notes')
          .select('visit_id, email_sent_at')
          .in('visit_id', visitIds)

        for (const note of notes || []) {
          if (!noteCounts[note.visit_id]) {
            noteCounts[note.visit_id] = { total: 0, sent: 0 }
          }
          noteCounts[note.visit_id].total++
          if (note.email_sent_at) {
            noteCounts[note.visit_id].sent++
          }
        }
      }

      const visitsWithCounts = (visits || []).map((v: any) => ({
        ...v,
        note_count: noteCounts[v.id]?.total || 0,
        sent_count: noteCounts[v.id]?.sent || 0,
      }))

      return NextResponse.json({ visits: visitsWithCounts })
    }

    return NextResponse.json({ error: 'partnershipId or visitId required' }, { status: 400 })
  } catch (error) {
    console.error('[Observations] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { noteId, ...fields } = body

    if (!noteId) {
      return NextResponse.json({ error: 'noteId is required' }, { status: 400 })
    }

    const allowedFields = ['love_note_final', 'strategy_tags', 'growth_indicators']
    const updateData: Record<string, any> = {}

    for (const key of Object.keys(fields)) {
      if (allowedFields.includes(key)) {
        updateData[key] = fields[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { data: note, error } = await supabase
      .from('observation_notes')
      .update(updateData)
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      console.error('[Observations] PATCH error:', error)
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
    }

    return NextResponse.json({ success: true, note })
  } catch (error) {
    console.error('[Observations] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const visitId = searchParams.get('visitId')

    if (!visitId) {
      return NextResponse.json({ error: 'visitId is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Get visit to find photos for cleanup
    const { data: visit } = await supabase
      .from('observation_visits')
      .select('notepad_photos')
      .eq('id', visitId)
      .single()

    // Delete notes
    await supabase
      .from('observation_notes')
      .delete()
      .eq('visit_id', visitId)

    // Delete summary
    await supabase
      .from('observation_summaries')
      .delete()
      .eq('visit_id', visitId)

    // Delete storage files
    if (visit?.notepad_photos) {
      const paths = visit.notepad_photos.map((p: any) => p.storage_path)
      if (paths.length > 0) {
        await supabase.storage.from('partnership-files').remove(paths)
      }
    }

    // Delete visit record
    const { error } = await supabase
      .from('observation_visits')
      .delete()
      .eq('id', visitId)

    if (error) {
      console.error('[Observations] Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete visit' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Observations] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
