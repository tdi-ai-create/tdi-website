import { NextRequest, NextResponse } from 'next/server';
import { sendDigestEmail, isEmailConfigured } from '@/lib/hub/email-sender';
import type { DigestEmailData } from '@/lib/hub/emails';

/**
 * API endpoint for sending digest emails (weekly/monthly summary)
 * POST /api/hub/emails/digest
 * Body: {
 *   userId: string,
 *   email: string,
 *   data: {
 *     displayName: string,
 *     coursesInProgress: number,
 *     lessonsCompletedThisMonth: number,
 *     pdHoursEarned: number,
 *     stressTrend: 'up' | 'down' | 'stable',
 *     recommendedCourses: { title: string, reason: string, url: string }[],
 *     newCourses: { title: string, url: string }[]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, data } = body as {
      userId: string;
      email: string;
      data: DigestEmailData;
    };

    if (!userId || !email || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, data' },
        { status: 400 }
      );
    }

    // Validate required data fields
    if (!data.displayName) {
      return NextResponse.json(
        { error: 'Missing displayName in data' },
        { status: 400 }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          sent: false,
          message: 'Email provider not configured. Add RESEND_API_KEY to environment variables.',
        },
        { status: 200 }
      );
    }

    // Set defaults for optional fields
    const digestData: DigestEmailData = {
      displayName: data.displayName,
      coursesInProgress: data.coursesInProgress || 0,
      lessonsCompletedThisMonth: data.lessonsCompletedThisMonth || 0,
      pdHoursEarned: data.pdHoursEarned || 0,
      stressTrend: data.stressTrend || 'stable',
      recommendedCourses: data.recommendedCourses || [],
      newCourses: data.newCourses || [],
    };

    const success = await sendDigestEmail(userId, email, digestData);

    return NextResponse.json({
      success,
      sent: success,
      message: success
        ? 'Digest email sent successfully'
        : 'Digest email not sent',
    });
  } catch (error) {
    console.error('Error in digest email endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process digest email request' },
      { status: 500 }
    );
  }
}
