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
    // For confirmations, meeting_scheduled, preferences, path_selection, and form submissions, mark as complete
    // For change_request, mark as in_progress (pending team review)
    // For link submissions needing review, mark as waiting_approval
    const completionTypes = ['confirmation', 'meeting_scheduled', 'preferences', 'path_selection', 'form'];
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

    // If meeting scheduled, store the date/time in metadata
    if (submissionType === 'meeting_scheduled' && content.scheduled_date) {
      updateData.metadata = {
        scheduled_date: content.scheduled_date,
        scheduled_time: content.scheduled_time,
        notes: content.notes
      };
    }

    // If change request, store the request in metadata
    if (submissionType === 'change_request' && content.request) {
      updateData.metadata = {
        change_request: content.request,
        requested_at: new Date().toISOString()
      };
    }

    // If path selection, store the selected path in metadata
    if (submissionType === 'path_selection' && content.selected_path) {
      updateData.metadata = {
        selected_path: content.selected_path,
        selected_at: new Date().toISOString()
      };
    }

    // If form submission, store all form data in metadata
    if (submissionType === 'form') {
      updateData.metadata = {
        ...content,
        submitted_at: new Date().toISOString()
      };
    }

    // If link submission, store link in metadata
    if (submissionType === 'link' && content.link) {
      updateData.metadata = {
        link: content.link,
        notes: content.notes || null,
        submitted_at: new Date().toISOString()
      };
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

    // 4. If this is a completion type (not needing review), unlock next milestone
    if (completionTypes.includes(submissionType)) {
      // Get current milestone info
      const { data: milestone } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();

      if (milestone) {
        // Find next milestone in same phase
        const { data: nextMilestone } = await supabase
          .from('milestones')
          .select('id')
          .eq('phase_id', milestone.phase_id)
          .gt('sort_order', milestone.sort_order)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (nextMilestone) {
          await supabase
            .from('creator_milestones')
            .update({ status: 'available', updated_at: new Date().toISOString() })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');
        }
      }
    }

    // 5. Send email notification to team if needed
    // Always notify when: submission needs team review (waiting_approval), change request, or explicit notifyTeam
    const needsTeamReview = newStatus === 'waiting_approval';
    if (notifyTeam || needsTeamReview || submissionType === 'change_request') {
      const { data: creator } = await supabase
        .from('creators')
        .select('name, email')
        .eq('id', creatorId)
        .single();

      const { data: milestoneInfo } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', milestoneId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = milestoneInfo as any;
      const milestoneName = m?.title || m?.name || m?.admin_description || milestoneId;

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
          if (submissionType === 'meeting_scheduled') {
            emailSubject = `📅 ${creator.name} scheduled a meeting`;
            emailHeading = 'Meeting Scheduled';
          } else if (submissionType === 'change_request') {
            emailSubject = `📝 ${creator.name} requested changes`;
            emailHeading = 'Change Request';
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

                  ${meetingInfo}
                  ${changeRequestInfo}
                  ${content.link ? `<p><strong>Submitted Link:</strong> <a href="${content.link}">${content.link}</a></p>` : ''}
                  ${content.notes && !changeRequestInfo ? `<p><strong>Creator Notes:</strong> ${content.notes}</p>` : ''}

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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[submit] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
