/**
 * Script to update Ian Bowen's creator record for course launch
 * Run with: node scripts/update-ian-bowen-launch.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Blog milestone IDs to mark as optional
const BLOG_MILESTONE_IDS = [
  'blog_pitch',
  'blog_topic_approved',
  'blog_drafted',
  'blog_published'
];

async function main() {
  console.log('='.repeat(60));
  console.log('Updating Ian Bowen for Course Launch');
  console.log('='.repeat(60));

  // 1. Find Ian Bowen by email
  console.log('\n1. Finding Ian Bowen...');
  const { data: creator, error: findError } = await supabase
    .from('creators')
    .select('*')
    .eq('email', 'ian@thepositivepersistence.com')
    .single();

  if (findError || !creator) {
    console.error('Error finding Ian Bowen:', findError?.message || 'Not found');
    process.exit(1);
  }

  console.log(`✓ Found creator: ${creator.name} (ID: ${creator.id})`);
  console.log(`  Current phase: ${creator.current_phase}`);
  console.log(`  Content path: ${creator.content_path}`);

  // 2. Update to launch phase
  console.log('\n2. Updating to launch phase...');

  const { error: updateError } = await supabase
    .from('creators')
    .update({
      current_phase: 'launch'
    })
    .eq('id', creator.id);

  if (updateError) {
    console.error('Error updating creator:', updateError.message);
    process.exit(1);
  }

  console.log('✓ Updated current_phase to: launch');

  // 3. Get all milestones for this creator
  console.log('\n3. Fetching milestones...');
  const { data: creatorMilestones, error: msError } = await supabase
    .from('creator_milestones')
    .select(`
      *,
      milestone:milestones(*)
    `)
    .eq('creator_id', creator.id);

  if (msError) {
    console.error('Error fetching milestones:', msError.message);
    process.exit(1);
  }

  console.log(`  Found ${creatorMilestones.length} milestone records`);

  // 4. Complete all non-blog course milestones that aren't already completed
  console.log('\n4. Completing remaining course milestones...');

  const contentPath = creator.content_path || 'course';
  let completedCount = 0;
  let alreadyCompletedCount = 0;

  for (const cm of creatorMilestones) {
    const milestone = cm.milestone;
    const milestoneId = cm.milestone_id;

    // Skip blog milestones
    if (BLOG_MILESTONE_IDS.includes(milestoneId)) {
      continue;
    }

    // Check if milestone applies to this content path
    const appliesTo = milestone?.applies_to;
    if (appliesTo && !appliesTo.includes(contentPath)) {
      continue;
    }

    // Skip already completed
    if (cm.status === 'completed') {
      alreadyCompletedCount++;
      continue;
    }

    // Complete the milestone
    const existingMetadata = cm.metadata || {};
    const { error: completeError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: 'rae@teachersdeserveit.com',
        metadata: {
          ...existingMetadata,
          out_of_order: true,
          admin_email: 'rae@teachersdeserveit.com',
          admin_note: 'Course launched - completing remaining milestones'
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', cm.id);

    if (completeError) {
      console.error(`  Error completing ${milestoneId}:`, completeError.message);
    } else {
      console.log(`  ✓ Completed: ${milestone?.name || milestoneId}`);
      completedCount++;
    }
  }

  console.log(`  Already completed: ${alreadyCompletedCount}`);
  console.log(`  Newly completed: ${completedCount}`);

  // 5. Mark blog milestones as OPTIONAL
  console.log('\n5. Marking blog milestones as OPTIONAL...');

  const reason = 'Course published — blog available as optional marketing support';
  let optionalCount = 0;

  for (const cm of creatorMilestones) {
    if (!BLOG_MILESTONE_IDS.includes(cm.milestone_id)) {
      continue;
    }

    const existingMetadata = cm.metadata || {};
    const { error: optionalError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'available', // Make them available as bonus options
        metadata: {
          ...existingMetadata,
          is_optional: true,
          optional_reason: reason,
          optional_set_by: 'rae@teachersdeserveit.com',
          optional_set_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', cm.id);

    if (optionalError) {
      console.error(`  Error marking ${cm.milestone_id} optional:`, optionalError.message);
    } else {
      const milestoneName = cm.milestone?.name || cm.milestone_id;
      console.log(`  ✓ Marked as optional: ${milestoneName}`);
      optionalCount++;
    }
  }

  console.log(`  Total marked optional: ${optionalCount}`);

  // 6. Add creator note
  console.log('\n6. Adding creator note...');

  const noteContent = `Course is LIVE! Blog option remains open as optional marketing support.`;

  const { error: noteError } = await supabase
    .from('creator_notes')
    .insert({
      creator_id: creator.id,
      content: noteContent,
      author: 'Rae',
      phase_id: 'launch',
      visible_to_creator: false
    });

  if (noteError) {
    console.error('Error adding note:', noteError.message);
  } else {
    console.log('✓ Added launch note');
  }

  // 7. Verify final state
  console.log('\n7. Verifying final state...');

  // Re-fetch creator
  const { data: updatedCreator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', creator.id)
    .single();

  console.log(`  Name: ${updatedCreator.name}`);
  console.log(`  Email: ${updatedCreator.email}`);
  console.log(`  Phase: ${updatedCreator.current_phase}`);
  console.log(`  Content Path: ${updatedCreator.content_path}`);

  // Re-fetch milestones for progress calculation
  const { data: finalMilestones } = await supabase
    .from('creator_milestones')
    .select(`
      *,
      milestone:milestones(*)
    `)
    .eq('creator_id', creator.id);

  // Filter for applicable milestones
  const applicableMilestones = finalMilestones.filter(cm => {
    const appliesTo = cm.milestone?.applies_to;
    if (!appliesTo) return true;
    return appliesTo.includes(contentPath);
  });

  // Separate core and optional
  const coreMilestones = applicableMilestones.filter(cm => {
    const meta = cm.metadata;
    return !meta?.is_optional;
  });

  const optionalMilestones = applicableMilestones.filter(cm => {
    const meta = cm.metadata;
    return meta?.is_optional === true;
  });

  const coreCompleted = coreMilestones.filter(cm => cm.status === 'completed').length;
  const coreTotal = coreMilestones.length;
  const corePercent = coreTotal > 0 ? Math.round((coreCompleted / coreTotal) * 100) : 0;

  console.log(`\n  Progress Summary:`);
  console.log(`    Core milestones: ${coreCompleted}/${coreTotal} (${corePercent}%)`);
  console.log(`    Optional/Bonus milestones: ${optionalMilestones.length}`);

  if (corePercent === 100) {
    console.log('\n  🎉 Course path 100% complete! Portal will show celebration state.');
  } else {
    console.log(`\n  ⚠️ Core completion is ${corePercent}%, expected 100%`);
    console.log('  Incomplete core milestones:');
    for (const cm of coreMilestones.filter(m => m.status !== 'completed')) {
      console.log(`    - ${cm.milestone?.name || cm.milestone_id} (${cm.status})`);
    }
  }

  // List bonus milestones
  console.log('\n  Bonus milestones available:');
  for (const cm of optionalMilestones) {
    console.log(`    - ${cm.milestone?.name || cm.milestone_id} (${cm.status})`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Ian Bowen launch update complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
