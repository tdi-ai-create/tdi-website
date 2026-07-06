import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * POST /api/tdi-admin/courses/duplicate
 *
 * Duplicates a course's structure (and optionally content).
 * Creates new course, modules, and lessons with new IDs.
 * Videos are never copied -- video_id is set to null on duplicated lessons.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceCourseId, newTitle, includeContent } = body;

    if (!sourceCourseId || !newTitle) {
      return NextResponse.json({ error: 'sourceCourseId and newTitle are required' }, { status: 400 });
    }

    const supabase = getHubServiceSupabase();

    // 1. Read the source course
    const { data: sourceCourse, error: courseError } = await supabase
      .from('hub_courses')
      .select('*')
      .eq('id', sourceCourseId)
      .single();

    if (courseError || !sourceCourse) {
      return NextResponse.json({ error: 'Source course not found' }, { status: 404 });
    }

    // 2. Read source modules with lessons
    const { data: sourceModules, error: modulesError } = await supabase
      .from('hub_modules')
      .select('*, lessons:hub_lessons(*)')
      .eq('course_id', sourceCourseId)
      .order('sort_order', { ascending: true });

    if (modulesError) {
      return NextResponse.json({ error: modulesError.message }, { status: 500 });
    }

    // 3. Create the new course (copy all fields except id, slug, created_at, updated_at)
    const newSlug = generateSlug(newTitle);
    const {
      id: _id,
      slug: _slug,
      created_at: _createdAt,
      updated_at: _updatedAt,
      ...courseFields
    } = sourceCourse;

    const { data: newCourse, error: createError } = await supabase
      .from('hub_courses')
      .insert({
        ...courseFields,
        title: newTitle,
        slug: newSlug,
        is_published: false,
      })
      .select()
      .single();

    if (createError || !newCourse) {
      return NextResponse.json(
        { error: createError?.message || 'Failed to create course' },
        { status: 500 }
      );
    }

    // 4. Duplicate modules and lessons
    for (const sourceModule of (sourceModules || [])) {
      const {
        id: _modId,
        course_id: _courseId,
        created_at: _modCreated,
        updated_at: _modUpdated,
        lessons: sourceLessons,
        ...moduleFields
      } = sourceModule;

      const { data: newModule, error: modError } = await supabase
        .from('hub_modules')
        .insert({
          ...moduleFields,
          course_id: newCourse.id,
        })
        .select()
        .single();

      if (modError || !newModule) {
        console.error('Error duplicating module:', modError);
        continue;
      }

      // 5. Duplicate lessons for this module
      const sortedLessons = (sourceLessons || []).sort(
        (a: any, b: any) => a.sort_order - b.sort_order
      );

      for (const sourceLesson of sortedLessons) {
        const {
          id: _lessonId,
          module_id: _lessonModuleId,
          created_at: _lessonCreated,
          updated_at: _lessonUpdated,
          ...lessonFields
        } = sourceLesson;

        const lessonInsert: Record<string, unknown> = {
          ...lessonFields,
          module_id: newModule.id,
          video_id: null, // Videos are unique, never copy
        };

        // If not including content, clear it
        if (!includeContent) {
          lessonInsert.content = {};
          lessonInsert.transcript_text = null;
        }

        const { error: lessonError } = await supabase
          .from('hub_lessons')
          .insert(lessonInsert);

        if (lessonError) {
          console.error('Error duplicating lesson:', lessonError);
        }
      }
    }

    return NextResponse.json({ course: newCourse });
  } catch (error) {
    console.error('Error duplicating course:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
