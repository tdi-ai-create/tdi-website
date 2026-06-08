import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint for admins to complete creator actions on their behalf.
 * This creates an audit trail and handles all the same logic as creator submissions.
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

    const {
      creatorId,
      milestoneId,
      actionType,
      content,
      adminEmail,
      adminNote
    } = await request.json();

    console.log('[admin/complete-action] Request:', { creatorId, milestoneId, actionType, adminEmail });

    if (!creatorId || !milestoneId || !actionType || !adminEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields (creatorId, milestoneId, actionType, adminEmail)'
      }, { status: 400 });
    }

    // Get creator info for audit trail
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', creatorId)
      .single();

    if (creatorError) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    // Get milestone info
    const { data: milestone, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', milestoneId)
      .single();

    if (milestoneError) {
      return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = milestone as any;
    const milestoneName = m?.title || m?.name || m?.admin_description || 'Milestone';

    // Handle specific action types that update creator table
    if (actionType === 'path_selection' && content?.selected_path) {
      const selectedPath = content.selected_path;
      if (!['blog', 'download', 'course'].includes(selectedPath)) {
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
        console.error('[admin/complete-action] Error saving content path:', pathError);
        return NextResponse.json({ success: false, error: pathError.message }, { status: 500 });
      }
    }

    if (actionType === 'preferences' && content) {
      const { error: prefsError } = await supabase
        .from('creators')
        .update({
          wants_video_editing: content.wants_video_editing || false,
          wants_download_design: content.wants_download_design || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', creatorId);

      if (prefsError) {
        console.error('[admin/complete-action] Error saving preferences:', prefsError);
        return NextResponse.json({ success: false, error: prefsError.message }, { status: 500 });
      }
    }

    const completedAt = new Date().toISOString();
    const adminName = adminEmail?.split('@')[0] || 'admin';

    // Build metadata with audit trail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata: any = {
      ...content,
      completed_by_admin: true,
      admin_email: adminEmail,
      completed_at: completedAt,
    };

    if (adminNote) {
      metadata.admin_note = adminNote;
    }

    // Build submission_data based on action type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let submissionData: any = {
      type: actionType,
      completed_by_admin: true,
      admin_name: adminName,
      admin_email: adminEmail,
      completed_at: completedAt,
    };

    // Add action-specific data
    if (actionType === 'select' || actionType === 'path_selection') {
      submissionData = {
        ...submissionData,
        type: 'path_selection',
        content_path: content?.selected_path,
        selected_at: completedAt,
      };
    } else if (actionType === 'submit_link' || actionType === 'link_submit') {
      submissionData = {
        ...submissionData,
        type: 'link',
        link: content?.link,
        submitted_at: completedAt,
      };
    } else if (actionType === 'calendly') {
      submissionData = {
        ...submissionData,
        type: 'meeting_scheduled',
        booked_externally: true,
        submitted_at: completedAt,
      };
    } else if (actionType === 'sign_agreement') {
      submissionData = {
        ...submissionData,
        type: 'agreement',
        signed_externally: true,
        submitted_at: completedAt,
      };
    } else {
      submissionData = {
        ...submissionData,
        type: 'team_review',
        reviewed_by: adminName,
        review_notes: adminNote || null,
        reviewed_at: completedAt,
      };
    }

    // Update milestone status to completed with audit trail
    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'completed',
        metadata,
        submission_data: submissionData,
        completed_by: `admin:${adminEmail}`,
        completed_at: completedAt,
        notes: adminNote || null,
        updated_at: completedAt
      })
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId);

    if (updateError) {
      console.error('[admin/complete-action] Error updating milestone:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Record in creator_submissions for full audit trail
    await supabase
      .from('creator_submissions')
      .insert({
        creator_id: creatorId,
        milestone_id: milestoneId,
        submission_type: `admin_${actionType}`,
        content: {
          ...content,
          completed_by_admin: true,
          admin_email: adminEmail,
          admin_note: adminNote || null
        }
      });

    // Unlock next milestone - find next active milestone in same phase (skip deactivated sort_order >= 98)
    let { data: nextMilestone } = await supabase
      .from('milestones')
      .select('id, title, name, phase_id')
      .eq('phase_id', milestone.phase_id)
      .gt('sort_order', milestone.sort_order)
      .lt('sort_order', 98)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    // If no next milestone in current phase, find first in next applicable phase
    if (!nextMilestone) {
      const { data: creator2 } = await supabase
        .from('creators')
        .select('content_path')
        .eq('id', creatorId)
        .single();
      const contentPath = creator2?.content_path;

      const { data: phases } = await supabase
        .from('phases')
        .select('id, sort_order')
        .order('sort_order', { ascending: true });

      const currentPhase = phases?.find(p => p.id === milestone.phase_id);
      const currentPhaseOrder = currentPhase?.sort_order ?? 0;

      const { data: futureMilestones } = await supabase
        .from('milestones')
        .select('id, title, name, phase_id, applies_to, phases!inner(sort_order)')
        .gt('phases.sort_order', currentPhaseOrder)
        .lt('sort_order', 98)
        .order('phases(sort_order)', { ascending: true })
        .order('sort_order', { ascending: true });

      if (futureMilestones) {
        for (const fm of futureMilestones) {
          const appliesTo = fm.applies_to as string[] | null;
          const isApplicable = !contentPath ||
            !appliesTo || appliesTo.length === 0 ||
            appliesTo.includes(contentPath);
          if (isApplicable) {
            nextMilestone = fm;
            break;
          }
        }
      }
    }

    if (nextMilestone) {
      // Unlock next milestone -- update any non-completed status to 'available'
      // This handles cases where the milestone might be 'locked', 'available', or 'in_progress'
      const { error: unlockError } = await supabase
        .from('creator_milestones')
        .update({
          status: 'available',
          updated_at: new Date().toISOString(),
          completed_at: null,
          completed_by: null,
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', nextMilestone.id)
        .neq('status', 'completed');

      if (unlockError) {
        console.error('[admin/complete-action] Error unlocking next milestone:', unlockError);
      } else {
        console.log('[admin/complete-action] Unlocked next milestone:', nextMilestone.id);
      }
    }

    // Add internal note documenting the admin action
    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: `Admin completed "${milestoneName}" on behalf of creator${adminNote ? `: ${adminNote}` : ''}`,
        author: adminEmail,
        visible_to_creator: false
      });

    // Create admin notification for audit
    await supabase
      .from('admin_notifications')
      .insert({
        creator_id: creatorId,
        type: 'admin_action',
        message: `${adminEmail} completed "${milestoneName}" for ${creator.name}`,
        link: `/admin/creators/${creatorId}`,
      });

    console.log('[admin/complete-action] Successfully completed action for creator');

    return NextResponse.json({
      success: true,
      nextMilestone: nextMilestone ? (nextMilestone.title || nextMilestone.name) : null
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[admin/complete-action] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
