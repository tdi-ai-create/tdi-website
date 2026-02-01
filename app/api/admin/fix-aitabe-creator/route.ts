/**
 * Fix route to complete Aitabé Fornés creator setup
 * - Checks/adds missing milestone records
 * - Adds the intake note
 *
 * DELETE THIS FILE after running successfully
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CREATOR_ID = '4342b0b4-ee6b-498d-9ba9-336ff71173ad';

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

    // Step 1: Verify creator exists
    results.push('1. Verifying creator exists...');
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', CREATOR_ID)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({
        success: false,
        error: 'Creator not found',
        details: creatorError,
      }, { status: 404 });
    }
    results.push(`   ✓ Found creator: ${creator.name} (${creator.email})`);

    // Step 2: Check existing milestone records
    results.push('2. Checking existing milestone records...');
    const { data: existingMilestones, error: existingError } = await supabase
      .from('creator_milestones')
      .select('milestone_id')
      .eq('creator_id', CREATOR_ID);

    if (existingError) {
      return NextResponse.json({
        success: false,
        error: 'Error checking existing milestones',
        details: existingError,
      }, { status: 500 });
    }

    const existingMilestoneIds = new Set(existingMilestones?.map(m => m.milestone_id) || []);
    results.push(`   ✓ Found ${existingMilestoneIds.size} existing milestone records`);

    // Step 3: Get all milestones from master list
    results.push('3. Fetching all milestones...');
    const { data: allMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .order('sort_order');

    if (milestonesError || !allMilestones) {
      return NextResponse.json({
        success: false,
        error: 'Error fetching milestones',
        details: milestonesError,
      }, { status: 500 });
    }
    results.push(`   ✓ Found ${allMilestones.length} total milestones`);

    // Step 4: Add missing milestone records
    results.push('4. Adding missing milestone records...');
    const missingMilestones = allMilestones.filter(m => !existingMilestoneIds.has(m.id));

    if (missingMilestones.length > 0) {
      const milestoneRecords = missingMilestones.map((milestone, index) => ({
        creator_id: CREATOR_ID,
        milestone_id: milestone.id,
        // All missing ones should be locked (first one was likely already created as available)
        status: existingMilestoneIds.size === 0 && index === 0 ? 'available' : 'locked',
      }));

      const { error: insertError } = await supabase
        .from('creator_milestones')
        .insert(milestoneRecords);

      if (insertError) {
        return NextResponse.json({
          success: false,
          error: 'Error inserting missing milestones',
          details: insertError,
          results,
        }, { status: 500 });
      }
      results.push(`   ✓ Added ${missingMilestones.length} missing milestone records`);
    } else {
      results.push('   ✓ No missing milestone records');
    }

    // Step 5: Check if note already exists
    results.push('5. Checking for existing notes...');
    const { data: existingNotes } = await supabase
      .from('creator_notes')
      .select('id, content')
      .eq('creator_id', CREATOR_ID);

    const noteExists = existingNotes?.some(n => n.content.includes('Intake form submission'));

    if (noteExists) {
      results.push('   ✓ Intake note already exists');
    } else {
      // Add the intake note
      results.push('6. Adding intake note...');
      const { data: note, error: noteError } = await supabase
        .from('creator_notes')
        .insert({
          creator_id: CREATOR_ID,
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
          results,
        }, { status: 500 });
      }
      results.push(`   ✓ Note added with ID: ${note.id}`);
    }

    // Step 6: Final verification
    results.push('7. Final verification...');

    const { count: finalMilestoneCount } = await supabase
      .from('creator_milestones')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', CREATOR_ID);

    const { data: finalMilestones } = await supabase
      .from('creator_milestones')
      .select('status')
      .eq('creator_id', CREATOR_ID);

    const availableCount = finalMilestones?.filter(m => m.status === 'available').length || 0;
    const lockedCount = finalMilestones?.filter(m => m.status === 'locked').length || 0;

    const { count: noteCount } = await supabase
      .from('creator_notes')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', CREATOR_ID);

    return NextResponse.json({
      success: true,
      message: 'Creator setup completed successfully!',
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        current_phase: creator.current_phase,
      },
      milestones: {
        total: finalMilestoneCount,
        available: availableCount,
        locked: lockedCount,
      },
      noteCount,
      adminUrl: `/admin/creators/${CREATOR_ID}`,
      results,
      reminder: 'DELETE THIS API ROUTE after verifying success.',
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}
