import { NextRequest, NextResponse } from 'next/server'
import { getHubServiceClient, resolvePartnershipMembers } from '@/lib/hub/partnership-members'


export interface LoginTrendWeek {
  weekLabel: string
  weekStart: string
  activeUsers: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Built per request, not at module scope. A module-scope call runs
  // during Next.js page-data collection at build time, which fails every
  // build where the Hub service key is absent, such as every preview.
  const supabase = getHubServiceClient()
  const { id: partnershipId } = await params

  try {
    // Who belongs to this partnership. One definition, in lib/hub/partnership-members.
    // This previously read an unpopulated join table through the portal client.
    const { userIds } = await resolvePartnershipMembers(partnershipId)

    if (userIds.length === 0) {
      return NextResponse.json({ weeks: [], has_data: false, member_count: 0 })
    }

    // 12 weeks back from today
    const now = new Date()
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000)

    const { data: activity } = await supabase
      .from('hub_activity_log')
      .select('user_id, created_at')
      .neq('action', 'account_provisioned')
      .in('user_id', userIds)
      .gte('created_at', twelveWeeksAgo.toISOString())
      .order('created_at')

    // Build 12 buckets (ISO weeks, Monday-start)
    const weeks: LoginTrendWeek[] = []
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      // Go back to start of current week (Monday) then subtract i weeks
      const dayOfWeek = (weekStart.getDay() + 6) % 7 // 0=Mon
      weekStart.setDate(weekStart.getDate() - dayOfWeek - i * 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const activeInWeek = new Set(
        (activity || [])
          .filter((r) => {
            const d = new Date(r.created_at)
            return d >= weekStart && d < weekEnd
          })
          .map((r) => r.user_id)
      ).size

      const month = weekStart.toLocaleString('en-US', { month: 'short' })
      const day = weekStart.getDate()
      weeks.push({
        weekLabel: `${month} ${day}`,
        weekStart: weekStart.toISOString(),
        activeUsers: activeInWeek,
      })
    }

    const hasData = weeks.some((w) => w.activeUsers > 0)

    return NextResponse.json({
      weeks,
      has_data: hasData,
      member_count: userIds.length,
    })
  } catch (error) {
    console.error('Login trend API error:', error)
    return NextResponse.json({ error: 'Failed to fetch login trend' }, { status: 500 })
  }
}
