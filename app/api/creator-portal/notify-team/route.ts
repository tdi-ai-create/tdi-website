import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { creatorName, creatorEmail, milestoneName, creatorId } = await request.json();

    if (!creatorName || !creatorEmail || !milestoneName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const recipients = ['creatorstudio@teachersdeserveit.com', 'rae@teachersdeserveit.com'];
    const subject = `Action Needed: ${creatorName} is waiting on TDI`;
    const body = `
Creator: ${creatorName} (${creatorEmail})
Waiting on: ${milestoneName}

View in Admin Portal: https://www.teachersdeserveit.com/tdi-admin/creators/${creatorId}
    `.trim();

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: recipients,
            subject,
            text: body,
          }),
        });
      } catch (emailError) {
        console.error('[notify-team] Email send error:', emailError);
        // Non-fatal -- log but don't fail the request
      }
    } else {
      console.warn('[notify-team] RESEND_API_KEY not set, notification logged only');
    }

    console.log('[notify-team] Team notification:', { creatorName, milestoneName, creatorId });

    return NextResponse.json({
      success: true,
      message: 'Team notified',
    });
  } catch (error) {
    console.error('[notify-team] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
