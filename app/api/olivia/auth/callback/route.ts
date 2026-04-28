import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const returnedState = url.searchParams.get('state');
  const storedState = request.cookies.get('olivia_oauth_state')?.value;

  if (error) {
    return htmlResponse(400, 'Authorization Denied',
      `<p>Google returned an error: <code>${escapeHtml(error)}</code></p>
       <p><a href="${origin}/api/olivia/auth/start">Try again</a></p>`);
  }

  if (!code) {
    return htmlResponse(400, 'Missing Code',
      `<p>No authorization code was returned by Google.</p>
       <p><a href="${origin}/api/olivia/auth/start">Try again</a></p>`);
  }

  if (!storedState || returnedState !== storedState) {
    return htmlResponse(403, 'State Mismatch',
      `<p>The CSRF state parameter does not match. This could indicate a forged request.</p>
       <p><a href="${origin}/api/olivia/auth/start">Try again</a></p>`);
  }

  const clientId = process.env.OLIVIA_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.OLIVIA_GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return htmlResponse(500, 'Server Configuration Error',
      '<p>OAuth client credentials are not configured on the server.</p>');
  }

  const redirectUri = process.env.OLIVIA_GOOGLE_REDIRECT_URI
    ?? `${origin}/api/olivia/auth/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('[olivia-oauth] Token exchange failed:', tokens);
      return htmlResponse(500, 'Token Exchange Failed',
        `<p>Google rejected the authorization code.</p>
         <p>Error: <code>${escapeHtml(tokens.error_description || tokens.error || 'unknown')}</code></p>
         <p><a href="${origin}/api/olivia/auth/start">Try again</a></p>`);
    }

    if (!tokens.refresh_token) {
      return htmlResponse(500, 'No Refresh Token',
        `<p>Google did not return a refresh token. This usually means the app was previously authorized
           without revoking access.</p>
         <p>Go to <a href="https://myaccount.google.com/permissions">Google Account Permissions</a>,
            remove this app, then <a href="${origin}/api/olivia/auth/start">try again</a>.</p>`);
    }

    const [calResult, gmailResult] = await Promise.all([
      testApi('https://www.googleapis.com/calendar/v3/calendars/primary', tokens.access_token),
      testApi('https://gmail.googleapis.com/gmail/v1/users/me/profile', tokens.access_token),
    ]);

    const stored = await storeRefreshToken(tokens.refresh_token, tokens.scope);

    console.log('[olivia-oauth] Authorization complete.',
      'Calendar:', calResult.ok ? 'PASS' : 'FAIL',
      'Gmail:', gmailResult.ok ? 'PASS' : 'FAIL',
      'Stored:', stored);

    const calStatus = calResult.ok
      ? `<span class="pass">PASS</span> — ${escapeHtml(calResult.data?.summary || 'OK')}`
      : `<span class="fail">FAIL (${calResult.status})</span>`;
    const gmailStatus = gmailResult.ok
      ? `<span class="pass">PASS</span> — ${escapeHtml(gmailResult.data?.emailAddress || 'OK')}`
      : `<span class="fail">FAIL (${gmailResult.status})</span>`;

    const response = htmlResponse(200, 'Authorization Complete',
      `<h2 class="pass">Authorization Complete</h2>
       <p>Olivia's Google Calendar integration has been authorized successfully.</p>
       <h3>Verification</h3>
       <ul>
         <li>Calendar API: ${calStatus}</li>
         <li>Gmail API: ${gmailStatus}</li>
       </ul>
       <p class="scope">Scope: <code>${escapeHtml(tokens.scope)}</code></p>
       <p>You can close this window. Phase 0 (D4) is complete.</p>`);

    response.cookies.delete('olivia_oauth_state');
    return response;

  } catch (err) {
    console.error('[olivia-oauth] Unexpected error:', err);
    return htmlResponse(500, 'Error',
      `<p>An unexpected error occurred during token exchange.</p>
       <p><a href="${origin}/api/olivia/auth/start">Try again</a></p>`);
  }
}

async function testApi(apiUrl: string, accessToken: string) {
  try {
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

async function storeRefreshToken(refreshToken: string, scope: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[olivia-oauth] Cannot store token: missing Supabase config');
    return false;
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/olivia_oauth_credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        credential_key: 'google_calendar_refresh_token',
        credential_value: refreshToken,
        scope,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[olivia-oauth] Token storage error:', err);
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function htmlResponse(statusCode: number, title: string, body: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — TDI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           max-width: 560px; margin: 60px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { font-size: 1.4rem; }
    .pass { color: #16a34a; font-weight: 600; }
    .fail { color: #dc2626; font-weight: 600; }
    .scope { font-size: 0.85rem; color: #666; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <h1>Olivia Google Calendar Setup</h1>
  ${body}
</body>
</html>`;

  return new NextResponse(html, {
    status: statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
