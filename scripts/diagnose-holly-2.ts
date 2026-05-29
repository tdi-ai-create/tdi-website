import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const HOLLY_ID = '264f389a-dfb8-42cb-ba17-494ceb31cf09';

async function main() {
  // Full agreement_sign milestone definition
  console.log('=== agreement_sign milestone full definition ===');
  const { data: ms } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', 'agreement_sign')
    .single();
  console.log(JSON.stringify(ms, null, 2));

  // All milestones in the agreement phase
  console.log('\n=== All milestones in agreement phase (unfiltered) ===');
  const { data: allAgreementMs } = await supabase
    .from('milestones')
    .select('*')
    .eq('phase_id', 'agreement');
  for (const m of allAgreementMs || []) {
    console.log(JSON.stringify(m, null, 2));
  }

  // The agreement phase definition
  console.log('\n=== Agreement phase definition ===');
  const { data: phase } = await supabase
    .from('phases')
    .select('*')
    .eq('id', 'agreement')
    .single();
  console.log(JSON.stringify(phase, null, 2));

  // Simulate the dashboard API logic for Holly
  console.log('\n=== Simulating dashboard API for Holly ===');
  const contentPath = 'course';

  // Get milestones filtered same way as dashboard API
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .is('is_collapsed_into', null)
    .order('sort_order');

  const agreementMs = (milestones || []).filter(m => m.phase_id === 'agreement');
  console.log(`Milestones in agreement phase after is_collapsed_into filter: ${agreementMs.length}`);
  for (const m of agreementMs) {
    console.log(`  ${m.id}: applies_to=${JSON.stringify(m.applies_to)}, is_collapsed_into=${m.is_collapsed_into}`);
  }

  // Apply milestoneAppliesTo filter
  function milestoneAppliesTo(milestone: { applies_to?: string[] | null }, cp: string | null): boolean {
    if (!cp) {
      if (milestone.applies_to === null) return true;
      if (!milestone.applies_to) return true;
      return milestone.applies_to.includes('blog') &&
             milestone.applies_to.includes('download') &&
             milestone.applies_to.includes('course');
    }
    if (!milestone.applies_to || milestone.applies_to.length === 0) {
      return cp === 'course';
    }
    return milestone.applies_to.includes(cp);
  }

  const applicableAgreementMs = agreementMs.filter(m => milestoneAppliesTo(m, contentPath));
  console.log(`\nApplicable agreement milestones for content_path='${contentPath}': ${applicableAgreementMs.length}`);
  for (const m of applicableAgreementMs) {
    console.log(`  ${m.id}: applies_to=${JSON.stringify(m.applies_to)}`);
  }

  // Get Holly's milestone progress
  const { data: creatorMs } = await supabase
    .from('creator_milestones')
    .select('*')
    .eq('creator_id', HOLLY_ID);

  // Check agreement phase completion
  const isComplete = applicableAgreementMs.length > 0 &&
    applicableAgreementMs.every((m) => {
      const progress = (creatorMs || []).find(cm => cm.milestone_id === m.id);
      const result = progress?.status === 'completed';
      console.log(`  Checking ${m.id}: progress.status=${progress?.status}, isCompleted=${result}`);
      return result;
    });

  console.log(`\nAgreement phase isComplete: ${isComplete}`);
  console.log(`Agreement phase isSkipped: ${applicableAgreementMs.length === 0}`);
}

main().catch(console.error);
