/**
 * Backfill Spanish titles and descriptions on published Hub Quick Wins.
 *
 * Why this is not Google Translate. The lazy path in /api/hub/translate uses the
 * Google Translate API, which renders "coach" as "entrenador", the sports kind.
 * An instructional coach is an asesor, and a teacher reading "entrenador" on a
 * card learns immediately that nobody who speaks Spanish looked at this. The
 * glossary below fixes the terms that a general translator gets wrong in a US
 * K-12 context. Rae's call, 9 Sep 2026.
 *
 * Writes title_es and description_es only. It never touches the English fields,
 * the files, or is_published, so a bad translation is a text correction and not
 * an outage.
 *
 *   npx tsx scripts/backfill-quick-win-spanish.ts --dryRun
 *   npx tsx scripts/backfill-quick-win-spanish.ts --dryRun --limit 12
 *   npx tsx scripts/backfill-quick-win-spanish.ts
 *
 * Requires LEARNING_HUB_SUPABASE_URL (or the NEXT_PUBLIC_ variant),
 * LEARNING_HUB_SUPABASE_SERVICE_KEY, and ANTHROPIC_API_KEY.
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { cardSystemPrompt, BANNED_IN_TRANSLATION } from '../lib/hub/spanish-glossary'

config({ path: '.env.local' })

const MODEL = 'claude-opus-5'

// Small enough that one bad batch costs little and the JSON stays short enough
// to come back whole.
const BATCH_SIZE = 12

type Row = {
  id: string
  slug: string | null
  title: string | null
  description: string | null
}

type Translation = { id: string; title_es: string; description_es: string }

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** The model was told to return bare JSON. Tolerate a fence anyway. */
function parseTranslations(text: string): Translation[] {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const parsed = JSON.parse(cleaned) as { translations?: unknown }
  if (!Array.isArray(parsed.translations)) throw new Error('no translations array in response')
  return parsed.translations as Translation[]
}

async function translateBatch(client: Anthropic, rows: Row[]): Promise<Translation[]> {
  const payload = rows.map(r => ({ id: r.id, title: r.title, description: r.description }))

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: cardSystemPrompt(),
    messages: [{ role: 'user', content: JSON.stringify({ items: payload }) }],
  })

  if (response.stop_reason === 'refusal') {
    throw new Error('the model declined this batch')
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  const translations = parseTranslations(text)

  // The id is how a translation finds its row. A hallucinated or dropped id
  // would write Spanish onto the wrong Quick Win, so this is checked rather
  // than trusted.
  const wanted = new Set(rows.map(r => r.id))
  const seen = new Set<string>()
  for (const t of translations) {
    if (!wanted.has(t.id)) throw new Error(`response carries an id that was not sent: ${t.id}`)
    if (seen.has(t.id)) throw new Error(`response repeats id ${t.id}`)
    if (!t.title_es?.trim() || !t.description_es?.trim()) throw new Error(`empty translation for ${t.id}`)
    if (BANNED_IN_TRANSLATION.test(t.title_es) || BANNED_IN_TRANSLATION.test(t.description_es)) {
      throw new Error(`dashes came back in the translation for ${t.id}`)
    }
    seen.add(t.id)
  }
  if (seen.size !== rows.length) {
    throw new Error(`asked for ${rows.length} translations, got ${seen.size}`)
  }

  return translations
}

async function main() {
  const dryRun = process.argv.includes('--dryRun')
  const limitArg = process.argv.indexOf('--limit')
  const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : undefined

  const supabase = db()
  const client = new Anthropic()

  let query = supabase
    .from('hub_quick_wins')
    .select('id, slug, title, description')
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (limit) query = query.limit(limit)

  const { data: rows, error } = await query
  if (error) throw new Error(`could not read the queue: ${error.message}`)
  if (!rows?.length) {
    console.log('Nothing published to translate.')
    return
  }

  console.log(`${rows.length} published Quick Wins${dryRun ? ', dry run, nothing will be written' : ''}.\n`)

  let written = 0
  const failures: string[] = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE) as Row[]
    const label = `batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} items)`

    let translations: Translation[]
    try {
      translations = await translateBatch(client, batch)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error'
      console.log(`${label}: FAILED, ${message}`)
      failures.push(...batch.map(b => b.slug || b.id))
      continue
    }

    const bySlug = new Map(batch.map(b => [b.id, b.slug]))

    for (const t of translations) {
      if (dryRun) {
        const original = batch.find(b => b.id === t.id)
        console.log(`  ${bySlug.get(t.id)}`)
        console.log(`    EN  ${original?.title}`)
        console.log(`    ES  ${t.title_es}`)
        console.log(`    ES  ${t.description_es}\n`)
        continue
      }

      const { error: writeErr } = await supabase
        .from('hub_quick_wins')
        .update({ title_es: t.title_es, description_es: t.description_es })
        .eq('id', t.id)

      if (writeErr) {
        console.log(`  ${bySlug.get(t.id)}: write failed, ${writeErr.message}`)
        failures.push(bySlug.get(t.id) || t.id)
        continue
      }
      written++
    }

    if (!dryRun) console.log(`${label}: ${translations.length} translated`)
  }

  if (dryRun) {
    console.log(`Dry run complete. ${rows.length} items would be written. Zero writes made.`)
    return
  }

  // A 200 from PostgREST has proved nothing on this table before (TEA-236),
  // so the count comes from reading the rows back.
  const { count } = await supabase
    .from('hub_quick_wins')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true)
    .not('title_es', 'is', null)

  console.log(`\nWrote ${written}. Published items now carrying a Spanish title, read back: ${count}.`)
  if (failures.length) console.log(`Failed: ${failures.join(', ')}`)
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
