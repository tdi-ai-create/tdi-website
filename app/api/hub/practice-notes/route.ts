import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NOTE_SELECT = `
  *,
  user:hub_profiles!user_id (
    id,
    first_name,
    last_name,
    profile_picture_url
  ),
  lesson:hub_lessons!lesson_id (
    id,
    title,
    slug
  ),
  module:hub_modules!module_id (
    id,
    title
  )
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    const moduleId = searchParams.get('moduleId');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Build query using user-scoped client so RLS applies (hidden notes filtered automatically)
    let query = supabase
      .from('hub_practice_notes')
      .select(NOTE_SELECT)
      .eq('course_id', courseId);

    // "My Notes" filter passes userId explicitly; use session user for security
    if (searchParams.get('myNotes') === 'true' && user) {
      query = query.eq('user_id', user.id);
    }

    if (lessonId) query = query.eq('lesson_id', lessonId);
    if (moduleId) query = query.eq('module_id', moduleId);

    if (sortBy === 'helpful') {
      query = query.order('helpful_count', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: notes, error } = await query;

    if (error) {
      console.error('Error fetching practice notes:', error);
      return NextResponse.json({ error: 'Failed to fetch practice notes' }, { status: 500 });
    }

    // Batch-fetch helpful marks for authenticated user to avoid N+1 on client
    let userHelpfulNoteIds = new Set<string>();
    if (user && notes && notes.length > 0) {
      const noteIds = notes.map((n: any) => n.id);
      const { data: helpfulMarks } = await serviceClient
        .from('hub_practice_note_helpful')
        .select('practice_note_id')
        .eq('user_id', user.id)
        .in('practice_note_id', noteIds);
      if (helpfulMarks) {
        helpfulMarks.forEach((m: any) => userHelpfulNoteIds.add(m.practice_note_id));
      }
    }

    const enrichedNotes = (notes || []).map((note: any) => ({
      ...note,
      user_has_marked_helpful: userHelpfulNoteIds.has(note.id),
    }));

    const { count } = await supabase
      .from('hub_practice_notes')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    return NextResponse.json({ notes: enrichedNotes, total: count, limit, offset });
  } catch (error) {
    console.error('Error in GET /api/hub/practice-notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, lessonId, moduleId, whatITried, whatIChanged, whatHappened, tags } = body;

    if (!courseId || !whatITried) {
      return NextResponse.json({ error: 'courseId and whatITried are required' }, { status: 400 });
    }

    // Server-side enrollment check
    const { data: enrollment } = await serviceClient
      .from('hub_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Must be enrolled to post practice notes' }, { status: 403 });
    }

    // Check course is not archived
    const { data: course } = await serviceClient
      .from('hub_courses')
      .select('archived_at')
      .eq('id', courseId)
      .single();

    if (course?.archived_at) {
      return NextResponse.json({ error: 'Cannot post notes on archived courses' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('hub_practice_notes')
      .insert({
        course_id: courseId,
        lesson_id: lessonId || null,
        module_id: moduleId || null,
        user_id: user.id,
        what_i_tried: whatITried,
        what_i_changed: whatIChanged || null,
        what_happened: whatHappened || null,
        tags: tags || [],
      })
      .select(NOTE_SELECT)
      .single();

    if (error) {
      console.error('Error creating practice note:', error);
      return NextResponse.json({ error: 'Failed to create practice note' }, { status: 500 });
    }

    return NextResponse.json({ ...data, user_has_marked_helpful: false }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/hub/practice-notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
