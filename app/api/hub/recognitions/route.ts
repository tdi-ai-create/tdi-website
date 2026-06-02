import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getHubAdmin() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Hub Supabase credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET -- load user's earned recognitions
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ earned: [] });

    const hub = getHubAdmin();
    const { data } = await hub
      .from('hub_earned_recognitions')
      .select('recognition_type, earned_at, seen_at')
      .eq('user_id', userId);

    return NextResponse.json({ earned: data || [] });
  } catch (error) {
    console.error('[Recognitions GET]', error);
    return NextResponse.json({ earned: [] });
  }
}

// POST -- record newly earned recognitions and mark as seen
export async function POST(request: NextRequest) {
  try {
    const { userId, newRecognitions, markSeen } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const hub = getHubAdmin();

    // Insert new recognitions (ignore conflicts -- already earned)
    if (newRecognitions && newRecognitions.length > 0) {
      const rows = newRecognitions.map((type: string) => ({
        user_id: userId,
        recognition_type: type,
        earned_at: new Date().toISOString(),
      }));

      await hub
        .from('hub_earned_recognitions')
        .upsert(rows, { onConflict: 'user_id,recognition_type', ignoreDuplicates: true });
    }

    // Mark recognitions as seen
    if (markSeen && markSeen.length > 0) {
      await hub
        .from('hub_earned_recognitions')
        .update({ seen_at: new Date().toISOString() })
        .eq('user_id', userId)
        .in('recognition_type', markSeen)
        .is('seen_at', null);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Recognitions POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
