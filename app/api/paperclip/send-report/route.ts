import { NextRequest, NextResponse } from 'next/server';

/**
 * Paperclip EA/CoS Agent — Send Report Endpoint
 *
 * Accepts { subject, content } from Olivia's send-report skill,
 * converts markdown to styled HTML, and sends via Resend to Rae.
 */

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.PAPERCLIP_REPORT_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: subject and content' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    const htmlBody = markdownToStyledHtml(content, subject);

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Olivia Smith - TDI <noreply@teachersdeserveit.com>',
        to: ['rae@teachersdeserveit.com'],
        subject,
        html: htmlBody,
        text: content,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('[send-report] Email send failed:', errorData);
      return NextResponse.json(
        { error: 'Email delivery failed', details: errorData },
        { status: 502 }
      );
    }

    const result = await emailResponse.json();
    console.log('[send-report] Email sent:', subject);

    // Also save a copy to Google Drive for backup
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';
    fetch(`${siteUrl}/api/paperclip/save-to-drive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${expectedSecret}`,
      },
      body: JSON.stringify({
        title: subject,
        content,
        folder: 'Paperclip Reports',
        agentName: 'Olivia Smith',
      }),
    }).catch(() => {}); // Fire and forget -- email is the primary delivery

    return NextResponse.json({ success: true, emailId: result.id });
  } catch (error) {
    console.error('[send-report] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send report' },
      { status: 500 }
    );
  }
}

// --- Markdown to Styled HTML ---

function markdownToStyledHtml(markdown: string, subject: string): string {
  let html = markdown;

  // Escape HTML entities first (except markdown syntax)
  html = html.replace(/&/g, '&amp;');

  // Convert blockquote callouts: > **What:** / > **So What:** / > **Now What:**
  html = html.replace(
    /^>\s*\*\*What:\*\*\s*(.+)$/gm,
    '<div style="background:#e8f4fd;border-left:4px solid #2196F3;padding:12px 16px;margin:8px 0;border-radius:4px;"><strong style="color:#1565C0;">What:</strong> $1</div>'
  );
  html = html.replace(
    /^>\s*\*\*So What:\*\*\s*(.+)$/gm,
    '<div style="background:#fff8e1;border-left:4px solid #FF9800;padding:12px 16px;margin:8px 0;border-radius:4px;"><strong style="color:#E65100;">So What:</strong> $1</div>'
  );
  html = html.replace(
    /^>\s*\*\*Now What:\*\*\s*(.+)$/gm,
    '<div style="background:#e8f5e9;border-left:4px solid #4CAF50;padding:12px 16px;margin:8px 0;border-radius:4px;"><strong style="color:#2E7D32;">Now What:</strong> $1</div>'
  );

  // Generic blockquotes
  html = html.replace(
    /^>\s*(.+)$/gm,
    '<blockquote style="border-left:3px solid #ddd;padding:8px 16px;margin:8px 0;color:#555;">$1</blockquote>'
  );

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 style="color:#333;margin:20px 0 8px;font-size:16px;border-bottom:1px solid #eee;padding-bottom:4px;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="color:#222;margin:24px 0 12px;font-size:18px;border-bottom:2px solid #e0c36a;padding-bottom:6px;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="color:#111;margin:0 0 16px;font-size:22px;">$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Simple table conversion
  html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (_match, headerRow: string, _sep, bodyRows: string) => {
    const headers = headerRow.split('|').filter((c: string) => c.trim()).map((c: string) => `<th style="padding:8px 12px;text-align:left;background:#f5f5f5;border:1px solid #ddd;font-size:13px;">${c.trim()}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td style="padding:8px 12px;border:1px solid #ddd;font-size:13px;">${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    return `<table style="border-collapse:collapse;width:100%;margin:12px 0;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li style="margin:4px 0;font-size:14px;">$1</li>');
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul style="padding-left:20px;margin:8px 0;">$1</ul>');

  // Numbered lists
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li style="margin:4px 0;font-size:14px;">$1</li>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;">');

  // Line breaks to paragraphs (double newline = paragraph, single = br)
  html = html.replace(/\n\n/g, '</p><p style="margin:8px 0;font-size:14px;line-height:1.6;color:#333;">');
  html = html.replace(/\n/g, '<br>');

  // Wrap in styled email template
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:8px;border:1px solid #e0e0e0;">
        <!-- Header -->
        <tr>
          <td style="background:#1a1a2e;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;color:#e0c36a;font-size:18px;font-weight:600;">${subject}</h1>
            <p style="margin:4px 0 0;color:#aaa;font-size:12px;">Olivia Smith -- EA / Chief of Staff -- Teachers Deserve It</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:24px;color:#333;font-size:14px;line-height:1.6;">
            <p style="margin:8px 0;font-size:14px;line-height:1.6;color:#333;">${html}</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;background:#fafafa;border-top:1px solid #eee;border-radius:0 0 8px 8px;">
            <p style="margin:0;color:#999;font-size:11px;text-align:center;">
              Sent by Olivia Smith (EA/CoS Agent) via Paperclip -- Teachers Deserve It
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}
