import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isTDIAdmin } from '@/lib/is-tdi-admin'
import { isAssignTabOn } from '@/lib/hub/assignment-flag'
import {
  currentSteps,
  capRefusal,
  type Assignment,
  type ContentType,
} from '@/lib/partners/assignments'

/**
 * Leadership assignment of Hub content to named staff.
 *
 * GET  lists what a partnership has assigned, with each person's current step.
 * POST creates one, refusing per A1 and A2 rather than trusting the screen.
 *
 * The agreement is docs/assignment-spec.md. Rule ids below are from it.
 *
 * Behind IN_PRACTICE_TAB, which defaults to off. There is one dashboard
 * component serving all nine live partnerships, so this reaches every school
 * the moment that flag is true.
 */

function portal() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Portal Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * A7.1. The assignment itself lives in the Hub, because the two reads that have
 * to be reliable are a teacher seeing what was assigned and a teacher answering
 * it, and both are Hub side.
 */
function hub() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * A8.1. Anyone with leader access to this partnership's dashboard can assign.
 * No new role is introduced, so this is the same membership check every other
 * partner route makes, plus the TDI admin bypass.
 */
async function authorise(partnershipId: string, userId?: string, userEmail?: string) {
  if (!userId) return { ok: false as const, status: 401, error: 'Not signed in' }
  if (userEmail && (await isTDIAdmin(userEmail))) return { ok: true as const }

  const { data, error } = await portal()
    .from('partnership_users')
    .select('id')
    .eq('partnership_id', partnershipId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { ok: false as const, status: 500, error: error.message }
  if (!data) return { ok: false as const, status: 403, error: 'Not a leader on this partnership' }
  return { ok: true as const }
}

const CONTENT_TYPES: ContentType[] = ['quickwin', 'game', 'course', 'quiz']

/* ────────────────────────────── GET ────────────────────────────── */

export async function GET(request: NextRequest) {
  if (!isAssignTabOn()) return NextResponse.json({ error: 'Not enabled' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const partnershipId = searchParams.get('partnershipId')
  const userId = searchParams.get('userId') || undefined
  const userEmail = searchParams.get('userEmail') || undefined
  if (!partnershipId) return NextResponse.json({ error: 'partnershipId required' }, { status: 400 })

  const auth = await authorise(partnershipId, userId, userEmail)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const h = hub()
  if (!h) return NextResponse.json({ error: 'Learning Hub not configured' }, { status: 503 })

  const { data: rows, error } = await h
    .from('hub_assignments')
    .select('id, recipient_email, content_type, content_slug, content_title, goal_id, goal_label, planned_date, closed_at, created_at')
    .eq('partnership_id', partnershipId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (rows ?? []).map(r => r.id)
  let answers: { assignment_id: string; step: number; words: string | null; words_shared_with: string; created_at: string }[] = []
  if (ids.length) {
    const { data: a, error: aErr } = await h
      .from('hub_assignment_answers')
      .select('assignment_id, step, words, words_shared_with, created_at')
      .in('assignment_id', ids)
    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 })
    answers = a ?? []
  }

  /**
   * A4.4. The words never leave here at a level the teacher did not choose.
   *
   * Stripped in the payload rather than in the component, because a component
   * that hides a field still shipped it to the browser, and the next person to
   * write a different component gets it for free.
   */
  const steps = currentSteps(answers as never)
  const safe = answers.map(a => ({
    assignment_id: a.assignment_id,
    step: a.step,
    created_at: a.created_at,
    words: a.words_shared_with === 'just_me' ? null : a.words,
    words_shared_with: a.words_shared_with,
  }))

  return NextResponse.json({
    assignments: rows ?? [],
    answers: safe,
    currentSteps: Object.fromEntries(steps),
  })
}

/* ────────────────────────────── POST ───────────────────────────── */

export async function POST(request: NextRequest) {
  if (!isAssignTabOn()) return NextResponse.json({ error: 'Not enabled' }, { status: 404 })

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 }) }

  const partnershipId = String(body.partnershipId ?? '')
  const dryRun = body.dryRun === true || body.dryRun === '1'
  const auth = await authorise(partnershipId, body.userId as string, body.userEmail as string)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const h = hub()
  if (!h) return NextResponse.json({ error: 'Learning Hub not configured' }, { status: 503 })

  // A7.3 and L4.7. Lowercased on write, so a read that forgets cannot orphan a
  // row. Never partnership_slug, which is quarantined.
  const recipients = Array.isArray(body.recipients)
    ? [...new Set((body.recipients as string[]).map(e => String(e).trim().toLowerCase()).filter(Boolean))]
    : []
  const assignedBy = String(body.userEmail ?? '').trim().toLowerCase()

  if (!recipients.length) return NextResponse.json({ error: 'At least one recipient is required' }, { status: 400 })
  if (!assignedBy) return NextResponse.json({ error: 'userEmail is required, and is who assigned this' }, { status: 400 })

  const contentType = String(body.contentType ?? '') as ContentType
  const contentSlug = String(body.contentSlug ?? '').trim()
  const contentTitle = String(body.contentTitle ?? '').trim()
  if (!CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json({ error: `contentType must be one of ${CONTENT_TYPES.join(', ')}` }, { status: 400 })
  }
  if (!contentSlug || !contentTitle) {
    return NextResponse.json({ error: 'contentSlug and contentTitle are required' }, { status: 400 })
  }

  /* ---- A2. An assignment must name the goal it serves ---- */

  const { data: goals, error: goalErr } = await portal()
    .from('partnership_kpis')
    .select('id, kpi_label, status')
    .eq('partnership_id', partnershipId)
  if (goalErr) return NextResponse.json({ error: goalErr.message }, { status: 500 })

  const accepted = (goals ?? []).filter(g => g.status === 'active')
  const goalId = body.goalId ? String(body.goalId) : null
  const ownGoalLabel = String(body.ownGoalLabel ?? '').trim()

  // A2.2. A school with no accepted goal cannot assign until it has one. This
  // is deliberate: Oak Grove has none and Tidioute has three suggested and none
  // accepted, and both are told the one thing that unblocks them rather than
  // being quietly allowed through.
  if (accepted.length === 0) {
    const suggested = (goals ?? []).filter(g => g.status === 'suggested')
    return NextResponse.json({
      error: 'This school has no accepted goal yet, and every assignment has to name one.',
      unblock: suggested.length ? 'accept_a_suggested_goal' : 'onboarding_meeting',
      suggested: suggested.map(g => ({ id: g.id, label: g.kpi_label })),
    }, { status: 409 })
  }

  let goalLabel: string
  // Always false while A2.4 is refused below. It stays named rather than
  // inlined because the column it writes is the thing keeping a school-authored
  // goal off a board report, and a future reader should see it being set.
  const schoolAuthored = false

  if (goalId) {
    const g = accepted.find(x => x.id === goalId)
    if (!g) return NextResponse.json({ error: 'That goal is not an accepted goal on this partnership' }, { status: 400 })
    // A7.2. The label is copied as it reads now, so a renamed or retired goal
    // never leaves a teacher looking at an assignment with no stated reason.
    goalLabel = g.kpi_label
  } else if (ownGoalLabel) {
    /**
     * A2.4a. A leader writes their own only inside this flow, and it exists
     * only once the assignment is made. There is no add-a-goal button anywhere
     * on the dashboard, which is the whole difference between this and the goal
     * wizard deleted on 24 September 2026: that one wrote real partnership_kpis
     * rows, so a school could author a commitment in TDI's name on a board
     * report.
     *
     * A2.4b holds the deleted wizard's principle where it still applies. Having
     * no accepted goal is already refused above, so this is only ever reachable
     * by a school that has goals and found none of them fit.
     *
     * A2.6 is not yet satisfiable: nothing records who wrote a goal, and the
     * board report reads the goal list. Until that column exists this cannot be
     * allowed through, so it is refused here rather than written and fenced off
     * by a component that somebody could later change.
     */
    return NextResponse.json({
      error: 'Writing your own goal is not available yet. It needs a column recording who wrote a '
           + 'goal first, so a school-authored goal can never appear on a board report looking like '
           + 'a TDI commitment.',
      unblock: 'a2_6_authorship_column',
    }, { status: 501 })
  } else {
    return NextResponse.json({ error: 'An assignment has to name the goal it serves' }, { status: 400 })
  }

  /* ---- A1. The cap is three open per person, across every leader ---- */

  const { data: openRows, error: openErr } = await h
    .from('hub_assignments')
    .select('id, recipient_email, content_type, content_slug, content_title, goal_id, goal_label, planned_date, closed_at')
    .in('recipient_email', recipients)
    .is('closed_at', null)
  if (openErr) return NextResponse.json({ error: openErr.message }, { status: 500 })

  const refused: { email: string; holding: Assignment[] }[] = []
  for (const email of recipients) {
    const theirs = (openRows ?? []).filter(r => r.recipient_email === email) as Assignment[]
    const verdict = capRefusal(theirs)
    // A1.3. The refusal names the three and offers to close one. It never says
    // "limit reached" and stops, which is why the rows travel with it.
    if (!verdict.allowed) refused.push({ email, holding: verdict.holding })
  }

  const allowed = recipients.filter(e => !refused.some(r => r.email === e))

  /**
   * The cap is checked here and not only by a disabled button, because a
   * disabled button is also just a drawing: two leaders on two screens can each
   * see the same person at two open and both assign.
   */
  if (!allowed.length) {
    return NextResponse.json({
      error: 'Everybody chosen already has three open. Close one of theirs first.',
      refused,
    }, { status: 409 })
  }

  const plannedDate = body.plannedDate ? String(body.plannedDate) : null

  const rows = allowed.map(email => ({
    partnership_id: partnershipId,
    assigned_by_email: assignedBy,
    recipient_email: email,
    content_type: contentType,
    content_slug: contentSlug,
    content_title: contentTitle,
    goal_id: goalId,
    goal_label: goalLabel,
    goal_is_school_authored: schoolAuthored,
    // A3.1. The time staff plan to work on this together. Never a deadline,
    // and A3.4 forbids a passed date from closing anything.
    planned_date: plannedDate,
  }))

  /**
   * dryRun is in the route rather than in a script, so it exercises this exact
   * code path: the same authorisation, the same goal lookup, the same cap
   * count. A separate script proves nothing about what this will do.
   */
  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      wouldCreate: rows.length,
      recipients: allowed,
      refused,
      goal: goalLabel,
      content: { type: contentType, slug: contentSlug, title: contentTitle },
      plannedDate,
      wrote: false,
    })
  }

  const { data: created, error: insertErr } = await h
    .from('hub_assignments')
    .insert(rows)
    .select('id, recipient_email')

  // Never count something as done before the database has accepted it.
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({
    created: created?.length ?? 0,
    assignments: created ?? [],
    refused,
  })
}
