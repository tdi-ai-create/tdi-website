import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * Pipeline Summary API -- Read-only endpoint for Paperclip agents
 * Returns all active opportunities with scores, enrichment data, and contact info.
 * Sophia uses this to know which leads to draft emails for.
 * Elena uses this to track follow-up status.
 *
 * Secured via CRON_SECRET (same pattern as other internal APIs).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow access from admin portal (cookie auth) or via API key
  if (authHeader !== `Bearer ${cronSecret}` && !req.cookies.get('sb-access-token')) {
    // Also allow if referer is from our domain (admin portal fetch)
    const referer = req.headers.get('referer') || ''
    if (!referer.includes('teachersdeserveit.com') && !referer.includes('localhost')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('sales_opportunities')
    .select('id, name, stage, value, probability, type, heat, source, contact_name, contact_email, contact_phone, city, state, website, lead_score, score_breakdown, enrichment_data, ai_strategic_brief, enrichment_status, fit_composite_score, fit_tier, last_activity_at, assigned_to_email, on_jims_call_sheet, grant_support, needs_invoice, created_at, updated_at')
    .is('deleted_at', null)
    .not('stage', 'eq', 'lost')
    .order('lead_score', { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Compute tier for each opportunity
  const enriched = (data || []).map(opp => ({
    ...opp,
    tier: opp.lead_score ? (opp.lead_score >= 70 ? 'T1' : opp.lead_score >= 40 ? 'T2' : 'T3') : opp.fit_tier ? opp.fit_tier.replace('tier_', 'T') : null,
    days_since_activity: opp.last_activity_at
      ? Math.floor((Date.now() - new Date(opp.last_activity_at).getTime()) / 86400000)
      : null,
  }))

  // Summary stats
  const stats = {
    total_active: enriched.length,
    total_pipeline_value: enriched.reduce((s, o) => s + (o.value || 0), 0),
    tier_1_count: enriched.filter(o => o.tier === 'T1').length,
    tier_2_count: enriched.filter(o => o.tier === 'T2').length,
    tier_3_count: enriched.filter(o => o.tier === 'T3').length,
    unscored_count: enriched.filter(o => !o.tier).length,
    hot_count: enriched.filter(o => o.heat === 'hot').length,
    stale_count: enriched.filter(o => (o.days_since_activity ?? 999) > 14).length,
    by_stage: Object.fromEntries(
      ['targeting', 'engaged', 'qualified', 'likely_yes', 'proposal_sent', 'signed', 'paid'].map(s => [
        s,
        { count: enriched.filter(o => o.stage === s).length, value: enriched.filter(o => o.stage === s).reduce((sum, o) => sum + (o.value || 0), 0) },
      ])
    ),
  }

  return NextResponse.json({ stats, opportunities: enriched })
}
