import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ScoreComponent {
  key: string
  label: string
  weight: number
  earned: number
  met: boolean
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    const [partnershipRes, membersRes] = await Promise.all([
      supabase
        .from('partnerships')
        .select('invite_accepted_at, status, staff_count')
        .eq('id', partnershipId)
        .single(),

      supabase.from('hub_org_members').select('user_id').eq('partnership_id', partnershipId),
    ])

    const partnership = partnershipRes.data
    const userIds = (membersRes.data || []).map((m) => m.user_id)

    const inviteAccepted =
      !!partnership?.invite_accepted_at || partnership?.status === 'active'
    const staffInHub = userIds.length > 0

    let firstLogins = false
    let coursesStarted = false
    let moodActive = false
    let observationDone = false
    let loginRateGood = false

    if (userIds.length > 0) {
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString()

      const [actLog, enrollments, moods, obsEvents, loginsThisMonth] = await Promise.all([
        supabase
          .from('hub_activity_log')
          .select('user_id')
          .in('user_id', userIds)
          .eq('is_example', false)
          .limit(1),

        supabase
          .from('hub_enrollments')
          .select('user_id')
          .in('user_id', userIds)
          .limit(1),

        supabase
          .from('hub_assessments')
          .select('id')
          .in('user_id', userIds)
          .eq('type', 'daily_check_in')
          .limit(1),

        supabase
          .from('timeline_events')
          .select('id')
          .eq('partnership_id', partnershipId)
          .eq('event_type', 'observation')
          .eq('status', 'completed')
          .limit(1),

        supabase
          .from('hub_activity_log')
          .select('user_id')
          .in('user_id', userIds)
          .eq('is_example', false)
          .gte('created_at', startOfMonth),
      ])

      firstLogins = (actLog.data?.length ?? 0) > 0
      coursesStarted = (enrollments.data?.length ?? 0) > 0
      moodActive = (moods.data?.length ?? 0) > 0
      observationDone = (obsEvents.data?.length ?? 0) > 0

      if (loginsThisMonth.data && loginsThisMonth.data.length > 0) {
        const distinct = new Set(loginsThisMonth.data.map((r) => r.user_id)).size
        loginRateGood = distinct / userIds.length >= 0.3
      }
    }

    const components: ScoreComponent[] = [
      {
        key: 'invite_accepted',
        label: 'Invite accepted',
        weight: 10,
        earned: inviteAccepted ? 10 : 0,
        met: inviteAccepted,
      },
      {
        key: 'staff_in_hub',
        label: 'Staff in Hub',
        weight: 15,
        earned: staffInHub ? 15 : 0,
        met: staffInHub,
      },
      {
        key: 'first_logins',
        label: 'First Hub logins',
        weight: 15,
        earned: firstLogins ? 15 : 0,
        met: firstLogins,
      },
      {
        key: 'courses_started',
        label: 'Courses started',
        weight: 15,
        earned: coursesStarted ? 15 : 0,
        met: coursesStarted,
      },
      {
        key: 'mood_active',
        label: 'Mood check-ins active',
        weight: 15,
        earned: moodActive ? 15 : 0,
        met: moodActive,
      },
      {
        key: 'observation_done',
        label: 'First observation done',
        weight: 15,
        earned: observationDone ? 15 : 0,
        met: observationDone,
      },
      {
        key: 'login_rate',
        label: 'Login rate ≥30% this month',
        weight: 15,
        earned: loginRateGood ? 15 : 0,
        met: loginRateGood,
      },
    ]

    const score = components.reduce((s, c) => s + c.earned, 0)
    const metCount = components.filter((c) => c.met).length

    const tier =
      score >= 85 ? 'Ready'
      : score >= 60 ? 'Building'
      : score >= 30 ? 'Early'
      : 'Not Started'

    return NextResponse.json({ score, tier, components, metCount, totalComponents: components.length })
  } catch (error) {
    console.error('Activation score API error:', error)
    return NextResponse.json({ error: 'Failed to compute activation score' }, { status: 500 })
  }
}
