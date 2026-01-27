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

    console.log('[sign-agreement] Attempting to sign for creator:', creatorId);

    // First verify the creator exists
    const { data: existingCreator, error: fetchError } = await supabase
      .from('creators')
      .select('id, name, agreement_signed')
      .eq('id', creatorId)
      .single();

    if (fetchError || !existingCreator) {
      console.error('[sign-agreement] Creator not found:', fetchError);
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    console.log('[sign-agreement] Found creator:', existingCreator.name);

    // Update creator record with agreement signature
    // Note: Only update fields we know exist from the original schema
    const { data: updateData, error: updateError } = await supabase
      .from('creators')
      .update({
        agreement_signed: true,
        agreement_signed_at: new Date().toISOString(),
        agreement_signed_name: signedName,
      })
      .eq('id', creatorId)
      .select();

    if (updateError) {
      console.error('[sign-agreement] Update error:', updateError);
      // Provide detailed error for debugging
      return NextResponse.json(
        {
          error: `Failed to save agreement signature: ${updateError.message}`,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        },
        { status: 500 }
      );
    }

    if (!updateData || updateData.length === 0) {
      console.error('[sign-agreement] No rows updated - creator may not exist');
      return NextResponse.json(
        { error: 'No creator record updated - please try again' },
        { status: 500 }
      );
    }

    console.log('[sign-agreement] Creator updated successfully:', updateData[0]?.name);

    // Mark the "Sign Agreement" milestone as complete
    // The milestone ID is 'agreement_sign' - we can also try to find by name as fallback
    let milestoneId = 'agreement_sign';

    // Verify the milestone exists (also try by name in case ID differs)
    const { data: milestones, error: milestoneSearchError } = await supabase
      .from('milestones')
      .select('id, name')
      .eq('phase_id', 'agreement');

    console.log('[sign-agreement] Agreement milestones found:', milestones, 'Error:', milestoneSearchError);

    if (milestones && milestones.length > 0) {
      // Use the first agreement milestone
      milestoneId = milestones[0].id;
      console.log('[sign-agreement] Using milestone ID:', milestoneId);

      // Update the creator_milestones record
      const { data: milestoneUpdateData, error: milestoneError } = await supabase
        .from('creator_milestones')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: signedName,
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', milestoneId)
        .select();

      if (milestoneError) {
        console.error('[sign-agreement] Milestone update error:', milestoneError);
        // Don't fail the whole request, just log it
      } else {
        console.log('[sign-agreement] Milestone updated:', milestoneUpdateData);
      }

      // Unlock the next milestone if there is one
      const { data: allMilestones } = await supabase
        .from('milestones')
        .select('id, phase_id, sort_order')
        .order('phase_id')
        .order('sort_order');

      if (allMilestones) {
        const currentIndex = allMilestones.findIndex((m) => m.id === milestoneId);
        console.log('[sign-agreement] Current milestone index:', currentIndex, 'of', allMilestones.length);

        if (currentIndex !== -1 && currentIndex < allMilestones.length - 1) {
          const nextMilestone = allMilestones[currentIndex + 1];
          console.log('[sign-agreement] Unlocking next milestone:', nextMilestone.id);

          const { error: unlockError } = await supabase
            .from('creator_milestones')
            .update({ status: 'available' })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');

          if (unlockError) {
            console.error('[sign-agreement] Unlock error:', unlockError);
          }
        }
      }
    } else {
      console.warn('[sign-agreement] No agreement milestones found - agreement signed but milestone not updated');
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
