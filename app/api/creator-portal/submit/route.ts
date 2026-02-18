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

    const { creatorId, milestoneId, submissionType, content, notifyTeam } = await request.json();

    console.log('[submit] Submission received:', { creatorId, milestoneId, submissionType });

    if (!creatorId || !milestoneId || !submissionType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // 1. Try to save the submission (table may not exist yet)
    const { error: submitError } = await supabase
      .from('creator_submissions')
      .insert({
        creator_id: creatorId,
        milestone_id: milestoneId,
        submission_type: submissionType,
        content
      });

    if (submitError) {
      // If table doesn't exist, log but continue (backwards compatibility)
      console.log('[submit] Note: creator_submissions insert:', submitError.message);
    }

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
      updated_at: new Date().toISOString()
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
      await supabase
        .from('creators')
        .update({
          course_title: content.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);
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
      await supabase
        .from('creators')
        .update({
          google_doc_link: content.document_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);
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
        await supabase
          .from('creator_projects')
          .update({
            status: 'completed',
            completed_at: chosenAt
          })
          .eq('id', activeProject.id);
      }

      // If creator chose "yes", create a new project
      if (choice === 'yes') {
        const newProjectNumber = (activeProject?.project_number || 1) + 1;

        // Create new project
        const { data: newProject } = await supabase
          .from('creator_projects')
          .insert({
            creator_id: creatorId,
            project_number: newProjectNumber,
            status: 'active'
          })
          .select()
          .single();

        if (newProject) {
          // Reset creator to onboarding phase and clear content-specific fields
          await supabase
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

          // Get all milestones
          const { data: milestones } = await supabase
            .from('milestones')
            .select('id, sort_order, phase_id')
            .order('sort_order');

          if (milestones) {
            // Create fresh milestone records for the new project
            // First milestone (intake_completed) is completed (admin added them)
            // Second milestone (content_path_selection) is available
            // Rest are locked
            const sortedMilestones = milestones.sort((a, b) => {
              const phaseOrder: Record<string, number> = {
                onboarding: 0,
                agreement: 1,
                course_design: 2,
                test_prep: 3,
                production: 4,
                launch: 5
              };
              const phaseCompare = phaseOrder[a.phase_id] - phaseOrder[b.phase_id];
              if (phaseCompare !== 0) return phaseCompare;
              return a.sort_order - b.sort_order;
            });

            const milestoneRecords = sortedMilestones.map((milestone, index) => ({
              creator_id: creatorId,
              milestone_id: milestone.id,
              project_id: newProject.id,
              status: index === 0 ? 'completed' : index === 1 ? 'available' : 'locked',
              completed_at: index === 0 ? new Date().toISOString() : null,
              completed_by: index === 0 ? 'system:returning-creator' : null
            }));

            await supabase
              .from('creator_milestones')
              .insert(milestoneRecords);
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

    // 4. If this is a completion type (not needing review), unlock next milestone
    if (completionTypes.includes(submissionType)) {
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
          await supabase
            .from('creator_milestones')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');
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
            // Unlock the create_again milestone
            await supabase
              .from('creator_milestones')
              .update({ status: 'available', updated_at: new Date().toISOString() })
              .eq('creator_id', creatorId)
              .eq('milestone_id', 'create_again')
              .eq('status', 'locked');

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
              to: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
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

      await supabase
        .from('admin_notifications')
        .insert({
          creator_id: creatorId,
          type: notificationType,
          message: notificationMessage,
          link: `/admin/creators/${creatorId}`,
        });
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

      await supabase
        .from('creator_notes')
        .insert({
          creator_id: creatorId,
          content: autoNoteContent,
          author: 'System',
          visible_to_creator: false,
          phase_id: milestonePhase?.phase_id || null,
        });
      console.log('[submit] Auto-note created:', autoNoteContent.substring(0, 50) + '...');
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[submit] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
