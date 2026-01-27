import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET: Fetch pending notifications
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch unread notifications with creator info
    const { data: notifications, error } = await supabase
      .from('admin_notifications')
      .select(`
        *,
        creators (
          name,
          email
        )
      `)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[notifications] Error fetching:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include creator info at top level
    const transformedNotifications = (notifications || []).map((n) => ({
      ...n,
      creator_name: n.creators?.name || null,
      creator_email: n.creators?.email || null,
      creators: undefined, // Remove nested object
    }));

    return NextResponse.json({ notifications: transformedNotifications });
  } catch (error) {
    console.error('[notifications] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: Mark notification(s) as read
export async function POST(request: NextRequest) {
  try {
    const { notificationId, markAll, adminEmail } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const updateData = {
      is_read: true,
      read_at: new Date().toISOString(),
      read_by: adminEmail || null,
    };

    if (markAll) {
      // Mark all unread notifications as read
      const { error } = await supabase
        .from('admin_notifications')
        .update(updateData)
        .eq('is_read', false);

      if (error) {
        console.error('[notifications] Error marking all as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from('admin_notifications')
        .update(updateData)
        .eq('id', notificationId);

      if (error) {
        console.error('[notifications] Error marking as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: 'Must provide notificationId or markAll' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[notifications] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
