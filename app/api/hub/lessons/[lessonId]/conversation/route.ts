import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_TYPES = ['tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land'] as const
type ContributionType = typeof VALID_TYPES[number]

// GET /api/hub/lessons/[lessonId]/conversation
// Returns pulse counts + posts, with optional ?type= filter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const typeFilter = request.nextUrl.searchParams.get('type') as ContributionType | null

  try {
    // Fetch pulse counts
    const { data: pulseRows, error: pulseError } = await supabase
      .from('lesson_responses')
      .select('contribution_type')
      .eq('lesson_id', lessonId)

    if (pulseError) throw pulseError

    const pulse: Record<string, number> = {
      tried_it: 0,
      adapted_it: 0,
      still_trying: 0,
      got_stuck: 0,
      didnt_land: 0,
    }
    let totalContributions = 0
    for (const row of pulseRows || []) {
      if (row.contribution_type in pulse) {
        pulse[row.contribution_type]++
      }
      totalContributions++
    }

    // Fetch posts with author info
    let query = supabase
      .from('lesson_responses')
      .select(`
        id,
        contribution_type,
        title,
        body,
        helpful_count,
        created_at,
        user_id,
        hub_profiles!inner (
          display_name,
          role,
          avatar_url
        )
      `)
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: false })

    if (typeFilter && VALID_TYPES.includes(typeFilter)) {
      query = query.eq('contribution_type', typeFilter)
    }

    const { data: posts, error: postsError } = await query

    if (postsError) throw postsError

    const formattedPosts = (posts || []).map((post: any) => ({
      id: post.id,
      contribution_type: post.contribution_type,
      title: post.title,
      body: post.body,
      helpful_count: post.helpful_count,
      posted_at: post.created_at,
      author: {
        name: post.hub_profiles?.display_name || 'Anonymous',
        role: post.hub_profiles?.role || null,
        avatar_url: post.hub_profiles?.avatar_url || null,
      },
    }))

    return NextResponse.json({
      lesson_id: lessonId,
      total_contributions: totalContributions,
      pulse,
      posts: formattedPosts,
    })
  } catch (err: any) {
    console.error('Conversation GET error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to load conversation' },
      { status: 500 }
    )
  }
}

// POST /api/hub/lessons/[lessonId]/conversation
// Create a new contribution
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params

  try {
    const body = await request.json()
    const { contribution_type, title, body: postBody, user_id, course_id } = body

    // Validate required fields
    if (!contribution_type || !VALID_TYPES.includes(contribution_type)) {
      return NextResponse.json(
        { error: `contribution_type is required and must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (!postBody || typeof postBody !== 'string' || postBody.trim().length === 0) {
      return NextResponse.json(
        { error: 'body is required' },
        { status: 400 }
      )
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('lesson_responses')
      .insert({
        lesson_id: lessonId,
        course_id: course_id || '',
        user_id,
        contribution_type,
        title: title?.trim() || null,
        body: postBody.trim(),
      })
      .select(`
        id,
        contribution_type,
        title,
        body,
        helpful_count,
        created_at,
        user_id,
        hub_profiles!inner (
          display_name,
          role,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    const profile = (data as any).hub_profiles

    return NextResponse.json({
      id: data.id,
      contribution_type: data.contribution_type,
      title: data.title,
      body: data.body,
      helpful_count: data.helpful_count,
      posted_at: data.created_at,
      author: {
        name: profile?.display_name || 'Anonymous',
        role: profile?.role || null,
        avatar_url: profile?.avatar_url || null,
      },
    }, { status: 201 })
  } catch (err: any) {
    console.error('Conversation POST error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create contribution' },
      { status: 500 }
    )
  }
}
