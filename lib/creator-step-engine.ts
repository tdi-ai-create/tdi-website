// ---------------------------------------------------------------------------
// The one place that decides what step a creator is on.
//
// Before this there were three engines and they disagreed.
//
//   progressMilestone   walked to the next step by sort order, refused anything
//                       numbered 98 or higher, and matched on creator plus
//                       milestone with no project, so completing a step on one
//                       project completed it on the other one too.
//
//   placeCreator        placed from furthest completed work, ran only on
//                       unpause, and read every row a creator owned across all
//                       projects before locking all but one, which collapsed two
//                       projects into a single open step.
//
//   approve-milestone   464 lines with its own inline copy of the walk.
//
// Alongside them, 56 more places wrote status directly across 30 files. That is
// why "one step at a time" was fixed on 19 August and had come apart again by
// the 21st: nothing owned the invariant, so every feature quietly reasserted its
// own idea of what open meant.
//
// Everything here works on a milestone RECORD id, never on a creator plus a
// milestone id, because a creator on a second project has two rows for the same
// step and the pair does not identify one of them.
//
// Nothing imports this yet. It ships dark on purpose.
// ---------------------------------------------------------------------------

import { phaseRank } from './creator-phases';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/** Two rounds of feedback, then it approves. No step may open a third. */
export const MAX_FEEDBACK_ROUNDS = 2;

/**
 * Steps retired in the 26 August review. They still exist as rows on live boards
 * until the Phase 2 cleanup removes them, so the engine has to refuse to open one
 * rather than trusting the table to be clean.
 *
 * The outline cluster folds into `outline_drafted`, which now loops until it is
 * approved instead of being drafted, met about, and finalised as three steps.
 * The two `*_approved` team steps duplicated an approval that now happens inside
 * the review loop. `download_specs_submitted` merges into `download_drafted`, so
 * design receives the file and the specs describing it together.
 */
export const RETIRED_STEPS = new Set([
  'outline_meeting_scheduled',
  'outline_meeting_completed',
  'outline_finalized',
  'final_outline_meeting_scheduled',
  'final_outline_approved',
  'course_scripts_approved',
  'download_specs_submitted',
  'blog_topic_approved',
  'download_concept_approved',
  // Sort order 98 puts this after Content Launched and Download Goes Live, so
  // the step that sets a launch date fired after the launch. It was also
  // stamped complete by a migration for three creators who never launched.
  'launch_date_set',
]);

/**
 * The last step of a project. A finished project ends here rather than closing
 * silently, because the end of one project is where the next one starts.
 *
 * Answering it archives the project. Yes opens a new one; no leaves them on the
 * roster to be asked again later. Neither answer reopens anything.
 */
export const FINAL_STEP = 'create_again';

export type StepDecision = 'approve' | 'changes';

export interface StepRef {
  recordId: string;
  milestoneId: string;
  name: string;
  phaseId: string;
}

export interface AdvanceResult {
  ok: boolean;
  /**
   * What actually happened, which is not always what was asked for. A request
   * for changes on the final permitted round comes back as `forced_approve`, so
   * the caller can say something true to the creator rather than announcing
   * feedback that was never sent.
   */
  outcome: 'approved' | 'changes_requested' | 'forced_approve' | 'noop';
  /** The single step now open on this project, or null at the end of a path. */
  openStep: StepRef | null;
  /** Rounds used on the step that was just decided. */
  round: number;
  error?: string;
}

interface MilestoneRow {
  recordId: string;
  milestoneId: string;
  status: string;
  round: number;
  name: string;
  phaseId: string;
  sortOrder: number;
  appliesTo: string[] | null;
  collapsedInto: string | null;
  requiresTeamAction: boolean;
  allowanceDays: number;
  position: number;
}

function position(phaseId: string, sortOrder: number): number {
  // Phase first, then order within the phase. phaseRank sends an unknown phase
  // to the end rather than returning NaN, which is what silently corrupted the
  // sort when marketing_blog was missing from two of the four copies of this.
  return phaseRank(phaseId) * 1000 + (sortOrder ?? 0);
}

