/**
 * Translate a Quick Win's document payload into Spanish.
 *
 * This writes `guide_sections_es` and `tool_content_es` and nothing else. Not
 * files, not English fields, not `translated_at`. Rendering is a separate step
 * and review is a separate step after that, so a bad translation caught here
 * costs one column update.
 *
 * How the payload survives. The model never sees the JSON structure: strings
 * are flattened to a numbered list, translated, and put back at the exact paths
 * they came from. A model handed nested JSON will occasionally improve the
 * nesting, and a payload whose shape changed will not render.
 *
 *   npx tsx scripts/translate-quick-win-payload.ts --dryRun --limit 3
 *   npx tsx scripts/translate-quick-win-payload.ts --slug friction-free-leadership
 *   npx tsx scripts/translate-quick-win-payload.ts
 *
 * Requires LEARNING_HUB_SUPABASE_URL (or the NEXT_PUBLIC_ variant),
 * LEARNING_HUB_SUPABASE_SERVICE_KEY, and ANTHROPIC_API_KEY.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { translatePayload, alignTitle, type Json } from '../lib/hub/translate-payload'

config({ path: '.env.local' })
function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function main() {
  const dryRun = process.argv.includes('--dryRun')
  const limitArg = process.argv.indexOf('--limit')
  const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : undefined
  const slugArg = process.argv.indexOf('--slug')
  const slug = slugArg > -1 ? process.argv[slugArg + 1] : undefined

  const supabase = db()
  const client = new Anthropic()

  let query = supabase
    .from('hub_quick_wins')
    .select('id, slug, title, title_es, guide_sections, tool_content, guide_sections_es, tool_content_es, reviewed_at')
    .eq('is_published', true)

  if (slug) query = query.eq('slug', slug)

  const { data: rows, error } = await query
  if (error) throw new Error(`could not read the queue: ${error.message}`)

  // Only items with an English payload and an English review. The rest are
  // waiting on the rebuild queue, not on Spanish.
  const queue = (rows || [])
    .filter(r => (r.guide_sections || r.tool_content) && r.reviewed_at)
    .filter(r => !r.guide_sections_es && !r.tool_content_es)
    .slice(0, limit)

  if (queue.length === 0) {
    console.log('Nothing to translate. Every reviewed item with a payload already has a Spanish one.')
    return
  }

  console.log(`${queue.length} item(s) to translate${dryRun ? ', dry run, nothing will be written' : ''}.\n`)

  let written = 0
  const failures: string[] = []

  for (const row of queue) {
    const label = row.slug || row.id
    try {
      const patch: Record<string, Json> = {}
      if (row.tool_content) {
        const translated = await translatePayload(client, row.tool_content as Json, `${label} tool`)
        patch.tool_content_es = alignTitle(translated, row.title, row.title_es)
      }
      if (row.guide_sections) {
        const translated = await translatePayload(client, row.guide_sections as Json, `${label} guide`)
        patch.guide_sections_es = alignTitle(translated, row.title, row.title_es)
      }

      if (dryRun) {
        const sample = JSON.stringify(patch.tool_content_es ?? patch.guide_sections_es).slice(0, 220)
        console.log(`  ${label}\n    ${sample}...\n`)
        continue
      }

      const { error: writeErr } = await supabase.from('hub_quick_wins').update(patch).eq('id', row.id)
      if (writeErr) {
        console.log(`  ${label}: write failed, ${writeErr.message}`)
        failures.push(label)
        continue
      }
      written++
      console.log(`  ${label}: translated`)
    } catch (err) {
      console.log(`  ${label}: FAILED, ${err instanceof Error ? err.message : 'unknown error'}`)
      failures.push(label)
    }
  }

  if (dryRun) {
    console.log(`Dry run complete. ${queue.length} item(s) would be written. Zero writes made.`)
    return
  }

  // Counted from the database, not from the loop above.
  const { count } = await supabase
    .from('hub_quick_wins')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)
    .or('tool_content_es.not.is.null,guide_sections_es.not.is.null')

  console.log(`\nWrote ${written}. Published items now carrying a Spanish payload, read back: ${count}.`)
  if (failures.length) console.log(`Failed: ${failures.join(', ')}`)
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
