import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getHubServiceClient, resolvePartnershipMembers } from '@/lib/hub/partnership-members'

/**
 * Who on a partnership's roster has actually opened the Hub, and who has not.
 *
 * Four things were wrong with the previous version, and each on its own was
 * enough to make the answer meaningless:
 *
 *   1. One portal client was used to query Hub tables. Different project.
 *   2. Membership came from hub_org_members, which holds zero rows.
 *   3. The roster came from partnership_staff (28 rows, 2 partnerships) rather
 *      than staff_members (196 rows, 6 partnerships), which is what the roster
 *      upload, the provisioning route and the login sync all write.
 *   4. Activity was filtered with .eq('is_example', false) on a column that
 *      does not exist on hub_activity_log in the Hub project, so that read
 *      errored and the error was discarded.
 *
 * It also counted account_provisioned as activity, which is written when TDI
 * creates the seat rather than when a person turns up. That made Roosevelt
 * read as sixteen active educators when the real number was one.
 */

const portalSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type EngagementStatus = 'active' | 'inactive' | 'dormant' | 'not_enrolled'

export interface StaffEngagementRow {
  userId: string
  name: string
  email: string
  roleGroup: string | null
  status: EngagementStatus
  lastActivityAt: string | null
  daysSinceActivity: number | null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    const now = new Date()
    const hub = getHubServiceClient()

    const [{ data: staff, error: staffError }, { userIds: hubUserIds }] = await Promise.all([
      portalSupabase
        .from('staff_members')
        .select('id, first_name, last_name, email, role_title, hub_enrolled, is_active')
        .eq('partnership_id', partnershipId)
        .neq('is_active', false)
        .order('last_name'),
      resolvePartnershipMembers(partnershipId),
    ])

    // Surface rather than swallow. A discarded read error here is how this
    // route reported an empty roster while looking healthy.
    if (staffError) {
      console.error('[staff-engagement] roster read failed:', staffError.message)
      return NextResponse.json({ error: staffError.message }, { status: 500 })
    }

    const roster = staff ?? []

    const lastActivityByUser: Record<string, string> = {}
    const profileEmailToUserId: Record<string, string> = {}

    if (hubUserIds.length > 0) {
      const [{ data: recentActivity, error: activityError }, { data: profiles, error: profileError }] =
        await Promise.all([
          hub
            .from('hub_activity_log')
            .select('user_id, created_at')
            .in('user_id', hubUserIds)
            .neq('action', 'account_provisioned')
            .order('created_at', { ascending: false }),
          hub.from('hub_profiles').select('id, email').in('id', hubUserIds),
        ])

      if (activityError) {
        console.error('[staff-engagement] activity read failed:', activityError.message)
        return NextResponse.json({ error: activityError.message }, { status: 500 })
      }
      if (profileError) {
        console.error('[staff-engagement] profile read failed:', profileError.message)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      for (const row of recentActivity ?? []) {
        if (!lastActivityByUser[row.user_id]) {
          lastActivityByUser[row.user_id] = row.created_at
        }
      }
      for (const p of profiles ?? []) {
        if (p.email) profileEmailToUserId[String(p.email).toLowerCase()] = p.id
      }
    }

    const rows: StaffEngagementRow[] = roster.map((s) => {
      const email = s.email?.toLowerCase() || ''
      const userId = profileEmailToUserId[email]
      const lastActivity = userId ? lastActivityByUser[userId] : null
      const daysSince = lastActivity
        ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
        : null

      let status: EngagementStatus
      if (!userId) {
        // On the roster but no live Hub seat we can match. Usually the address
        // on the roster differs from the address the seat was created under.
        status = 'not_enrolled'
      } else if (!lastActivity) {
        status = 'dormant'
      } else if (daysSince !== null && daysSince <= 7) {
        status = 'active'
      } else if (daysSince !== null && daysSince <= 30) {
        status = 'inactive'
      } else {
        status = 'dormant'
      }

      return {
        userId: userId || s.id,
        name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email || 'Unknown',
        email: s.email || '',
        roleGroup: s.role_title || null,
        status,
        lastActivityAt: lastActivity,
        daysSinceActivity: daysSince,
      }
    })

    const summary = {
      total: rows.length,
      active: rows.filter((r) => r.status === 'active').length,
      inactive: rows.filter((r) => r.status === 'inactive').length,
      dormant: rows.filter((r) => r.status === 'dormant').length,
      not_enrolled: rows.filter((r) => r.status === 'not_enrolled').length,
      // Seats that exist in the Hub with nobody matching them on the roster.
      // Non-zero means roster and seats have drifted apart, which is the
      // Addison case: 22 roster rows whose address does not match their seat.
      seats_unmatched: Math.max(0, hubUserIds.length - rows.filter((r) => r.status !== 'not_enrolled').length),
    }

    return NextResponse.json({ staff: rows, summary })
  } catch (error) {
    console.error('Staff engagement API error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
