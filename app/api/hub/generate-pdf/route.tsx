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
import { safeContent } from '@/lib/pdf/safe-text'
import type { Lang } from '@/lib/pdf/labels'

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
 * Live content is writable by anyone who can call this route.
 *
 * Published Quick Wins were overwritten with placeholder text three times
 * between 3 and 8 September, every time by an agent probing the payload shape
 * against a live item rather than a draft (TEA-412, TEA-427, TEA-437). This is
 * the only write path to hub_quick_wins with no is_published check; every other
 * one has had it for months. It also accepted an actor and never recorded it,
 * so each incident had to be spotted by eye rather than announcing itself.
 *
 * The rebuild queue legitimately writes to published items, because the replace
 * lane is defined as "rebuild, stays live meanwhile", so refusing outright would
 * stop roughly 148 items of real work. This ships reporting-only: it names the
 * write and who made it, and lets it through. Once the callers doing legitimate
 * rebuilds pass allowPublished, the same function starts refusing.
 *
 * Enforcement never outruns the callers. See docs/hub-content-standard.md.
 */
const ENFORCE_PUBLISHED_GUARD = false

function guardPublishedWrite(
  qw: { id: string; slug?: string | null; is_published?: boolean | null },
  target: 'tool' | 'guide',
  actor: string,
  allowPublished: boolean,
  lang: Lang = 'en'
): { refuse: NextResponse | null; warning: string | null } {
  if (!qw.is_published || allowPublished) return { refuse: null, warning: null }

  // A Spanish render writes only the _es columns. It cannot overwrite the
  // document this guard exists to protect, and the Spanish editions of live
  // items are the normal case rather than the exception. Guarding them would
  // mean that the day this becomes enforcing, every routine Spanish render on a
  // published item starts being refused for a write it never makes.
  if (lang === 'es') return { refuse: null, warning: null }

  const message =
    `${actor} is overwriting the ${target} file of PUBLISHED Quick Win ` +
    `${qw.slug || qw.id} without allowPublished. If this is a rebuild, pass ` +
    `allowPublished: true. If this is a schema probe, use an unpublished draft.`

  console.warn('[generate-pdf] published-write', JSON.stringify({
    quickWinId: qw.id, slug: qw.slug, target, actor, enforced: ENFORCE_PUBLISHED_GUARD,
  }))

  if (!ENFORCE_PUBLISHED_GUARD) return { refuse: null, warning: message }

  return {
    refuse: NextResponse.json(
      { error: message, published: true, hint: 'allowPublished: true, or probe against a draft' },
      { status: 409 }
    ),
    warning: null,
  }
}

/**
 * Which language this render is in, and which columns it therefore writes.
 *
 * A Spanish edition is the same payload rendered again through the same
 * template, so it shares this route rather than getting one of its own. It
 * writes only the _es columns, so an English document can never be replaced by
 * a Spanish render and a failed Spanish render cannot take an English file
 * down with it. See docs/hub-bilingual-resource-spec.md.
 */
function langOf(body: { lang?: unknown }): Lang | null {
  const raw = body.lang
  if (raw === undefined || raw === null || raw === 'en') return 'en'
  if (raw === 'es') return 'es'
  return null
}

