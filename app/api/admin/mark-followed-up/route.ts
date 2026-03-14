import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { creatorId, adminEmail } = await request.json();

    if (!creatorId || !adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing creatorId or adminEmail' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server config error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get creator info for the note
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('name, email')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    // Update creator with followed_up status
    const { error: updateError } = await supabase
      .from('creators')
      .update({
        last_followed_up_at: now,
        followed_up_by: adminEmail,
        updated_at: now,
      })
      .eq('id', creatorId);

    if (updateError) {
      console.error('[mark-followed-up] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Add a note to track the follow-up
    const { error: noteError } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: `Marked as followed up by team`,
        author: adminEmail,
        visible_to_creator: false,
        created_at: now,
      });

    if (noteError) {
      console.error('[mark-followed-up] Note error:', noteError);
      // Don't fail the request for note error, just log it
    }

    return NextResponse.json({
      success: true,
      message: `${creator.name} marked as followed up`,
    });
  } catch (error) {
    console.error('[mark-followed-up] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
