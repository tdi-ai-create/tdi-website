import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

/**
 * Community Tool Requests API
 *
 * GET  - List requests (sorted by upvotes, filterable by status)
 * POST - Submit a new request or upvote an existing one
 */
export async function GET(request: NextRequest) {
  if (!hubUrl || !hubKey) {
    return NextResponse.json({ error: 'Hub not configured' }, { status: 500 });
  }

  const supabase = createClient(hubUrl, hubKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const userId = searchParams.get('userId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  let query = supabase
    .from('hub_tool_requests')
    .select('id, title, description, category, roles, status, upvote_count, created_at, user_id, published_quick_win_id')
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  // Default: show submitted + under_review + approved + in_progress (not declined)
  if (status) {
    query = query.eq('status', status);
  } else {
    query = query.in('status', ['submitted', 'under_review', 'approved', 'in_progress', 'published']);
  }

  const { data: requests, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If userId provided, check which ones this user has upvoted
  let userUpvotes: string[] = [];
  if (userId && requests && requests.length > 0) {
    const { data: upvotes } = await supabase
      .from('hub_tool_request_upvotes')
      .select('request_id')
      .eq('user_id', userId)
      .in('request_id', requests.map(r => r.id));

    userUpvotes = (upvotes || []).map(u => u.request_id);
  }

  // Get display names for request authors
  const userIds = [...new Set((requests || []).map(r => r.user_id))];
  let authorMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('hub_profiles')
      .select('id, display_name')
      .in('id', userIds);

    (profiles || []).forEach(p => {
      if (p.display_name) authorMap[p.id] = p.display_name;
    });
  }

  return NextResponse.json({
    requests: (requests || []).map(r => ({
      ...r,
      author_name: authorMap[r.user_id] || 'Educator',
      user_upvoted: userUpvotes.includes(r.id),
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!hubUrl || !hubKey) {
    return NextResponse.json({ error: 'Hub not configured' }, { status: 500 });
  }

  const supabase = createClient(hubUrl, hubKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const body = await request.json();
  const { action, userId } = body;

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // ── Submit a new request ──
  if (action === 'submit') {
    const { title, description, category } = body;

    if (!title || title.trim().length < 5) {
      return NextResponse.json({ error: 'Title must be at least 5 characters' }, { status: 400 });
    }

    if (title.trim().length > 150) {
      return NextResponse.json({ error: 'Title must be under 150 characters' }, { status: 400 });
    }

    // Rate limit: max 3 requests per user per day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('hub_tool_requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());

    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'You can submit up to 3 requests per day' }, { status: 429 });
    }

    const { data: newRequest, error } = await supabase
      .from('hub_tool_requests')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
        category: category || null,
        upvote_count: 1, // auto-upvote by creator
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-upvote by creator
    await supabase.from('hub_tool_request_upvotes').insert({
      request_id: newRequest.id,
      user_id: userId,
    });

    return NextResponse.json({ success: true, request: newRequest });
  }

  // ── Upvote a request ──
  if (action === 'upvote') {
    const { requestId } = body;
    if (!requestId) {
      return NextResponse.json({ error: 'requestId required' }, { status: 400 });
    }

    // Check if already upvoted
    const { data: existing } = await supabase
      .from('hub_tool_request_upvotes')
      .select('id')
      .eq('request_id', requestId)
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Remove upvote (toggle)
      await supabase
        .from('hub_tool_request_upvotes')
        .delete()
        .eq('request_id', requestId)
        .eq('user_id', userId);

      // Decrement count
      const { data: req } = await supabase
        .from('hub_tool_requests')
        .select('upvote_count')
        .eq('id', requestId)
        .single();

      await supabase
        .from('hub_tool_requests')
        .update({ upvote_count: Math.max((req?.upvote_count || 1) - 1, 0) })
        .eq('id', requestId);

      return NextResponse.json({ success: true, upvoted: false });
    }

    // Add upvote
    await supabase.from('hub_tool_request_upvotes').insert({
      request_id: requestId,
      user_id: userId,
    });

    // Increment count
    const { data: req } = await supabase
      .from('hub_tool_requests')
      .select('upvote_count')
      .eq('id', requestId)
      .single();

    await supabase
      .from('hub_tool_requests')
      .update({ upvote_count: (req?.upvote_count || 0) + 1 })
      .eq('id', requestId);

    return NextResponse.json({ success: true, upvoted: true });
  }

  return NextResponse.json({ error: 'Invalid action. Use "submit" or "upvote".' }, { status: 400 });
}
