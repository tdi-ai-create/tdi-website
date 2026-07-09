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
    'gate_open',
  ]
  for (const f of allowed) {
    if (body[f] !== undefined) fields[f] = body[f]
  }

  // Check if a gate row exists for this pursuit
  const { data: existing } = await supabase
    .from('pursuit_gate')
    .select('id')
    .eq('pursuit_id', pursuitId)
    .maybeSingle()

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
