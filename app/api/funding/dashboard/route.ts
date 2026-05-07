import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pursuits, error } = await (supabase
      .from('funding_pursuits') as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const all = pursuits || []

    const oliviaActions = all.filter((p: any) =>
      p.next_action_owner_email === 'olivia@teachersdeserveit.com' ||
      p.next_action_owner_email === 'rae@teachersdeserveit.com'
    ).length

    const stalled = all.filter((p: any) => p.is_stalled).length

    const awarded = all.filter((p: any) => p.current_phase === 'awarded')
    const awardedTotal = awarded.reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0)

    const inFlight = all.filter((p: any) =>
      !['awarded', 'denied', 'on_hold'].includes(p.current_phase)
    )
    const inFlightTotal = inFlight.reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0)

    const phaseCounts: Record<string, number> = { all: all.length }
    const phases = ['intake', 'researching', 'strategy', 'writing', 'in_review', 'delivered', 'submitted', 'awaiting_decision', 'awarded']
    phases.forEach(p => {
      phaseCounts[p] = all.filter((x: any) => x.current_phase === p).length
    })

    return NextResponse.json({
      pursuits: all,
      alerts: {
        olivia_actions: oliviaActions,
        stalled,
        awarded_count: awarded.length,
        awarded_total: awardedTotal,
        in_flight_count: inFlight.length,
        in_flight_total: inFlightTotal,
      },
      phase_counts: phaseCounts,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
