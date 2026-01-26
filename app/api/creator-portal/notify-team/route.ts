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

    // Notification data structure - ready to connect to email service
    // Options: SendGrid, Resend, Postmark, or a webhook to Slack/email
    const notificationData = {
      to: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
      subject: `Action Needed: ${creatorName} is waiting on TDI`,
      body: `
Creator: ${creatorName} (${creatorEmail})
Waiting on: ${milestoneName}

View in Admin Portal: https://www.teachersdeserveit.com/admin/creators/${creatorId}
      `.trim(),
      metadata: {
        creatorId,
        creatorEmail,
        milestoneName,
        timestamp: new Date().toISOString(),
      },
    };

    // Log the notification for now
    // TODO: Connect to email service (SendGrid, Resend, etc.)
    console.log('[notify-team] Team notification:', JSON.stringify(notificationData, null, 2));

    // You can add email sending logic here later:
    //
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Creator Portal <portal@teachersdeserveit.com>',
    //   to: notificationData.to,
    //   subject: notificationData.subject,
    //   text: notificationData.body,
    // });
    //
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: notificationData.to,
    //   from: 'portal@teachersdeserveit.com',
    //   subject: notificationData.subject,
    //   text: notificationData.body,
    // });

    return NextResponse.json({
      success: true,
      message: 'Notification logged (email integration pending)',
    });
  } catch (error) {
    console.error('[notify-team] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
