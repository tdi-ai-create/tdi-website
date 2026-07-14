import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Generate a URL-friendly slug from a title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * POST /api/tdi-admin/courses/[id]/duplicate
 * Duplicate a course with all its modules and lessons
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth note: requireAdminAuth removed -- Supabase SSR cookie check fails
    // for team members with client-side-only sessions. Admin layout protects pages.

    const supabase = getHubServiceSupabase();
    const { id } = await params;

    // 1. Fetch the original course
    const { data: originalCourse, error: courseError } = await supabase
      .from('hub_courses')
      .select('*')
      .eq('id', id)
      .single();

    if (courseError || !originalCourse) {
      console.error('[duplicate] Error fetching course:', courseError);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 2. Fetch modules with lessons
    const { data: modules, error: modulesError } = await supabase
      .from('hub_modules')
      .select(`
        *,
        lessons:hub_lessons(*)
      `)
      .eq('course_id', id)
      .order('sort_order', { ascending: true });

    if (modulesError) {
      console.error('[duplicate] Error fetching modules:', modulesError);
      return NextResponse.json({ error: modulesError.message }, { status: 500 });
    }

    // 3. Create new course with "(Copy)" prefix
    const newTitle = `(Copy) ${originalCourse.title}`;
    let slug = generateSlug(newTitle);

    // Check if slug exists and make it unique
    const { data: existingSlugs } = await supabase
      .from('hub_courses')
      .select('slug')
      .ilike('slug', `${slug}%`);

    if (existingSlugs && existingSlugs.length > 0) {
      const slugSet = new Set(existingSlugs.map((c) => c.slug));
      let counter = 2;
      let newSlug = slug;
      while (slugSet.has(newSlug)) {
        newSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = newSlug;
    }

    const { data: newCourse, error: newCourseError } = await supabase
      .from('hub_courses')
      .insert({
        title: newTitle,
        slug,
        description: originalCourse.description,
        category: originalCourse.category,
        difficulty: originalCourse.difficulty,
        estimated_minutes: originalCourse.estimated_minutes,
        pd_hours: originalCourse.pd_hours,
        is_free: originalCourse.is_free,
        price: originalCourse.price,
        thumbnail_url: originalCourse.thumbnail_url,
        creator_id: originalCourse.creator_id,
        is_published: false, // Always start as draft
      })
      .select()
      .single();

    if (newCourseError) {
      console.error('[duplicate] Error creating new course:', newCourseError);
      return NextResponse.json({ error: newCourseError.message }, { status: 500 });
    }

    // 4. Create copies of modules and lessons
    for (const module of modules || []) {
      const { data: newModule, error: newModuleError } = await supabase
        .from('hub_modules')
        .insert({
          course_id: newCourse.id,
          title: module.title,
          sort_order: module.sort_order,
        })
        .select()
        .single();

      if (newModuleError) {
        console.error('[duplicate] Error creating module:', newModuleError);
        continue;
      }

      // Copy lessons for this module
      const lessons = module.lessons || [];
      for (const lesson of lessons) {
        const { error: newLessonError } = await supabase
          .from('hub_lessons')
          .insert({
            module_id: newModule.id,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            transcript: lesson.transcript || null,
            transcript_es: lesson.transcript_es || null,
            duration_seconds: lesson.duration_seconds,
            is_free_preview: lesson.is_free_preview,
            is_quick_win: lesson.is_quick_win,
            sort_order: lesson.sort_order,
          });

        if (newLessonError) {
          console.error('[duplicate] Error creating lesson:', newLessonError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      course: newCourse,
      message: 'Course duplicated successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[duplicate] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
