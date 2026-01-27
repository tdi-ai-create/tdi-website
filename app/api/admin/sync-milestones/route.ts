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

    // 1. Delete old Agreement milestones
    const { error: deleteError } = await supabase
      .from('milestones')
      .delete()
      .in('id', ['agreement_team_sends', 'agreement_creator_signs', 'agreement_added_to_log']);

    if (deleteError) {
      console.log('[sync-milestones] Delete error (may be ok if not found):', deleteError);
    }

    // 2. Insert new simplified Agreement milestone
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

    // 4. Clean up old milestone references for existing creators
    const { error: cleanupError } = await supabase
      .from('creator_milestones')
      .delete()
      .in('milestone_id', ['agreement_team_sends', 'agreement_creator_signs', 'agreement_added_to_log']);

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

    // 7. Get current milestones to verify
    const { data: milestones } = await supabase
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
      message: 'Milestones synced successfully',
      creatorsUpdated: creators?.length || 0,
      phases,
      milestones
    });
  } catch (error) {
    console.error('[sync-milestones] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
