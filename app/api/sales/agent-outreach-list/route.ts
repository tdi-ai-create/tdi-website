import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * Agent-facing API: returns leads needing outreach, split by owner.
 *
 * GET /api/sales/agent-outreach-list
 *
 * Returns two lists:
 * - olivia: Targeting stage leads needing hello@ follow-up (volume)
 * - elena: Engaged+ stage leads needing rae@ personal touch (strategic)
 *
 * Each lead includes: name, contact info, stage, days since last activity,
 * suggested action, and recent notes for context.
 */

export async function GET(req: NextRequest) {
  const supabase = getServiceSupabase()

  const { data: opps, error } = await supabase
    .from('sales_opportunities')
    .select('*')
    .is('deleted_at', null)
    .not('stage', 'in', '("lost","paid")')
    .order('last_activity_at', { ascending: true, nullsFirst: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const now = Date.now()

  const enriched = (opps || []).map(o => {
    const daysSince = o.last_activity_at
      ? Math.floor((now - new Date(o.last_activity_at).getTime()) / 86400000)
      : 999

    let suggestedAction = ''
    if (!o.last_activity_at || daysSince >= 30) {
      suggestedAction = daysSince >= 30 ? 'Breakup email -- 30+ days cold' : 'Initial outreach -- never contacted'
    } else if (daysSince >= 10) {
      suggestedAction = 'Personal follow-up from Rae -- 10+ days no response'
    } else if (daysSince >= 5) {
      suggestedAction = 'Team follow-up -- 5 days since last contact'
    } else {
      suggestedAction = 'Recently contacted -- no action needed'
    }

    return {
      id: o.id,
      name: o.name,
      stage: o.stage,
      value: o.value,
      contact_name: o.contact_name,
      contact_email: o.contact_email,
      contact_phone: o.contact_phone,
      state: o.state,
      city: o.city,
      source: o.source,
      notes: o.notes,
      last_activity_at: o.last_activity_at,
      days_since_activity: daysSince,
      suggested_action: suggestedAction,
      heat: o.heat,
      lead_score: o.lead_score,
      enrichment_data: o.enrichment_data ? {
        strategic_brief: o.ai_strategic_brief,
      } : null,
    }
  })

  // OLIVIA: Targeting stage, has email, needs follow-up (5+ days or never contacted)
  const olivia = enriched.filter(o =>
    o.stage === 'targeting' &&
    o.contact_email &&
    (o.days_since_activity >= 5 || o.days_since_activity === 999)
  ).slice(0, 30)

  // ELENA: Engaged+ stages, has email, needs personal touch (10+ days)
  const elena = enriched.filter(o =>
    ['engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed'].includes(o.stage) &&
    o.contact_email &&
    o.days_since_activity >= 3
  ).slice(0, 20)

  // Summary stats
  const totalActive = enriched.length
  const needsOutreach = enriched.filter(o => o.days_since_activity >= 5 && o.contact_email).length
  const neverContacted = enriched.filter(o => o.days_since_activity === 999 && o.contact_email).length

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    summary: {
      total_active_leads: totalActive,
      needs_outreach: needsOutreach,
      never_contacted: neverContacted,
      olivia_queue: olivia.length,
      elena_queue: elena.length,
    },
    olivia_outreach: olivia,
    elena_outreach: elena,
  })
}
