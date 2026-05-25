const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface GmailTokens {
  access_token: string;
  expires_in?: number;
}

export async function getGmailAccessToken(supabaseUrl: string, serviceKey: string): Promise<string> {
  const res = await fetch(`${supabaseUrl}/rest/v1/olivia_oauth_credentials?credential_key=eq.google_calendar_refresh_token&select=credential_value`, {
    headers: {
      'Authorization': `Bearer ${serviceKey}`,
      'apikey': serviceKey,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch refresh token: ${res.status}`);
  const rows = await res.json();
  if (!rows.length) throw new Error('No Gmail refresh token stored. Run /api/olivia/auth/start first.');

  const refreshToken = rows[0].credential_value;
  const clientId = process.env.OLIVIA_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.OLIVIA_GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Missing OLIVIA_GOOGLE_CLIENT_ID or CLIENT_SECRET');

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(`Token refresh failed: ${err.error_description || err.error || tokenRes.status}`);
  }

  const tokens: GmailTokens = await tokenRes.json();
  return tokens.access_token;
}

export interface GmailMessageMeta {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  date: string;
  snippet: string;
}

export async function listRecentMessages(accessToken: string, afterEpoch: number): Promise<{ id: string; threadId: string }[]> {
  const q = `after:${afterEpoch}`;
  const url = `${GMAIL_API}/messages?q=${encodeURIComponent(q)}&maxResults=50`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Gmail list failed: ${res.status}`);
  const data = await res.json();
  return data.messages ?? [];
}

export async function getMessageMeta(accessToken: string, messageId: string): Promise<GmailMessageMeta> {
  const url = `${GMAIL_API}/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Subject&metadataHeaders=Date`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Gmail get failed: ${res.status}`);
  const msg = await res.json();

  const headers: Record<string, string> = {};
  for (const h of msg.payload?.headers ?? []) {
    headers[h.name.toLowerCase()] = h.value;
  }

  return {
    id: msg.id,
    threadId: msg.threadId,
    from: parseEmailAddress(headers['from'] ?? ''),
    to: parseEmailList(headers['to'] ?? ''),
    cc: parseEmailList(headers['cc'] ?? ''),
    subject: headers['subject'] ?? '',
    date: headers['date'] ?? new Date(Number(msg.internalDate)).toISOString(),
    snippet: msg.snippet ?? '',
  };
}

function parseEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1] : raw).trim().toLowerCase();
}

function parseEmailList(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw.split(',').map(e => parseEmailAddress(e)).filter(Boolean);
}
