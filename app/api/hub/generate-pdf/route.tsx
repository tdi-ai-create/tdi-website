/** @jsxImportSource react */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { QuickWinPDF, type QuickWinSections } from '@/lib/pdf/quick-win-template'
import { ChecklistPDF, type ChecklistData } from '@/lib/pdf/quick-win-checklist'
import { FormPDF, type FormData } from '@/lib/pdf/quick-win-form'
import { ReferencePDF, type ReferenceData } from '@/lib/pdf/quick-win-reference'
import { ToolkitPDF, type ToolkitData } from '@/lib/pdf/quick-win-toolkit'
import React from 'react'
import { retireReviewStamp } from '@/lib/hub/replace-file'

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
    const supabase = db()
    const action = body.action || 'generate_pdf'

    if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    // Route to generate_tool if action specified
    if (action === 'generate_tool') {
      const { id, tool_type, tool_content } = body
      if (!tool_type) return NextResponse.json({ error: 'tool_type is required (checklist | form | reference_card | toolkit)' }, { status: 400 })
      if (!tool_content) return NextResponse.json({ error: 'tool_content is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id, slug, title, qa_notes, reviewed_at, reviewed_by')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      let pdfBuffer: Buffer
      if (tool_type === 'checklist') {
        pdfBuffer = await renderToBuffer(<ChecklistPDF data={tool_content as ChecklistData} />)
      } else if (tool_type === 'form') {
        pdfBuffer = await renderToBuffer(<FormPDF data={tool_content as FormData} />)
      } else if (tool_type === 'reference_card') {
        pdfBuffer = await renderToBuffer(<ReferencePDF data={tool_content as ReferenceData} />)
      } else if (tool_type === 'toolkit') {
        pdfBuffer = await renderToBuffer(<ToolkitPDF data={tool_content as ToolkitData} />)
      } else {
        return NextResponse.json({ error: `Unknown tool_type: ${tool_type}` }, { status: 400 })
      }

      const toolFilename = `${qw.slug || 'tool'}-resource.pdf`
      const storagePath = `quick-wins/${qw.id}/${toolFilename}`

      const { error: uploadErr } = await supabase.storage
        .from('hub-assets')
        .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

      if (uploadErr) return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })

      const { data: urlData } = supabase.storage.from('hub-assets').getPublicUrl(storagePath)
      const toolUrl = urlData?.publicUrl

      // The stamp describes the file it was given, so it retires with that file.
      // Same update as the new URL: a document can never be live under a review
      // of the document it replaced.
      const now = new Date().toISOString()
      const retired = retireReviewStamp(qw, 'tool', body.actor || 'generate_tool', now)

      const { error: updateErr } = await supabase
        .from('hub_quick_wins')
        .update({
          tool_file_url: toolUrl,
          tool_file_path: storagePath,
          tool_type,
          updated_at: now,
          ...retired.patch,
        })
        .eq('id', qw.id)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      // A 200 has proved nothing on this table before (TEA-236), so read it back.
      const { data: after } = await supabase
        .from('hub_quick_wins')
        .select('tool_file_url, reviewed_at')
        .eq('id', qw.id)
        .single()

      if (after?.tool_file_url !== toolUrl || after?.reviewed_at !== null) {
        return NextResponse.json(
          { error: 'Tool replacement did not stick. The file or the cleared review stamp is not what was written.' },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        tool_file_url: toolUrl,
        storage_path: storagePath,
        tool_type,
        review_stamp_cleared: retired.hadStamp,
        needs_qa: true,
      })
    }

    // Default: generate_pdf (guide)
    const { id, sections } = body as { id: string; sections: QuickWinSections }

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
