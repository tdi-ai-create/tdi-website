import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { creatorId, signedName } = await request.json();

    if (!creatorId || !signedName) {
      return NextResponse.json(
        { error: 'Creator ID and signed name are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Update creator record with agreement signature
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        agreement_signed: true,
        agreement_signed_at: new Date().toISOString(),
        agreement_signed_name: signedName,
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[sign-agreement] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save agreement signature' },
        { status: 500 }
      );
    }

    // Find the "Sign Agreement" milestone and mark it complete
    // First, find the milestone by title (partial match for flexibility)
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id')
      .eq('phase_id', 'agreement')
      .ilike('title', '%sign%agreement%');

    if (milestones && milestones.length > 0) {
      const milestoneId = milestones[0].id;

      // Update the creator_milestones record
      const { error: milestoneError } = await supabase
        .from('creator_milestones')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: signedName,
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', milestoneId);

      if (milestoneError) {
        console.error('[sign-agreement] Milestone update error:', milestoneError);
        // Don't fail the whole request, just log it
      }

      // Unlock the next milestone if there is one
      const { data: allMilestones } = await supabase
        .from('milestones')
        .select('id, phase_id, sort_order')
        .order('phase_id')
        .order('sort_order');

      if (allMilestones) {
        const currentIndex = allMilestones.findIndex((m) => m.id === milestoneId);
        if (currentIndex !== -1 && currentIndex < allMilestones.length - 1) {
          const nextMilestone = allMilestones[currentIndex + 1];

          await supabase
            .from('creator_milestones')
            .update({ status: 'available' })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[sign-agreement] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
