import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth()
    if (auth instanceof NextResponse) return auth

    const { id } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pursuit, error: pErr } = await (supabase
      .from('funding_pursuits') as any)
      .select('*')
      .eq('id', id)
      .single()

    if (pErr) throw pErr

    const { data: timeline } = await (supabase
      .from('funding_pursuit_timeline') as any)
      .select('*')
      .eq('pursuit_id', id)
      .order('display_order')

    const { data: touchpoints } = await (supabase
      .from('funding_pursuit_touchpoints_v1') as any)
      .select('*')
      .eq('pursuit_id', id)
      .order('display_order')

    // Fetch opportunities and actions for next-actions computation
    const { data: opportunities } = await supabase
      .from('funding_opportunities')
      .select('*')
      .eq('pursuit_id', id)
      .order('created_at')

    const { data: actionItems } = await supabase
      .from('funding_action_items')
      .select('*')
      .eq('pursuit_id', id)
      .order('due_date', { ascending: true, nullsFirst: false })

    // Fetch pursuit gate for submitter/backup/admin_sponsor info
    const { data: gate } = await supabase
      .from('pursuit_gate')
      .select('*')
      .eq('pursuit_id', id)
      .maybeSingle()

    // Fetch partnership health data if linked
    let partnershipHealth = null
    if (pursuit.partnership_id) {
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('id, slug, contact_name, status, contract_phase, momentum_status, strategy_implementation_pct, retention_intent_score, hub_login_pct, high_engagement_pct, observation_days_total, observation_days_used, virtual_sessions_total, virtual_sessions_used, executive_sessions_total, executive_sessions_used')
        .eq('id', pursuit.partnership_id)
        .maybeSingle()
      partnershipHealth = partnership
    }

    // Fetch allocations for renewal eligibility check
    const { data: allocations } = await supabase
      .from('award_allocations')
      .select('id, line_item_status')
      .eq('pursuit_id', id)

    const allAllocations = allocations || []
    const renewalEligible = allAllocations.length > 0
      && allAllocations.every(a => a.line_item_status === 'delivered' || a.line_item_status === 'invoiced')
      && !!pursuit.partnership_id

    // Fetch linked contracts (Contract 1 & 2 from pursuit_gate)
    let contract1 = null
    let contract2 = null
    let contract2LineItems: any[] = []
    if (gate) {
      if (gate.contract1_quote_id) {
        const { data: q } = await supabase
          .from('quotes')
          .select('id, title, status, contract_type, signed_at')
          .eq('id', gate.contract1_quote_id)
          .maybeSingle()
        contract1 = q
      }
      if (gate.contract2_quote_id) {
        const { data: q } = await supabase
          .from('quotes')
          .select('id, title, status, contract_type, signed_at')
          .eq('id', gate.contract2_quote_id)
          .maybeSingle()
        contract2 = q
        // Fetch line items for Contract 2
        if (q) {
          const { data: pkgs } = await supabase
            .from('quote_packages')
            .select('id, package_name, total_amount, line_items')
            .eq('quote_id', q.id)
            .order('package_index')
          contract2LineItems = pkgs || []
        }
      }
    }

    return NextResponse.json({
      pursuit,
      timeline: timeline || [],
      touchpoints: touchpoints || [],
      gate: gate || null,
      opportunities: opportunities || [],
      actionItems: actionItems || [],
      allocations: allAllocations,
      partnershipHealth,
      renewalEligible,
      contract1,
      contract2,
      contract2LineItems,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
