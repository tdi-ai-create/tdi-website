import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolvePartnershipMembers } from '@/lib/hub/partnership-members'

// Hub Supabase (where hub_activity_log, hub_profiles, etc. live)
const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    // Who belongs to this partnership. One definition, in lib/hub/partnership-members.
    //
    // Two things were wrong here. The primary lookup read hub_org_members, an
    // unpopulated join table, through the portal client. The fallback then
    // matched Hub profiles on school or district name with a wildcard, which
    // silently pulls in any school whose name happens to contain the string.
    // Fuzzy name matching across a 104,000 user table is not a fallback, it is
    // a way to attribute strangers' data to a partner. Both are gone.
    const { userIds } = await resolvePartnershipMembers(partnershipId)

    if (userIds.length === 0) {
      return NextResponse.json({
        has_real_data: false,
        member_count: 0,
        logins_this_month: null,
        active_users_7d: null,
        hub_login_pct: null,
        course_completions: null,
        quick_wins_completed: null,
        mood_avg_7d: null,
        mood_avg_30d: null,
        moment_mode_uses_7d: null,
      })
    }
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Run all queries in parallel for performance
    const [
      loginsThisMonth,
      activeUsers7d,
      courseCompletions,
      quickWinsCompleted,
      momentModeUses7d,
      moodScores7d,
      moodScores30d,
    ] = await Promise.all([

      // Logins this month (distinct users who had any activity)
      hubSupabase
        .from('hub_activity_log')
        .select('user_id')
        .neq('action', 'account_provisioned')
        .in('user_id', userIds)
        .gte('created_at', startOfMonth),

      // Active users last 7 days
      hubSupabase
        .from('hub_activity_log')
        .select('user_id')
        .neq('action', 'account_provisioned')
        .in('user_id', userIds)
        .gte('created_at', sevenDaysAgo),

      // Course completions (all time)
      hubSupabase
        .from('hub_certificates')
        .select('id')
        .in('user_id', userIds),

      // Quick wins completed (all time)
      hubSupabase
        .from('hub_activity_log')
        .select('id')
        .in('user_id', userIds)
        .eq('action', 'quick_win_completed'),

      // Moment mode uses last 7 days
      hubSupabase
        .from('hub_activity_log')
        .select('id')
        .in('user_id', userIds)
        .eq('action', 'moment_mode_completed')
        .gte('created_at', sevenDaysAgo),

      // Mood scores last 7 days (daily check-ins)
      hubSupabase
        .from('hub_assessments')
        .select('stress_score')
        .in('user_id', userIds)
        .eq('type', 'daily_check_in')
        .gte('created_at', sevenDaysAgo)
        .not('stress_score', 'is', null),

      // Mood scores last 30 days
      hubSupabase
        .from('hub_assessments')
        .select('stress_score')
        .in('user_id', userIds)
        .eq('type', 'daily_check_in')
        .gte('created_at', thirtyDaysAgo)
        .not('stress_score', 'is', null),
    ])

    // Calculate distinct login count this month
    const distinctLoginsThisMonth = new Set(
      (loginsThisMonth.data || []).map(r => r.user_id)
    ).size

    // Calculate distinct active users last 7 days
    const distinctActiveUsers7d = new Set(
      (activeUsers7d.data || []).map(r => r.user_id)
    ).size

    // Calculate hub login percentage
    const hubLoginPct = userIds.length > 0
      ? Math.round((distinctLoginsThisMonth / userIds.length) * 100)
      : null

    // Calculate mood averages
    // Note: stress_score stores the check-in value (1-5 scale from daily check-in widget)
    // Higher = better mood (Thriving=5, Rough=1)
    const moodScores7dValues = (moodScores7d.data || []).map(r => r.stress_score).filter(Boolean) as number[]
    const moodScores30dValues = (moodScores30d.data || []).map(r => r.stress_score).filter(Boolean) as number[]

    const moodAvg7d = moodScores7dValues.length > 0
      ? Math.round((moodScores7dValues.reduce((a, b) => a + b, 0) / moodScores7dValues.length) * 10) / 10
      : null

    const moodAvg30d = moodScores30dValues.length > 0
      ? Math.round((moodScores30dValues.reduce((a, b) => a + b, 0) / moodScores30dValues.length) * 10) / 10
      : null

    const hasRealData = distinctLoginsThisMonth > 0 ||
      (courseCompletions.data?.length || 0) > 0

    return NextResponse.json({
      has_real_data: hasRealData,
      member_count: userIds.length,
      logins_this_month: distinctLoginsThisMonth,
      active_users_7d: distinctActiveUsers7d,
      hub_login_pct: hubLoginPct,
      course_completions: courseCompletions.data?.length || 0,
      quick_wins_completed: quickWinsCompleted.data?.length || 0,
      mood_avg_7d: moodAvg7d,
      mood_avg_30d: moodAvg30d,
      moment_mode_uses_7d: momentModeUses7d.data?.length || 0,
    })

  } catch (error) {
    console.error('Hub stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hub stats' },
      { status: 500 }
    )
  }
}
