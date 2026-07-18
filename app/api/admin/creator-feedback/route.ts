import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET: list feedback items by status, with creator and milestone info
export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const status = url.searchParams.get('status') || 'pending_review'
  const creatorId = url.searchParams.get('creator_id')

  const supabase = db()

  let query = supabase
    .from('creator_milestone_feedback')
    .select(`
      *,
      creator_milestones!milestone_record_id (
        id,
        milestone_id,
        status,
        review_status,
        submitted_value,
        submission_notes
      ),
      creators!creator_id (
        id,
        name,
        email,
        course_title,
        content_path
      )
    `)
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('feedback_draft_status', status)
  }

  if (creatorId) {
    query = query.eq('creator_id', creatorId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with milestone title from the milestones table
  const milestoneIds = [...new Set(
    (data || [])
      .map((f: any) => f.creator_milestones?.milestone_id)
      .filter(Boolean)
  )]

  let milestoneNames: Record<string, string> = {}
  if (milestoneIds.length > 0) {
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, name')
      .in('id', milestoneIds)

    milestoneNames = Object.fromEntries(
      (milestones || []).map((m: any) => [m.id, m.name])
    )
  }

  const enriched = (data || []).map((f: any) => ({
    ...f,
    milestone_title: milestoneNames[f.creator_milestones?.milestone_id] || 'Unknown Milestone',
    creator_name: f.creators?.name || 'Unknown Creator',
    creator_email: f.creators?.email || '',
  }))

  return NextResponse.json({ feedback: enriched, count: enriched.length })
}

// POST: admin actions on feedback (approve, reject, add direct feedback)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body
  const supabase = db()

  // Approve feedback
  if (action === 'approve') {
    const { feedback_id, approved_by, edited_content } = body
    if (!feedback_id) {
      return NextResponse.json({ error: 'feedback_id required' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {
      feedback_draft_status: 'approved',
      visible_to_creator: true,
      feedback_approved_by: approved_by || 'admin',
      feedback_approved_at: new Date().toISOString(),
    }
    if (edited_content) {
      updatePayload.feedback_content = edited_content
    }

    const { data: feedback, error } = await supabase
      .from('creator_milestone_feedback')
      .update(updatePayload)
      .eq('id', feedback_id)
      .select('id, milestone_record_id, creator_id')
      .single()

    if (error || !feedback) {
      return NextResponse.json({ error: error?.message || 'Feedback not found' }, { status: 404 })
    }

    // Update milestone review_status
    await supabase
      .from('creator_milestones')
      .update({ review_status: 'feedback_ready' })
      .eq('id', feedback.milestone_record_id)

    // Send email notification
    const { data: creator } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', feedback.creator_id)
      .single()

    if (creator?.email) {
      const resendApiKey = process.env.RESEND_API_KEY
      if (resendApiKey) {
        const firstName = creator.name.split(' ')[0]
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
              to: [creator.email],
              subject: 'Creator Studio | New feedback on your submission!',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1e2749;">Hi ${firstName}!</h2>
                  <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    You have new feedback on your recent submission in Creator Studio.
                    Log in to review it and keep moving forward!
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                       style="display: inline-block; background: #1e2749; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                      View My Feedback
                    </a>
                  </div>
                  <p style="color: #666; font-size: 14px;">-- The TDI Team</p>
                </div>
              `,
            }),
          })
        } catch (emailErr) {
          console.error('[creator-feedback] Email error:', emailErr)
        }
      }
    }

    return NextResponse.json({ success: true, feedback_id: feedback.id })
  }

  // Reject feedback
  if (action === 'reject') {
    const { feedback_id, reason } = body
    if (!feedback_id) {
      return NextResponse.json({ error: 'feedback_id required' }, { status: 400 })
    }

    const { data: feedback } = await supabase
      .from('creator_milestone_feedback')
      .select('milestone_record_id')
      .eq('id', feedback_id)
      .single()

    const { error } = await supabase
      .from('creator_milestone_feedback')
      .update({ feedback_draft_status: 'rejected' })
      .eq('id', feedback_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Reset milestone to submitted
    if (feedback) {
      await supabase
        .from('creator_milestones')
        .update({ review_status: 'submitted' })
        .eq('id', feedback.milestone_record_id)
    }

    return NextResponse.json({ success: true, feedback_id, reason })
  }

  // Add direct feedback (bypasses Anne Marie)
  if (action === 'add_direct') {
    const { milestone_record_id, creator_id, feedback_content, approved_by } = body
    if (!milestone_record_id || !creator_id || !feedback_content) {
      return NextResponse.json({ error: 'milestone_record_id, creator_id, and feedback_content required' }, { status: 400 })
    }

    // Get submission version
    const { count: existingCount } = await supabase
      .from('creator_milestone_feedback')
      .select('id', { count: 'exact', head: true })
      .eq('milestone_record_id', milestone_record_id)

    // Get the submitted values from the milestone
    const { data: milestoneRecord } = await supabase
      .from('creator_milestones')
      .select('submitted_value, submission_notes')
      .eq('id', milestone_record_id)
      .single()

    const { data: feedback, error } = await supabase
      .from('creator_milestone_feedback')
      .insert({
        milestone_record_id,
        creator_id,
        submission_version: (existingCount || 0) + 1,
        submitted_value: milestoneRecord?.submitted_value || null,
        submission_notes: milestoneRecord?.submission_notes || null,
        feedback_content,
        feedback_drafted_by: null, // direct human feedback
        feedback_draft_status: 'approved',
        feedback_approved_by: approved_by || 'admin',
        feedback_approved_at: new Date().toISOString(),
        visible_to_creator: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update milestone review_status
    await supabase
      .from('creator_milestones')
      .update({ review_status: 'feedback_ready' })
      .eq('id', milestone_record_id)

    return NextResponse.json({ success: true, feedback_id: feedback.id })
  }

  return NextResponse.json({ error: 'Unknown action. Use: approve, reject, add_direct' }, { status: 400 })
}
