// ---------------------------------------------------------------------------
// What happens after somebody answers a question.
//
// An action item can ask a question. Closing it forces an answer and forces the
// answerer to say what that answer means, using one of three words: proceed,
// stop_path, still_blocked. That gate works and it is strict.
//
// Only one of the three words did anything.
//
//   stop_path      closed the opportunity. Acted on.
//   proceed        recorded. Nothing happened.
//   still_blocked  recorded. Nothing happened.
//
// So the shape of the failure was: Bella answers, the answer is written down
// faithfully, and the work stops. Measured on 11 September 2026 across every
// answer ever given. Four questions had been answered. Three said stop and all
// three closed correctly. One said proceed: St. Peter Chanel, where she
// confirmed on 9 September that the window was open and closes 1 October.
// Nothing was created. No next step, nobody holding it, and under three weeks
// left on a live window.
//
// This file is the single answer to "what do we owe after an answer". The
// route calls it for all three outcomes, including stop_path, so there is one
// place to read rather than one rule inline and two missing.
//
// The next step is derived from what was being asked, not invented. A question
// is asked for a reason and its category records that reason:
//
//   gate           can we pursue this at all. Cleared, so build the thing.
//   documentation  we need facts to apply. Got them, so use them.
//   follow_up      did the school actually submit. They did, so watch for the
//                  decision.
//
// A "still stuck" answer must come back rather than going quiet, and after it
// has come back twice it stops being a chase and becomes a decision for Rae.
// Asking a third time is how a question becomes furniture.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/** Matches lib/funding-followups.ts. TDI work is owned by TDI, never the school. */
const TDI_OWNER_EMAIL = 'hello@teachersdeserveit.com';
const TDI_OWNER_NAME = 'Bella';
const RAE_OWNER_EMAIL = 'rae@teachersdeserveit.com';
const RAE_OWNER_NAME = 'Rae';

/** How long before an unresolved question comes back. */
const RE_ASK_DAYS = 5;

/** Coming back a third time is not a chase any more. It is a decision. */
const RE_ASK_LIMIT = 2;

/** A cleared block should be picked up now, not filed. */
const RESUME_DAYS = 2;

/** Funders take months. Checking sooner just creates a task that says "no news". */
const DECISION_WATCH_DAYS = 30;

export type AnswerOutcome = 'proceed' | 'stop_path' | 'still_blocked';

export const VALID_OUTCOMES: AnswerOutcome[] = ['proceed', 'stop_path', 'still_blocked'];

interface PlannedItem {
  title: string;
  description: string;
  ownerType: 'tdi' | 'rae';
  dueInDays: number;
  requiresAnswer: boolean;
  category: string;
  /** Counts re-asks so this module can tell when to stop chasing. */
  reAskCount?: number;
}

export interface AnswerPlan {
  /** The opportunity should be closed and the reason recorded on it. */
  closesPath: boolean;
  /** Work to create. Empty is a real answer, but only for stop_path. */
  items: PlannedItem[];
  /** Plain sentence the UI can show her, so the reply confirms what happened. */
  because: string;
}

export interface AnswerContext {
  outcome: AnswerOutcome;
  /** The question that was asked, used when it has to be asked again. */
  questionTitle: string;
  answer: string | null;
  /** Why the question existed: gate, documentation, follow_up. */
  category?: string | null;
  /** The funder's own name, as a school would recognise it. */
  grantName?: string | null;
  /** The school, for titles a person can scan without opening the record. */
  schoolName?: string | null;
  /** How many times this question has already come back unresolved. */
  priorReAsks?: number;
}

function subject(ctx: AnswerContext): string {
  return ctx.grantName?.trim() || 'this grant';
}

/**
 * Decides what an answer means for the work. Pure, so it can be proved.
 *
 * Kept separate from the writing because the thing worth testing is the
 * judgement, and a rule that can only be checked by running it against
 * production is a rule nobody checks.
 */
