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

    // If this is a session completion, advance the partnership's used count.
    //
    // This was three near-identical blocks, one per event type, which is how
    // the same missing error check ended up in all three. One table now, so
    // the rule lives once.
    //
    // These counters are not internal bookkeeping. The partnership page shows
    // "used / total", remaining_count is total minus used, and a school's own
    // dashboard reads them. A lost increment shows a school more sessions
    // remaining than it actually has, and we deliver work nobody bought.
    const USED_COUNTER: Record<string, string> = {
      observation_day_completed: 'observation_days_used',
      virtual_session_completed: 'virtual_sessions_used',
      executive_session_completed: 'executive_sessions_used',
    };

    const counter = USED_COUNTER[event_type];
    let countWarning: string | null = null;

    if (counter) {
      // Atomic, via increment_partnership_usage (migration 143).
      //
      // This used to read the counter, add one, and write it back. Two
      // completions logged close together both read N and both wrote N+1, so
      // one delivered session vanished with nothing erroring. #469 added the
      // error check, which could not catch that at all. The database does the
      // arithmetic now, so concurrent completions serialise.
      const { error: bumpError } = await supabase.rpc('increment_partnership_usage', {
        p_partnership_id: partnership_id,
        p_counter: counter,
      });

      if (bumpError) {
        console.error('[timeline-events] Event recorded but used count not advanced', {
          partnershipId: partnership_id, counter, error: bumpError.message,
        });
        countWarning = `The event was recorded, but ${counter} was not advanced, so this partnership reads as having one more session remaining than it does.`;
      }
    }

    return NextResponse.json({
      success: true,
      event: data,
      // Present only when the event was recorded but the used count was not
      // advanced, so the remaining-sessions figure is known to be wrong.
      countWarning,
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
