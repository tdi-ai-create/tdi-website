import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await request.json();
    const { creatorId, postLaunchNotes } = body;

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creatorId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('creators')
      .update({ post_launch_notes: postLaunchNotes || null })
      .eq('id', creatorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating post_launch_notes:', error);
      return NextResponse.json(
        { error: 'Failed to update post-launch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, creator: data });
  } catch (error) {
    console.error('Error in update-post-launch-notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
