import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get partnership staff roster
    const [staffRes, membersRes] = await Promise.all([
      supabase
        .from('partnership_staff')
        .select('id, first_name, last_name, email, role_group, hub_enrolled')
        .eq('partnership_id', partnershipId)
        .order('last_name'),

      supabase.from('hub_org_members').select('user_id').eq('partnership_id', partnershipId),
    ])

    const staff = staffRes.data || []
    const hubUserIds = (membersRes.data || []).map((m) => m.user_id)

    // Get last activity per Hub user
    let lastActivityByUser: Record<string, string> = {}
    if (hubUserIds.length > 0) {
      const { data: recentActivity } = await supabase
        .from('hub_activity_log')
        .select('user_id, created_at')
        .in('user_id', hubUserIds)
        .eq('is_example', false)
        .order('created_at', { ascending: false })

      // Get latest activity per user
      for (const row of recentActivity || []) {
        if (!lastActivityByUser[row.user_id]) {
          lastActivityByUser[row.user_id] = row.created_at
        }
      }
    }

    // Get hub_profiles to map user_id → email for matching back to staff roster
    let profileEmailToUserId: Record<string, string> = {}
    if (hubUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('hub_profiles')
        .select('id, email')
        .in('id', hubUserIds)
      for (const p of profiles || []) {
        if (p.email) profileEmailToUserId[p.email.toLowerCase()] = p.id
      }
    }

    const rows: StaffEngagementRow[] = staff.map((s) => {
      const email = s.email?.toLowerCase() || ''
      const userId = profileEmailToUserId[email]
      const lastActivity = userId ? lastActivityByUser[userId] : null
      const daysSince = lastActivity
        ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
        : null

      let status: EngagementStatus
      if (!s.hub_enrolled || !userId) {
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
        roleGroup: s.role_group || null,
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
    }

    return NextResponse.json({ staff: rows, summary })
  } catch (error) {
    console.error('Staff engagement API error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff engagement' }, { status: 500 })
  }
}
