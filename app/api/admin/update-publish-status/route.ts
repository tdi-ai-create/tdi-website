import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await request.json();
    const { creatorId, action, scheduledDate, publishNotes } = body;

    if (!creatorId || !action) {
      return NextResponse.json(
        { error: 'creatorId and action are required' },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case 'publish_now':
        updateData = {
          publish_status: 'published',
          published_date: new Date().toISOString().split('T')[0],
          scheduled_publish_date: null,
          display_on_website: true,
        };
        break;

      case 'schedule':
        if (!scheduledDate) {
          return NextResponse.json(
            { error: 'scheduledDate is required for scheduling' },
            { status: 400 }
          );
        }
        updateData = {
          publish_status: 'scheduled',
          scheduled_publish_date: scheduledDate,
          publish_notes: publishNotes || null,
          display_on_website: true,
        };
        break;

      case 'reschedule':
        if (!scheduledDate) {
          return NextResponse.json(
            { error: 'scheduledDate is required for rescheduling' },
            { status: 400 }
          );
        }
        updateData = {
          scheduled_publish_date: scheduledDate,
          publish_notes: publishNotes || null,
        };
        break;

      case 'unpublish':
        updateData = {
          publish_status: 'scheduled',
          published_date: null,
          display_on_website: false,
        };
        break;

      case 'mark_published':
        // For marking past-due scheduled content as published
        updateData = {
          publish_status: 'published',
          published_date: new Date().toISOString().split('T')[0],
          scheduled_publish_date: null,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from('creators')
      .update(updateData)
      .eq('id', creatorId)
      .select()
      .single();

    if (error) {
      console.error('Error updating publish status:', error);
      return NextResponse.json(
        { error: 'Failed to update publish status' },
        { status: 500 }
      );
    }

    // Add a note to creator_notes for audit trail
    const noteContent = getActionNote(action, scheduledDate, publishNotes);
    if (noteContent) {
      await supabase.from('creator_notes').insert({
        creator_id: creatorId,
        content: noteContent,
        author: 'System',
        note_type: 'status_change',
      });
    }

    return NextResponse.json({ success: true, creator: data });
  } catch (error) {
    console.error('Error in update-publish-status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getActionNote(action: string, scheduledDate?: string, publishNotes?: string): string {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  switch (action) {
    case 'publish_now':
      return `Published on ${today}`;
    case 'schedule':
      const schedDate = new Date(scheduledDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `Scheduled to publish on ${schedDate}${publishNotes ? `. Note: ${publishNotes}` : ''}`;
    case 'reschedule':
      const newDate = new Date(scheduledDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `Rescheduled publish date to ${newDate}${publishNotes ? `. Note: ${publishNotes}` : ''}`;
    case 'unpublish':
      return `Unpublished on ${today}`;
    case 'mark_published':
      return `Marked as published on ${today} (was past scheduled date)`;
    default:
      return '';
  }
}
