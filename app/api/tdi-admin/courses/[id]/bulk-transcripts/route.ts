import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 300

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * GET /api/tdi-admin/courses/[id]/bulk-transcripts
 *
 * Returns transcript status for all video lessons in a course.
 * If id is "all", returns status across all courses.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getHubServiceSupabase()

    let lessonsQuery = supabase
      .from('hub_lessons')
      .select('id, title, content, transcript, transcript_es, module_id, hub_modules!inner(course_id, hub_courses!inner(id, title))')

    if (id !== 'all') {
      lessonsQuery = lessonsQuery.eq('hub_modules.course_id', id)
    }

    const { data: lessons, error } = await lessonsQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = (lessons || [])
      .filter((l) => {
        const content = l.content as Record<string, unknown> | null
        return content?.video_id
      })
      .map((l) => {
        const content = l.content as Record<string, unknown>
        const course = (l as any).hub_modules?.hub_courses
        return {
          lesson_id: l.id,
          lesson_title: l.title,
          course_id: course?.id || '',
          course_title: course?.title || '',
          video_id: content.video_id as string,
          has_transcript: !!(l.transcript && (l.transcript as string).length > 10),
          has_transcript_es: !!(l.transcript_es && (l.transcript_es as string).length > 10),
        }
      })

    const total = results.length
    const withTranscript = results.filter((r) => r.has_transcript).length
    const withTranscriptEs = results.filter((r) => r.has_transcript_es).length

    return NextResponse.json({
      lessons: results,
      total,
      with_transcript: withTranscript,
      without_transcript: total - withTranscript,
      with_transcript_es: withTranscriptEs,
      without_transcript_es: total - withTranscriptEs,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

/**
 * POST /api/tdi-admin/courses/[id]/bulk-transcripts
 *
 * Triggers Cloudflare AI caption generation for all video lessons in a course
 * that don't yet have transcripts, then polls and saves them.
 *
 * Body: { lang?: 'en' | 'es' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const lang = (body.lang as string) || 'en'
    const translate = body.translate === true

    const supabase = getHubServiceSupabase()

    // Translation mode: translate existing English transcripts to Spanish
    if (translate) {
      return handleTranslation(id, supabase)
    }

    const cfToken = process.env.CLOUDFLARE_STREAM_API_TOKEN
    const cfAccountId = process.env.CF_ACCOUNT_ID
    if (!cfToken || !cfAccountId) {
      return NextResponse.json({ error: 'Cloudflare not configured' }, { status: 500 })
    }

    // Get all video lessons for this course (or all courses)
    let lessonsQuery = supabase
      .from('hub_lessons')
      .select('id, title, content, transcript, transcript_es, module_id, hub_modules!inner(course_id)')

    if (id !== 'all') {
      lessonsQuery = lessonsQuery.eq('hub_modules.course_id', id)
    }

    const { data: lessons, error } = await lessonsQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter to video lessons without transcripts
    const transcriptCol = lang === 'es' ? 'transcript_es' : 'transcript'
    const needsTranscript = (lessons || []).filter((l) => {
      const content = l.content as Record<string, unknown> | null
      if (!content?.video_id) return false
      const existing = (l as any)[transcriptCol]
      return !existing || (existing as string).length < 10
    })

    if (needsTranscript.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All video lessons already have transcripts.',
        processed: 0,
        results: [],
      })
    }

    const results: Array<{
      lesson_id: string
      lesson_title: string
      video_id: string
      status: 'generated' | 'already_exists' | 'started' | 'failed'
      transcript?: string
    }> = []

    for (const lesson of needsTranscript) {
      const content = lesson.content as Record<string, unknown>
      const videoId = content.video_id as string

      try {
        // Step 1: Request caption generation
        const genRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${videoId}/captions/${lang}/generate`,
          { method: 'POST', headers: { Authorization: `Bearer ${cfToken}` } }
        )
        const genData = await genRes.json()
        const alreadyExists = genData.errors?.[0]?.message?.includes('already exists')

        if (!genRes.ok && !alreadyExists) {
          results.push({
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            video_id: videoId,
            status: 'failed',
          })
          continue
        }

        // Step 2: Poll for the VTT content (up to 90 seconds per video)
        let transcript: string | null = null
        for (let attempt = 0; attempt < 30; attempt++) {
          await new Promise((r) => setTimeout(r, 3000))

          const vttRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream/${videoId}/captions/${lang}/vtt`,
            { headers: { Authorization: `Bearer ${cfToken}` } }
          )

          if (vttRes.ok) {
            const vttText = await vttRes.text()
            transcript = vttText
              .replace(/WEBVTT\n\n?/g, '')
              .replace(/^\d+\n/gm, '')
              .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\n?/g, '')
              .replace(/\n\n+/g, ' ')
              .replace(/\n/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()

            if (transcript && transcript.length > 10) break
            transcript = null
          }
        }

        if (transcript) {
          // Save transcript to the lesson
          const updateCol = lang === 'es' ? 'transcript_es' : 'transcript'
          await supabase
            .from('hub_lessons')
            .update({ [updateCol]: transcript })
            .eq('id', lesson.id)

          results.push({
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            video_id: videoId,
            status: alreadyExists ? 'already_exists' : 'generated',
            transcript: transcript.substring(0, 200) + (transcript.length > 200 ? '...' : ''),
          })
        } else {
          results.push({
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            video_id: videoId,
            status: 'started',
          })
        }
      } catch {
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          video_id: videoId,
          status: 'failed',
        })
      }
    }

    const generated = results.filter((r) => r.status === 'generated' || r.status === 'already_exists').length
    const started = results.filter((r) => r.status === 'started').length
    const failed = results.filter((r) => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} lessons: ${generated} transcripts saved, ${started} still processing, ${failed} failed.`,
      processed: results.length,
      generated,
      started,
      failed,
      results,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

/**
 * Translate English transcripts to Spanish using Claude.
 * Only processes lessons that have an English transcript but no Spanish one.
 */
async function handleTranslation(courseId: string, supabase: ReturnType<typeof getHubServiceSupabase>) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 })
  }

  let lessonsQuery = supabase
    .from('hub_lessons')
    .select('id, title, transcript, transcript_es, module_id, hub_modules!inner(course_id)')

  if (courseId !== 'all') {
    lessonsQuery = lessonsQuery.eq('hub_modules.course_id', courseId)
  }

  const { data: lessons, error } = await lessonsQuery
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filter to lessons with English transcript but no Spanish
  const needsTranslation = (lessons || []).filter((l) => {
    const hasEn = l.transcript && (l.transcript as string).length > 50
    const hasEs = l.transcript_es && (l.transcript_es as string).length > 50
    return hasEn && !hasEs
  })

  if (needsTranslation.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'All lessons with English transcripts already have Spanish translations.',
      processed: 0,
      results: [],
    })
  }

  const client = new Anthropic({ apiKey })

  const results: Array<{
    lesson_id: string
    lesson_title: string
    status: 'translated' | 'failed'
    error?: string
  }> = []

  for (const lesson of needsTranslation) {
    try {
      const enTranscript = lesson.transcript as string

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 16000,
        messages: [{
          role: 'user',
          content: `Translate the following English transcript to Spanish. This is a professional development transcript for educators. Maintain the same tone, meaning, and structure. Do not add any commentary or notes. Return only the Spanish translation.

${enTranscript.substring(0, 30000)}`,
        }],
      })

      const translatedText = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim()

      if (translatedText && translatedText.length > 50) {
        await supabase
          .from('hub_lessons')
          .update({ transcript_es: translatedText })
          .eq('id', lesson.id)

        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'translated',
        })
      } else {
        results.push({
          lesson_id: lesson.id,
          lesson_title: lesson.title,
          status: 'failed',
          error: 'Translation returned empty result',
        })
      }
    } catch (err: unknown) {
      results.push({
        lesson_id: lesson.id,
        lesson_title: lesson.title,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const translated = results.filter((r) => r.status === 'translated').length
  const failed = results.filter((r) => r.status === 'failed').length

  return NextResponse.json({
    success: true,
    message: `Translated ${translated} transcripts to Spanish. ${failed > 0 ? `${failed} failed.` : ''}`,
    processed: results.length,
    translated,
    failed,
    results,
  })
}
