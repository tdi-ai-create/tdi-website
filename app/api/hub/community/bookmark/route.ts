import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/hub/community/bookmark
// Fetch user's bookmarks
// Query param: user_id (required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('hub_bookmarks')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Bookmark fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookmarks: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch bookmarks'
    console.error('Bookmark fetch error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/hub/community/bookmark
// Toggle bookmark on content
// Body: { user_id, content_type, content_id, title?, context_label? }
export async function POST(request: NextRequest) {
  try {
    const { user_id, content_type, content_id, title, context_label } = await request.json()

    if (!user_id || !content_type || !content_id) {
      return NextResponse.json({ error: 'user_id, content_type, and content_id are required' }, { status: 400 })
    }

    // Check if bookmark already exists
    const { data: existing } = await supabase
      .from('hub_bookmarks')
      .select('id')
      .eq('user_id', user_id)
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .single()

    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from('hub_bookmarks')
        .delete()
        .eq('id', existing.id)

      if (error) {
        console.error('Bookmark delete error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ bookmarked: false })
    } else {
      // Create bookmark
      const { error } = await supabase
        .from('hub_bookmarks')
        .insert({
          user_id,
          content_type,
          content_id,
          title: title || null,
          context_label: context_label || null,
        })

      if (error) {
        console.error('Bookmark insert error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ bookmarked: true })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to toggle bookmark'
    console.error('Bookmark toggle error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
