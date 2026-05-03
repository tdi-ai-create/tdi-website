import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: opps, error } = await (supabase
      .from('sales_opportunities') as any)
      .select('*')

    if (error) throw error

    const allOpps = opps || []
    const active = allOpps.filter((o: any) => !['lost', 'paid'].includes(o.stage))
    const won = allOpps.filter((o: any) => o.stage === 'paid')
    const lost = allOpps.filter((o: any) => o.stage === 'lost')

    // === ALERTS ===
    const alerts: any[] = []

    const invoicesOwed = allOpps.filter((o: any) => o.needs_invoice)
    if (invoicesOwed.length > 0) {
      const totalKnown = invoicesOwed.reduce((s: number, o: any) => s + (o.invoice_amount || 0), 0)
      const tbdCount = invoicesOwed.filter((o: any) => !o.invoice_amount).length
      alerts.push({
        type: 'invoices',
        severity: 'warning',
        title: `${invoicesOwed.length} invoices owed`,
        detail: totalKnown > 0
          ? `$${totalKnown.toLocaleString('en-US', { minimumFractionDigits: 2 })} confirmed${tbdCount > 0 ? ` + ${tbdCount} TBD` : ''}`
          : `${tbdCount} amounts TBD`,
      })
    }

    const activeRenewals = allOpps.filter((o: any) =>
      o.type === 'renewal' && ['qualified', 'likely_yes', 'proposal_sent', 'signed'].includes(o.stage)
    )
    if (activeRenewals.length > 0) {
      alerts.push({
        type: 'renewals',
        severity: 'info',
        title: 'Renewal Season Active',
        detail: `${activeRenewals.length} schools in active renewal conversations`,
      })
    }

    const contactChanges = allOpps.filter((o: any) => o.relationship_signal === 'contact_changed')
    contactChanges.forEach((opp: any) => {
      alerts.push({
        type: 'contact_change',
        severity: 'critical',
        title: `${opp.name}: contact change`,
        detail: extractResignationContext(opp.notes),
        opportunity_id: opp.id,
      })
    })

    // === METRICS ===
    const metrics = {
      invoicesOwed: invoicesOwed.length,
      activeContracts: allOpps.filter((o: any) => ['signed', 'paid'].includes(o.stage)).length,
      activeRenewals: activeRenewals.length,
      criticalAccounts: allOpps.filter((o: any) =>
        o.relationship_signal === 'contact_changed'
        || (o.needs_invoice && !o.invoice_amount)
      ).length,
      meetingsLocked: allOpps.filter((o: any) => o.relationship_signal === 'meeting_scheduled').length,
    }

    // === REVENUE PIPELINE ===
    const currentYear25_26 = allOpps.filter((o: any) =>
      o.contract_year === '2025-26' && ['signed', 'paid'].includes(o.stage)
    )
    const outstanding25_26 = allOpps.filter((o: any) =>
      o.needs_invoice && o.contract_year === '2025-26'
    )
    const renewal26_27 = allOpps.filter((o: any) =>
      o.type === 'renewal'
      && ['qualified', 'likely_yes', 'proposal_sent', 'signed'].includes(o.stage)
    )

    const revenue = {
      currentYearContracted: currentYear25_26.reduce((s: number, o: any) => s + (o.value || 0), 0),
      currentYearOutstanding: outstanding25_26.reduce((s: number, o: any) => s + (o.invoice_amount || 0), 0),
      outstandingCount: outstanding25_26.length,
      outstandingTBDCount: outstanding25_26.filter((o: any) => !o.invoice_amount).length,
      renewal26_27Pipeline: renewal26_27.reduce((s: number, o: any) => s + (o.value || 0), 0),
      renewal26_27Factored: renewal26_27.reduce((s: number, o: any) =>
        s + (o.value || 0) * (o.probability || 0) / 100, 0),
      renewal26_27Count: renewal26_27.length,
    }

    // === INVOICES TAB ===
    const invoicesData = invoicesOwed.map((o: any) => ({
      id: o.id,
      district: o.name,
      contact: extractContactName(o.notes),
      amount: o.invoice_amount,
      contract_year: o.contract_year,
      notes: o.invoice_notes || o.notes,
      needs_action: !o.invoice_amount || o.relationship_signal === 'contact_changed',
      blocked_reason: o.relationship_signal === 'contact_changed'
        ? 'Contact changed - need new contact before sending'
        : !o.invoice_amount
        ? 'Amount needs calculation'
        : null,
    }))

    // === RENEWALS TAB ===
    const renewalsData = activeRenewals.map((o: any) => ({
      id: o.id,
      name: o.name,
      stage: o.stage,
      probability: o.probability || 0,
      value: o.value || 0,
      factored: (o.value || 0) * (o.probability || 0) / 100,
      heat: o.heat || 'warm',
      expected_close: o.expected_close_date,
      next_step: extractNextStep(o.notes),
      assigned_to: o.assigned_to_email,
      relationship_signal: o.relationship_signal,
    })).sort((a: any, b: any) => b.factored - a.factored)

    // === DISTRICTS TAB ===
    // Group opps by name prefix (district name is usually first part before " - ")
    const districtMap = new Map<string, any[]>()
    allOpps.forEach((o: any) => {
      const districtName = o.name.split(/ [-·] /)[0].trim()
      if (!districtMap.has(districtName)) districtMap.set(districtName, [])
      districtMap.get(districtName)!.push(o)
    })

    const districtsData = Array.from(districtMap.entries())
      .map(([name, opps]) => {
        const activeOpps = opps.filter((o: any) => !['lost', 'paid'].includes(o.stage))
        const totalValue = activeOpps.reduce((s: number, o: any) => s + (o.value || 0), 0)
        const lastActivity = Math.max(
          ...opps.map((o: any) => o.last_activity_at ? new Date(o.last_activity_at).getTime() : 0)
        )
        const hasSignals = opps.some((o: any) => o.relationship_signal === 'contact_changed')
        const daysSinceContact = lastActivity > 0
          ? Math.floor((Date.now() - lastActivity) / 86400000)
          : null

        return {
          name,
          activeCount: activeOpps.length,
          totalValue,
          daysSinceContact,
          status: hasSignals ? 'attention_needed'
            : activeOpps.length > 0 ? 'active' : 'inactive',
          source: opps[0]?.source,
          type: opps[0]?.type,
        }
      })
      .filter(d => d.activeCount > 0)
      .sort((a, b) => b.totalValue - a.totalValue)

    return NextResponse.json({
      alerts,
      metrics,
      revenue,
      invoicesData,
      renewalsData,
      districtsData,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function extractContactName(notes: string | null): string | null {
  if (!notes) return null
  const match = notes.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/)
  return match?.[1] || null
}

function extractNextStep(notes: string | null): string | null {
  if (!notes) return null
  const meetingMatch = notes.match(/meeting (?:LOCKED|locked|scheduled)[^.]*?(\d+\/\d+(?:\s*(?:at\s*)?\d+(?::\d+)?(?:am|pm)?)?)/i)
  if (meetingMatch) return `Meeting ${meetingMatch[1]}`
  const closeMatch = notes.match(/HARD CLOSE[^.]*?(\d+\/\d+)/i)
  if (closeMatch) return `Hard close ${closeMatch[1]}`
  return null
}

function extractResignationContext(notes: string | null): string {
  if (!notes) return 'Contact change detected'
  const resignMatch = notes.match(/([A-Z][a-z]+ [A-Z][a-z]+)\s+(?:has\s+)?resigned/i)
  if (resignMatch) return `${resignMatch[1]} has resigned - need new contact`
  if (notes.toLowerCase().includes('no longer')) return 'Contact no longer in role'
  return 'Contact change in notes'
}
