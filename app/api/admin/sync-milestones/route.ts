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

    // Old agreement milestone IDs to delete
    const oldAgreementIds = ['agreement_sent', 'agreement_signed', 'added_to_log'];

    // 1. FIRST: Delete creator_milestones that reference old agreement milestones
    // This must happen BEFORE deleting the milestones due to foreign key constraint
    const { data: deletedCreatorMilestones, error: cleanupError } = await supabase
      .from('creator_milestones')
      .delete()
      .in('milestone_id', oldAgreementIds)
      .select();

    console.log('[sync-milestones] Deleted creator_milestones:', {
      count: deletedCreatorMilestones?.length,
      error: cleanupError?.message
    });

    // 2. NOW delete the old agreement milestones from milestones table
    const { data: deletedMilestones, error: deleteError } = await supabase
      .from('milestones')
      .delete()
      .in('id', oldAgreementIds)
      .select();

    console.log('[sync-milestones] Deleted milestones:', {
      count: deletedMilestones?.length,
      error: deleteError?.message
    });

    // 3. Insert new single Agreement milestone
    const { error: insertError } = await supabase
      .from('milestones')
      .upsert({
        id: 'agreement_sign',
        phase_id: 'agreement',
        name: 'Sign Agreement',
        description: 'Digitally sign your creator agreement',
        requires_team_action: false,
        sort_order: 1
      });

    if (insertError) {
      console.error('[sync-milestones] Insert milestone error:', insertError);
    }

    // 4. Update phase description
    const { error: phaseError } = await supabase
      .from('phases')
      .update({ description: 'Finalize your creator agreement' })
      .eq('id', 'agreement');

    if (phaseError) {
      console.error('[sync-milestones] Update phase error:', phaseError);
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
