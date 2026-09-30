import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { getServiceSupabase } from '@/lib/supabase'
import { resolveVisitForEvent, type PrepFile } from '@/lib/tdi-admin/visit-prep'

/**
 * Visit prep for one scheduled observation day.
 *
 * GET    read the prep, creating the visit row on first open
 * PATCH  save notes, or mark the prep done / not done
 * POST   attach a file a school sent back, usually a schedule
 *
 * Files go in the same `partnership-files` bucket the notepad photos use, under
 * a visit-prep prefix, so everything for a visit sits together.
 */

const MAX_FILE_BYTES = 25 * 1024 * 1024

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { eventId } = await params
  try {
    const visit = await resolveVisitForEvent(eventId)
    if (!visit) {
      return NextResponse.json({ error: 'No observation day found for that event' }, { status: 404 })
    }
    return NextResponse.json(visit)
  } catch (e) {
    console.error('[visit-prep] GET failed:', e)
    return NextResponse.json({ error: 'Could not load visit prep' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { eventId } = await params
  try {
    const visit = await resolveVisitForEvent(eventId)
    if (!visit) {
      return NextResponse.json({ error: 'No observation day found for that event' }, { status: 404 })
    }

    const body = await request.json()
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (typeof body.prep_notes === 'string') update.prep_notes = body.prep_notes
    if (typeof body.done === 'boolean') {
      // Clearing the token on completion matches the unpause pattern: an
      // emailed link stops working once the thing it asked for is done.
      update.prep_done_at = body.done ? new Date().toISOString() : null
      if (body.done) update.prep_token = null
    }

    if (Object.keys(update).length === 1) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const { data, error } = await supabase
      .from('observation_visits')
      .update(update)
      .eq('id', visit.id)
      .select('id, prep_notes, prep_done_at')
      .single()

    // Verify the write rather than trusting a 200. A discarded error here is
    // how several "saved" flows in this repo turned out to save nothing.
    if (error) {
      console.error('[visit-prep] PATCH failed:', error.message)
      return NextResponse.json({ error: 'Could not save' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error('[visit-prep] PATCH threw:', e)
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { eventId } = await params
  try {
    const visit = await resolveVisitForEvent(eventId)
    if (!visit) {
      return NextResponse.json({ error: 'No observation day found for that event' }, { status: 404 })
    }

    const form = await request.formData()
    const files = form.getAll('files').filter((f): f is File => f instanceof File)
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files attached' }, { status: 400 })
    }

    const oversized = files.find((f) => f.size > MAX_FILE_BYTES)
    if (oversized) {
      return NextResponse.json(
        { error: `${oversized.name} is larger than 25MB` },
        { status: 413 }
      )
    }

    const supabase = getServiceSupabase()
    const attached: PrepFile[] = [...visit.prep_files]

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const safeName = file.name.replace(/[^\w.\-]+/g, '_')
      const storagePath = `visit-prep/${visit.partnership_id}/${visit.id}/${Date.now()}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('partnership-files')
        .upload(storagePath, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        })

      if (uploadError) {
        console.error('[visit-prep] upload failed:', uploadError.message)
        return NextResponse.json(
          { error: `Could not upload ${file.name}` },
          { status: 500 }
        )
      }

      const { data: publicUrl } = supabase.storage
        .from('partnership-files')
        .getPublicUrl(storagePath)

      attached.push({
        name: file.name,
        url: publicUrl.publicUrl,
        storage_path: storagePath,
        size: file.size,
        uploaded_at: new Date().toISOString(),
        uploaded_by: auth.member.email,
      })
    }

    const { error: saveError } = await supabase
      .from('observation_visits')
      .update({ prep_files: attached, updated_at: new Date().toISOString() })
      .eq('id', visit.id)

    if (saveError) {
      console.error('[visit-prep] file list save failed:', saveError.message)
      return NextResponse.json({ error: 'Uploaded, but could not record the file' }, { status: 500 })
    }

    return NextResponse.json({ prep_files: attached })
  } catch (e) {
    console.error('[visit-prep] POST threw:', e)
    return NextResponse.json({ error: 'Could not attach the file' }, { status: 500 })
  }
}
