import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/**
 * API endpoint for admins to mark milestones as optional (bonus) or required (core).
 * Optional milestones don't count against core completion percentage.
 */
export async function POST(request: Request) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

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
      milestoneIds,
      isOptional,
      reason,
      adminEmail
    } = await request.json();

    console.log('[admin/milestones/optional] Request:', { creatorId, milestoneIds, isOptional, adminEmail });

    if (!creatorId || !milestoneIds || !Array.isArray(milestoneIds) || milestoneIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields (creatorId, milestoneIds array)'
      }, { status: 400 });
    }

    if (typeof isOptional !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'isOptional must be a boolean'
      }, { status: 400 });
    }

    // Get creator info for audit trail
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('name')
      .eq('id', creatorId)
      .single();

    if (creatorError) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    // Get milestone names for the note
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, name')
      .in('id', milestoneIds);

    const milestoneNames = milestones?.map(m => m.name).join(', ') || 'milestones';

    // Update milestone(s) optional status via metadata
    // Get current milestones to merge metadata
    const { data: currentMilestones } = await supabase
      .from('creator_milestones')
      .select('milestone_id, metadata')
      .eq('creator_id', creatorId)
      .in('milestone_id', milestoneIds);

    // Update each milestone with merged metadata
    const setFailures: string[] = [];
    for (const cm of currentMilestones || []) {
      const existingMetadata = (cm.metadata as Record<string, unknown>) || {};
      const newMetadata = {
        ...existingMetadata,
        is_optional: isOptional,
        optional_reason: isOptional ? (reason || null) : null,
        optional_set_by: isOptional ? adminEmail : null,
        optional_set_at: isOptional ? new Date().toISOString() : null,
      };

      // This update is the whole point of the request. If it fails quietly the
      // milestone keeps its old status while the screen reports success, which
      // is the shape that broke five features in two days.
      const { error: setErr } = await supabase
        .from('creator_milestones')
        .update({
          metadata: newMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', cm.milestone_id);

      if (setErr) {
        console.error('[milestones/optional] Failed to set milestone', {
          creatorId, milestoneId: cm.milestone_id, error: setErr.message,
        });
        setFailures.push(cm.milestone_id);
      }
    }

    if (setFailures.length > 0) {
      return NextResponse.json({
        success: false,
        error: `${setFailures.length} of ${milestoneIds.length} milestone(s) could not be updated. Nothing was noted, so retry rather than assuming it worked.`,
        failedMilestoneIds: setFailures,
      }, { status: 500 });
    }

    // Add internal note documenting the change
    const action = isOptional ? 'marked as optional (bonus)' : 'marked as required (core)';
    const noteContent = reason
      ? `Admin ${action}: ${milestoneNames}. Reason: ${reason}`
      : `Admin ${action}: ${milestoneNames}`;

    // Audit note. The status change above already succeeded, so record a
    // failure here and carry on.
    const { error: noteErr } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: noteContent,
        author: adminEmail || 'admin',
        visible_to_creator: false
      });
    if (noteErr) {
      console.error('[milestones/optional] Change made but not noted:', noteErr.message);
    }

    // Create admin notification for audit
    const { error: notifyErr } = await supabase
      .from('admin_notifications')
      .insert({
        creator_id: creatorId,
        type: 'milestone_optional_change',
        message: `${milestoneIds.length} milestone(s) ${action} for ${creator.name}`,
        link: `/admin/creators/${creatorId}`,
      });
    if (notifyErr) {
      console.error('[milestones/optional] No audit notification:', notifyErr.message);
    }

    console.log('[admin/milestones/optional] Successfully updated milestones');

    return NextResponse.json({
      success: true,
      updated: milestoneIds.length,
      action: isOptional ? 'marked_optional' : 'marked_required'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[admin/milestones/optional] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
