import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export async function GET(request: NextRequest) {
  const clientId = process.env.OLIVIA_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: 'OLIVIA_GOOGLE_CLIENT_ID not configured' },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/olivia/auth/callback`;
  const state = randomBytes(24).toString('hex');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('olivia_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/olivia/auth',
  });

  return response;
}
