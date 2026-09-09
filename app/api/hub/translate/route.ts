import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * The Hub database, and only the Hub database.
 *
 * This route read `NEXT_PUBLIC_SUPABASE_URL` until 9 Sep 2026, which is the
 * admin project, not the Learning Hub. `hub_quick_wins` exists in both, and the
 * admin copy is three stale rows with no `title_es` column, so every quick win
 * lookup failed with 42703, `qw` came back null, and the route answered
 * "Quick win not found". The Quick Wins page treats that as an English
 * fallback and says nothing, so the ES toggle looked like it worked while
 * zero of 265 published items ever got a Spanish title. Courses failed the
 * same way. See CLAUDE.md section 2.
 *
 * Built per request rather than at module load so a missing key is an error
 * on the call, with a name attached, instead of a blank import-time crash.
 */
function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !API_KEY) return text

  const response = await fetch(
    `${GOOGLE_TRANSLATE_URL}?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
      }),
    }
  )

  if (!response.ok) {
    console.error('Google Translate API error:', response.status)
    return text // Fall back to English on error
  }

  const data = await response.json()
  return data.data?.translations?.[0]?.translatedText || text
}

export async function POST(request: NextRequest) {
  try {
    const { contentType, contentId, lang } = await request.json()

    if (!contentType || !contentId || !lang) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = db()

    if (!API_KEY) {
      return NextResponse.json({ error: 'Translation API not configured' }, { status: 500 })
    }

    // ── COURSE TRANSLATION ──────────────────────────────────────────────
    if (contentType === 'course') {
      const { data: course, error: courseError } = await supabase
        .from('hub_courses')
        .select('id, title, description, title_es, description_es')
        .eq('id', contentId)
        .single()

      // A failed query is not a missing row. Reporting one as the other is how
      // a wrong-database bug survived: "not found" reads like bad input.
      if (courseError && courseError.code !== 'PGRST116') {
        console.error('Course translation lookup failed:', courseError.message)
        return NextResponse.json({ error: courseError.message }, { status: 500 })
      }
      if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

      // Check what still needs translation
      const needsTitleEs = !course.title_es && course.title
      const needsDescEs = !course.description_es && course.description

      if (!needsTitleEs && !needsDescEs) {
        return NextResponse.json({
          title_es: course.title_es,
          description_es: course.description_es,
          cached: true,
        })
      }

      // Translate in parallel what's missing
      const [titleEs, descEs] = await Promise.all([
        needsTitleEs ? translateText(course.title, lang) : Promise.resolve(course.title_es),
        needsDescEs ? translateText(course.description || '', lang) : Promise.resolve(course.description_es),
      ])

      // Cache to database. The discarded error here is what let a route
      // pointed at the wrong project report success for months.
      const { error: courseWriteErr } = await supabase
        .from('hub_courses')
        .update({
          ...(needsTitleEs && { title_es: titleEs }),
          ...(needsDescEs && { description_es: descEs }),
        })
        .eq('id', contentId)

      if (courseWriteErr) {
        console.error('Course translation write failed:', courseWriteErr.message)
        return NextResponse.json({ error: courseWriteErr.message }, { status: 500 })
      }

      return NextResponse.json({ title_es: titleEs, description_es: descEs, cached: false })
    }

    // ── QUICK WIN TRANSLATION ────────────────────────────────────────────
    if (contentType === 'quick_win') {
      // hub_quick_wins has no content/content_es column. Selecting them made
      // this query fail with 42703, so `qw` came back null and every quick win
      // translation returned "Quick win not found". Quick Wins are downloadable
      // PDFs, so title and description are the translatable fields.
      const { data: qw, error: qwError } = await supabase
        .from('hub_quick_wins')
        .select('id, title, description, title_es, description_es')
        .eq('id', contentId)
        .single()

      if (qwError && qwError.code !== 'PGRST116') {
        console.error('Quick win translation lookup failed:', qwError.message)
        return NextResponse.json({ error: qwError.message }, { status: 500 })
      }
      if (!qw) return NextResponse.json({ error: 'Quick win not found' }, { status: 404 })

      const needsTitleEs = !qw.title_es && qw.title
      const needsDescEs = !qw.description_es && qw.description

      if (!needsTitleEs && !needsDescEs) {
        return NextResponse.json({
          title_es: qw.title_es,
          description_es: qw.description_es,
          cached: true,
        })
      }

      const [titleEs, descEs] = await Promise.all([
        needsTitleEs ? translateText(qw.title, lang) : Promise.resolve(qw.title_es),
        needsDescEs ? translateText(qw.description || '', lang) : Promise.resolve(qw.description_es),
      ])

      const { error: qwWriteErr } = await supabase
        .from('hub_quick_wins')
        .update({
          ...(needsTitleEs && { title_es: titleEs }),
          ...(needsDescEs && { description_es: descEs }),
        })
        .eq('id', contentId)

      if (qwWriteErr) {
        console.error('Quick win translation write failed:', qwWriteErr.message)
        return NextResponse.json({ error: qwWriteErr.message }, { status: 500 })
      }

      return NextResponse.json({
        title_es: titleEs,
        description_es: descEs,
        cached: false,
      })
    }

    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
