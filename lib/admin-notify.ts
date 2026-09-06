/**
 * Send an admin notification email about a partnership event.
 *
 * This used to live behind POST /api/admin/notify, and every caller reached it
 * by fetching its own deployment. That address came from NEXT_PUBLIC_BASE_URL,
 * which is not set in production, so the fallback pointed at the protected
 * Vercel URL and the request was refused. Each caller then swallowed the
 * rejection in an empty catch, so nothing sent and nothing was logged. Eight
 * partnerships carried open flags for a month with no email.
 *
 * A function call cannot be refused by deployment protection, and it can be
 * awaited, so a failure now has somewhere to surface. The route still exists
 * and delegates here.
 */

const ADMIN_EMAIL = 'rae@teachersdeserveit.com';

type AdminNotifyEvent =
  | 'roster_uploaded'
  | 'roster_updated'
  | 'item_completed'
  | 'attention_flag'
  | 'kpi_at_risk'
  | 'champion_identified'
  | 'hub_distributed'
  | 'walkthrough_scheduled'
  | 'partnership_created'
  | 'grant_path_awarded'
  | (string & {});

export type AdminNotifyInput = {
  event: AdminNotifyEvent;
  partnershipName: string;
  urgency?: 'urgent' | 'action' | 'info';
  details?: Record<string, unknown>;
};

export type AdminNotifyResult = {
  sent: boolean;
  subject: string;
  reason?: string;
};

const SUBJECTS: Record<string, (name: string, details?: Record<string, unknown>) => string> = {
  roster_uploaded: (n) => `${n} uploaded their staff roster`,
  roster_updated: (n) => `${n} updated their staff roster`,
  item_completed: (n, d) => `${n} completed: ${d?.itemTitle || 'an action item'}`,
  attention_flag: (n) => `Attention needed: ${n}`,
  kpi_at_risk: (n) => `KPI at risk: ${n}`,
  champion_identified: (n) => `${n} identified their staff champion`,
  hub_distributed: (n) => `${n} distributed Hub access to staff`,
  walkthrough_scheduled: (n) => `${n} scheduled their kickoff walkthrough`,
  partnership_created: (n) => `New partnership created: ${n}`,
  grant_path_awarded: (n) => `Grant AWARDED: ${n}`,
};

function buildAdminNotifySubject(input: AdminNotifyInput): string {
  const prefix =
    input.urgency === 'urgent' ? '[URGENT] ' : input.urgency === 'action' ? '[ACTION] ' : '';
  const build = SUBJECTS[input.event];
  const body = build
    ? build(input.partnershipName, input.details)
    : `Partnership update: ${input.partnershipName}`;
  return `${prefix}${body}`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function notifyAdmin(input: AdminNotifyInput): Promise<AdminNotifyResult> {
  const subject = buildAdminNotifySubject(input);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('[admin-notify] RESEND_API_KEY is not set, not sending:', subject);
    return { sent: false, subject, reason: 'no_resend_key' };
  }

  const detailsHtml = input.details
    ? Object.entries(input.details)
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px;color:#6B7280;font-size:13px;">${escapeHtml(k)}</td>` +
            `<td style="padding:6px 12px;font-size:13px;font-weight:600;color:#1e2749;">${escapeHtml(v)}</td></tr>`
        )
        .join('')
    : '';

  const banner =
    input.urgency === 'urgent'
      ? '<div style="background:#FEE2E2;color:#991B1B;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:16px;">This requires immediate attention.</div>'
      : input.urgency === 'action'
        ? '<div style="background:#FEF3C7;color:#92400E;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:16px;">Action needed from TDI team.</div>'
        : '';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI System <notifications@teachersdeserveit.com>',
        to: [ADMIN_EMAIL],
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
            <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">TDI Partnership System</div>
            <h2 style="font-size:18px;color:#1e2749;margin:0 0 12px;">${escapeHtml(subject)}</h2>
            ${banner}
            ${detailsHtml ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${detailsHtml}</table>` : ''}
            <a href="https://www.teachersdeserveit.com/tdi-admin/leadership" style="display:inline-block;padding:10px 20px;background:#1e2749;color:white;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;margin-top:12px;">
              Open Admin Portal
            </a>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('[admin-notify] Resend rejected the send:', subject, response.status, body);
      return { sent: false, subject, reason: `resend_${response.status}` };
    }

    console.log('[admin-notify] sent:', subject);
    return { sent: true, subject };
  } catch (error) {
    console.error('[admin-notify] send threw:', subject, String(error));
    return { sent: false, subject, reason: String(error) };
  }
}
