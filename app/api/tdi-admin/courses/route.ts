import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

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
 * GET /api/tdi-admin/courses
 * Fetch all courses with module/lesson counts
 */
export async function GET(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status'); // 'published', 'draft', or null for all
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sort') || 'updated_at';
    const sortOrder = searchParams.get('order') || 'desc';

    // Build the query
    let query = supabase
      .from('hub_courses')
      .select(`
        *,
        modules:hub_modules(count),
        lessons:hub_modules(
          lessons:hub_lessons(count)
        )
      `);

    // Apply filters
    if (status === 'published') {
      query = query.eq('is_published', true);
    } else if (status === 'draft') {
      query = query.eq('is_published', false);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    if (sortBy === 'title') {
      query = query.order('title', { ascending });
    } else if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending });
    } else {
      query = query.order('updated_at', { ascending });
    }

    const { data: courses, error } = await query;

    if (error) {
      console.error('[courses] Error fetching courses:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate module and lesson counts
    const enrichedCourses = (courses || []).map((course) => {
      const moduleCount = course.modules?.[0]?.count || 0;
      let lessonCount = 0;
      if (course.lessons) {
        course.lessons.forEach((mod: { lessons: { count: number }[] }) => {
          if (mod.lessons) {
            mod.lessons.forEach((l: { count: number }) => {
              lessonCount += l.count || 0;
            });
          }
        });
      }

      // Remove the nested data and add counts
      const { modules, lessons, ...rest } = course;
      return {
        ...rest,
        module_count: moduleCount,
        lesson_count: lessonCount,
      };
    });

    return NextResponse.json({ courses: enrichedCourses });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[courses] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/tdi-admin/courses
 * Create a new course
 */
export async function POST(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const body = await request.json();

    const {
      title,
      description,
      category,
      difficulty,
      estimated_minutes,
      pd_hours,
      is_free,
      price,
      thumbnail_url,
      creator_id,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate slug
    let slug = generateSlug(title);

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

    // Create the course
    const { data: course, error } = await supabase
      .from('hub_courses')
      .insert({
        title,
        slug,
        description: description || '',
        category: category || 'Other',
        difficulty: difficulty || 'beginner',
        estimated_minutes: estimated_minutes || 0,
        pd_hours: pd_hours || 0,
        is_free: is_free !== false,
        price: is_free ? null : (price || null),
        thumbnail_url: thumbnail_url || null,
        creator_id: creator_id || null,
        is_published: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[courses] Error creating course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[courses] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
