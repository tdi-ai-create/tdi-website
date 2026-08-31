// ---------------------------------------------------------------------------
// What a creator sees: one open step, and the road it sits on.
//
// The road is eight stages for a course and five for a download, not twenty
// seven tasks and sixteen tasks. A course is 27 steps and 8 of them are ours,
// so showing the flat list reads as homework and overstates their workload by
// about a third.
//
// Stage names come from the database, per path, because the two paths are
// different journeys. Sharing them is why a download creator used to see an
// empty "Content Design" stage and do their whole content build inside one
// called "Prep & Resources", described as "Prepare for recording".
// ---------------------------------------------------------------------------

import { phaseRank } from './creator-phases';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

export interface JourneyStep {
  recordId: string;
  milestoneId: string;
  name: string;
  /** True when TDI does this, not the creator. Shown, never hidden. */
  ours: boolean;
  status: 'complete' | 'open' | 'in_review' | 'changes_requested' | 'todo';
  dueOn: string | null;
  /** Feedback rounds used. Surfaced so a creator can see revision ends. */
  round: number;
  /** Times this step's date has been moved. Three reaches Bella. */
  extensions: number;
}

export interface JourneyStage {
  key: string;
  name: string;
  steps: JourneyStep[];
  done: number;
  total: number;
  /** The stage holding their open step. The only one expanded by default. */
  current: boolean;
}

/**
 * Everything MilestoneAction needs to render the actual control for the open
 * step. Carried here so the dashboard never has to go and fetch the milestone
 * definition separately, and so the two can never disagree about which step is
 * open.
 */
export interface OpenStepAction {
  id: string;
  name: string;
  action_type: string | null;
  action_config: Record<string, unknown> | null;
  status: string;
  submitted_value: string | null;
  team_status_message: string | null;
  description: string | null;
}

export interface Journey {
  path: 'course' | 'download' | null;
  stages: JourneyStage[];
  openStep: JourneyStep | null;
  /** The stage name above the open step, for the card. */
  openStageName: string | null;
  /** The open step's control, ready to hand to MilestoneAction. */
  openStepAction: OpenStepAction | null;
  totalSteps: number;
  completedSteps: number;
}

/** Packs one raw row into what MilestoneAction expects. */
function actionFor(r: Record<string, any>): OpenStepAction {
  return {
    id: r.milestone_id,
    name: r.milestones.name,
    action_type: r.milestones.action_type ?? null,
    action_config: (r.milestones.action_config as Record<string, unknown> | null) ?? null,
    status: r.status,
    submitted_value: r.submitted_value ?? null,
    team_status_message: r.milestones.team_status_message ?? null,
    description: r.milestones.description ?? null,
  };
}

function displayStatus(row: { status: string; review_status: string | null }): JourneyStep['status'] {
  if (row.status === 'completed') return 'complete';
  if (row.review_status === 'changes_requested') return 'changes_requested';
  if (row.status === 'waiting_approval' || row.review_status === 'submitted' || row.review_status === 'under_review') {
    return 'in_review';
  }
  if (row.status === 'available') return 'open';
  return 'todo';
}

/**
 * Builds the whole journey for one project.
 *
 * Retired steps never appear. Collapsed steps never appear. Steps belonging to
 * the other path never appear. What is left is exactly what that creator will
 * ever be asked to do, plus the steps we owe them, marked as ours.
 */