export function planAfterAnswer(ctx: AnswerContext): AnswerPlan {
  const what = subject(ctx);
  const where = ctx.schoolName?.trim();
  const said = (ctx.answer || '').trim();
  const quoted = said ? `The answer was: "${said}".` : 'No answer text was recorded.';

  if (ctx.outcome === 'stop_path') {
    return {
      closesPath: true,
      items: [],
      because: `${what} is closed and the answer is kept on it, so it can be reopened if the facts change.`,
    };
  }

  if (ctx.outcome === 'still_blocked') {
    const prior = ctx.priorReAsks ?? 0;

    if (prior >= RE_ASK_LIMIT) {
      return {
        closesPath: false,
        items: [
          {
            title: `Decide what to do about ${what}${where ? ` for ${where}` : ''}`,
            description:
              `This question has come back ${prior} times without resolving: "${ctx.questionTitle}". ` +
              `${quoted} Asking again will not change it. ` +
              `The choice is to drop this path, find another way to answer it, or go ahead without the answer and accept the risk.`,
            ownerType: 'rae',
            dueInDays: RE_ASK_DAYS,
            requiresAnswer: true,
            category: 'gate',
          },
        ],
        because: `Asked ${prior} times without resolving, so it is now a decision for Rae rather than another chase.`,
      };
    }

    return {
      closesPath: false,
      items: [
        {
          title: ctx.questionTitle,
          description:
            `Still unresolved after the last attempt. ${quoted} ` +
            `Try a different route to the answer rather than repeating the same ask.`,
          ownerType: 'tdi',
          dueInDays: RE_ASK_DAYS,
          requiresAnswer: true,
          category: ctx.category || 'gate',
          reAskCount: prior + 1,
        },
      ],
      because: `It comes back in ${RE_ASK_DAYS} days rather than going quiet.`,
    };
  }

  // proceed. The block is gone, so the work resumes. What the work is depends
  // on what the question was for.
  const category = (ctx.category || '').trim();

  if (category === 'follow_up') {
    return {
      closesPath: false,
      items: [
        {
          title: `Track the ${what} decision`,
          description:
            `The application is in. ${quoted} ` +
            `Watch for the funder's decision and record it against this grant when it lands.`,
          ownerType: 'tdi',
          dueInDays: DECISION_WATCH_DAYS,
          requiresAnswer: true,
          category: 'follow_up',
        },
      ],
      because: `It is submitted, so the next thing we owe is watching for the decision.`,
    };
  }

  if (category === 'documentation') {
    return {
      closesPath: false,
      items: [
        {
          title: `Use what came back to finish the ${what} application`,
          description:
            `The information we were missing has arrived. ${quoted} ` +
            `Put it into the application and move it to the next stage.`,
          ownerType: 'tdi',
          dueInDays: RESUME_DAYS,
          requiresAnswer: false,
          category: 'documentation',
        },
      ],
      because: `The missing information is in, so the application can be finished.`,
    };
  }

  // gate, or anything else that was blocking the pursuit.
  return {
    closesPath: false,
    items: [
      {
        title: `${what} is clear to pursue${where ? ` for ${where}` : ''}. Prepare the application.`,
        description:
          `This was waiting on "${ctx.questionTitle}". ${quoted} ` +
          `Nothing is blocking it now. Build the application package and get it to the school.`,
        ownerType: 'tdi',
        dueInDays: RESUME_DAYS,
        requiresAnswer: false,
        category: 'gate',
      },
    ],
    because: `Nothing is blocking it now, so the application is the next step.`,
  };
}

export interface ApplyInput extends AnswerContext {
  actionId: string;
  pursuitId: string;
  opportunityId?: string | null;
  answeredBy?: string | null;
  now?: Date;
}

export interface ApplyResult {
  created: number;
  titles: string[];
  pathStopped: { opportunityId: string; reason: string } | null;
  /** Already had this work open, so nothing was added. */
  skipped: boolean;
  because: string;
  error?: string;
}

/**
 * Carries out the plan.
 *
 * Every write here reports its error. The answer is already saved by the time
 * this runs, so a swallowed failure leaves a question answered and a next step
 * that silently never existed, which is the exact bug this file was written to
 * end.
 */
