import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseSlides, carouselProblems } from '@/lib/content-queue/carousel'
import { renderSlide } from '@/lib/content-queue/carousel-render'

export const dynamic = 'force-dynamic'


function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function authorize(request: NextRequest): boolean {
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) return false
  return request.headers.get('authorization') === `Bearer ${syncKey}`
}

/**
 * One slide of a carousel, as a PNG.
 *
 * One image per request rather than a zip, so every slide has a real address.
 * Lily can open slide four and point at it, and the set of URLs is what gets
 * attached to the queue item as artifact_refs.
 */
export async function GET(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const slideParam = searchParams.get('slide')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const { data: row, error } = await db()
    .from('content_queue_items')
    .select('id, title, channel, body')
    .eq('id', id).single()

  if (error || !row) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  if (row.channel !== 'instagram') {
    return NextResponse.json({ error: `"${row.channel}" is not a carousel channel.` }, { status: 400 })
  }

  const slides = parseSlides(row.body)
  const problems = carouselProblems(slides)

  // Listing mode: what slides exist and what is wrong with them. An agent calls
  // this before rendering, so a broken carousel is refused with reasons rather
  // than rendered into nine unreadable images.
  if (!slideParam) {
    return NextResponse.json({
      id: row.id,
      title: row.title,
      slide_count: slides.length,
      problems,
      renderable: problems.length === 0,
      slides: slides.map(s => ({
        index: s.index, kind: s.kind, chars: s.text.length,
        url: `/api/content-queue/carousel?id=${row.id}&slide=${s.index}`,
      })),
    })
  }

  if (problems.length > 0) {
    return NextResponse.json({
      error: 'This carousel cannot be rendered yet.',
      problems,
    }, { status: 400 })
  }

  const n = Number(slideParam)
  const slide = slides.find(s => s.index === n)
  if (!slide) {
    return NextResponse.json({ error: `There is no slide ${slideParam}. This carousel has ${slides.length}.` }, { status: 404 })
  }

  return renderSlide(slide, slides.length)
}
