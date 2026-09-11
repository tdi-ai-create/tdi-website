/**
 * Render the Spanish PDF for every Quick Win that has a Spanish payload.
 *
 * Calls `/api/hub/generate-pdf` rather than rendering here, so the file a
 * teacher downloads comes off the same code path as every other document on the
 * Hub. A second renderer in a script is how two documents that should be
 * identical quietly stop being identical.
 *
 * Writes nothing itself. The route writes the _es columns and nothing else.
 *
 *   npx tsx scripts/render-quick-win-spanish.ts --dryRun
 *   npx tsx scripts/render-quick-win-spanish.ts --limit 3
 *   npx tsx scripts/render-quick-win-spanish.ts --base https://www.teachersdeserveit.com
 *
 * Defaults to http://localhost:3011, so start the dev server first. It talks to
 * the live Hub database either way, because that is where the payloads are.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const DEFAULT_BASE = 'http://localhost:3011'

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

type Row = {
  id: string
  slug: string | null
  tool_type: string | null
  tool_content_es: unknown
  guide_sections_es: unknown
  tool_file_url_es: string | null
  file_url_es: string | null
}

async function post(base: string, syncKey: string, body: unknown): Promise<{ ok: boolean; detail: string }> {
  const res = await fetch(`${base}/api/hub/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${syncKey}` },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) return { ok: false, detail: `HTTP ${res.status}: ${text.slice(0, 200)}` }
  try {
    const json = JSON.parse(text) as { success?: boolean; error?: string }
    if (!json.success) return { ok: false, detail: json.error || 'no success flag in response' }
  } catch {
    return { ok: false, detail: `unparseable response: ${text.slice(0, 120)}` }
  }
  return { ok: true, detail: 'rendered' }
}

async function main() {
  const dryRun = process.argv.includes('--dryRun')
  const limitArg = process.argv.indexOf('--limit')
  const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : undefined
  const baseArg = process.argv.indexOf('--base')
  const base = baseArg > -1 ? process.argv[baseArg + 1] : DEFAULT_BASE

  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) throw new Error('PAPERCLIP_SYNC_KEY is not set')

  const supabase = db()

  const { data, error } = await supabase
    .from('hub_quick_wins')
    .select('id, slug, tool_type, tool_content_es, guide_sections_es, tool_file_url_es, file_url_es')
    .eq('is_published', true)
    .or('tool_content_es.not.is.null,guide_sections_es.not.is.null')

  if (error) throw new Error(`could not read the queue: ${error.message}`)

  // Only what is missing a file. Re-rendering a document that already exists
  // would clear its Spanish review stamp for no reason.
  const queue = (data as Row[] || [])
    .filter(r => (r.tool_content_es && !r.tool_file_url_es) || (r.guide_sections_es && !r.file_url_es))
    .slice(0, limit)

  if (queue.length === 0) {
    console.log('Nothing to render. Every Spanish payload already has a file.')
    return
  }

  console.log(`${queue.length} item(s) to render via ${base}${dryRun ? ', dry run, nothing will be called' : ''}.\n`)

  let rendered = 0
  const failures: string[] = []

  for (const row of queue) {
    const label = row.slug || row.id

    if (dryRun) {
      const parts = [
        row.tool_content_es && !row.tool_file_url_es ? `tool (${row.tool_type || 'no type'})` : null,
        row.guide_sections_es && !row.file_url_es ? 'guide' : null,
      ].filter(Boolean)
      console.log(`  ${label}: would render ${parts.join(' and ')}`)
      continue
    }

    let itemFailed = false

    if (row.tool_content_es && !row.tool_file_url_es) {
      if (!row.tool_type) {
        console.log(`  ${label}: skipped tool, no tool_type on the row`)
        itemFailed = true
      } else {
        const r = await post(base, syncKey, {
          action: 'generate_tool', id: row.id, lang: 'es',
          tool_type: row.tool_type, tool_content: row.tool_content_es,
          actor: 'render-quick-win-spanish',
        })
        if (!r.ok) { console.log(`  ${label}: tool failed, ${r.detail}`); itemFailed = true }
      }
    }

    if (row.guide_sections_es && !row.file_url_es) {
      const r = await post(base, syncKey, {
        id: row.id, lang: 'es', sections: row.guide_sections_es,
        actor: 'render-quick-win-spanish',
      })
      if (!r.ok) { console.log(`  ${label}: guide failed, ${r.detail}`); itemFailed = true }
    }

    if (itemFailed) failures.push(label)
    else { rendered++; console.log(`  ${label}: rendered`) }
  }

  if (dryRun) {
    console.log(`\nDry run complete. ${queue.length} item(s) would be rendered. Nothing was called.`)
    return
  }

  // Counted from the database rather than from the loop.
  const { count } = await supabase
    .from('hub_quick_wins')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)
    .or('tool_file_url_es.not.is.null,file_url_es.not.is.null')

  console.log(`\nRendered ${rendered}. Published items now carrying a Spanish file, read back: ${count}.`)
  if (failures.length) console.log(`Failed: ${failures.join(', ')}`)
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
