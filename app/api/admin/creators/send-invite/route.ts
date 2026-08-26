import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/is-tdi-admin';
import { creatorEmailTemplate } from '@/lib/creator-email-template';
import { logCreatorEmail } from '@/lib/creator-email-log';

/**
 * POST /api/admin/creators/send-invite
 *
 * Sends a creator a working way into Creator Studio.
 *
 * This did not exist. A creator could only ever be given access by being
 * accepted through the application queue, which by definition cannot help
 * anyone already on the roster. Partnerships have had send-login-link for
 * months and the Hub has its own welcome route; creators had neither.
 *
 * The cost of that gap, measured 26 August 2026: thirteen of twenty active
 * creators had never signed in, and not one of them had ever been sent a link.
 * The correlation was exact, seven for seven and thirteen for thirteen. Ten of
 * those accounts were bulk created on 19 May at 19:03 with passwords nobody
 * knows, three months before the acceptance email that carries a link was
 * written on 19 August. They were never locked out. They were never let in.
 *
 * Meanwhile they received thirty four emails between them, including fifteen
 * asking why they had gone quiet and four saying we were still here whenever
 * they were ready.
 *
 * Body: { creatorId, dryRun?: boolean }
 *
 * dryRun computes everything, mints the real link, returns the subject and the
 * rendered body, and sends nothing. Use it first, every time.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';

export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get('x-user-email');
    if (!adminEmail || !(await isTDIAdmin(adminEmail))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { creatorId, dryRun } = await request.json();
    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
    }

    const isDryRun = dryRun === true;
    const supabase = getServiceSupabase();

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, name, email, content_path, status, lifecycle_state')
      .eq('id', creatorId)
      .maybeSingle();

    if (creatorError) {
      return NextResponse.json({ error: `Could not load the creator: ${creatorError.message}` }, { status: 500 });
    }
    if (!creator?.email) {
      return NextResponse.json({ error: 'That creator has no email address on file.' }, { status: 400 });
    }

    // What they will actually land on. Telling someone their next step by name
    // is the difference between "log in" and "there is something here for you",
    // and it is the only line in this email that is about them.
    const { data: openStep } = await supabase
      .from('creator_milestones')
      .select('milestones!inner(name)')
      .eq('creator_id', creatorId)
      .eq('status', 'available')
      .limit(1)
      .maybeSingle();

    const stepName = (openStep?.milestones as { name?: string } | null)?.name ?? null;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: creator.email.toLowerCase(),
      options: { redirectTo: `${SITE_URL}/creator-portal/dashboard` },
    });

    // The old acceptance email fell back to the bare portal URL when this
    // failed, so the button went to a login wall under copy promising there was
    // no password to set up. Refuse instead of sending something untrue.
    if (linkError || !linkData?.properties?.action_link) {
      console.error('[send-invite] generateLink failed:', linkError?.message);
      return NextResponse.json(
        { error: `Could not create a sign in link: ${linkError?.message || 'no link returned'}` },
        { status: 500 }
      );
    }

    const signInUrl = linkData.properties.action_link;
    const firstName = creator.name?.split(' ')[0] || 'there';
    const subject = `Creator Studio | Your way in, ${firstName}`;

    const html = creatorEmailTemplate({
      firstName,
      tagline: 'Your Creator Studio is ready',
      body: `
        <p>Hey ${firstName},</p>
        <p>Here is your way into Creator Studio. The button below signs you straight in and
        there is no password to set up.</p>
        ${stepName
          ? `<p>When you land, there is one thing waiting: <strong>${stepName}</strong>. Just the one.
             You will see the whole road it sits on, but only ever one thing to do at a time.</p>`
          : `<p>When you land, it will ask you what you want to make. That one answer shapes
             everything after it, so take a moment with it.</p>`}
        <p>Every step carries a suggested date. Those are our recommendation and never a
        deadline, and there is a button that moves one if you need longer. Nobody has to be
        told why.</p>
        <p><em>If that button says the link has expired, it has, they do not last long. Go to
        <a href="${SITE_URL}/creator-portal">${SITE_URL.replace(/^https?:\/\//, '')}/creator-portal</a>,
        put in this email address, and a fresh one arrives straight away.</em></p>
        <p>Reply to this email any time.</p>
      `,
      ctaLabel: 'Open My Creator Studio',
      ctaUrl: signInUrl,
    });

    if (isDryRun) {
      return NextResponse.json({
        dryRun: true,
        wouldSendTo: creator.email,
        creator: creator.name,
        subject,
        openStep: stepName,
        linkGenerated: true,
        linkHost: new URL(signInUrl).host,
        html,
        emailsSent: 0,
        rowsWritten: 0,
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
        to: [creator.email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('[send-invite] Resend rejected the send:', res.status, detail);
      return NextResponse.json({ error: `The email was not sent: ${res.status}` }, { status: 502 });
    }

    await logCreatorEmail({
      creator_id: creator.id,
      creator_name: creator.name,
      creator_email: creator.email,
      direction: 'to_creator',
      category: 'invite',
      subject,
      sent_by: `admin:${adminEmail}`,
      dry_run: false,
    });

    return NextResponse.json({ success: true, sentTo: creator.email, subject, openStep: stepName });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[send-invite] Failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
