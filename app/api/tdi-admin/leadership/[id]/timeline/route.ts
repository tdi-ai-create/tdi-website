import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Supabase client
function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Check if TDI admin
function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

// GET - Fetch all timeline events for partnership
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    const { data: events, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('partnership_id', id)
      .order('event_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching timeline:', error);
      return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      events: events || [],
    });
  } catch (error) {
    console.error('Error in timeline GET:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Add new timeline event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_title, event_date, event_type, status, details } = body;

    if (!event_title) {
      return NextResponse.json({ error: 'Event title required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: event, error } = await supabase
      .from('timeline_events')
      .insert({
        partnership_id: id,
        event_title,
        event_date: event_date || null,
        event_type: event_type || 'other',
        status: status || 'upcoming',
        details: details || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating timeline event:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: id,
      action: 'timeline_event_created',
      details: { event_title, created_by: email },
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error in timeline POST:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH - Update timeline event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params;
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, ...updates } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: event, error } = await supabase
      .from('timeline_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', event_id)
      .eq('partnership_id', partnershipId)
      .select()
      .single();

    if (error) {
      console.error('Error updating timeline event:', error);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Error in timeline PATCH:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove timeline event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params;
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('timeline_events')
      .delete()
      .eq('id', eventId)
      .eq('partnership_id', partnershipId);

    if (error) {
      console.error('Error deleting timeline event:', error);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error in timeline DELETE:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
