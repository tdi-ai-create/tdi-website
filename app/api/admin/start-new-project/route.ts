import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await request.json();
    const { creatorId } = body;

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creatorId is required' },
        { status: 400 }
      );
    }

    // Get the current creator record
    const { data: currentCreator, error: fetchError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (fetchError || !currentCreator) {
      console.error('Error fetching creator:', fetchError);
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Archive the current project
    const { error: archiveError } = await supabase
      .from('creators')
      .update({ status: 'archived' })
      .eq('id', creatorId);

    if (archiveError) {
      console.error('Error archiving creator:', archiveError);
      return NextResponse.json(
        { error: 'Failed to archive current project' },
        { status: 500 }
      );
    }

    // Create new creator record with profile info carried over
    const newCreatorId = randomUUID();
    const newCreator = {
      id: newCreatorId,
      email: currentCreator.email,
      name: currentCreator.name,
      // Reset content path and course info
      course_title: null,
      course_audience: null,
      content_path: null,
      target_launch_month: null,
      // Keep some metadata
      discount_code: currentCreator.discount_code,
      // Start at onboarding but will skip intake
      current_phase: 'onboarding',
      // Reset production flags
      agreement_signed: false,
      agreement_signed_at: null,
      agreement_signed_name: null,
      // Keep location info
      state: currentCreator.state,
      location_prompt_dismissed: true,
      // Keep website display info
      display_on_website: false,
      website_display_name: currentCreator.website_display_name,
      website_title: currentCreator.website_title,
      website_bio: currentCreator.website_bio,
      headshot_url: currentCreator.headshot_url,
      display_order: 99,
      // Reset production preferences
      wants_video_editing: false,
      wants_download_design: false,
      // Reset publish status
      publish_status: 'in_progress',
      scheduled_publish_date: null,
      published_date: null,
      publish_notes: null,
      // Set status and link to previous project
      status: 'active',
      post_launch_notes: null,
      previous_project_id: creatorId,
    };

    const { data: createdCreator, error: createError } = await supabase
      .from('creators')
      .insert(newCreator)
      .select()
      .single();

    if (createError) {
      console.error('Error creating new creator:', createError);
      // Rollback archive
      await supabase
        .from('creators')
        .update({ status: 'active' })
        .eq('id', creatorId);
      return NextResponse.json(
        { error: 'Failed to create new project' },
        { status: 500 }
      );
    }

    // Initialize milestones for the new creator (skip intake milestone)
    // Get all milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('*')
      .order('sort_order');

    if (milestonesError) {
      console.error('Error fetching milestones:', milestonesError);
    } else if (milestones) {
      // Create milestone progress records
      const milestoneRecords = milestones.map((milestone, index) => {
        // Skip intake/welcome milestones - mark as completed
        const isIntakeMilestone = milestone.id === 'intake_form' ||
          milestone.title?.toLowerCase().includes('intake') ||
          milestone.title?.toLowerCase().includes('welcome');

        // First non-intake milestone is available, rest are locked
        const firstAvailableFound = milestones
          .slice(0, index)
          .some(m => !m.title?.toLowerCase().includes('intake') && !m.title?.toLowerCase().includes('welcome'));

        let status = 'locked';
        if (isIntakeMilestone) {
          status = 'completed';
        } else if (!firstAvailableFound) {
          // This is the first non-intake milestone
          const prevNonIntake = milestones
            .slice(0, index)
            .filter(m => !m.title?.toLowerCase().includes('intake') && !m.title?.toLowerCase().includes('welcome'));
          if (prevNonIntake.length === 0) {
            status = 'available';
          }
        }

        return {
          id: randomUUID(),
          creator_id: newCreatorId,
          milestone_id: milestone.id,
          status,
          completed_at: isIntakeMilestone ? new Date().toISOString() : null,
          completed_by: isIntakeMilestone ? 'system:new_project' : null,
          metadata: isIntakeMilestone ? { skipped_for_new_project: true } : null,
        };
      });

      const { error: insertError } = await supabase
        .from('creator_milestones')
        .insert(milestoneRecords);

      if (insertError) {
        console.error('Error inserting milestone records:', insertError);
      }
    }

    // Add notes to both records
    await supabase.from('creator_notes').insert([
      {
        creator_id: creatorId,
        content: `Project archived. Creator started a new project (ID: ${newCreatorId})`,
        author: 'System',
        note_type: 'status_change',
      },
      {
        creator_id: newCreatorId,
        content: `New project started. Previous project: ${currentCreator.course_title || 'Untitled'} (ID: ${creatorId})`,
        author: 'System',
        note_type: 'status_change',
      },
    ]);

    return NextResponse.json({
      success: true,
      newCreator: createdCreator,
      archivedCreatorId: creatorId,
    });
  } catch (error) {
    console.error('Error in start-new-project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
