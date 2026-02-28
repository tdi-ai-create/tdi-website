import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * POST /api/tdi-admin/lessons
 * Create a new lesson
 */
export async function POST(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const body = await request.json();

    const { module_id, title, type, sort_order } = body;

    if (!module_id || !title) {
      return NextResponse.json(
        { error: 'module_id and title are required' },
        { status: 400 }
      );
    }

    // If sort_order not provided, get the next available
    let finalSortOrder = sort_order;
    if (finalSortOrder === undefined) {
      const { data: existingLessons } = await supabase
        .from('hub_lessons')
        .select('sort_order')
        .eq('module_id', module_id)
        .order('sort_order', { ascending: false })
        .limit(1);

      finalSortOrder =
        existingLessons && existingLessons.length > 0
          ? existingLessons[0].sort_order + 1
          : 0;
    }

    const { data: lesson, error } = await supabase
      .from('hub_lessons')
      .insert({
        module_id,
        title,
        type: type || 'video',
        sort_order: finalSortOrder,
        content: {},
        duration_seconds: 0,
        is_free_preview: false,
        is_quick_win: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[lessons] Error creating lesson:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lesson });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[lessons] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PATCH /api/tdi-admin/lessons
 * Update a lesson
 */
export async function PATCH(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const body = await request.json();

    const {
      id,
      title,
      type,
      content,
      video_id,
      audio_url,
      transcript_text,
      duration_seconds,
      is_free_preview,
      is_quick_win,
      sort_order,
      module_id,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Lesson id is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (type !== undefined) updates.type = type;
    if (content !== undefined) updates.content = content;
    if (video_id !== undefined) updates.video_id = video_id;
    if (audio_url !== undefined) updates.audio_url = audio_url;
    if (transcript_text !== undefined) updates.transcript_text = transcript_text;
    if (duration_seconds !== undefined) updates.duration_seconds = duration_seconds;
    if (is_free_preview !== undefined) updates.is_free_preview = is_free_preview;
    if (is_quick_win !== undefined) updates.is_quick_win = is_quick_win;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (module_id !== undefined) updates.module_id = module_id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: lesson, error } = await supabase
      .from('hub_lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[lessons] Error updating lesson:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lesson });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[lessons] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/tdi-admin/lessons
 * Delete a lesson
 */
export async function DELETE(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lesson id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('hub_lessons').delete().eq('id', id);

    if (error) {
      console.error('[lessons] Error deleting lesson:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[lessons] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
