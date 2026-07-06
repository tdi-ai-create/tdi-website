import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Weekly Creator Email Digest for Bella
// Runs every Monday at 8 AM. Sends a summary of all creator emails
// from the past week so Bella knows exactly what went out automatically.
// ---------------------------------------------------------------------------

const BELLA_EMAIL = 'bella@teachersdeserveit.com';
const CC_EMAILS = ['rae@teachersdeserveit.com'];

const categoryLabels: Record<string, string> = {
  reengagement: 'Re-engagement Sequence',
  countdown_reminder: 'Countdown Reminder',
  welcome: 'Welcome Email',
  milestone_approved: 'Milestone Approved',
  revision_request: 'Revision Request',
  note_notification: 'Note Notification',
};

const stepLabels: Record<number, string> = {
  0: 'Initial check-in',
  1: 'Weekly nudge #1 (momentum)',
  2: 'Weekly nudge #2 (you\'re not alone)',
  3: 'Weekly nudge #3 (project value)',
  4: 'Weekly nudge #4 (still here)',
  5: 'Weekly nudge #5 (last check-in)',
  6: 'Pause notice (account paused)',
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      return NextResponse.json({ success: false, error: 'Missing config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get emails from the past 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: emails, error } = await supabase
      .from('creator_email_log')
      .select('*')
      .gte('sent_at', weekAgo.toISOString())
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('[email-digest] Error fetching emails:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!emails || emails.length === 0) {
      // Still send a "nothing went out" email so Bella knows the system is working
      await sendDigest(resendApiKey, {
        totalEmails: 0,
        toCreator: 0,
        toAdmin: 0,
        sections: [],
        weekStart: weekAgo,
        weekEnd: new Date(),
      });

      return NextResponse.json({ success: true, emailsSent: 0, digestSent: true });
    }

    // Group by category
    const toCreator = emails.filter((e: any) => e.direction === 'to_creator');
    const toAdmin = emails.filter((e: any) => e.direction === 'to_admin');

    // Build sections by category
    const categoryGroups: Record<string, any[]> = {};
    for (const email of emails) {
      const cat = email.category || 'other';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(email);
    }

    const sections = Object.entries(categoryGroups).map(([cat, items]) => ({
      category: cat,
      label: categoryLabels[cat] || cat,
      count: items.length,
      items: items.map((item: any) => ({
        creatorName: item.creator_name || 'Unknown',
        subject: item.subject,
        step: item.step,
        direction: item.direction,
        sentAt: item.sent_at,
      })),
    }));

    await sendDigest(resendApiKey, {
      totalEmails: emails.length,
      toCreator: toCreator.length,
      toAdmin: toAdmin.length,
      sections,
      weekStart: weekAgo,
      weekEnd: new Date(),
    });

    console.log(`[email-digest] Sent weekly digest: ${emails.length} emails summarized`);

    return NextResponse.json({
      success: true,
      totalEmails: emails.length,
      digestSent: true,
    });
  } catch (error) {
    console.error('[email-digest] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

interface DigestData {
  totalEmails: number;
  toCreator: number;
  toAdmin: number;
  sections: {
    category: string;
    label: string;
    count: number;
    items: {
      creatorName: string;
      subject: string;
      step: number | null;
      direction: string;
      sentAt: string;
    }[];
  }[];
  weekStart: Date;
  weekEnd: Date;
}

async function sendDigest(apiKey: string, data: DigestData): Promise<void> {
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const dateRange = `${formatDate(data.weekStart)} - ${formatDate(data.weekEnd)}`;

  let sectionsHtml = '';

  if (data.totalEmails === 0) {
    sectionsHtml = `
      <div style="padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #166534; font-size: 14px;">No automated emails went out this week. All quiet on the creator front.</p>
      </div>
    `;
  } else {
    for (const section of data.sections) {
      const rows = section.items
        .slice(0, 20) // Cap at 20 per section to keep email manageable
        .map((item) => {
          const stepInfo =
            item.step !== null && item.step !== undefined
              ? ` <span style="color: #9ca3af; font-size: 11px;">(${stepLabels[item.step] || `Step ${item.step}`})</span>`
              : '';
          const directionBadge =
            item.direction === 'to_admin'
              ? '<span style="display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 10px; padding: 1px 6px; border-radius: 4px; margin-left: 4px;">to team</span>'
              : '';
          const time = new Date(item.sentAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          return `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151;">
              <strong>${item.creatorName}</strong>${directionBadge}<br/>
              <span style="color: #6b7280;">${item.subject}</span>${stepInfo}
            </td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af; white-space: nowrap; vertical-align: top;">
              ${time}
            </td>
          </tr>`;
        })
        .join('');

      const overflow =
        section.items.length > 20
          ? `<p style="color: #9ca3af; font-size: 12px; padding: 4px 12px;">+ ${section.items.length - 20} more</p>`
          : '';

      sectionsHtml += `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 14px; font-weight: 600; color: #1e2749; margin: 0 0 8px 0; padding-bottom: 6px; border-bottom: 2px solid #1e2749;">
            ${section.label} <span style="font-weight: 400; color: #9ca3af;">(${section.count})</span>
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${rows}
          </table>
          ${overflow}
        </div>
      `;
    }
  }

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #374151;">
      <div style="background: #1e2749; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 600;">Creator Studio Email Digest</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">${dateRange}</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        <!-- Summary stats -->
        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1e2749;">${data.totalEmails}</p>
            <p style="margin: 2px 0 0; font-size: 11px; color: #9ca3af;">Total emails</p>
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1e2749;">${data.toCreator}</p>
            <p style="margin: 2px 0 0; font-size: 11px; color: #9ca3af;">To creators</p>
          </div>
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
            <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1e2749;">${data.toAdmin}</p>
            <p style="margin: 2px 0 0; font-size: 11px; color: #9ca3af;">To team</p>
          </div>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-bottom: 20px;">
          These emails were sent <strong>automatically</strong> by the system. No action needed unless a creator replied to one of them.
          If a creator replied, click "Mark as Engaged" on their profile in the admin panel to stop their re-engagement sequence.
        </p>

        ${sectionsHtml}

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            <a href="https://www.teachersdeserveit.com/tdi-admin/creator-email-audit" style="color: #1e2749;">View full email audit</a>
            &nbsp;|&nbsp;
            <a href="https://www.teachersdeserveit.com/tdi-admin/creators" style="color: #1e2749;">Creator Studio admin</a>
          </p>
        </div>
      </div>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
      to: [BELLA_EMAIL],
      cc: CC_EMAILS,
      subject: `Creator Email Digest: ${dateRange} (${data.totalEmails} emails)`,
      html,
    }),
  });
}
