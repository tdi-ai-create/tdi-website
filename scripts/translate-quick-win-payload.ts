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
import { payloadSystemPrompt, BANNED_IN_TRANSLATION } from '../lib/hub/spanish-glossary'

config({ path: '.env.local' })

const MODEL = 'claude-opus-5'

/**
 * Keys whose values are machinery rather than prose. Translating `tool_type`
 * into Spanish would produce a payload the renderer cannot dispatch on.
 */
const NOT_PROSE = new Set([
  'type', 'tool_type', 'lang', 'id', 'slug', 'url', 'href', 'icon',
  'color', 'colour', 'category', 'weight', 'variant', 'style',
])

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }

/** Every translatable string in the payload, with the path to put it back. */
function collectStrings(node: Json, path: (string | number)[], out: { path: (string | number)[]; text: string }[]) {
  if (typeof node === 'string') {
    const trimmed = node.trim()
    // A bare number, a short acronym, or an empty string is not worth a round
    // trip and is exactly what a translator garbles.
    if (trimmed && !/^[\d\s.,%:/-]+$/.test(trimmed)) out.push({ path, text: node })
    return
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => collectStrings(child, [...path, i], out))
    return
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (NOT_PROSE.has(key)) continue
      collectStrings(value as Json, [...path, key], out)
    }
  }
}

function setAtPath(root: Json, path: (string | number)[], value: string) {
  let node: Json = root
  for (let i = 0; i < path.length - 1; i++) {
    node = (node as Record<string, Json>)[path[i] as string]
  }
  ;(node as Record<string, Json>)[path[path.length - 1] as string] = value
}

function parseLines(text: string): { n: number; es: string }[] {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned) as { lines?: unknown }
  if (!Array.isArray(parsed.lines)) throw new Error('no lines array in response')
  return parsed.lines as { n: number; es: string }[]
}

async function translatePayload(client: Anthropic, payload: Json, label: string): Promise<Json> {
  const strings: { path: (string | number)[]; text: string }[] = []
  collectStrings(payload, [], strings)
  if (strings.length === 0) throw new Error(`${label}: nothing translatable in this payload`)

  const numbered = strings.map((s, i) => `${i + 1}. ${s.text}`).join('\n')

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: payloadSystemPrompt(),
    messages: [{ role: 'user', content: numbered }],
  })

  if (response.stop_reason === 'refusal') throw new Error(`${label}: the model declined this payload`)

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  const lines = parseLines(text)

  // Every line back, exactly once, or the payload is rebuilt with holes in it.
  const seen = new Map<number, string>()
  for (const line of lines) {
    if (!Number.isInteger(line.n) || line.n < 1 || line.n > strings.length) {
      throw new Error(`${label}: response carries line ${line.n}, which was not sent`)
    }
    if (seen.has(line.n)) throw new Error(`${label}: response repeats line ${line.n}`)
    if (!line.es?.trim()) throw new Error(`${label}: empty translation on line ${line.n}`)
    if (BANNED_IN_TRANSLATION.test(line.es)) throw new Error(`${label}: dash came back on line ${line.n}`)
    seen.set(line.n, line.es)
  }
  if (seen.size !== strings.length) {
    throw new Error(`${label}: sent ${strings.length} lines, got ${seen.size} back`)
  }

  const translated = JSON.parse(JSON.stringify(payload)) as Json
  strings.forEach((s, i) => setAtPath(translated, s.path, seen.get(i + 1)!))
  return translated
}

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
    .select('id, slug, title, guide_sections, tool_content, guide_sections_es, tool_content_es, reviewed_at')
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
      if (row.tool_content) patch.tool_content_es = await translatePayload(client, row.tool_content as Json, `${label} tool`)
      if (row.guide_sections) patch.guide_sections_es = await translatePayload(client, row.guide_sections as Json, `${label} guide`)

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
