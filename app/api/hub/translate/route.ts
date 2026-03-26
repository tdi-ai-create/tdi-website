import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    if (!API_KEY) {
      return NextResponse.json({ error: 'Translation API not configured' }, { status: 500 })
    }

    // ── COURSE TRANSLATION ──────────────────────────────────────────────
    if (contentType === 'course') {
      const { data: course } = await supabase
        .from('hub_courses')
        .select('id, title, description, title_es, description_es')
        .eq('id', contentId)
        .single()

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

      // Cache to database
      await supabase
        .from('hub_courses')
        .update({
          ...(needsTitleEs && { title_es: titleEs }),
          ...(needsDescEs && { description_es: descEs }),
        })
        .eq('id', contentId)

      return NextResponse.json({ title_es: titleEs, description_es: descEs, cached: false })
    }

    // ── QUICK WIN TRANSLATION ────────────────────────────────────────────
    if (contentType === 'quick_win') {
      const { data: qw } = await supabase
        .from('hub_quick_wins')
        .select('id, title, description, content, title_es, description_es, content_es')
        .eq('id', contentId)
        .single()

      if (!qw) return NextResponse.json({ error: 'Quick win not found' }, { status: 404 })

      const needsTitleEs = !qw.title_es && qw.title
      const needsDescEs = !qw.description_es && qw.description
      const needsContentEs = !qw.content_es && qw.content

      if (!needsTitleEs && !needsDescEs && !needsContentEs) {
        return NextResponse.json({
          title_es: qw.title_es,
          description_es: qw.description_es,
          content_es: qw.content_es,
          cached: true,
        })
      }

      const [titleEs, descEs, contentEs] = await Promise.all([
        needsTitleEs ? translateText(qw.title, lang) : Promise.resolve(qw.title_es),
        needsDescEs ? translateText(qw.description || '', lang) : Promise.resolve(qw.description_es),
        needsContentEs ? translateText(qw.content || '', lang) : Promise.resolve(qw.content_es),
      ])

      await supabase
        .from('hub_quick_wins')
        .update({
          ...(needsTitleEs && { title_es: titleEs }),
          ...(needsDescEs && { description_es: descEs }),
          ...(needsContentEs && { content_es: contentEs }),
        })
        .eq('id', contentId)

      return NextResponse.json({
        title_es: titleEs,
        description_es: descEs,
        content_es: contentEs,
        cached: false,
      })
    }

    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })

  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
