import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { asFollowupKind } from '@/lib/sales/followup'
import { SALES_TEAM, teamLabel } from '@/lib/sales/team'
import { followUpSet, followUpCleared } from '@/lib/sales-slack'

/**
 * The follow-up alert on one lead.
 *
 * A dedicated route rather than three more keys on PATCH, because setting an
 * alert is one action with one record of it. Routing it through PATCH would
 * have written a note for the text, a note for the owner and a note for the
 * date every time somebody changed all three, which is how a note history
 * becomes unreadable.
 *
 * POST sets or replaces the alert. DELETE clears it. Both write a note, because
 * the alert is overwritten in place and the note history is the only thing that
 * remembers what was owed before.
 */

const SYSTEM = 'system@teachersdeserveit.com'

/**
 * Who is doing this, from the session cookie rather than from the request body.
 *
 * The client could tell us who it is and we would have no way to check, and an
 * alert that records the wrong person is worse than one that records nobody.
 */
async function actor(): Promise<string> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.email ?? SYSTEM
  } catch {
    return SYSTEM
  }
}

interface Body {
  text?: unknown
  kind?: unknown
  owner?: unknown
  due?: unknown
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()
  const body = (await req.json().catch(() => ({}))) as Body

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  if (!text) {
    return NextResponse.json(
      { error: 'A follow-up needs to say what has to happen.' },
      { status: 400 }
    )
  }

  const kind = asFollowupKind(body.kind) ?? 'call'

  // An owner has to be somebody on the roster. A free-text owner is how
  // assigned_to_email ended up holding "blRAscdKSZLQMumakHZY" on 79 leads.
  const rawOwner = typeof body.owner === 'string' ? body.owner.toLowerCase().trim() : ''
  if (rawOwner && !SALES_TEAM.some(m => m.email === rawOwner)) {
    return NextResponse.json({ error: `Not a known team member: ${rawOwner}` }, { status: 400 })
  }
  const owner = rawOwner || null

  // Dates arrive as YYYY-MM-DD from a date input. Anything else is rejected
  // rather than coerced, because a silently dropped date reads as "no deadline"
  // and nothing on the board would show that it was ever set.
  const rawDue = typeof body.due === 'string' ? body.due.trim() : ''
  if (rawDue && !/^\d{4}-\d{2}-\d{2}$/.test(rawDue)) {
    return NextResponse.json({ error: `Not a date: ${rawDue}` }, { status: 400 })
  }
  const due = rawDue || null

  const { data: current, error: fetchErr } = await supabase
    .from('sales_opportunities')
    .select('id, name, contact_name, followup_text, followup_kind, followup_owner, followup_due')
    .eq('id', id)
    .single()

  if (fetchErr || !current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const setBy = await actor()
  const setAt = new Date().toISOString()

  const { data, error } = await supabase
    .from('sales_opportunities')
    .update({
      followup_text: text,
      followup_kind: kind,
      followup_owner: owner,
      followup_due: due,
      followup_set_by: setBy,
      followup_set_at: setAt,
      updated_at: setAt,
    })
    .eq('id', id)
    .select('followup_text, followup_kind, followup_owner, followup_due, followup_set_by, followup_set_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Documented in notes. The alert gets overwritten; this does not.
  const replaced = current.followup_text
    ? `\nReplaces: "${current.followup_text}"${current.followup_owner ? ` (${teamLabel(current.followup_owner)})` : ''}`
    : ''
  const noteText =
    `FOLLOW UP SET. ${kind.toUpperCase()}: ${text}\n` +
    `Owner: ${owner ? teamLabel(owner) : 'nobody yet'}. ` +
    `Due: ${due ?? 'no date'}. ` +
    `Set by ${teamLabel(setBy)}.${replaced}`

  const { error: noteErr } = await supabase.from('opportunity_notes').insert({
    opportunity_id: id,
    author_email: setBy,
    note_text: noteText,
    note_type: 'update',
  })
  // Reported, not swallowed. If the note failed the alert still saved, and the
  // caller needs to know the record half did not happen.
  if (noteErr) console.error('[followup] note insert failed:', noteErr.message)

  const { error: actErr } = await supabase.from('opportunity_activity').insert({
    opportunity_id: id,
    actor_email: setBy,
    activity_type: 'followup_set',
    old_value: current.followup_text ?? '',
    new_value: text,
    description: `Follow-up (${kind}) assigned to ${owner ? teamLabel(owner) : 'nobody'}${due ? `, due ${due}` : ''}`,
  })
  if (actErr) console.error('[followup] activity insert failed:', actErr.message)

  // Slack, to the sales channel. Rae chose a channel post over a DM so the
  // whole team sees assignments as they happen.
  followUpSet({
    lead: current.name ?? 'Unnamed lead',
    contact: current.contact_name ?? null,
    kind,
    text,
    ownerLabel: owner ? teamLabel(owner) : null,
    due,
    setByLabel: teamLabel(setBy),
  }).catch(() => {})

  return NextResponse.json({ ...data, noteWritten: !noteErr })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()

  const { data: current, error: fetchErr } = await supabase
    .from('sales_opportunities')
    .select('id, name, contact_name, followup_text, followup_kind, followup_owner, followup_due')
    .eq('id', id)
    .single()

  if (fetchErr || !current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!current.followup_text) {
    // Nothing to clear. Not an error, but it must not write a note saying a
    // follow-up was completed when there was never one there.
    return NextResponse.json({ cleared: false })
  }

  const by = await actor()
  const at = new Date().toISOString()

  const { error } = await supabase
    .from('sales_opportunities')
    .update({
      followup_text: null,
      followup_kind: null,
      followup_owner: null,
      followup_due: null,
      followup_set_by: null,
      followup_set_at: null,
      updated_at: at,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const noteText =
    `FOLLOW UP DONE. ${(current.followup_kind ?? 'follow up').toUpperCase()}: ${current.followup_text}\n` +
    `Was owned by ${current.followup_owner ? teamLabel(current.followup_owner) : 'nobody'}` +
    `${current.followup_due ? `, due ${current.followup_due}` : ''}. Cleared by ${teamLabel(by)}.`

  const { error: noteErr } = await supabase.from('opportunity_notes').insert({
    opportunity_id: id,
    author_email: by,
    note_text: noteText,
    note_type: 'update',
  })
  if (noteErr) console.error('[followup] clear note insert failed:', noteErr.message)

  const { error: actErr } = await supabase.from('opportunity_activity').insert({
    opportunity_id: id,
    actor_email: by,
    activity_type: 'followup_cleared',
    old_value: current.followup_text,
    new_value: '',
    description: `Follow-up cleared by ${teamLabel(by)}`,
  })
  if (actErr) console.error('[followup] clear activity insert failed:', actErr.message)

  followUpCleared({
    lead: current.name ?? 'Unnamed lead',
    text: current.followup_text,
    byLabel: teamLabel(by),
  }).catch(() => {})

  return NextResponse.json({ cleared: true, noteWritten: !noteErr })
}
