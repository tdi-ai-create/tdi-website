import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface OnboardingChecklistItem {
  key: string
  label: string
  description: string
  done: boolean
  points: number
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    const [partnershipRes, membersRes, activityRes, enrollmentRes, moodRes, observationRes] =
      await Promise.all([
        supabase
          .from('partnerships')
          .select('invite_accepted_at, status')
          .eq('id', partnershipId)
          .single(),

        supabase.from('hub_org_members').select('user_id').eq('partnership_id', partnershipId),

        supabase
          .from('hub_org_members')
          .select('user_id')
          .eq('partnership_id', partnershipId),

        // will join below after we have userIds
        Promise.resolve(null),
        Promise.resolve(null),
        Promise.resolve(null),
      ])

    const partnership = partnershipRes.data
    const userIds = (membersRes.data || []).map((m) => m.user_id)

    let firstLogin = false
    let courseStarted = false
    let moodActive = false
    let observationDone = false
    let loginRateGood = false

    if (userIds.length > 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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

      firstLogin = (actLog.data?.length ?? 0) > 0
      courseStarted = (enrollments.data?.length ?? 0) > 0
      moodActive = (moods.data?.length ?? 0) > 0
      observationDone = (obsEvents.data?.length ?? 0) > 0

      if (loginsThisMonth.data && loginsThisMonth.data.length > 0) {
        const distinctLoginsThisMonth = new Set(loginsThisMonth.data.map((r) => r.user_id)).size
        loginRateGood = userIds.length > 0 && distinctLoginsThisMonth / userIds.length >= 0.3
      }
    }

    const staffInHub = userIds.length > 0

    const items: OnboardingChecklistItem[] = [
      {
        key: 'invite_accepted',
        label: 'Invite accepted',
        description: 'Principal has accepted the partnership invite',
        done: !!partnership?.invite_accepted_at || partnership?.status === 'active',
        points: 10,
      },
      {
        key: 'staff_in_hub',
        label: 'Staff uploaded to Hub',
        description: 'At least one staff member has a Hub account linked to this partnership',
        done: staffInHub,
        points: 15,
      },
      {
        key: 'first_logins',
        label: 'First Hub logins',
        description: 'At least one staff member has logged into the Hub',
        done: firstLogin,
        points: 15,
      },
      {
        key: 'courses_started',
        label: 'Courses started',
        description: 'At least one staff member has enrolled in a course',
        done: courseStarted,
        points: 15,
      },
      {
        key: 'mood_active',
        label: 'Mood check-ins active',
        description: 'At least one staff member has submitted a daily mood check-in',
        done: moodActive,
        points: 15,
      },
      {
        key: 'observation_done',
        label: 'First observation completed',
        description: 'At least one TDI observation day has been marked complete',
        done: observationDone,
        points: 15,
      },
      {
        key: 'login_rate_good',
        label: 'Hub login rate ≥30%',
        description: 'At least 30% of Hub members have logged in this month',
        done: loginRateGood,
        points: 15,
      },
    ]

    const completedCount = items.filter((i) => i.done).length
    const totalPoints = items.reduce((s, i) => s + i.points, 0)
    const earnedPoints = items.filter((i) => i.done).reduce((s, i) => s + i.points, 0)

    return NextResponse.json({
      items,
      completed: completedCount,
      total: items.length,
      score: Math.round((earnedPoints / totalPoints) * 100),
    })
  } catch (error) {
    console.error('Onboarding checklist API error:', error)
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 })
  }
}
