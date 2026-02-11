import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

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

// Timeline event types that are displayed on the Progress tab
export const TIMELINE_EVENT_TYPES = [
  'observation_day_completed',
  'virtual_session_completed',
  'executive_session_completed',
  'survey_completed',
  'milestone_reached',
  'pd_hours_awarded',
  'custom_event',
] as const;

// POST - Add a timeline event
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      partnership_id,
      event_type,
      event_date,
      title,
      description,
      building_id,
      details,
    } = body;

    if (!partnership_id || !event_type || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Insert into activity_log with the timeline event action
    const { data, error } = await supabase
      .from('activity_log')
      .insert({
        partnership_id,
        user_id: null,
        action: event_type,
        details: {
          title,
          description,
          event_date: event_date || new Date().toISOString().split('T')[0],
          building_id,
          created_by: email,
          is_timeline_event: true,
          ...details,
        },
      })
      .select()
      .single();

    if (error) throw error;

    // If this is a session completion, update the partnership's used counts
    if (event_type === 'observation_day_completed') {
      // Get current count and increment
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('observation_days_used')
        .eq('id', partnership_id)
        .single();

      await supabase
        .from('partnerships')
        .update({
          observation_days_used: (partnership?.observation_days_used || 0) + 1,
        })
        .eq('id', partnership_id);
    } else if (event_type === 'virtual_session_completed') {
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('virtual_sessions_used')
        .eq('id', partnership_id)
        .single();

      await supabase
        .from('partnerships')
        .update({
          virtual_sessions_used: (partnership?.virtual_sessions_used || 0) + 1,
        })
        .eq('id', partnership_id);
    } else if (event_type === 'executive_session_completed') {
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('executive_sessions_used')
        .eq('id', partnership_id)
        .single();

      await supabase
        .from('partnerships')
        .update({
          executive_sessions_used: (partnership?.executive_sessions_used || 0) + 1,
        })
        .eq('id', partnership_id);
    }

    return NextResponse.json({
      success: true,
      event: data,
    });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create timeline event' },
      { status: 500 }
    );
  }
}

// GET - Fetch timeline events for a partnership
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const partnershipId = searchParams.get('partnership_id');

    if (!partnershipId) {
      return NextResponse.json(
        { success: false, error: 'Missing partnership_id' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Fetch timeline events (activity_log entries that are timeline events)
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('partnership_id', partnershipId)
      .in('action', TIMELINE_EVENT_TYPES)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      events: data || [],
    });
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timeline events' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a timeline event
export async function DELETE(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing event ID' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('activity_log')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete timeline event' },
      { status: 500 }
    );
  }
}
