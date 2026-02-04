import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Get all creators with their milestones
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false });

    if (creatorsError) {
      console.error('[dashboard-data] Creators error:', creatorsError);
      return NextResponse.json({ success: false, error: creatorsError.message }, { status: 500 });
    }

    // Get all creator_milestones with milestone info
    const { data: allMilestones, error: milestonesError } = await supabase
      .from('creator_milestones')
      .select(`
        *,
        milestone:milestones(*)
      `);

    if (milestonesError) {
      console.error('[dashboard-data] Milestones error:', milestonesError);
      return NextResponse.json({ success: false, error: milestonesError.message }, { status: 500 });
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Process each creator
    const enrichedCreators = creators?.map((creator) => {
      const creatorMilestones = allMilestones?.filter((m) => m.creator_id === creator.id) || [];

      // Separate core (required) and bonus (optional) milestones
      const coreMilestones = creatorMilestones.filter(m => {
        const meta = m.metadata as Record<string, unknown> | null;
        return !meta?.is_optional;
      });
      const bonusMilestones = creatorMilestones.filter(m => {
        const meta = m.metadata as Record<string, unknown> | null;
        return meta?.is_optional === true;
      });

      const coreCompleted = coreMilestones.filter(m => m.status === 'completed').length;
      const coreTotal = coreMilestones.length;
      const corePercent = coreTotal > 0 ? Math.round((coreCompleted / coreTotal) * 100) : 100;

      const bonusCompleted = bonusMilestones.filter(m => m.status === 'completed').length;
      const bonusAvailable = bonusMilestones.filter(m => m.status === 'available' || m.status === 'in_progress').length;
      const bonusTotal = bonusMilestones.length;

      const totalMilestones = creatorMilestones.length;
      const completedMilestones = coreCompleted + bonusCompleted;
      // Use core percent as main progress (creator is "done" when core is 100%)
      const progressPercentage = corePercent;

      // Find most recent activity (completed_at)
      const completedDates = creatorMilestones
        .filter((m) => m.completed_at)
        .map((m) => new Date(m.completed_at));
      const lastActivityDate = completedDates.length > 0
        ? new Date(Math.max(...completedDates.map((d) => d.getTime())))
        : new Date(creator.created_at);

      // Find next available milestone (lowest sort_order with status='available')
      const availableMilestones = creatorMilestones
        .filter((m) => m.status === 'available' && m.milestone)
        .sort((a, b) => (a.milestone?.sort_order || 0) - (b.milestone?.sort_order || 0));

      const nextMilestone = availableMilestones[0] || null;
      const currentMilestoneName = nextMilestone?.milestone?.title || nextMilestone?.milestone?.name || null;
      const requiresTeamAction = nextMilestone?.milestone?.requires_team_action || false;

      // Determine waiting status (use corePercent for "launched" since bonus is optional)
      const hasIncompleteCoreMillestones = coreCompleted < coreTotal;
      const isStalled = hasIncompleteCoreMillestones && lastActivityDate < fourteenDaysAgo;

      let waitingOn: 'creator' | 'tdi' | 'stalled' | 'launched' = 'creator';
      if (corePercent === 100) {
        waitingOn = 'launched';
      } else if (isStalled) {
        waitingOn = 'stalled';
      } else if (requiresTeamAction) {
        waitingOn = 'tdi';
      }

      return {
        ...creator,
        totalMilestones,
        completedMilestones,
        progressPercentage,
        lastActivityDate: lastActivityDate.toISOString(),
        currentMilestoneName,
        requiresTeamAction,
        waitingOn,
        // Core vs Bonus progress
        progress: {
          coreTotal,
          coreCompleted,
          corePercent,
          bonusTotal,
          bonusCompleted,
          bonusAvailable,
          isComplete: corePercent === 100,
        },
        isStalled,
      };
    }) || [];

    // Calculate stats
    const stats = {
      total: enrichedCreators.length,
      stalled: enrichedCreators.filter((c) => c.waitingOn === 'stalled').length,
      waitingOnCreator: enrichedCreators.filter((c) => c.waitingOn === 'creator').length,
      waitingOnTDI: enrichedCreators.filter((c) => c.waitingOn === 'tdi').length,
      launched: enrichedCreators.filter((c) => c.waitingOn === 'launched').length,
    };

    // Phase counts for pipeline funnel
    const phaseCounts = {
      onboarding: enrichedCreators.filter((c) => c.current_phase === 'onboarding').length,
      agreement: enrichedCreators.filter((c) => c.current_phase === 'agreement').length,
      course_design: enrichedCreators.filter((c) => c.current_phase === 'course_design').length,
      test_prep: enrichedCreators.filter((c) => c.current_phase === 'test_prep' || c.current_phase === 'production').length,
      launch: enrichedCreators.filter((c) => c.current_phase === 'launch').length,
    };

    // Content path counts
    const pathCounts = {
      blog: enrichedCreators.filter((c) => c.content_path === 'blog').length,
      download: enrichedCreators.filter((c) => c.content_path === 'download').length,
      course: enrichedCreators.filter((c) => c.content_path === 'course').length,
      notSet: enrichedCreators.filter((c) => !c.content_path).length,
    };

    // Closest to launch (top 4 not at 100%)
    const closestToLaunch = enrichedCreators
      .filter((c) => c.progressPercentage < 100)
      .sort((a, b) => b.progressPercentage - a.progressPercentage)
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        name: c.name,
        course_title: c.course_title,
        progressPercentage: c.progressPercentage,
      }));

    // Recent activity (last 6 completed milestones)
    const recentCompletions = allMilestones
      ?.filter((m) => m.status === 'completed' && m.completed_at)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 6)
      .map((m) => {
        const creator = creators?.find((c) => c.id === m.creator_id);
        const milestoneName = m.milestone?.title || m.milestone?.name || 'Milestone';
        const requiresTeam = m.milestone?.requires_team_action || false;
        const completedByAdmin = m.completed_by?.startsWith('admin:') || m.metadata?.completed_by_admin;

        return {
          id: m.id,
          creatorId: m.creator_id,
          creatorName: creator?.name || 'Unknown',
          milestoneName,
          completedAt: m.completed_at,
          type: completedByAdmin ? 'team' : (requiresTeam ? 'team' : 'creator'),
        };
      }) || [];

    // Topics in pipeline (course titles as tags)
    const topics = enrichedCreators
      .filter((c) => c.course_title)
      .map((c) => ({
        id: c.id,
        title: c.course_title,
        phase: c.current_phase,
      }));

    return NextResponse.json({
      success: true,
      creators: enrichedCreators,
      stats,
      phaseCounts,
      pathCounts,
      closestToLaunch,
      recentActivity: recentCompletions,
      topics,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[dashboard-data] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
