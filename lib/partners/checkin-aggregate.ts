/**
 * Turning check-in answers into the number on a school's goal.
 *
 * A check-in names one of its own questions and the answers that count as
 * success. The share of respondents who chose one of those answers is the
 * current_value of the partnership_kpis row it points at, so a staff meeting
 * moves the goal the principal sees rather than leaving it to be typed in later.
 *
 * Two rules worth keeping:
 *
 * 1. Below min_responses the goal is not touched. One teacher answering 5 would
 *    otherwise publish "100%" and the number would then fall for the rest of the
 *    year, which reads as regression when it is arithmetic.
 * 2. The denominator is people who answered that question, not people who opened
 *    the form. An unanswered goal question cannot count against the school.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type CheckinQuestionType = 'scale' | 'choice' | 'text';

export interface CheckinQuestion {
  id: string;
  type: CheckinQuestionType;
  label: string;
  /** Scale only: the words under 1 and under the top value. */
  low_label?: string;
  high_label?: string;
  /** Scale only. Defaults to 5. */
  max?: number;
  /** Choice only. */
  options?: string[];
  required?: boolean;
  /** Text only: placeholder shown in the box. */
  placeholder?: string;
}

export interface Checkin {
  id: string;
  partnership_id: string;
  code: string;
  title: string;
  intro: string | null;
  questions: CheckinQuestion[];
  kpi_key: string | null;
  goal_question_id: string | null;
  goal_values: (string | number)[] | null;
  min_responses: number;
  status: 'draft' | 'open' | 'closed';
}

export type CheckinAnswers = Record<string, string | number>;

export interface GoalTally {
  /** Responses that answered the goal question at all. */
  answered: number;
  /** Of those, how many chose a value that counts as success. */
  matched: number;
  /** matched over answered, rounded to a whole percent. Null when nobody answered. */
  percentage: number | null;
}

/**
 * Compare answers loosely on purpose. A scale answer arrives as the number 4
 * from the form and comes back out of jsonb as 4, but goal_values is authored by
 * hand in SQL and "4" is an easy thing to write. Comparing as strings means a
 * quoted 4 in the config still counts the answer it obviously means.
 */
function sameAnswer(a: string | number, b: string | number): boolean {
  return String(a) === String(b);
}

export function tallyGoal(
  responses: { answers: CheckinAnswers }[],
  goalQuestionId: string,
  goalValues: (string | number)[],
): GoalTally {
  let answered = 0;
  let matched = 0;

  for (const response of responses) {
    const answer = response.answers?.[goalQuestionId];
    if (answer === undefined || answer === null || answer === '') continue;
    answered += 1;
    if (goalValues.some((value) => sameAnswer(value, answer))) matched += 1;
  }

  return {
    answered,
    matched,
    percentage: answered > 0 ? Math.round((matched / answered) * 100) : null,
  };
}

/**
 * What a school leader needs to know about a check-in while running it.
 *
 * Hillary Russell's whole reason for wanting this sent to her rather than to her
 * staff was "that way I can ensure it gets done". A count is the thing that lets
 * her do that, and without it a thin turnout looks exactly like a broken form:
 * below min_responses the goal stays blank on purpose.
 */
export interface CheckinProgress {
  kpi_key: string;
  code: string;
  responses: number;
  min_responses: number;
  status: 'draft' | 'open' | 'closed';
}

/**
 * One sentence, in front of a principal, saying where the check-in stands.
 * `measured` is whether the goal already carries a number.
 */
export function checkinProgressLine(progress: CheckinProgress, measured: boolean): string {
  const { responses, min_responses: min } = progress;
  const people = responses === 1 ? '1 person has' : `${responses} of your team have`;

  if (measured) {
    return responses === 1
      ? 'Measured from 1 answer, and it updates as more come in.'
      : `Measured from ${responses} answers, and it updates as more come in.`;
  }

  if (responses === 0) {
    return `Nobody has answered yet. Your number appears once ${min} people have.`;
  }

  if (responses < min) {
    return `${people} answered. Your number appears once ${min} have, so that a handful of replies cannot speak for everyone.`;
  }

  // Enough answers but no number yet. Honest rather than reassuring: something
  // did not run, and saying "any moment now" would be a guess.
  return `${people} answered, which is enough, but the number has not come through. Tell Rae and she will look.`;
}

export interface PublishResult {
  /** Whether partnership_kpis.current_value was actually changed. */
  written: boolean;
  /** Why not, when it was not. Logged, never shown to a respondent. */
  reason?: 'no_goal_linked' | 'below_min_responses' | 'nobody_answered' | 'kpi_not_found';
  tally?: GoalTally;
  responseCount: number;
}

/**
 * Recompute and publish. Called after every submission: twelve rows is nothing
 * to aggregate, and doing it inline means there is no cron to forget.
 *
 * Throws on a database error rather than reporting success. A survey that says
 * "thank you" while writing nothing is the exact bug shape this codebase keeps
 * shipping, and the caller decides what the respondent sees.
 */
export async function publishCheckinGoal(
  supabase: SupabaseClient,
  checkin: Checkin,
): Promise<PublishResult> {
  const { data: responses, error: responsesError } = await supabase
    .from('partner_checkin_responses')
    .select('answers')
    .eq('checkin_id', checkin.id);

  if (responsesError) throw new Error(`Could not read responses: ${responsesError.message}`);

  const responseCount = responses?.length ?? 0;

  if (!checkin.kpi_key || !checkin.goal_question_id || !checkin.goal_values) {
    return { written: false, reason: 'no_goal_linked', responseCount };
  }

  if (responseCount < checkin.min_responses) {
    return { written: false, reason: 'below_min_responses', responseCount };
  }

  const tally = tallyGoal(
    (responses ?? []) as { answers: CheckinAnswers }[],
    checkin.goal_question_id,
    checkin.goal_values,
  );

  if (tally.percentage === null) {
    return { written: false, reason: 'nobody_answered', tally, responseCount };
  }

  // Named rather than upserted. partnership_kpis has one row per
  // (partnership_id, kpi_key) in practice but no unique index saying so, and an
  // upsert naming a target that does not exist answers 42P10 every time. That
  // bug shipped here before.
  const { data: updated, error: updateError } = await supabase
    .from('partnership_kpis')
    .update({ current_value: tally.percentage, updated_at: new Date().toISOString() })
    .eq('partnership_id', checkin.partnership_id)
    .eq('kpi_key', checkin.kpi_key)
    .select('id');

  if (updateError) throw new Error(`Could not write the goal: ${updateError.message}`);

  if (!updated || updated.length === 0) {
    return { written: false, reason: 'kpi_not_found', tally, responseCount };
  }

  return { written: true, tally, responseCount };
}