/**
 * Every path a creator can be on. There are two.
 *
 * A third, `blog`, was tagged on nine milestones but Confirm Your Path never
 * offered it, so nobody could become one. It was removed from the milestones
 * table on 26 August and the one project carrying it became a download. If it
 * ever comes back it has to come back as a real choice on the selector, not as
 * a tag nothing can produce.
 */
const ALL_PATHS = ['download', 'course'] as const;

function appliesToPath(m: { appliesTo: string[] | null }, contentPath: string | null): boolean {
  // An empty applies_to means course only, matching the column default.
  if (!m.appliesTo || m.appliesTo.length === 0) return contentPath === 'course';

  // A project with no path chosen yet gets the steps that are the same on every
  // path: intake, profile, agreement, and Confirm Your Path itself. Returning
  // false for everything here is what left five creators with no openable step,
  // stranding the four who have not chosen from ever being asked to.
  if (!contentPath) return ALL_PATHS.every((p) => m.appliesTo!.includes(p));

  return m.appliesTo.includes(contentPath);
}

/** A step the engine is willing to put a creator on. */
function isOpenable(m: MilestoneRow, contentPath: string | null): boolean {
  if (m.collapsedInto) return false;
  if (RETIRED_STEPS.has(m.milestoneId)) return false;
  return appliesToPath(m, contentPath);
}

async function loadProject(
  supabase: DbClient,
  projectId: string
): Promise<{ creatorId: string; contentPath: string | null; finished: boolean } | null> {
  const { data, error } = await supabase
    .from('creator_projects')
    .select('id, creator_id, content_path, status, completed_at')
    .eq('id', projectId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    creatorId: data.creator_id,
    contentPath: data.content_path ?? null,
    // A project that has already shipped is not placed anywhere. Without this
    // the engine puts Sue Thompson, who is published, back onto Launch Date Set.
    finished: data.status === 'completed' || data.completed_at !== null,
  };
}

async function loadBoard(supabase: DbClient, projectId: string): Promise<MilestoneRow[]> {
  const { data, error } = await supabase
    .from('creator_milestones')
    .select(
      'id, milestone_id, status, round, milestones!inner(name, phase_id, sort_order, applies_to, is_collapsed_into, requires_team_action, allowance_days)'
    )
    .eq('project_id', projectId);

  if (error || !data) return [];

  return (data as Array<Record<string, any>>).map((r) => {
    const m = r.milestones;
    return {
      recordId: r.id as string,
      milestoneId: r.milestone_id as string,
      status: r.status as string,
      round: (r.round as number) ?? 0,
      name: m.name as string,
      phaseId: m.phase_id as string,
      sortOrder: (m.sort_order as number) ?? 0,
      appliesTo: (m.applies_to as string[] | null) ?? null,
      collapsedInto: (m.is_collapsed_into as string | null) ?? null,
      requiresTeamAction: Boolean(m.requires_team_action),
      allowanceDays: (m.allowance_days as number) ?? 14,
      position: position(m.phase_id as string, (m.sort_order as number) ?? 0),
    };
  });
}

/**
 * Puts a project on exactly one open step and returns it.
 *
 * Placement is forward only. It opens the step after the furthest completed
 * work and never reopens anything finished, because taking the earliest
 * incomplete step instead would send people back to an agreement they signed
 * months ago.
 *
 * This is the only function that decides what is open, so `advanceStep` calls it
 * rather than keeping its own idea of what comes next. That is deliberate: the
 * previous two engines each had their own walk and they disagreed about where a
 * path ended.
 */
