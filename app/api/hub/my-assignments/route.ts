import { NextRequest, NextResponse } from 'next/server'
import { createHubServerClient } from '@/lib/supabase-hub-server'
import { isAssignTabOn } from '@/lib/hub/assignment-flag'
import { currentSteps, type Answer } from '@/lib/partners/assignments'

/**
 * What a teacher has been assigned, and the one thing they are asked about it.
 *
 * GET  everything open for the signed in member, with where they currently sit.
 * POST records an answer, or the reason behind a "not yet".
 *
 * The agreement is docs/assignment-spec.md. Rule ids below are from it.
 *
 * Scoped to the session user throughout. There is no way to request or write
 * somebody else's assignment and no admin path into this route, because the
 * whole instrument depends on a teacher believing A4.4: that "just me" means
 * just them. A route that could be pointed at another person's row is a route
 * that has already broken that promise, whether or not anybody uses it.
 */

/** A6.1. The Hub carries the live state, so this is the thing email points at. */
export async function GET() {
  if (!isAssignTabOn()) return NextResponse.json({ error: 'Not enabled' }, { status: 404 })

  const supabase = await createHubServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  // A7.3 and L4.7. Matched on lowercased email, both ends.
  const email = user.email.toLowerCase()

  const { data: rows, error } = await supabase
    .from('hub_assignments')
    .select('id, content_type, content_slug, content_title, goal_label, planned_date, closed_at, created_at')
    .eq('recipient_email', email)
    .is('closed_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (rows ?? []).map(r => r.id)
  let answers: Answer[] = []
  if (ids.length) {
    const { data, error: aErr } = await supabase
      .from('hub_assignment_answers')
      .select('assignment_id, step, words, words_shared_with, created_at')
      .in('assignment_id', ids)
      .order('created_at', { ascending: false })
    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 })
    answers = (data ?? []) as Answer[]
  }

  const steps = currentSteps(answers)
  const today = new Date().toISOString().slice(0, 10)

  return NextResponse.json({
    assignments: (rows ?? []).map(r => ({
      ...r,
      currentStep: steps.get(r.id) ?? null,

      /**
       * A4.13.1. A quiz asks nothing afterwards. Taking it is the whole of it,
       * so there is no ladder, no words and no sharing choice to offer, and the
       * client is told that here rather than inferring it from the type.
       */
      asksAnything: r.content_type !== 'quiz',

      /**
       * A3.2. When the planned date passes the teacher sees one quiet line
       * asking whether they still want it. No red, no badge, no escalation and
       * no second notice, and per A3.4 nothing about it closes anything.
       */
      plannedDatePassed: !!r.planned_date && r.planned_date < today,
    })),
  })
}

export async function POST(request: NextRequest) {
  if (!isAssignTabOn()) return NextResponse.json({ error: 'Not enabled' }, { status: 404 })

  const supabase = await createHubServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const email = user.email.toLowerCase()

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 }) }

  const assignmentId = String(body.assignmentId ?? '')
  if (!assignmentId) return NextResponse.json({ error: 'assignmentId is required' }, { status: 400 })

  // Ownership is checked by reading the row scoped to this member's email, so a
  // request naming somebody else's assignment finds nothing rather than being
  // refused by a condition a later edit could drop.
  const { data: assignment, error: findErr } = await supabase
    .from('hub_assignments')
    .select('id, content_type, closed_at')
    .eq('id', assignmentId)
    .eq('recipient_email', email)
    .maybeSingle()

  if (findErr) return NextResponse.json({ error: findErr.message }, { status: 500 })
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const action = String(body.action ?? 'answer')

  /* ---------------- A4.1, A4.2, A4.6 to A4.8. The answer ---------------- */

  if (action === 'answer') {
    if (assignment.content_type === 'quiz') {
      // A4.13.1 again, enforced rather than assumed. A quiz that could be
      // answered would put a teacher on a ladder about their own personality.
      return NextResponse.json({
        error: 'A quiz asks nothing afterwards. Taking it is the whole of it.',
      }, { status: 400 })
    }

    const step = Number(body.step)
    if (!Number.isInteger(step) || step < 1 || step > 4) {
      return NextResponse.json({ error: 'step must be 1, 2, 3 or 4' }, { status: 400 })
    }

    const shared = String(body.wordsSharedWith ?? 'just_me')
    if (!['just_me', 'my_leader', 'my_school_anonymous'].includes(shared)) {
      return NextResponse.json({ error: 'wordsSharedWith must be just_me, my_leader or my_school_anonymous' }, { status: 400 })
    }

    const words = typeof body.words === 'string' && body.words.trim() ? body.words.trim() : null

    /**
     * Inserted, never updated.
     *
     * A4.6 says the answer is a position rather than a submission and A4.8 says
     * every change is kept, so the trail is the thing worth looking at: a
     * teacher moving from read-it to using-regularly across five weeks is the
     * part that shows progress across a year. An update would throw that away
     * and leave only the last state, which is also what makes A4.7 possible,
     * since somebody who was using something regularly and stopped is telling
     * us something true.
     */
    const { error: insertErr } = await supabase
      .from('hub_assignment_answers')
      .insert({
        assignment_id: assignmentId,
        step,
        words,
        words_shared_with: shared,
      })

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
    return NextResponse.json({ recorded: true, step })
  }

  /* ---------------- A4.10. What is in the way ---------------- */

  if (action === 'reason') {
    const REASONS = ['does_not_fit', 'no_time', 'tried_it_failed', 'already_doing_it', 'need_help']
    const reason = String(body.reason ?? '')
    if (!REASONS.includes(reason)) {
      // The list is fixed rather than free text because free text cannot be
      // counted, and the whole value to a leader is seeing three of seven
      // saying the same thing. A4.11 then routes the single reminder off these
      // values, which is the second job the list does.
      return NextResponse.json({ error: `reason must be one of ${REASONS.join(', ')}` }, { status: 400 })
    }

    const words = typeof body.words === 'string' && body.words.trim() ? body.words.trim() : null

    const { error: insertErr } = await supabase
      .from('hub_assignment_followups')
      .insert({ assignment_id: assignmentId, reason, words })

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })
    return NextResponse.json({ recorded: true, reason })
  }

  /* ---------------- A4.13.3. A quiz closes when it is taken ---------------- */

  if (action === 'quiz_taken') {
    if (assignment.content_type !== 'quiz') {
      return NextResponse.json({ error: 'Only a quiz closes this way' }, { status: 400 })
    }
    if (assignment.closed_at) return NextResponse.json({ closed: true, already: true })

    // Taking it is its only completion event. Without this it holds one of the
    // three slots in A1.1 forever, and a leader who assigned three quizzes
    // could never assign anything again.
    const { error: closeErr } = await supabase
      .from('hub_assignments')
      .update({ closed_at: new Date().toISOString(), closed_reason: 'quiz_taken', updated_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .eq('recipient_email', email)

    if (closeErr) return NextResponse.json({ error: closeErr.message }, { status: 500 })
    return NextResponse.json({ closed: true })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
