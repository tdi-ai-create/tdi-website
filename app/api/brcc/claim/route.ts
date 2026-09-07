import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/brcc/claim
 *
 * Public. Opens the Learning Hub to a BRCC attendee through 30 November 2026.
 *
 * The page, all four pages of the handout and slide 34 promise three things:
 * no card, nothing that turns into a charge, and access that simply ends on
 * 1 December. This route has to be true to all three.
 *
 * Deliberately narrow, and NOT a reuse of /api/hub/provision:
 *   - the tier and the expiry are constants here, never taken from the caller
 *   - it can only ever raise somebody's access, never lower it
 *   - an existing paying or partner membership is left completely alone
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Access ends here. Enforced by getEffectiveTier in lib/hub/membership-access.ts. */
const ACCESS_ENDS = '2026-11-30T23:59:59Z';
const GRANT_TIER = 'all_access';
const SOURCE = 'brcc_2026';

/** Crude ceiling so a public endpoint cannot be used to mint accounts in bulk. */
const MAX_CLAIMS_PER_HOUR = 120;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';

function getHubAdmin() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Hub Supabase credentials');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Never downgrade anyone. A Stripe subscriber or a district partner seat already
 * has equal or better access, and overwriting it would quietly cut them off on
 * 1 December. Those people get a login link and nothing else touched.
 */
