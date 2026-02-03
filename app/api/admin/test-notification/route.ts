import { NextResponse } from 'next/server';

export async function GET() {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return NextResponse.json({
      success: false,
      error: 'RESEND_API_KEY not configured',
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
        to: ['rae@teachersdeserveit.com'],
        subject: 'TDI Creator Studio Notifications are Working!',
        html: `
          <h2>Great news!</h2>
          <p>Your Creator Studio email notifications are set up and working.</p>
          <p>You'll receive emails when:</p>
          <ul>
            <li>A creator completes a step that needs your review</li>
            <li>A new creator signs up</li>
            <li>A creator signs their agreement</li>
          </ul>
          <p><a href="https://www.teachersdeserveit.com/admin/creators">Go to Admin Portal &rarr;</a></p>
          <p>- TDI Creator Studio</p>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent to rae@teachersdeserveit.com',
        data,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data,
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
