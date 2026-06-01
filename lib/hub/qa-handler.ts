import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendReplyNotificationEmail } from '@/lib/hub/email-sender'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function handleQAGet(contentType: string, contentId: string) {
  try {
    // Fetch top-level questions (parent_id is null)
    const { data: questions, error: qError } = await supabase
      .from('hub_qa_posts')
      .select('id, body, helpful_count, created_at, user_id')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (qError) throw qError

    if (!questions || questions.length === 0) {
      return NextResponse.json({
        content_id: contentId,
        total_questions: 0,
        questions: [],
      })
    }

    // Fetch all replies for these questions
    const questionIds = questions.map(q => q.id)
    const { data: replies, error: rError } = await supabase
      .from('hub_qa_posts')
      .select('id, parent_id, body, helpful_count, created_at, user_id')
      .in('parent_id', questionIds)
      .order('created_at', { ascending: true })

    if (rError) throw rError

    // Get all user profiles
    const allUserIds = [
      ...new Set([
        ...questions.map(q => q.user_id),
        ...(replies || []).map(r => r.user_id),
      ]),
    ]

    let profileMap: Record<string, { name: string; role: string | null; avatar_url: string | null }> = {}
    if (allUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('hub_profiles')
        .select('id, display_name, role, avatar_url')
        .in('id', allUserIds)

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

    const replyMap: Record<string, typeof replies> = {}
    for (const r of replies || []) {
      if (!replyMap[r.parent_id]) replyMap[r.parent_id] = []
      replyMap[r.parent_id].push(r)
    }

    const formatted = questions.map(q => ({
      id: q.id,
      body: q.body,
      helpful_count: q.helpful_count,
      posted_at: q.created_at,
      author: profileMap[q.user_id] || { name: 'Teacher', role: null, avatar_url: null },
      replies: (replyMap[q.id] || []).map(r => ({
        id: r.id,
        body: r.body,
        helpful_count: r.helpful_count,
        posted_at: r.created_at,
        author: profileMap[r.user_id] || { name: 'Teacher', role: null, avatar_url: null },
      })),
    }))

    return NextResponse.json({
      content_id: contentId,
      total_questions: questions.length,
      questions: formatted,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load Q&A'
    console.error('Q&A GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function handleQAPost(contentType: string, contentId: string, request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { body, user_id, parent_id } = reqBody

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json({ error: 'body is required' }, { status: 400 })
    }

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('hub_qa_posts')
      .insert({
        content_type: contentType,
        content_id: contentId,
        parent_id: parent_id || null,
        user_id,
        body: body.trim(),
      })
      .select('id, body, helpful_count, created_at, user_id, parent_id')
      .single()

    if (error) throw error

    const { data: profile } = await supabase
      .from('hub_profiles')
      .select('display_name, role, avatar_url')
      .eq('id', user_id)
      .single()

    // If this is a reply, notify the original poster (fire and forget)
    if (parent_id) {
      void (async () => {
        try {
          // Get the parent post to find the original author
          const { data: parentPost } = await supabase
            .from('hub_qa_posts')
            .select('user_id, body')
            .eq('id', parent_id)
            .single()

          if (parentPost && parentPost.user_id !== user_id) {
            // Get the original poster's email
            const { data: originalAuthor } = await supabase
              .from('hub_profiles')
              .select('display_name, email')
              .eq('id', parentPost.user_id)
              .single()

            if (originalAuthor?.email) {
              await sendReplyNotificationEmail(
                parentPost.user_id,
                originalAuthor.email,
                {
                  displayName: originalAuthor.display_name || 'there',
                  originalPostSnippet: parentPost.body.slice(0, 200) + (parentPost.body.length > 200 ? '...' : ''),
                  replyAuthorName: profile?.display_name || 'A teacher',
                  replySnippet: body.trim().slice(0, 200) + (body.trim().length > 200 ? '...' : ''),
                  contentUrl: `https://www.teachersdeserveit.com/hub`,
                  contentLabel: 'your Q&A question',
                }
              )
            }
          }
        } catch (notifErr) {
          console.error('Failed to send reply notification:', notifErr)
        }
      })()
    }

    return NextResponse.json({
      id: data.id,
      body: data.body,
      helpful_count: data.helpful_count,
      posted_at: data.created_at,
      parent_id: data.parent_id,
      author: {
        name: profile?.display_name || 'Teacher',
        role: profile?.role || null,
        avatar_url: profile?.avatar_url || null,
      },
    }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create Q&A post'
    console.error('Q&A POST error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
