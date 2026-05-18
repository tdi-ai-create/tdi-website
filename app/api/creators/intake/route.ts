import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY not set — rejecting request');
    return false;
  }

  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set('remoteip', ip);

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const result = await res.json();
  return result.success === true;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  }

  const turnstileToken = (body['cf-turnstile-response'] ?? body.turnstile_token) as string | undefined;
  if (!turnstileToken) {
    return NextResponse.json({ error: 'Turnstile token is required' }, { status: 400 });
  }

  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const valid = await verifyTurnstile(turnstileToken, clientIp);
  if (!valid) {
    return NextResponse.json({ error: 'Turnstile verification failed' }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const name = String(body.name);
  const email = String(body.email);
  const strategy = body.strategy ? String(body.strategy) : null;
  const contentTypes = body.content_types ? String(body.content_types) : null;
  const referralSource = body.referral_dropdown ? String(body.referral_dropdown) : null;

  const { error } = await supabase.from('pending_creators').insert({
    name,
    email,
    strategy,
    referral_source: referralSource,
    content_types: contentTypes,
  });

  if (error) {
    console.error('Failed to insert pending_creators:', error);
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const emailBody = `
Hi Creator Studio Team,

A new creator application has been submitted on teachersdeserveit.com/create-with-us:

Name: ${name}
Email: ${email}
Strategy/Topic: ${strategy || '(not provided)'}
Content Types: ${contentTypes || '(not selected)'}
Referral Source: ${referralSource || '(not provided)'}

Sign in to the Admin Portal to review:
https://www.teachersdeserveit.com/tdi-admin/creators

- TDI Creator Studio
    `.trim();

    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
        to: ['creatorstudio@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
        subject: `[New Creator Application] ${name}`,
        text: emailBody,
      }),
    }).catch((err) => console.warn('Email notification failed (non-fatal):', err));
  }

  return NextResponse.json({ ok: true, type: 'creator_intake' });
}
