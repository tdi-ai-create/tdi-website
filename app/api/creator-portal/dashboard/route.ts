import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Build phases with milestones
    const phasesWithMilestones = phases.map((phase) => {
      const phaseMilestones = milestones.filter((m) => m.phase_id === phase.id);

      const milestonesWithStatus = phaseMilestones.map((milestone) => {
        const progress = (creatorMilestones || []).find(
          (cm) => cm.milestone_id === milestone.id
        );
        return {
          ...milestone,
          status: progress?.status || 'locked',
          completed_at: progress?.completed_at || null,
          progress_id: progress?.id || null,
        };
      });

      const isComplete = milestonesWithStatus.every((m) => m.status === 'completed');
      const isCurrentPhase = phase.id === creator.current_phase;

      return {
        ...phase,
        milestones: milestonesWithStatus,
        isComplete,
        isCurrentPhase,
      };
    });

    // Calculate progress
    const totalMilestones = milestones.length;
    const completedMilestones = (creatorMilestones || []).filter(
      (cm) => cm.status === 'completed'
    ).length;
    const progressPercentage =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const dashboardData = {
      creator,
      phases: phasesWithMilestones,
      notes: notes || [],
      totalMilestones,
      completedMilestones,
      progressPercentage,
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
