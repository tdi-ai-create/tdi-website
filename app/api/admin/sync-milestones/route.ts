import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('[sync-milestones] Starting sync...');

    // 1. Delete ALL Agreement milestones (by phase_id to catch any)
    const { error: deleteError } = await supabase
      .from('milestones')
      .delete()
      .eq('phase_id', 'agreement');

    if (deleteError) {
      console.log('[sync-milestones] Delete error (may be ok if not found):', deleteError);
    }

    // 2. Insert new single Agreement milestone
    const { error: insertError } = await supabase
      .from('milestones')
      .insert({
        id: 'agreement_sign',
        phase_id: 'agreement',
        name: 'Sign Agreement',
        description: 'Digitally sign your creator agreement',
        creator_description: 'Digitally sign your creator agreement',
        admin_description: 'Creator signs the Independent Content Creator Agreement',
        sort_order: 1,
        requires_team_action: false,
        action_type: 'sign_agreement',
        action_config: { label: 'Sign Agreement' }
      });

    if (insertError) {
      console.log('[sync-milestones] Insert error, trying upsert:', insertError);
      // Try upsert instead
      const { error: upsertError } = await supabase
        .from('milestones')
        .upsert({
          id: 'agreement_sign',
          phase_id: 'agreement',
          name: 'Sign Agreement',
          description: 'Digitally sign your creator agreement',
          creator_description: 'Digitally sign your creator agreement',
          admin_description: 'Creator signs the Independent Content Creator Agreement',
          sort_order: 1,
          requires_team_action: false,
          action_type: 'sign_agreement',
          action_config: { label: 'Sign Agreement' }
        });

      if (upsertError) {
        console.error('[sync-milestones] Upsert milestone error:', upsertError);
      }
    }

    // 3. Update phases to have correct descriptions
    const { error: phasesError } = await supabase
      .from('phases')
      .upsert([
        { id: 'onboarding', name: 'Onboarding', description: 'Get set up and ready to create', sort_order: 1 },
        { id: 'agreement', name: 'Agreement', description: 'Finalize your creator agreement', sort_order: 2 },
        { id: 'course_design', name: 'Course Design', description: 'Plan and outline your course content', sort_order: 3 },
        { id: 'test_prep', name: 'Test & Prep', description: 'Prepare for recording', sort_order: 4 },
        { id: 'production', name: 'Production', description: 'Record your course content', sort_order: 5 },
        { id: 'launch', name: 'Launch', description: 'Go live!', sort_order: 6 }
      ]);

    if (phasesError) {
      console.error('[sync-milestones] Upsert phases error:', phasesError);
    }

    // 4. Clean up old milestone references for existing creators (catch any agreement-related)
    const { error: cleanupError } = await supabase
      .from('creator_milestones')
      .delete()
      .like('milestone_id', 'agreement%');

    if (cleanupError) {
      console.log('[sync-milestones] Cleanup error (may be ok if not found):', cleanupError);
    }

    // 5. Get all creators
    const { data: creators } = await supabase
      .from('creators')
      .select('id');

    // 6. Add the new agreement milestone for each creator
    if (creators && creators.length > 0) {
      for (const creator of creators) {
        await supabase
          .from('creator_milestones')
          .upsert({
            creator_id: creator.id,
            milestone_id: 'agreement_sign',
            status: 'locked' // Will be unlocked when they complete onboarding
          }, {
            onConflict: 'creator_id,milestone_id'
          });
      }
      console.log(`[sync-milestones] Updated ${creators.length} creators`);
    }

    // 7. Get agreement milestones to verify (should be just one)
    const { data: agreementMilestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('phase_id', 'agreement');

    // 8. Get all milestones for overview
    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('id, phase_id, name, sort_order')
      .order('phase_id')
      .order('sort_order');

    const { data: phases } = await supabase
      .from('phases')
      .select('id, name, sort_order')
      .order('sort_order');

    console.log('[sync-milestones] Sync complete');

    return NextResponse.json({
      success: true,
      message: 'Agreement milestones synced to single step',
      creatorsUpdated: creators?.length || 0,
      agreementMilestones,
      phases,
      allMilestones
    });
  } catch (error) {
    console.error('[sync-milestones] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
