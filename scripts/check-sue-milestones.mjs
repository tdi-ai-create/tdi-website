import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: creator, error } = await supabase
    .from('creators')
    .select('*')
    .eq('email', 'thompsueevelyn@gmail.com')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Creator:', creator.name);
  console.log('Content path:', creator.content_path);
  console.log('course_description:', creator.course_description || '(not set)');
  console.log('author_bio:', creator.author_bio || '(not set)');

  const { data: allMilestones, error: mError } = await supabase
    .from('milestones')
    .select('id, name, phase_id, sort_order, applies_to')
    .order('sort_order');

  if (mError) {
    console.error('Milestones error:', mError);
    return;
  }

  const { data: creatorMilestones, error: cmError } = await supabase
    .from('creator_milestones')
    .select('milestone_id, status, metadata')
    .eq('creator_id', creator.id);

  if (cmError) {
    console.error('Creator milestones error:', cmError);
    return;
  }

  const cmMap = {};
  for (const cm of creatorMilestones) {
    cmMap[cm.milestone_id] = cm;
  }

  console.log('\n=== Non-completed, applicable (non-optional) milestones ===');
  let hasIssues = false;
  for (const m of allMilestones) {
    const appliesTo = m.applies_to;
    if (appliesTo && appliesTo.indexOf('course') === -1) continue;

    const cm = cmMap[m.id];
    const status = cm?.status || 'locked';
    const isOptional = cm?.metadata?.is_optional === true;

    if (status !== 'completed' && isOptional === false) {
      console.log('  ' + m.phase_id + '/' + m.id + ': ' + status);
      hasIssues = true;
    }
  }

  if (!hasIssues) console.log('  All core milestones completed!');

  console.log('\n=== Optional/Bonus milestones ===');
  for (const m of allMilestones) {
    const cm = cmMap[m.id];
    if (cm?.metadata?.is_optional === true) {
      console.log('  ' + m.id + ': status=' + cm.status);
    }
  }
}

check().catch(console.error);
