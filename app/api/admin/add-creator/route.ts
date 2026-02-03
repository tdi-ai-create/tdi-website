import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to add a new creator to the database.
 * POST with { name, email, note?, noteAuthor? }
 */
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { name, email, note, noteAuthor } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 });
    }

    console.log('[add-creator] Adding creator:', name, email);

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
      console.error('[add-creator] Error creating creator:', creatorError);
      return NextResponse.json({ success: false, error: creatorError.message }, { status: 500 });
    }

    console.log('[add-creator] Creator created:', creator.id);

    // 2. Get all milestones ordered by sort_order
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .order('sort_order');

    if (milestonesError || !milestones) {
      console.error('[add-creator] Error fetching milestones:', milestonesError);
      return NextResponse.json({ success: false, error: 'Failed to fetch milestones' }, { status: 500 });
    }

    // 3. Create milestone progress records
    // When admin adds a creator, intake is already done (completed)
    // Second milestone (content path selection) should be available
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
      console.error('[add-creator] Error creating milestone progress:', progressError);
      return NextResponse.json({ success: false, error: progressError.message }, { status: 500 });
    }

    console.log('[add-creator] Created', milestoneRecords.length, 'milestone records');

    // 4. Add the creator note if provided
    let createdNote = null;
    if (note) {
      const { data: noteData, error: noteError } = await supabase
        .from('creator_notes')
        .insert({
          creator_id: creator.id,
          content: note,
          author: noteAuthor || 'System',
          visible_to_creator: false,
          phase_id: 'onboarding',
        })
        .select()
        .single();

      if (noteError) {
        console.error('[add-creator] Error creating note:', noteError);
        // Don't fail the whole request for a note error
      } else {
        createdNote = noteData;
        console.log('[add-creator] Note added');
      }
    }

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        name: creator.name,
        email: creator.email,
        current_phase: creator.current_phase,
        created_at: creator.created_at,
      },
      milestonesCreated: milestoneRecords.length,
      noteCreated: !!createdNote,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[add-creator] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
