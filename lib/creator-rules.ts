// ---------------------------------------------------------------------------
// What happens next to a creator's step, declared once.
//
// The counterpart to lib/funding-rules.ts, and written the same way and for the
// same reason: every bug found in Creator Studio this year was a rule nobody
// had written down, so each screen and each route invented its own version and
// they quietly disagreed.
//
// Three publish paths existed and only one checked whether the creator had
// signed their agreement, so three creators went live unsigned. The admin view
// of a creator and the creator's own portal each computed progress separately,
// so the admin view sat three months behind. Both were fixed by making one
// place answer the question.
//
// This file changes no behaviour. It describes what runs today, including the
// parts that are wrong, so that fixing one becomes an edit to one row.
// ---------------------------------------------------------------------------

/**
 * There are two engines and only one of them is running.
 *
 * `lib/creator-step-engine.ts` is the intended one: project scoped, filters
 * retired steps, places a board forward only, caps feedback rounds, sets
 * clocks. It sits behind the `step_engine` flag in `creator_config`.
 *
 * That flag has been **off since 26 August 2026**, so every caller falls
 * through to `lib/milestone-progression.ts`, which is a fifth of the size and
 * does none of those things.
 *
 * Two pieces of data block turning it on, both verified 1 September 2026:
 *
 *   One active creator has 34 step rows and no project at all. The step engine
 *   refuses a step with no project, so their portal would break.
 *
 *   39 step rows across active creators are marked completed with neither a
 *   timestamp nor a person recorded. Nobody can tell from the table whether
 *   those steps happened, and that is a question for a person, not a migration.
 *
 * Recording it here rather than in a comment nobody finds, because the next
 * person to read this file needs to know which engine they are reasoning about.
 */
export const STEP_ENGINE_FLAG = 'step_engine' as const;

/**
 * Every value `creator_milestones.status` can hold.
 *
 * Constrained in the database as of 2 September 2026, matching the constraint
 * `review_status` has carried all along. Before that the column accepted
 * anything, which mattered because twenty-two files write this table directly
 * and the step engine that would centralise them is switched off.
 *
 * A wrong value never errored. It stored, and was then understood by nothing:
 * the step would disappear from the creator's journey, from the team queue and
 * from every progress count, while still sitting in the table.
 *
 * Keep this list and the constraint in step. Adding a value here without adding
 * it there produces a write that fails in production and passes every test.
 */
export type StepStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed';

/** Who owes the next move while a step sits in this state. */
export type StepOwner = 'creator' | 'tdi' | null;

export interface StepRule {
  status: StepStatus;
  owner: StepOwner;
  /** One sentence a person can read. */
  meaning: string;
  /** Rows carrying this status among active creators, 1 September 2026. */
  observed: number;
  /**
   * Hours this may sit before waiting stops counting as progress, or null for
   * forever. Every value here is null today, which is the same gap the funding
   * side had before it was closed, and is why a creator can sit untouched for
   * months without anything saying so.
   *
   * Still true on 2 September 2026. The funding equivalent now expires drafts
   * at 72 hours, QA at 24 and a person's decision at 48; nothing here expires
   * at all, so no clock anywhere says a step has gone quiet.
   */
  expiresHours: number | null;
}

/** Feedback rounds a creator gets on one step before it is force approved. */
export const MAX_FEEDBACK_ROUNDS = 2;

export const STEP_RULES: Record<StepStatus, StepRule> = {
  locked: {
    status: 'locked',
    owner: null,
    meaning: 'Not their turn yet, and not ours. Nothing is owed on a locked step.',
    observed: 684,
    expiresHours: null,
  },
  available: {
    status: 'available',
    owner: 'creator',
    meaning: 'Open in front of the creator. Theirs to do.',
    observed: 21,
    expiresHours: null,
  },
  in_progress: {
    status: 'in_progress',
    owner: 'creator',
    meaning: 'They have started it.',
    observed: 0,
    expiresHours: null,
  },
  waiting_approval: {
    status: 'waiting_approval',
    owner: 'tdi',
    meaning: 'They have submitted and it is waiting on us to approve or send back.',
    observed: 2,
    expiresHours: null,
  },
  completed: {
    status: 'completed',
    owner: null,
    meaning: 'Done. Nothing is owed.',
    observed: 201,
    expiresHours: null,
  },
};

/**
 * The second axis, written only by the step engine.
 *
 * `review_status` has a check constraint and a full vocabulary, and it is null
 * on 905 of 908 rows because the engine that populates it is switched off.
 * Three rows carry 'submitted'. Anyone reasoning about review state today is
 * reasoning about a column that is almost entirely empty.
 */
export type ReviewStatus =
  | 'submitted'
  | 'under_review'
  | 'feedback_ready'
  | 'revised'
  | 'approved'
  | 'changes_requested';

// ── Readers ────────────────────────────────────────────────────────────────

export function stepRuleFor(status: string | null | undefined): StepRule | null {
  if (!status) return null;
  return STEP_RULES[status as StepStatus] ?? null;
}

/** Who owes the next move. null means nothing is owed, not that nobody owns it. */
export function stepOwner(status: string | null | undefined): StepOwner {
  return stepRuleFor(status)?.owner ?? null;
}

/** True when the creator is the one being waited on. */
export function waitingOnCreator(status: string | null | undefined): boolean {
  return stepOwner(status) === 'creator';
}

/** True when we are the ones holding it up. */
export function waitingOnUs(status: string | null | undefined): boolean {
  return stepOwner(status) === 'tdi';
}

/**
 * A status the application understands.
 *
 * There is no database constraint on this column, so this is the only place
 * that says what is valid. Worth calling before writing a status that came
 * from outside this file.
 */
export function isKnownStepStatus(status: string | null | undefined): status is StepStatus {
  return !!status && status in STEP_RULES;
}

/**
 * Somebody owes a move on this step right now.
 *
 * Exactly the statuses whose owner is not null: available and in_progress are
 * the creator's, waiting_approval is ours. Locked and completed owe nothing.
 *
 * Derived from the table rather than listed again, because this same triple was
 * written out by hand in several callers and a list repeated by hand is a list
 * that eventually disagrees with itself.
 */
export function isActionable(status: string | null | undefined): boolean {
  return stepOwner(status) !== null;
}

/**
 * Whether a step counts as finished for progress purposes.
 *
 * Kept as a function rather than a comparison scattered through the callers,
 * because "done" has been computed at least three different ways in this
 * codebase and the counts disagreed.
 */
export function isFinished(status: string | null | undefined): boolean {
  return status === 'completed';
}
