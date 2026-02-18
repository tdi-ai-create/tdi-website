import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const { creatorId } = await request.json();

    if (!creatorId) {
      return NextResponse.json({
        success: false,
        error: 'Missing creator ID'
      }, { status: 400 });
    }

    console.log('[create-new-project] Creating new project for creator:', creatorId);

    // Get the creator's current/latest project
    const { data: existingProjects } = await supabase
      .from('creator_projects')
      .select('id, project_number, status')
      .eq('creator_id', creatorId)
      .order('project_number', { ascending: false })
      .limit(1);

    const latestProject = existingProjects?.[0];
    const newProjectNumber = (latestProject?.project_number || 0) + 1;

    // Mark any active projects as completed
    await supabase
      .from('creator_projects')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('creator_id', creatorId)
      .eq('status', 'active');

    // Create new project
    const { data: newProject, error: projectError } = await supabase
      .from('creator_projects')
      .insert({
        creator_id: creatorId,
        project_number: newProjectNumber,
        status: 'active'
      })
      .select()
      .single();

    if (projectError || !newProject) {
      console.error('[create-new-project] Error creating project:', projectError);
      return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 });
    }

    // Reset creator to onboarding phase and clear content-specific fields
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        current_phase: 'onboarding',
        content_path: null,
        course_title: null,
        course_audience: null,
        target_launch_month: null,
        discount_code: null,
        google_doc_link: null,
        drive_folder_link: null,
        marketing_doc_link: null,
        course_url: null,
        launch_date: null,
        wants_video_editing: false,
        wants_download_design: false,
        active_project_id: newProject.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[create-new-project] Error updating creator:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to update creator' }, { status: 500 });
    }

    // Get all milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, sort_order, phase_id')
      .order('sort_order');

    if (milestones) {
      // Sort milestones by phase and then by sort_order
      const phaseOrder: Record<string, number> = {
        onboarding: 0,
        agreement: 1,
        course_design: 2,
        test_prep: 3,
        production: 4,
        launch: 5
      };

      const sortedMilestones = milestones.sort((a, b) => {
        const phaseCompare = phaseOrder[a.phase_id] - phaseOrder[b.phase_id];
        if (phaseCompare !== 0) return phaseCompare;
        return a.sort_order - b.sort_order;
      });

      // Create fresh milestone records for the new project
      // First milestone (intake_completed) is completed (they're returning)
      // Second milestone (content_path_selection) is available
      // Rest are locked
      const milestoneRecords = sortedMilestones.map((milestone, index) => ({
        creator_id: creatorId,
        milestone_id: milestone.id,
        project_id: newProject.id,
        status: index === 0 ? 'completed' : index === 1 ? 'available' : 'locked',
        completed_at: index === 0 ? new Date().toISOString() : null,
        completed_by: index === 0 ? 'system:returning-creator' : null
      }));

      const { error: milestoneError } = await supabase
        .from('creator_milestones')
        .insert(milestoneRecords);

      if (milestoneError) {
        console.error('[create-new-project] Error creating milestones:', milestoneError);
        // Non-fatal, continue
      }
    }

    // Get creator info for email
    const { data: creator } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', creatorId)
      .single();

    // Send notification email to team
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && creator) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
            subject: `[Creator Portal] ${creator.name} is ready to create again!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px;">
                <h2 style="color: #1e2749;">Returning Creator</h2>

                <p><strong>Creator:</strong> ${creator.name} (${creator.email})</p>
                <p><strong>Project:</strong> #${newProjectNumber}</p>

                <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin: 16px 0;">
                  <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e2749;">
                    ${creator.name} has started a new project and is ready to choose their content path.
                  </p>
                </div>

                <a href="https://www.teachersdeserveit.com/admin/creators/${creatorId}"
                   style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                  View in Admin Portal
                </a>
              </div>
            `,
          }),
        });
        console.log('[create-new-project] Email notification sent');
      } catch (emailError) {
        console.error('[create-new-project] Email error (non-fatal):', emailError);
      }
    }

    // Create auto-note
    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: `[Auto] Creator started new project #${newProjectNumber} (changed mind after initially holding off)`,
        author: 'System',
        visible_to_creator: false,
        phase_id: 'onboarding',
      });

    console.log('[create-new-project] Successfully created project:', newProject.id);

    return NextResponse.json({
      success: true,
      projectId: newProject.id,
      projectNumber: newProjectNumber
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[create-new-project] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
