/**
 * Fix route for Aitabé Fornés milestone setup
 * 1. Delete all existing milestone records
 * 2. Re-create properly (first = available, rest = locked)
 * 3. Add the intake note
 * 4. Verify
 *
 * DELETE THIS FILE after running successfully
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CREATOR_ID = '4342b0b4-ee6b-498d-9ba9-336ff71173ad';

const INTAKE_NOTE = `Intake form submission -  Heard Rae on Unleash Yes podcast. 12+ year veteran teacher, NYC public schools, inquiry-based life science. Strategy: sensory-based learning -  engaging students through five senses plus imagination, empathy, embodiment, and intuition for magnetic engagement, deep understanding, and original insight. Has shared with a small group of educators who found it profoundly transformative. Interested in: blog posts, digital downloads, AND Learning Hub course. Website: sensethinking.com`;

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
    results.push(`   ✓ Found: ${creator.name} (${creator.email})`);

    // Step 2: Delete ALL existing milestone records for this creator
    results.push('2. Deleting existing milestone records...');
    const { error: deleteError, count: deleteCount } = await supabase
      .from('creator_milestones')
      .delete({ count: 'exact' })
      .eq('creator_id', CREATOR_ID);

    if (deleteError) {
      return NextResponse.json({
        success: false,
        error: 'Error deleting milestone records',
        details: deleteError,
        results,
      }, { status: 500 });
    }
    results.push(`   ✓ Deleted ${deleteCount || 0} existing records`);

    // Step 3: Get all milestones ordered by sort_order
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
        results,
      }, { status: 500 });
    }
    results.push(`   ✓ Found ${milestones.length} milestones`);

    // Step 4: Create all milestone progress records
    results.push('4. Creating milestone progress records...');
    const milestoneRecords = milestones.map((milestone, index) => ({
      creator_id: CREATOR_ID,
      milestone_id: milestone.id,
      status: index === 0 ? 'available' : 'locked',
    }));

    const { error: insertError } = await supabase
      .from('creator_milestones')
      .insert(milestoneRecords);

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Error creating milestone records',
        details: insertError,
        results,
      }, { status: 500 });
    }
    results.push(`   ✓ Created ${milestoneRecords.length} milestone records`);
    results.push(`   First milestone: available`);
    results.push(`   Remaining ${milestoneRecords.length - 1}: locked`);

    // Step 5: Check if note already exists
    results.push('5. Checking for existing intake note...');
    const { data: existingNotes } = await supabase
      .from('creator_notes')
      .select('id, content')
      .eq('creator_id', CREATOR_ID);

    const noteExists = existingNotes?.some(n => n.content.includes('Intake form submission'));

    if (noteExists) {
      results.push('   ✓ Intake note already exists, skipping');
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
      results.push(`   ✓ Note added (ID: ${note.id})`);
    }

    // Step 6: Final verification
    results.push('7. Final verification...');

    // Verify milestones
    const { data: verifyMilestones } = await supabase
      .from('creator_milestones')
      .select('status')
      .eq('creator_id', CREATOR_ID);

    const availableCount = verifyMilestones?.filter(m => m.status === 'available').length || 0;
    const lockedCount = verifyMilestones?.filter(m => m.status === 'locked').length || 0;
    const totalCount = verifyMilestones?.length || 0;

    // Verify notes
    const { data: verifyNotes } = await supabase
      .from('creator_notes')
      .select('*')
      .eq('creator_id', CREATOR_ID)
      .order('created_at', { ascending: false });

    results.push(`   ✓ Milestones: ${totalCount} total (${availableCount} available, ${lockedCount} locked)`);
    results.push(`   ✓ Notes: ${verifyNotes?.length || 0}`);

    return NextResponse.json({
      success: true,
      message: 'Creator milestone setup fixed successfully!',
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        current_phase: creator.current_phase,
      },
      milestones: {
        total: totalCount,
        available: availableCount,
        locked: lockedCount,
      },
      notes: verifyNotes?.map(n => ({
        id: n.id,
        author: n.author,
        visible_to_creator: n.visible_to_creator,
        preview: n.content.substring(0, 60) + '...',
      })),
      adminUrl: `/admin/creators/${CREATOR_ID}`,
      results,
      reminder: 'DELETE this route and fix-aitabe-creator route after verifying.',
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}
