import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  recruitmentOutreachApproved,
  recruitmentCandidateResponded,
  recruitmentCandidateConverted,
  recruitmentNeedsApproval,
} from '@/lib/creator-slack'
import { buildActionQueue, summarizeGoals, QUEUE_LABELS } from '@/lib/recruitment-goals'

const GAP_PRIORITIES = ['critical', 'high', 'medium', 'low']
const GAP_STATUSES = ['active', 'filled', 'monitoring']
const CONTENT_PATHS = ['course', 'download', 'blog']

/**
 * Admin Creator Recruitment API -- Used by the TDI Admin Portal UI
 *
 * No PAPERCLIP_SYNC_KEY required (admin session handles auth).
 * Provides read/write access to the recruitment pipeline for the admin UI.
 */

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET -- Read pipeline data for admin UI
export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const action = url.searchParams.get('action')
  const supabase = db()

  // ─── gaps: all active content gaps with candidate counts ───
  if (action === 'gaps') {
    // Default to the working set. The scan marks well covered categories
    // 'filled', and those should not clutter the board unless asked for.
    const status = url.searchParams.get('status') || 'active'

    let gapQuery = supabase.from('creator_content_gaps').select('*')
    if (status !== 'all') {
      gapQuery = gapQuery.eq('status', status)
    }

    const { data: gaps, error } = await gapQuery.order('priority', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get candidate counts per gap
    const gapIds = (gaps || []).map(g => g.id)
    let candidateCounts: Record<string, number> = {}

    if (gapIds.length > 0) {
      const { data: counts } = await supabase
        .from('creator_recruitment_candidates')
        .select('gap_id')
        .in('gap_id', gapIds)
        .not('stage', 'in', '("archived","declined","no_response")')

      if (counts) {
        for (const row of counts) {
          if (row.gap_id) {
            candidateCounts[row.gap_id] = (candidateCounts[row.gap_id] || 0) + 1
          }
        }
      }
    }

    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    const sortedGaps = (gaps || []).sort((a, b) =>
      (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
    )

    const gapsWithCounts = sortedGaps.map(g => ({
      ...g,
      candidate_count: candidateCounts[g.id] || 0,
    }))

    return NextResponse.json({ gaps: gapsWithCounts, count: gapsWithCounts.length })
  }

  // ─── pipeline: candidates with gap info ───
  if (action === 'pipeline') {
    const stage = url.searchParams.get('stage')

    let query = supabase
      .from('creator_recruitment_candidates')
      .select('*, creator_content_gaps(id, category, priority)')

    if (stage && stage !== 'all') {
      query = query.eq('stage', stage)
    }

    const { data: candidates, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get latest note per candidate
    const candidateIds = (candidates || []).map(c => c.id)
    let latestNotes: Record<string, any> = {}

    if (candidateIds.length > 0) {
      const { data: notes } = await supabase
        .from('creator_recruitment_notes')
        .select('*')
        .in('candidate_id', candidateIds)
        .order('created_at', { ascending: false })

      if (notes) {
        for (const note of notes) {
          if (!latestNotes[note.candidate_id]) {
            latestNotes[note.candidate_id] = note
          }
        }
      }
    }

    const stageOrder: Record<string, number> = {
      suggested: 0, outreach_approved: 1, outreach_sent: 2, interested: 3,
      evaluation: 4, call_scheduled: 5, committed: 6, revisit: 7,
      declined: 8, no_response: 9, archived: 10,
    }

    const sorted = (candidates || []).sort((a, b) => {
      const stageA = stageOrder[a.stage] ?? 99
      const stageB = stageOrder[b.stage] ?? 99
      if (stageA !== stageB) return stageA - stageB
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const result = sorted.map(c => ({
      ...c,
      gap: c.creator_content_gaps || null,
      latest_note: latestNotes[c.id] || null,
      creator_content_gaps: undefined,
    }))

    return NextResponse.json({ candidates: result, count: result.length })
  }

  // ─── candidate: full detail with notes ───
  if (action === 'candidate') {
    const id = url.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id param required' }, { status: 400 })
    }

    const [candidateRes, notesRes] = await Promise.all([
      supabase
        .from('creator_recruitment_candidates')
        .select('*, creator_content_gaps(id, category, priority, demand_signal)')
        .eq('id', id)
        .single(),
      supabase
        .from('creator_recruitment_notes')
        .select('*')
        .eq('candidate_id', id)
        .order('created_at', { ascending: false }),
    ])

    if (candidateRes.error) {
      return NextResponse.json({ error: candidateRes.error.message }, { status: 404 })
    }

    return NextResponse.json({
      candidate: { ...candidateRes.data, gap: candidateRes.data.creator_content_gaps || null },
      notes: notesRes.data || [],
    })
  }

  // ─── stats: pipeline health ───
  if (action === 'stats') {
    const now = new Date()

    // Critical gaps without candidates
    const { data: criticalGaps } = await supabase
      .from('creator_content_gaps')
      .select('id')
      .eq('status', 'active')
      .eq('priority', 'critical')

    const criticalGapIds = (criticalGaps || []).map(g => g.id)
    let criticalGapsWithoutCandidates = criticalGapIds.length

    if (criticalGapIds.length > 0) {
      const { data: coveredGaps } = await supabase
        .from('creator_recruitment_candidates')
        .select('gap_id')
        .in('gap_id', criticalGapIds)
        .not('stage', 'in', '("archived","declined","no_response")')

      const coveredSet = new Set((coveredGaps || []).map(c => c.gap_id))
      criticalGapsWithoutCandidates = criticalGapIds.filter(id => !coveredSet.has(id)).length
    }

    // Total by stage
    const { data: allCandidates } = await supabase
      .from('creator_recruitment_candidates')
      .select('stage, created_at')

    const totalByStage: Record<string, number> = {}
    let totalDaysInPipeline = 0
    let activeCount = 0

    for (const c of (allCandidates || [])) {
      totalByStage[c.stage] = (totalByStage[c.stage] || 0) + 1
      if (c.stage !== 'archived' && c.stage !== 'declined' && c.stage !== 'no_response') {
        const days = Math.floor((now.getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24))
        totalDaysInPipeline += days
        activeCount++
      }
    }

    // Conversions this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { count: conversionsThisMonth } = await supabase
      .from('creator_recruitment_candidates')
      .select('id', { count: 'exact', head: true })
      .not('converted_creator_id', 'is', null)
      .gte('updated_at', startOfMonth)

    // Goal progress and the action queue share one read of the pipeline.
    const { data: queueRows } = await supabase
      .from('creator_recruitment_candidates')
      .select('id, name, stage, created_at, updated_at, outreach_sent_at, outreach_follow_up_1_at, outreach_follow_up_2_at, revisit_date')

    const queue = buildActionQueue(queueRows || [])
    const goals = summarizeGoals(queueRows || [], conversionsThisMonth || 0, queue)

    return NextResponse.json({
      stats: {
        critical_gaps_without_candidates: criticalGapsWithoutCandidates,
        total_candidates_by_stage: totalByStage,
        avg_days_in_pipeline: activeCount > 0 ? Math.round(totalDaysInPipeline / activeCount) : 0,
        conversions_this_month: conversionsThisMonth || 0,
        goals,
      },
    })
  }

  // ─── action_queue: what Bella has to do, derived rather than asked of her ───
  if (action === 'action_queue') {
    const { data: rows, error } = await supabase
      .from('creator_recruitment_candidates')
      .select('id, name, stage, created_at, updated_at, outreach_sent_at, outreach_follow_up_1_at, outreach_follow_up_2_at, revisit_date')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const queue = buildActionQueue(rows || [])
    const grouped: Record<string, typeof queue> = {}
    for (const item of queue) {
      grouped[item.reason] = grouped[item.reason] || []
      grouped[item.reason].push(item)
    }

    return NextResponse.json({ queue, grouped, labels: QUEUE_LABELS, count: queue.length })
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: gaps, pipeline, candidate, stats, action_queue' },
    { status: 400 }
  )
}

// POST -- Write pipeline data from admin UI
export async function POST(request: NextRequest) {
  const body = await request.json()
  const action = body.action
  const supabase = db()

  // ─── approve_outreach ───
  if (action === 'approve_outreach') {
    const { candidate_id, approved_by, edited_outreach } = body
    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id required' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {
      stage: 'outreach_approved',
      outreach_approved_by: approved_by || 'admin',
    }
    if (edited_outreach) {
      updatePayload.outreach_draft = edited_outreach
    }

    const { error } = await supabase
      .from('creator_recruitment_candidates')
      .update(updatePayload)
      .eq('id', candidate_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: `Outreach approved by ${approved_by || 'admin'}${edited_outreach ? ' (with edits)' : ''}`,
      author: approved_by || 'admin',
      note_type: 'stage_change',
    })

    // Slack notification (non-blocking)
    try {
      const { data: cand } = await supabase.from('creator_recruitment_candidates').select('name').eq('id', candidate_id).single()
      if (cand) recruitmentOutreachApproved(cand.name, approved_by || 'admin').catch(() => {})
    } catch {}

    return NextResponse.json({ success: true })
  }

  // ─── mark_sent ───
  if (action === 'mark_sent') {
    const { candidate_id } = body
    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('creator_recruitment_candidates')
      .update({
        stage: 'outreach_sent',
        outreach_sent_at: new Date().toISOString(),
      })
      .eq('id', candidate_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: 'Outreach sent',
      author: 'system',
      note_type: 'outreach_sent',
    })

    return NextResponse.json({ success: true })
  }

  // ─── log_response ───
  if (action === 'log_response') {
    const { candidate_id, response_notes, new_stage } = body
    if (!candidate_id || !new_stage) {
      return NextResponse.json({ error: 'candidate_id and new_stage required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('creator_recruitment_candidates')
      .update({
        stage: new_stage,
        response_received_at: new Date().toISOString(),
        response_notes: response_notes || null,
      })
      .eq('id', candidate_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: `Response received. New stage: ${new_stage}. ${response_notes || ''}`.trim(),
      author: 'system',
      note_type: 'response',
    })

    // Slack notification (non-blocking)
    try {
      const { data: cand } = await supabase.from('creator_recruitment_candidates').select('name').eq('id', candidate_id).single()
      if (cand) recruitmentCandidateResponded(cand.name, new_stage).catch(() => {})
    } catch {}

    return NextResponse.json({ success: true })
  }

  // ─── update_stage ───
  if (action === 'update_stage') {
    const { candidate_id, stage, notes: stageNotes, revisit_date, declined_reason } = body
    if (!candidate_id || !stage) {
      return NextResponse.json({ error: 'candidate_id and stage required' }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = { stage }
    if (revisit_date) updatePayload.revisit_date = revisit_date
    if (declined_reason) updatePayload.declined_reason = declined_reason

    const { error } = await supabase
      .from('creator_recruitment_candidates')
      .update(updatePayload)
      .eq('id', candidate_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: `Stage changed to: ${stage}${stageNotes ? '. ' + stageNotes : ''}`,
      author: 'admin',
      note_type: 'stage_change',
    })

    return NextResponse.json({ success: true })
  }

  // ─── add_note ───
  if (action === 'add_note') {
    const { candidate_id, content, author, note_type } = body
    if (!candidate_id || !content || !author) {
      return NextResponse.json({ error: 'candidate_id, content, and author required' }, { status: 400 })
    }

    const { data: note, error } = await supabase
      .from('creator_recruitment_notes')
      .insert({
        candidate_id,
        content,
        author,
        note_type: note_type || 'note',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, note_id: note.id })
  }

  // ─── convert_to_creator ───
  if (action === 'convert_to_creator') {
    const { candidate_id, content_path, topic } = body
    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id required' }, { status: 400 })
    }

    const { data: candidate, error: candErr } = await supabase
      .from('creator_recruitment_candidates')
      .select('*')
      .eq('id', candidate_id)
      .single()

    if (candErr || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const finalContentPath = content_path || candidate.content_path || 'course'
    const { data: creator, error: creatorErr } = await supabase
      .from('creators')
      .insert({
        name: candidate.name,
        email: candidate.email,
        content_path: finalContentPath,
        topic: topic || candidate.expertise_area || null,
        status: 'active',
        lifecycle_state: 'active',
        current_phase: 'onboarding',
        recruitment_source: candidate.source,
        recruitment_candidate_id: candidate.id,
      })
      .select()
      .single()

    if (creatorErr || !creator) {
      return NextResponse.json({ error: creatorErr?.message || 'Failed to create creator' }, { status: 500 })
    }

    await supabase
      .from('creator_recruitment_candidates')
      .update({ stage: 'archived', converted_creator_id: creator.id })
      .eq('id', candidate_id)

    if (candidate.gap_id) {
      const { data: gap } = await supabase
        .from('creator_content_gaps')
        .select('active_creator_count')
        .eq('id', candidate.gap_id)
        .single()

      if (gap) {
        await supabase
          .from('creator_content_gaps')
          .update({ active_creator_count: (gap.active_creator_count || 0) + 1 })
          .eq('id', candidate.gap_id)
      }
    }

    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: `Converted to creator (ID: ${creator.id})`,
      author: 'admin',
      note_type: 'stage_change',
    })

    // Slack notification (non-blocking)
    try {
      recruitmentCandidateConverted(candidate.name, candidate.name, finalContentPath).catch(() => {})
    } catch {}

    return NextResponse.json({ success: true, creator_id: creator.id })
  }

  // ─── create_gap: a human adds a content gap ───
  if (action === 'create_gap') {
    const { category, priority, demand_signal, recommended_content_path, notes: gapNotes } = body
    if (!category || !String(category).trim()) {
      return NextResponse.json({ error: 'category required' }, { status: 400 })
    }
    if (!GAP_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: `priority must be one of: ${GAP_PRIORITIES.join(', ')}` }, { status: 400 })
    }
    if (recommended_content_path && !CONTENT_PATHS.includes(recommended_content_path)) {
      return NextResponse.json({ error: `recommended_content_path must be one of: ${CONTENT_PATHS.join(', ')}` }, { status: 400 })
    }

    const trimmed = String(category).trim()

    // One active gap per category. Surface the existing one instead of
    // creating a second board entry for the same problem.
    const { data: existing } = await supabase
      .from('creator_content_gaps')
      .select('id, priority')
      .ilike('category', trimmed)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'An active gap already exists for this category',
        existing_id: existing.id,
      }, { status: 409 })
    }

    const { data: gap, error } = await supabase
      .from('creator_content_gaps')
      .insert({
        category: trimmed,
        priority,
        demand_signal: demand_signal || null,
        recommended_content_path: recommended_content_path || null,
        notes: gapNotes || null,
        status: 'active',
        identified_by: 'admin',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, gap_id: gap.id })
  }

  // ─── update_gap ───
  if (action === 'update_gap') {
    const { gap_id, priority, demand_signal, recommended_content_path, notes: gapNotes, status } = body
    if (!gap_id) {
      return NextResponse.json({ error: 'gap_id required' }, { status: 400 })
    }
    if (priority !== undefined && !GAP_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: `priority must be one of: ${GAP_PRIORITIES.join(', ')}` }, { status: 400 })
    }
    if (status !== undefined && !GAP_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${GAP_STATUSES.join(', ')}` }, { status: 400 })
    }
    if (recommended_content_path && !CONTENT_PATHS.includes(recommended_content_path)) {
      return NextResponse.json({ error: `recommended_content_path must be one of: ${CONTENT_PATHS.join(', ')}` }, { status: 400 })
    }

    const payload: Record<string, unknown> = {}
    if (priority !== undefined) payload.priority = priority
    if (demand_signal !== undefined) payload.demand_signal = demand_signal || null
    if (recommended_content_path !== undefined) payload.recommended_content_path = recommended_content_path || null
    if (gapNotes !== undefined) payload.notes = gapNotes || null
    if (status !== undefined) payload.status = status

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
    }

    // A human touching a gap takes ownership of it, so the weekly scan stops
    // overwriting the priority they set.
    payload.identified_by = 'admin'

    const { error } = await supabase
      .from('creator_content_gaps')
      .update(payload)
      .eq('id', gap_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ─── nominate ───
  if (action === 'nominate') {
    const {
      name, email, school_org, role, expertise_area, source,
      nominated_by, nominated_from, notes: nominationNotes,
      gap_id, content_path, why_good_fit, social_url, outreach_draft,
    } = body
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    if (content_path && !CONTENT_PATHS.includes(content_path)) {
      return NextResponse.json({ error: `content_path must be one of: ${CONTENT_PATHS.join(', ')}` }, { status: 400 })
    }

    if (email) {
      // Case insensitive so a retyped address does not slip past the guard.
      const { data: existing } = await supabase
        .from('creator_recruitment_candidates')
        .select('id, stage')
        .ilike('email', email)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({
          success: false,
          error: 'Candidate with this email already exists',
          existing_id: existing.id,
          existing_stage: existing.stage,
        }, { status: 409 })
      }
    }

    const { data: candidate, error } = await supabase
      .from('creator_recruitment_candidates')
      .insert({
        name: String(name).trim(),
        email: email ? String(email).trim() : null,
        school_org: school_org || null,
        role: role || null,
        expertise_area: expertise_area || null,
        gap_id: gap_id || null,
        content_path: content_path || null,
        why_good_fit: why_good_fit || null,
        social_url: social_url || null,
        outreach_draft: outreach_draft || null,
        source: source || 'sales_nomination',
        nominated_by: nominated_by || null,
        nominated_from: nominated_from || null,
        stage: 'suggested',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (nominationNotes) {
      await supabase.from('creator_recruitment_notes').insert({
        candidate_id: candidate.id,
        content: nominationNotes,
        author: nominated_by || 'admin',
        note_type: 'note',
      })
    }

    // Route it to Bella. A nomination that nobody hears about is the failure
    // mode this whole pipeline already lived through once.
    try {
      let gapCategory = ''
      if (gap_id) {
        const { data: gap } = await supabase
          .from('creator_content_gaps')
          .select('category')
          .eq('id', gap_id)
          .single()
        gapCategory = gap?.category || ''
      }
      recruitmentNeedsApproval(candidate.name, gapCategory, Boolean(outreach_draft)).catch(() => {})
    } catch {}

    return NextResponse.json({ success: true, candidate_id: candidate.id })
  }

  // ─── dismiss: archive a suggested candidate without outreach ───
  if (action === 'dismiss') {
    const { candidate_id, reason } = body
    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('creator_recruitment_candidates')
      .update({ stage: 'archived' })
      .eq('id', candidate_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: `Dismissed${reason ? ': ' + reason : ''}`,
      author: 'admin',
      note_type: 'stage_change',
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: approve_outreach, mark_sent, log_response, update_stage, add_note, convert_to_creator, nominate, dismiss, create_gap, update_gap' },
    { status: 400 }
  )
}
