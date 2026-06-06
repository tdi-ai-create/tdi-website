import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = 'rae@teachersdeserveit.com';

/**
 * POST /api/admin/notify
 *
 * Sends notification emails to admin team when partnership events occur.
 * Called internally by other API routes (not directly by frontend).
 *
 * Body: { event, partnershipName, details, urgency? }
 */
export async function POST(request: NextRequest) {
  try {
    if (!RESEND_API_KEY) {
      console.log('[admin-notify] Resend not configured, skipping');
      return NextResponse.json({ success: false, reason: 'no_resend' });
    }

    const { event, partnershipName, details, urgency } = await request.json();

    const subjectPrefix = urgency === 'urgent' ? '[URGENT] ' : urgency === 'action' ? '[ACTION] ' : '';

    const subjects: Record<string, string> = {
      roster_uploaded: `${subjectPrefix}${partnershipName} uploaded their staff roster`,
      item_completed: `${subjectPrefix}${partnershipName} completed: ${details?.itemTitle || 'an action item'}`,
      attention_flag: `${subjectPrefix}Attention needed: ${partnershipName}`,
      kpi_at_risk: `${subjectPrefix}KPI at risk: ${partnershipName}`,
      champion_identified: `${subjectPrefix}${partnershipName} identified their staff champion`,
      hub_distributed: `${subjectPrefix}${partnershipName} distributed Hub access to staff`,
      walkthrough_scheduled: `${subjectPrefix}${partnershipName} scheduled their kickoff walkthrough`,
      partnership_created: `${subjectPrefix}New partnership created: ${partnershipName}`,
      grant_path_awarded: `${subjectPrefix}Grant AWARDED: ${partnershipName}`,
    };

    const subject = subjects[event] || `${subjectPrefix}Partnership update: ${partnershipName}`;

    const detailsHtml = details
      ? Object.entries(details)
          .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#6B7280;font-size:13px;">${k}</td><td style="padding:6px 12px;font-size:13px;font-weight:600;color:#1e2749;">${v}</td></tr>`)
          .join('')
      : '';

    const urgencyBanner = urgency === 'urgent'
      ? '<div style="background:#FEE2E2;color:#991B1B;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:16px;">This requires immediate attention.</div>'
      : urgency === 'action'
      ? '<div style="background:#FEF3C7;color:#92400E;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:16px;">Action needed from TDI team.</div>'
      : '';

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI System <notifications@teachersdeserveit.com>',
        to: [ADMIN_EMAIL],
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
            <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">TDI Partnership System</div>
            <h2 style="font-size:18px;color:#1e2749;margin:0 0 12px;">${subject}</h2>
            ${urgencyBanner}
            ${detailsHtml ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${detailsHtml}</table>` : ''}
            <a href="https://www.teachersdeserveit.com/tdi-admin/leadership" style="display:inline-block;padding:10px 20px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;margin-top:12px;">
              Open Admin Portal
            </a>
          </div>
        `,
      }),
    });

    const sent = emailResponse.ok;
    if (!sent) {
      const err = await emailResponse.text();
      console.error('[admin-notify] Email failed:', err);
    }

    return NextResponse.json({ success: sent });
  } catch (error) {
    console.error('[admin-notify] Error:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
