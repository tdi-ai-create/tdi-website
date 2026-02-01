/**
 * One-time API route to add creator: Aitabé Fornés
 *
 * Run by visiting: /api/admin/add-creator-aitabe
 * DELETE THIS FILE after running successfully
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Creator details
const CREATOR = {
  name: 'Aitabé Fornés',
  email: 'hello@sensethinking.com',
};

const INTAKE_NOTE = `Intake form submission — Heard Rae on Unleash Yes podcast. 12+ year veteran teacher, NYC public schools, inquiry-based life science. Strategy: sensory-based learning — engaging students through five senses plus imagination, empathy, embodiment, and intuition for magnetic engagement, deep understanding, and original insight. Has shared with a small group of educators who found it profoundly transformative. Interested in: blog posts, digital downloads, AND Learning Hub course. Website: sensethinking.com`;

export async function GET() {
  const results: string[] = [];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Step 1: Check if creator already exists
    results.push('1. Checking if creator already exists...');
    const { data: existingCreator } = await supabase
      .from('creators')
      .select('id, email, name')
      .eq('email', CREATOR.email.toLowerCase())
      .single();

    if (existingCreator) {
      return NextResponse.json({
        success: false,
        error: 'Creator already exists',
        existingCreator,
        message: 'Creator already exists. If you need to re-run, delete the creator first.',
      });
    }
    results.push('   ✓ Creator does not exist, proceeding...');

    // Step 2: Create the creator
    results.push('2. Creating creator record...');
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .insert({
        email: CREATOR.email.toLowerCase(),
        name: CREATOR.name,
        current_phase: 'onboarding',
      })
      .select()
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({
        success: false,
        error: 'Error creating creator',
        details: creatorError,
        results,
      }, { status: 500 });
    }
    results.push(`   ✓ Creator created with ID: ${creator.id}`);

    // Step 3: Get all milestones
    results.push('3. Fetching milestones...');
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .order('sort_order');

    if (milestonesError || !milestones) {
      return NextResponse.json({
        success: false,
        error: 'Error fetching milestones',
        details: milestonesError,
        creator,
        results,
      }, { status: 500 });
    }
    results.push(`   ✓ Found ${milestones.length} milestones`);

    // Step 4: Create milestone progress records
    results.push('4. Creating milestone progress records...');
    const milestoneRecords = milestones.map((milestone, index) => ({
      creator_id: creator.id,
      milestone_id: milestone.id,
      status: index === 0 ? 'available' : 'locked',
    }));

    const { error: progressError } = await supabase
      .from('creator_milestones')
      .insert(milestoneRecords);

    if (progressError) {
      return NextResponse.json({
        success: false,
        error: 'Error creating milestone progress',
        details: progressError,
        creator,
        results,
      }, { status: 500 });
    }
    results.push(`   ✓ Created ${milestoneRecords.length} milestone progress records`);

    // Step 5: Add the intake note
    results.push('5. Adding intake note...');
    const { data: note, error: noteError } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creator.id,
        content: INTAKE_NOTE,
        author: 'Rae',
        visible_to_creator: false,
      })
      .select()
      .single();

    if (noteError) {
      return NextResponse.json({
        success: false,
        error: 'Error adding note',
        details: noteError,
        creator,
        results,
      }, { status: 500 });
    }
    results.push(`   ✓ Note added with ID: ${note.id}`);

    // Step 6: Verify the records
    results.push('6. Verifying records...');

    const { data: verifyCreator } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creator.id)
      .single();

    const { count: milestoneCount } = await supabase
      .from('creator_milestones')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', creator.id);

    const { count: noteCount } = await supabase
      .from('creator_notes')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', creator.id);

    results.push('   ✓ All records verified');

    return NextResponse.json({
      success: true,
      message: 'Creator successfully added!',
      creator: verifyCreator,
      milestoneCount,
      noteCount,
      adminUrl: `/admin/creators/${creator.id}`,
      results,
      note: 'DELETE THIS API ROUTE after verifying the creator was added correctly.',
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}
