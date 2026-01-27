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

    // Update milestone back to 'available'
    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update({
        status: 'available',
        completed_at: null,
        completed_by: null,
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

    // Log the action (internal note only)
    await supabase.from('creator_notes').insert({
      creator_id: creatorId,
      note: `Milestone reopened by admin for review/revision`,
      created_by: adminEmail || 'TDI Admin',
      visible_to_creator: false,
    });

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
