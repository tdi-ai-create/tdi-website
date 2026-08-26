import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { byPhaseThenOrder } from '@/lib/creator-phases';
import { recordSubmission } from '@/lib/creator-submissions';
import { creatorFlag } from '@/lib/creator-flags';
import { advanceStep, resolveStepRow } from '@/lib/creator-step-engine';
import { CREATOR_STUDIO_RECIPIENTS } from '@/lib/creator-notification-recipients';

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

    const { creatorId, milestoneId, submissionType, content, notifyTeam } = await request.json();

    console.log('[submit] Submission received:', { creatorId, milestoneId, submissionType });

    if (!creatorId || !milestoneId || !submissionType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Validate milestone exists
    const { data: milestoneExists } = await supabase
      .from('milestones')
      .select('id')
      .eq('id', milestoneId)
      .maybeSingle();

    if (!milestoneExists) {
      return NextResponse.json({
        success: false,
        error: `Milestone '${milestoneId}' does not exist`
      }, { status: 404 });
    }

    // There was an insert into creator_submissions here, wrapped in a comment
    // saying the table might not exist yet. It does not exist and never has, so
    // every submission since February failed this write, logged a friendly line,
    // and carried on. Removed rather than left looking like a safety net.

    // 2. Handle preferences submission - update creator table
    if (submissionType === 'preferences') {
      const { error: prefsError } = await supabase
        .from('creators')
        .update({
          wants_video_editing: content.wants_video_editing || false,
          wants_download_design: content.wants_download_design || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      if (prefsError) {
        console.error('[submit] Error saving preferences:', prefsError);
        return NextResponse.json({ success: false, error: prefsError.message }, { status: 500 });
      }
    }

    // 2b. Handle content path selection - update creator table
    if (submissionType === 'path_selection') {
      const selectedPath = content.selected_path;
      if (!selectedPath || !['blog', 'download', 'course'].includes(selectedPath)) {
        return NextResponse.json({ success: false, error: 'Invalid content path' }, { status: 400 });
      }

      const { error: pathError } = await supabase
        .from('creators')
        .update({
          content_path: selectedPath,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      if (pathError) {
        console.error('[submit] Error saving content path:', pathError);
        return NextResponse.json({ success: false, error: pathError.message }, { status: 500 });
      }
    }

    // 3. Update milestone status
    // For confirmations, meeting_scheduled, preferences, path_selection, form submissions, and create_again_choice, mark as complete
    // For change_request, mark as in_progress (pending team review)
    // For link submissions needing review, mark as waiting_approval
    const completionTypes = ['confirmation', 'meeting_scheduled', 'preferences', 'path_selection', 'form', 'course_title', 'create_again_choice'];
    let newStatus = completionTypes.includes(submissionType) ? 'completed' : 'waiting_approval';

    // Change requests go back to in_progress as team needs to make updates
    if (submissionType === 'change_request') {
      newStatus = 'in_progress';
    }

    // Build update object - include scheduled_date if it's a meeting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...(newStatus === 'completed' ? {
        completed_at: new Date().toISOString(),
        completed_by: 'creator',
      } : {}),
    };

    // Build submission data object for structured data capture
    let submissionData: Record<string, unknown> | null = null;

    // If meeting scheduled, store the date/time in metadata and submission_data
    if (submissionType === 'meeting_scheduled' && content.scheduled_date) {
      submissionData = {
        type: 'meeting_scheduled',
        scheduled_date: content.scheduled_date,
        scheduled_time: content.scheduled_time,
        notes: content.notes || null,
        submitted_at: new Date().toISOString()
      };
      updateData.metadata = {
        scheduled_date: content.scheduled_date,
        scheduled_time: content.scheduled_time,
        notes: content.notes
      };
    }

    // If change request, store the request in metadata and submission_data
    if (submissionType === 'change_request' && content.request) {
      submissionData = {
        type: 'change_request',
        request: content.request,
        requested_at: new Date().toISOString()
      };
      updateData.metadata = {
        change_request: content.request,
        requested_at: new Date().toISOString()
      };
    }

    // If path selection, store the selected path in metadata and submission_data
    if (submissionType === 'path_selection' && content.selected_path) {
      submissionData = {
        type: 'path_selection',
        content_path: content.selected_path,
        selected_at: new Date().toISOString()
      };
      updateData.metadata = {
        selected_path: content.selected_path,
        selected_at: new Date().toISOString()
      };
    }

    // If form submission, store all form data in metadata and submission_data
    if (submissionType === 'form') {
      submissionData = {
        type: 'form',
        fields: content,
        submitted_at: new Date().toISOString()
      };
      updateData.metadata = {
        ...content,
        submitted_at: new Date().toISOString()
      };
    }

    // If link submission, store link in metadata and submission_data
    if (submissionType === 'link' && content.link) {
      submissionData = {
        type: 'link',
        link: content.link,
        notes: content.notes || null,
        submitted_at: new Date().toISOString()
      };
      updateData.metadata = {
        link: content.link,
        notes: content.notes || null,
        submitted_at: new Date().toISOString()
      };
    }

    // If confirmation, just record the timestamp
    if (submissionType === 'confirmation') {
      submissionData = {
        type: 'confirmation',
        confirmed: true,
        confirmed_at: new Date().toISOString()
      };
    }

    // If preferences, store the preferences
    if (submissionType === 'preferences') {
      submissionData = {
        type: 'preferences',
        wants_video_editing: content.wants_video_editing || false,
        wants_download_design: content.wants_download_design || false,
        submitted_at: new Date().toISOString()
      };
    }

    // If course title submission, store the title
    if (submissionType === 'course_title' && content.title) {
      submissionData = {
        type: 'course_title',
        title: content.title,
        submitted_at: new Date().toISOString()
      };
      updateData.metadata = {
        title: content.title,
        submitted_at: new Date().toISOString()
      };

      // Also update the creator's course_title field
      const { error: titleError } = await supabase
        .from('creators')
        .update({
          course_title: content.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      if (titleError) {
        console.error('[submit] Course title not saved to the creator:', titleError.message);
      }
    }

    // If course outline submission, store the document URL
    if (submissionType === 'course_outline' && content.document_url) {
      submissionData = {
        type: 'course_outline',
        document_url: content.document_url,
        notes: content.notes || null,
        submitted_at: new Date().toISOString()
      };
      updateData.metadata = {
        document_url: content.document_url,
        notes: content.notes || null,
        submitted_at: new Date().toISOString()
      };

      // Also update the creator's google_doc_link field
      const { error: docLinkError } = await supabase
        .from('creators')
        .update({
          google_doc_link: content.document_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      if (docLinkError) {
        console.error('[submit] Outline link not saved to the creator:', docLinkError.message);
      }
    }

    // If create_again_choice submission, store the choice and handle project creation
    if (submissionType === 'create_again_choice' && content.choice) {
      const choice = content.choice as 'yes' | 'hold_off';
      const chosenAt = new Date().toISOString();

      submissionData = {
        type: 'create_again_choice',
        create_again_choice: choice,
        chosen_at: chosenAt
      };
      updateData.metadata = {
        choice,
        chosen_at: chosenAt
      };

      // Get the creator's active project
      const { data: activeProject } = await supabase
        .from('creator_projects')
        .select('id, project_number')
        .eq('creator_id', creatorId)
        .eq('status', 'active')
        .order('project_number', { ascending: false })
        .limit(1)
        .single();

      // Mark current project as completed
      if (activeProject) {
        const { error: closeError } = await supabase
          .from('creator_projects')
          .update({
            status: 'completed',
            completed_at: chosenAt
          })
          .eq('id', activeProject.id);

        if (closeError) {
          return NextResponse.json(
            { error: `Could not close the current project: ${closeError.message}` },
            { status: 500 }
          );
        }
      }

      // If creator chose "yes", create a new project
      if (choice === 'yes') {
        const newProjectNumber = (activeProject?.project_number || 1) + 1;

        // Create new project
        // Taking the error here matters more than most. A failed insert used to
        // leave the previous project closed and no new one open, so a creator
        // who said yes to creating again ended up with nothing at all.
        const { data: newProject, error: newProjectError } = await supabase
          .from('creator_projects')
          .insert({
            creator_id: creatorId,
            project_number: newProjectNumber,
            status: 'active'
          })
          .select()
          .single();

        if (newProjectError || !newProject) {
          return NextResponse.json(
            { error: `Could not start the new project: ${newProjectError?.message || 'no row returned'}` },
            { status: 500 }
          );
        }

        if (newProject) {
          // Reset creator to onboarding phase and clear content-specific fields
          const { error: resetError } = await supabase
            .from('creators')
            .update({
              current_phase: 'onboarding',
              content_path: null,
              course_title: null,
              course_audience: null,
              target_publish_month: null,
              discount_code: null,
              google_doc_link: null,
              drive_folder_link: null,
              marketing_doc_link: null,
              course_url: null,
              launch_date: null,
              wants_video_editing: false,
              wants_download_design: true, // always team-built from spec
              active_project_id: newProject.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', creatorId);

          if (resetError) {
            console.error('[submit] Creator not reset for the new project:', resetError.message);
          }

          // Get all active milestones (excluding collapsed/retired ones)
          const { data: milestones } = await supabase
            .from('milestones')
            .select('id, sort_order, phase_id')
            .is('is_collapsed_into', null)
            .order('sort_order');

          if (milestones) {
            // Create fresh milestone records for the new project
            // First milestone (intake_completed) is completed (admin added them)
            // Second milestone (content_path_selection) is available
            // Rest are locked
            const sortedMilestones = [...milestones].sort(byPhaseThenOrder);

            const milestoneRecords = sortedMilestones.map((milestone, index) => ({
              creator_id: creatorId,
              milestone_id: milestone.id,
              project_id: newProject.id,
              status: index === 0 ? 'completed' : index === 1 ? 'available' : 'locked',
              completed_at: index === 0 ? new Date().toISOString() : null,
              completed_by: index === 0 ? 'system:returning-creator' : null
            }));

            // Use upsert with ignoreDuplicates in case trigger already created records
            const { error: seedError } = await supabase
              .from('creator_milestones')
              .upsert(milestoneRecords, {
                onConflict: 'creator_id,milestone_id,project_id',
                ignoreDuplicates: true
              });

            if (seedError) {
              console.error('[submit] New project has no steps, seeding failed:', seedError.message);
            }
          }
        }
      }
    }

    // Add submission_data to update if we have it
    if (submissionData) {
      updateData.submission_data = submissionData;
    }

    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update(updateData)
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId);

    if (updateError) {
      console.error('[submit] Error updating milestone:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 3b. Handle paired milestones that should auto-complete together
    // These milestone pairs are merged in the UI but exist separately in the database
    const pairedMilestones: Record<string, string> = {
      'test_video_recorded': 'test_video_submitted',  // Record test video → also completes Submit test video
      'drive_folder_created': 'assets_submitted',     // Create drive folder → also completes Assets submitted
    };

    const pairedMilestoneId = pairedMilestones[milestoneId];
    if (pairedMilestoneId && (completionTypes.includes(submissionType) || submissionType === 'link')) {
      // Auto-complete the paired milestone
      const { error: pairedError } = await supabase
        .from('creator_milestones')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: 'system:auto-paired',
          submission_data: {
            type: 'auto_completed',
            paired_with: milestoneId,
            completed_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', pairedMilestoneId);

      if (pairedError) {
        console.error('[submit] Error auto-completing paired milestone:', pairedError);
        // Non-fatal, continue with progression
      } else {
        console.log('[submit] Auto-completed paired milestone:', pairedMilestoneId);
      }
    }

    // ---- The step engine, behind creator_config.step_engine ----------------
    //
    // A fourth copy of the walk lived here, so this route had its own idea of
    // what came next and could disagree with the three in the admin routes.
    // Everything below is that old path, kept working so the flag switches
    // between two implementations rather than into a half finished one.
    //
    // Only completion types advance. A submission that needs review does not
    // move the board: it waits for a person to approve or ask for changes,
    // which is the whole point of the review loop.
    const useEngine = completionTypes.includes(submissionType)
      && (await creatorFlag(supabase, 'step_engine'));

    if (useEngine) {
      const resolved = await resolveStepRow(supabase, creatorId, milestoneId);
      if (resolved.error || !resolved.recordId) {
        console.error('[submit] Engine could not find the step:', resolved.error);
        return NextResponse.json({ success: false, error: resolved.error }, { status: 400 });
      }

      const { data: creatorState } = await supabase
        .from('creators')
        .select('lifecycle_state')
        .eq('id', creatorId)
        .maybeSingle();

      const advanced = await advanceStep(supabase, {
        milestoneRecordId: resolved.recordId,
        decision: 'approve',
        actor: `creator:${creatorId}`,
        startClock: creatorState?.lifecycle_state !== 'paused',
      });

      if (!advanced.ok) {
        console.error('[submit] Engine refused to advance:', advanced.error);
        return NextResponse.json({ success: false, error: advanced.error }, { status: 500 });
      }

      console.log('[submit] Engine advanced. Next:', advanced.openStep?.name ?? 'end of path');
    }

    // 4. If this is a completion type (not needing review), unlock next milestone
    if (!useEngine && completionTypes.includes(submissionType)) {
      // Get current milestone info
      const { data: milestone } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();

      // Get creator's content path
      const { data: creatorData } = await supabase
        .from('creators')
        .select('content_path')
        .eq('id', creatorId)
        .single();
      const contentPath = creatorData?.content_path;

      // Determine which milestone to start searching from
      // If this milestone has a paired milestone, search from the paired one's sort_order
      const searchFromMilestoneId = pairedMilestoneId || milestoneId;
      let searchFromSortOrder = milestone?.sort_order ?? 0;

      if (pairedMilestoneId) {
        const { data: pairedMilestone } = await supabase
          .from('milestones')
          .select('sort_order')
          .eq('id', pairedMilestoneId)
          .single();
        if (pairedMilestone) {
          searchFromSortOrder = Math.max(searchFromSortOrder, pairedMilestone.sort_order);
        }
      }

      if (milestone) {
        // Find next milestone in same phase, skipping deactivated ones (sort_order >= 98)
        let { data: nextMilestone } = await supabase
          .from('milestones')
          .select('id, sort_order')
          .eq('phase_id', milestone.phase_id)
          .gt('sort_order', searchFromSortOrder)
          .lt('sort_order', 98)  // Skip deactivated milestones
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        // If no next milestone in current phase, find first milestone in next applicable phase
        if (!nextMilestone) {
          // Get all phases ordered
          const { data: phases } = await supabase
            .from('phases')
            .select('id, sort_order')
            .order('sort_order', { ascending: true });

          // Get current phase sort order
          const currentPhase = phases?.find(p => p.id === milestone.phase_id);
          const currentPhaseOrder = currentPhase?.sort_order ?? 0;

          // Find milestones in subsequent phases, skipping deactivated ones
          const { data: futureMilestones } = await supabase
            .from('milestones')
            .select('*, phases!inner(sort_order)')
            .gt('phases.sort_order', currentPhaseOrder)
            .lt('sort_order', 98)  // Skip deactivated milestones
            .order('phases(sort_order)', { ascending: true })
            .order('sort_order', { ascending: true });

          // Find first applicable milestone in future phases
          if (futureMilestones && futureMilestones.length > 0) {
            for (const fm of futureMilestones) {
              // Check if milestone applies to this creator's content path
              const appliesTo = fm.applies_to as string[] | null;
              const isApplicable = !contentPath || // No path selected = show all
                !appliesTo || appliesTo.length === 0 || // No restriction = course only (legacy)
                appliesTo.includes(contentPath);

              if (isApplicable) {
                nextMilestone = fm;
                break;
              }
            }
          }
        }

        if (nextMilestone) {
          // Clear completion data when unlocking to ensure clean state
          const { error: unlockError } = await supabase
            .from('creator_milestones')
            .update({
              status: 'available',
              completed_at: null,
              completed_by: null,
              updated_at: new Date().toISOString(),
            })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');

          if (unlockError) {
            console.error('[submit] Next step not unlocked, creator may see an empty board:', unlockError.message);
          }
        }
      }

      // Special logic for create_again milestone
      // It should only unlock when ALL other applicable milestones are completed or skipped
      if (milestoneId !== 'create_again') {
        // Check if all other milestones (excluding create_again) are completed
        const { data: allCreatorMilestones } = await supabase
          .from('creator_milestones')
          .select('milestone_id, status, metadata')
          .eq('creator_id', creatorId);

        // Get all applicable milestones for this creator's content path
        const { data: applicableMilestones } = await supabase
          .from('milestones')
          .select('id, applies_to, sort_order')
          .lt('sort_order', 98); // Exclude deactivated milestones

        if (allCreatorMilestones && applicableMilestones) {
          const contentPathFilter = contentPath || 'course';

          // Filter to only applicable milestones (based on content path)
          const applicableMilestoneIds = new Set(
            applicableMilestones
              .filter(m => {
                const appliesTo = m.applies_to as string[] | null;
                if (!appliesTo || appliesTo.length === 0) {
                  return contentPathFilter === 'course';
                }
                return appliesTo.includes(contentPathFilter);
              })
              .map(m => m.id)
          );

          // Check if all applicable milestones (except create_again) are completed or skipped
          const applicableCreatorMilestones = allCreatorMilestones.filter(
            cm => applicableMilestoneIds.has(cm.milestone_id) && cm.milestone_id !== 'create_again'
          );

          const allOthersComplete = applicableCreatorMilestones.every(cm => {
            // Check if milestone is completed
            if (cm.status === 'completed') return true;
            // Check if milestone is marked as optional/skipped in metadata
            const meta = cm.metadata as Record<string, unknown> | null;
            if (meta?.is_optional === true || meta?.skipped === true) return true;
            return false;
          });

          if (allOthersComplete) {
            // Unlock the create_again milestone - clear completion data for clean state
            const { error: createAgainError } = await supabase
              .from('creator_milestones')
              .update({
                status: 'available',
                completed_at: null,
                completed_by: null,
                updated_at: new Date().toISOString(),
              })
              .eq('creator_id', creatorId)
              .eq('milestone_id', 'create_again')
              .eq('status', 'locked');

            if (createAgainError) {
              console.error('[submit] Create again step not unlocked:', createAgainError.message);
            }

            console.log('[submit] All milestones complete - unlocked create_again milestone');
          }
        }
      }
    }

    // 5. Fetch milestone info for notifications and notes
    const { data: milestoneInfo } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = milestoneInfo as any;
    const milestoneName = m?.title || m?.name || m?.admin_description || milestoneId;

    // 6. Send email notification to team if needed
    // Always notify when: submission needs team review (waiting_approval), change request, or explicit notifyTeam
    const needsTeamReview = newStatus === 'waiting_approval';
    if (notifyTeam || needsTeamReview || submissionType === 'change_request') {
      const { data: creator } = await supabase
        .from('creators')
        .select('name, email')
        .eq('id', creatorId)
        .single();

      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey && creator) {
        try {
          // Format meeting date nicely if it's a meeting submission
          let meetingInfo = '';
          if (submissionType === 'meeting_scheduled' && content.scheduled_date) {
            const date = new Date(content.scheduled_date + 'T' + (content.scheduled_time || '12:00'));
            const formattedDate = date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const formattedTime = content.scheduled_time
              ? date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              : '';
            meetingInfo = `
              <div style="background: #fef9eb; border: 2px solid #F5A623; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">📅 Meeting Scheduled</p>
                <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600; color: #1e2749;">
                  ${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}
                </p>
              </div>
            `;
          }

          // Format change request info
          let changeRequestInfo = '';
          if (submissionType === 'change_request' && content.request) {
            changeRequestInfo = `
              <div style="background: #fff7ed; border: 2px solid #ea580c; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">📝 Change Request</p>
                <p style="margin: 8px 0 0 0; font-size: 16px; color: #1e2749; white-space: pre-wrap;">
                  ${content.request}
                </p>
              </div>
            `;
          }

          // Determine email subject based on type
          let emailSubject = `New Submission from ${creator.name}`;
          let emailHeading = 'New Submission Ready for Review';
          let customEmailBody = '';
          if (submissionType === 'meeting_scheduled') {
            emailSubject = `📅 ${creator.name} scheduled a meeting`;
            emailHeading = 'Meeting Scheduled';
          } else if (submissionType === 'change_request') {
            emailSubject = `📝 ${creator.name} requested changes`;
            emailHeading = 'Change Request';
          } else if (submissionType === 'create_again_choice') {
            // Get content path for email
            const { data: creatorInfo } = await supabase
              .from('creators')
              .select('content_path')
              .eq('id', creatorId)
              .single();
            const pathLabels: Record<string, string> = {
              blog: 'Blog',
              download: 'Download',
              course: 'Course'
            };
            const contentPathLabel = creatorInfo?.content_path ? pathLabels[creatorInfo.content_path] || creatorInfo.content_path : 'Content';
            const choiceLabel = content.choice === 'yes' ? 'Wants to create again' : 'Holding off';

            emailSubject = `[Creator Portal] ${creator.name} has completed their ${contentPathLabel} — ${choiceLabel}`;
            emailHeading = `${creator.name} Finished Their ${contentPathLabel}`;
            customEmailBody = `
              <div style="background: ${content.choice === 'yes' ? '#ecfdf5' : '#fef9c3'}; border: 2px solid ${content.choice === 'yes' ? '#10b981' : '#eab308'}; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">${content.choice === 'yes' ? '✓ Ready to Create Again' : '⏸ Holding Off'}</p>
                <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600; color: #1e2749;">
                  ${content.choice === 'yes' ? 'A new project has been created for them and they\'re starting from the beginning.' : 'No new project was created. They can reach out if they change their mind.'}
                </p>
              </div>
              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0; font-weight: 600; color: #1e2749;">Next Step</p>
                <p style="margin: 8px 0 0 0; color: #64748b;">
                  Review their completed project and archive it when ready.
                </p>
              </div>
            `;
          }

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
              to: CREATOR_STUDIO_RECIPIENTS,
              subject: emailSubject,
              html: `
                <div style="font-family: sans-serif; max-width: 600px;">
                  <h2 style="color: #1e2749;">${emailHeading}</h2>

                  <p><strong>Creator:</strong> ${creator.name} (${creator.email})</p>
                  <p><strong>Milestone:</strong> ${milestoneName}</p>

                  ${customEmailBody || ''}
                  ${meetingInfo}
                  ${changeRequestInfo}
                  ${content.link ? `<p><strong>Submitted Link:</strong> <a href="${content.link}">${content.link}</a></p>` : ''}
                  ${content.notes && !changeRequestInfo && !customEmailBody ? `<p><strong>Creator Notes:</strong> ${content.notes}</p>` : ''}

                  <a href="https://www.teachersdeserveit.com/admin/creators/${creatorId}"
                     style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                    View in Admin Portal
                  </a>
                </div>
              `,
            }),
          });
          console.log('[submit] Email notification sent');
        } catch (emailError) {
          console.error('[submit] Email error (non-fatal):', emailError);
        }
      }

      // Also create admin notification
      let notificationMessage = `${creator?.name || 'A creator'} submitted ${milestoneName}`;
      let notificationType = 'submission';

      if (submissionType === 'meeting_scheduled') {
        notificationMessage = `${creator?.name || 'A creator'} scheduled a meeting for ${milestoneName}`;
        notificationType = 'meeting';
      } else if (submissionType === 'change_request') {
        notificationMessage = `${creator?.name || 'A creator'} requested changes for ${milestoneName}`;
        notificationType = 'change_request';
      }

      const { error: notifyError } = await supabase
        .from('admin_notifications')
        .insert({
          creator_id: creatorId,
          type: notificationType,
          message: notificationMessage,
          link: `/admin/creators/${creatorId}`,
        });

      if (notifyError) {
        console.error('[submit] Admin notification not created:', notifyError.message);
      }
    }

    // 6. Create auto-note for audit trail
    let autoNoteContent: string | null = null;

    switch (submissionType) {
      case 'path_selection':
        const pathLabels: Record<string, string> = {
          blog: 'Blog Post',
          download: 'Free Download',
          course: 'Learning Hub Course',
        };
        autoNoteContent = `[Auto] Content path selected: ${pathLabels[content.selected_path] || content.selected_path}`;
        break;
      case 'meeting_scheduled':
        const meetingDate = content.scheduled_date
          ? new Date(content.scheduled_date + 'T' + (content.scheduled_time || '12:00')).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'date TBD';
        autoNoteContent = `[Auto] Meeting scheduled for ${milestoneName}: ${meetingDate}${content.scheduled_time ? ` at ${content.scheduled_time}` : ''}`;
        break;
      case 'link':
        autoNoteContent = `[Auto] Link submitted for ${milestoneName}: ${content.link}`;
        break;
      case 'confirmation':
        autoNoteContent = `[Auto] Creator confirmed: ${milestoneName}`;
        break;
      case 'preferences':
        const prefs: string[] = [];
        if (content.wants_video_editing) prefs.push('video editing');
        if (content.wants_download_design) prefs.push('download design');
        autoNoteContent = prefs.length > 0
          ? `[Auto] Production preferences selected: ${prefs.join(', ')}`
          : `[Auto] Production preferences submitted (no additional services)`;
        break;
      case 'form':
        autoNoteContent = `[Auto] Form submitted for ${milestoneName}`;
        break;
      case 'course_title':
        autoNoteContent = `[Auto] Course title submitted: "${content.title}"`;
        break;
      case 'course_outline':
        autoNoteContent = `[Auto] Course outline submitted: ${content.document_url}`;
        break;
      case 'change_request':
        autoNoteContent = `[Auto] Change request for ${milestoneName}: ${content.request}`;
        break;
      case 'create_again_choice':
        if (content.choice === 'yes') {
          autoNoteContent = `[Auto] Creator chose to create again - new project started`;
        } else {
          autoNoteContent = `[Auto] Creator chose to hold off on creating new content`;
        }
        break;
    }

    if (autoNoteContent) {
      // Get the phase_id for the milestone
      const { data: milestonePhase } = await supabase
        .from('milestones')
        .select('phase_id')
        .eq('id', milestoneId)
        .single();

      const { error: noteError } = await supabase
        .from('creator_notes')
        .insert({
          creator_id: creatorId,
          content: autoNoteContent,
          author: 'System',
          visible_to_creator: false,
          phase_id: milestonePhase?.phase_id || null,
        });
      if (noteError) {
        console.error('[submit] Auto-note failed:', noteError.message);
      }
    }

    // Record the actual deliverable.
    //
    // Until now a submitted link produced only the internal note above, so it
    // never reached the creator's own page and never reached the review queue.
    // Thirteen submissions from eight creators went that way between February
    // and August. Bella opened her queue on 20 August, found nothing from
    // Catherine, and was right: Catherine's document was in a note nobody was
    // ever shown.
    // Three submission types carry work a creator actually made, and all three
    // need a versioned row. Until now only the two link shaped ones were kept,
    // so every form went unversioned: the blog pitch with its four fields, the
    // download concept, the creator profile.
    //
    // That matters more now than it did. With two rounds of feedback, a creator
    // submits, hears back, and resubmits. The step row holds one value and the
    // second submission overwrites the first, so without a row per version you
    // end up with feedback and no way to see what it was written about.
    //
    // Choices and acknowledgements are deliberately not recorded. Confirming a
    // path or ticking that you read the guide is not a deliverable and a history
    // of it is noise.
    const submittedValue: string | null =
      submissionType === 'link' ? (content?.link ?? null)
      : submissionType === 'course_outline' ? (content?.document_url ?? null)
      : submissionType === 'form' ? JSON.stringify(content ?? {})
      : null;

    if (submittedValue) {
      // A creator on two projects has two rows for this step. Prefer the one on
      // their active project; the old code took whichever was updated most
      // recently, which is a guess that is silent when it is wrong.
      const { data: stepRows, error: stepLookupError } = await supabase
        .from('creator_milestones')
        .select('id, project_id')
        .eq('creator_id', creatorId)
        .eq('milestone_id', milestoneId);

      if (stepLookupError) {
        console.error('[submit] Could not find the step to attach the submission to:', stepLookupError.message);
        return NextResponse.json(
          { success: false, error: 'Your work was saved but could not be filed for review. Please tell us so we can attach it.' },
          { status: 500 }
        );
      }

      let stepRow = stepRows?.[0] ?? null;
      if (stepRows && stepRows.length > 1) {
        const { data: creatorRow } = await supabase
          .from('creators')
          .select('active_project_id')
          .eq('id', creatorId)
          .maybeSingle();

        const onActive = stepRows.find((r) => r.project_id === creatorRow?.active_project_id);
        if (!onActive) {
          console.error('[submit] Ambiguous step: creator has several projects and none is active.');
          return NextResponse.json(
            { success: false, error: 'Your work was saved but we could not tell which project it belongs to. Please tell us so we can attach it.' },
            { status: 500 }
          );
        }
        stepRow = onActive;
      }

      if (!stepRow) {
        console.error('[submit] No step row found for', creatorId, milestoneId);
        return NextResponse.json(
          { success: false, error: 'Your work was saved but could not be filed for review. Please tell us so we can attach it.' },
          { status: 500 }
        );
      }

      const recorded = await recordSubmission(supabase, {
        milestoneRecordId: stepRow.id,
        creatorId,
        submittedValue,
        submissionNotes: content?.notes ?? null,
        stepName: milestoneName,
      });

      // Reporting success here when the submission was never filed is how
      // thirteen deliverables went missing between February and August. The
      // creator is told plainly rather than being left thinking it landed.
      if (!recorded.ok) {
        console.error('[submit] Submission not recorded:', recorded.error);
        return NextResponse.json(
          { success: false, error: 'Your work was saved but could not be filed for review. Please tell us so we can attach it.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[submit] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
