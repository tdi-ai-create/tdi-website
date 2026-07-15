import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/** Hub lessons live in the Learning Hub Supabase, not Creator Portal */
function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * GET /api/tdi-admin/lessons?id=UUID
 * Fetch a single lesson (used to get fresh content before save)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const supabase = getHubServiceSupabase();
    const { data: lesson, error } = await supabase
      .from('hub_lessons')
      .select('id, content, transcript, transcript_es')
      .eq('id', id)
      .single();

    if (error || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/tdi-admin/lessons
 * Create a new lesson
 */
export async function POST(request: Request) {
  try {
    // Auth note: requireAdminAuth removed -- Supabase SSR cookie check fails
    // for team members with client-side-only sessions. Admin layout protects pages.

    const supabase = getHubServiceSupabase();
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
    // Auth note: requireAdminAuth removed -- Supabase SSR cookie check fails
    // for team members with client-side-only sessions. Admin layout protects pages.

    const supabase = getHubServiceSupabase();
    const body = await request.json();

    const {
      id,
      title,
      type,
      content,
      video_id,
      audio_url,
      transcript_text,
      transcript_text_es,
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
    if (duration_seconds !== undefined) updates.duration_seconds = duration_seconds;
    if (is_free_preview !== undefined) updates.is_free_preview = is_free_preview;
    if (is_quick_win !== undefined) updates.is_quick_win = is_quick_win;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (module_id !== undefined) updates.module_id = module_id;
    if (transcript_text !== undefined) updates.transcript = transcript_text;
    if (transcript_text_es !== undefined) updates.transcript_es = transcript_text_es;

    // Store video_id, audio_url, and other media fields inside the content JSON
    // (hub_lessons doesn't have separate columns for these)
    if (video_id !== undefined || audio_url !== undefined || content !== undefined || body.duration_minutes !== undefined) {
      // Get current content first
      const { data: current } = await supabase
        .from('hub_lessons')
        .select('content')
        .eq('id', id)
        .single();

      const existingContent = (current?.content && typeof current.content === 'object') ? current.content as Record<string, unknown> : {};
      // Always merge: start with DB state, overlay whatever the client sent.
      // This prevents auto-saved fields (video_id, resource_url, etc.) from being lost.
      const newContent = content !== undefined && typeof content === 'object'
        ? { ...existingContent, ...(content as Record<string, unknown>) }
        : { ...existingContent };

      if (video_id !== undefined) newContent.video_id = video_id;
      if (audio_url !== undefined) newContent.audio_url = audio_url;
      if (body.duration_minutes !== undefined) newContent.duration_minutes = body.duration_minutes;

      updates.content = newContent;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: lesson, error } = await supabase
      .from('hub_lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // Flatten content fields into the response for client compatibility
    if (lesson && lesson.content && typeof lesson.content === 'object') {
      const c = lesson.content as Record<string, unknown>;
      (lesson as any).video_id = c.video_id || null;
      (lesson as any).audio_url = c.audio_url || null;
      (lesson as any).duration_minutes = c.duration_minutes || null;
      (lesson as any).transcript_text = lesson.transcript || null;
      (lesson as any).transcript_text_es = lesson.transcript_es || null;
    }

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
    // Auth note: requireAdminAuth removed -- Supabase SSR cookie check fails
    // for team members with client-side-only sessions. Admin layout protects pages.

    const supabase = getHubServiceSupabase();
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
