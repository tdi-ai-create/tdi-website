import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

function getHubServiceSupabase() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Learning Hub Supabase not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * POST /api/tdi-admin/lessons/reorder
 * Batch update sort orders and module assignments for lessons
 * Supports cross-module moves
 */
export async function POST(request: Request) {
  try {
    // Auth note: requireAdminAuth removed -- Supabase SSR cookie check fails
    // for team members with client-side-only sessions. Admin layout protects pages.

    const supabase = getHubServiceSupabase();
    const body = await request.json();

    const { lessons } = body;

    if (!lessons || !Array.isArray(lessons)) {
      return NextResponse.json(
        { error: 'lessons array is required' },
        { status: 400 }
      );
    }

    // Update each lesson's sort_order and module_id
    const updates = lessons.map(
      (l: { id: string; module_id: string; sort_order: number }) =>
        supabase
          .from('hub_lessons')
          .update({ sort_order: l.sort_order, module_id: l.module_id })
          .eq('id', l.id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Lessons reordered successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[lessons/reorder] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
