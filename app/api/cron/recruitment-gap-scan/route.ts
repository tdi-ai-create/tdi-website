import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { recruitmentGapScanComplete, recruitmentPipelineStalled } from '@/lib/creator-slack'

/**
 * Recruitment Gap Scan -- runs weekly (Monday) via Vercel cron.
 *
 * Computes content gaps from the Hub catalog instead of waiting for an agent to
 * report them. This is deliberately a SQL job, not an AI job: the inputs are
 * counts we already own and the output should be reproducible.
 *
 * Reads:  Learning Hub  -> hub_courses, hub_quick_wins  (published only)
 * Writes: Creator Portal -> creator_content_gaps        (identified_by = 'system')
 *
 * It also runs a staleness check on the pipeline itself. The original failure
 * mode here was silence, so an empty pipeline now speaks up.
 */

// Categories the Hub organizes PD around. Iterated explicitly rather than
// derived from the data, because a category with zero content produces zero
// rows and is exactly the gap worth surfacing.
const CANONICAL_CATEGORIES = [
  'Classroom Management',
  'Communication',
  'Instructional Strategies',
  'Lesson Planning',
  'Assessment',
  'Classroom Setup',
  'Time Savers',
  'Leadership',
  'Self-Care',
  'Stress Relief',
  'Vocational',
  'SPED/Inclusion',
  'Early Childhood',
  'Technology Integration',
  'ELL/Multilingual',
] as const

// hub_courses stores slug-style categories, hub_quick_wins stores title case.
// Anything not listed here is reported as unmapped rather than dropped silently.
const CATEGORY_ALIASES: Record<string, string> = {
  'classroom-management': 'Classroom Management',
  'communication': 'Communication',
  'instructional-strategies': 'Instructional Strategies',
  'lesson-planning': 'Lesson Planning',
  'assessment': 'Assessment',
  'classroom-setup': 'Classroom Setup',
  'time-savers': 'Time Savers',
  'leadership': 'Leadership',
  'self-care': 'Self-Care',
  'stress-relief': 'Stress Relief',
  'stress-wellness': 'Stress Relief',
  'vocational': 'Vocational',
  'sped-inclusion': 'SPED/Inclusion',
  'early-childhood': 'Early Childhood',
  'technology-integration': 'Technology Integration',
  'ell-multilingual': 'ELL/Multilingual',
}

// Games are an activity format, not a PD content gap, so they sit out of scoring.
const EXCLUDED_CATEGORIES = new Set(['games'])

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeCategory(raw: string | null): string | null {
  if (!raw) return null
  const slug = slugify(raw)
  if (EXCLUDED_CATEGORIES.has(slug)) return null
  return CATEGORY_ALIASES[slug] || null
}

function portalDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function hubDb() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.LEARNING_HUB_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * Priority is driven by the course count first. A category with quick wins but
 * no course can be browsed but not actually learned, which is the gap that
 * costs us renewals.
 */
function scorePriority(courses: number, quickWins: number): 'critical' | 'high' | 'medium' | 'low' {
  if (courses === 0 && quickWins === 0) return 'critical'
  if (courses === 0 && quickWins < 10) return 'critical'
  if (courses === 0) return 'high'
  if (courses < 2 && quickWins < 12) return 'high'
  if (courses < 3) return 'medium'
  return 'low'
}

function buildDemandSignal(category: string, courses: number, quickWins: number): string {
  if (courses === 0 && quickWins === 0) {
    return `No published content at all in ${category}. Nothing for a member to open.`
  }
  if (courses === 0) {
    return `${quickWins} published quick win${quickWins === 1 ? '' : 's'} but zero courses. Members can skim ${category} but cannot go deep.`
  }
  return `${courses} published course${courses === 1 ? '' : 's'} and ${quickWins} quick win${quickWins === 1 ? '' : 's'} in ${category}.`
}

