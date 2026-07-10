import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Compute gate_open from the 5 conditions. Never set manually.
 * TRUE only when ALL are met:
 *   1. submitter_name + submitter_email present
 *   2. backup_name + backup_email present
 *   3. admin_sponsor_name + admin_sponsor_email present
 *   4. contract1_signed = true
 *   5. contract2_signed = true
 */
function computeGateOpen(gate: Record<string, unknown>): boolean {
  return !!(
    gate.submitter_name && gate.submitter_email &&
    gate.backup_name && gate.backup_email &&
    gate.admin_sponsor_name && gate.admin_sponsor_email &&
    gate.contract1_signed === true &&
    gate.contract2_signed === true
  )
}

// PUT — create or update pursuit_gate for this pursuit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id: pursuitId } = await params
  const body = await request.json()
  const supabase = db()

  const fields: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  const allowed = [
    'submitter_name', 'submitter_email',
    'backup_name', 'backup_email',
    'admin_sponsor_name', 'admin_sponsor_email',
    'contract1_signed', 'contract2_signed',
  ]
  for (const f of allowed) {
    if (body[f] !== undefined) fields[f] = body[f]
  }

  // Check if a gate row exists for this pursuit
  const { data: existing } = await supabase
    .from('pursuit_gate')
    .select('*')
    .eq('pursuit_id', pursuitId)
    .maybeSingle()

  // Merge with existing data to compute gate_open from the full picture
  const merged = { ...(existing || {}), ...fields }
  const wasOpen = existing?.gate_open === true
  const nowOpen = computeGateOpen(merged)

  fields.gate_open = nowOpen
  if (nowOpen && !wasOpen) {
    fields.gate_opened_at = new Date().toISOString()
  }

  let result
  if (existing) {
    result = await supabase
      .from('pursuit_gate')
      .update(fields)
      .eq('pursuit_id', pursuitId)
      .select()
      .single()
  } else {
    result = await supabase
      .from('pursuit_gate')
      .insert({ ...fields, pursuit_id: pursuitId })
      .select()
      .single()
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  return NextResponse.json({ success: true, gate: result.data })
}
