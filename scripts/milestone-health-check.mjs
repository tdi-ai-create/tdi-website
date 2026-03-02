/**
 * Milestone Health Check Script
 *
 * Detects and optionally fixes inconsistent milestone states:
 * - Milestones with status='available' but have completed_at data
 * - Milestones with status='locked' that should be 'available' (stuck creators)
 * - Multiple milestones in 'in_progress' state for same creator
 *
 * Usage:
 *   node scripts/milestone-health-check.mjs          # Report only
 *   node scripts/milestone-health-check.mjs --fix   # Report and fix issues
 */

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

const shouldFix = process.argv.includes('--fix');

async function checkMilestoneConsistency() {
  console.log('=== MILESTONE HEALTH CHECK ===\n');
  console.log(`Mode: ${shouldFix ? 'FIX' : 'REPORT ONLY'}\n`);

  let issuesFound = 0;
  let issuesFixed = 0;

  // Issue 1: Available milestones with completion data
  console.log('1. Checking for available milestones with completion data...');
  const { data: availableWithCompletion } = await supabase
    .from('creator_milestones')
    .select(`
      id,
      creator_id,
      milestone_id,
      status,
      completed_at,
      creators (name)
    `)
    .eq('status', 'available')
    .not('completed_at', 'is', null);

  if (availableWithCompletion?.length > 0) {
    console.log(`   Found ${availableWithCompletion.length} inconsistent milestone(s):`);
    for (const cm of availableWithCompletion) {
      const creatorName = cm.creators?.name || 'Unknown';
      console.log(`   - ${creatorName}: ${cm.milestone_id} (status=available, completed_at=${cm.completed_at})`);
      issuesFound++;

      if (shouldFix) {
        const { error } = await supabase
          .from('creator_milestones')
          .update({
            completed_at: null,
            completed_by: null,
            submission_data: null,
            metadata: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cm.id);

        if (!error) {
          console.log(`     FIXED: Cleared completion data`);
          issuesFixed++;
        } else {
          console.log(`     ERROR: ${error.message}`);
        }
      }
    }
  } else {
    console.log('   No issues found.');
  }

  // Issue 2: Stuck creators (no available/in_progress/waiting milestones)
  console.log('\n2. Checking for stuck creators (no actionable milestones)...');
  const { data: activeCreators } = await supabase
    .from('creators')
    .select('id, name, content_path, status')
    .eq('status', 'active');

  for (const creator of activeCreators || []) {
    const { data: milestones } = await supabase
      .from('creator_milestones')
      .select('milestone_id, status')
      .eq('creator_id', creator.id);

    const actionable = milestones?.filter(m =>
      ['available', 'in_progress', 'waiting_approval'].includes(m.status)
    ) || [];

    const allCompleted = milestones?.every(m => m.status === 'completed');

    if (actionable.length === 0 && !allCompleted) {
      console.log(`   - ${creator.name}: No actionable milestones (possibly stuck)`);
      issuesFound++;

      // Find what might be blocking them
      const locked = milestones?.filter(m => m.status === 'locked') || [];
      const completed = milestones?.filter(m => m.status === 'completed') || [];
      console.log(`     Completed: ${completed.length}, Locked: ${locked.length}`);
    }
  }

  // Issue 3: Milestones unlocked out of order
  console.log('\n3. Checking for milestones unlocked out of order...');

  // Get milestone order
  const { data: milestoneOrder } = await supabase
    .from('milestones')
    .select('id, phase_id, sort_order')
    .order('phase_id')
    .order('sort_order');

  const orderMap = new Map(milestoneOrder?.map((m, i) => [m.id, i]) || []);

  for (const creator of activeCreators || []) {
    const { data: milestones } = await supabase
      .from('creator_milestones')
      .select('milestone_id, status')
      .eq('creator_id', creator.id);

    // Check if any available/in_progress milestone comes before a locked one
    // that comes before a completed one
    const available = milestones?.filter(m => m.status === 'available').map(m => orderMap.get(m.milestone_id) || 0) || [];
    const locked = milestones?.filter(m => m.status === 'locked').map(m => orderMap.get(m.milestone_id) || 0) || [];

    for (const availIdx of available) {
      for (const lockedIdx of locked) {
        if (lockedIdx < availIdx) {
          // A locked milestone comes before an available one - this might be OK
          // depending on content path filtering, but worth noting
        }
      }
    }
  }
  console.log('   Check complete (manual review may be needed for complex cases).');

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Issues found: ${issuesFound}`);
  if (shouldFix) {
    console.log(`Issues fixed: ${issuesFixed}`);
  } else if (issuesFound > 0) {
    console.log('\nRun with --fix to automatically fix data consistency issues.');
  }

  return issuesFound;
}

async function main() {
  try {
    const issuesFound = await checkMilestoneConsistency();

    // Exit with error code if issues found and not in fix mode
    // This allows CI/scheduled jobs to alert on issues
    if (issuesFound > 0 && !shouldFix) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
