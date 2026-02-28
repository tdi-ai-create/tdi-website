import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

/**
 * POST /api/tdi-admin/modules/reorder
 * Batch update sort orders for modules
 */
export async function POST(request: Request) {
  try {
    const supabase = getServiceSupabase();
    const body = await request.json();

    const { modules } = body;

    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json(
        { error: 'modules array is required' },
        { status: 400 }
      );
    }

    // Update each module's sort_order
    const updates = modules.map(
      (m: { id: string; sort_order: number }) =>
        supabase
          .from('hub_modules')
          .update({ sort_order: m.sort_order })
          .eq('id', m.id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Modules reordered successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[modules/reorder] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
