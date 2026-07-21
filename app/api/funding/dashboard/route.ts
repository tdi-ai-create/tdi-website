import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

export async function GET() {
  try {
    const auth = await requireAdminAuth()
    if (auth instanceof NextResponse) return auth

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch pursuit summaries (aggregated view)
    const { data: summaries, error: summaryErr } = await supabase
      .from('funding_pursuit_summary')
      .select('*')
      .neq('archived', true)
      .order('created_at', { ascending: false })

    // Fallback to raw pursuits if view doesn't exist yet
    if (summaryErr) {
      const { data: pursuits, error } = await (supabase
        .from('funding_pursuits') as any)
        .select('*')
        .neq('archived', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const all = pursuits || []
      const inFlight = all.filter((p: any) =>
        !['awarded', 'denied', 'on_hold'].includes(p.current_phase)
      )

      return NextResponse.json({
        pursuits: all,
        alerts: {
          action_items_pending: 0,
          waiting_on_client: 0,
          stalled: all.filter((p: any) => p.is_stalled).length,
          overdue_actions: 0,
          awarded_count: all.filter((p: any) => p.current_phase === 'awarded').length,
          awarded_total: all.filter((p: any) => p.current_phase === 'awarded')
            .reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0),
          in_flight_count: inFlight.length,
          in_flight_total: inFlight.reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0),
          total_gap: 0,
          upcoming_deadlines: [],
        },
        phase_counts: buildPhaseCounts(all),
      })
    }

    const all = (summaries || []).filter((p: any) => !p.archived)

    // Compute cross-pursuit alerts
    const totalWaitingOnClient = all.reduce((sum, p) => sum + (p.waiting_on_client_count || 0), 0)
    const totalOverdue = all.reduce((sum, p) => sum + (p.overdue_action_count || 0), 0)
    const totalStale = all.reduce((sum, p) => sum + (p.stale_count || 0), 0)
    const totalGap = all.reduce((sum, p) => sum + (p.remaining_gap || 0), 0)
    const totalAwarded = all.reduce((sum, p) => sum + (p.total_awarded || 0), 0)
    const awardedCount = all.filter(p => p.current_phase === 'awarded').length

    const inFlight = all.filter(p =>
      !['awarded', 'denied', 'on_hold'].includes(p.current_phase)
    )
    const inFlightTotal = inFlight.reduce((sum, p) => sum + (p.total_amount || 0), 0)

    // Upcoming deadlines (next 14 days)
    const today = new Date()
    const twoWeeks = new Date(today)
    twoWeeks.setDate(twoWeeks.getDate() + 14)

    const { data: upcomingOpps } = await supabase
      .from('funding_opportunities')
      .select('id, name, amount, application_closes, pursuit_id, waiting_on, client_submitted')
      .gte('application_closes', today.toISOString().split('T')[0])
      .lte('application_closes', twoWeeks.toISOString().split('T')[0])
      .not('status', 'in', '("awarded","denied")')
      .order('application_closes')

    return NextResponse.json({
      pursuits: all,
      alerts: {
        waiting_on_client: totalWaitingOnClient,
        overdue_actions: totalOverdue,
        stalled: totalStale,
        total_gap: totalGap,
        awarded_count: awardedCount,
        awarded_total: totalAwarded,
        in_flight_count: inFlight.length,
        in_flight_total: inFlightTotal,
        upcoming_deadlines: upcomingOpps || [],
      },
      phase_counts: buildPhaseCounts(all),
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildPhaseCounts(pursuits: any[]): Record<string, number> {
  const counts: Record<string, number> = { all: pursuits.length }
  const phases = [
    'intake', 'researching', 'strategy', 'writing', 'in_review',
    'delivered', 'submitted', 'awaiting_decision', 'awarded',
  ]
  phases.forEach(p => {
    counts[p] = pursuits.filter((x: any) => x.current_phase === p).length
  })
  return counts
}
