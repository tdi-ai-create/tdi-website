import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

  return NextResponse.json(
    { error: 'Unknown action. Use: draft_note, flag_attention, approve_draft, reject_draft, clear_flag' },
    { status: 400 }
  )
}
