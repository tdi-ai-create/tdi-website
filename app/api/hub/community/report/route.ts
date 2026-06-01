import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// POST /api/hub/community/report
// Report a Q&A or conversation post
// Body: { content_type: 'qa_post' | 'conversation_post', content_id: string, reporter_id: string, reason?: string }
export async function POST(request: NextRequest) {
  try {
    const { content_type, content_id, reporter_id, reason } = await request.json()

    if (!content_type || !content_id || !reporter_id) {
      return NextResponse.json({ error: 'content_type, content_id, and reporter_id are required' }, { status: 400 })
    }

    if (!['qa_post', 'conversation_post'].includes(content_type)) {
      return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 })
    }

    // Check for duplicate report
    const { data: existing } = await supabase
      .from('hub_community_reports')
      .select('id')
      .eq('reporter_id', reporter_id)
      .eq('content_type', content_type)
      .eq('content_id', content_id)
      .single()

    if (existing) {
      return NextResponse.json({ already_reported: true })
    }

    // Create report
    const { error: insertError } = await supabase
      .from('hub_community_reports')
      .insert({
        reporter_id,
        content_type,
        content_id,
        reason: reason?.trim() || null,
      })

    if (insertError) throw insertError

    // Fetch the reported content for the email
    let postBody = ''
    let postAuthor = ''
    let contentLabel = ''

    if (content_type === 'qa_post') {
      const { data: post } = await supabase
        .from('hub_qa_posts')
        .select('body, user_id')
        .eq('id', content_id)
        .single()
      if (post) {
        postBody = post.body
        const { data: profile } = await supabase
          .from('hub_profiles')
          .select('display_name')
          .eq('id', post.user_id)
          .single()
        postAuthor = profile?.display_name || 'Unknown'
      }
      contentLabel = 'Q&A Post'
    } else {
      const { data: post } = await supabase
        .from('lesson_responses')
        .select('body, user_id')
        .eq('id', content_id)
        .single()
      if (post) {
        postBody = post.body
        const { data: profile } = await supabase
          .from('hub_profiles')
          .select('display_name')
          .eq('id', post.user_id)
          .single()
        postAuthor = profile?.display_name || 'Unknown'
      }
      contentLabel = 'Conversation Post'
    }

    // Get reporter name
    const { data: reporter } = await supabase
      .from('hub_profiles')
      .select('display_name, email')
      .eq('id', reporter_id)
      .single()

    // Email the team
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Teachers Deserve It <noreply@teachersdeserveit.com>',
          to: ['hello@teachersdeserveit.com'],
          subject: `[Hub Report] ${contentLabel} reported`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B2A4A; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0; font-size: 18px;">Community Content Report</h2>
              </div>
              <div style="padding: 24px; border: 1px solid #E5E7EB; border-top: 0; border-radius: 0 0 8px 8px;">
                <p style="margin: 0 0 12px; color: #6B7280; font-size: 14px;"><strong>Type:</strong> ${contentLabel}</p>
                <p style="margin: 0 0 12px; color: #6B7280; font-size: 14px;"><strong>Author:</strong> ${postAuthor}</p>
                <p style="margin: 0 0 12px; color: #6B7280; font-size: 14px;"><strong>Reported by:</strong> ${reporter?.display_name || 'Unknown'}</p>
                ${reason ? `<p style="margin: 0 0 12px; color: #6B7280; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>` : ''}
                <div style="background: #F9FAFB; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #E5E7EB;">
                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">${postBody}</p>
                </div>
                <p style="margin: 16px 0 0; color: #9CA3AF; font-size: 12px;">
                  Content ID: ${content_id}<br/>
                  Review this in the TDI admin panel to remove permanently.
                </p>
              </div>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Failed to send report email:', emailErr)
      }
    }

    return NextResponse.json({ reported: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to report content'
    console.error('Report error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