/** File naming. The English names are unchanged, Spanish takes an -es suffix. */
function suffixed(base: string, lang: Lang): string {
  return lang === 'es' ? `${base}-es` : base
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
      const { id, tool_type } = body
      const lang = langOf(body)
      if (!lang) return NextResponse.json({ error: 'lang must be "en" or "es"' }, { status: 400 })
      // Strip characters Helvetica cannot draw before anything is rendered.
      // Applied here so it covers every tool_type, including future ones.
      const tool_content = safeContent(body.tool_content)
      if (!tool_type) return NextResponse.json({ error: 'tool_type is required (checklist | form | reference_card | toolkit)' }, { status: 400 })
      if (!tool_content) return NextResponse.json({ error: 'tool_content is required' }, { status: 400 })

      const { data: qw, error: fetchErr } = await supabase
        .from('hub_quick_wins')
        .select('id, slug, title, qa_notes, reviewed_at, reviewed_by, is_published, translated_at')
        .eq('id', id)
        .single()

      if (fetchErr || !qw) return NextResponse.json({ error: 'Quick Win not found' }, { status: 404 })

      // Checked before anything is rendered or uploaded, so a refusal can never
      // leave a half-applied write or a retired review stamp behind.
      const toolGuard = guardPublishedWrite(
        qw, 'tool', body.actor || 'generate_tool', body.allowPublished === true, lang
      )
      if (toolGuard.refuse) return toolGuard.refuse

      let pdfBuffer: Buffer
      if (tool_type === 'checklist') {
        pdfBuffer = await renderToBuffer(<ChecklistPDF data={{ ...(tool_content as ChecklistData), lang }} />)
      } else if (tool_type === 'form') {
        pdfBuffer = await renderToBuffer(<FormPDF data={{ ...(tool_content as FormData), lang }} />)
      } else if (tool_type === 'reference_card') {
        pdfBuffer = await renderToBuffer(<ReferencePDF data={{ ...(tool_content as ReferenceData), lang }} />)
      } else if (tool_type === 'toolkit') {
        pdfBuffer = await renderToBuffer(<ToolkitPDF data={{ ...(tool_content as ToolkitData), lang }} />)
      } else {
        return NextResponse.json({ error: `Unknown tool_type: ${tool_type}` }, { status: 400 })
      }

      const toolFilename = `${suffixed(`${qw.slug || 'tool'}-resource`, lang)}.pdf`
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

      // An English render retires the English review stamp, because the stamp
      // describes the file it was given. A Spanish render must not: it does not
      // touch the English document, and clearing reviewed_at would send an
      // already-reviewed English item back through QA for a change that did not
      // happen to it. Spanish carries its own stamp instead.
      const retired = lang === 'en'
        ? retireReviewStamp(qw, 'tool', body.actor || 'generate_tool', now)
        : { patch: { translated_at: null, translated_by: null }, hadStamp: !!qw.translated_at }

      const languageColumns = lang === 'es'
        ? {
            tool_file_url_es: toolUrl,
            tool_file_path_es: storagePath,
            tool_content_es: tool_content,
          }
        : {
            tool_file_url: toolUrl,
            tool_file_path: storagePath,
            // The payload that produced this file, kept so a damaged or
            // overwritten PDF can be regenerated instead of rewritten. Storage
            // upserts in place, so before this the rendered file was the only
            // copy and ell-empathy-audit proved that unrecoverable on 8 Sep.
            tool_content,
          }

      const { error: updateErr } = await supabase
        .from('hub_quick_wins')
        .update({
          ...languageColumns,
          tool_type,
          updated_at: now,
          ...retired.patch,
        })
        .eq('id', qw.id)

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      // A 200 has proved nothing on this table before (TEA-236), so read it back.
      const { data: after } = await supabase
        .from('hub_quick_wins')
        .select('tool_file_url, tool_file_url_es, reviewed_at, translated_at')
        .eq('id', qw.id)
        .single()

      const wroteUrl = lang === 'es' ? after?.tool_file_url_es : after?.tool_file_url
      const clearedStamp = lang === 'es' ? after?.translated_at : after?.reviewed_at

      if (wroteUrl !== toolUrl || clearedStamp !== null) {
        return NextResponse.json(
          { error: 'Tool replacement did not stick. The file or the cleared review stamp is not what was written.' },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        lang,
        tool_file_url: toolUrl,
        storage_path: storagePath,
        tool_type,
        review_stamp_cleared: retired.hadStamp,
        needs_qa: true,
        ...(toolGuard.warning ? { warning: toolGuard.warning } : {}),
      })
    }

    // Default: generate_pdf (guide)
    const { id } = body as { id: string }
    const lang = langOf(body)
    if (!lang) return NextResponse.json({ error: 'lang must be "en" or "es"' }, { status: 400 })
    const sections = safeContent((body as { sections: QuickWinSections }).sections)

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

    // Same check as the tool path, before any render or upload. The most recent
    // live-content incident (TEA-437) was a guide, not a tool, so guarding only
    // the tool path would have left the route that actually broken.
    const guideGuard = guardPublishedWrite(
      qw, 'guide', (body as { actor?: string }).actor || 'generate_pdf',
      (body as { allowPublished?: boolean }).allowPublished === true, lang
    )
    if (guideGuard.refuse) return guideGuard.refuse

    // Generate branded PDF
    const pdfBuffer = await renderToBuffer(
      <QuickWinPDF
        data={{
          title: (lang === 'es' ? qw.title_es : qw.title) || qw.title,
          category: qw.category || '',
          description: (lang === 'es' ? qw.description_es : qw.description) || '',
          roles: qw.roles || [],
          lift: qw.lift || '',
          duration_minutes: qw.duration_minutes,
          sections,
          lang,
        }}
      />
    )

    // Upload to Supabase storage
    const pdfFilename = `${suffixed(qw.slug || 'quick-win', lang)}.pdf`
    const storagePath = `quick-wins/${qw.id}/${pdfFilename}`

    const { error: uploadErr } = await supabase.storage
      .from('hub-assets')
      .upload(storagePath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (uploadErr) return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 })

    const { data: urlData } = supabase.storage.from('hub-assets').getPublicUrl(storagePath)
    const publicUrl = urlData?.publicUrl

    // Update the Quick Win record with the PDF URL
    // Spanish writes only the _es columns. file_type, content_type and
    // storage_path describe the English document the Hub falls back to, so a
    // Spanish render leaves them alone.
    const guideColumns = lang === 'es'
      ? {
          file_url_es: publicUrl,
          file_path_es: storagePath,
          guide_sections_es: sections,
          translated_at: null,
          translated_by: null,
        }
      : {
          file_url: publicUrl,
          file_path: storagePath,
          file_type: 'application/pdf',
          content_type: 'pdf',
          storage_path: storagePath,
          // Same reason as tool_content on the other path: keep what produced
          // the file so it can be regenerated rather than rewritten.
          guide_sections: sections,
        }

    const { error: updateErr } = await supabase
      .from('hub_quick_wins')
      .update({ ...guideColumns, updated_at: new Date().toISOString() })
      .eq('id', qw.id)

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    // A 200 from PostgREST has proved nothing on this table before (TEA-236).
    const { data: after } = await supabase
      .from('hub_quick_wins')
      .select('file_url, file_url_es')
      .eq('id', qw.id)
      .single()

    const wroteUrl = lang === 'es' ? after?.file_url_es : after?.file_url
    if (wroteUrl !== publicUrl) {
      return NextResponse.json(
        { error: 'Guide write did not stick. The file URL is not what was written.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      lang,
      file_url: publicUrl,
      storage_path: storagePath,
      ...(guideGuard.warning ? { warning: guideGuard.warning } : {}),
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[generate-pdf] POST error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
