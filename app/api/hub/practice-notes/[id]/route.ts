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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await serviceClient
      .from('hub_practice_notes')
      .select('user_id, course_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify still enrolled
    const { data: enrollment } = await serviceClient
      .from('hub_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', existing.course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Must be enrolled to edit practice notes' }, { status: 403 });
    }

    const body = await request.json();
    const { whatITried, whatIChanged, whatHappened, tags } = body;

    const updates: any = {};
    if (whatITried !== undefined) updates.what_i_tried = whatITried;
    if (whatIChanged !== undefined) updates.what_i_changed = whatIChanged;
    if (whatHappened !== undefined) updates.what_happened = whatHappened;
    if (tags !== undefined) updates.tags = tags;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('hub_practice_notes')
      .update(updates)
      .eq('id', id)
      .select(NOTE_SELECT)
      .single();

    if (error) {
      console.error('Error updating practice note:', error);
      return NextResponse.json({ error: 'Failed to update practice note' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/hub/practice-notes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existing } = await serviceClient
      .from('hub_practice_notes')
      .select('user_id, course_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify still enrolled
    const { data: enrollment } = await serviceClient
      .from('hub_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', existing.course_id)
      .single();

    if (!enrollment) {
      return NextResponse.json({ error: 'Must be enrolled to delete practice notes' }, { status: 403 });
    }

    const { error } = await supabase
      .from('hub_practice_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting practice note:', error);
      return NextResponse.json({ error: 'Failed to delete practice note' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/hub/practice-notes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
