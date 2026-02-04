import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Fix milestone progression for creators who completed a phase but
 * didn't have the next applicable phase unlocked.
 *
 * This happens when:
 * 1. Creator completes onboarding
 * 2. Old unlock logic only looked in same phase
 * 3. Blog/download creators have next milestones in a different phase
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all creators
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name, content_path');

    if (!creators) {
      return NextResponse.json({ success: false, error: 'No creators found' });
    }

    // Get all phases ordered
    const { data: phases } = await supabase
      .from('phases')
      .select('id, sort_order')
      .order('sort_order', { ascending: true });

    // Get all milestones
    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('id, phase_id, sort_order, applies_to, title, name');

    const fixes: { creatorName: string; unlockedMilestone: string }[] = [];

    for (const creator of creators) {
      // Get this creator's milestones
      const { data: creatorMilestones } = await supabase
        .from('creator_milestones')
        .select('milestone_id, status')
        .eq('creator_id', creator.id);

      if (!creatorMilestones) continue;

      // Check if creator has any available milestones
      const hasAvailable = creatorMilestones.some(cm => cm.status === 'available' || cm.status === 'in_progress');

      // If they have available milestones, they're fine
      if (hasAvailable) continue;

      // Check if they have any completed milestones (not stuck at start)
      const hasCompleted = creatorMilestones.some(cm => cm.status === 'completed');
      if (!hasCompleted) continue;

      // Find the first locked milestone that should be available based on content path
      const contentPath = creator.content_path;

      // Sort milestones by phase order then sort_order
      const sortedMilestones = allMilestones?.sort((a, b) => {
        const phaseA = phases?.find(p => p.id === a.phase_id);
        const phaseB = phases?.find(p => p.id === b.phase_id);
        if ((phaseA?.sort_order || 0) !== (phaseB?.sort_order || 0)) {
          return (phaseA?.sort_order || 0) - (phaseB?.sort_order || 0);
        }
        return (a.sort_order || 0) - (b.sort_order || 0);
      }) || [];

      // Find first applicable locked milestone
      for (const milestone of sortedMilestones) {
        const creatorMilestone = creatorMilestones.find(cm => cm.milestone_id === milestone.id);
        if (!creatorMilestone || creatorMilestone.status !== 'locked') continue;

        // Check if milestone applies to this content path
        const appliesTo = milestone.applies_to as string[] | null;
        const isApplicable = !contentPath ||
          !appliesTo || appliesTo.length === 0 ||
          appliesTo.includes(contentPath);

        if (!isApplicable) continue;

        // Check if all prior applicable milestones are completed
        const milestoneIndex = sortedMilestones.indexOf(milestone);
        const priorMilestones = sortedMilestones.slice(0, milestoneIndex);

        const allPriorComplete = priorMilestones.every(pm => {
          const pmAppliesTo = pm.applies_to as string[] | null;
          const pmApplicable = !contentPath ||
            !pmAppliesTo || pmAppliesTo.length === 0 ||
            pmAppliesTo.includes(contentPath);

          if (!pmApplicable) return true; // Skip non-applicable

          const pmStatus = creatorMilestones.find(cm => cm.milestone_id === pm.id);
          return pmStatus?.status === 'completed';
        });

        if (allPriorComplete) {
          // Unlock this milestone
          await supabase
            .from('creator_milestones')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('creator_id', creator.id)
            .eq('milestone_id', milestone.id);

          fixes.push({
            creatorName: creator.name,
            unlockedMilestone: milestone.title || milestone.name || milestone.id,
          });

          break; // Only unlock one per creator
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixes.length} creators`,
      fixes,
    });
  } catch (error) {
    console.error('[fix-milestone-progression] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
