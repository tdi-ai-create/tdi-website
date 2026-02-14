import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PATH_LABELS: Record<string, string> = {
  blog: 'Blog posts',
  download: 'Digital downloads',
  course: 'Learning Hub course',
};

/**
 * API endpoint to update a creator's content path with milestone adjustment.
 * POST with { creatorId, oldPath, newPath, adminEmail }
 *
 * This handles:
 * 1. Updating the content_path field on the creator
 * 2. Adding any missing milestones for the new path (preserving existing statuses)
 * 3. Auto-generating a creator note documenting the change
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

    const { creatorId, oldPath, newPath, adminEmail } = await request.json();

    if (!creatorId || !newPath) {
      return NextResponse.json(
        { success: false, error: 'creatorId and newPath are required' },
        { status: 400 }
      );
    }

    // Validate newPath
    if (!['blog', 'download', 'course'].includes(newPath)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content path' },
        { status: 400 }
      );
    }

    console.log('[update-content-path] Updating creator', creatorId, 'from', oldPath, 'to', newPath);

    // 1. Get the creator's current data
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, name, content_path, current_phase')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      console.error('[update-content-path] Creator not found:', creatorError);
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    // 2. Update the content_path
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        content_path: newPath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[update-content-path] Error updating content_path:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    console.log('[update-content-path] Content path updated');

    // 3. Check if we need to add missing milestones
    // Get all milestones
    const { data: allMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('id, title, applies_to, sort_order')
      .order('sort_order');

    if (milestonesError) {
      console.error('[update-content-path] Error fetching milestones:', milestonesError);
    }

    // Get creator's existing milestones
    const { data: existingMilestones, error: existingError } = await supabase
      .from('creator_milestones')
      .select('milestone_id')
      .eq('creator_id', creatorId);

    if (existingError) {
      console.error('[update-content-path] Error fetching existing milestones:', existingError);
    }

    let milestonesAdded = 0;

    if (allMilestones && existingMilestones) {
      const existingIds = new Set(existingMilestones.map(m => m.milestone_id));
      const missingMilestones = allMilestones.filter(m => !existingIds.has(m.id));

      if (missingMilestones.length > 0) {
        console.log('[update-content-path] Adding', missingMilestones.length, 'missing milestones');

        // Add missing milestones as locked
        const newRecords = missingMilestones.map(m => ({
          creator_id: creatorId,
          milestone_id: m.id,
          status: 'locked',
          completed_at: null,
        }));

        const { error: insertError } = await supabase
          .from('creator_milestones')
          .insert(newRecords);

        if (insertError) {
          console.error('[update-content-path] Error adding milestones:', insertError);
        } else {
          milestonesAdded = newRecords.length;
        }
      }
    }

    // 4. Add a creator note documenting the change
    const oldPathLabel = oldPath ? PATH_LABELS[oldPath] || oldPath : 'Not selected';
    const newPathLabel = PATH_LABELS[newPath] || newPath;
    const adminName = adminEmail ? adminEmail.split('@')[0] : 'Admin';

    const noteContent = `Content path changed from "${oldPathLabel}" to "${newPathLabel}" by ${adminName}.`;

    const { error: noteError } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: noteContent,
        author: adminEmail || 'System',
        visible_to_creator: false,
        phase_id: creator.current_phase,
      });

    if (noteError) {
      console.error('[update-content-path] Error adding note:', noteError);
      // Don't fail the whole request for a note error
    }

    console.log('[update-content-path] Complete. Milestones added:', milestonesAdded);

    return NextResponse.json({
      success: true,
      oldPath,
      newPath,
      milestonesAdded,
      noteAdded: !noteError,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[update-content-path] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
