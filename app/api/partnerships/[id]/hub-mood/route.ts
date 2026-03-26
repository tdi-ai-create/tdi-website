import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    // Get Hub users for this partnership
    const { data: members } = await supabase
      .from('hub_org_members')
      .select('user_id')
      .eq('partnership_id', partnershipId)

    if (!members || members.length === 0) {
      return NextResponse.json({ has_data: false, alert: null, trend: null })
    }

    const userIds = members.map(m => m.user_id)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

    // Get check-ins from last 14 days
    // Teachers only see the check-in when they log in - no emails, no nudges
    // So data will be sparse - we use school-wide averages, not individual streaks
    const { data: checkIns } = await supabase
      .from('hub_assessments')
      .select('user_id, stress_score, created_at')
      .in('user_id', userIds)
      .eq('type', 'daily_check_in')
      .gte('created_at', fourteenDaysAgo)
      .not('stress_score', 'is', null)
      .order('created_at', { ascending: false })

    if (!checkIns || checkIns.length === 0) {
      return NextResponse.json({ has_data: false, alert: null, trend: null })
    }

    // Split into this week vs last week
    const thisWeek = checkIns.filter(c => c.created_at >= sevenDaysAgo)
    const lastWeek = checkIns.filter(c => c.created_at < sevenDaysAgo)

    // Calculate school-wide averages
    // stress_score here is the daily check-in value: 5=Thriving, 4=Good, 3=Okay, 2=Tough, 1=Rough
    const avg = (arr: typeof checkIns) =>
      arr.length > 0
        ? Math.round((arr.reduce((s, c) => s + c.stress_score, 0) / arr.length) * 10) / 10
        : null

    const avgThisWeek = avg(thisWeek)
    const avgLastWeek = avg(lastWeek)

    // Need at least 2 check-ins this week to be meaningful
    if (!avgThisWeek || thisWeek.length < 2) {
      return NextResponse.json({ has_data: false, alert: null, trend: null })
    }

    // Determine trend
    const weekChange = avgLastWeek !== null ? Math.round((avgThisWeek - avgLastWeek) * 10) / 10 : null
    const trend = weekChange === null ? 'insufficient_data'
      : weekChange >= 0.3 ? 'improving'
      : weekChange <= -0.3 ? 'declining'
      : 'stable'

    // Build alert based on school-wide weekly average
    // Alert if: average < 2.5 (majority feeling Tough/Rough)
    //        OR: dropped 0.5+ points from last week
    const isCriticallyLow = avgThisWeek < 2.5
    const isSharpDecline = weekChange !== null && weekChange <= -0.5

    const alert = isCriticallyLow
      ? {
          severity: 'high',
          message: `School-wide mood is averaging ${avgThisWeek}/5 this week - teachers are struggling`,
          recommendation: 'Consider reaching out before your next session',
        }
      : isSharpDecline
      ? {
          severity: 'medium',
          message: `Mood scores dropped ${Math.abs(weekChange!)} points this week (${avgLastWeek} → ${avgThisWeek}/5)`,
          recommendation: 'Worth a personal check-in with the school champion',
        }
      : null

    // Celebrate if strong and improving
    const celebration = avgThisWeek >= 4.0 && trend === 'improving'
      ? {
          message: `Teachers are feeling great this week - averaging ${avgThisWeek}/5 and trending up`,
        }
      : null

    return NextResponse.json({
      has_data: true,
      alert,
      celebration,
      trend,
      avg_mood_7d: avgThisWeek,
      avg_mood_14d: avgLastWeek,
      check_in_count_7d: thisWeek.length,
      week_change: weekChange,
    })

  } catch (error) {
    console.error('Hub mood API error:', error)
    return NextResponse.json({ has_data: false, alert: null, trend: null })
  }
}
