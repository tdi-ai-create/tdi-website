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
 * GET /api/tdi-admin/courses/[id]
 * Fetch a single course with full module/lesson tree
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServiceSupabase();
    const { id } = await params;

    // Get the course
    const { data: course, error: courseError } = await supabase
      .from('hub_courses')
      .select('*')
      .eq('id', id)
      .single();

    if (courseError) {
      console.error('[course] Error fetching course:', courseError);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get modules with lessons
    const { data: modules, error: modulesError } = await supabase
      .from('hub_modules')
      .select(`
        *,
        lessons:hub_lessons(*)
      `)
      .eq('course_id', id)
      .order('sort_order', { ascending: true });

    if (modulesError) {
      console.error('[course] Error fetching modules:', modulesError);
      return NextResponse.json({ error: modulesError.message }, { status: 500 });
    }

    // Sort lessons within each module
    const sortedModules = (modules || []).map((module) => ({
      ...module,
      lessons: (module.lessons || []).sort(
        (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
      ),
    }));

    return NextResponse.json({
      course: {
        ...course,
        modules: sortedModules,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[course] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PATCH /api/tdi-admin/courses/[id]
 * Update course fields
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServiceSupabase();
    const { id } = await params;
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
      is_published,
    } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      updates.title = title;

      // Regenerate slug if title changed
      let slug = generateSlug(title);

      // Check if slug exists (excluding current course)
      const { data: existingSlugs } = await supabase
        .from('hub_courses')
        .select('slug')
        .ilike('slug', `${slug}%`)
        .neq('id', id);

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

      updates.slug = slug;
    }

    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (estimated_minutes !== undefined) updates.estimated_minutes = estimated_minutes;
    if (pd_hours !== undefined) updates.pd_hours = pd_hours;
    if (is_free !== undefined) {
      updates.is_free = is_free;
      if (is_free) {
        updates.price = null;
      }
    }
    if (price !== undefined && !is_free) updates.price = price;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;
    if (is_published !== undefined) updates.is_published = is_published;

    const { data: course, error } = await supabase
      .from('hub_courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[course] Error updating course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[course] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/tdi-admin/courses/[id]
 * Delete a course (cascades to modules and lessons via FK constraints)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServiceSupabase();
    const { id } = await params;

    const { error } = await supabase
      .from('hub_courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[course] Error deleting course:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[course] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
