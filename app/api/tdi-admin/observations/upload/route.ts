import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { getServiceSupabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = getServiceSupabase()
    const formData = await request.formData()

    const partnershipId = formData.get('partnershipId') as string
    const visitDate = formData.get('visitDate') as string
    const buildings = formData.get('buildings') as string | null
    const observer = (formData.get('observer') as string) || 'Rae Hughart'

    if (!partnershipId || !visitDate) {
      return NextResponse.json(
        { error: 'partnershipId and visitDate are required' },
        { status: 400 }
      )
    }

    // Collect all photo files
    const photos: File[] = []
    const entries = formData.getAll('photos')
    for (const entry of entries) {
      if (entry instanceof File && entry.size > 0) {
        photos.push(entry)
      }
    }

    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'At least one photo is required' },
        { status: 400 }
      )
    }

    // Get visit number
    const { count } = await supabase
      .from('observation_visits')
      .select('id', { count: 'exact', head: true })
      .eq('partnership_id', partnershipId)

    const visitNumber = (count || 0) + 1
    const visitId = randomUUID()

    // Upload each photo to storage
    const notepadPhotos: { url: string; storage_path: string; uploaded_at: string }[] = []

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      const arrayBuffer = await photo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const storagePath = `observations/${partnershipId}/${visitId}/${i}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('partnership-files')
        .upload(storagePath, buffer, {
          contentType: photo.type || 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        console.error(`[Observations] Photo upload failed for index ${i}:`, uploadError)
        return NextResponse.json(
          { error: `Failed to upload photo ${i + 1}` },
          { status: 500 }
        )
      }

      const { data: publicUrlData } = supabase.storage
        .from('partnership-files')
        .getPublicUrl(storagePath)

      notepadPhotos.push({
        url: publicUrlData.publicUrl,
        storage_path: storagePath,
        uploaded_at: new Date().toISOString(),
      })
    }

    // Create observation_visits record
    const buildingsVisited = buildings
      ? buildings.split(',').map((b) => b.trim()).filter(Boolean)
      : []

    const { data: visit, error: insertError } = await supabase
      .from('observation_visits')
      .insert({
        id: visitId,
        partnership_id: partnershipId,
        visit_date: visitDate,
        buildings_visited: buildingsVisited,
        observer,
        notepad_photos: notepadPhotos,
        status: 'uploaded',
        visit_number: visitNumber,
      })
      .select('id, visit_date, status, visit_number')
      .single()

    if (insertError) {
      console.error('[Observations] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create visit record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      visit: {
        id: visit.id,
        visit_date: visit.visit_date,
        status: visit.status,
        photo_count: notepadPhotos.length,
      },
    })
  } catch (error) {
    console.error('[Observations] Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
