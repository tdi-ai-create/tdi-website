import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * POST /api/tdi-admin/lessons/reorder
 * Batch update sort orders and module assignments for lessons
 * Supports cross-module moves
 */
export async function POST(request: Request) {
  try {
    const supabase = getServiceSupabase();
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
