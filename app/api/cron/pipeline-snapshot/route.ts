import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const STAGE_PROBABILITY: Record<string, number> = {
  targeting: 5, engaged: 20, qualified: 45,
  likely_yes: 65, proposal_sent: 80, signed: 95, paid: 100,
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceSupabase()

  const { data: opps } = await supabase
    .from('sales_opportunities')
    .select('stage, value, probability, source, assigned_to_email')
    .is('deleted_at', null)

  if (!opps) {
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }

  const active = opps.filter(o => !['lost', 'paid', 'cancelled'].includes(o.stage))

  const totalPipeline = active.reduce((s, o) => s + (o.value || 0), 0)
  const factored = active.reduce((s, o) => s + (o.value || 0) * (STAGE_PROBABILITY[o.stage] || 0) / 100, 0)
  const activeCount = active.length

  // By stage
  const byStage: Record<string, { count: number; value: number }> = {}
  active.forEach(o => {
    if (!byStage[o.stage]) byStage[o.stage] = { count: 0, value: 0 }
    byStage[o.stage].count++
    byStage[o.stage].value += o.value || 0
  })

  // By source
  const bySource: Record<string, { count: number; value: number }> = {}
  active.forEach(o => {
    const src = o.source || 'Unknown'
    if (!bySource[src]) bySource[src] = { count: 0, value: 0 }
    bySource[src].count++
    bySource[src].value += o.value || 0
  })

  // By owner
  const byOwner: Record<string, { count: number; value: number }> = {}
  active.forEach(o => {
    const owner = o.assigned_to_email || 'unassigned'
    if (!byOwner[owner]) byOwner[owner] = { count: 0, value: 0 }
    byOwner[owner].count++
    byOwner[owner].value += o.value || 0
  })

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('sales_pipeline_snapshots').insert({
    snapshot_date: today,
    total_pipeline: Math.round(totalPipeline),
    factored_pipeline: Math.round(factored),
    active_count: activeCount,
    by_stage: byStage,
    by_source: bySource,
    by_owner: byOwner,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    snapshot_date: today,
    total_pipeline: Math.round(totalPipeline),
    factored_pipeline: Math.round(factored),
    active_count: activeCount,
  })
}
