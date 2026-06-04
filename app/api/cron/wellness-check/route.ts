import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/wellness-check
 *
 * Scheduled daily at 10 AM CT. Scans for educators with 2+ negative
 * vibe scores in the last 7 days and sends a personal check-in email.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify Vercel cron or authorized source
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        console.log('[wellness-check-cron] Unauthorized request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Call the wellness-check API internally
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/hub/wellness-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    console.log('[wellness-check-cron] Result:', JSON.stringify(result));

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[wellness-check-cron] Error:', error);
    return NextResponse.json(
      { error: 'Wellness check cron failed', details: String(error) },
      { status: 500 }
    );
  }
}
