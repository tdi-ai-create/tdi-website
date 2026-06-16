import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const STAGE_LABELS: Record<string, string> = {
  unassigned: 'Unassigned',
  targeting: 'Targeting',
  engaged: 'Engaged',
  qualified: 'Qualified',
  likely_yes: 'Likely Yes',
  proposal_sent: 'Quote Sent',
  signed: 'Signed',
  paid: 'Paid',
  lost: 'Lost',
}

const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0, targeting: 5, engaged: 20, qualified: 45,
  likely_yes: 65, proposal_sent: 80, signed: 95, paid: 100, lost: 0,
}

export async function GET() {
  try {
    const supabase = getServiceSupabase()

    const { data: opps } = await supabase
      .from('sales_opportunities')
      .select('*')

    if (!opps?.length) {
      return NextResponse.json({ error: 'No opportunities found' }, { status: 404 })
    }

    const active = opps.filter(o => !['lost', 'paid'].includes(o.stage) && !o.deleted_at)
    const won = opps.filter(o => o.stage === 'paid')
    const lost = opps.filter(o => o.stage === 'lost')
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const wonYTD = won.filter(o => new Date(o.updated_at) >= yearStart)
    const lostYTD = lost.filter(o => new Date(o.updated_at) >= yearStart)

    const totalPipeline = active.reduce((s, o) => s + (o.value || 0), 0)
    const factored = active.reduce((s, o) => s + (o.value || 0) * (STAGE_PROBABILITY[o.stage] || 0) / 100, 0)
    const wonValueYTD = wonYTD.reduce((s, o) => s + (o.value || 0), 0)
    const avgDealSize = active.length ? Math.round(totalPipeline / active.length) : 0

    // Win rate
    const closedDeals = wonYTD.length + lostYTD.length
    const winRate = closedDeals > 0 ? Math.round((wonYTD.length / closedDeals) * 100) : 0

    // Stage breakdown
    const stageGrouped: Record<string, { count: number; value: number }> = {}
    active.forEach(o => {
      const stage = o.stage || 'unassigned'
      if (!stageGrouped[stage]) stageGrouped[stage] = { count: 0, value: 0 }
      stageGrouped[stage].count++
      stageGrouped[stage].value += o.value || 0
    })
    const stageBreakdown = Object.entries(stageGrouped).map(([stage, data]) => ({
      stage: STAGE_LABELS[stage] || stage,
      count: data.count,
      value: data.value,
    }))

    // Top 5 by value
    const topDeals = active
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5)
      .map(o => ({
        name: o.name,
        value: o.value || 0,
        stage: STAGE_LABELS[o.stage] || o.stage,
        tier: o.lead_score ? (o.lead_score >= 70 ? 'T1' : o.lead_score >= 40 ? 'T2' : 'T3') : null,
      }))

    // Source breakdown
    const bySource: Record<string, { count: number; value: number }> = {}
    active.forEach(o => {
      const src = o.source || 'Unknown'
      if (!bySource[src]) bySource[src] = { count: 0, value: 0 }
      bySource[src].count++
      bySource[src].value += o.value || 0
    })

    // Newly added (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    const newLeads = opps.filter(o => new Date(o.created_at) >= thirtyDaysAgo && !o.deleted_at).length

    const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`

    // Build report
    const report = {
      generatedAt: now.toISOString(),
      title: `TDI Sales Pipeline Report -- ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      summary: {
        totalPipeline: fmt(totalPipeline),
        factoredPipeline: fmt(factored),
        activeDeals: active.length,
        avgDealSize: fmt(avgDealSize),
        wonYTD: `${wonYTD.length} deals (${fmt(wonValueYTD)})`,
        winRate: `${winRate}%`,
        newLeads30d: newLeads,
      },
      stageBreakdown,
      topDeals,
      bySource: Object.entries(bySource).map(([source, data]) => ({ source, count: data.count, value: data.value })),
      // Plain text version for copy/paste
      plainText: [
        `TDI SALES PIPELINE REPORT`,
        `${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
        ``,
        `EXECUTIVE SUMMARY`,
        `Total Pipeline: ${fmt(totalPipeline)} (${active.length} active deals)`,
        `Factored Pipeline: ${fmt(factored)}`,
        `Avg Deal Size: ${fmt(avgDealSize)}`,
        `Won YTD: ${wonYTD.length} deals worth ${fmt(wonValueYTD)}`,
        `Win Rate: ${winRate}%`,
        `New Leads (30d): ${newLeads}`,
        ``,
        `STAGE BREAKDOWN`,
        ...stageBreakdown.map(s => `  ${s.stage}: ${s.count} deals (${fmt(s.value)})`),
        ``,
        `TOP OPPORTUNITIES`,
        ...topDeals.map((d, i) => `  ${i + 1}. ${d.name} -- ${fmt(d.value)} (${d.stage})${d.tier ? ` [${d.tier}]` : ''}`),
        ``,
        `LEAD SOURCES`,
        ...Object.entries(bySource)
          .sort((a, b) => b[1].value - a[1].value)
          .map(([src, d]) => `  ${src}: ${d.count} deals (${fmt(d.value)})`),
        ``,
        `---`,
        `Generated by TDI Admin on ${now.toLocaleDateString()}`,
      ].join('\n'),
    }

    return NextResponse.json(report)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
