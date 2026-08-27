import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { placeCreator } from '@/lib/creator-placement';
import { creatorFlag } from '@/lib/creator-flags';
import { placeCreatorProjects } from '@/lib/creator-step-engine';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params
    const { adminEmail } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { error } = await (supabase.from('creators') as any)
      .update({
        lifecycle_state: 'active',
        unpaused_at: new Date().toISOString(),
        unpause_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })


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
      ? await placeCreatorProjects(supabase, id, { startClock: true })
      : await placeCreator(supabase, id)
    if (!placement.ok) {
      const why = 'errors' in placement ? placement.errors.join('; ') : placement.error
      console.error('[unpause] Placement failed, creator is active but their board was not reset:', why)
    }
    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: id,
      event_type: 'unpaused',
      triggered_by: `admin:${adminEmail || 'unknown'}`,
      triggered_by_type: 'admin',
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