function alreadyCoveredBy(existing: { tier?: string; status?: string; source?: string; expires_at?: string | null } | null) {
  if (!existing) return false;
  if (existing.status !== 'active' && existing.status !== 'trial') return false;
  if (existing.source === 'stripe' || existing.source === 'district_partner') return true;
  if (existing.tier !== GRANT_TIER) return false;
  // Same tier, but ours would expire sooner than theirs. Leave theirs.
  if (!existing.expires_at) return true;
  return new Date(existing.expires_at).getTime() >= new Date(ACCESS_ENDS).getTime();
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown };
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

  const hub = getHubAdmin();

  // Ceiling check before creating anything.
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount, error: countError } = await hub
    .from('hub_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('source', SOURCE)
    .gte('created_at', anHourAgo);

  if (countError) {
    console.error('[brcc/claim] rate check failed:', countError.message);
    return NextResponse.json({ error: 'We could not open that right now. Try again shortly.' }, { status: 503 });
  }
  if ((recentCount ?? 0) >= MAX_CLAIMS_PER_HOUR) {
    return NextResponse.json(
      { error: 'A lot of people are claiming at once. Try again in a few minutes, or email hello@teachersdeserveit.com.' },
      { status: 429 }
    );
  }

  // Does this person already exist in the Hub?
  const { data: profile, error: profileLookupError } = await hub
    .from('hub_profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (profileLookupError) {
    console.error('[brcc/claim] profile lookup failed:', profileLookupError.message);
    return NextResponse.json({ error: 'We could not open that right now. Try again shortly.' }, { status: 500 });
  }

  let userId = profile?.id as string | undefined;
  let leftExistingAlone = false;

  if (!userId) {
    // Auth users are created through the admin API, never with SQL. Rows inserted
    // directly into auth.users come out with null instance_id and token columns
    // and silently break every sign-in path.
    const { data: authUser, error: authError } = await hub.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { source: SOURCE },
    });

    if (authError || !authUser?.user) {
      console.error('[brcc/claim] createUser failed:', authError?.message);
      return NextResponse.json({ error: 'We could not create that account. Email hello@teachersdeserveit.com and we will do it by hand.' }, { status: 500 });
    }

    userId = authUser.user.id;

    const { error: profileError } = await hub.from('hub_profiles').upsert(
      {
        id: userId,
        email,
        display_name: email.split('@')[0],
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // The auth user exists by this point, so somebody who can sign in but has no
    // profile breaks every screen that joins on it. Worth failing the request.
    if (profileError) {
      console.error('[brcc/claim] profile insert failed:', profileError.message);
      return NextResponse.json({ error: 'We could not finish setting that up. Email hello@teachersdeserveit.com.' }, { status: 500 });
    }
  }

  // Read any existing membership before writing, so we never lower somebody's access.
  const { data: existing, error: memberLookupError } = await hub
    .from('hub_memberships')
    .select('tier, status, source, expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (memberLookupError) {
    console.error('[brcc/claim] membership lookup failed:', memberLookupError.message);
    return NextResponse.json({ error: 'We could not open that right now. Try again shortly.' }, { status: 500 });
  }

  if (alreadyCoveredBy(existing)) {
    leftExistingAlone = true;
  } else {
    const { error: memberError } = await hub.from('hub_memberships').upsert(
      {
        user_id: userId,
        tier: GRANT_TIER,
        source: SOURCE,
        status: 'active',
        expires_at: ACCESS_ENDS,
      },
      { onConflict: 'user_id' }
    );

    if (memberError) {
      console.error('[brcc/claim] membership upsert failed:', memberError.message);
      return NextResponse.json({ error: 'We could not open the library on that account. Email hello@teachersdeserveit.com.' }, { status: 500 });
    }
  }

  const { error: logError } = await hub.from('hub_activity_log').insert({
    user_id: userId,
    action: 'account_provisioned',
    metadata: { tier: GRANT_TIER, source: SOURCE, expires_at: ACCESS_ENDS, left_existing_alone: leftExistingAlone },
  });
  if (logError) console.error('[brcc/claim] activity log failed:', logError.message);

  // Magic link, so nobody has to invent a password.
  const { data: linkData, error: linkError } = await hub.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${SITE_URL}/hub` },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error('[brcc/claim] generateLink failed:', linkError?.message);
    return NextResponse.json(
      { error: 'Your access is open, but we could not send the link. Go to teachersdeserveit.com/hub and sign in with this address.' },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    await resend.emails.send({
      from: 'Rae Hughart <hello@teachersdeserveit.com>',
      replyTo: 'hello@teachersdeserveit.com',
      to: email,
      subject: 'Your access is open through 30 November',
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#2d2d2d;">
          <p style="font-size:17px;line-height:1.6;margin:0 0 20px;">Thanks for being at the session.</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">
            The full Teachers Deserve It library is open on this address <b>through 30 November</b>.
            Every course, every tool, every game.
          </p>
          <p style="margin:0 0 28px;">
            <a href="${linkData.properties.action_link}"
               style="display:inline-block;background:#ffba06;color:#241B00;font-family:Helvetica,Arial,sans-serif;font-weight:700;font-size:16px;text-decoration:none;padding:14px 26px;border-radius:5px;">
              Open the library
            </a>
          </p>
          <p style="font-size:14px;line-height:1.7;color:#6b7079;margin:0 0 20px;">
            No password to create. If that link expires, go to teachersdeserveit.com/hub and sign in
            with this address.
          </p>
          <p style="font-size:14px;line-height:1.7;color:#6b7079;margin:0 0 20px;">
            On 1 December it ends. It does not renew, it does not convert into anything, and nothing
            charges you. We are not holding a card.
          </p>
          <p style="font-size:13px;color:#6b7079;line-height:1.6;margin:24px 0 0;border-top:1px solid #e0e0da;padding-top:16px;">
            Rae Hughart &middot; Teachers Deserve It<br>Reply to this and a person reads it.
          </p>
        </div>
      `,
    });
  } catch (sendError) {
    // The access is already open, so a send failure must not read as a failed claim.
    console.error('[brcc/claim] email send failed:', sendError);
    return NextResponse.json({
      ok: true,
      emailed: false,
      message: 'Your access is open. We could not send the email, so go to teachersdeserveit.com/hub and sign in with this address.',
    });
  }

  return NextResponse.json({ ok: true, emailed: true, alreadyHadAccess: leftExistingAlone });
}
