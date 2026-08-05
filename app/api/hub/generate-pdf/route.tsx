/** @jsxImportSource react */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuickWinPDF, type QuickWinSections } from '@/lib/pdf/quick-win-template'
import React from 'react'

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
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${syncKey}`
}

/**
 * Generate a branded TDI Quick Win PDF from structured content.
 *
 * POST /api/hub/generate-pdf
 * Auth: Bearer $PAPERCLIP_SYNC_KEY
 *
 * Body: {
 *   id: "quick-win-uuid",
 *   sections: {
 *     overview: "...",
 *     rationale: "...",
 *     steps: ["Step 1...", "Step 2..."],
 *     adapt_it: ["For paras...", "For leaders..."],
 *     try_it: "...",
 *     reflection: "..."
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, sections } = body as { id: string; sections: QuickWinSections }
    const supabase = db()

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    if (!sections) return NextResponse.json({ error: 'sections object is required' }, { status: 400 })

    // Validate required sections
    const required = ['overview', 'rationale', 'steps', 'try_it', 'reflection'] as const
    const missingSections: string[] = []
    for (const key of required) {
      const val = sections[key]
      if (!val || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0)) {
        missingSections.push(key)
      }
    }
    if (missingSections.length > 0) {
      return NextResponse.json({ error: `Missing required sections: ${missingSections.join(', ')}` }, { status: 400 })
    }

    // Fetch the Quick Win metadata
    const { data: qw, error: fetchErr } = await supabase
      .from('hub_quick_wins')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

    // Generate branded PDF
    const pdfBuffer = await renderToBuffer(
      <QuickWinPDF
        data={{
          title: qw.title,
          category: qw.category || '',
          description: qw.description || '',
          roles: qw.roles || [],
          lift: qw.lift || '',
          duration_minutes: qw.duration_minutes,
          sections,
        }}
      />
    )

    // Upload to Supabase storage
    const pdfFilename = `${qw.slug || 'quick-win'}.pdf`
    const storagePath = `quick-wins/${qw.id}/${pdfFilename}`

    const { error: uploadErr } = await supabase.storage
      .from('hub-assets')
      .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadErr) return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })

    const { data: urlData } = supabase.storage.from('hub-assets').getPublicUrl(storagePath)
    const publicUrl = urlData?.publicUrl

    // Update the Quick Win record with the PDF URL
    const { error: updateErr } = await supabase
      .from('hub_quick_wins')
      .update({
        file_url: publicUrl,
        file_path: storagePath,
        file_type: 'application/pdf',
        content_type: 'pdf',
        storage_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', qw.id)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ success: true, file_url: publicUrl, storage_path: storagePath })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-pdf] POST error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