export async function placeProject(
  supabase: DbClient,
  projectId: string,
  opts: { startClock?: boolean; dryRun?: boolean } = {}
): Promise<{ ok: boolean; openStep: StepRef | null; locked: number; error?: string }> {
  const startClock = opts.startClock !== false;
  const dryRun = opts.dryRun === true;

  const project = await loadProject(supabase, projectId);
  if (!project) return { ok: false, openStep: null, locked: 0, error: 'Project not found' };

  const board = await loadBoard(supabase, projectId);
  if (board.length === 0) {
    return { ok: false, openStep: null, locked: 0, error: 'Project has no steps' };
  }

  // A finished project closes rather than being placed. Everything still hanging
  // open gets locked and nothing new is offered.
  if (project.finished) {
    const stale = board.filter((m) => m.status !== 'completed' && m.status !== 'locked');
    if (dryRun) return { ok: true, openStep: null, locked: stale.length };
    if (stale.length > 0) {
      const { error } = await supabase
        .from('creator_milestones')
        .update({ status: 'locked', updated_at: new Date().toISOString() })
        .in('id', stale.map((m) => m.recordId));
      if (error) return { ok: false, openStep: null, locked: 0, error: `Closing a finished board failed: ${error.message}` };
    }
    return { ok: true, openStep: null, locked: stale.length };
  }

  const openable = board.filter((m) => isOpenable(m, project.contentPath));
  if (openable.length === 0) {
    return { ok: false, openStep: null, locked: 0, error: 'No applicable steps for this path' };
  }

  const furthestDone = openable
    .filter((m) => m.status === 'completed')
    .reduce((max, m) => (m.position > max ? m.position : max), -1);

  const next = openable
    .filter((m) => m.status !== 'completed' && m.position > furthestDone)
    .sort((a, b) => a.position - b.position)[0];

  // Everything applicable is finished. Leave the board alone rather than
  // inventing a step to put them on.
  if (!next) {
    // Anything still hanging open on a finished board gets closed, whatever
    // state it is in. Ian Bowen is published and still carrying eight of these.
    const stale = board.filter((m) => m.status !== 'completed' && m.status !== 'locked');
    if (dryRun) return { ok: true, openStep: null, locked: stale.length };
    if (stale.length > 0) {
      const { error } = await supabase
        .from('creator_milestones')
        .update({ status: 'locked', updated_at: new Date().toISOString() })
        .in('id', stale.map((m) => m.recordId));
      if (error) return { ok: false, openStep: null, locked: 0, error: `Closing the board failed: ${error.message}` };
    }
    return { ok: true, openStep: null, locked: stale.length };
  }

  // Everything unfinished on this project that is not the chosen step gets
  // locked, including steps this path does not use and steps that were retired.
  // Scoped to project_id, which is the bug both previous engines had.
  const toLock = board
    .filter((m) => m.status !== 'completed' && m.recordId !== next.recordId && m.status !== 'locked')
    .map((m) => m.recordId);

  // The dry run computes the full decision and reports it, skipping every write.
  // It exits here rather than at the top so it has exercised the real path:
  // the same project load, the same board, the same applicability filter, and
  // the same choice of next step.
  if (dryRun) {
    return {
      ok: true,
      locked: toLock.length,
      openStep: { recordId: next.recordId, milestoneId: next.milestoneId, name: next.name, phaseId: next.phaseId },
    };
  }

  if (toLock.length > 0) {
    const { error } = await supabase
      .from('creator_milestones')
      .update({ status: 'locked', updated_at: new Date().toISOString() })
      .in('id', toLock);
    if (error) return { ok: false, openStep: null, locked: 0, error: `Locking failed: ${error.message}` };
  }

  // Opening the step. The clock is NOT set here.
  //
  // A trigger, creator_milestones_set_clock, fires BEFORE UPDATE OF status and
  // stamps opened_at and due_on on any transition into available, using the
  // step's own allowance_days and correctly leaving due_on null for team steps.
  // It overwrites anything passed in the same statement, so setting the dates
  // here does nothing and reads as though it works.
  //
  // That matters for pause. A paused creator is meant to get a correct board
  // with no clock on it, and the trigger will give them a deadline regardless.
  // So the clock is cleared afterwards, in a statement that does not touch
  // status and therefore does not re-fire the trigger.
  //
  // When every writer has moved onto this engine, the trigger should retire and
  // the dates move back into this function. Until then it is the safety net for
  // the other writers and has to keep working.
  const { error: openError } = await supabase
    .from('creator_milestones')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', next.recordId);

  if (openError) {
    return { ok: false, openStep: null, locked: toLock.length, error: `Opening the step failed: ${openError.message}` };
  }

  if (!startClock) {
    const { error: clockError } = await supabase
      .from('creator_milestones')
      .update({ due_on: null, opened_at: null, updated_at: new Date().toISOString() })
      .eq('id', next.recordId);

    if (clockError) {
      // A paused creator silently carrying a deadline is exactly the outcome
      // this exists to prevent, so it fails loudly rather than being logged.
      return {
        ok: false,
        openStep: null,
        locked: toLock.length,
        error: `The step opened but its clock could not be cleared: ${clockError.message}`,
      };
    }
  }

  return {
    ok: true,
    locked: toLock.length,
    openStep: { recordId: next.recordId, milestoneId: next.milestoneId, name: next.name, phaseId: next.phaseId },
  };
}

