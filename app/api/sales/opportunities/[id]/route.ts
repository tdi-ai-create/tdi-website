import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { leadStageChanged } from '@/lib/sales-slack'

const ALLOWED_PATCH_FIELDS = new Set([
  'name', 'stage', 'value', 'heat', 'assigned_to_email',
  'source', 'type', 'is_contact_only', 'partnership_status',
  'contact_name', 'contact_title', 'contact_email', 'contact_phone',
  'expected_close_date', 'deletion_reason',
  // Fit scoring fields (old model)
  'fit_district_size', 'fit_turnover_signal', 'fit_pd_investment',
  'fit_budget_timing', 'fit_leadership_stability', 'fit_tdi_alignment',
  'fit_composite_score', 'fit_tier',
  // Four-factor grant qualification scoring (additive)
  'score_fit', 'score_pain', 'score_warmth', 'score_funding',
  'score_total', 'score_tier',
])

const ACTIVITY_TRACKED = ['stage', 'value', 'heat', 'assigned_to_email'] as const

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()

  const { data: opp, error } = await supabase
    .from('sales_opportunities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !opp) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Sales notes live in two tables with different shapes. `opportunity_notes` is
  // written by the portal UI; `sales_opportunity_notes` is written by agents and
  // scripts. Reading only the first hid 477 notes across 123 leads, so read both
  // and merge. Rows from the second table are namespaced `son:` so the delete
  // route can tell them apart, otherwise a delete silently matches nothing.
  const VALID_NOTE_TYPES = new Set(['call', 'email', 'meeting', 'demo', 'update', 'system'])

  const [portalNotes, agentNotes] = await Promise.all([
    supabase
      .from('opportunity_notes')
      .select('*')
      .eq('opportunity_id', id)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('sales_opportunity_notes')
      .select('id, opportunity_id, body, created_by, created_at')
      .eq('opportunity_id', id)
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  if (portalNotes.error) console.error('[opportunities] opportunity_notes read failed:', portalNotes.error.message)
  if (agentNotes.error) console.error('[opportunities] sales_opportunity_notes read failed:', agentNotes.error.message)

  type MergedNote = {
    id: string
    opportunity_id: string
    author_email: string
    note_text: string
    note_type: string
    created_at: string
    source_table: string
  }

  const notes_list: MergedNote[] = []

  for (const n of portalNotes.data ?? []) {
    notes_list.push({
      id: n.id,
      opportunity_id: n.opportunity_id,
      // The panel calls author_email.split('@'), so it must never be null.
      author_email: n.author_email || 'system@teachersdeserveit.com',
      note_text: n.note_text || '',
      note_type: VALID_NOTE_TYPES.has(n.note_type) ? n.note_type : 'update',
      created_at: n.created_at,
      source_table: 'opportunity_notes',
    })
  }

  for (const n of agentNotes.data ?? []) {
    notes_list.push({
      id: `son:${n.id}`,
      opportunity_id: n.opportunity_id,
      author_email: n.created_by || 'system@teachersdeserveit.com',
      note_text: n.body || '',
      // This table has no type column. These are agent and script written
      // records, which is what 'system' means everywhere else in the panel.
      note_type: 'system',
      created_at: n.created_at,
      source_table: 'sales_opportunity_notes',
    })
  }

  // The legacy `notes` text column is a third store, imported before either
  // table existed. It used to be shown only when opportunity_notes was empty,
  // which meant it masked real history on 48 leads. Always surface it as a
  // clearly labelled archive entry instead of as a substitute.
  if (opp.notes && opp.notes.trim().length > 10) {
    notes_list.push({
      id: 'legacy',
      opportunity_id: id,
      author_email: 'system@teachersdeserveit.com',
      note_text: `[Imported record]\n\n${opp.notes}`,
      note_type: 'system',
      created_at: opp.created_at,
      source_table: 'legacy_column',
    })
  }

  notes_list.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Fetch activity — graceful if table doesn't exist yet
  let activity: unknown[] = []
  const { data: activityData, error: activityErr } = await supabase
    .from('opportunity_activity')
    .select('*')
    .eq('opportunity_id', id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (!activityErr) activity = activityData ?? []

  return NextResponse.json({ ...opp, notes_list, activity })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()
  const body = await req.json()
  const { actor_email = 'system@teachersdeserveit.com', ...rawFields } = body

  // Fetch current state for activity diff
  const { data: current, error: fetchErr } = await supabase
    .from('sales_opportunities')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Whitelist fields
  const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of Object.keys(rawFields)) {
    if (ALLOWED_PATCH_FIELDS.has(key)) updateFields[key] = rawFields[key]
  }

  // Auto-set stage_entered_at when stage changes (non-blocking -- column may not exist yet)
  const stageChanged = updateFields.stage && updateFields.stage !== current.stage
  // Don't include stage_entered_at in the main update to avoid column-not-found errors
  // Instead, update it separately after the main patch succeeds

  // Auto-compute fit composite score and tier when any fit factor changes
  const fitFields = ['fit_district_size', 'fit_turnover_signal', 'fit_pd_investment', 'fit_budget_timing', 'fit_leadership_stability', 'fit_tdi_alignment']
  const hasFitChange = fitFields.some(f => f in updateFields)
  if (hasFitChange) {
    // Merge current values with updates to compute composite
    const merged = { ...current, ...updateFields }
    const factors = fitFields.map(f => (merged[f] as number) || 0)
    const composite = factors.reduce((sum, v) => sum + v, 0)
    updateFields.fit_composite_score = composite
    updateFields.fit_tier = composite >= 45 ? 'tier_1' : composite >= 25 ? 'tier_2' : 'tier_3'
  }

  const { data, error } = await supabase
    .from('sales_opportunities')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Set stage_entered_at for pipeline tracking
  if (stageChanged) {
    const { error: stageErr } = await supabase.from('sales_opportunities')
      .update({ stage_entered_at: new Date().toISOString() })
      .eq('id', id)
    if (stageErr) console.error('[opportunities] Failed to set stage_entered_at:', stageErr.message)
  }

  // Slack notification for stage change
  if (stageChanged) {
    try {
      leadStageChanged(
        current.contact_name || current.name || 'Unknown',
        current.contact_organization || '',
        String(current.stage || 'unknown'),
        String(updateFields.stage)
      ).catch(() => {})
    } catch { /* non-blocking */ }
  }

  // Log activity for tracked field changes
  for (const field of ACTIVITY_TRACKED) {
    if (rawFields[field] !== undefined && rawFields[field] !== current[field as keyof typeof current]) {
      const { error: actErr } = await supabase.from('opportunity_activity').insert({
        opportunity_id: id,
        actor_email,
        activity_type: `${field}_changed`,
        old_value: String(current[field as keyof typeof current] ?? ''),
        new_value: String(rawFields[field]),
        description: `${field.replace('_', ' ')} changed from "${current[field as keyof typeof current]}" to "${rawFields[field]}"`,
      })
      if (actErr) console.error(`[opportunities] Failed to log ${field} change:`, actErr.message)
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()
  const body = await req.json().catch(() => ({}))
  const { reason = '', deleted_by_email = 'system@teachersdeserveit.com' } = body

  const { data: opp } = await supabase
    .from('sales_opportunities')
    .select('*')
    .eq('id', id)
    .single()

  if (!opp) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Gather archive data
  const { data: notesArchive } = await supabase
    .from('opportunity_notes')
    .select('*')
    .eq('opportunity_id', id)
  const { data: activityArchive } = await supabase
    .from('opportunity_activity')
    .select('*')
    .eq('opportunity_id', id)

  // Archive to deleted_opportunities before hard delete
  const { error: archiveErr } = await supabase.from('deleted_opportunities').insert({
    original_id: id,
    deleted_by_email,
    full_record: opp,
    notes_archive: notesArchive ?? [],
    activity_archive: activityArchive ?? [],
    reason,
  })
  if (archiveErr) {
    console.error('[opportunities] Failed to archive before delete:', archiveErr.message)
    return NextResponse.json({ error: 'Failed to archive opportunity before deletion' }, { status: 500 })
  }

  const { error } = await supabase
    .from('sales_opportunities')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
