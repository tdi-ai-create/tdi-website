import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { placeCreator } from '@/lib/creator-placement';
import { creatorFlag } from '@/lib/creator-flags';
import { placeCreatorProjects } from '@/lib/creator-step-engine';

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

    // Unpause. The error here used to be discarded, so a failed write returned
    // success and the creator was told they were back when they were not.
    const { error: unpauseError } = await (supabase.from('creators') as any)
      .update({
        lifecycle_state: 'active',
        unpaused_at: new Date().toISOString(),
        unpause_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creator.id)

    if (unpauseError) {
      return NextResponse.json({ error: unpauseError.message }, { status: 500 })
    }

    // Put them back on one step. Without this a returning creator arrives to
    // the board everyone else had before 19 August: every step open at once,
    // no dates, no order. Holly Stuart came back that way and filled nine of
    // the twelve slots in the next morning's waiting on TDI message.
    // Each project placed on its own. The old placeCreator read every row a
    // creator owned across all projects and locked all but one, which
    // collapsed a two-project creator onto a single open step.
    //
    // The clock starts here because they are coming back. That is the one
    // moment a returning creator should get a date, and it runs from today
    // rather than from whenever they left.
    const useEngine = await creatorFlag(supabase, 'step_engine')
    const placement = useEngine
      ? await placeCreatorProjects(supabase, creator.id, { startClock: true })
      : await placeCreator(supabase, creator.id)
    if (!placement.ok) {
      const why = 'errors' in placement ? placement.errors.join('; ') : placement.error
      console.error('[unpause] Placement failed, creator is active but their board was not reset:', why)
    }

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
