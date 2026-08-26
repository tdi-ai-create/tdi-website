import { NextRequest, NextResponse } from 'next/server'
import { getHubServiceClient, resolvePartnershipMembers } from '@/lib/hub/partnership-members'


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Built per request, not at module scope. A module-scope call runs
  // during Next.js page-data collection at build time, which fails every
  // build where the Hub service key is absent, such as every preview.
  const supabase = getHubServiceClient()
  const { id: partnershipId } = await params

  try {
    // Who belongs to this partnership. One definition, in lib/hub/partnership-members.
    // This previously read an unpopulated join table through the portal client:
    // the wrong table, in the wrong database, so it always returned nothing.
    const { userIds } = await resolvePartnershipMembers(partnershipId)

    if (userIds.length === 0) {
      return NextResponse.json({ has_data: false, observations: [] })
    }

    // Get completed observation events for this partnership
    const { data: observations } = await supabase
      .from('timeline_events')
      .select('id, event_title, event_date')
      .eq('partnership_id', partnershipId)
      .eq('event_type', 'observation')
      .eq('status', 'completed')
      .not('event_date', 'is', null)
      .order('event_date', { ascending: false })
      .limit(5)

    if (!observations || observations.length === 0) {
      return NextResponse.json({ has_data: false, observations: [] })
    }

    // For each observation, calculate before/after Hub metrics
    const results = await Promise.all(
      observations.map(async (obs) => {
        const obsDate = new Date(obs.event_date!)
        const sevenBefore = new Date(obsDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const sevenAfter = new Date(obsDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const obsDateStr = obsDate.toISOString()

        const [beforeActivity, afterActivity, beforeMood, afterMood, beforeQuickWins, afterQuickWins] =
          await Promise.all([
            // Hub logins BEFORE
            supabase.from('hub_activity_log')
              .select('user_id')
              .neq('action', 'account_provisioned')
              .in('user_id', userIds)
              .gte('created_at', sevenBefore)
              .lt('created_at', obsDateStr),

            // Hub logins AFTER
            supabase.from('hub_activity_log')
              .select('user_id')
              .neq('action', 'account_provisioned')
              .in('user_id', userIds)
              .gte('created_at', obsDateStr)
              .lte('created_at', sevenAfter),

            // Mood scores BEFORE
            supabase.from('hub_assessments')
              .select('stress_score')
              .in('user_id', userIds)
              .eq('type', 'daily_check_in')
              .gte('created_at', sevenBefore)
              .lt('created_at', obsDateStr)
              .not('stress_score', 'is', null),

            // Mood scores AFTER
            supabase.from('hub_assessments')
              .select('stress_score')
              .in('user_id', userIds)
              .eq('type', 'daily_check_in')
              .gte('created_at', obsDateStr)
              .lte('created_at', sevenAfter)
              .not('stress_score', 'is', null),

            // Quick wins BEFORE
            supabase.from('hub_activity_log')
              .select('id')
              .neq('action', 'account_provisioned')
              .in('user_id', userIds)
              .eq('action', 'quick_win_completed')
              .gte('created_at', sevenBefore)
              .lt('created_at', obsDateStr),

            // Quick wins AFTER
            supabase.from('hub_activity_log')
              .select('id')
              .neq('action', 'account_provisioned')
              .in('user_id', userIds)
              .eq('action', 'quick_win_completed')
              .gte('created_at', obsDateStr)
              .lte('created_at', sevenAfter),
          ])

        // Calculate distinct active users before/after
        const activeUsersBefore = new Set((beforeActivity.data || []).map(r => r.user_id)).size
        const activeUsersAfter = new Set((afterActivity.data || []).map(r => r.user_id)).size

        // Calculate mood averages
        const moodBefore = beforeMood.data?.length
          ? Math.round((beforeMood.data.reduce((s, r) => s + r.stress_score, 0) / beforeMood.data.length) * 10) / 10
          : null
        const moodAfter = afterMood.data?.length
          ? Math.round((afterMood.data.reduce((s, r) => s + r.stress_score, 0) / afterMood.data.length) * 10) / 10
          : null

        // Calculate engagement change
        const engagementChange = activeUsersBefore > 0
          ? Math.round(((activeUsersAfter - activeUsersBefore) / activeUsersBefore) * 100)
          : null

        const moodChange = moodBefore !== null && moodAfter !== null
          ? Math.round((moodAfter - moodBefore) * 10) / 10
          : null

        return {
          observation_id: obs.id,
          observation_title: obs.event_title,
          observation_date: obs.event_date,
          active_users_before: activeUsersBefore,
          active_users_after: activeUsersAfter,
          engagement_change_pct: engagementChange,
          mood_before: moodBefore,
          mood_after: moodAfter,
          mood_change: moodChange,
          quick_wins_before: beforeQuickWins.data?.length || 0,
          quick_wins_after: afterQuickWins.data?.length || 0,
          has_meaningful_data: activeUsersBefore > 0 || activeUsersAfter > 0,
        }
      })
    )

    const observationsWithData = results.filter(r => r.has_meaningful_data)

    return NextResponse.json({
      has_data: observationsWithData.length > 0,
      observations: observationsWithData,
    })

  } catch (error) {
    console.error('Observation impact API error:', error)
    return NextResponse.json({ has_data: false, observations: [] })
  }
}
