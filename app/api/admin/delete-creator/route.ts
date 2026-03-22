import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to permanently delete a creator and all associated data.
 * POST with { creatorId }
 */
export async function POST(request: NextRequest) {
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
      return NextResponse.json({ success: false, error: 'creatorId is required' }, { status: 400 });
    }

    console.log('[delete-creator] Deleting creator:', creatorId);

    // 1. Get creator info for logging
    const { data: creator, error: fetchError } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', creatorId)
      .single();

    if (fetchError || !creator) {
      console.error('[delete-creator] Creator not found:', fetchError);
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    console.log('[delete-creator] Found creator:', creator.name, creator.email);

    // 2. Delete creator_milestones records
    const { error: milestonesError, count: milestonesCount } = await supabase
      .from('creator_milestones')
      .delete({ count: 'exact' })
      .eq('creator_id', creatorId);

    if (milestonesError) {
      console.error('[delete-creator] Error deleting milestones:', milestonesError);
      return NextResponse.json({ success: false, error: 'Failed to delete milestone records' }, { status: 500 });
    }

    console.log('[delete-creator] Deleted', milestonesCount, 'milestone records');

    // 3. Delete creator_notes records
    const { error: notesError, count: notesCount } = await supabase
      .from('creator_notes')
      .delete({ count: 'exact' })
      .eq('creator_id', creatorId);

    if (notesError) {
      console.error('[delete-creator] Error deleting notes:', notesError);
      return NextResponse.json({ success: false, error: 'Failed to delete note records' }, { status: 500 });
    }

    console.log('[delete-creator] Deleted', notesCount, 'note records');

    // 4. Delete creator_projects records (if any)
    const { error: projectsError, count: projectsCount } = await supabase
      .from('creator_projects')
      .delete({ count: 'exact' })
      .eq('creator_id', creatorId);

    if (projectsError) {
      console.error('[delete-creator] Error deleting projects:', projectsError);
      // Non-fatal - table may not exist or creator may not have projects
    } else {
      console.log('[delete-creator] Deleted', projectsCount, 'project records');
    }

    // 5. Delete creator_submissions records (if any)
    const { error: submissionsError, count: submissionsCount } = await supabase
      .from('creator_submissions')
      .delete({ count: 'exact' })
      .eq('creator_id', creatorId);

    if (submissionsError) {
      console.error('[delete-creator] Error deleting submissions:', submissionsError);
      // Non-fatal - table may not exist or creator may not have submissions
    } else {
      console.log('[delete-creator] Deleted', submissionsCount, 'submission records');
    }

    // 6. Finally, delete the creator record
    const { error: deleteError } = await supabase
      .from('creators')
      .delete()
      .eq('id', creatorId);

    if (deleteError) {
      console.error('[delete-creator] Error deleting creator:', deleteError);
      return NextResponse.json({ success: false, error: 'Failed to delete creator record' }, { status: 500 });
    }

    console.log('[delete-creator] Successfully deleted creator:', creator.name);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${creator.name}`,
      deleted: {
        creator: creator.name,
        milestones: milestonesCount || 0,
        notes: notesCount || 0,
        projects: projectsCount || 0,
        submissions: submissionsCount || 0,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[delete-creator] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