function recommendPath(courses: number, quickWins: number): 'course' | 'download' {
  // Thin on both means start with the faster win. Quick wins already present
  // means the missing piece is depth, so recruit for a course.
  if (quickWins < 6) return 'download'
  return courses === 0 ? 'course' : 'download'
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (request.headers.get('x-vercel-cron') !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const hub = hubDb()
  if (!hub) {
    return NextResponse.json({ error: 'Learning Hub credentials not configured' }, { status: 500 })
  }
  const portal = portalDb()

  try {
    const [coursesRes, quickWinsRes] = await Promise.all([
      hub.from('hub_courses').select('category').eq('is_published', true),
      hub.from('hub_quick_wins').select('category').eq('is_published', true),
    ])

    if (coursesRes.error) {
      return NextResponse.json({ error: `hub_courses: ${coursesRes.error.message}` }, { status: 500 })
    }
    if (quickWinsRes.error) {
      return NextResponse.json({ error: `hub_quick_wins: ${quickWinsRes.error.message}` }, { status: 500 })
    }

    const courseCounts: Record<string, number> = {}
    const quickWinCounts: Record<string, number> = {}
    const unmapped = new Set<string>()

    for (const row of coursesRes.data || []) {
      const category = normalizeCategory(row.category)
      if (!category) {
        if (row.category && !EXCLUDED_CATEGORIES.has(slugify(row.category))) unmapped.add(row.category)
        continue
      }
      courseCounts[category] = (courseCounts[category] || 0) + 1
    }

    for (const row of quickWinsRes.data || []) {
      const category = normalizeCategory(row.category)
      if (!category) {
        if (row.category && !EXCLUDED_CATEGORIES.has(slugify(row.category))) unmapped.add(row.category)
        continue
      }
      quickWinCounts[category] = (quickWinCounts[category] || 0) + 1
    }

    // Existing active gaps, so the scan updates rather than duplicates. Human
    // and agent authored gaps keep their priority and notes; only the counts
    // get refreshed, because a person set that priority on purpose.
    const { data: existingGaps, error: gapsErr } = await portal
      .from('creator_content_gaps')
      .select('id, category, priority, identified_by, status')
      .eq('status', 'active')

    if (gapsErr) {
      return NextResponse.json({ error: `read gaps: ${gapsErr.message}` }, { status: 500 })
    }

    const existingByCategory = new Map<string, { id: string; priority: string; identified_by: string }>()
    for (const gap of existingGaps || []) {
      existingByCategory.set(gap.category.toLowerCase(), {
        id: gap.id,
        priority: gap.priority,
        identified_by: gap.identified_by,
      })
    }

    const now = new Date().toISOString()
    const results = { created: 0, updated: 0, resolved: 0, unchanged: 0 }
    const criticalCategories: string[] = []

    for (const category of CANONICAL_CATEGORIES) {
      const courses = courseCounts[category] || 0
      const quickWins = quickWinCounts[category] || 0
      const priority = scorePriority(courses, quickWins)
      const existing = existingByCategory.get(category.toLowerCase())

      if (priority === 'critical') criticalCategories.push(category)

      const metrics = {
        hub_course_count: courses,
        hub_quick_win_count: quickWins,
        metrics_updated_at: now,
      }

      if (existing) {
        // A well covered category should stop occupying the board.
        if (priority === 'low') {
          await portal
            .from('creator_content_gaps')
            .update({ ...metrics, status: 'filled' })
            .eq('id', existing.id)
          results.resolved++
          continue
        }

        // Never overwrite a priority a person chose. Refresh the numbers only.
        const payload: Record<string, unknown> = { ...metrics }
        if (existing.identified_by === 'system') {
          payload.priority = priority
          payload.demand_signal = buildDemandSignal(category, courses, quickWins)
          payload.recommended_content_path = recommendPath(courses, quickWins)
        }

        await portal.from('creator_content_gaps').update(payload).eq('id', existing.id)
        results.updated++
        continue
      }

      // Nothing to flag for a healthy category.
      if (priority === 'low') {
        results.unchanged++
        continue
      }

      await portal.from('creator_content_gaps').insert({
        category,
        priority,
        demand_signal: buildDemandSignal(category, courses, quickWins),
        ...metrics,
        recommended_content_path: recommendPath(courses, quickWins),
        status: 'active',
        identified_by: 'system',
        notes: 'Detected by the weekly Hub content scan. Counts refresh every Monday.',
      })
      results.created++
    }

    // ─── Pipeline staleness ───
    // Silence is what let this system sit empty for a month. Say something.
    const { count: activeCandidates } = await portal
      .from('creator_recruitment_candidates')
      .select('id', { count: 'exact', head: true })
      .not('stage', 'in', '("archived","declined","no_response")')

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentCandidates } = await portal
      .from('creator_recruitment_candidates')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', fourteenDaysAgo)

    const summary = {
      ...results,
      unmapped_categories: Array.from(unmapped),
      critical_categories: criticalCategories,
      active_candidates: activeCandidates || 0,
      candidates_added_last_14_days: recentCandidates || 0,
    }

    try {
      await recruitmentGapScanComplete(
        results.created,
        results.updated,
        results.resolved,
        criticalCategories
      )
      if ((recentCandidates || 0) === 0 && criticalCategories.length > 0) {
        await recruitmentPipelineStalled(criticalCategories.length, activeCandidates || 0)
      }
    } catch (err) {
      console.error('[recruitment-gap-scan] Slack notify failed:', err)
    }

    if (unmapped.size > 0) {
      console.warn('[recruitment-gap-scan] Unmapped Hub categories skipped:', Array.from(unmapped))
    }
    console.log('[recruitment-gap-scan] Results:', summary)

    return NextResponse.json({ success: true, results: summary })
  } catch (err) {
    console.error('[recruitment-gap-scan] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
