/**
 * Script to add 3 new creators to the Creator Portal database
 * Run with: node scripts/add-creators-2025-02-10.mjs
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

// Creators to add
const creators = [
  {
    name: 'Erin Shook',
    email: 'teachwell.bewell6@gmail.com',
    contentTypes: ['blog', 'course'],
    contentPath: 'course', // course path includes blog milestones
    strategy: 'Breaking through burnout for educator moms',
    referralSource: 'LinkedIn',
    applicationDate: '2025-02-10',
  },
  {
    name: 'Stacy Kratochvil',
    email: 'stacykratochvil@gmail.com',
    contentTypes: ['blog'],
    contentPath: 'blog',
    strategy: 'Human-centered AI, digital well-being, values-driven AI, agency',
    referralSource: 'Message from Rae',
    applicationDate: '2025-02-10',
  },
  {
    name: 'Megan Fitzsimmons',
    email: 'mafitzsi@gmail.com',
    contentTypes: ['blog', 'download', 'course'],
    contentPath: 'course', // course path includes blog + download milestones
    strategy: 'Co-teaching, EL strategies, executive functioning, classroom management, reading/writing (8th grade level), differentiating for ELs and honors-bound students, mentoring newer teachers, independent reading',
    referralSource: 'Rachel Patragas',
    applicationDate: '2025-02-10',
  },
];

async function addCreator(creatorData) {
  const { name, email, contentPath, strategy, referralSource, applicationDate, contentTypes } = creatorData;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Adding creator: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Content types: ${contentTypes.join(', ')}`);
  console.log(`Content path: ${contentPath}`);

  // 1. Create the creator record
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .insert({
      email: email.toLowerCase(),
      name,
      current_phase: 'onboarding',
      content_path: contentPath, // Set content path directly
    })
    .select()
    .single();

  if (creatorError) {
    console.error(`Error creating creator ${name}:`, creatorError.message);
    return null;
  }

  console.log(`✓ Creator created with ID: ${creator.id}`);

  // 2. Get all milestones ordered by sort_order
  const { data: milestones, error: milestonesError } = await supabase
    .from('milestones')
    .select('*')
    .order('sort_order');

  if (milestonesError || !milestones) {
    console.error('Error fetching milestones:', milestonesError?.message);
    return creator;
  }

  // 3. Create milestone progress records
  // - First milestone (intake_completed): completed
  // - Second milestone (content_path_selection): completed (since we set the path)
  // - Third milestone (team_intake_review): available
  // - Remaining: locked
  const milestoneRecords = milestones.map((milestone, index) => {
    let status = 'locked';
    let completed_at = null;
    let submission_data = null;

    if (index === 0) {
      // intake_completed - mark as completed
      status = 'completed';
      completed_at = new Date().toISOString();
    } else if (index === 1) {
      // content_path_selection - mark as completed since we're setting the path
      status = 'completed';
      completed_at = new Date().toISOString();
      submission_data = {
        type: 'path_selection',
        content_path: contentPath,
        selected_at: new Date().toISOString(),
      };
    } else if (index === 2) {
      // Next milestone should be available
      status = 'available';
    }

    return {
      creator_id: creator.id,
      milestone_id: milestone.id,
      status,
      completed_at,
      submission_data,
    };
  });

  const { error: progressError } = await supabase
    .from('creator_milestones')
    .insert(milestoneRecords);

  if (progressError) {
    console.error('Error creating milestone progress:', progressError.message);
    return creator;
  }

  // Count milestones that apply to this creator's path
  const applicableMilestones = milestones.filter(m => {
    if (!m.applies_to) return true;
    return m.applies_to.includes(contentPath);
  });

  console.log(`✓ Created ${milestoneRecords.length} milestone records (${applicableMilestones.length} applicable to ${contentPath} path)`);

  // 4. Add a note with strategy, referral, and application date
  const noteContent = `**Application Date:** ${applicationDate}
**Referral Source:** ${referralSource}
**Content Types:** ${contentTypes.join(', ')}
**Strategy/Focus:** ${strategy}`;

  const { error: noteError } = await supabase
    .from('creator_notes')
    .insert({
      creator_id: creator.id,
      content: noteContent,
      author: 'System',
      visible_to_creator: false,
      phase_id: 'onboarding',
    });

  if (noteError) {
    console.error('Error creating note:', noteError.message);
  } else {
    console.log('✓ Added creator note with application details');
  }

  return creator;
}

async function main() {
  console.log('Adding 3 new creators to the Creator Portal database');
  console.log('Date: 2025-02-10');

  const results = [];

  for (const creator of creators) {
    const result = await addCreator(creator);
    results.push({ name: creator.name, success: !!result, id: result?.id });
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('SUMMARY');
  console.log('='.repeat(50));

  let allSuccess = true;
  for (const result of results) {
    const status = result.success ? '✓' : '✗';
    console.log(`${status} ${result.name}${result.id ? ` (ID: ${result.id})` : ''}`);
    if (!result.success) allSuccess = false;
  }

  console.log('\n' + (allSuccess ? 'All creators added successfully!' : 'Some creators failed to add. Check the errors above.'));
}

main().catch(console.error);
