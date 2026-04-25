import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase credentials');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[intake] TURNSTILE_SECRET_KEY not set — skipping verification');
    return true;
  }
  const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }).toString(),
  });
  const data = await resp.json() as { success: boolean };
  return data.success === true;
}

// POST /api/creators/intake
// Accepts a creator intake form submission, verifies Turnstile, writes to
// pending_creators table, and sends notification emails to Rachel and Rae.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name?: string;
      email?: string;
      strategy?: string;
      content_types?: string;
      referral_dropdown?: string;
      other_referral?: string;
      'cf-turnstile-response'?: string;
    };

    const { name, email, strategy, content_types, referral_dropdown, other_referral } = body;
    const turnstileToken = body['cf-turnstile-response'];

    if (!name || !email || !strategy || !content_types || !referral_dropdown) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!turnstileToken) {
      return NextResponse.json({ error: 'Missing Turnstile token' }, { status: 400 });
    }

    const turnstileOk = await verifyTurnstile(turnstileToken);
    if (!turnstileOk) {
      return NextResponse.json({ error: 'Bot check failed. Please try again.' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase.from('pending_creators').insert({
      name, email, strategy, content_types, referral_dropdown, other_referral: other_referral ?? null,
    });

    if (dbError) {
      console.error('[intake] Supabase error:', dbError.message);
      return NextResponse.json({ error: 'Could not save application' }, { status: 500 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const notifyBody = `New creator application received:\n\nName: ${name}\nEmail: ${email}\nContent types: ${content_types}\nReferral: ${referral_dropdown}${other_referral ? ' (' + other_referral + ')' : ''}\n\nStrategy:\n${strategy}\n\nReview in TDI admin: https://teachersdeserveit.com/tdi-admin/`;
      await resend.emails.send({
        from: 'TDI Creators <noreply@teachersdeserveit.com>',
        to: ['rachel@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
        subject: `New Creator Application: ${name}`,
        text: notifyBody,
      });
    } else {
      console.warn('[intake] RESEND_API_KEY not set — skipping notification emails');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[intake] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
