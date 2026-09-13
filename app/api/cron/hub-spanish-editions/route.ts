import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { translatePayload, alignTitle, type Json } from '@/lib/hub/translate-payload'

/**
 * Build the Spanish edition of anything that has become eligible for one.
 *
 * Step 7 of docs/hub-bilingual-rollout-runbook.md, and the reason the earlier
 * steps were worth doing: without this, every Spanish document is a catch up
 * run somebody remembers to do.
 *
 * An item becomes eligible the moment its English passes QA and it has a
 * structured payload. That happens roughly fifteen to twenty times a day as the
 * rebuild queue runs, so this keeps pace rather than waiting for a batch.
 *
 * **Spanish never blocks an English publish.** This is a separate hourly sweep
 * rather than a step inside publish, deliberately. Translation takes tens of
 * seconds and calls a model that can be slow or refuse, and a publish path that
 * can be held up by either would be abandoned within a week. An item publishes
 * in English immediately and its Spanish follows, usually within the hour.
 *
 * It writes payload columns and renders files. It never stamps a review: every
 * document it produces enters Paloma's queue unread, exactly like one built by
 * hand.
 *
 * `?dryRun=1` names what it would do and writes nothing.
 */

export const maxDuration = 300

/**
 * How many items one run takes on.
 *
 * Each item is one model call plus one render, so roughly twenty to forty
 * seconds. Three fits inside the timeout with room to spare, and three an hour
 * is seventy two a day against a supply of fifteen to twenty. The cap is about
 * finishing inside the window, not about rationing.
 */
const PER_RUN = 3

type Row = {
  id: string
  slug: string | null
  title: string | null
  title_es: string | null
  tool_content: Json | null
  guide_sections: Json | null
  tool_type: string | null
  tool_content_es: Json | null
  guide_sections_es: Json | null
  tool_file_url_es: string | null
  file_url_es: string | null
}

export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1'

  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Learning Hub Supabase not configured' }, { status: 500 })
  }
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) {
    return NextResponse.json({ error: 'PAPERCLIP_SYNC_KEY is not set, cannot render' }, { status: 500 })
  }

  // Eligible: published, English reviewed, and something to translate from.
  // Items with no English review are excluded because Spanish inherits that
  // review and cannot run ahead of it.
  const { data, error } = await supabase
    .from('hub_quick_wins')
    .select('id, slug, title, title_es, tool_content, guide_sections, tool_type, tool_content_es, guide_sections_es, tool_file_url_es, file_url_es')
    .eq('is_published', true)
    .not('reviewed_at', 'is', null)
    .or('tool_content.not.is.null,guide_sections.not.is.null')
    .order('published_at', { ascending: true, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: `Could not read the queue: ${error.message}` }, { status: 500 })
  }

  // Two kinds of unfinished, and the second one is why this is filtered here
  // rather than in the query.
  //
  // An item needs translating when it has no Spanish payload. It needs
  // rendering when it has one and no file, which is where a run lands if the
  // payload write succeeded and the render then failed. An earlier version of
  // this job excluded anything with a payload, which meant exactly that case
  // was never picked up again: payload written, no file, invisible to the
  // review queue because that queue requires a file, and invisible here.
  // Permanently stuck, and quiet about it.
  const waiting = ((data || []) as Row[]).filter(r => {
    const needsToolText = !!r.tool_content && !r.tool_content_es
    const needsGuideText = !!r.guide_sections && !r.guide_sections_es
    const needsToolFile = !!r.tool_content_es && !r.tool_file_url_es
    const needsGuideFile = !!r.guide_sections_es && !r.file_url_es
    return needsToolText || needsGuideText || needsToolFile || needsGuideFile
  })
  const batch = waiting.slice(0, PER_RUN)

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      waiting: waiting.length,
      wouldBuild: batch.map(r => r.slug || r.id),
      note: 'Nothing was translated, rendered or written.',
    })
  }

  const anthropic = new Anthropic()
  const built: string[] = []
  const failed: { slug: string; reason: string }[] = []

  for (const row of batch) {
    const label = row.slug || row.id
    try {
      // Translate only what is missing. An item here because its render failed
      // already has good Spanish text, and re-translating it would spend a
      // model call to produce slightly different wording for no reason.
      const patch: Record<string, Json> = {}

      if (row.tool_content && !row.tool_content_es) {
        const translated = await translatePayload(anthropic, row.tool_content, `${label} tool`)
        patch.tool_content_es = alignTitle(translated, row.title, row.title_es)
      }
      if (row.guide_sections && !row.guide_sections_es) {
        const translated = await translatePayload(anthropic, row.guide_sections, `${label} guide`)
        patch.guide_sections_es = alignTitle(translated, row.title, row.title_es)
      }

      if (Object.keys(patch).length > 0) {
        const { error: writeErr } = await supabase.from('hub_quick_wins').update(patch).eq('id', row.id)
        if (writeErr) {
          failed.push({ slug: label, reason: `payload write failed: ${writeErr.message}` })
          continue
        }
      }

      const toolPayload = patch.tool_content_es ?? row.tool_content_es
      const guidePayload = patch.guide_sections_es ?? row.guide_sections_es

      // Render through the route rather than here, so a Spanish document comes
      // off the same code path as every other document on the Hub.
      const origin = request.nextUrl.origin
      const renders: Promise<Response>[] = []

      if (toolPayload && !row.tool_file_url_es && row.tool_type) {
        renders.push(fetch(`${origin}/api/hub/generate-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${syncKey}` },
          body: JSON.stringify({
            action: 'generate_tool', id: row.id, lang: 'es',
            tool_type: row.tool_type, tool_content: toolPayload,
            actor: 'cron:hub-spanish-editions',
          }),
        }))
      }
      if (guidePayload && !row.file_url_es) {
        renders.push(fetch(`${origin}/api/hub/generate-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${syncKey}` },
          body: JSON.stringify({
            id: row.id, lang: 'es', sections: guidePayload,
            actor: 'cron:hub-spanish-editions',
          }),
        }))
      }

      const results = await Promise.all(renders)
      const bad = results.find(r => !r.ok)
      if (bad) {
        // The payload is written and the file is not. The filter above is what
        // makes that recoverable: it puts this item back in the queue on the
        // next run for the render alone, without paying for the words again.
        failed.push({ slug: label, reason: `render returned HTTP ${bad.status}` })
        continue
      }

      built.push(label)
    } catch (err) {
      failed.push({ slug: label, reason: err instanceof Error ? err.message : 'unknown error' })
    }
  }

  // Counted from the database, not from the loop above.
  const { count: withSpanish } = await supabase
    .from('hub_quick_wins')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)
    .not('translated_at', 'is', null)

  return NextResponse.json({
    built,
    failed,
    waiting_before: waiting.length,
    waiting_after: Math.max(0, waiting.length - built.length),
    reviewed_and_live_ready: withSpanish ?? null,
  })
}
