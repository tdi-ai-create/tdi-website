import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * GET /api/cron/social-engagement-prompts
 *
 * Weekdays at 7:30 AM CT. Sends Rae a daily email with copy-paste
 * Claude extension prompts for social media engagement across
 * LinkedIn, Substack, TikTok, Facebook, and Instagram.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });

    // Skip weekends
    const now = new Date();
    const day = now.getUTCDay();
    // 0 = Sunday, 6 = Saturday (in UTC; CT is UTC-5/6 so 12:30 UTC = 7:30 CT is still same day)
    if (day === 0 || day === 6) {
      return NextResponse.json({ success: true, skipped: 'weekend' });
    }

    const dateLabel = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Chicago',
    });

    const sharedRules = `Shared rules
Who to engage: Connections who hold a school leadership or educator title. Principal, assistant principal, superintendent, assistant superintendent, instructional coach, district leader, dean, department head, or classroom teacher. If a person's title is unclear, skip them.
Goal: Build trust, raise awareness of the connection, and offer supportive thoughts or tools. This is relationship building, not selling. Do not pitch Teachers Deserve It, link to products, or mention pricing.
Voice: Write as Rae Hughart, grounded in Teachers Deserve It's focus on supporting educators. Warm, direct, casual, sentence case. No em-dashes. No exclamation points. No asterisks or markdown. No corporate filler and no generic praise like "Great post." Every comment must react to the specific content of the post so it reads as genuinely human.
Engagement move: When it fits naturally, end with a question to invite a reply. Where appropriate, invite others in the thread to weigh in.
Safeguard: Draft everything for review first. Do not post, reply, or publish anything until I approve.`;

    const prompts = [
      {
        platform: 'LinkedIn',
        color: '#0A66C2',
        prompt: `Engage on Rae Hughart's LinkedIn.\n(Part 1) Reply to 5 to 10 recent posts from connections matching the targeting shared rules.\n(Part 2) Identify and follow 5-10 accounts from connections matching the targeting shared rules.\nPlatform limit: comments must be no more than 2 sentences.\n\n${sharedRules}`,
      },
      {
        platform: 'Substack',
        color: '#FF6719',
        prompt: `Engage on Rae Hughart's Substack (raehughart.substack.com).\nPart 1: Reply to 5 to 10 Substack Notes from connections matching the targeting shared rules. Apply all shared rules.\nPart 2: Post new Notes from Rae. Share 3 to 5 new Notes linking to Rae's own articles published in the last 30 days, framed to bring readers back to revisit them. Same voice rules. Before drafting, confirm each article's publish date is within the last 30 days, and verify every link opens to the correct live article. Draft all Notes for review before posting.\nPlatform limit: comments must be no more than 2 sentences.\n\n${sharedRules}`,
      },
      {
        platform: 'TikTok',
        color: '#010101',
        prompt: `Engage on Rae Hughart's TikTok.\n(Part 1) Reply to 5 to 10 recent videos from connections matching the targeting shared rules.\n(Part 2) Identify and follow 5-10 accounts from connections matching the targeting shared rules.\nPlatform limit: comments must be no more than 2 sentences.\n\n${sharedRules}`,
      },
      {
        platform: 'Facebook',
        color: '#1877F2',
        prompt: `Engage on Rae Hughart's Facebook.\n(Part 1) Reply to 5 to 10 recent posts from connections matching the targeting shared rules.\n(Part 2) Identify and follow 5-10 accounts from connections matching the targeting shared rules.\nPlatform limit: comments must be no more than 2 sentences.\n\n${sharedRules}`,
      },
      {
        platform: 'Instagram',
        color: '#E4405F',
        prompt: `Engage on Rae Hughart's Instagram.\n(Part 1) Reply to 5 to 10 recent posts from connections matching the targeting shared rules.\n(Part 2) Identify and follow 5-10 accounts from connections matching the targeting shared rules.\nPlatform limit: comments must be no more than 2 sentences.\n\n${sharedRules}`,
      },
    ];

    const promptBlocks = prompts.map(p => `
      <tr><td style="padding:0 0 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding:12px 16px;background:${p.color};border-radius:8px 8px 0 0;">
            <p style="margin:0;font-size:14px;font-weight:700;color:white;">${p.platform}</p>
          </td></tr>
          <tr><td style="padding:16px;background:#F8FAFC;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;">
            <pre style="margin:0;font-family:'Courier New',monospace;font-size:12px;line-height:1.5;color:#1e2749;white-space:pre-wrap;word-wrap:break-word;">${p.prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            <div style="margin-top:12px;text-align:right;">
              <a href="#" onclick="return false;" style="display:inline-block;padding:6px 14px;background:${p.color};color:white;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;">Copy to clipboard</a>
            </div>
          </td></tr>
        </table>
      </td></tr>
    `).join('');

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
        <div style="background:#1e2749;border-radius:12px 12px 0 0;padding:24px;">
          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#E8B84B;">Daily Social Engagement</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:white;">${dateLabel}</p>
        </div>

        <div style="background:white;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
          <p style="margin:0 0 8px;font-size:14px;color:#64748B;">Open the Claude extension on each platform. Copy the prompt below, paste it in, and review the drafts before approving.</p>

          <div style="background:#F0FDFA;border:1px solid #99F6E4;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
            <p style="margin:0;font-size:12px;color:#134E4A;">
              <strong>Today's checklist:</strong> LinkedIn (5-10 comments + 5-10 follows) . Substack (5-10 replies + 3-5 Notes) . TikTok (5-10 comments + 5-10 follows) . Facebook (5-10 comments + 5-10 follows) . Instagram (5-10 comments + 5-10 follows)
            </p>
          </div>

          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${promptBlocks}
          </table>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0;" />
          <p style="font-size:11px;color:#9CA3AF;margin:0;text-align:center;">
            Goal: look active on all accounts. Relationship building, not selling.
          </p>
        </div>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'TDI Daily <noreply@teachersdeserveit.com>',
        to: 'rae@teachersdeserveit.com',
        subject: `Social Engagement Prompts: ${dateLabel}`,
        html,
      }),
    });

    if (!resp.ok) {
      console.error('[social-engagement-prompts] Failed:', await resp.text());
      return NextResponse.json({ error: 'Email send failed' }, { status: 502 });
    }

    const result = await resp.json();
    return NextResponse.json({ success: true, emailId: result.id });
  } catch (error) {
    console.error('[social-engagement-prompts] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
