import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/hub/community/search
// Search across Q&A posts and conversation posts
// Query params: q (required), type (optional: 'qa' | 'conversation'), limit (optional, default 20)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100)

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query (q) is required' }, { status: 400 })
    }

    if (type && type !== 'qa' && type !== 'conversation') {
      return NextResponse.json({ error: 'type must be "qa" or "conversation"' }, { status: 400 })
    }

    const searchPattern = `%${query.trim()}%`
    const results: Array<Record<string, unknown>> = []
    let total = 0

    // Search Q&A posts
    if (!type || type === 'qa') {
      const { data: qaPosts, error: qaError, count: qaCount } = await supabase
        .from('hub_qa_posts')
        .select('id, body, helpful_count, created_at, content_id, parent_id, user_id', { count: 'exact' })
        .ilike('body', searchPattern)
        .order('created_at', { ascending: false })
        .limit(type === 'qa' ? limit : Math.ceil(limit / 2))

      if (qaError) {
        console.error('Q&A search error:', qaError)
        return NextResponse.json({ error: 'Failed to search Q&A posts' }, { status: 500 })
      }

      total += qaCount || 0

      if (qaPosts && qaPosts.length > 0) {
        // Fetch author profiles for Q&A posts
        const qaUserIds = [...new Set(qaPosts.map(p => p.user_id))]
        const { data: qaProfiles } = await supabase
          .from('hub_profiles')
          .select('user_id, display_name, role')
          .in('user_id', qaUserIds)

        const profileMap = new Map(
          (qaProfiles || []).map(p => [p.user_id, { name: p.display_name, role: p.role }])
        )

        for (const post of qaPosts) {
          results.push({
            id: post.id,
            body: post.body,
            helpful_count: post.helpful_count,
            created_at: post.created_at,
            content_type: 'qa',
            content_id: post.content_id,
            parent_id: post.parent_id,
            author: profileMap.get(post.user_id) || { name: null, role: null },
          })
        }
      }
    }

    // Search conversation posts (lesson_responses)
    if (!type || type === 'conversation') {
      const remainingLimit = type === 'conversation' ? limit : limit - results.length
      const orFilter = `body.ilike.${searchPattern},title.ilike.${searchPattern}`

      const { data: convPosts, error: convError, count: convCount } = await supabase
        .from('lesson_responses')
        .select('id, body, title, helpful_count, created_at, contribution_type, lesson_id, user_id', { count: 'exact' })
        .or(orFilter)
        .order('created_at', { ascending: false })
        .limit(remainingLimit)

      if (convError) {
        console.error('Conversation search error:', convError)
        return NextResponse.json({ error: 'Failed to search conversation posts' }, { status: 500 })
      }

      total += convCount || 0

      if (convPosts && convPosts.length > 0) {
        // Fetch author profiles for conversation posts
        const convUserIds = [...new Set(convPosts.map(p => p.user_id))]
        const { data: convProfiles } = await supabase
          .from('hub_profiles')
          .select('user_id, display_name, role')
          .in('user_id', convUserIds)

        const profileMap = new Map(
          (convProfiles || []).map(p => [p.user_id, { name: p.display_name, role: p.role }])
        )

        for (const post of convPosts) {
          results.push({
            id: post.id,
            body: post.body,
            title: post.title,
            helpful_count: post.helpful_count,
            created_at: post.created_at,
            content_type: 'conversation',
            contribution_type: post.contribution_type,
            lesson_id: post.lesson_id,
            author: profileMap.get(post.user_id) || { name: null, role: null },
          })
        }
      }
    }

    // Sort combined results by created_at desc
    results.sort((a, b) => {
      const dateA = new Date(a.created_at as string).getTime()
      const dateB = new Date(b.created_at as string).getTime()
      return dateB - dateA
    })

    return NextResponse.json({ results, total })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to search community posts'
    console.error('Community search error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
