import { NextRequest, NextResponse } from 'next/server';
import { notifyAdmin } from '@/lib/admin-notify';

/**
 * POST /api/admin/notify
 *
 * Sends notification emails to the admin team when partnership events occur.
 *
 * The sending itself lives in lib/admin-notify.ts. Server side callers should
 * import notifyAdmin directly rather than fetching this route: reaching it over
 * HTTP means guessing at your own deployment address, and deployment protection
 * refuses the request when that guess is wrong.
 *
 * Body: { event, partnershipName, details, urgency? }
 */
export async function POST(request: NextRequest) {
  try {
    const { event, partnershipName, details, urgency } = await request.json();
    const result = await notifyAdmin({ event, partnershipName, details, urgency });
    return NextResponse.json({ success: result.sent, reason: result.reason });
  } catch (error) {
    console.error('[admin-notify] Error:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
