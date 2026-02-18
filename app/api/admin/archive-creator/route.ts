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
    const { creatorId, action } = body;

    if (!creatorId || !action) {
      return NextResponse.json(
        { error: 'creatorId and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'archive' && action !== 'unarchive') {
      return NextResponse.json(
        { error: 'action must be "archive" or "unarchive"' },
        { status: 400 }
      );
    }

    const newStatus = action === 'archive' ? 'archived' : 'active';

    const { data, error } = await supabase
      .from('creators')
      .update({ status: newStatus })
      .eq('id', creatorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating creator status:', error);
      return NextResponse.json(
        { error: 'Failed to update creator status' },
        { status: 500 }
      );
    }

    // Add a note for audit trail
    await supabase.from('creator_notes').insert({
      creator_id: creatorId,
      content: action === 'archive'
        ? 'Creator archived'
        : 'Creator unarchived (restored to active)',
      author: 'System',
      note_type: 'status_change',
    });

    return NextResponse.json({ success: true, creator: data });
  } catch (error) {
    console.error('Error in archive-creator:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
