import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendReplyNotificationEmail } from '@/lib/hub/email-sender'
import { createNotification } from '@/lib/hub/notifications'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Try to find the parent post in any of the conversation tables
async function findParentPost(parentId: string) {
  // Try lesson_responses first
  const { data: lessonParent } = await supabase
    .from('lesson_responses')
    .select('lesson_id, course_id, user_id, body, contribution_type')
    .eq('id', parentId)
    .single()

  if (lessonParent) {
    return { table: 'lesson_responses' as const, parent: lessonParent }
  }

  // Try quick_win_responses
  const { data: qwParent } = await supabase
    .from('quick_win_responses')
    .select('quick_win_id, user_id, body, contribution_type')
    .eq('id', parentId)
    .single()

  if (qwParent) {
    return { table: 'quick_win_responses' as const, parent: qwParent }
  }

  return null
}

// POST /api/hub/community/reply
// Create a reply to a conversation post (lesson or quick-win)
// Body: { content_type: 'conversation_post', parent_id: string, user_id: string, body: string }
export async function POST(request: NextRequest) {
  try {
    const { content_type, parent_id, user_id, body } = await request.json()

    if (!parent_id || !user_id || !body?.trim()) {
      return NextResponse.json({ error: 'parent_id, user_id, and body are required' }, { status: 400 })
    }

    if (content_type !== 'conversation_post') {
      return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
    }

    const found = await findParentPost(parent_id)
    if (!found) {
      return NextResponse.json({ error: 'Parent post not found' }, { status: 404 })
    }

    const { table, parent } = found

    // Insert reply into the same table as the parent
    let insertData: Record<string, unknown>

    if (table === 'lesson_responses') {
      insertData = {
        lesson_id: parent.lesson_id,
        course_id: parent.course_id,
        user_id,
        parent_id,
        contribution_type: parent.contribution_type,
        body: body.trim(),
      }
    } else {
      insertData = {
        quick_win_id: parent.quick_win_id,
        user_id,
        parent_id,
        contribution_type: parent.contribution_type,
        body: body.trim(),
      }
    }

    const { data, error } = await supabase
      .from(table)
      .insert(insertData)
      .select('id, body, created_at, user_id')
      .single()

    if (error) throw error

    // Get reply author profile
    const { data: profile } = await supabase
      .from('hub_profiles')
      .select('display_name, role, educator_type')
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

          // In-app notification
          await createNotification({
            userId: parent.user_id,
            type: 'qa_reply',
            title: `${profile?.display_name || 'A teacher'} replied to your post`,
            body: body.trim().slice(0, 80),
            link: 'https://www.teachersdeserveit.com/hub',
            sourceUserId: user_id,
          });

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
        educator_type: profile?.educator_type || null,
      },
    }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post reply'
    console.error('Reply error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
