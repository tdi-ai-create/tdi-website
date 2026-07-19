import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Creator Recruitment Sync API -- Bridge between Paperclip agents and the Creator Recruitment Pipeline
 *
 * Anne Marie (Creator Studio Manager agent) calls this to:
 * - View content gaps and pipeline stats (GET)
 * - Submit gaps, candidates, approve outreach, log responses (POST)
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
 * Rule: Anne Marie drafts outreach, Bella approves before sending.
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

// GET -- Read pipeline data
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl
  const action = url.searchParams.get('action')
  const supabase = db()

  // ─── get_gaps: all active content gaps with candidate counts ───
  if (action === 'get_gaps') {
    const { data: gaps, error } = await supabase
      .from('creator_content_gaps')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true })

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

    // Sort: critical > high > medium > low
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

  // ─── get_pipeline: candidates filtered by stage ───
  if (action === 'get_pipeline') {
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

    // Get latest note for each candidate
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

    // Sort by stage priority
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

  // ─── get_candidate: full candidate profile ───
  if (action === 'get_candidate') {
    const candidateId = url.searchParams.get('candidateId')
    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId param required' }, { status: 400 })
    }

    const [candidateRes, notesRes] = await Promise.all([
      supabase
        .from('creator_recruitment_candidates')
        .select('*, creator_content_gaps(id, category, priority, demand_signal)')
        .eq('id', candidateId)
        .single(),
      supabase
        .from('creator_recruitment_notes')
        .select('*')
        .eq('candidate_id', candidateId)
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

  // ─── get_stats: pipeline health metrics ───
  if (action === 'get_stats') {
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

    // Total candidates by stage
    const { data: allCandidates } = await supabase
      .from('creator_recruitment_candidates')
      .select('stage, created_at')

    const totalByStage: Record<string, number> = {}
    let totalDaysInPipeline = 0
    let activeCount = 0
    const now = new Date()

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

    return NextResponse.json({
      stats: {
        critical_gaps_without_candidates: criticalGapsWithoutCandidates,
        total_candidates_by_stage: totalByStage,
        avg_days_in_pipeline: activeCount > 0 ? Math.round(totalDaysInPipeline / activeCount) : 0,
        conversions_this_month: conversionsThisMonth || 0,
      },
    })
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: get_gaps, get_pipeline, get_candidate, get_stats' },
    { status: 400 }
  )
}

// POST -- Write pipeline data
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const action = body.action
  const supabase = db()

  // ─── submit_gap: create or update a content gap ───
  if (action === 'submit_gap') {
    const { category, priority, demand_signal, hub_course_count, hub_quick_win_count, sales_mentions, recommended_content_path, notes } = body
    if (!category || !priority) {
      return NextResponse.json({ error: 'category and priority required' }, { status: 400 })
    }

    // Check if active gap exists for this category
    const { data: existing } = await supabase
      .from('creator_content_gaps')
      .select('id')
      .eq('category', category)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      // Update existing
      const { data: gap, error } = await supabase
        .from('creator_content_gaps')
        .update({
          priority,
          demand_signal: demand_signal || null,
          hub_course_count: hub_course_count ?? 0,
          hub_quick_win_count: hub_quick_win_count ?? 0,
          sales_mentions: sales_mentions ?? 0,
          recommended_content_path: recommended_content_path || null,
          notes: notes || null,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, gap_id: gap.id, updated: true })
    }

    // Create new
    const { data: gap, error } = await supabase
      .from('creator_content_gaps')
      .insert({
        category,
        priority,
        demand_signal: demand_signal || null,
        hub_course_count: hub_course_count ?? 0,
        hub_quick_win_count: hub_quick_win_count ?? 0,
        sales_mentions: sales_mentions ?? 0,
        recommended_content_path: recommended_content_path || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, gap_id: gap.id, updated: false })
  }

  // ─── submit_candidate: add a new recruitment candidate ───
  if (action === 'submit_candidate') {
    const { name, email, school_org, role, expertise_area, gap_id, content_path, source, source_detail, why_good_fit, social_url, outreach_draft } = body
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    // Guard: no duplicate by email
    if (email) {
      const { data: existing } = await supabase
        .from('creator_recruitment_candidates')
        .select('id, stage')
        .eq('email', email)
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
        name,
        email: email || null,
        school_org: school_org || null,
        role: role || null,
        expertise_area: expertise_area || null,
        gap_id: gap_id || null,
        content_path: content_path || null,
        source: source || null,
        source_detail: source_detail || null,
        why_good_fit: why_good_fit || null,
        social_url: social_url || null,
        outreach_draft: outreach_draft || null,
        stage: 'suggested',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, candidate_id: candidate.id })
  }

  // ─── approve_outreach: Bella approves drafted outreach ───
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

    // Log note
    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: `Outreach approved by ${approved_by || 'admin'}${edited_outreach ? ' (with edits)' : ''}`,
      author: approved_by || 'admin',
      note_type: 'stage_change',
    })

    return NextResponse.json({ success: true })
  }

  // ─── mark_sent: outreach was sent ───
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

  // ─── log_response: candidate responded ───
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

    return NextResponse.json({ success: true })
  }

  // ─── update_stage: move candidate to any stage ───
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
      author: 'system',
      note_type: 'stage_change',
    })

    return NextResponse.json({ success: true })
  }

  // ─── add_note: add a note to a candidate ───
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

  // ─── convert_to_creator: committed candidate becomes a creator ───
  if (action === 'convert_to_creator') {
    const { candidate_id, content_path, topic } = body
    if (!candidate_id) {
      return NextResponse.json({ error: 'candidate_id required' }, { status: 400 })
    }

    // Get candidate info
    const { data: candidate, error: candErr } = await supabase
      .from('creator_recruitment_candidates')
      .select('*')
      .eq('id', candidate_id)
      .single()

    if (candErr || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // Create new creator
    const { data: creator, error: creatorErr } = await supabase
      .from('creators')
      .insert({
        name: candidate.name,
        email: candidate.email,
        content_path: content_path || candidate.content_path || 'course',
        topic: topic || candidate.expertise_area || null,
        status: 'active',
        lifecycle_state: 'active',
        current_phase: 'onboarding',
      })
      .select()
      .single()

    if (creatorErr || !creator) {
      return NextResponse.json({ error: creatorErr?.message || 'Failed to create creator' }, { status: 500 })
    }

    // Update candidate
    await supabase
      .from('creator_recruitment_candidates')
      .update({
        stage: 'archived',
        converted_creator_id: creator.id,
      })
      .eq('id', candidate_id)

    // Update gap active_creator_count
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

    // Log conversion note
    await supabase.from('creator_recruitment_notes').insert({
      candidate_id,
      content: `Converted to creator (ID: ${creator.id})`,
      author: 'system',
      note_type: 'stage_change',
    })

    return NextResponse.json({ success: true, creator_id: creator.id })
  }

  // ─── nominate: quick nomination from sales or referral ───
  if (action === 'nominate') {
    const { name, email, school_org, role, expertise_area, source, nominated_by, nominated_from, notes: nominationNotes } = body
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    // Guard: no duplicate by email
    if (email) {
      const { data: existing } = await supabase
        .from('creator_recruitment_candidates')
        .select('id, stage')
        .eq('email', email)
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
        name,
        email: email || null,
        school_org: school_org || null,
        role: role || null,
        expertise_area: expertise_area || null,
        source: source || 'sales_nomination',
        nominated_by: nominated_by || null,
        nominated_from: nominated_from || null,
        stage: 'suggested',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Add nomination note if provided
    if (nominationNotes) {
      await supabase.from('creator_recruitment_notes').insert({
        candidate_id: candidate.id,
        content: nominationNotes,
        author: nominated_by || 'system',
        note_type: 'note',
      })
    }

    return NextResponse.json({ success: true, candidate_id: candidate.id })
  }

  return NextResponse.json(
    { error: 'Unknown action. Use: submit_gap, submit_candidate, approve_outreach, mark_sent, log_response, update_stage, add_note, convert_to_creator, nominate' },
    { status: 400 }
  )
}
