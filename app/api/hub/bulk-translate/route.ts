import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/hub/bulk-translate
 * One-time endpoint to bulk-translate all published hub_quick_wins titles + descriptions to Spanish.
 * Uses the Hub Supabase project and Google Translate API.
 */

const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  if (!API_KEY || texts.length === 0) return texts

  // Google Translate supports batch translation via array of q params
  const response = await fetch(
    `${GOOGLE_TRANSLATE_URL}?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts,
        source: 'en',
        target: targetLang,
        format: 'text',
      }),
    }
  )

  if (!response.ok) {
    console.error('Google Translate batch error:', response.status)
    return texts
  }

  const data = await response.json()
  const translations = data.data?.translations || []
  return texts.map((original, i) => translations[i]?.translatedText || original)
}

export async function POST() {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_TRANSLATE_API_KEY not set' }, { status: 500 })
    }

    // Get all published quick wins missing Spanish titles
    const { data: quickWins, error } = await supabase
      .from('hub_quick_wins')
      .select('id, title, description')
      .eq('is_published', true)
      .is('title_es', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!quickWins || quickWins.length === 0) {
      return NextResponse.json({ message: 'All quick wins already translated', count: 0 })
    }

    console.log(`[bulk-translate] Translating ${quickWins.length} quick wins...`)

    // Batch translate titles (Google supports up to 128 texts per request)
    const titles = quickWins.map(qw => qw.title || '')
    const descriptions = quickWins.map(qw => qw.description || '')

    // Translate in chunks of 50
    const chunkSize = 50
    let translatedTitles: string[] = []
    let translatedDescriptions: string[] = []

    for (let i = 0; i < titles.length; i += chunkSize) {
      const titleChunk = titles.slice(i, i + chunkSize)
      const descChunk = descriptions.slice(i, i + chunkSize)

      const [tTitles, tDescs] = await Promise.all([
        translateBatch(titleChunk, 'es'),
        translateBatch(descChunk, 'es'),
      ])

      translatedTitles = [...translatedTitles, ...tTitles]
      translatedDescriptions = [...translatedDescriptions, ...tDescs]
    }

    // Update each row
    let updated = 0
    for (let i = 0; i < quickWins.length; i++) {
      const { error: updateError } = await supabase
        .from('hub_quick_wins')
        .update({
          title_es: translatedTitles[i],
          description_es: translatedDescriptions[i] || null,
        })
        .eq('id', quickWins[i].id)

      if (!updateError) updated++
      else console.error(`[bulk-translate] Error updating ${quickWins[i].id}:`, updateError.message)
    }

    console.log(`[bulk-translate] Done. Updated ${updated}/${quickWins.length} quick wins.`)

    return NextResponse.json({
      message: `Translated ${updated} quick wins to Spanish`,
      total: quickWins.length,
      updated,
    })
  } catch (err) {
    console.error('[bulk-translate] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
