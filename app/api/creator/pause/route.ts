import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { creatorId, email, reason } = await request.json()
    if (!creatorId || !email) {
      return NextResponse.json({ error: 'Missing creatorId or email' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if creator has in-progress milestones
    const { data: milestones } = await (supabase
      .from('creator_milestones') as any)
      .select('status')
      .eq('creator_id', creatorId)
      .not('status', 'in', '("completed","locked")')

    const pauseType = (milestones && milestones.length > 0) ? 'pause_mid_project' : 'pause_between_projects'
    const unpauseToken = randomBytes(24).toString('hex')

    // Update creator
    const { error: updateError } = await (supabase.from('creators') as any)
      .update({
        lifecycle_state: 'paused',
        paused_at: new Date().toISOString(),
        paused_by: `creator:${email}`,
        pause_reason: reason || null,
        pause_type: pauseType,
        unpause_token: unpauseToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log to history
    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: creatorId,
      event_type: 'paused',
      triggered_by: `creator:${email}`,
      triggered_by_type: 'creator',
      reason: reason || null,
    })

    return NextResponse.json({ success: true, pauseType, unpauseToken })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
