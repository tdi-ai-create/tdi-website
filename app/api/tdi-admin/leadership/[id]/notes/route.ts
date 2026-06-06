import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET -- fetch all notes for a partnership
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('partnership_notes')
    .select('*')
    .eq('partnership_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data || [] });
}

// POST -- add a new note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { content, noteType, visibleToPartner } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('partnership_notes')
    .insert({
      partnership_id: id,
      content: content.trim(),
      author: auth.member.email || auth.user.email,
      note_type: noteType || 'general',
      visible_to_partner: visibleToPartner || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, note: data });
}

// PATCH -- update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { noteId, content, noteType, visibleToPartner } = await request.json();

  if (!noteId) {
    return NextResponse.json({ error: 'noteId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (content !== undefined) updates.content = content;
  if (noteType !== undefined) updates.note_type = noteType;
  if (visibleToPartner !== undefined) updates.visible_to_partner = visibleToPartner;

  const { error } = await supabase
    .from('partnership_notes')
    .update(updates)
    .eq('id', noteId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE -- remove a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { noteId } = await request.json();

  if (!noteId) {
    return NextResponse.json({ error: 'noteId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('partnership_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
