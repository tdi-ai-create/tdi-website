import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { recruitmentWeeklyShortfall } from '@/lib/creator-slack'

/**
 * Friday recruitment goal check.
 *
 * The original failure here was silence: the pipeline sat empty for a month and
 * nothing said so. This closes that loop. If the week produced fewer than the
 * target number of candidates, Rae hears about it on Friday rather than finding
 * out at a quarterly review.
 */

const WEEKLY_TARGET = 5

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (request.headers.get('x-vercel-cron') !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { count: addedThisWeek } = await supabase
      .from('creator_recruitment_candidates')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo)

    const actual = addedThisWeek || 0

    // Count critical gaps that still have nobody sourced against them, since
    // that is what makes a shortfall actually urgent rather than merely short.
    const { data: criticalGaps } = await supabase
      .from('creator_content_gaps')
      .select('id')
      .eq('status', 'active')
      .eq('priority', 'critical')

    const criticalIds = (criticalGaps || []).map(g => g.id)
    let uncoveredCritical = criticalIds.length

    if (criticalIds.length > 0) {
      const { data: covered } = await supabase
        .from('creator_recruitment_candidates')
        .select('gap_id')
        .in('gap_id', criticalIds)
        .not('stage', 'in', '("archived","declined","no_response")')

      const coveredSet = new Set((covered || []).map(c => c.gap_id))
      uncoveredCritical = criticalIds.filter(id => !coveredSet.has(id)).length
    }

    const short = actual < WEEKLY_TARGET
    if (short) {
      await recruitmentWeeklyShortfall(actual, WEEKLY_TARGET, uncoveredCritical).catch(() => {})
    }

    const summary = {
      actual,
      target: WEEKLY_TARGET,
      short,
      uncovered_critical_gaps: uncoveredCritical,
    }
    console.log('[recruitment-goal-check] Results:', summary)

    return NextResponse.json({ success: true, results: summary })
  } catch (err) {
    console.error('[recruitment-goal-check] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
