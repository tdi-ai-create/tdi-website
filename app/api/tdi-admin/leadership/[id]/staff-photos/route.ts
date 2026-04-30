import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import sharp from 'sharp'

const THUMB_SIZE = 64
const FULL_SIZE = 400
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const staffMemberId = formData.get('staffMemberId') as string
    const consentChecked = formData.get('consentChecked') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!staffMemberId) {
      return NextResponse.json({ error: 'Staff member ID required' }, { status: 400 })
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, WebP' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    const { data: staffMember, error: staffError } = await supabase
      .from('partnership_staff')
      .select('id, partnership_id')
      .eq('id', staffMemberId)
      .eq('partnership_id', partnershipId)
      .single()

    if (staffError || !staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    const thumbBuffer = await sharp(imageBuffer)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer()

    const fullBuffer = await sharp(imageBuffer)
      .resize(FULL_SIZE, FULL_SIZE, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer()

    const basePath = `${partnershipId}/${staffMemberId}`

    const [thumbUpload, fullUpload] = await Promise.all([
      supabase.storage
        .from('staff-photos')
        .upload(`${basePath}/thumb.webp`, thumbBuffer, {
          contentType: 'image/webp',
          upsert: true
        }),
      supabase.storage
        .from('staff-photos')
        .upload(`${basePath}/full.webp`, fullBuffer, {
          contentType: 'image/webp',
          upsert: true
        })
    ])

    if (thumbUpload.error || fullUpload.error) {
      console.error('Storage upload error:', thumbUpload.error || fullUpload.error)
      return NextResponse.json(
        { error: 'Failed to upload photos' },
        { status: 500 }
      )
    }

    const { data: { publicUrl: thumbUrl } } = supabase.storage
      .from('staff-photos')
      .getPublicUrl(`${basePath}/thumb.webp`)

    const { data: { publicUrl: fullUrl } } = supabase.storage
      .from('staff-photos')
      .getPublicUrl(`${basePath}/full.webp`)

    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      photo_url: fullUrl,
      photo_thumb_url: thumbUrl,
      photo_uploaded_at: now,
      photo_source: 'bulk_import',
      updated_at: now
    }

    if (consentChecked) {
      updateData.consent_checked_at = now
    }

    const { error: updateError } = await supabase
      .from('partnership_staff')
      .update(updateData)
      .eq('id', staffMemberId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to save photo record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      photo: {
        staffMemberId,
        thumbUrl,
        fullUrl,
        uploadedAt: now
      }
    })
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const staffMemberId = searchParams.get('staffMemberId')

    if (!staffMemberId) {
      return NextResponse.json({ error: 'Staff member ID required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    const { data: staffMember, error: staffError } = await supabase
      .from('partnership_staff')
      .select('id, partnership_id, photo_url')
      .eq('id', staffMemberId)
      .eq('partnership_id', partnershipId)
      .single()

    if (staffError || !staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    const basePath = `${partnershipId}/${staffMemberId}`
    await supabase.storage
      .from('staff-photos')
      .remove([`${basePath}/thumb.webp`, `${basePath}/full.webp`])

    const { error: updateError } = await supabase
      .from('staff_members')
      .update({
        photo_url: null,
        photo_thumb_url: null,
        photo_uploaded_at: null,
        photo_source: null,
        consent_checked_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffMemberId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove photo record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Photo delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
