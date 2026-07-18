import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { feedbackDraftReady, feedbackApproved } from '@/lib/creator-slack'

/**
 * Creator Studio Sync API -- Bridge between Paperclip agents and the Creator Portal
 *
 * Anne Marie (Creator Studio Manager agent) calls this to:
 * - Discover creators needing attention (find_work)
 * - Read creator profiles (get_creator)
 * - Draft check-in notes for Bella's approval (draft_note)
 * - Flag creators needing human attention (flag_attention)
 * - Get dashboard overview (get_dashboard)
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
 * Rule: Agents draft, humans approve. Nothing reaches creators without Bella's approval.
 */

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function authorize(request: NextRequest): boolean {
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) return false
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${syncKey}`
}

// GET -- Anne Marie reads creator data and finds work
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl
  const action = url.searchParams.get('action')
  const supabase = db()

  // ─── find_work: discover creators needing attention ───
  if (action === 'find_work') {
    const agent = url.searchParams.get('agent')
    const now = new Date()

    // Get all active, non-published creators
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name, email, content_path, current_phase, updated_at, target_completion_date, lifecycle_state, publish_status, last_followed_up_at, course_title, agreement_signed')
      .eq('status', 'active')
      .or('lifecycle_state.is.null,lifecycle_state.eq.active')
      .neq('publish_status', 'published')

    if (!creators || creators.length === 0) {
      return NextResponse.json({ work: [], count: 0 })
    }

    // Get active re-engagement sequences to avoid piling on
    const creatorIds = creators.map(c => c.id)
    const { data: activeSequences } = await supabase
      .from('creator_reengagement_sequences')
      .select('creator_id, current_step, status')
      .in('creator_id', creatorIds)
      .eq('status', 'active')

    const sequenceMap = new Map(
      (activeSequences || []).map(s => [s.creator_id, s])
    )

    // Get milestones awaiting TDI approval
    const { data: pendingApprovals } = await supabase
      .from('creator_milestones')
      .select('creator_id, milestone_id, status, submitted_value, updated_at')
      .in('creator_id', creatorIds)
      .eq('status', 'waiting_approval')

    const approvalsByCreator = new Map<string, typeof pendingApprovals>()
    for (const approval of (pendingApprovals || [])) {
      const existing = approvalsByCreator.get(approval.creator_id) || []
      existing.push(approval)
      approvalsByCreator.set(approval.creator_id, existing)
    }

    // Get recent agent activity to avoid re-flagging
    const { data: recentAgentNotes } = await supabase
      .from('creator_notes')
      .select('creator_id, created_at')
      .in('creator_id', creatorIds)
      .eq('author', 'Anne Marie (AI)')
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const recentAgentActivity = new Set(
      (recentAgentNotes || []).map(n => n.creator_id)
    )

    const work: any[] = []

    for (const creator of creators) {
      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(creator.updated_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      const sequence = sequenceMap.get(creator.id)
      const pendingMilestones = approvalsByCreator.get(creator.id) || []
      const agentAlreadyActed = recentAgentActivity.has(creator.id)

      // Skip if agent already acted on this creator in the past 7 days
      if (agentAlreadyActed) continue

      // 1. STALLED CREATORS (14+ days, no active re-engagement or at step 5+)
      if (daysSinceUpdate >= 14) {
        // Skip if re-engagement sequence is active at steps 0-4 (drip is handling it)
        if (sequence && sequence.current_step <= 4) continue

        const severity = daysSinceUpdate >= 60 ? 'critical' : daysSinceUpdate >= 30 ? 'high' : 'medium'

        work.push({
          request_type: 'stalled_creator',
          severity,
          creator_id: creator.id,
          creator_name: creator.name,
          email: creator.email,
          content_path: creator.content_path,
          current_phase: creator.current_phase,
          course_title: creator.course_title,
          days_stalled: daysSinceUpdate,
          reengagement_step: sequence?.current_step ?? null,
          has_active_reengagement: !!sequence,
        })
      }

      // 2. MILESTONES AWAITING TDI APPROVAL (team owes them a response)
      if (pendingMilestones.length > 0) {
        for (const milestone of pendingMilestones) {
          const daysWaiting = Math.floor(
            (now.getTime() - new Date(milestone.updated_at).getTime()) / (1000 * 60 * 60 * 24)
          )
          // Only flag if waiting 3+ days
          if (daysWaiting >= 3) {
            work.push({
              request_type: 'approval_waiting',
              creator_id: creator.id,
              creator_name: creator.name,
              milestone_id: milestone.milestone_id,
              days_waiting: daysWaiting,
              submitted_value: milestone.submitted_value,
            })
          }
        }
      }

      // 3. OVERDUE TARGET DATE
      if (creator.target_completion_date) {
        const targetDate = new Date(creator.target_completion_date)
        const daysOverdue = Math.floor(
          (now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysOverdue > 7) {
          work.push({
            request_type: 'overdue_target',
            creator_id: creator.id,
            creator_name: creator.name,
            content_path: creator.content_path,
            course_title: creator.course_title,
            target_date: creator.target_completion_date,
            days_overdue: daysOverdue,
          })
        }
      }
    }

    // 4. SUBMISSION REVIEWS (milestones submitted but no pending feedback draft yet)
    const { data: submittedMilestones } = await supabase
      .from('creator_milestones')
      .select('id, creator_id, milestone_id, submitted_value, submission_notes, review_status, updated_at')
      .in('creator_id', creatorIds)
      .eq('review_status', 'submitted')

    if (submittedMilestones && submittedMilestones.length > 0) {
      // Check which ones already have pending feedback drafts
      const submittedIds = submittedMilestones.map(m => m.id)
      const { data: existingDrafts } = await supabase
        .from('creator_milestone_feedback')
        .select('milestone_record_id')
        .in('milestone_record_id', submittedIds)
        .eq('feedback_draft_status', 'pending_review')

      const hasPendingDraft = new Set(
        (existingDrafts || []).map(d => d.milestone_record_id)
      )

      for (const milestone of submittedMilestones) {
        if (hasPendingDraft.has(milestone.id)) continue

        const creator = creators.find(c => c.id === milestone.creator_id)
        if (!creator) continue

        // Get the latest submission version
        const { count: submissionCount } = await supabase
          .from('creator_milestone_feedback')
          .select('id', { count: 'exact', head: true })
          .eq('milestone_record_id', milestone.id)

        work.push({
          request_type: 'submission_review',
          creator_id: milestone.creator_id,
          creator_name: creator.name,
          email: creator.email,
          milestone_record_id: milestone.id,
          milestone_id: milestone.milestone_id,
          submitted_value: milestone.submitted_value,
          submission_notes: milestone.submission_notes,
          submission_version: (submissionCount || 0) + 1,
          submitted_at: milestone.updated_at,
        })
      }
    }

    // Sort by severity/urgency
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2 }
    work.sort((a, b) => {
      const aOrder = severityOrder[a.severity] ?? 3
      const bOrder = severityOrder[b.severity] ?? 3
      return aOrder - bOrder
    })

    return NextResponse.json({
      work,
      count: work.length,
      filters: {
        agent: agent || 'all',
        stalled_count: work.filter(w => w.request_type === 'stalled_creator').length,
        approval_count: work.filter(w => w.request_type === 'approval_waiting').length,
        overdue_count: work.filter(w => w.request_type === 'overdue_target').length,
        submission_review_count: work.filter(w => w.request_type === 'submission_review').length,
      },
    })
  }

  // ─── get_creator: full creator profile ───
  if (action === 'get_creator') {
    const creatorId = url.searchParams.get('creatorId')
    if (!creatorId) return NextResponse.json({ error: 'creatorId param required' }, { status: 400 })

    const [creatorRes, milestonesRes, notesRes] = await Promise.all([
      supabase.from('creators').select('*').eq('id', creatorId).single(),
      supabase.from('creator_milestones').select('*').eq('creator_id', creatorId).order('sort_order'),
      supabase.from('creator_notes').select('*').eq('creator_id', creatorId).order('created_at', { ascending: false }).limit(20),
    ])

    return NextResponse.json({
      creator: creatorRes.data,
      milestones: milestonesRes.data || [],
      notes: notesRes.data || [],
    })
  }

  // ─── get_dashboard: summary stats ───
  if (action === 'get_dashboard') {
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name, status, lifecycle_state, publish_status, updated_at, current_phase')
      .eq('status', 'active')

    if (!creators) return NextResponse.json({ stats: {} })

    const now = new Date()
    const active = creators.filter(c => c.lifecycle_state !== 'paused')
    const published = creators.filter(c => c.publish_status === 'published')
    const stalled = active.filter(c => {
      const days = Math.floor((now.getTime() - new Date(c.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      return days >= 14 && c.publish_status !== 'published'
    })

    // Count pending agent drafts
    const { count: pendingDrafts } = await supabase
      .from('creator_notes')
      .select('id', { count: 'exact', head: true })
      .eq('draft_status', 'pending_approval')

    return NextResponse.json({
      stats: {
        total: creators.length,
        active: active.length,
        published: published.length,
        stalled: stalled.length,
        paused: creators.filter(c => c.lifecycle_state === 'paused').length,
        pending_agent_drafts: pendingDrafts || 0,
      },
    })
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: find_work, get_creator, get_dashboard' },
    { status: 400 }
  )
}

// POST -- Anne Marie pushes drafts and flags
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const action = body.action
  const supabase = db()

  // ─── draft_note: save a note for Bella's approval ───
  if (action === 'draft_note') {
    const { creator_id, content, reason } = body
    if (!creator_id || !content) {
      return NextResponse.json({ error: 'creator_id and content required' }, { status: 400 })
    }

    // Check for existing pending draft for this creator to avoid duplicates
    const { data: existingDraft } = await supabase
      .from('creator_notes')
      .select('id')
      .eq('creator_id', creator_id)
      .eq('draft_status', 'pending_approval')
      .eq('author', 'Anne Marie (AI)')
      .maybeSingle()

    if (existingDraft) {
      return NextResponse.json({
        success: false,
        error: 'A pending draft already exists for this creator',
        existing_draft_id: existingDraft.id,
      }, { status: 409 })
    }

    const { data: note, error } = await supabase
      .from('creator_notes')
      .insert({
        creator_id,
        content,
        author: 'Anne Marie (AI)',
        visible_to_creator: false, // stays invisible until Bella approves
        draft_status: 'pending_approval',
        drafted_by: 'anne-marie',
        draft_reason: reason || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, note_id: note.id })
  }

  // ─── flag_attention: flag a creator for human review ───
  if (action === 'flag_attention') {
    const { creator_id, reason } = body
    if (!creator_id || !reason) {
      return NextResponse.json({ error: 'creator_id and reason required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('creators')
      .update({
        agent_flag: reason,
        agent_flag_at: new Date().toISOString(),
        agent_flag_cleared: false,
      })
      .eq('id', creator_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  // ─── approve_draft: Bella approves an agent-drafted note ───
  if (action === 'approve_draft') {
    const { note_id, approved_by } = body
    if (!note_id) {
      return NextResponse.json({ error: 'note_id required' }, { status: 400 })
    }

    // Make the note visible to the creator
    const { data: note, error } = await supabase
      .from('creator_notes')
      .update({
        visible_to_creator: true,
        draft_status: 'published',
      })
      .eq('id', note_id)
      .eq('draft_status', 'pending_approval')
      .select('id, creator_id, content')
      .single()

    if (error || !note) {
      return NextResponse.json({ error: error?.message || 'Draft not found or already approved' }, { status: 404 })
    }

    // Get creator info for email notification
    const { data: creator } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', note.creator_id)
      .single()

    // Send email notification to creator (same as add-note flow)
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
              subject: 'Creator Studio | New note from your team!',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #1e2749;">Hi ${firstName}!</h2>
                  <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    The TDI team has added a new note to your Creator Studio profile.
                    Log in to review it and keep moving forward on your journey!
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
                       style="display: inline-block; background: #1e2749; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                      View My Creator Studio
                    </a>
                  </div>
                  <p style="color: #666; font-size: 14px;">-- The TDI Team</p>
                </div>
              `,
            }),
          })
        } catch (emailErr) {
          console.error('[creator-studio-sync] Email error:', emailErr)
        }
      }
    }

    // Bump updated_at to cancel any active re-engagement sequence
    await supabase
      .from('creators')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', note.creator_id)

    return NextResponse.json({ success: true, note_id: note.id, approved_by })
  }

  // ─── reject_draft: Bella rejects an agent-drafted note ───
  if (action === 'reject_draft') {
    const { note_id, feedback } = body
    if (!note_id) {
      return NextResponse.json({ error: 'note_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('creator_notes')
      .update({ draft_status: 'rejected' })
      .eq('id', note_id)
      .eq('draft_status', 'pending_approval')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, note_id, feedback: feedback || null })
  }

  // ─── clear_flag: dismiss agent flag on a creator ───
  if (action === 'clear_flag') {
    const { creator_id } = body
    if (!creator_id) {
      return NextResponse.json({ error: 'creator_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('creators')
      .update({
        agent_flag: null,
        agent_flag_at: null,
        agent_flag_cleared: true,
      })
      .eq('id', creator_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  // ─── draft_feedback: Anne Marie drafts feedback on a creator submission ───
  if (action === 'draft_feedback') {
    const { milestone_record_id, creator_id, feedback_content, submission_version } = body
    if (!milestone_record_id || !creator_id || !feedback_content) {
      return NextResponse.json({ error: 'milestone_record_id, creator_id, and feedback_content required' }, { status: 400 })
    }

    // Guard: only one pending feedback per milestone at a time
    const { data: existingPending } = await supabase
      .from('creator_milestone_feedback')
      .select('id')
      .eq('milestone_record_id', milestone_record_id)
      .eq('feedback_draft_status', 'pending_review')
      .maybeSingle()

    if (existingPending) {
      return NextResponse.json({
        success: false,
        error: 'A pending feedback draft already exists for this milestone',
        existing_feedback_id: existingPending.id,
      }, { status: 409 })
    }

    // Get the current submission version
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
        submission_version: submission_version || (existingCount || 0) + 1,
        submitted_value: milestoneRecord?.submitted_value || null,
        submission_notes: milestoneRecord?.submission_notes || null,
        feedback_content,
        feedback_drafted_by: 'anne-marie',
        feedback_draft_status: 'pending_review',
        visible_to_creator: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update milestone review_status to under_review
    await supabase
      .from('creator_milestones')
      .update({ review_status: 'under_review' })
      .eq('id', milestone_record_id)

    // Slack notification for feedback draft
    try {
      const { data: creator } = await supabase
        .from('creators')
        .select('name')
        .eq('id', creator_id)
        .single()
      const { data: milestoneInfo } = await supabase
        .from('creator_milestones')
        .select('milestone_id')
        .eq('id', milestone_record_id)
        .single()
      const { data: milestone } = milestoneInfo?.milestone_id
        ? await supabase.from('milestones').select('title').eq('id', milestoneInfo.milestone_id).single()
        : { data: null }
      feedbackDraftReady(
        creator?.name || 'Unknown creator',
        milestone?.title || `Milestone ${milestoneInfo?.milestone_id || '?'}`,
        body.feedback_drafted_by || 'Anne Marie'
      ).catch(() => {})
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true, feedback_id: feedback.id })
  }

  // ─── approve_feedback: Bella approves feedback to make it visible to creator ───
  if (action === 'approve_feedback') {
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
      .eq('feedback_draft_status', 'pending_review')
      .select('id, milestone_record_id, creator_id, feedback_content')
      .single()

    if (error || !feedback) {
      return NextResponse.json({ error: error?.message || 'Feedback not found or already processed' }, { status: 404 })
    }

    // Update milestone review_status to feedback_ready
    await supabase
      .from('creator_milestones')
      .update({ review_status: 'feedback_ready' })
      .eq('id', feedback.milestone_record_id)

    // Slack notification for feedback approval
    try {
      const { data: milestoneInfo } = await supabase
        .from('creator_milestones')
        .select('milestone_id')
        .eq('id', feedback.milestone_record_id)
        .single()
      const { data: milestone } = milestoneInfo?.milestone_id
        ? await supabase.from('milestones').select('title').eq('id', milestoneInfo.milestone_id).single()
        : { data: null }
      const { data: creatorForSlack } = await supabase
        .from('creators')
        .select('name')
        .eq('id', feedback.creator_id)
        .single()
      feedbackApproved(
        creatorForSlack?.name || 'Unknown creator',
        milestone?.title || `Milestone ${milestoneInfo?.milestone_id || '?'}`,
        approved_by || 'admin'
      ).catch(() => {})
    } catch { /* non-blocking */ }

    // Send email notification to creator
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
          console.error('[creator-studio-sync] Email error:', emailErr)
        }
      }
    }

    return NextResponse.json({ success: true, feedback_id: feedback.id, approved_by })
  }

  // ─── reject_feedback: Bella rejects agent-drafted feedback ───
  if (action === 'reject_feedback') {
    const { feedback_id, reason } = body
    if (!feedback_id) {
      return NextResponse.json({ error: 'feedback_id required' }, { status: 400 })
    }

    // Get feedback to find the milestone
    const { data: feedback } = await supabase
      .from('creator_milestone_feedback')
      .select('id, milestone_record_id')
      .eq('id', feedback_id)
      .eq('feedback_draft_status', 'pending_review')
      .single()

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found or already processed' }, { status: 404 })
    }

    // Reject the feedback
    const { error } = await supabase
      .from('creator_milestone_feedback')
      .update({ feedback_draft_status: 'rejected' })
      .eq('id', feedback_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Reset milestone review_status back to submitted so Anne Marie can try again
    await supabase
      .from('creator_milestones')
      .update({ review_status: 'submitted' })
      .eq('id', feedback.milestone_record_id)

    return NextResponse.json({ success: true, feedback_id, reason: reason || null })
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: draft_note, flag_attention, approve_draft, reject_draft, clear_flag, draft_feedback, approve_feedback, reject_feedback' },
    { status: 400 }
  )
}
