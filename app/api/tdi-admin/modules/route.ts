import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * POST /api/tdi-admin/modules
 * Create a new module
 */
export async function POST(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const body = await request.json();

    const { course_id, title, sort_order } = body;

    if (!course_id || !title) {
      return NextResponse.json(
        { error: 'course_id and title are required' },
        { status: 400 }
      );
    }

    // If sort_order not provided, get the next available
    let finalSortOrder = sort_order;
    if (finalSortOrder === undefined) {
      const { data: existingModules } = await supabase
        .from('hub_modules')
        .select('sort_order')
        .eq('course_id', course_id)
        .order('sort_order', { ascending: false })
        .limit(1);

      finalSortOrder =
        existingModules && existingModules.length > 0
          ? existingModules[0].sort_order + 1
          : 0;
    }

    const { data: module, error } = await supabase
      .from('hub_modules')
      .insert({
        course_id,
        title,
        sort_order: finalSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('[modules] Error creating module:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ module });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[modules] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * PATCH /api/tdi-admin/modules
 * Update a module
 */
export async function PATCH(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const body = await request.json();

    const { id, title, sort_order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Module id is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: module, error } = await supabase
      .from('hub_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[modules] Error updating module:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ module });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[modules] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/tdi-admin/modules
 * Delete a module (cascades to lessons via FK constraints)
 */
export async function DELETE(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Module id is required' }, { status: 400 });
    }

    const { error } = await supabase.from('hub_modules').delete().eq('id', id);

    if (error) {
      console.error('[modules] Error deleting module:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Module deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[modules] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
