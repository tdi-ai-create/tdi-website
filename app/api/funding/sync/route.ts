import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Funding Sync API -- Bridge between Paperclip and the Admin Funding Portal
 *
 * Paperclip agents call this endpoint to push updates into the funding system:
 * - New opportunities discovered by the Grant Discovery Assistant
 * - Narrative status changes (drafted, reviewed, approved)
 * - Action item updates (completed, blocked)
 * - Timeline events (emails sent, calls made, decisions reached)
 * - Email drafts ready for review
 * - Pursuit lookups (find pursuit by school name)
 *
 * Auth: Bearer token via PAPERCLIP_SYNC_KEY env var
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

type SyncAction =
  | 'find_pursuit'
  | 'get_pursuit'
  | 'find_work'
  | 'create_opportunity'
  | 'update_opportunity'
  | 'create_action'
  | 'update_action'
  | 'add_timeline_event'
  | 'draft_email'
  | 'update_narrative'
  | 'get_status'

// GET -- Paperclip can look up pursuits and status
export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = request.nextUrl
  const action = url.searchParams.get('action') as string
  const supabase = db()

  // Find pursuit by school name (fuzzy match)
  if (action === 'find_pursuit') {
    const schoolName = url.searchParams.get('school')
    if (!schoolName) return NextResponse.json({ error: 'school param required' }, { status: 400 })

    const { data } = await supabase
      .from('funding_pursuits')
      .select('id, pursuit_name, district_name, total_amount, contract_gap, current_phase, client_contact_name, client_contact_email, implementation_date')
      .or(`pursuit_name.ilike.%${schoolName}%,district_name.ilike.%${schoolName}%`)

    return NextResponse.json({ pursuits: data || [] })
  }

  // Get full pursuit status with opportunities and actions
  if (action === 'get_pursuit') {
    const pursuitId = url.searchParams.get('pursuitId')
    if (!pursuitId) return NextResponse.json({ error: 'pursuitId param required' }, { status: 400 })

    const [pursuitRes, oppsRes, actionsRes] = await Promise.all([
      supabase.from('funding_pursuits').select('*').eq('id', pursuitId).single(),
      supabase.from('funding_opportunities').select('*').eq('pursuit_id', pursuitId).order('created_at'),
      supabase.from('funding_action_items').select('*').eq('pursuit_id', pursuitId).order('sort_order'),
    ])

    return NextResponse.json({
      pursuit: pursuitRes.data,
      opportunities: oppsRes.data || [],
      actions: actionsRes.data || [],
    })
  }

  // Find actionable work for an agent
  if (action === 'find_work') {
    const agent = url.searchParams.get('agent') // optional: filter by assigned_agent

    // 1. Draft narrative work — requires BOTH window_status='open' AND gate_open=true
    let narrativeQuery = supabase
      .from('funding_opportunities')
      .select(`
        id, pursuit_id, name, plan_category, amount,
        narrative_status, narrative_url, assigned_agent,
        window_status, window_opens, window_closes,
        application_opens, application_closes,
        contact_name, contact_email, waiting_on,
        pursuit:funding_pursuits!pursuit_id(id, pursuit_name, district_name, client_contact_name)
      `)
      .eq('narrative_status', 'requested')
      .eq('window_status', 'open')

    if (agent) {
      narrativeQuery = narrativeQuery.eq('assigned_agent', agent)
    }

    const { data: rawNarrativeWork } = await narrativeQuery

    // Gate enforcement: only include draft work for pursuits whose gate_open = true
    const narrativePursuitIds = [...new Set((rawNarrativeWork ?? []).map((o: any) => o.pursuit_id))]
    let gateOpenPursuitIds: Set<string> = new Set()
    if (narrativePursuitIds.length > 0) {
      const { data: openGates } = await supabase
        .from('pursuit_gate')
        .select('pursuit_id')
        .in('pursuit_id', narrativePursuitIds)
        .eq('gate_open', true)
      gateOpenPursuitIds = new Set((openGates ?? []).map(g => g.pursuit_id))
    }
    const narrativeWork = (rawNarrativeWork ?? []).filter((o: any) => gateOpenPursuitIds.has(o.pursuit_id))

    // 2. Research work — NOT window-gated, NOT gate-gated (finding new funders is always allowed)
    let researchQuery = supabase
      .from('funding_opportunities')
      .select(`
        id, pursuit_id, name, plan_category, amount,
        research_status, assigned_agent,
        window_status, contact_name,
        pursuit:funding_pursuits!pursuit_id(id, pursuit_name, district_name)
      `)
      .eq('research_status', 'requested')

    if (agent) {
      researchQuery = researchQuery.eq('assigned_agent', agent)
    }

    const { data: researchWork } = await researchQuery

    // Tag each item with its request type
    const work = [
      ...narrativeWork.map((item: any) => ({
        request_type: 'draft_narrative' as const,
        ...item,
      })),
      ...(researchWork ?? []).map((item: any) => ({
        request_type: 'research_funders' as const,
        ...item,
      })),
    ]

    return NextResponse.json({
      work,
      count: work.length,
      filters: {
        agent: agent || 'all',
        draft_narrative_count: narrativeWork.length,
        research_funders_count: (researchWork ?? []).length,
      },
    })
  }

  // Get overall status across all pursuits
  if (action === 'get_status') {
    const { data: pursuits } = await supabase
      .from('funding_pursuits')
      .select('id, pursuit_name, district_name, current_phase, client_contact_name')
      .order('created_at', { ascending: false })

    const { data: opps } = await supabase
      .from('funding_opportunities')
      .select('id, pursuit_id, name, status, waiting_on, narrative_status, client_submitted, application_closes')
      .not('status', 'in', '("awarded","denied")')

    const { data: actions } = await supabase
      .from('funding_action_items')
      .select('id, pursuit_id, title, owner_type, status, due_date')
      .in('status', ['pending', 'in_progress'])

    return NextResponse.json({
      pursuits: pursuits || [],
      active_opportunities: opps || [],
      open_actions: actions || [],
    })
  }

  return NextResponse.json({ error: 'Unknown action. Use: find_pursuit, get_pursuit, find_work, get_status' }, { status: 400 })
}

