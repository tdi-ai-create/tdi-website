import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyCreatorOfNote } from '@/lib/creator-note-notify';

export async function POST(request: NextRequest) {
  try {
    const { creatorId, note, createdBy, visibleToCreator } = await request.json();

    if (!creatorId || !note || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[add-note] Missing environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get creator info for email
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, name, email')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      console.error('[add-note] Creator not found:', creatorError);
      return NextResponse.json(
        { success: false, error: 'Creator not found' },
        { status: 404 }
      );
    }

    // Insert the note
    const { data: newNote, error } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: creatorId,
        content: note.trim(),
        author: createdBy,
        visible_to_creator: visibleToCreator ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('[add-note] Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Notify the creator only when the note is actually visible to them.
    let emailed = false;
    let emailError: string | null = null;
    if (visibleToCreator !== false) {
      const notified = await notifyCreatorOfNote(supabase, creatorId, {
        source: 'add-note',
        actor: createdBy,
      });
      emailed = notified.sent;
      emailError = notified.reason ?? null;
    }

    return NextResponse.json({ success: true, note: newNote, emailed, email_error: emailError });
  } catch (error) {
    console.error('[add-note] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
