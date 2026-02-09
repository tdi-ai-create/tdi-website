import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to check if a milestone applies to a content path
function milestoneAppliesTo(milestone: { applies_to?: string[] | null }, contentPath: string | null): boolean {
  // If path not yet selected, only show intake and path selection milestones
  if (!contentPath) {
    if (milestone.applies_to === null) return true;
    if (!milestone.applies_to) return true;
    return milestone.applies_to.includes('blog') &&
           milestone.applies_to.includes('download') &&
           milestone.applies_to.includes('course');
  }

  // If applies_to is null or empty, default to course only (backwards compatibility)
  if (!milestone.applies_to || milestone.applies_to.length === 0) {
    return contentPath === 'course';
  }

  return milestone.applies_to.includes(contentPath);
}

export async function POST(request: NextRequest) {
  console.log('[dashboard-api] Called');

  try {
    const { email } = await request.json();
    console.log('[dashboard-api] Email:', email);

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[dashboard-api] Missing env vars');
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get creator by email
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .ilike('email', email.toLowerCase())
      .maybeSingle();

    console.log('[dashboard-api] Creator query:', { creator, error: creatorError?.message });

    if (creatorError) {
      return NextResponse.json({ error: `Creator query failed: ${creatorError.message}` }, { status: 500 });
    }

    if (!creator) {
      // Check if they're an admin
      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('email', email.toLowerCase())
        .maybeSingle();

      if (admin) {
        return NextResponse.json({ error: 'User is admin, not creator', isAdmin: true }, { status: 400 });
      }

      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const contentPath = creator.content_path as string | null;

    // Get all phases
    const { data: phases, error: phasesError } = await supabase
      .from('phases')
      .select('*')
      .order('sort_order');

    console.log('[dashboard-api] Phases:', { count: phases?.length, error: phasesError?.message });

    if (phasesError || !phases) {
      return NextResponse.json({ error: `Phases query failed: ${phasesError?.message}` }, { status: 500 });
    }

    // Get all milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .order('sort_order');

    console.log('[dashboard-api] Milestones:', { count: milestones?.length, error: milestonesError?.message });

    if (milestonesError || !milestones) {
      return NextResponse.json({ error: `Milestones query failed: ${milestonesError?.message}` }, { status: 500 });
    }

    // Get creator's milestone progress
    const { data: creatorMilestones, error: cmError } = await supabase
      .from('creator_milestones')
      .select('*')
      .eq('creator_id', creator.id);

    console.log('[dashboard-api] Creator milestones:', { count: creatorMilestones?.length, error: cmError?.message });

    // If no creator_milestones exist, create them
    if (!creatorMilestones || creatorMilestones.length === 0) {
      console.log('[dashboard-api] No milestones found, creating initial set');

      const milestoneRecords = milestones.map((milestone, index) => ({
        creator_id: creator.id,
        milestone_id: milestone.id,
        status: index === 0 ? 'available' : 'locked',
      }));

      const { error: insertError } = await supabase
        .from('creator_milestones')
        .insert(milestoneRecords);

      if (insertError) {
        console.error('[dashboard-api] Error creating milestones:', insertError);
      }

      // Re-fetch
      const { data: newMilestones } = await supabase
        .from('creator_milestones')
        .select('*')
        .eq('creator_id', creator.id);

      if (newMilestones) {
        Object.assign(creatorMilestones || [], newMilestones);
      }
    }

    // Get visible notes
    const { data: notes } = await supabase
      .from('creator_notes')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('visible_to_creator', true)
      .order('created_at', { ascending: false });

    // Filter milestones based on content path
    const applicableMilestones = milestones.filter(m => milestoneAppliesTo(m, contentPath));
    const applicableMilestoneIds = new Set(applicableMilestones.map(m => m.id));

    // Build phases with milestones
    const phasesWithMilestones = phases.map((phase) => {
      const phaseMilestones = milestones.filter((m) => m.phase_id === phase.id);
      const applicablePhaseMilestones = phaseMilestones.filter(m => milestoneAppliesTo(m, contentPath));

      const milestonesWithStatus = phaseMilestones.map((milestone) => {
        const progress = (creatorMilestones || []).find(
          (cm) => cm.milestone_id === milestone.id
        );
        const isApplicable = milestoneAppliesTo(milestone, contentPath);

        return {
          ...milestone,
          status: progress?.status || 'locked',
          completed_at: progress?.completed_at || null,
          progress_id: progress?.id || null,
          metadata: progress?.metadata || null,
          submission_data: progress?.submission_data || null,
          isApplicable,
        };
      });

      // Phase is complete if all applicable milestones are completed
      const isComplete = applicablePhaseMilestones.length > 0 &&
        applicablePhaseMilestones.every((m) => {
          const progress = (creatorMilestones || []).find(cm => cm.milestone_id === m.id);
          return progress?.status === 'completed';
        });

      // Phase is skipped if no milestones apply to this content path
      const isSkipped = applicablePhaseMilestones.length === 0;
      const isCurrentPhase = phase.id === creator.current_phase;

      return {
        ...phase,
        milestones: milestonesWithStatus,
        isComplete,
        isCurrentPhase,
        isSkipped,
        applicableMilestoneCount: applicablePhaseMilestones.length,
      };
    });

    // Calculate progress based only on applicable, non-optional milestones
    // Optional milestones (bonus items) don't count against core completion percentage
    const optionalMilestoneIds = new Set(
      (creatorMilestones || [])
        .filter(cm => cm.metadata && (cm.metadata as { is_optional?: boolean }).is_optional === true)
        .map(cm => cm.milestone_id)
    );

    const requiredMilestones = applicableMilestones.filter(m => !optionalMilestoneIds.has(m.id));
    const requiredMilestoneIds = new Set(requiredMilestones.map(m => m.id));

    const totalMilestones = requiredMilestones.length;
    const completedMilestones = (creatorMilestones || []).filter(
      (cm) => cm.status === 'completed' && requiredMilestoneIds.has(cm.milestone_id)
    ).length;

    // Bonus: count optional milestones completed
    const optionalCompleted = (creatorMilestones || []).filter(
      (cm) => cm.status === 'completed' && optionalMilestoneIds.has(cm.milestone_id)
    ).length;

    const progressPercentage =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const dashboardData = {
      creator,
      phases: phasesWithMilestones,
      notes: notes || [],
      totalMilestones,
      completedMilestones,
      optionalMilestones: optionalMilestoneIds.size,
      optionalCompleted,
      progressPercentage,
      contentPath,
    };

    console.log('[dashboard-api] Success, returning data');
    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('[dashboard-api] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
