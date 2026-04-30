import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_CONTENT_TYPES = ['course', 'quick_win'] as const;
const VALID_CAPACITIES = ['low', 'medium', 'high'] as const;
const VALID_RESPONSES = ['lower_than_rated', 'about_right', 'higher_than_rated'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, contentType, contentId, officialCapacity, response } = body;

    if (!userId || !contentType || !contentId || !officialCapacity || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ error: 'Invalid content_type' }, { status: 400 });
    }
    if (!VALID_CAPACITIES.includes(officialCapacity)) {
      return NextResponse.json({ error: 'Invalid official_capacity' }, { status: 400 });
    }
    if (!VALID_RESPONSES.includes(response)) {
      return NextResponse.json({ error: 'Invalid response' }, { status: 400 });
    }

    // HMAC of user_id with stable secret — pseudonymous, joinable to educator segments (Rodrigo spec)
    const secret = process.env.CAPACITY_FEEDBACK_HMAC_SECRET || 'tdi-capacity-feedback-hmac-2026';
    const educatorKey = crypto.createHmac('sha256', secret).update(userId).digest('hex');

    const { error } = await supabase.from('capacity_feedback').insert({
      content_type: contentType,
      content_id: contentId,
      official_capacity: officialCapacity,
      response,
      educator_key: educatorKey,
    });

    if (error) {
      console.error('[capacity-feedback] insert error:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[capacity-feedback] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
