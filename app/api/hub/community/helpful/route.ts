import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/hub/community/helpful
// Toggle helpful on a Q&A post or conversation post
// Body: { content_type: 'qa_post' | 'conversation_post', content_id: string, user_id: string }
export async function POST(request: NextRequest) {
  try {
    const { content_type, content_id, user_id } = await request.json()

    if (!content_type || !content_id || !user_id) {
      return NextResponse.json({ error: 'content_type, content_id, and user_id are required' }, { status: 400 })
    }

    if (content_type === 'qa_post') {
      // Check if already marked
      const { data: existing } = await supabase
        .from('hub_qa_post_helpfuls')
        .select('id')
        .eq('post_id', content_id)
        .eq('user_id', user_id)
        .single()

      if (existing) {
        // Remove helpful
        await supabase.from('hub_qa_post_helpfuls').delete().eq('id', existing.id)

        // Decrement count
        const { data: post } = await supabase.from('hub_qa_posts').select('helpful_count').eq('id', content_id).single()
        const newCount = Math.max(0, (post?.helpful_count || 1) - 1)
        await supabase.from('hub_qa_posts').update({ helpful_count: newCount }).eq('id', content_id)

        return NextResponse.json({ marked: false, helpful_count: newCount })
      } else {
        // Add helpful
        await supabase.from('hub_qa_post_helpfuls').insert({ post_id: content_id, user_id })

        // Increment count
        const { data: post } = await supabase.from('hub_qa_posts').select('helpful_count').eq('id', content_id).single()
        const newCount = (post?.helpful_count || 0) + 1
        await supabase.from('hub_qa_posts').update({ helpful_count: newCount }).eq('id', content_id)

        return NextResponse.json({ marked: true, helpful_count: newCount })
      }
    } else if (content_type === 'conversation_post') {
      // Check if already marked
      const { data: existing } = await supabase
        .from('lesson_response_helpfuls')
        .select('id')
        .eq('response_id', content_id)
        .eq('user_id', user_id)
        .single()

      if (existing) {
        // Remove helpful
        await supabase.from('lesson_response_helpfuls').delete().eq('id', existing.id)

        // Decrement count
        const { data: post } = await supabase.from('lesson_responses').select('helpful_count').eq('id', content_id).single()
        const newCount = Math.max(0, (post?.helpful_count || 1) - 1)
        await supabase.from('lesson_responses').update({ helpful_count: newCount }).eq('id', content_id)

        return NextResponse.json({ marked: false, helpful_count: newCount })
      } else {
        // Add helpful
        await supabase.from('lesson_response_helpfuls').insert({ response_id: content_id, user_id })

        // Increment count
        const { data: post } = await supabase.from('lesson_responses').select('helpful_count').eq('id', content_id).single()
        const newCount = (post?.helpful_count || 0) + 1
        await supabase.from('lesson_responses').update({ helpful_count: newCount }).eq('id', content_id)

        return NextResponse.json({ marked: true, helpful_count: newCount })
      }
    } else {
      return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to toggle helpful'
    console.error('Helpful toggle error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
