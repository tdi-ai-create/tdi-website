import { createClient } from '@supabase/supabase-js';

type DbClient = ReturnType<typeof createClient>;

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

  const { data: milestone } = await supabase
    .from('milestones')
    .select('id, phase_id, sort_order, title, name, applies_to')
    .eq('id', milestoneId)
    .single();

  await supabase
    .from('creator_milestones')
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

  let { data: nextMilestone } = await supabase
    .from('milestones')
    .select('id, sort_order, title, name')
    .eq('phase_id', milestone.phase_id)
    .gt('sort_order', milestone.sort_order)
    .lt('sort_order', 98)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!nextMilestone) {
    const { data: phases } = await supabase
      .from('phases')
      .select('id, sort_order')
      .order('sort_order', { ascending: true });

    const currentPhase = phases?.find((p: { id: string; sort_order: number }) => p.id === milestone.phase_id);
    const currentPhaseOrder = currentPhase?.sort_order ?? 0;

    const { data: futureMilestones } = await supabase
      .from('milestones')
      .select('id, sort_order, title, name, applies_to, phases!inner(sort_order)')
      .gt('phases.sort_order', currentPhaseOrder)
      .lt('sort_order', 98)
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
    await supabase
      .from('creator_milestones')
      .update({
        status: 'available',
        completed_at: null,
        completed_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq('creator_id', creatorId)
      .eq('milestone_id', nextMilestone.id)
      .eq('status', 'locked');

    nextMilestoneName = (nextMilestone as { title?: string; name?: string }).title
      || (nextMilestone as { title?: string; name?: string }).name
      || null;
  }

  return { nextMilestoneName, phaseId: milestone.phase_id };
}
