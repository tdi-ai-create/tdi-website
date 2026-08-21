// ---------------------------------------------------------------------------
// Putting a creator on exactly one step.
//
// This ran once, by hand, on 19 August, for the creators who were active at
// that moment. Holly Stuart was paused that day. She came back on the 20th and
// bypassed all of it: 23 steps open at once, no dates, no lock. Nine of the
// twelve items in Friday's waiting on TDI message were hers, all reading zero
// days, burying the three that actually mattered.
//
// A migration that only ran once is not a rule. Nine creators are still paused,
// holding 243 open steps between them, and each will return the same way. So
// the logic lives here and runs on the way back in.
//
// Placement is forward only. It opens the step after their furthest completed
// work and never reopens anything finished, because the first version of this
// took the earliest incomplete step instead and would have sent five people
// back to an agreement they had already signed.
// ---------------------------------------------------------------------------

import { phaseRank } from './creator-phases';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/**
 * Launch Date Set reads completed for creators who never launched, stamped by a
 * migration in February. Counting it as real work would place people at the end
 * of the pipeline. The false completions were cleared for unpublished creators
 * on 19 August, but a paused creator restored from an older state could still
 * carry one, so this stays.
 */
const NOT_REAL_PROGRESS = new Set(['Launch Date Set']);

export interface PlacementResult {
  ok: boolean;
  creatorId: string;
  openedStep: string | null;
  phase: string | null;
  locked: number;
  /** Already had exactly one open step, so nothing was touched. */
  alreadyPlaced: boolean;
  error?: string;
}

function position(phaseId: string, sortOrder: number): number {
  return phaseRank(phaseId) * 1000 + sortOrder;
}

/**
 * Places one creator on the step after their furthest completed work, and locks
 * everything else that is not finished. Completed steps are never touched.
 *
 * The database trigger on creator_milestones stamps opened_at and due_on when a
 * step becomes available, so nothing here deals with dates.
 */
export async function placeCreator(
  supabase: DbClient,
  creatorId: string
): Promise<PlacementResult> {
  const base: PlacementResult = {
    ok: false, creatorId, openedStep: null, phase: null, locked: 0, alreadyPlaced: false,
  };

  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('id, content_path')
    .eq('id', creatorId)
    .single();

  if (creatorError || !creator) {
    return { ...base, error: creatorError?.message || 'Creator not found' };
  }

  const path = creator.content_path || 'course';

  const { data: rows, error: rowsError } = await supabase
    .from('creator_milestones')
    .select('id, status, milestones!inner(name, phase_id, sort_order, applies_to, is_collapsed_into)')
    .eq('creator_id', creatorId);

  if (rowsError) return { ...base, error: rowsError.message };

  const applicable = ((rows || []) as Array<Record<string, any>>)
    .filter((r) => {
      const ms = r.milestones;
      if (!ms || ms.is_collapsed_into) return false;
      const applies = ms.applies_to as string[] | null;
      return !applies || applies.length === 0 || applies.includes(path);
    })
    .map((r) => ({
      id: r.id as string,
      status: r.status as string,
      name: r.milestones.name as string,
      phaseId: r.milestones.phase_id as string,
      pos: position(r.milestones.phase_id, r.milestones.sort_order ?? 0),
    }));

  if (applicable.length === 0) return { ...base, error: 'No applicable steps' };

  const open = applicable.filter((s) => s.status === 'available');
  if (open.length === 1) {
    return { ...base, ok: true, alreadyPlaced: true, openedStep: open[0].name, phase: open[0].phaseId };
  }

  const furthest = applicable
    .filter((s) => s.status === 'completed' && !NOT_REAL_PROGRESS.has(s.name))
    .reduce((max, s) => (s.pos > max ? s.pos : max), -1);

  const next = applicable
    .filter((s) => s.status !== 'completed' && s.pos > furthest)
    .sort((a, b) => a.pos - b.pos)[0];

  if (!next) {
    // Everything applicable is finished. Leave the board alone rather than
    // inventing a step; this is a creator who has reached the end.
    return { ...base, ok: true, alreadyPlaced: true };
  }

  const toLock = applicable
    .filter((s) => s.status !== 'completed' && s.id !== next.id)
    .map((s) => s.id);

  if (toLock.length > 0) {
    const { error: lockError } = await supabase
      .from('creator_milestones')
      .update({ status: 'locked', updated_at: new Date().toISOString() })
      .in('id', toLock);
    if (lockError) return { ...base, error: `Locking failed: ${lockError.message}` };
  }

  const { error: openError } = await supabase
    .from('creator_milestones')
    .update({ status: 'available', updated_at: new Date().toISOString() })
    .eq('id', next.id);
  if (openError) return { ...base, error: `Opening the next step failed: ${openError.message}` };

  const { error: phaseError } = await supabase
    .from('creators')
    .update({ current_phase: next.phaseId, updated_at: new Date().toISOString() })
    .eq('id', creatorId);
  if (phaseError) return { ...base, error: `Setting the phase failed: ${phaseError.message}` };

  return {
    ok: true,
    creatorId,
    openedStep: next.name,
    phase: next.phaseId,
    locked: toLock.length,
    alreadyPlaced: false,
  };
}
