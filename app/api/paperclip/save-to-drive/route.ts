import { NextRequest, NextResponse } from 'next/server';

/**
 * Paperclip Agent — Save to Google Drive
 *
 * Accepts { title, content, folder?, format? } from any Paperclip agent skill,
 * creates a Google Doc in Rae's Drive, and returns the doc URL.
 *
 * Folder defaults to "Paperclip Outputs" (auto-created if missing).
 * Format defaults to "doc" (Google Doc). Also supports "text" (plain text file).
 *
 * Auth: Bearer token via PAPERCLIP_REPORT_SECRET (same as send-report).
 * Drive access: Uses Olivia's Google OAuth refresh token stored in Supabase.
 */

async function getAccessToken(): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.OLIVIA_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.OLIVIA_GOOGLE_CLIENT_SECRET;

  if (!supabaseUrl || !serviceKey || !clientId || !clientSecret) {
    throw new Error('Missing Google OAuth or Supabase config');
  }

  // Get refresh token from Supabase
  const credRes = await fetch(
    `${supabaseUrl}/rest/v1/olivia_oauth_credentials?credential_key=eq.google_calendar_refresh_token&select=credential_value`,
    {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    }
  );

  if (!credRes.ok) throw new Error('Failed to fetch OAuth credentials');
  const creds = await credRes.json();
  if (!creds.length) throw new Error('No Google refresh token found. Re-authorize at /api/olivia/auth/start');

  const refreshToken = creds[0].credential_value;

  // Exchange refresh token for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json();
    throw new Error(`Token refresh failed: ${err.error_description || err.error}`);
  }

  const tokens = await tokenRes.json();
  return tokens.access_token;
}

async function findOrCreateFolder(accessToken: string, folderName: string): Promise<string> {
  // Search for existing folder
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    )}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files?.length > 0) return data.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) throw new Error('Failed to create Drive folder');
  const folder = await createRes.json();
  return folder.id;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.PAPERCLIP_REPORT_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, folder, format, agentName, taskId } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title and content' },
        { status: 400 }
      );
    }

    const accessToken = await getAccessToken();
    const folderName = folder || 'Paperclip Outputs';
    const folderId = await findOrCreateFolder(accessToken, folderName);

    // Build the document title with metadata
    const timestamp = new Date().toISOString().split('T')[0];
    const docTitle = taskId
      ? `${title} (${taskId}) -- ${timestamp}`
      : `${title} -- ${timestamp}`;

    // Add metadata header to content
    const header = [
      agentName ? `Agent: ${agentName}` : null,
      taskId ? `Task: ${taskId}` : null,
      `Created: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n');

    const fullContent = `${header}\n\n---\n\n${content}`;

    let fileUrl: string;

    if (format === 'text') {
      // Plain text file
      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/related; boundary=paperclip_boundary',
          },
          body: [
            '--paperclip_boundary',
            'Content-Type: application/json; charset=UTF-8',
            '',
            JSON.stringify({
              name: `${docTitle}.txt`,
              parents: [folderId],
              mimeType: 'text/plain',
            }),
            '--paperclip_boundary',
            'Content-Type: text/plain; charset=UTF-8',
            '',
            fullContent,
            '--paperclip_boundary--',
          ].join('\r\n'),
        }
      );

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(`Drive upload failed: ${JSON.stringify(err)}`);
      }
      const file = await createRes.json();
      fileUrl = `https://drive.google.com/file/d/${file.id}/view`;
    } else {
      // Google Doc (default) -- use HTML content for formatting
      const htmlContent = contentToHtml(fullContent, docTitle, agentName);

      const createRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/related; boundary=paperclip_boundary',
          },
          body: [
            '--paperclip_boundary',
            'Content-Type: application/json; charset=UTF-8',
            '',
            JSON.stringify({
              name: docTitle,
              parents: [folderId],
              mimeType: 'application/vnd.google-apps.document',
            }),
            '--paperclip_boundary',
            'Content-Type: text/html; charset=UTF-8',
            '',
            htmlContent,
            '--paperclip_boundary--',
          ].join('\r\n'),
        }
      );

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(`Drive upload failed: ${JSON.stringify(err)}`);
      }
      const file = await createRes.json();
      fileUrl = `https://docs.google.com/document/d/${file.id}/edit`;
    }

    // Share the file: anyone with the link can edit
    const fileId = fileUrl.match(/\/d\/([^/]+)/)?.[1]
    if (fileId) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'writer',
          type: 'anyone',
        }),
      }).catch(() => {}) // Don't fail if sharing fails
    }

    console.log(`[save-to-drive] Created: ${docTitle} -> ${fileUrl}`);

    return NextResponse.json({
      success: true,
      url: fileUrl,
      title: docTitle,
      folder: folderName,
    });
  } catch (error) {
    console.error('[save-to-drive] Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

function contentToHtml(content: string, title: string, agentName?: string): string {
  let html = content;

  // Markdown-style headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Bullet lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Numbered lists
  html = html.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  return `<html><body>
<h1>${title}</h1>
<p style="color:#666;font-size:12px;">${agentName ? `Created by ${agentName} via Paperclip` : 'Created via Paperclip'} | Teachers Deserve It</p>
<hr>
<p>${html}</p>
</body></html>`;
}
