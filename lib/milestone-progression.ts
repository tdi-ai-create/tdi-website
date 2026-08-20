// Callers construct their Supabase client with different generic parameters,
// so pinning this to one of them makes the shared helper unusable from half
// the routes that should be using it. That is how sign-agreement ended up
// with its own copy of progression logic ordering phases alphabetically.
/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

function milestoneAppliesTo(
  milestone: { applies_to?: string[] | null },
  contentPath: string
): boolean {
  if (!milestone.applies_to || milestone.applies_to.length === 0) {
    return contentPath === 'course';
  }
  return milestone.applies_to.includes(contentPath);
}

export async function progressMilestone(
  supabase: DbClient,
  params: {
    creatorId: string;
    milestoneId: string;
    completedBy: string;
    contentPath?: string | null;
  }
): Promise<{ nextMilestoneName: string | null; phaseId: string | null }> {
  const { creatorId, milestoneId, completedBy, contentPath } = params;
  const completedAt = new Date().toISOString();

  const { data: milestone } = await (supabase
    .from('milestones') as any)
    .select('id, phase_id, sort_order, name, applies_to')
    .eq('id', milestoneId)
    .single();

  await (supabase
    .from('creator_milestones') as any)
    .update({
      status: 'completed',
      completed_at: completedAt,
      completed_by: completedBy,
      submission_data: {
        type: 'admin_advance',
        advanced_by: completedBy,
        advanced_at: completedAt,
      },
      updated_at: completedAt,
    })
    .eq('creator_id', creatorId)
    .eq('milestone_id', milestoneId);

  if (!milestone) {
    return { nextMilestoneName: null, phaseId: null };
  }

  let nextMilestoneName: string | null = null;

  // Within the current phase. This previously took the next step by sort order
  // alone, ignoring content path and retired steps, so a download creator could
  // be handed a course step. Ask for the candidates and pick the first that
  // actually applies.
  const { data: samePhase } = await (supabase
    .from('milestones') as any)
    .select('id, sort_order, name, applies_to')
    .eq('phase_id', milestone.phase_id)
    .gt('sort_order', milestone.sort_order)
    .lt('sort_order', 98)
    .is('is_collapsed_into', null)
    .order('sort_order', { ascending: true });

  let nextMilestone =
    (samePhase as Array<{ id: string; sort_order: number; name?: string; applies_to?: string[] | null }> | null)
      ?.find((m) => !contentPath || milestoneAppliesTo(m, contentPath)) ?? null;

  if (!nextMilestone) {
    const { data: phases } = await (supabase
      .from('phases') as any)
      .select('id, sort_order')
      .order('sort_order', { ascending: true });

    const currentPhase = phases?.find((p: { id: string; sort_order: number }) => p.id === milestone.phase_id);
    const currentPhaseOrder = currentPhase?.sort_order ?? 0;

    const { data: futureMilestones } = await supabase
      .from('milestones')
      .select('id, sort_order, name, applies_to, phases!inner(sort_order)')
      .gt('phases.sort_order', currentPhaseOrder)
      .lt('sort_order', 98)
      .is('is_collapsed_into', null)
      .order('phases(sort_order)', { ascending: true })
      .order('sort_order', { ascending: true });

    if (futureMilestones) {
      for (const fm of futureMilestones as Array<{ id: string; sort_order: number; title?: string; name?: string; applies_to?: string[] | null }>) {
        if (!contentPath || milestoneAppliesTo(fm, contentPath)) {
          nextMilestone = fm;
          break;
        }
      }
    }
  }

  if (nextMilestone) {
    const { error: unlockError } = await (supabase
      .from('creator_milestones') as any)
      .update({
        status: 'available',
        completed_at: null,
        completed_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('creator_id', creatorId)
      .eq('milestone_id', nextMilestone.id)
      .eq('status', 'locked');

    if (unlockError) {
      console.error('[progressMilestone] Error unlocking next milestone:', nextMilestone.id, unlockError);
    } else {
      console.log('[progressMilestone] Unlocked next milestone:', nextMilestone.id);
    }

    nextMilestoneName = (nextMilestone as { title?: string; name?: string }).title
      || (nextMilestone as { title?: string; name?: string }).name
      || null;
  } else {
    console.warn('[progressMilestone] No next milestone found after:', milestoneId);
  }

  return { nextMilestoneName, phaseId: milestone.phase_id };
}
