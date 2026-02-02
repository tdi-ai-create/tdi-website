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

    // Build metadata with audit trail
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata: any = {
      ...content,
      completed_by_admin: true,
      admin_email: adminEmail,
      completed_at: new Date().toISOString(),
    };

    if (adminNote) {
      metadata.admin_note = adminNote;
    }

    // Update milestone status to completed
    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'completed',
        metadata,
        updated_at: new Date().toISOString()
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

    // Unlock next milestone
    const { data: nextMilestone } = await supabase
      .from('milestones')
      .select('id, title, name')
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
