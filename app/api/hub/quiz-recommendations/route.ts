import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/hub/quiz-recommendations?userId=xxx
// Returns "Educators like you" recommendations based on quiz result cohorts
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  try {
    // 1. Get this user's quiz results
    const { data: userResults } = await supabase
      .from('hub_quiz_results')
      .select('quiz_type, result_key')
      .eq('user_id', userId)

    if (!userResults || userResults.length === 0) {
      return NextResponse.json({ recommendations: [], cohortSize: 0 })
    }

    // 2. Find users with the same educator_type (primary cohort)
    const educatorType = userResults.find(r => r.quiz_type === 'educator_type')?.result_key
    if (!educatorType) {
      return NextResponse.json({ recommendations: [], cohortSize: 0 })
    }

    const { data: cohortUsers } = await supabase
      .from('hub_quiz_results')
      .select('user_id')
      .eq('quiz_type', 'educator_type')
      .eq('result_key', educatorType)
      .neq('user_id', userId)

    if (!cohortUsers || cohortUsers.length === 0) {
      return NextResponse.json({ recommendations: [], cohortSize: 0 })
    }

    const cohortIds = cohortUsers.map(u => u.user_id)

    // 3. Find what Quick Wins this cohort viewed most
    const { data: cohortActivity } = await supabase
      .from('hub_activity_log')
      .select('metadata')
      .in('user_id', cohortIds.slice(0, 50)) // limit for perf
      .eq('action', 'quick_win_viewed')

    // Count which Quick Wins are most popular in the cohort
    const qwCounts: Record<string, number> = {}
    for (const row of cohortActivity || []) {
      const slug = (row.metadata as Record<string, string>)?.slug
      if (slug) {
        qwCounts[slug] = (qwCounts[slug] || 0) + 1
      }
    }

    // 4. Get user's own viewed QWs to exclude
    const { data: userActivity } = await supabase
      .from('hub_activity_log')
      .select('metadata')
      .eq('user_id', userId)
      .eq('action', 'quick_win_viewed')

    const userViewed = new Set<string>()
    for (const row of userActivity || []) {
      const slug = (row.metadata as Record<string, string>)?.slug
      if (slug) userViewed.add(slug)
    }

    // 5. Sort by popularity, exclude already viewed, take top 3
    const topSlugs = Object.entries(qwCounts)
      .filter(([slug]) => !userViewed.has(slug))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug]) => slug)

    if (topSlugs.length === 0) {
      return NextResponse.json({ recommendations: [], cohortSize: cohortIds.length, educatorType })
    }

    // 6. Fetch Quick Win details
    const { data: quickWins } = await supabase
      .from('hub_quick_wins')
      .select('id, slug, title, category')
      .in('slug', topSlugs)
      .eq('is_published', true)

    return NextResponse.json({
      recommendations: quickWins || [],
      cohortSize: cohortIds.length,
      educatorType,
    })
  } catch (err: any) {
    console.error('Quiz recommendations error:', err)
    return NextResponse.json({ recommendations: [], cohortSize: 0 })
  }
}
