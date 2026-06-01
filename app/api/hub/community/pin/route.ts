import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/hub/community/pin
// Toggle pin on a Q&A post or conversation post (admin only)
// Body: { content_type: 'qa_post' | 'conversation_post', content_id, user_id }
export async function POST(request: NextRequest) {
  try {
    const { content_type, content_id, user_id } = await request.json()

    if (!content_type || !content_id || !user_id) {
      return NextResponse.json({ error: 'content_type, content_id, and user_id are required' }, { status: 400 })
    }

    if (content_type !== 'qa_post' && content_type !== 'conversation_post') {
      return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
    }

    // Verify user is a TDI team member
    const { data: profile, error: profileError } = await supabase
      .from('hub_profiles')
      .select('email')
      .eq('id', user_id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!profile.email?.endsWith('@teachersdeserveit.com')) {
      return NextResponse.json({ error: 'Only TDI team members can pin posts' }, { status: 403 })
    }

    if (content_type === 'qa_post') {
      // Check current pin state
      const { data: post, error: fetchError } = await supabase
        .from('hub_qa_posts')
        .select('is_pinned')
        .eq('id', content_id)
        .single()

      if (fetchError || !post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      const newPinned = !post.is_pinned

      const { error: updateError } = await supabase
        .from('hub_qa_posts')
        .update({
          is_pinned: newPinned,
          pinned_by: newPinned ? user_id : null,
          pinned_at: newPinned ? new Date().toISOString() : null,
        })
        .eq('id', content_id)

      if (updateError) {
        console.error('Pin update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ pinned: newPinned })

    } else {
      // conversation_post -> lesson_responses table
      const { data: post, error: fetchError } = await supabase
        .from('lesson_responses')
        .select('is_pinned')
        .eq('id', content_id)
        .single()

      if (fetchError || !post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }

      const newPinned = !post.is_pinned

      const { error: updateError } = await supabase
        .from('lesson_responses')
        .update({
          is_pinned: newPinned,
          pinned_by: newPinned ? user_id : null,
          pinned_at: newPinned ? new Date().toISOString() : null,
        })
        .eq('id', content_id)

      if (updateError) {
        console.error('Pin update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ pinned: newPinned })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to toggle pin'
    console.error('Pin toggle error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
