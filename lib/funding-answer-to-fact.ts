// ---------------------------------------------------------------------------
// Ask once. Write the answer down. Never ask twice.
//
// Of eight approaches we made to one superintendent, six were repeats of two
// questions. Whether any of his staff hold the union membership one grant
// requires was first asked on 23 July and answered on 11 September, chased
// three times in between. Whether his school carries a federal identification
// was asked on 17 August and answered on 8 September, chased four times, and
// one of those chases arrived twice inside ten seconds.
//
// He answered both. The problem was never that he ignored us.
//
// Two mechanics produce the repetition.
//
// ONE. An answer lands in `funding_action_items.answer` and stops there. The
// eligibility screen reads school facts from `funding_pursuits.school_profile`,
// so an answer that resolves a question never reaches the field that would stop
// the question being asked. The next monthly audit screens the same path, gets
// the same verdict, and raises the same question.
//
// TWO. The audit's idempotence check only looks for a question that is still
// open. Once answered, the row is terminal and invisible to it, so nothing
// remembers that we already have the answer.
//
// This file fixes both ends. On answering, the answer is written into the field
// the screen reads and recorded as a school fact with provenance. On screening,
// a question that has been answered before is never asked of the school again.
// ---------------------------------------------------------------------------

import { QUESTION_BY_RULE } from './funding-eligibility';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/**
 * The questions whose answers are facts about the school, and where each one
 * lives.
 *
 * `profileKey` is the field the eligibility screen actually reads, so writing
 * it is what stops the question recurring. `factKey` is the row in
 * school_facts, which is the record a person and QA read.
 *
 * Only two rules qualify. A window question is a fact about the funder, TDI
 * authorization is a fact about us and belongs in tdi_facts, and sector is
 * already a column on the pursuit. Mapping those here would be tidy and wrong.
 */
const ANSWERABLE: Record<string, { profileKey: string; factKey: string }> = {
  named_applicant: { profileKey: 'nea_member_name', factKey: 'named_applicant' },
  designation: { profileKey: 'designation', factKey: 'designation' },
};

/**
 * Recover which rule a question came from, by its wording.
 *
 * The titles are generated from QUESTION_BY_RULE, so matching against that map
 * is exact rather than a guess. Titles also appear prefixed with the grant
 * name by `eligibilityQuestionTitle`, which is why this is a contains test and
 * not an equality test.
 */
export function ruleForQuestion(title: string): string | null {
  const t = (title ?? '').trim();
  if (!t) return null;
  for (const [rule, question] of Object.entries(QUESTION_BY_RULE)) {
    if (t === question || t.includes(question)) return rule;
  }
  return null;
}

export function factTargetForQuestion(
  title: string,
): { rule: string; profileKey: string; factKey: string } | null {
  const rule = ruleForQuestion(title);
  if (!rule) return null;
  const target = ANSWERABLE[rule];
  return target ? { rule, ...target } : null;
}

export interface RecordFactInput {
  pursuitId: string;
  questionTitle: string;
  /** Undefined is tolerated as well as null: callers pass optional columns straight through. */
  answer?: string | null;
  answeredBy?: string | null;
  now?: Date;
}

export interface RecordFactResult {
  /** Null when this question's answer is not a school fact. */
  factKey: string | null;
  wroteProfile: boolean;
  wroteFact: boolean;
  error?: string;
}

/**
 * Write an answer into the field the screen reads, and record it as a fact.
 *
 * The profile write is the one that changes behaviour. The fact row is the one
 * that makes the answer auditable: it carries who said it and when, and
 * `school_stated` is the honest origin, because the school telling us something
 * is not the same as us verifying it. QA already refuses to cite a fact that is
 * not `known`, so this cannot leak into an application as a verified figure.
 */
