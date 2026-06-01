import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendReplyNotificationEmail } from '@/lib/hub/email-sender'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/hub/community/reply
// Create a reply to a conversation post
// Body: { content_type: 'conversation_post', parent_id: string, user_id: string, body: string }
export async function POST(request: NextRequest) {
  try {
    const { content_type, parent_id, user_id, body } = await request.json()

    if (!parent_id || !user_id || !body?.trim()) {
      return NextResponse.json({ error: 'parent_id, user_id, and body are required' }, { status: 400 })
    }

    if (content_type === 'conversation_post') {
      // Get the parent post to inherit lesson_id and course_id
      const { data: parent, error: parentErr } = await supabase
        .from('lesson_responses')
        .select('lesson_id, course_id, user_id, body, contribution_type')
        .eq('id', parent_id)
        .single()

      if (parentErr || !parent) {
        return NextResponse.json({ error: 'Parent post not found' }, { status: 404 })
      }

      // Insert reply as a lesson_response with parent_id
      const { data, error } = await supabase
        .from('lesson_responses')
        .insert({
          lesson_id: parent.lesson_id,
          course_id: parent.course_id,
          user_id,
          parent_id,
          contribution_type: parent.contribution_type,
          body: body.trim(),
        })
        .select('id, body, created_at, user_id')
        .single()

      if (error) throw error

      // Get reply author profile
      const { data: profile } = await supabase
        .from('hub_profiles')
        .select('display_name, role')
        .eq('id', user_id)
        .single()

      // Notify the original poster (fire and forget)
      if (parent.user_id !== user_id) {
        void (async () => {
          try {
            const { data: originalAuthor } = await supabase
              .from('hub_profiles')
              .select('display_name, email')
              .eq('id', parent.user_id)
              .single()

            if (originalAuthor?.email) {
              await sendReplyNotificationEmail(
                parent.user_id,
                originalAuthor.email,
                {
                  displayName: originalAuthor.display_name || 'there',
                  originalPostSnippet: parent.body.slice(0, 200) + (parent.body.length > 200 ? '...' : ''),
                  replyAuthorName: profile?.display_name || 'A teacher',
                  replySnippet: body.trim().slice(0, 200),
                  contentUrl: 'https://www.teachersdeserveit.com/hub',
                  contentLabel: 'your conversation post',
                }
              )
            }
          } catch (notifErr) {
            console.error('Failed to send reply notification:', notifErr)
          }
        })()
      }

      return NextResponse.json({
        id: data.id,
        body: data.body,
        posted_at: data.created_at,
        author: {
          name: profile?.display_name || 'Teacher',
          role: profile?.role || null,
        },
      }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post reply'
    console.error('Reply error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
