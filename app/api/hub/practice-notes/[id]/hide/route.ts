import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email?.toLowerCase().endsWith('@teachersdeserveit.com')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const hidden: boolean = body.hidden !== false; // default to hiding (true)

    const updates = hidden
      ? { is_hidden: true, hidden_by: user.id, hidden_at: new Date().toISOString() }
      : { is_hidden: false, hidden_by: null, hidden_at: null };

    const { data, error } = await serviceClient
      .from('hub_practice_notes')
      .update(updates)
      .eq('id', id)
      .select('id, is_hidden')
      .single();

    if (error) {
      console.error('Error hiding practice note:', error);
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/hub/practice-notes/[id]/hide:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
