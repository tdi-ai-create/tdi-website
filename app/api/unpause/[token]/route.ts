import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Find creator by token
    const { data: creator } = await (supabase.from('creators') as any)
      .select('id, lifecycle_state, email')
      .eq('unpause_token', token)
      .maybeSingle()

    if (!creator) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
    }

    if (creator.lifecycle_state !== 'paused') {
      return NextResponse.json({ success: false, already_active: true })
    }

    // Unpause
    await (supabase.from('creators') as any)
      .update({
        lifecycle_state: 'active',
        unpaused_at: new Date().toISOString(),
        unpause_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creator.id)

    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: creator.id,
      event_type: 'mistake_unpause',
      triggered_by: `creator:${creator.email}`,
      triggered_by_type: 'creator',
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
