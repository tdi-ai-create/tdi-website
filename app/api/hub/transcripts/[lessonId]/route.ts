import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const lang = request.nextUrl.searchParams.get('lang') || 'en'

  try {
    const supabase = getHubServiceSupabase()

    const { data: lesson, error } = await supabase
      .from('hub_lessons')
      .select('id, title, transcript, transcript_es')
      .eq('id', lessonId)
      .single()

    if (error || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const transcriptText = lang === 'es'
      ? lesson.transcript_es
      : lesson.transcript

    if (!transcriptText) {
      return NextResponse.json(
        { error: 'Transcript not available yet' },
        { status: 404 }
      )
    }

    const langLabel = lang === 'es' ? 'Spanish' : 'English'
    const filename = `${lesson.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-transcript-${lang}.txt`

    const content = [
      `TDI Learning Hub Lesson Transcript`,
      `Lesson: ${lesson.title}`,
      `Language: ${langLabel}`,
      ``,
      transcriptText,
      ``,
      `Teachers Deserve It | teachersdeserveit.com`,
    ].join('\n')

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Transcript download error:', error)
    return NextResponse.json({ error: 'Failed to generate transcript' }, { status: 500 })
  }
}
