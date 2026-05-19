import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { creatorId, topic, secondaryTopics } = await request.json();

    if (!creatorId || !topic) {
      return NextResponse.json({ success: false, error: 'creatorId and topic are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('creators')
      .update({
        topic,
        secondary_topics: secondaryTopics || [],
        topic_chosen_by_creator: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId);

    if (error) {
      console.error('[set-topic] Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('[set-topic] Success:', { creatorId, topic, secondaryTopics });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[set-topic] Error:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
