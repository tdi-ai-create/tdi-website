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
import { AGREEMENT_COLUMNS, hasSignedAgreement, type AgreementSubject } from './creator-agreement';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

// The number lives in lib/creator-rules.ts with the rest of the step rules.
// Imported for use here and re-exported so existing importers keep working,
// leaving exactly one declaration.
import { MAX_FEEDBACK_ROUNDS } from './creator-rules';
export { MAX_FEEDBACK_ROUNDS };

/**
 * Steps retired in the 26 August review, kept only as a floor.
 *
 * The real answer lives on `milestones.retired_at`, so retiring the next step
 * is a database update rather than a release. This set exists so that a failed
 * read of that column degrades to refusing the ten we already know about,
 * rather than to offering everything.
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

/**
 * Finds the one step row a (creator, milestone) pair means.
 *
 * Callers have always passed that pair, and it does not identify a row: a
 * creator on a second project has two rows for the same step. The old routes
 * took whichever the database returned first, or whichever was updated most
 * recently, and completed or reopened the wrong one without saying so.
 *
 * Ambiguity is an error here rather than a guess, because a wrong guess is
 * silent and rare, which is the worst combination.
 */
export async function resolveStepRow(
  supabase: DbClient,
  creatorId: string,
  milestoneId: string,
  explicitRecordId?: string
): Promise<{ recordId?: string; error?: string }> {
  if (explicitRecordId) return { recordId: explicitRecordId };

  const { data, error } = await supabase
    .from('creator_milestones')
    .select('id, project_id')
    .eq('creator_id', creatorId)
    .eq('milestone_id', milestoneId);

  if (error) return { error: `Could not find the step: ${error.message}` };
  if (!data || data.length === 0) return { error: 'No matching creator_milestone record found' };
  if (data.length === 1) return { recordId: data[0].id as string };

  // More than one project carries this step. Prefer the creator's active
  // project rather than guessing, and refuse if even that cannot decide.
  const { data: creatorRow } = await supabase
    .from('creators')
    .select('active_project_id')
    .eq('id', creatorId)
    .maybeSingle();

  const onActive = (data as Array<{ id: string; project_id: string | null }>)
    .find((r) => r.project_id === creatorRow?.active_project_id);

  if (!onActive) {
    return {
      error:
        'This creator has more than one project carrying that step and none is active. ' +
        'Send milestoneRecordId to say which one.',
    };
  }

  return { recordId: onActive.id };
}

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
  /** From milestones.retired_at. A retired step never opens. */
  retired: boolean;
  position: number;
}

/**
 * Whether a step is the agreement.
 *
 * Matched on the name because that is what the milestones table carries and
 * there is no flag for it. Kept in one function so a rename shows up here
 * rather than in whichever call site was forgotten.
 */
function isAgreementStep(name: string | null | undefined): boolean {
  return (name ?? '').trim().toLowerCase() === 'sign agreement';
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
  // The database is the authority. The constant is the floor underneath it, so
  // a step retired after this deployed is still refused without a release.
  if (m.retired || RETIRED_STEPS.has(m.milestoneId)) return false;
  return appliesToPath(m, contentPath);
}

async function loadProject(
  supabase: DbClient,
  projectId: string
): Promise<{ creatorId: string; contentPath: string | null; finished: boolean; signed: boolean } | null> {
  const { data, error } = await supabase
    .from('creator_projects')
    .select('id, creator_id, content_path, status, completed_at')
    .eq('id', projectId)
    .maybeSingle();

  if (error || !data) return null;

  // Read separately rather than embedded, because two foreign keys join these
  // tables and an unqualified embed is ambiguous.
  const { data: creator } = await supabase
    .from('creators')
    .select(AGREEMENT_COLUMNS)
    .eq('id', data.creator_id)
    .maybeSingle();

  return {
    creatorId: data.creator_id,
    contentPath: data.content_path ?? null,
    // A project that has already shipped is not placed anywhere. Without this
    // the engine puts Sue Thompson, who is published, back onto Launch Date Set.
    finished: data.status === 'completed' || data.completed_at !== null,
    // Unknown counts as signed. If the creator cannot be read, holding somebody
    // on an agreement step forever is a worse failure than placing them
    // normally, and blocksPublish still stops anything actually shipping.
    signed: creator ? hasSignedAgreement(creator as unknown as AgreementSubject) : true,
  };
}

