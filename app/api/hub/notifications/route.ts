import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/hub/notifications?userId=xxx
 * Returns unread notifications for a user
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const { data, error } = await hubSupabase
    .from('hub_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const unreadCount = (data || []).filter(n => !n.read).length;

  return NextResponse.json({ notifications: data || [], unreadCount });
}

/**
 * PATCH /api/hub/notifications
 * Mark notifications as read
 * Body: { userId, notificationIds: string[] } or { userId, markAllRead: true }
 */
export async function PATCH(request: NextRequest) {
  const { userId, notificationIds, markAllRead } = await request.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  if (markAllRead) {
    await hubSupabase
      .from('hub_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  } else if (notificationIds?.length) {
    await hubSupabase
      .from('hub_notifications')
      .update({ read: true })
      .in('id', notificationIds)
      .eq('user_id', userId);
  }

  return NextResponse.json({ success: true });
}
