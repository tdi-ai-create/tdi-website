import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * Outreach Queue API -- Returns leads that need outreach attention
 * Prioritizes: Tier 1 first, then by days since last contact (most stale first).
 * Only includes leads with contact info that haven't been contacted in 14+ days.
 *
 * Sophia uses this to draft personalized outreach emails.
 * Olivia uses this to know what to send from hello@teachersdeserveit.com.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${cronSecret}` && !req.cookies.get('sb-access-token')) {
    const referer = req.headers.get('referer') || ''
    if (!referer.includes('teachersdeserveit.com') && !referer.includes('localhost')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = getServiceSupabase()

  // Get active, non-lost, non-paid opportunities with contact email
  const { data, error } = await supabase
    .from('sales_opportunities')
    .select('id, name, stage, value, type, heat, contact_name, contact_email, contact_phone, city, state, lead_score, score_breakdown, ai_strategic_brief, enrichment_data, fit_composite_score, fit_tier, last_activity_at, source, assigned_to_email')
    .is('deleted_at', null)
    .not('stage', 'in', '(lost,paid)')
    .not('contact_email', 'is', null)
    .order('lead_score', { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const now = Date.now()
  const STALE_DAYS = 14

  const queue = (data || [])
    .map(opp => {
      const daysSinceActivity = opp.last_activity_at
        ? Math.floor((now - new Date(opp.last_activity_at).getTime()) / 86400000)
        : 999

      const tier = opp.lead_score
        ? (opp.lead_score >= 70 ? 'T1' : opp.lead_score >= 40 ? 'T2' : 'T3')
        : opp.fit_tier ? opp.fit_tier.replace('tier_', 'T') : null

      // Determine suggested action
      let suggestedAction = 'Initial outreach'
      if (daysSinceActivity < 7) suggestedAction = 'Recent contact -- follow up if no response'
      else if (daysSinceActivity >= 7 && daysSinceActivity < 14) suggestedAction = 'Follow-up email -- been a week'
      else if (daysSinceActivity >= 14 && daysSinceActivity < 30) suggestedAction = 'Re-engagement needed -- going cold'
      else if (daysSinceActivity >= 30) suggestedAction = 'Dormant lead -- re-engage or archive'
      if (!opp.last_activity_at) suggestedAction = 'No contact yet -- initial outreach needed'

      // Priority score: higher = needs attention sooner
      const tierWeight = tier === 'T1' ? 30 : tier === 'T2' ? 20 : 10
      const staleWeight = Math.min(daysSinceActivity, 60)
      const valueWeight = Math.min((opp.value || 0) / 5000, 10)
      const priorityScore = tierWeight + staleWeight + valueWeight

      return {
        ...opp,
        tier,
        days_since_activity: daysSinceActivity,
        needs_outreach: daysSinceActivity >= STALE_DAYS || !opp.last_activity_at,
        suggested_action: suggestedAction,
        priority_score: Math.round(priorityScore),
        // Extract key talking points from enrichment for email drafting
        talking_points: extractTalkingPoints(opp),
      }
    })
    .filter(opp => opp.needs_outreach)
    .sort((a, b) => b.priority_score - a.priority_score)

  return NextResponse.json({
    queue_size: queue.length,
    leads: queue,
    generated_at: new Date().toISOString(),
  })
}

function extractTalkingPoints(opp: Record<string, any>): string[] {
  const points: string[] = []
  const enrichment = opp.enrichment_data

  if (enrichment?.district_profile?.enrollment) {
    points.push(`District serves ${enrichment.district_profile.enrollment.toLocaleString()} students`)
  }
  if (enrichment?.decision_maker?.priorities) {
    const priorities = Array.isArray(enrichment.decision_maker.priorities)
      ? enrichment.decision_maker.priorities.join(', ')
      : enrichment.decision_maker.priorities
    points.push(`Leadership priorities: ${priorities}`)
  }
  if (enrichment?.funding_signals?.title_i) {
    points.push('Title I eligible -- federal PD funding available')
  }
  if (opp.ai_strategic_brief) {
    points.push(opp.ai_strategic_brief.split('.').slice(0, 2).join('.') + '.')
  }
  if (opp.state) {
    points.push(`Based in ${opp.state}`)
  }

  return points.slice(0, 5)
}
