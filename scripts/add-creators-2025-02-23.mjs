/**
 * Script to add 5 new creators to the Creator Portal database
 * Run with: node scripts/add-creators-2025-02-23.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

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
    name: 'Melissa France',
    email: 'melissakfrance@gmail.com',
    intakeResponses: {
      strategy: 'Building connections with students',
      referral_source: 'Friend or Colleague',
      content_types: 'Blog posts',
    },
    note: `Intake form submission — Friend/Colleague referral. Focus: Building connections with students. Interested in: Blog posts.`,
  },
  {
    name: 'Steph Sukow',
    email: 'stephanie.sukow@gmail.com',
    intakeResponses: {
      strategy: 'Amplifying student voice and leveraging digital tools to deepen student engagement in the classroom',
      referral_source: 'Other — LinkedIn',
      content_types: 'Blog posts, digital downloads, course',
    },
    note: `Intake form submission — LinkedIn referral. Focus: Amplifying student voice and leveraging digital tools to deepen student engagement in the classroom. Interested in: Blog posts, digital downloads, course.`,
  },
  {
    name: 'Katie Landers',
    email: 'katielanders5@gmail.com',
    intakeResponses: {
      strategy: 'Reading specialist — comprehension, phonics, vocabulary, phonemic awareness, small group instruction, virtual tutoring, and differentiation',
      referral_source: 'Friend or Colleague',
      content_types: 'Blog posts, digital downloads, course',
    },
    note: `Intake form submission — Friend/Colleague referral. Reading specialist with focus on: comprehension, phonics, vocabulary, phonemic awareness, small group instruction, virtual tutoring, and differentiation. Interested in: Blog posts, digital downloads, course.`,
  },
  {
    name: 'Kim Lohse',
    email: 'klohse@asd4.org',
    intakeResponses: {
      strategy: 'School safety',
      referral_source: 'Other — Talked to Rae',
      content_types: 'Blog posts, digital downloads, course',
    },
    note: `Intake form submission — Talked to Rae directly. Focus: School safety. Interested in: Blog posts, digital downloads, course.`,
  },
  {
    name: 'Sheila Daly',
    email: 'sheila.m.daly@gmail.com',
    intakeResponses: {
      strategy: 'Predictable and portable instructional structures to reduce teacher overwhelm while increasing rigor — focus on multilingual learners, K–8 developmental "staircase" of structure, consistent reading/writing routines, co-teaching models, and collaborative teacher-driven solutions',
      referral_source: 'Other — LinkedIn',
      content_types: 'Digital downloads',
    },
    note: `Intake form submission — LinkedIn referral. Focus: Predictable and portable instructional structures to reduce teacher overwhelm while increasing rigor — multilingual learners, K–8 developmental structure, reading/writing routines, co-teaching models, collaborative solutions. Interested in: Digital downloads.`,
  },
];

async function addCreator(creatorData) {
  const { name, email, intakeResponses, note } = creatorData;

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Adding: ${name}`);
  console.log(`Email: ${email}`);

  // 1. Create the creator record
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .insert({
      email: email.toLowerCase(),
      name,
      current_phase: 'onboarding',
      content_path: null, // Let creator choose during onboarding
      intake_responses: intakeResponses,
    })
    .select()
    .single();

  if (creatorError) {
    console.error(`  ✗ Error creating creator:`, creatorError.message);
    return null;
  }

  console.log(`  ✓ Creator created (ID: ${creator.id})`);

  // 2. Get all milestones ordered by sort_order
  const { data: milestones, error: milestonesError } = await supabase
    .from('milestones')
    .select('*')
    .order('sort_order');

  if (milestonesError || !milestones) {
    console.error('  ✗ Error fetching milestones:', milestonesError?.message);
    return creator;
  }

  // 3. Create milestone progress records
  // - First milestone (intake_completed): completed (they submitted intake)
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
    console.error('  ✗ Error creating milestone progress:', progressError.message);
    return creator;
  }

  console.log(`  ✓ Created ${milestoneRecords.length} milestone records`);

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
    console.error('  ✗ Error creating note:', noteError.message);
  } else {
    console.log('  ✓ Added intake note');
  }

  return creator;
}

async function sendSummaryEmail(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  const creatorList = successful.map(r =>
    `• ${r.name} (${r.email})\n  Strategy: ${r.strategy}\n  Interested in: ${r.interests}`
  ).join('\n\n');

  const emailBody = `
Hi Rachel,

${successful.length} new creator${successful.length !== 1 ? 's have' : ' has'} been added to the Creator Portal:

${creatorList}

${failed.length > 0 ? `\n⚠️ ${failed.length} creator(s) failed to add - check logs.\n` : ''}
All creators are in Onboarding (Phase 1) and ready to choose their content path.

View in Admin Portal:
https://www.teachersdeserveit.com/admin/creators

— TDI Creator Studio
  `.trim();

  console.log('\n' + '═'.repeat(50));
  console.log('SENDING SUMMARY EMAIL');
  console.log('═'.repeat(50));

  if (!resendApiKey) {
    console.log('⚠️ RESEND_API_KEY not configured - email preview:');
    console.log('To: rachel@teachersdeserveit.com');
    console.log('Subject: [Creator Portal] 5 New Creators Added');
    console.log('Body:\n' + emailBody);
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
        to: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
        subject: `[Creator Portal] ${successful.length} New Creator${successful.length !== 1 ? 's' : ''} Added`,
        text: emailBody,
      }),
    });

    if (response.ok) {
      console.log('✓ Summary email sent to Rachel');
      return true;
    } else {
      const error = await response.json();
      console.error('✗ Email failed:', error);
      return false;
    }
  } catch (err) {
    console.error('✗ Email error:', err.message);
    return false;
  }
}

async function main() {
  console.log('═'.repeat(50));
  console.log('Adding 5 New Creators to Creator Portal');
  console.log('Date: 2025-02-23');
  console.log('═'.repeat(50));

  const results = [];

  for (const creator of creators) {
    const result = await addCreator(creator);
    results.push({
      name: creator.name,
      email: creator.email,
      strategy: creator.intakeResponses.strategy.substring(0, 80) + (creator.intakeResponses.strategy.length > 80 ? '...' : ''),
      interests: creator.intakeResponses.content_types,
      success: !!result,
      id: result?.id,
    });
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('SUMMARY');
  console.log('═'.repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  for (const r of results) {
    const status = r.success ? '✓' : '✗';
    console.log(`${status} ${r.name} ${r.id ? `(ID: ${r.id})` : '(FAILED)'}`);
  }

  console.log(`\nTotal: ${successful.length} added, ${failed.length} failed`);

  // Send email to Rachel
  await sendSummaryEmail(results);

  console.log('\n' + '═'.repeat(50));
  console.log('Done!');
  console.log('═'.repeat(50));
}

main().catch(console.error);
