import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('=== VERIFICATION: RAE MILESTONES REMOVAL ===\n');

  // 1. Confirm deleted milestones are gone
  console.log('1. Confirming deleted milestones are gone...');
  const { data: deletedMilestones } = await supabase
    .from('milestones')
    .select('id, name')
    .in('id', ['rae_meeting_scheduled', 'rae_meeting_completed']);

  if (deletedMilestones?.length === 0) {
    console.log('   ✓ rae_meeting_scheduled and rae_meeting_completed successfully deleted\n');
  } else {
    console.log('   ✗ PROBLEM: Found these milestones still exist:', deletedMilestones);
  }

  // 2. Show all onboarding milestones with sort_order
  console.log('2. Current onboarding milestones (verify no gaps in sort_order):');
  const { data: onboardingMilestones } = await supabase
    .from('milestones')
    .select('id, name, sort_order')
    .eq('phase_id', 'onboarding')
    .order('sort_order');

  console.table(onboardingMilestones);

  // 3. Show first Agreement milestone (should be next after onboarding)
  console.log('\n3. First Agreement phase milestone (next after onboarding):');
  const { data: agreementMilestones } = await supabase
    .from('milestones')
    .select('id, name, sort_order')
    .eq('phase_id', 'agreement')
    .order('sort_order')
    .limit(3);

  console.table(agreementMilestones);

  // 4. Check for orphaned creator_milestones
  console.log('\n4. Checking for orphaned creator_milestones...');
  const { data: orphaned } = await supabase
    .from('creator_milestones')
    .select('*')
    .in('milestone_id', ['rae_meeting_scheduled', 'rae_meeting_completed']);

  if (orphaned?.length === 0) {
    console.log('   ✓ No orphaned creator_milestones found\n');
  } else {
    console.log('   ✗ PROBLEM: Found orphaned records:', orphaned.length);
  }

  // 5. Show creators with 'available' status (their current next action)
  console.log('5. Creators currently at "available" milestone (their next action):');
  const { data: availableMilestones } = await supabase
    .from('creator_milestones')
    .select(`
      creator_id,
      milestone_id,
      status,
      creators!inner(name, email)
    `)
    .eq('status', 'available')
    .order('creator_id');

  if (availableMilestones?.length > 0) {
    const formatted = availableMilestones.map(cm => ({
      creator_name: cm.creators.name,
      email: cm.creators.email,
      available_milestone: cm.milestone_id
    }));
    console.table(formatted);
  } else {
    console.log('   No creators with available milestones found');
  }

  // 6. Show all phases and their milestones ordered correctly
  console.log('\n6. All phases with milestone counts:');
  const { data: phases } = await supabase
    .from('phases')
    .select('id, name, sort_order')
    .order('sort_order');

  for (const phase of phases || []) {
    const { count } = await supabase
      .from('milestones')
      .select('*', { count: 'exact', head: true })
      .eq('phase_id', phase.id);
    console.log(`   ${phase.sort_order}. ${phase.name} (${phase.id}): ${count} milestones`);
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

main().catch(console.error);