async function loadBoard(supabase: DbClient, projectId: string): Promise<MilestoneRow[]> {
  const { data, error } = await supabase
    .from('creator_milestones')
    .select(
      'id, milestone_id, status, round, milestones!inner(name, phase_id, sort_order, applies_to, is_collapsed_into, requires_team_action, allowance_days, retired_at)'
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
      retired: m.retired_at !== null && m.retired_at !== undefined,
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
    const stale = board.filter(
      (m) =>
        m.status !== 'completed' &&
        m.status !== 'locked' &&
        // Same exemption as below. A finished board still owes us a signature.
        !(!project.signed && isAgreementStep(m.name))
    );
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
  //
  // An unsigned agreement is never locked, whatever else happens.
  //
  // Placement is forward only, so nothing behind the furthest completed work
  // opens again. That is right for ordinary steps and wrong for this one. The
  // agreement phase ranks second of seven, so a creator who reached the
  // marketing blog without signing has left it four phases behind, and no sort
  // order inside that phase can reach back. Kim Lohse and Dr. Stephanie Nardi
  // are both there today: switching the engine on would close the step where
  // they would sign and move them to Content Launched, unsigned.
  //
  // Left open rather than made the next step, which is the distinction that
  // matters. An unsigned creator is allowed to carry on working; they are not
  // allowed to publish, and blocksPublish already enforces that. Forcing them
  // back to the agreement was tried first and pulled seven creators off work
  // they were part way through, which is a different and worse failure.
  //
  // So the board may show two open steps for an unsigned creator: whatever they
  // are actually doing, and the agreement waiting for them.
  const toLock = board
    .filter(
      (m) =>
        m.status !== 'completed' &&
        m.recordId !== next.recordId &&
        m.status !== 'locked' &&
        !(!project.signed && isAgreementStep(m.name))
    )
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
 * Places every one of a creator's active projects.
 *
 * Unpause is creator-shaped, not project-shaped, so this is the wrapper for it.
 * The old placeCreator read every row a creator owned across all projects and
 * then locked all but one, which collapsed a two-project creator onto a single
 * open step. Each project is placed on its own here.
 *
 * `startClock` is false for a paused creator. Repairing a board and starting a
 * deadline are different things, and someone returning after months should not
 * arrive to something already overdue.
 */
export async function placeCreatorProjects(
  supabase: DbClient,
  creatorId: string,
  opts: { startClock?: boolean } = {}
): Promise<{ ok: boolean; placed: Array<{ projectId: string; openStep: string | null }>; errors: string[] }> {
  const { data: projects, error } = await supabase
    .from('creator_projects')
    .select('id')
    .eq('creator_id', creatorId)
    .eq('status', 'active');

  if (error) return { ok: false, placed: [], errors: [`Could not load their projects: ${error.message}`] };
  if (!projects || projects.length === 0) {
    return { ok: false, placed: [], errors: ['This creator has no active project to place.'] };
  }

  const placed: Array<{ projectId: string; openStep: string | null }> = [];
  const errors: string[] = [];

  for (const project of projects as Array<{ id: string }>) {
    const result = await placeProject(supabase, project.id, opts);
    if (result.ok) {
      placed.push({ projectId: project.id, openStep: result.openStep?.name ?? null });
    } else {
      errors.push(`${project.id}: ${result.error}`);
    }
  }

  return { ok: errors.length === 0, placed, errors };
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
