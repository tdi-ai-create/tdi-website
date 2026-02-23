import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const MILESTONE_IDS_TO_DELETE = ['rae_meeting_scheduled', 'rae_meeting_completed'];

async function main() {
  console.log('=== REMOVING RAE MEETING MILESTONES ===\n');

  // Step 1: Show what we're about to delete
  console.log('Step 1: Checking existing records...\n');

  const { data: milestonesToDelete, error: checkError } = await supabase
    .from('milestones')
    .select('*')
    .in('id', MILESTONE_IDS_TO_DELETE);

  if (checkError) {
    console.error('Error checking milestones:', checkError);
    return;
  }

  console.log('Milestones to delete:');
  console.table(milestonesToDelete);

  const { data: creatorMilestonesToDelete, error: cmCheckError } = await supabase
    .from('creator_milestones')
    .select('*')
    .in('milestone_id', MILESTONE_IDS_TO_DELETE);

  if (cmCheckError) {
    console.error('Error checking creator_milestones:', cmCheckError);
    return;
  }

  console.log(`\nCreator milestone records to delete: ${creatorMilestonesToDelete?.length || 0}`);
  if (creatorMilestonesToDelete?.length > 0) {
    console.table(creatorMilestonesToDelete);
  }

  // Find creators whose current 'available' milestone is one we're deleting
  const creatorsToFix = creatorMilestonesToDelete?.filter(cm => cm.status === 'available') || [];
  console.log(`\nCreators with 'available' status on deleted milestones: ${creatorsToFix.length}`);
  if (creatorsToFix.length > 0) {
    console.table(creatorsToFix);
  }

  // Step 2: Delete creator_milestones records
  console.log('\n--- Step 2: Deleting creator_milestones records ---\n');

  const { data: deletedCM, error: deleteCMError } = await supabase
    .from('creator_milestones')
    .delete()
    .in('milestone_id', MILESTONE_IDS_TO_DELETE)
    .select();

  if (deleteCMError) {
    console.error('Error deleting creator_milestones:', deleteCMError);
    return;
  }

  console.log(`Deleted ${deletedCM?.length || 0} creator_milestones records`);

  // Step 3: Delete milestones
  console.log('\n--- Step 3: Deleting milestones ---\n');

  const { data: deletedM, error: deleteMError } = await supabase
    .from('milestones')
    .delete()
    .in('id', MILESTONE_IDS_TO_DELETE)
    .select();

  if (deleteMError) {
    console.error('Error deleting milestones:', deleteMError);
    return;
  }

  console.log(`Deleted ${deletedM?.length || 0} milestones`);
  console.table(deletedM);

  // Step 4: Update sort_order for remaining onboarding milestones
  console.log('\n--- Step 4: Updating sort_order for remaining onboarding milestones ---\n');

  // Get all onboarding milestones ordered by current sort_order
  const { data: onboardingMilestones, error: onboardingError } = await supabase
    .from('milestones')
    .select('*')
    .eq('phase_id', 'onboarding')
    .order('sort_order', { ascending: true });

  if (onboardingError) {
    console.error('Error fetching onboarding milestones:', onboardingError);
    return;
  }

  console.log('Current onboarding milestones:');
  console.table(onboardingMilestones);

  // Re-number them sequentially starting from 1
  for (let i = 0; i < onboardingMilestones.length; i++) {
    const newSortOrder = i + 1;
    if (onboardingMilestones[i].sort_order !== newSortOrder) {
      const { error: updateError } = await supabase
        .from('milestones')
        .update({ sort_order: newSortOrder })
        .eq('id', onboardingMilestones[i].id);

      if (updateError) {
        console.error(`Error updating sort_order for ${onboardingMilestones[i].id}:`, updateError);
      } else {
        console.log(`Updated ${onboardingMilestones[i].id} sort_order: ${onboardingMilestones[i].sort_order} -> ${newSortOrder}`);
      }
    }
  }

  // Step 5: Fix creators whose available milestone was deleted
  console.log('\n--- Step 5: Fixing creators whose available milestone was deleted ---\n');

  if (creatorsToFix.length > 0) {
    // Get the first milestone in the Agreement phase
    const { data: agreementMilestones, error: agreementError } = await supabase
      .from('milestones')
      .select('*')
      .eq('phase_id', 'agreement')
      .order('sort_order', { ascending: true })
      .limit(1);

    if (agreementError) {
      console.error('Error fetching agreement milestones:', agreementError);
      return;
    }

    const nextMilestoneId = agreementMilestones?.[0]?.id;
    console.log(`Next milestone after onboarding should be: ${nextMilestoneId}`);

    if (nextMilestoneId) {
      for (const cm of creatorsToFix) {
        // Check if this creator already has the next milestone
        const { data: existingNext, error: existingError } = await supabase
          .from('creator_milestones')
          .select('*')
          .eq('creator_id', cm.creator_id)
          .eq('milestone_id', nextMilestoneId)
          .single();

        if (existingError && existingError.code !== 'PGRST116') {
          console.error(`Error checking existing milestone for creator ${cm.creator_id}:`, existingError);
          continue;
        }

        if (existingNext) {
          // Update existing record to 'available'
          const { error: updateError } = await supabase
            .from('creator_milestones')
            .update({ status: 'available' })
            .eq('creator_id', cm.creator_id)
            .eq('milestone_id', nextMilestoneId);

          if (updateError) {
            console.error(`Error updating milestone for creator ${cm.creator_id}:`, updateError);
          } else {
            console.log(`Updated creator ${cm.creator_id}: set ${nextMilestoneId} to 'available'`);
          }
        } else {
          // Insert new record with 'available' status
          const { error: insertError } = await supabase
            .from('creator_milestones')
            .insert({
              creator_id: cm.creator_id,
              milestone_id: nextMilestoneId,
              status: 'available'
            });

          if (insertError) {
            console.error(`Error inserting milestone for creator ${cm.creator_id}:`, insertError);
          } else {
            console.log(`Inserted creator ${cm.creator_id}: ${nextMilestoneId} as 'available'`);
          }
        }
      }
    }
  } else {
    console.log('No creators needed fixing.');
  }

  // Step 6: Verification
  console.log('\n=== VERIFICATION ===\n');

  console.log('--- Onboarding milestones after cleanup ---');
  const { data: finalOnboarding, error: finalError } = await supabase
    .from('milestones')
    .select('*')
    .eq('phase_id', 'onboarding')
    .order('sort_order', { ascending: true });

  if (finalError) {
    console.error('Error:', finalError);
  } else {
    console.table(finalOnboarding);
  }

  console.log('\n--- Check for orphaned creator_milestones ---');
  const { data: orphaned, error: orphanedError } = await supabase
    .from('creator_milestones')
    .select('*')
    .in('milestone_id', MILESTONE_IDS_TO_DELETE);

  if (orphanedError) {
    console.error('Error:', orphanedError);
  } else if (orphaned?.length > 0) {
    console.log('WARNING: Found orphaned records:');
    console.table(orphaned);
  } else {
    console.log('No orphaned creator_milestones found.');
  }

  console.log('\n--- Creators who may need progress review ---');
  // Show creators who had any interaction with the deleted milestones
  const affectedCreatorIds = [...new Set(creatorMilestonesToDelete?.map(cm => cm.creator_id) || [])];

  if (affectedCreatorIds.length > 0) {
    const { data: affectedCreators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, email, status')
      .in('id', affectedCreatorIds);

    if (creatorsError) {
      console.error('Error:', creatorsError);
    } else {
      console.log('Affected creators:');
      console.table(affectedCreators);
    }
  } else {
    console.log('No creators were affected.');
  }

  console.log('\n=== COMPLETE ===');
}

main().catch(console.error);
