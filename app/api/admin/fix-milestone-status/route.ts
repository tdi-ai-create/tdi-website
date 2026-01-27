import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('[fix-milestone-status] Starting...');

    // Get all milestones in order
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, phase_id, sort_order')
      .order('phase_id')
      .order('sort_order');

    if (!milestones) {
      return NextResponse.json({ success: false, error: 'No milestones found' }, { status: 500 });
    }

    // Get all creators
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name');

    if (!creators) {
      return NextResponse.json({ success: false, error: 'No creators found' }, { status: 500 });
    }

    const updates: { creator: string; milestone: string; newStatus: string }[] = [];

    for (const creator of creators) {
      // Get this creator's milestone statuses
      const { data: creatorMilestones } = await supabase
        .from('creator_milestones')
        .select('milestone_id, status')
        .eq('creator_id', creator.id);

      if (!creatorMilestones) continue;

      // Create a map of milestone statuses
      const statusMap = new Map(creatorMilestones.map(cm => [cm.milestone_id, cm.status]));

      // Go through milestones in order
      let previousCompleted = true; // First milestone should be available

      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        const currentStatus = statusMap.get(milestone.id) || 'locked';

        // If milestone is locked but previous milestone is completed, unlock it
        if (currentStatus === 'locked' && previousCompleted) {
          // Update to 'available'
          const { error } = await supabase
            .from('creator_milestones')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('creator_id', creator.id)
            .eq('milestone_id', milestone.id);

          if (!error) {
            updates.push({
              creator: creator.name,
              milestone: milestone.id,
              newStatus: 'available',
            });
          }

          // After unlocking one, stop (don't unlock more)
          previousCompleted = false;
        } else if (currentStatus === 'completed') {
          previousCompleted = true;
        } else {
          previousCompleted = false;
        }
      }
    }

    console.log('[fix-milestone-status] Complete:', { updatesCount: updates.length });

    return NextResponse.json({
      success: true,
      message: `Fixed ${updates.length} milestone statuses`,
      updates,
    });
  } catch (error) {
    console.error('[fix-milestone-status] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