export async function getJourney(supabase: DbClient, projectId: string): Promise<Journey | null> {
  const { data: project, error: projectError } = await supabase
    .from('creator_projects')
    .select('id, content_path')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError || !project) return null;

  const path = (project.content_path as 'course' | 'download' | null) ?? null;

  // No path chosen yet means no journey to draw. They get the one question that
  // decides it, and the road appears once they have answered.
  if (!path) {
    const { data: rows } = await supabase
      .from('creator_milestones')
      .select('id, milestone_id, status, review_status, due_on, round, extension_count, submitted_value, milestones!inner(name, description, action_type, action_config, team_status_message, requires_team_action, retired_at, is_collapsed_into)')
      .eq('project_id', projectId)
      .eq('status', 'available');

    const first = (rows || [])[0];
    const openStep: JourneyStep | null = first
      ? {
          recordId: first.id,
          milestoneId: first.milestone_id,
          name: first.milestones.name,
          ours: Boolean(first.milestones.requires_team_action),
          status: displayStatus(first),
          dueOn: first.due_on ?? null,
          round: first.round ?? 0,
          extensions: first.extension_count ?? 0,
        }
      : null;

    return {
      path: null,
      stages: [],
      openStep,
      openStageName: null,
      openStepAction: first ? actionFor(first) : null,
      totalSteps: 0,
      completedSteps: 0,
    };
  }

  const [{ data: stageRows }, { data: mapRows }, { data: stepRows }] = await Promise.all([
    supabase.from('creator_stages').select('stage_key, name, sort_order').eq('path', path).order('sort_order'),
    supabase.from('milestone_stages').select('milestone_id, stage_key').eq('path', path),
    supabase
      .from('creator_milestones')
      .select('id, milestone_id, status, review_status, due_on, round, extension_count, submitted_value, milestones!inner(name, description, sort_order, phase_id, action_type, action_config, team_status_message, requires_team_action, retired_at, is_collapsed_into, applies_to)')
      .eq('project_id', projectId),
  ]);

  if (!stageRows || !mapRows || !stepRows) return null;

  const stageOf = new Map<string, string>(
    (mapRows as Array<{ milestone_id: string; stage_key: string }>).map((r) => [r.milestone_id, r.stage_key])
  );

  const visible = (stepRows as Array<Record<string, any>>).filter((r) => {
    const m = r.milestones;
    if (m.retired_at) return false;
    if (m.is_collapsed_into) return false;
    const applies = m.applies_to as string[] | null;
    if (applies && applies.length > 0 && !applies.includes(path)) return false;
    return stageOf.has(r.milestone_id);
  });

  const steps: Array<JourneyStep & { stageKey: string; sortOrder: number }> = visible.map((r) => ({
    recordId: r.id,
    milestoneId: r.milestone_id,
    name: r.milestones.name,
    ours: Boolean(r.milestones.requires_team_action),
    status: displayStatus(r as { status: string; review_status: string | null }),
    dueOn: r.due_on ?? null,
    round: r.round ?? 0,
    extensions: r.extension_count ?? 0,
    stageKey: stageOf.get(r.milestone_id)!,
    // Phase first, then order within the phase. sort_order alone restarts at 1
    // in every phase, and a stage can span two of them: Getting started holds
    // three onboarding steps and the agreement, which lives in its own phase
    // at sort_order 1. Sorting on sort_order put Sign Agreement second.
    sortOrder: phaseRank(r.milestones.phase_id) * 1000 + (r.milestones.sort_order ?? 0),
  }));

  // Strips the two fields that exist only for grouping and sorting, so callers
  // never see internals they have no use for.
  const publish = (s: JourneyStep & { stageKey: string; sortOrder: number }): JourneyStep => ({
    recordId: s.recordId,
    milestoneId: s.milestoneId,
    name: s.name,
    ours: s.ours,
    status: s.status,
    dueOn: s.dueOn,
    round: s.round,
    extensions: s.extensions,
  });

  const open = steps.find((s) => s.status !== 'complete' && s.status !== 'todo') ?? null;
  const openRaw = open ? visible.find((r) => r.id === open.recordId) ?? null : null;

  const stages: JourneyStage[] = (stageRows as Array<{ stage_key: string; name: string }>)
    .map((sr) => {
      const mine = steps
        .filter((s) => s.stageKey === sr.stage_key)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return {
        key: sr.stage_key,
        name: sr.name,
        steps: mine.map(publish),
        done: mine.filter((s) => s.status === 'complete').length,
        total: mine.length,
        current: open ? mine.some((s) => s.recordId === open.recordId) : false,
      };
    })
    .filter((s) => s.total > 0);

  return {
    path,
    stages,
    openStep: open ? publish(open) : null,
    openStageName: open ? stages.find((s) => s.current)?.name ?? null : null,
    openStepAction: openRaw ? actionFor(openRaw) : null,
    totalSteps: steps.length,
    completedSteps: steps.filter((s) => s.status === 'complete').length,
  };
}

/**
 * The journey for a creator, resolving their active project first.
 *
 * Both the creator's dashboard and the admin's view of that creator need the
 * same object, and getJourney takes a project rather than a creator. The
 * resolution below lived only inside the portal route, so the admin page had no
 * way to ask the same question and built its own view of progress instead.
 * That is the drift this function exists to close.
 *
 * Never throws. A creator whose journey cannot be built should still get a
 * page, so every failure degrades to null and the caller falls back.
 */
export async function getJourneyForCreator(
  supabase: DbClient,
  creatorId: string
): Promise<Journey | null> {
  try {
    const { data: activeProject, error } = await supabase
      .from('creator_projects')
      .select('id')
      .eq('creator_id', creatorId)
      .eq('status', 'active')
      .order('project_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[creator-journey] Could not find the active project:', error.message);
      return null;
    }
    if (!activeProject) return null;

    return await getJourney(supabase, activeProject.id);
  } catch (e) {
    console.error('[creator-journey] Journey build failed:', e);
    return null;
  }
}
