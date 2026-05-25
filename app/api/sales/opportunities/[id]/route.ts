import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const ALLOWED_PATCH_FIELDS = new Set([
  'name', 'stage', 'value', 'heat', 'assigned_to_email',
  'source', 'type', 'is_contact_only',
  'contact_name', 'contact_title', 'contact_email', 'contact_phone',
  'expected_close_date',
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

  // Fetch notes — graceful if table doesn't exist yet
  let notes_list: unknown[] = []
  const { data: notesData, error: notesErr } = await supabase
    .from('opportunity_notes')
    .select('*')
    .eq('opportunity_id', id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (!notesErr) notes_list = notesData ?? []

  // Backfill legacy notes field as a synthetic entry when table is empty
  if (notes_list.length === 0 && opp.notes && opp.notes.length > 10) {
    notes_list = [{
      id: 'legacy',
      opportunity_id: id,
      author_email: 'system@teachersdeserveit.com',
      note_text: opp.notes,
      note_type: 'system',
      created_at: opp.created_at,
    }]
  }

  // Fetch activity — graceful if table doesn't exist yet
  let activity: unknown[] = []
  const { data: activityData, error: activityErr } = await supabase
    .from('opportunity_activity')
    .select('*')
    .eq('opportunity_id', id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (!activityErr) activity = activityData ?? []

  // Fetch email log — graceful if table doesn't exist yet
  let emails: unknown[] = []
  const { data: emailData, error: emailErr } = await supabase
    .from('email_log')
    .select('id, gmail_message_id, gmail_thread_id, from_email, to_emails, subject, date, snippet, direction, matched_on')
    .eq('opportunity_id', id)
    .order('date', { ascending: false })
    .limit(50)
  if (!emailErr) emails = emailData ?? []

  return NextResponse.json({ ...opp, notes_list, activity, emails })
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

  const { data, error } = await supabase
    .from('sales_opportunities')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity for tracked field changes
  for (const field of ACTIVITY_TRACKED) {
    if (rawFields[field] !== undefined && rawFields[field] !== current[field as keyof typeof current]) {
      await supabase.from('opportunity_activity').insert({
        opportunity_id: id,
        actor_email,
        activity_type: `${field}_changed`,
        old_value: String(current[field as keyof typeof current] ?? ''),
        new_value: String(rawFields[field]),
        description: `${field.replace('_', ' ')} changed from "${current[field as keyof typeof current]}" to "${rawFields[field]}"`,
      }).then(() => {})
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
  await supabase.from('deleted_opportunities').insert({
    original_id: id,
    deleted_by_email,
    full_record: opp,
    notes_archive: notesArchive ?? [],
    activity_archive: activityArchive ?? [],
    reason,
  }).then(() => {})

  const { error } = await supabase
    .from('sales_opportunities')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
