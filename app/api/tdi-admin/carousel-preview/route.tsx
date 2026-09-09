import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { parseSlides, carouselProblems } from '@/lib/content-queue/carousel'
import { renderSlide } from '@/lib/content-queue/carousel-render'

export const dynamic = 'force-dynamic'

function db() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * The same slides an agent renders, behind an admin session instead of the sync
 * key, so a reviewer can look at a carousel without holding a credential.
 *
 * Without a slide parameter this lists the slides and what is wrong with them.
 * With one it returns that slide as a PNG.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

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

  if (!slideParam) {
    return NextResponse.json({
      id: row.id,
      title: row.title,
      slide_count: slides.length,
      problems,
      renderable: problems.length === 0,
      slides: slides.map(s => ({
        index: s.index, kind: s.kind, chars: s.text.length,
        url: `/api/tdi-admin/carousel-preview?id=${row.id}&slide=${s.index}`,
      })),
    })
  }

  if (problems.length > 0) {
    return NextResponse.json({ error: 'This carousel cannot be rendered yet.', problems }, { status: 400 })
  }

  const slide = slides.find(s => s.index === Number(slideParam))
  if (!slide) {
    return NextResponse.json({ error: `There is no slide ${slideParam}. This carousel has ${slides.length}.` }, { status: 404 })
  }

  return renderSlide(slide, slides.length)
}