// POST -- Paperclip pushes updates
export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const action = body.action as SyncAction
  const supabase = db()

  // ---- CREATE OPPORTUNITY ----
  // When Grant Discovery Assistant finds a new funding source
  if (action === 'create_opportunity') {
    const { pursuitId, name, amount, planCategory, status, contactName, contactEmail,
      applicationOpens, applicationCloses, waitingOn, narrativeStatus, notes } = body

    if (!pursuitId || !name) {
      return NextResponse.json({ error: 'pursuitId and name required' }, { status: 400 })
    }

    // Check for duplicates (same name on same pursuit)
    const { data: existing } = await supabase
      .from('funding_opportunities')
      .select('id')
      .eq('pursuit_id', pursuitId)
      .ilike('name', name)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Opportunity with this name already exists on this pursuit',
        existing_id: existing[0].id,
      }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('funding_opportunities')
      .insert({
        pursuit_id: pursuitId,
        name,
        amount: amount || null,
        plan_category: planCategory || null,
        status: status || 'researching',
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        application_opens: applicationOpens || null,
        application_closes: applicationCloses || null,
        waiting_on: waitingOn || 'tdi',
        narrative_status: narrativeStatus || 'not_started',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Auto-create timeline event
    await supabase.from('funding_pursuit_timeline').insert({
      pursuit_id: pursuitId,
      event_date: new Date().toISOString().split('T')[0],
      event_title: `New opportunity discovered: ${name}`,
      event_detail: notes || `Added by Paperclip Grant Discovery. ${amount ? '$' + Number(amount).toLocaleString() : 'Amount TBD'}.`,
      status: 'complete',
    })

    return NextResponse.json({ success: true, opportunity: data })
  }

  // ---- UPDATE OPPORTUNITY ----
  // When agents change status, narrative, submission tracking, etc.
  if (action === 'update_opportunity') {
    const { opportunityId, ...updates } = body
    if (!opportunityId) return NextResponse.json({ error: 'opportunityId required' }, { status: 400 })

    const allowed: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const fields = [
      'name', 'amount', 'status', 'plan_category', 'waiting_on',
      'contact_name', 'contact_email', 'application_opens', 'application_closes',
      'narrative_status', 'narrative_url', 'forwarding_email_status',
      'client_submitted', 'client_submitted_proof',
      'decision_date', 'awarded_amount', 'denial_reason',
      'next_action', 'next_action_due',
    ]
    fields.forEach(f => { if (updates[f] !== undefined) allowed[f] = updates[f] })

    // Always update activity timestamp
    allowed.last_activity_at = new Date().toISOString()

    const { error } = await supabase
      .from('funding_opportunities')
      .update(allowed)
      .eq('id', opportunityId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ---- UPDATE NARRATIVE ----
  // Shortcut for the common case: agent drafted/reviewed a narrative
  if (action === 'update_narrative') {
    const { opportunityId, narrativeStatus, narrativeUrl, narrativeContent, note } = body
    if (!opportunityId) return NextResponse.json({ error: 'opportunityId required' }, { status: 400 })

    const updates: Record<string, unknown> = {
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (narrativeStatus) updates.narrative_status = narrativeStatus
    if (narrativeUrl) updates.narrative_url = narrativeUrl
    if (narrativeContent !== undefined) updates.narrative_content = narrativeContent

    const { error } = await supabase
      .from('funding_opportunities')
      .update(updates)
      .eq('id', opportunityId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get pursuit ID for timeline
    const { data: opp } = await supabase
      .from('funding_opportunities')
      .select('pursuit_id, name')
      .eq('id', opportunityId)
      .single()

    if (opp) {
      const statusLabels: Record<string, string> = {
        drafting: 'Narrative draft started',
        review: 'Narrative ready for review',
        qa_review: 'Narrative in QA review',
        ready: 'Narrative approved and ready',
      }
      await supabase.from('funding_pursuit_timeline').insert({
        pursuit_id: opp.pursuit_id,
        event_date: new Date().toISOString().split('T')[0],
        event_title: `${statusLabels[narrativeStatus] || 'Narrative updated'}: ${opp.name}`,
        event_detail: note || (narrativeUrl ? `Document: ${narrativeUrl}` : ''),
        status: narrativeStatus === 'ready' ? 'complete' : 'active',
      })
    }

    return NextResponse.json({ success: true })
  }

  // ---- CREATE ACTION ITEM ----
  if (action === 'create_action') {
    const { pursuitId, opportunityId, ownerType, ownerEmail, ownerName,
      title, description, dueDate, category, preparedMaterials, preparedDocumentUrl } = body

    if (!pursuitId || !title) {
      return NextResponse.json({ error: 'pursuitId and title required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('funding_action_items')
      .insert({
        pursuit_id: pursuitId,
        opportunity_id: opportunityId || null,
        owner_type: ownerType || 'tdi',
        owner_email: ownerEmail || 'hello@teachersdeserveit.com',
        owner_name: ownerName || (ownerType === 'tdi' ? 'Bella' : null),
        title,
        description: description || null,
        status: 'pending',
        due_date: dueDate || null,
        category: category || null,
        prepared_materials: preparedMaterials || null,
        prepared_document_url: preparedDocumentUrl || null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, action: data })
  }

  // ---- UPDATE ACTION ITEM ----
  if (action === 'update_action') {
    const { actionId, status, completedBy, note } = body
    if (!actionId) return NextResponse.json({ error: 'actionId required' }, { status: 400 })

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (status === 'done') {
      updates.completed_at = new Date().toISOString()
      updates.completed_by = completedBy || 'paperclip'
    }

    const { error } = await supabase
      .from('funding_action_items')
      .update(updates)
      .eq('id', actionId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ---- ADD TIMELINE EVENT ----
  if (action === 'add_timeline_event') {
    const { pursuitId, title, detail, eventStatus } = body
    if (!pursuitId || !title) {
      return NextResponse.json({ error: 'pursuitId and title required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('funding_pursuit_timeline')
      .insert({
        pursuit_id: pursuitId,
        event_date: new Date().toISOString().split('T')[0],
        event_title: title,
        event_detail: detail || '',
        status: eventStatus || 'complete',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, event: data })
  }

  // ---- DRAFT EMAIL ----
  if (action === 'draft_email') {
    const { pursuitId, opportunityId, subject, emailBody, toEmail, toName, emailType } = body
    if (!pursuitId || !subject || !emailBody || !toEmail) {
      return NextResponse.json({ error: 'pursuitId, subject, body, toEmail required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('funding_email_log')
      .insert({
        pursuit_id: pursuitId,
        opportunity_id: opportunityId || null,
        subject,
        body: emailBody,
        to_email: toEmail,
        to_name: toName || null,
        status: 'draft',
        sent_by: 'paperclip',
        email_type: emailType || 'custom',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, email: data })
  }

  return NextResponse.json({
    error: 'Unknown action',
    available_actions: [
      'create_opportunity', 'update_opportunity', 'update_narrative',
      'create_action', 'update_action',
      'add_timeline_event', 'draft_email',
    ],
  }, { status: 400 })
}
