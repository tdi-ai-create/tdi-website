import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/admin/creators/[id]/mark-engaged
// One-click action for Bella to mark a creator as engaged,
// which cancels any active re-engagement sequence and updates updated_at.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const adminEmail = body.adminEmail || 'unknown';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const now = new Date().toISOString();

    // Cancel any active re-engagement sequence
    const { data: activeSeq } = await supabase
      .from('creator_reengagement_sequences')
      .select('id, current_step')
      .eq('creator_id', id)
      .eq('status', 'active')
      .single();

    if (activeSeq) {
      await supabase
        .from('creator_reengagement_sequences')
        .update({
          status: 'cancelled',
          cancelled_at: now,
          cancelled_reason: `admin_mark_engaged:${adminEmail}`,
          updated_at: now,
        })
        .eq('id', activeSeq.id);
    }

    // Bump updated_at so the creator doesn't immediately re-trigger
    await supabase
      .from('creators')
      .update({
        updated_at: now,
        last_followed_up_at: now,
        followed_up_by: adminEmail,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      sequenceCancelled: !!activeSeq,
      step: activeSeq?.current_step ?? null,
    });
  } catch (e: any) {
    console.error('[mark-engaged] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/admin/creators/[id]/mark-engaged
// Returns the current re-engagement sequence status for a creator.

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get active sequence
    const { data: activeSeq } = await supabase
      .from('creator_reengagement_sequences')
      .select('*')
      .eq('creator_id', id)
      .eq('status', 'active')
      .single();

    // Get recent history (last 3 sequences)
    const { data: history } = await supabase
      .from('creator_reengagement_sequences')
      .select('*')
      .eq('creator_id', id)
      .order('created_at', { ascending: false })
      .limit(3);

    return NextResponse.json({
      activeSequence: activeSeq || null,
      history: history || [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
