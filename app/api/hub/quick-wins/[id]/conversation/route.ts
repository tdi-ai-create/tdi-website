import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use Hub project URL with service role key for server-side queries
// The quick_win_responses table lives in the Hub Supabase project
const supabase = createClient(
  process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_TYPES = ['tried_it', 'adapted_it', 'still_trying', 'got_stuck', 'didnt_land'] as const
type ContributionType = typeof VALID_TYPES[number]

// GET /api/hub/quick-wins/[id]/conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const typeFilter = request.nextUrl.searchParams.get('type') as ContributionType | null

  try {
    // Fetch pulse counts
    const { data: pulseRows, error: pulseError } = await supabase
      .from('quick_win_responses')
      .select('contribution_type')
      .eq('quick_win_id', id)

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

    // Fetch posts (without hub_profiles join since it may not be accessible)
    let query = supabase
      .from('quick_win_responses')
      .select('id, contribution_type, title, body, helpful_count, created_at, user_id')
      .eq('quick_win_id', id)
      .order('created_at', { ascending: false })

    if (typeFilter && VALID_TYPES.includes(typeFilter)) {
      query = query.eq('contribution_type', typeFilter)
    }

    const { data: posts, error: postsError } = await query

    if (postsError) throw postsError

    // Try to get display names for the user IDs
    const userIds = [...new Set((posts || []).map(p => p.user_id))]
    let profileMap: Record<string, { name: string; role: string | null; avatar_url: string | null }> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('hub_profiles')
        .select('id, display_name, role, avatar_url')
        .in('id', userIds)

      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = {
            name: p.display_name || 'Teacher',
            role: p.role,
            avatar_url: p.avatar_url,
          }
        }
      }
    }

    const formattedPosts = (posts || []).map((post) => ({
      id: post.id,
      contribution_type: post.contribution_type,
      title: post.title,
      body: post.body,
      helpful_count: post.helpful_count,
      posted_at: post.created_at,
      author: profileMap[post.user_id] || { name: 'Teacher', role: null, avatar_url: null },
    }))

    return NextResponse.json({
      quick_win_id: id,
      total_contributions: totalContributions,
      pulse,
      posts: formattedPosts,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load conversation'
    console.error('Conversation GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/hub/quick-wins/[id]/conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { contribution_type, title, body: postBody, user_id } = body

    if (!contribution_type || !VALID_TYPES.includes(contribution_type)) {
      return NextResponse.json(
        { error: `contribution_type is required and must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (!postBody || typeof postBody !== 'string' || postBody.trim().length === 0) {
      return NextResponse.json({ error: 'body is required' }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('quick_win_responses')
      .insert({
        quick_win_id: id,
        user_id,
        contribution_type,
        title: title?.trim() || null,
        body: postBody.trim(),
      })
      .select('id, contribution_type, title, body, helpful_count, created_at, user_id')
      .single()

    if (error) throw error

    // Get author profile
    const { data: profile } = await supabase
      .from('hub_profiles')
      .select('display_name, role, avatar_url')
      .eq('id', user_id)
      .single()

    return NextResponse.json({
      id: data.id,
      contribution_type: data.contribution_type,
      title: data.title,
      body: data.body,
      helpful_count: data.helpful_count,
      posted_at: data.created_at,
      author: {
        name: profile?.display_name || 'Teacher',
        role: profile?.role || null,
        avatar_url: profile?.avatar_url || null,
      },
    }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create contribution'
    console.error('Conversation POST error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
