import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: practiceNoteId } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify enrollment
    const { data: note } = await serviceClient
      .from('hub_practice_notes')
      .select('course_id')
      .eq('id', practiceNoteId)
      .single();

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const { data: enrollment } = await serviceClient
      .from('hub_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', note.course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Must be enrolled to mark notes helpful' }, { status: 403 });
    }

    const { data: existing } = await serviceClient
      .from('hub_practice_note_helpful')
      .select('id')
      .eq('practice_note_id', practiceNoteId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      const { error } = await serviceClient
        .from('hub_practice_note_helpful')
        .delete()
        .eq('practice_note_id', practiceNoteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing helpful mark:', error);
        return NextResponse.json({ error: 'Failed to remove helpful mark' }, { status: 500 });
      }

      return NextResponse.json({ marked: false });
    } else {
      const { error } = await serviceClient
        .from('hub_practice_note_helpful')
        .insert({ practice_note_id: practiceNoteId, user_id: user.id });

      if (error) {
        console.error('Error adding helpful mark:', error);
        return NextResponse.json({ error: 'Failed to add helpful mark' }, { status: 500 });
      }

      return NextResponse.json({ marked: true });
    }
  } catch (error) {
    console.error('Error in POST /api/hub/practice-notes/[id]/helpful:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: practiceNoteId } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ marked: false });
    }

    const { data } = await serviceClient
      .from('hub_practice_note_helpful')
      .select('id')
      .eq('practice_note_id', practiceNoteId)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ marked: !!data });
  } catch (error) {
    console.error('Error in GET /api/hub/practice-notes/[id]/helpful:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
