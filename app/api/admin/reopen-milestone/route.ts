import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { milestoneId, creatorId, adminEmail } = await request.json();

    console.log('[reopen-milestone] Reopening:', { milestoneId, creatorId });

    if (!milestoneId || !creatorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Update milestone back to 'available' and CLEAR all completion data
    // This prevents the "Completed on X" display when milestone is reopened
    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'available',
        completed_at: null,
        completed_by: null,
        submission_data: null,
        metadata: null,
        notes: null,
        updated_at: new Date().toISOString(),
      })
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId);

    if (updateError) {
      console.error('[reopen-milestone] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Log the action (internal note only).
    //
    // This used to insert `note` and treat `created_by` as the author. Neither
    // matches creator_notes, whose columns are `content` and `author`, so the
    // insert failed every time and the return value was never checked. Result:
    // 278 notes in the table and not one from an admin reopen, ever. Reopening
    // a milestone is exactly the action you want a trail for, since it changes
    // what a creator sees.
    const { error: noteError } = await supabase.from('creator_notes').insert({
      creator_id: creatorId,
      content: `Milestone "${milestoneId}" reopened by admin for review/revision`,
      author: adminEmail || 'TDI Admin',
      created_by: adminEmail || 'TDI Admin',
      visible_to_creator: false,
    });

    if (noteError) {
      // The reopen itself succeeded, so do not fail the request. Say so loudly
      // rather than dropping it, which is how this went unnoticed.
      console.error('[reopen-milestone] Audit note NOT written:', noteError.message);
    }

    console.log('[reopen-milestone] Success');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[reopen-milestone] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
