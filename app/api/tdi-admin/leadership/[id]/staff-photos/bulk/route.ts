import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import sharp from 'sharp'

const THUMB_SIZE = 64
const FULL_SIZE = 400

interface BulkResult {
  matched: number
  uploaded: number
  failed: string[]
  skipped: string[]
}

async function extractZipEntries(buffer: Buffer): Promise<Map<string, Buffer>> {
  const entries = new Map<string, Buffer>()
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buffer)

  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) continue
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext || !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) continue

    const data = await file.async('nodebuffer')
    const nameWithoutExt = filename.split('/').pop()?.replace(/\.[^.]+$/, '') || ''
    entries.set(nameWithoutExt.toLowerCase(), data)
  }

  return entries
}

function parseCSVPhotoColumn(csvText: string): Map<string, string> {
  const mapping = new Map<string, string>()
  const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return mapping

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const emailIdx = headers.findIndex(h => h === 'email')
  const staffIdIdx = headers.findIndex(h => h === 'staffid' || h === 'staff_id' || h === 'id')
  const photoIdx = headers.findIndex(h => h === 'photo' || h === 'photo_url' || h === 'photourl' || h === 'image' || h === 'image_url')

  if (photoIdx === -1) return mapping
  const keyIdx = emailIdx !== -1 ? emailIdx : staffIdIdx

  if (keyIdx === -1) return mapping

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    const key = cols[keyIdx]?.toLowerCase()
    const photoUrl = cols[photoIdx]
    if (key && photoUrl) {
      mapping.set(key, photoUrl)
    }
  }

  return mapping
}

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
    const consentChecked = formData.get('consentChecked') === 'true'

    if (!consentChecked) {
      return NextResponse.json(
        { error: 'Consent confirmation required for bulk photo upload' },
        { status: 400 }
      )
    }

    const supabase = getServiceSupabase()

    const { data: staff, error: staffError } = await supabase
      .from('partnership_staff')
      .select('id, email, first_name, last_name')
      .eq('partnership_id', partnershipId)

    if (staffError || !staff) {
      return NextResponse.json({ error: 'Failed to fetch staff roster' }, { status: 500 })
    }

    const staffByEmail = new Map(staff.map(s => [s.email.toLowerCase(), s]))
    const staffByName = new Map(staff.map(s => [`${s.first_name} ${s.last_name}`.toLowerCase(), s]))
    const staffById = new Map(staff.map(s => [s.id, s]))

    const result: BulkResult = { matched: 0, uploaded: 0, failed: [], skipped: [] }
    const now = new Date().toISOString()

    const zipFile = formData.get('photos') as File | null
    const csvFile = formData.get('csv') as File | null

    if (zipFile && zipFile.size > 0) {
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer())
      const entries = await extractZipEntries(zipBuffer)

      for (const [filename, imageBuffer] of entries) {
        const staffMember = staffByEmail.get(filename) || staffByName.get(filename)

        if (!staffMember) {
          result.skipped.push(filename)
          continue
        }

        result.matched++

        try {
          const thumbBuffer = await sharp(imageBuffer)
            .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer()

          const fullBuffer = await sharp(imageBuffer)
            .resize(FULL_SIZE, FULL_SIZE, { fit: 'cover' })
            .webp({ quality: 85 })
            .toBuffer()

          const basePath = `${partnershipId}/${staffMember.id}`

          const [thumbUpload, fullUpload] = await Promise.all([
            supabase.storage.from('staff-photos').upload(`${basePath}/thumb.webp`, thumbBuffer, {
              contentType: 'image/webp', upsert: true
            }),
            supabase.storage.from('staff-photos').upload(`${basePath}/full.webp`, fullBuffer, {
              contentType: 'image/webp', upsert: true
            })
          ])

          if (thumbUpload.error || fullUpload.error) {
            result.failed.push(`${staffMember.email}: storage upload failed`)
            continue
          }

          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from('staff-photos').getPublicUrl(`${basePath}/thumb.webp`)
          const { data: { publicUrl: fullUrl } } = supabase.storage
            .from('staff-photos').getPublicUrl(`${basePath}/full.webp`)

          await supabase.from('partnership_staff').update({
            photo_url: fullUrl,
            photo_thumb_url: thumbUrl,
            photo_uploaded_at: now,
            photo_source: 'bulk_import',
            consent_checked_at: now,
            updated_at: now
          }).eq('id', staffMember.id)

          result.uploaded++
        } catch (err) {
          result.failed.push(`${staffMember.email}: processing failed`)
        }
      }
    }

    if (csvFile && csvFile.size > 0) {
      const csvText = await csvFile.text()
      const photoMapping = parseCSVPhotoColumn(csvText)

      for (const [key, photoUrl] of photoMapping) {
        const staffMember = staffByEmail.get(key) || staffById.get(key)

        if (!staffMember) {
          result.skipped.push(key)
          continue
        }

        result.matched++

        try {
          const response = await fetch(photoUrl)
          if (!response.ok) {
            result.failed.push(`${key}: failed to fetch photo URL`)
            continue
          }

          const imageBuffer = Buffer.from(await response.arrayBuffer())

          const thumbBuffer = await sharp(imageBuffer)
            .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
            .webp({ quality: 80 })
            .toBuffer()

          const fullBuffer = await sharp(imageBuffer)
            .resize(FULL_SIZE, FULL_SIZE, { fit: 'cover' })
            .webp({ quality: 85 })
            .toBuffer()

          const basePath = `${partnershipId}/${staffMember.id}`

          const [thumbUpload, fullUpload] = await Promise.all([
            supabase.storage.from('staff-photos').upload(`${basePath}/thumb.webp`, thumbBuffer, {
              contentType: 'image/webp', upsert: true
            }),
            supabase.storage.from('staff-photos').upload(`${basePath}/full.webp`, fullBuffer, {
              contentType: 'image/webp', upsert: true
            })
          ])

          if (thumbUpload.error || fullUpload.error) {
            result.failed.push(`${key}: storage upload failed`)
            continue
          }

          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from('staff-photos').getPublicUrl(`${basePath}/thumb.webp`)
          const { data: { publicUrl: fullUrl } } = supabase.storage
            .from('staff-photos').getPublicUrl(`${basePath}/full.webp`)

          await supabase.from('partnership_staff').update({
            photo_url: fullUrl,
            photo_thumb_url: thumbUrl,
            photo_uploaded_at: now,
            photo_source: 'bulk_import',
            consent_checked_at: now,
            updated_at: now
          }).eq('id', staffMember.id)

          result.uploaded++
        } catch (err) {
          result.failed.push(`${key}: processing failed`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      result
    })
  } catch (error) {
    console.error('Bulk photo import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