export async function applyAnswerOutcome(
  supabase: DbClient,
  input: ApplyInput
): Promise<ApplyResult> {
  const now = input.now ?? new Date();
  const plan = planAfterAnswer(input);

  let pathStopped: ApplyResult['pathStopped'] = null;

  if (plan.closesPath && input.opportunityId) {
    const why = [
      input.answer ? `"${input.answer}"` : null,
      input.answeredBy ? `answered by ${input.answeredBy}` : null,
      input.questionTitle ? `in reply to: ${input.questionTitle}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    const { error: stopErr } = await supabase
      .from('funding_opportunities')
      .update({
        status: 'closed',
        eligibility_verdict: 'stop',
        eligibility_reason: why || 'Stopped by an answer recorded against this path.',
        eligibility_rule: 'answered',
        eligibility_checked_at: now.toISOString(),
      })
      .eq('id', input.opportunityId);

    if (stopErr) {
      return {
        created: 0,
        titles: [],
        pathStopped: null,
        skipped: false,
        because: plan.because,
        error: `The answer said stop but the path did not close: ${stopErr.message}`,
      };
    }
    pathStopped = { opportunityId: input.opportunityId, reason: why };
  }

  if (plan.items.length === 0) {
    return { created: 0, titles: [], pathStopped, skipped: false, because: plan.because };
  }

  // Never stack the same next step twice. An answer can be edited, and a
  // second edit should not produce a second copy of the work.
  //
  // The item being answered is excluded. A question that comes back keeps its
  // own wording, so without this the re-ask matches the very item that
  // triggered it and is dropped as a duplicate: the answer would be recorded
  // and the question would silently never return.
  const { data: existing, error: readErr } = await supabase
    .from('funding_action_items')
    .select('id, title')
    .eq('pursuit_id', input.pursuitId)
    .neq('id', input.actionId)
    .in('status', ['pending', 'in_progress', 'blocked']);

  if (readErr) {
    return {
      created: 0,
      titles: [],
      pathStopped,
      skipped: false,
      because: plan.because,
      error: `Could not check for work already open: ${readErr.message}`,
    };
  }

  const openTitles = new Set((existing || []).map((r: any) => String(r.title)));
  const wanted = plan.items.filter((i) => !openTitles.has(i.title));

  if (wanted.length === 0) {
    return { created: 0, titles: [], pathStopped, skipped: true, because: plan.because };
  }

  const day = (d: Date) => d.toISOString().split('T')[0];

  const rows = wanted.map((i) => ({
    pursuit_id: input.pursuitId,
    opportunity_id: input.opportunityId ?? null,
    // owner_type answers "ours or the school's" and accepts only 'tdi' or
    // 'client'. A decision for Rae is still ours, so the person is carried in
    // owner_name. Writing 'rae' here fails a check constraint, which is how
    // this was found: the plan was right and the insert was rejected.
    owner_type: 'tdi',
    owner_name: i.ownerType === 'rae' ? RAE_OWNER_NAME : TDI_OWNER_NAME,
    owner_email: i.ownerType === 'rae' ? RAE_OWNER_EMAIL : TDI_OWNER_EMAIL,
    status: 'pending',
    category: i.category,
    action_size: 'light',
    title: i.title,
    description: i.description,
    due_date: day(new Date(now.getTime() + i.dueInDays * 86400000)),
    requires_answer: i.requiresAnswer,
    // Carried on the row so the next "still stuck" knows how many times this
    // has already come round. Without it the count resets and the question
    // chases forever.
    reminder_count: i.reAskCount ?? 0,
  }));

  const { error: insertErr } = await supabase.from('funding_action_items').insert(rows);

  if (insertErr) {
    return {
      created: 0,
      titles: [],
      pathStopped,
      skipped: false,
      because: plan.because,
      error: `The answer was saved but the next step was not created: ${insertErr.message}`,
    };
  }

  return {
    created: rows.length,
    titles: rows.map((r) => String(r.title)),
    pathStopped,
    skipped: false,
    because: plan.because,
  };
}
