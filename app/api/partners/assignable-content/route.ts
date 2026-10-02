import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAssignTabOn } from '@/lib/hub/assignment-flag'
import { getRoutableQuizzes } from '@/lib/hub/quizConfigs'

/**
 * Everything a leader can assign, in one list.
 *
 * Four kinds, and they do not live in the same place. Quick Wins and games are
 * rows in hub_quick_wins, games being those in the Games category rather than a
 * separate table. Courses are rows in hub_courses. Quizzes are not rows at all:
 * they live in lib/hub/quizConfigs.ts as code, and only the ones with a slug
 * have a Hub address, which getRoutableQuizzes already draws the line on. An
 * assignment has to point at something a teacher can open.
 *
 * So this normalises the four into one shape, and the differences that survive
 * are the ones Rae decided are real: a course carries no effort level, and a
 * quiz carries neither an effort level nor a Danielson domain.
 *
 * Categories are passed through categoryLabel because the two vocabularies do
 * not match. Quick Wins store "Classroom Management" and courses store
 * "classroom-management", so a single filter over both matches nothing without
 * it.
 */

function hub() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export type AssignableItem = {
  type: 'quickwin' | 'game' | 'course' | 'quiz'
  slug: string
  title: string
  category: string
  effort: 'low' | 'medium' | 'high' | null
  domains: string[]
  roles: string[]
}

const LIFT: Record<string, 'low' | 'medium' | 'high'> = { LOW: 'low', MED: 'medium', HIGH: 'high' }

/**
 * One spelling of a category, because the two stores disagree.
 *
 * Quick Wins hold "Classroom Management". Courses hold "classroom-management"
 * and "stress-&-wellness". A single filter over both matches nothing without
 * this.
 *
 * Deliberately local and deliberately temporary. The shared helper is
 * lib/hub/categories.ts in PR #713, which is blocked on a browser pass for
 * three Hub pages that cannot be signed in to locally. The moment that merges,
 * delete this and import it, because a fourth private copy of this conversion
 * is the thing #713 exists to stop.
 */
function categoryLabel(category: string | null | undefined): string {
  if (!category) return ''
  return category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function GET() {
  if (!isAssignTabOn()) return NextResponse.json({ error: 'Not enabled' }, { status: 404 })

  const h = hub()
  if (!h) return NextResponse.json({ error: 'Learning Hub not configured' }, { status: 503 })

  const { data: qw, error: qwErr } = await h
    .from('hub_quick_wins')
    .select('slug, title, category, lift, danielson_domains, roles')
    .eq('is_published', true)
    .order('title')
  if (qwErr) return NextResponse.json({ error: qwErr.message }, { status: 500 })

  const { data: courses, error: cErr } = await h
    .from('hub_courses')
    .select('slug, title, category, danielson_domains, roles')
    .eq('is_published', true)
    .order('title')
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })

  const items: AssignableItem[] = []

  for (const q of qw ?? []) {
    items.push({
      // A game is a Quick Win in the Games category. Separated here only so a
      // leader can filter for one, never stored or fetched differently.
      type: q.category === 'Games' ? 'game' : 'quickwin',
      slug: q.slug,
      title: q.title,
      category: categoryLabel(q.category),
      effort: q.lift ? LIFT[q.lift] ?? null : null,
      domains: q.danielson_domains ?? [],
      roles: q.roles ?? [],
    })
  }

  for (const c of courses ?? []) {
    items.push({
      type: 'course',
      slug: c.slug,
      title: c.title,
      category: categoryLabel(c.category),
      // No effort level exists on a course. Rae, 2 October 2026: that is fine,
      // and the filter disappears rather than showing an empty one.
      effort: null,
      domains: c.danielson_domains ?? [],
      roles: c.roles ?? [],
    })
  }

  for (const z of getRoutableQuizzes()) {
    items.push({
      type: 'quiz',
      slug: z.slug as string,
      title: z.title,
      // A quiz has no category of its own in the config, so it sits under one
      // heading rather than being given a guessed one.
      category: 'Educator quizzes',
      effort: null,
      domains: [],
      roles: [],
    })
  }

  return NextResponse.json({
    items,
    counts: {
      quickwin: items.filter(i => i.type === 'quickwin').length,
      game: items.filter(i => i.type === 'game').length,
      course: items.filter(i => i.type === 'course').length,
      quiz: items.filter(i => i.type === 'quiz').length,
    },
  })
}
