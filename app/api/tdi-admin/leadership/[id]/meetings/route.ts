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

// GET -- fetch all meetings for a partnership
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('partnership_meetings')
    .select('*')
    .eq('partnership_id', id)
    .order('meeting_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ meetings: data || [] });
}

// POST -- log a new meeting
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { meetingDate, meetingType, attendees, summary, actionItems } = await request.json();

  if (!meetingDate) {
    return NextResponse.json({ error: 'Meeting date is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('partnership_meetings')
    .insert({
      partnership_id: id,
      meeting_date: meetingDate,
      meeting_type: meetingType || 'check_in',
      attendees: attendees || null,
      summary: summary || null,
      action_items: actionItems || null,
      logged_by: auth.member.email || auth.user.email,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, meeting: data });
}

// PATCH -- update a meeting
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { meetingId, meetingDate, meetingType, attendees, summary, actionItems } = await request.json();

  if (!meetingId) {
    return NextResponse.json({ error: 'meetingId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (meetingDate !== undefined) updates.meeting_date = meetingDate;
  if (meetingType !== undefined) updates.meeting_type = meetingType;
  if (attendees !== undefined) updates.attendees = attendees;
  if (summary !== undefined) updates.summary = summary;
  if (actionItems !== undefined) updates.action_items = actionItems;

  const { error } = await supabase
    .from('partnership_meetings')
    .update(updates)
    .eq('id', meetingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE -- remove a meeting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { meetingId } = await request.json();

  if (!meetingId) {
    return NextResponse.json({ error: 'meetingId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('partnership_meetings')
    .delete()
    .eq('id', meetingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
