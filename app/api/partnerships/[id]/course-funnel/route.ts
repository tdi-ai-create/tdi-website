import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    const { data: members } = await supabase
      .from('hub_org_members')
      .select('user_id')
      .eq('partnership_id', partnershipId)

    if (!members || members.length === 0) {
      return NextResponse.json({
        enrolled: 0,
        started: 0,
        completed: 0,
        has_data: false,
      })
    }

    const userIds = members.map((m) => m.user_id)

    const [enrollmentsRes, certificatesRes] = await Promise.all([
      supabase
        .from('hub_enrollments')
        .select('user_id, status, progress_pct')
        .in('user_id', userIds),

      supabase.from('hub_certificates').select('user_id').in('user_id', userIds),
    ])

    const enrollments = enrollmentsRes.data || []
    const certs = certificatesRes.data || []

    const enrolledUsers = new Set(enrollments.map((e) => e.user_id))
    const completedUsers = new Set(certs.map((c) => c.user_id))

    // "Started" = enrolled AND has made any progress (progress_pct > 0) or has a completion
    const startedUsers = new Set(
      enrollments
        .filter((e) => (e.progress_pct != null && e.progress_pct > 0) || e.status === 'completed')
        .map((e) => e.user_id)
    )

    return NextResponse.json({
      enrolled: userIds.length,
      started: enrolledUsers.size,
      in_progress: startedUsers.size,
      completed: completedUsers.size,
      has_data: userIds.length > 0,
    })
  } catch (error) {
    console.error('Course funnel API error:', error)
    return NextResponse.json({ error: 'Failed to fetch course funnel' }, { status: 500 })
  }
}
