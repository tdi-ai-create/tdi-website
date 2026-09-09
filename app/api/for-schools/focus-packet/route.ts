import { NextRequest, NextResponse } from 'next/server';
import { insertLead, triggerEnrichment } from '@/lib/create-lead';
import type { FocusPacketRole } from '@/lib/focus-packet';
import {
  FOCUS_PACKET_FULL_PATH,
  FOCUS_PACKET_GATED_CONTENTS,
  FOCUS_PACKET_GATED_PAGES,
  FOCUS_PACKET_ROLES,
  FOCUS_PACKET_ROLE_CODES,
} from '@/lib/focus-packet';

export const maxDuration = 30;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface PacketRequestBody {
  email?: string;
  role?: string;
  organization?: string;
  name?: string;
}

/**
 * The sample packet request on /for-schools.
 *
 * Two things have to happen and only one of them can block the visitor. The
 * lead is written first and awaited, because a request we never recorded is a
 * lead we lost. The email is attempted after, and a refusal from the provider
 * is reported honestly rather than reported as sent. Either way the packet is
 * revealed: the page promises the visitor sees it immediately, with no
 * confirmation step.
 */
export async function POST(req: NextRequest) {
  let body: PacketRequestBody;

  try {
    body = (await req.json()) as PacketRequestBody;
  } catch {
    return NextResponse.json({ error: 'Could not read the request.' }, { status: 400 });
  }

  const email = (body.email || '').trim();
  const role = (body.role || '').trim();
  const organization = (body.organization || '').trim();
  const name = (body.name || '').trim();

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Enter an email address we can send this to.' }, { status: 400 });
  }
  if (!(FOCUS_PACKET_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: 'Choose the role that fits best.' }, { status: 400 });
  }
  if (!organization) {
    return NextResponse.json({ error: 'Tell us which district or school this is for.' }, { status: 400 });
  }

  // Dry run exercises this exact path and stops short of the write and the
  // send. Refused in production, because a visitor who found the flag would
  // otherwise get the packet without ever becoming a lead.
  const dryRun =
    process.env.NODE_ENV !== 'production' &&
    req.nextUrl.searchParams.get('dryRun') === '1';

  if (dryRun) {
    console.log('[focus-packet] Dry run, nothing written and nothing sent:', {
      email,
      role,
      organization,
      name: name || null,
    });
    return NextResponse.json(
      {
        dryRun: true,
        wouldWriteLead: {
          name: `${organization} (Focus sample packet)`,
          contact_email: email,
          contact_role: FOCUS_PACKET_ROLE_CODES[role as FocusPacketRole],
          stage: 'targeting',
        },
        wouldEmail: email,
        packetUrl: FOCUS_PACKET_FULL_PATH,
        emailed: false,
      },
      { status: 200 }
    );
  }

  const { lead, error: leadError } = await insertLead({
    district_name: `${organization} (Focus sample packet)`,
    contact_name: name || undefined,
    contact_email: email,
    contact_role: FOCUS_PACKET_ROLE_CODES[role as FocusPacketRole],
    source: 'Focus sample packet (/for-schools)',
    stage: 'targeting',
    initial_heat: 'warm',
    notes: [
      'Requested The Focus sample packet from /for-schools.',
      `Role given: ${role}`,
      `District or school given: ${organization}`,
    ].join('\n'),
  });

  if (leadError || !lead) {
    // The visitor still gets the packet. Losing the lead is our problem, not
    // theirs, and it is loud in the logs rather than swallowed.
    console.error('[focus-packet] Lead was not recorded:', leadError, { email, organization, role });
  } else {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || (req.headers.get('origin') ?? 'http://localhost:3000');
    triggerEnrichment(lead.id, baseUrl);
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com').replace(/\/$/, '');
  const emailed = await sendPacketEmail({
    to: email,
    firstName: name.split(' ')[0] || '',
    packetUrl: `${siteUrl}${FOCUS_PACKET_FULL_PATH}`,
  });

  return NextResponse.json({ packetUrl: FOCUS_PACKET_FULL_PATH, emailed }, { status: 200 });
}

async function sendPacketEmail({
  to,
  firstName,
  packetUrl,
}: {
  to: string;
  firstName: string;
  packetUrl: string;
}): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('[focus-packet] RESEND_API_KEY missing, no copy was emailed to', to);
    return false;
  }

  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const contents = FOCUS_PACKET_GATED_CONTENTS.map(
    (item) =>
      `<li style="color:#374151; font-size:15px; line-height:1.7; margin:0 0 8px;">${item}</li>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background:#F9FAFB; margin:0; padding:0;">
  <div style="max-width:580px; margin:0 auto; padding:32px 24px;">
    <div style="background:#fff; border-radius:12px; padding:32px; border:1px solid #E5E7EB;">
      <div style="margin-bottom:24px;">
        <img src="https://www.teachersdeserveit.com/tdi-logo.png" alt="Teachers Deserve It" style="height:40px;" />
      </div>
      <p style="color:#374151; font-size:15px; line-height:1.7; margin:0 0 16px;">${greeting}</p>
      <p style="color:#374151; font-size:15px; line-height:1.7; margin:0 0 16px;">
        Here is the full sample packet for The Focus, the same copy that opened on the page.
        The last ${FOCUS_PACKET_GATED_PAGES} pages are the part worth forwarding:
      </p>
      <ul style="margin:0 0 20px; padding-left:20px;">${contents}</ul>
      <p style="margin:0 0 24px;">
        <a href="${packetUrl}" style="display:inline-block; background:#E8B84B; color:#1e2749; text-decoration:none; font-weight:700; font-size:15px; padding:14px 26px; border-radius:999px;">Open the packet</a>
      </p>
      <p style="color:#374151; font-size:15px; line-height:1.7; margin:0 0 16px;">
        Print it, forward it, or drop it into a board packet as it is. If you want to talk
        through what a year of this would look like in your buildings, reply to this email
        and tell us the problem you would name first.
      </p>
      <p style="color:#374151; font-size:15px; line-height:1.7; margin:0;">
        Teachers Deserve It
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Teachers Deserve It <hello@teachersdeserveit.com>',
        to: [to],
        subject: 'The Focus, a full year on paper',
        html,
      }),
    });

    if (!response.ok) {
      console.error('[focus-packet] Resend rejected the packet email:', response.status, await response.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('[focus-packet] Packet email failed:', err);
    return false;
  }
}
