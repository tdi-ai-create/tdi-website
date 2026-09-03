import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { PHASE_IDS, isPhaseId } from '@/lib/funding-phases'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// GET -- every phase note for a pursuit, keyed by phase
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { data, error } = await db()
    .from('funding_pursuit_phases')
    .select('*')
    .eq('pursuit_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ phases: data || [] })
}

// PATCH -- record what is happening in one phase
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await request.json()

  // A phase id that is not one of the nine would create a row nothing renders,
  // which is the silent no-op this codebase keeps producing. Refuse it loudly.
  if (!isPhaseId(body.phaseId)) {
    return NextResponse.json(
      { error: `Unknown phase. Expected one of: ${PHASE_IDS.join(', ')}` },
      { status: 400 },
    )
  }

  const actor = auth.member?.email || auth.user?.email || null

  const row: Record<string, unknown> = {
    pursuit_id: id,
    phase_id: body.phaseId,
    updated_by: actor,
    updated_at: new Date().toISOString(),
  }
  if (body.applicable !== undefined) row.applicable = !!body.applicable
  if (body.detail !== undefined) row.detail = body.detail || null
  if (body.nextStep !== undefined) row.next_step = body.nextStep || null

  const { data, error } = await db()
    .from('funding_pursuit_phases')
    .upsert(row, { onConflict: 'pursuit_id,phase_id' })
    .select()
    .single()

  // The note is the thing the person came here to write. Losing it silently is
  // the failure this check exists to stop.
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ phase: data })
}
