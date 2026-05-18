import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { reason, adminEmail } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const unpauseToken = randomBytes(24).toString('hex')

    const { error } = await (supabase.from('creators') as any)
      .update({
        lifecycle_state: 'paused',
        paused_at: new Date().toISOString(),
        paused_by: `admin:${adminEmail || 'unknown'}`,
        pause_reason: reason || null,
        pause_type: 'pause_mid_project',
        unpause_token: unpauseToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: id,
      event_type: 'paused',
      triggered_by: `admin:${adminEmail || 'unknown'}`,
      triggered_by_type: 'admin',
      reason: reason || null,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
