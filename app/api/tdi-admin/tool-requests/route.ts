import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

/**
 * Admin API for managing community tool requests.
 *
 * GET  - List all requests (including declined)
 * PATCH - Update status or admin_notes
 */
export async function GET() {
  if (!hubUrl || !hubKey) {
    return NextResponse.json({ error: 'Hub not configured' }, { status: 500 });
  }

  const supabase = createClient(hubUrl, hubKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: requests, error } = await supabase
    .from('hub_tool_requests')
    .select('*')
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get author names
  const userIds = [...new Set((requests || []).map(r => r.user_id))];
  let authorMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('hub_profiles')
      .select('id, display_name, email')
      .in('id', userIds);

    (profiles || []).forEach(p => {
      authorMap[p.id] = p.display_name || p.email || 'Unknown';
    });
  }

  return NextResponse.json({
    requests: (requests || []).map(r => ({
      ...r,
      author_name: authorMap[r.user_id] || 'Unknown',
    })),
  });
}

export async function PATCH(request: NextRequest) {
  if (!hubUrl || !hubKey) {
    return NextResponse.json({ error: 'Hub not configured' }, { status: 500 });
  }

  const supabase = createClient(hubUrl, hubKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const body = await request.json();
  const { requestId, status, admin_notes, published_quick_win_id } = body;

  if (!requestId) {
    return NextResponse.json({ error: 'requestId required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) updates.status = status;
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;
  if (published_quick_win_id !== undefined) updates.published_quick_win_id = published_quick_win_id;

  const { error } = await supabase
    .from('hub_tool_requests')
    .update(updates)
    .eq('id', requestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
