/**
 * The public end of a partner check-in.
 *
 * GET  /api/check-in/<code>   the questions, and nothing else
 * POST /api/check-in/<code>   one anonymous set of answers
 *
 * No authentication. The link is the access control, which is why the code is
 * unguessable and why GET returns no partnership id, no goal wiring and no
 * responses. A teacher opening this cannot see what anyone else answered, and
 * neither can anyone who guesses at a URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import {
  publishCheckinGoal,
  type Checkin,
  type CheckinAnswers,
  type CheckinQuestion,
} from '@/lib/partners/checkin-aggregate';

/** A staff meeting is a dozen people. Anything past this is not a staff meeting. */
const MAX_RESPONSES = 300;

const CHECKIN_FIELDS =
  'id, partnership_id, code, title, intro, questions, kpi_key, goal_question_id, goal_values, min_responses, status';

async function loadCheckin(code: string): Promise<Checkin | null> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('partner_checkins')
    .select(CHECKIN_FIELDS)
    .eq('code', code)
    .maybeSingle();

  if (error) throw new Error(`Could not read the check-in: ${error.message}`);
  return (data as Checkin | null) ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const checkin = await loadCheckin(code);

    if (!checkin || checkin.status === 'draft') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({
      title: checkin.title,
      intro: checkin.intro,
      questions: checkin.questions,
      status: checkin.status,
    });
  } catch (error) {
    console.error('[check-in] GET failed:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

/**
 * Reject an answer set that does not match the questions asked, rather than
 * storing whatever arrived. Returns the first problem, or null when it is sound.
 */
function validate(questions: CheckinQuestion[], answers: unknown): string | null {
  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return 'Answers must be an object.';
  }

  const given = answers as Record<string, unknown>;
  const known = new Set(questions.map((q) => q.id));

  for (const key of Object.keys(given)) {
    if (!known.has(key)) return `Unknown question: ${key}`;
  }

  for (const question of questions) {
    const answer = given[question.id];
    const blank = answer === undefined || answer === null || answer === '';

    if (blank) {
      if (question.required) return `Please answer: ${question.label}`;
      continue;
    }

    if (question.type === 'scale') {
      const max = question.max ?? 5;
      if (typeof answer !== 'number' || !Number.isInteger(answer) || answer < 1 || answer > max) {
        return `Answer to "${question.label}" must be a whole number from 1 to ${max}.`;
      }
    }

    if (question.type === 'choice') {
      if (typeof answer !== 'string' || !(question.options ?? []).includes(answer)) {
        return `Answer to "${question.label}" is not one of the options.`;
      }
    }

    if (question.type === 'text') {
      if (typeof answer !== 'string') return `Answer to "${question.label}" must be text.`;
      if (answer.length > 2000) return 'That answer is too long.';
    }
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const checkin = await loadCheckin(code);

    if (!checkin || checkin.status === 'draft') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (checkin.status === 'closed') {
      return NextResponse.json(
        { error: 'closed', message: 'This check-in is closed. Nothing was recorded.' },
        { status: 409 },
      );
    }

    const body = await request.json().catch(() => null);
    const answers = (body as { answers?: unknown } | null)?.answers;

    const problem = validate(checkin.questions, answers);
    if (problem) {
      return NextResponse.json({ error: 'invalid', message: problem }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { count, error: countError } = await supabase
      .from('partner_checkin_responses')
      .select('id', { count: 'exact', head: true })
      .eq('checkin_id', checkin.id);

    if (countError) throw new Error(`Could not count responses: ${countError.message}`);

    if ((count ?? 0) >= MAX_RESPONSES) {
      return NextResponse.json(
        { error: 'full', message: 'This check-in has stopped taking responses.' },
        { status: 409 },
      );
    }

    // Checked, not discarded. A survey that thanks somebody while storing
    // nothing is the bug this codebase has shipped eight times.
    const { error: insertError } = await supabase
      .from('partner_checkin_responses')
      .insert({ checkin_id: checkin.id, answers: answers as CheckinAnswers });

    if (insertError) throw new Error(`Could not save the response: ${insertError.message}`);

    // The answer is safely stored by this point. If publishing the goal fails,
    // the respondent is still done, and saying otherwise would make them submit
    // twice and count twice. It is logged and returned so a browser pass can see
    // it, but it is never their problem to solve.
    let goal: Awaited<ReturnType<typeof publishCheckinGoal>> | null = null;
    try {
      goal = await publishCheckinGoal(supabase, checkin);
    } catch (goalError) {
      console.error('[check-in] response saved but the goal did not update:', goalError);
    }

    return NextResponse.json({
      success: true,
      goalWritten: goal?.written ?? false,
      goalSkippedBecause: goal?.written ? undefined : goal?.reason ?? 'error',
      responseCount: goal?.responseCount ?? (count ?? 0) + 1,
    });
  } catch (error) {
    console.error('[check-in] POST failed:', error);
    return NextResponse.json(
      { error: 'server_error', message: 'Something went wrong and nothing was saved. Please try again.' },
      { status: 500 },
    );
  }
}
