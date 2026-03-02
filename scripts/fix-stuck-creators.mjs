import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMilestoneConfig() {
  console.log('=== FIXING MILESTONE CONFIGURATION ===\n');

  // 1. Update agreement_sign to apply to all content paths
  console.log('1. Updating agreement_sign to apply to all paths...');
  const { error: agreementError } = await supabase
    .from('milestones')
    .update({ applies_to: ['blog', 'download', 'course'] })
    .eq('id', 'agreement_sign');

  if (agreementError) {
    console.log('   ❌ Error:', agreementError.message);
  } else {
    console.log('   ✅ agreement_sign now applies to: blog, download, course');
  }

  // 2. Update launched to apply to blog path as well
  // Blog creators should see "launched" after blog_published
  console.log('\n2. Updating launched to apply to blog path...');
  const { error: launchedError } = await supabase
    .from('milestones')
    .update({ applies_to: ['blog', 'course'] })
    .eq('id', 'launched');

  if (launchedError) {
    console.log('   ❌ Error:', launchedError.message);
  } else {
    console.log('   ✅ launched now applies to: blog, course');
  }

  // 3. Also update creator_details to apply to all paths
  console.log('\n3. Updating creator_details to apply to all paths...');
  const { error: detailsError } = await supabase
    .from('milestones')
    .update({ applies_to: ['blog', 'download', 'course'] })
    .eq('id', 'creator_details');

  if (detailsError) {
    console.log('   ❌ Error:', detailsError.message);
  } else {
    console.log('   ✅ creator_details now applies to: blog, download, course');
  }
}

async function fixStuckCreators() {
  console.log('\n\n=== FIXING STUCK CREATORS ===\n');

  // Get all active creators with their milestones
  const { data: creators } = await supabase
    .from('creators')
    .select('*')
    .eq('status', 'active');

  for (const creator of creators) {
    const { data: creatorMilestones } = await supabase
      .from('creator_milestones')
      .select('*')
      .eq('creator_id', creator.id);

    let fixed = false;

    // Fix 1: Mark content_path_selection as completed if creator already has a path
    const contentPathMilestone = creatorMilestones?.find(cm => cm.milestone_id === 'content_path_selection');
    if (contentPathMilestone?.status === 'available' && creator.content_path) {
      console.log(`Fixing ${creator.name}: Completing content_path_selection (already has path: ${creator.content_path})`);

      const { error } = await supabase
        .from('creator_milestones')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: 'system-fix'
        })
        .eq('id', contentPathMilestone.id);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Marked content_path_selection as completed`);
        fixed = true;
      }
    }

    // Fix 2: If creator has completed blog_published but launched is available and doesn't apply,
    // we need to unlock create_again
    const blogPublished = creatorMilestones?.find(cm => cm.milestone_id === 'blog_published');
    const launched = creatorMilestones?.find(cm => cm.milestone_id === 'launched');
    const createAgain = creatorMilestones?.find(cm => cm.milestone_id === 'create_again');

    if (creator.content_path === 'blog' &&
        blogPublished?.status === 'completed' &&
        createAgain?.status === 'locked') {
      console.log(`Fixing ${creator.name}: Unlocking create_again (blog_published is done)`);

      // First, mark launched as completed (blog creators don't need it)
      if (launched?.status !== 'completed') {
        const { error: launchError } = await supabase
          .from('creator_milestones')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: 'system-fix',
            metadata: { skipped_for_blog_path: true }
          })
          .eq('id', launched.id);

        if (!launchError) {
          console.log(`   ✅ Marked launched as completed (skipped for blog path)`);
        }
      }

      // Then unlock create_again
      const { error } = await supabase
        .from('creator_milestones')
        .update({ status: 'available' })
        .eq('id', createAgain.id);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Unlocked create_again milestone`);
        fixed = true;
      }
    }

    // Fix 3: If agreement_sign is available but locked (was course-only), unlock it
    const agreementSign = creatorMilestones?.find(cm => cm.milestone_id === 'agreement_sign');
    if (agreementSign?.status === 'locked' &&
        (creator.content_path === 'blog' || creator.content_path === 'download')) {
      // Check if previous onboarding milestones are complete
      const onboardingComplete = creatorMilestones?.filter(cm =>
        cm.milestone_id === 'intake_completed' ||
        cm.milestone_id === 'content_path_selection' ||
        cm.milestone_id === 'team_intake_review' ||
        cm.milestone_id === 'creator_intake_review'
      ).every(cm => cm.status === 'completed');

      if (onboardingComplete) {
        console.log(`Fixing ${creator.name}: Unlocking agreement_sign (onboarding complete, non-course path)`);

        const { error } = await supabase
          .from('creator_milestones')
          .update({ status: 'available' })
          .eq('id', agreementSign.id);

        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✅ Unlocked agreement_sign milestone`);
          fixed = true;
        }
      }
    }

    if (!fixed) {
      // Check if they're actually stuck
      const available = creatorMilestones?.filter(cm => cm.status === 'available') || [];
      const inProgress = creatorMilestones?.filter(cm => cm.status === 'in_progress') || [];
      const waiting = creatorMilestones?.filter(cm => cm.status === 'waiting_approval') || [];

      if (available.length === 0 && inProgress.length === 0 && waiting.length === 0) {
        console.log(`⚠️ ${creator.name} may still be stuck - no available milestones`);
      }
    }
  }
}

async function verifyFixes() {
  console.log('\n\n=== VERIFYING FIXES ===\n');

  // Check the milestone configs
  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, name, applies_to')
    .in('id', ['agreement_sign', 'launched', 'creator_details']);

  console.log('Updated milestone configurations:');
  for (const m of milestones || []) {
    console.log(`  ${m.id}: applies_to = ${JSON.stringify(m.applies_to)}`);
  }

  // Check the stuck creators
  console.log('\n\nChecking previously stuck creators:');

  const stuckNames = ['Aitabé', 'Kimberelle'];
  for (const name of stuckNames) {
    const { data: creator } = await supabase
      .from('creators')
      .select('*')
      .ilike('name', `%${name}%`)
      .single();

    if (!creator) continue;

    const { data: milestones } = await supabase
      .from('creator_milestones')
      .select('milestone_id, status')
      .eq('creator_id', creator.id)
      .in('status', ['available', 'in_progress', 'waiting_approval']);

    console.log(`\n${creator.name}:`);
    console.log(`  Available/In-Progress milestones: ${milestones?.length || 0}`);
    milestones?.forEach(m => {
      console.log(`    - ${m.milestone_id} (${m.status})`);
    });
  }
}

async function main() {
  try {
    await fixMilestoneConfig();
    await fixStuckCreators();
    await verifyFixes();
    console.log('\n\n✅ All fixes applied successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
