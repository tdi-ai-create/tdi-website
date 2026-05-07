import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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
  notes: { type: 'text' },
  expected_close_date: { type: 'date' },
  last_activity_at: { type: 'date' },
  needs_invoice: { type: 'boolean' },
  invoice_amount: { type: 'number' },
  contract_year: { type: 'text' },
  type: { type: 'enum', values: ['new_business', 'renewal', 'upsell', 'reactivation', 'expansion', 'pilot'] },
  assigned_to_email: { type: 'text' },
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
    if (fieldDef.type === 'enum' && fieldDef.values && new_value !== null) {
      if (!fieldDef.values.includes(new_value)) {
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

    const { error: updateError } = await (supabase.from('sales_opportunities') as any)
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
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