export async function recordAnswerAsFact(
  supabase: DbClient,
  input: RecordFactInput,
): Promise<RecordFactResult> {
  const target = factTargetForQuestion(input.questionTitle);
  if (!target) return { factKey: null, wroteProfile: false, wroteFact: false };

  const value = (input.answer ?? '').trim();
  if (!value) {
    return {
      factKey: target.factKey,
      wroteProfile: false,
      wroteFact: false,
      error: 'The outcome was recorded but the answer text was empty, so there was nothing to write down.',
    };
  }

  const now = input.now ?? new Date();

  // ── the field the screen reads ──
  const { data: pursuit, error: readErr } = await supabase
    .from('funding_pursuits')
    .select('school_profile')
    .eq('id', input.pursuitId)
    .single();

  if (readErr) {
    return {
      factKey: target.factKey,
      wroteProfile: false,
      wroteFact: false,
      error: `Could not read the school profile to write the answer into it: ${readErr.message}`,
    };
  }

  // Double encoded in places, which is why this tolerates both.
  const profile = (() => {
    try {
      const raw = pursuit?.school_profile;
      if (!raw) return {} as Record<string, unknown>;
      const once = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return (typeof once === 'string' ? JSON.parse(once) : once) as Record<string, unknown>;
    } catch {
      return {} as Record<string, unknown>;
    }
  })();

  const { error: profileErr } = await supabase
    .from('funding_pursuits')
    .update({ school_profile: { ...profile, [target.profileKey]: value } })
    .eq('id', input.pursuitId);

  if (profileErr) {
    return {
      factKey: target.factKey,
      wroteProfile: false,
      wroteFact: false,
      error: `The answer was recorded but not written into the school profile, so the question will be asked again: ${profileErr.message}`,
    };
  }

  // ── the record a person reads ──
  //
  // Supersede rather than overwrite. A school changing its answer is history
  // worth keeping, and school_facts is built for it.
  const { error: supersedeErr } = await supabase
    .from('school_facts')
    .update({ superseded_at: now.toISOString() })
    .eq('pursuit_id', input.pursuitId)
    .eq('key', target.factKey)
    .is('superseded_at', null);

  if (supersedeErr) {
    return {
      factKey: target.factKey,
      wroteProfile: true,
      wroteFact: false,
      error: `Wrote the profile but could not supersede the old fact: ${supersedeErr.message}`,
    };
  }

  const { error: insertErr } = await supabase.from('school_facts').insert({
    pursuit_id: input.pursuitId,
    key: target.factKey,
    status: 'unverified',
    value,
    origin: 'school_stated',
    source: `Answered by the school in reply to: ${input.questionTitle}`.slice(0, 500),
    verified_on: null,
    verified_by: input.answeredBy ?? null,
  });

  if (insertErr) {
    return {
      factKey: target.factKey,
      wroteProfile: true,
      wroteFact: false,
      error: `Wrote the profile but could not record the fact: ${insertErr.message}`,
    };
  }

  return { factKey: target.factKey, wroteProfile: true, wroteFact: true };
}

export interface PriorAnswer {
  id: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
  outcome: string | null;
}

/**
 * Has this school already answered this question, on any grant?
 *
 * Keyed on the pursuit and the rule, not on the opportunity, because these are
 * facts about the school rather than about one application. His union
 * membership does not change between grants, so asking again on the next grant
 * is the same question wearing a different grant name.
 *
 * An outcome of `still_blocked` does not count as answered. That is the school
 * telling us they cannot resolve it, and re-asking them is exactly as useless
 * as it sounds, but it is also not an answer we can screen on.
 */
export async function answeredBefore(
  supabase: DbClient,
  pursuitId: string,
  questionTitle: string,
): Promise<{ prior: PriorAnswer | null; error?: string }> {
  const rule = ruleForQuestion(questionTitle);
  if (!rule) return { prior: null };

  // Only durable facts about the school are asked once. This restriction was
  // added after the first dry run, which suppressed a window question for
  // Baton Rouge Area Foundation answered on 9 September with "confirmed closed
  // until ~Feb 2027". Never asking that again would mean never revisiting it,
  // and the answer is explicitly temporary.
  //
  // A funder's window and its viability already have their own expiry: the
  // research agent rechecks a window after 14 days, and a non-continuation
  // finding lapses after 180. Those mechanisms are the right ones for answers
  // that go stale. Whether a school holds a union membership does not go stale
  // between grants, which is why only those rules are listed in ANSWERABLE.
  if (!ANSWERABLE[rule]) return { prior: null };

  const question = QUESTION_BY_RULE[rule];
  if (!question) return { prior: null };

  const { data, error } = await supabase
    .from('funding_action_items')
    .select('id, answer, answered_by, answered_at, outcome, title')
    .eq('pursuit_id', pursuitId)
    .not('answered_at', 'is', null)
    .order('answered_at', { ascending: false })
    .limit(50);

  // Never swallowed. Failing to find a prior answer and failing to look are
  // opposite things, and treating the second as the first is what makes us ask
  // a superintendent the same question for the seventh time.
  if (error) return { prior: null, error: error.message };

  const match = (data ?? []).find(
    (r: Record<string, unknown>) =>
      typeof r.title === 'string' &&
      (r.title === question || r.title.includes(question)) &&
      r.outcome !== 'still_blocked',
  );

  if (!match) return { prior: null };

  return {
    prior: {
      id: String(match.id),
      answer: (match.answer as string) ?? null,
      answeredBy: (match.answered_by as string) ?? null,
      answeredAt: (match.answered_at as string) ?? null,
      outcome: (match.outcome as string) ?? null,
    },
  };
}
