import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint for admins to mark milestones as optional (bonus) or required (core).
 * Optional milestones don't count against core completion percentage.
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
      .select('id, title, name')
      .in('id', milestoneIds);

    const milestoneNames = milestones?.map(m => m.title || m.name).join(', ') || 'milestones';

    // Update milestone(s) optional status via metadata
    // Get current milestones to merge metadata
    const { data: currentMilestones } = await supabase
      .from('creator_milestones')
      .select('milestone_id, metadata')
      .eq('creator_id', creatorId)
      .in('milestone_id', milestoneIds);

    // Update each milestone with merged metadata
    for (const cm of currentMilestones || []) {
      const existingMetadata = (cm.metadata as Record<string, unknown>) || {};
      const newMetadata = {
        ...existingMetadata,
        is_optional: isOptional,
        optional_reason: isOptional ? (reason || null) : null,
        optional_set_by: isOptional ? adminEmail : null,
        optional_set_at: isOptional ? new Date().toISOString() : null,
      };

      await supabase
        .from('creator_milestones')
        .update({
          metadata: newMetadata,
          updated_at: new Date().toISOString(),
        })
        .eq('creator_id', creatorId)
        .eq('milestone_id', cm.milestone_id);
    }

    // Add internal note documenting the change
    const action = isOptional ? 'marked as optional (bonus)' : 'marked as required (core)';
    const noteContent = reason
      ? `Admin ${action}: ${milestoneNames}. Reason: ${reason}`
      : `Admin ${action}: ${milestoneNames}`;

    await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: noteContent,
        author: adminEmail || 'admin',
        visible_to_creator: false
      });

    // Create admin notification for audit
    await supabase
      .from('admin_notifications')
      .insert({
        creator_id: creatorId,
        type: 'milestone_optional_change',
        message: `${milestoneIds.length} milestone(s) ${action} for ${creator.name}`,
        link: `/admin/creators/${creatorId}`,
      });

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
