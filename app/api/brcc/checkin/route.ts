import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/brcc/checkin
 *
 * Public. Takes one email and nothing else.
 *
 * The BRCC keynote argues that professional development fails because nobody
 * follows up. This route is the follow up. Somebody leaves an address, and in
 * three weeks they get exactly one message asking how it went.
 *
 * That is the whole list. It is deliberately not a newsletter, so there is no
 * marketing consent here to collect and nothing else to send them.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['teacher', 'para', 'leader', 'other'] as const;

export async function POST(request: NextRequest) {
  let body: { email?: unknown; role?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: 'That does not look like an email address. Have another go.' },
      { status: 400 }
    );
  }

  // Role is optional and never free text, so a bad value is dropped rather than stored.
  const rawRole = typeof body.role === 'string' ? body.role : '';
  const role = (VALID_ROLES as readonly string[]).includes(rawRole) ? rawRole : null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: insertError } = await supabase
    .from('brcc_checkins')
    .insert({ email, role, source: 'brcc' });

  // Signing up twice is not an error the person needs to hear about. Anything
  // else is, because silently swallowing it would mean promising a follow up
  // we never scheduled, which is the exact failure the talk is about.
  if (insertError) {
    const isDuplicate = insertError.code === '23505';

    if (!isDuplicate) {
      console.error('[brcc/checkin] insert failed:', insertError.message);
      return NextResponse.json(
        { error: 'We could not save that. Try again, or email hello@teachersdeserveit.com.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, alreadySignedUp: true });
  }

  // Confirmation is best effort. The commitment is the row, not this email, so a
  // send failure must not tell someone their signup failed when it did not.
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    await resend.emails.send({
      from: 'Rae Hughart <hello@teachersdeserveit.com>',
      replyTo: 'hello@teachersdeserveit.com',
      to: email,
      subject: 'In three weeks I will ask how it went',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2d2d2d;">
          <p style="font-size: 17px; line-height: 1.6; margin: 0 0 20px;">
            Thanks for being at the session.
          </p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
            You are on the list, and I want to be precise about what that means, because
            the whole talk was about people promising follow up and never delivering it.
          </p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
            <b>In three weeks you will get one email from me asking how it went.</b>
            That is the entire list. One message, once. After that I stop unless you
            tell me otherwise.
          </p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
            In the meantime, the five moves and the twenty tools are here whenever you want them:
            <a href="https://teachersdeserveit.com/brcc" style="color: #1E2A4A;">teachersdeserveit.com/brcc</a>
          </p>
          <p style="font-size: 15px; line-height: 1.7; margin: 0 0 8px;">Rae</p>
          <p style="font-size: 13px; color: #6b7079; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #e0e0da; padding-top: 16px;">
            Rae Hughart &middot; Teachers Deserve It<br>
            Reply to this and a person reads it.
          </p>
        </div>
      `,
    });
  } catch (sendError) {
    console.error('[brcc/checkin] confirmation email failed:', sendError);
  }

  return NextResponse.json({ ok: true });
}
