/**
 * Script to add 3 new creators to the Creator Portal database
 * Run with: node scripts/add-creators-2025-02-14.mjs
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
    name: 'Dana DeLorto',
    email: 'danadelorto@gmail.com',
    note: `Intake form submission — TDI Social Media referral. Helps teachers feel confident with technology — the go-to person colleagues ask when trying something new. Strategy: Takes complex tools/systems and translates them into simple, practical strategies for real classrooms. Believes intentional tech use empowers rather than overwhelms teachers. Interested in: Digital downloads, Learning Hub course.`,
  },
  {
    name: 'Noor Shammas',
    email: 'noorzshammas@gmail.com',
    note: `Intake form submission — TDI Social Media referral. Focused on instructional technology with intention, including moving student use of technology from passive to purposeful. (Note: Full strategy details from intake form to be added once complete submission is reviewed.) Interested in: Content types TBD — confirm from full submission.`,
  },
  {
    name: 'Catherine Dorian',
    email: 'cdorian@stjohnshigh.org',
    note: `Intake form submission — TDI Social Media referral. AP Language instructor passionate about teaching rhetorical analysis across secondary grade levels. Strategy: Uses open-ended hypothetical questions tied to anchor texts, then guides students through a Canva-based text 'map' examining quotations, rhetorical strategies, and reader impact. Students complete analysis then write their own persuasive text using the same strategies, with peer evaluation. Interested in: Blog posts, digital downloads, Learning Hub course.`,
  },
];

async function addCreator(creatorData) {
  const { name, email, note } = creatorData;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Adding creator: ${name}`);
  console.log(`Email: ${email}`);

  // 1. Create the creator record
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .insert({
      email: email.toLowerCase(),
      name,
      current_phase: 'onboarding',
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
  // - Second milestone (content_path_selection): available
  // - Remaining: locked
  const milestoneRecords = milestones.map((milestone, index) => ({
    creator_id: creator.id,
    milestone_id: milestone.id,
    status: index === 0 ? 'completed' : index === 1 ? 'available' : 'locked',
    completed_at: index === 0 ? new Date().toISOString() : null,
  }));

  const { error: progressError } = await supabase
    .from('creator_milestones')
    .insert(milestoneRecords);

  if (progressError) {
    console.error('Error creating milestone progress:', progressError.message);
    return creator;
  }

  console.log(`✓ Created ${milestoneRecords.length} milestone records`);

  // 4. Add the creator note
  const { error: noteError } = await supabase
    .from('creator_notes')
    .insert({
      creator_id: creator.id,
      content: note,
      author: 'Rae',
      visible_to_creator: false,
      phase_id: 'onboarding',
    });

  if (noteError) {
    console.error('Error creating note:', noteError.message);
  } else {
    console.log('✓ Added creator note (author: Rae, phase: onboarding)');
  }

  return creator;
}

async function verifyCreators(creatorIds) {
  console.log(`\n${'='.repeat(50)}`);
  console.log('VERIFICATION');
  console.log('='.repeat(50));

  for (const id of creatorIds) {
    // Fetch creator
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single();

    if (creatorError) {
      console.error(`Error fetching creator ${id}:`, creatorError.message);
      continue;
    }

    console.log(`\n${creator.name} (${creator.email})`);
    console.log(`  - Phase: ${creator.current_phase}`);
    console.log(`  - Created: ${creator.created_at}`);

    // Fetch milestones count
    const { count: milestoneCount, error: milestoneError } = await supabase
      .from('creator_milestones')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', id);

    if (!milestoneError) {
      console.log(`  - Milestones: ${milestoneCount} records`);
    }

    // Fetch milestone status breakdown
    const { data: milestoneStats } = await supabase
      .from('creator_milestones')
      .select('status')
      .eq('creator_id', id);

    if (milestoneStats) {
      const statusCounts = milestoneStats.reduce((acc, m) => {
        acc[m.status] = (acc[m.status] || 0) + 1;
        return acc;
      }, {});
      console.log(`  - Status breakdown: ${Object.entries(statusCounts).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }

    // Fetch notes
    const { data: notes, error: notesError } = await supabase
      .from('creator_notes')
      .select('*')
      .eq('creator_id', id);

    if (!notesError && notes) {
      console.log(`  - Notes: ${notes.length} record(s)`);
      for (const n of notes) {
        console.log(`    • Author: ${n.author}, Phase: ${n.phase_id}, Length: ${n.content.length} chars`);
      }
    }
  }
}

async function main() {
  console.log('Adding 3 new creators to the Creator Portal database');
  console.log('Date: 2025-02-14');

  const results = [];
  const creatorIds = [];

  for (const creator of creators) {
    const result = await addCreator(creator);
    results.push({ name: creator.name, success: !!result, id: result?.id });
    if (result?.id) {
      creatorIds.push(result.id);
    }
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

  // Verify all created records
  if (creatorIds.length > 0) {
    await verifyCreators(creatorIds);
  }

  console.log('\n' + (allSuccess ? 'All creators added successfully!' : 'Some creators failed to add. Check the errors above.'));
}

main().catch(console.error);
