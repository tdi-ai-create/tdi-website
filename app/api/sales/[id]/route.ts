import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { teamLabel } from '@/lib/sales/team'

/** Who is doing this, from the session rather than from the request body. */
async function actor(): Promise<string> {
  try {
    const sb = await createSupabaseServerClient()
    const { data: { user } } = await sb.auth.getUser()
    return user?.email ?? 'system@teachersdeserveit.com'
  } catch {
    return 'system@teachersdeserveit.com'
  }
}

const EDITABLE_FIELDS: Record<string, { type: 'text' | 'number' | 'enum' | 'boolean' | 'date'; values?: string[] }> = {
  value: { type: 'number' },
  name: { type: 'text' },
  stage: { type: 'enum', values: ['unassigned', 'targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid', 'lost'] },
  probability: { type: 'number' },
  heat: { type: 'enum', values: ['hot', 'warm', 'cold', 'parked'] },
  source: { type: 'text' },
  school_year: { type: 'text' },
  lead_classification: { type: 'enum', values: ['current_client', 'new_inquiry', 'targeting_area', 'ar_collection'] },
  on_jims_call_sheet: { type: 'boolean' },
  call_owner: { type: 'enum', values: [
    'rae@teachersdeserveit.com',
    'hello@teachersdeserveit.com',
    'kristin@whatwilllast.com',
    'jim@teachersdeserveit.com',
  ] },
  notes: { type: 'text' },
  expected_close_date: { type: 'date' },
  last_activity_at: { type: 'date' },
  needs_invoice: { type: 'boolean' },
  invoice_amount: { type: 'number' },
  contract_year: { type: 'text' },
  type: { type: 'enum', values: ['new_business', 'renewal', 'upsell', 'reactivation', 'expansion', 'pilot'] },
  assigned_to_email: { type: 'text' },
  contact_name: { type: 'text' },
  contact_email: { type: 'text' },
  contact_phone: { type: 'text' },
  city: { type: 'text' },
  state: { type: 'text' },
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { field, new_value } = body

    if (!field || new_value === undefined) {
      return NextResponse.json({ error: 'Missing field or new_value' }, { status: 400 })
    }

    const fieldDef = EDITABLE_FIELDS[field]
    if (!fieldDef) {
      return NextResponse.json({ error: `Field "${field}" is not editable` }, { status: 400 })
    }

    // Validate value type
    let coerced: any = new_value
    if (fieldDef.type === 'number') {
      coerced = new_value === null || new_value === '' ? null : Number(new_value)
      if (coerced !== null && isNaN(coerced)) {
        return NextResponse.json({ error: `"${field}" must be a number` }, { status: 400 })
      }
    }
    // An empty string means "clear it". Without this the call owner dropdown's
    // "Nobody" option fails the enum check below and the lead can be put on the
    // call list but never taken off it.
    if (coerced === '') coerced = null

    if (fieldDef.type === 'enum' && fieldDef.values && coerced !== null) {
      if (!fieldDef.values.includes(coerced)) {
        return NextResponse.json({ error: `Invalid value for "${field}". Must be one of: ${fieldDef.values.join(', ')}` }, { status: 400 })
      }
    }
    if (fieldDef.type === 'boolean') {
      coerced = Boolean(new_value)
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current value for audit log
    const { data: current } = await (supabase.from('sales_opportunities') as any)
      .select(field)
      .eq('id', id)
      .single()

    if (!current) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    const oldValue = current[field]

    // Update the field
    const updatePayload: Record<string, any> = {
      [field]: coerced,
      updated_at: new Date().toISOString(),
    }

    // The call list is now "somebody's name is on it". The old boolean is kept
    // in step rather than deleted, because the export, the top bar count and
    // `pipeline-summary` all still read it, and a column rename is a worse
    // trade than one extra assignment here.
    if (field === 'call_owner') {
      updatePayload.on_jims_call_sheet = coerced !== null
    }

    const { error: updateError } = await (supabase.from('sales_opportunities') as any)
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    /**
     * Putting a name on a call, and taking it off, are both written into the
     * notes with the date on them.
     *
     * Rae, 24 September 2026: "any time a client is assigned to a caller, it
     * should be timestamped in notes", and "when a caller is removed, it should
     * also be timestamped". The note row carries created_at, but the date is
     * written into the text as well so it survives an export or a paste into a
     * document, where the column would not come along.
     */
    if (field === 'call_owner' && coerced !== oldValue) {
      const by = await actor()
      const stamp = new Date().toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
      const noteText = coerced
        ? `CALL ASSIGNED TO ${teamLabel(coerced).toUpperCase()}.\n` +
          `Set by ${teamLabel(by)} on ${stamp}.` +
          (oldValue ? `\nReplaces ${teamLabel(oldValue)} on the call.` : '')
        : `CALL UNASSIGNED.\n` +
          `${oldValue ? teamLabel(oldValue) : 'Nobody'} is no longer making this call. ` +
          `Cleared by ${teamLabel(by)} on ${stamp}.`

      const { error: noteErr } = await (supabase.from('opportunity_notes') as any).insert({
        opportunity_id: id,
        author_email: by,
        note_text: noteText,
        note_type: 'update',
      })
      if (noteErr) console.error('[sales] call owner note failed:', noteErr.message)
    }

    // Write audit log
    await (supabase.from('sales_audit_log') as any)
      .insert({
        opportunity_id: id,
        field_name: field,
        old_value: oldValue != null ? String(oldValue) : null,
        new_value: coerced != null ? String(coerced) : null,
        edited_by: 'admin',
      })

    return NextResponse.json({
      success: true,
      field,
      old_value: oldValue,
      new_value: coerced,
      updated_at: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