/**
 * Records a decision on one step and moves the project accordingly.
 *
 * This is the only function permitted to complete a step or open the next one.
 * Every route that approves work, requests changes, or advances a creator calls
 * this and does not write status itself.
 *
 * The two round cap lives here rather than in each caller, so a third round is
 * impossible rather than merely discouraged. Asking for changes on the last
 * permitted round approves instead and says so in `outcome`, which the caller
 * must check before telling a creator that feedback is on its way.
 */
export async function advanceStep(
  supabase: DbClient,
  params: {
    milestoneRecordId: string;
    decision: StepDecision;
    /** Who decided. Comes from the session, never from a request body. */
    actor: string;
    /** Whether to stamp a due date on whatever opens next. Off for paused creators. */
    startClock?: boolean;
  }
): Promise<AdvanceResult> {
  const { milestoneRecordId, decision, actor, startClock = true } = params;
  const now = new Date().toISOString();

  const { data: row, error: readError } = await supabase
    .from('creator_milestones')
    .select('id, creator_id, project_id, milestone_id, status, round, milestones!inner(name, allowance_days)')
    .eq('id', milestoneRecordId)
    .maybeSingle();

  if (readError) return { ok: false, outcome: 'noop', openStep: null, round: 0, error: readError.message };
  if (!row) return { ok: false, outcome: 'noop', openStep: null, round: 0, error: 'Step not found' };
  if (!row.project_id) {
    // Every row carries a project as of the 26 August backfill. One without a
    // project cannot be placed, because placement is scoped to a project.
    return { ok: false, outcome: 'noop', openStep: null, round: 0, error: 'Step has no project' };
  }

  const round = (row.round as number) ?? 0;

  // The cap. A request for changes on the final round becomes an approval,
  // because no creator is sent back to the portal a third time.
  const capReached = decision === 'changes' && round >= MAX_FEEDBACK_ROUNDS;
  const effective: StepDecision = capReached ? 'approve' : decision;

  if (effective === 'changes') {
    // The clock restarts here, giving them the step's full allowance again to
    // revise. The set_step_clock trigger does that on the transition back into
    // available, so no dates are set in this statement: anything passed would
    // be overwritten by the identical value and read as though it mattered.
    const { error } = await supabase
      .from('creator_milestones')
      .update({
        status: 'available',
        review_status: 'changes_requested',
        round: round + 1,
        updated_at: now,
      })
      .eq('id', milestoneRecordId);

    if (error) return { ok: false, outcome: 'noop', openStep: null, round, error: error.message };

    // Nothing downstream opens. The step they are on is the step they stay on.
    return {
      ok: true,
      outcome: 'changes_requested',
      round: round + 1,
      openStep: {
        recordId: row.id as string,
        milestoneId: row.milestone_id as string,
        name: (row.milestones as { name: string }).name,
        phaseId: '',
      },
    };
  }

  const { error: completeError } = await supabase
    .from('creator_milestones')
    .update({
      status: 'completed',
      review_status: 'approved',
      completed_at: now,
      completed_by: actor,
      approved_by: actor,
      updated_at: now,
    })
    .eq('id', milestoneRecordId);

  if (completeError) {
    return { ok: false, outcome: 'noop', openStep: null, round, error: completeError.message };
  }

  const placed = await placeProject(supabase, row.project_id as string, { startClock });
  if (!placed.ok) {
    // The step is completed and the board is not. Report it rather than
    // returning a success the caller would pass on to a creator.
    return {
      ok: false,
      outcome: capReached ? 'forced_approve' : 'approved',
      openStep: null,
      round,
      error: placed.error,
    };
  }

  return {
    ok: true,
    outcome: capReached ? 'forced_approve' : 'approved',
    openStep: placed.openStep,
    round,
  };
}
