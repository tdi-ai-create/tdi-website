import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyProfileQuiz } from '@/lib/hub/notifications';

const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/hub/notifications/suggest-quiz
 *
 * Called from the Hub frontend after login. Checks if the user
 * has completed profile setup. If not, sends a one-time notification
 * suggesting the profile quiz.
 *
 * Body: { userId }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    // Check if profile quiz is complete
    const { data: profile } = await hubSupabase
      .from('hub_profiles')
      .select('onboarding_completed, preferences')
      .eq('id', userId)
      .single();

    if (!profile) return NextResponse.json({ success: true, sent: false });

    // If onboarding is done or preferences are filled, skip
    if (profile.onboarding_completed) {
      return NextResponse.json({ success: true, sent: false, reason: 'already_completed' });
    }

    // Check if we already sent this notification
    const { data: existing } = await hubSupabase
      .from('hub_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'profile_quiz')
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, sent: false, reason: 'already_notified' });
    }

    await notifyProfileQuiz({ userId });

    return NextResponse.json({ success: true, sent: true });
  } catch (error) {
    console.error('[suggest-quiz] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
