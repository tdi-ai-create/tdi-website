import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getHubServiceClient } from '@/lib/hub/partnership-members';
import {
  renderPartnerWelcomeEmail,
  type WelcomeFeature,
} from '@/lib/hub/partner-welcome-email';

/**
 * POST /api/hub/partner-welcome
 *
 * Sends the Hub welcome email to a partnership's staff. Nothing like this
 * existed before 30 September 2026, which is why Addison's paras held live
 * seats for two months without being told.
 *
 * Dry run is the DEFAULT. You must pass dryRun=0 to actually send. That is the
 * opposite of the usual flag because the failure mode here is 147 real emails
 * to real people, and a route that sends when called wrong is a route that will
 * eventually be called wrong.
 *
 * A dry run computes the entire decision set, including the rendered body for
 * one sample recipient, and performs no send and no write.
 *
 * Body:
 *   partnershipId  required, the Hub partnership_id on hub_profiles
 *   role           optional, e.g. 'para', filters the cohort
 *   subject        required
 *   accessThrough  required, plain language, e.g. 'December'
 *   features       required, the three items to feature
 *   emailType      optional, defaults 'hub_welcome'. Also the idempotency key.
 */

const FROM = 'Teachers Deserve It Team <hello@teachersdeserveit.com>';

interface CohortRow {
  id: string;
  email: string;
  first_name: string | null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const dryRun = request.nextUrl.searchParams.get('dryRun') !== '0';

  let body: {
    partnershipId?: string;
    role?: string;
    subject?: string;
    accessThrough?: string;
    features?: WelcomeFeature[];
    emailType?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  const { partnershipId, role, subject, accessThrough } = body;
  const features = body.features || [];
  const emailType = body.emailType || 'hub_welcome';

  if (!partnershipId || !subject || !accessThrough || features.length === 0) {
    return NextResponse.json(
      { error: 'partnershipId, subject, accessThrough and features are all required' },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!dryRun && !resendApiKey) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });
  }

  const hub = getHubServiceClient();

  // The cohort. Only live seats: an inactive membership means the person is off
  // the school's roster, and telling them their access is live would be untrue.
  //
  // Two queries intersected in code, deliberately not a PostgREST embed. There
  // is no foreign key between hub_profiles and hub_memberships in the Hub
  // project, so `hub_memberships!inner(...)` fails at runtime with a
  // relationship error while typechecking perfectly, because the relationship
  // lives inside a string. Verified against information_schema on 30 Sep 2026.
  let profileQuery = hub
    .from('hub_profiles')
    .select('id, email, first_name')
    .eq('partnership_id', partnershipId);
  if (role) profileQuery = profileQuery.eq('role', role);

  const { data: rawCohort, error: cohortError } = await profileQuery;
  if (cohortError) {
    console.error('[partner-welcome] cohort lookup failed:', cohortError.message);
    return NextResponse.json({ error: 'Cohort lookup failed' }, { status: 500 });
  }

  const candidateIds = (rawCohort || []).map(r => r.id as string);
  if (candidateIds.length === 0) {
    return NextResponse.json(
      { error: 'No Hub profiles found for that partnership and role' },
      { status: 404 }
    );
  }

  const { data: liveSeats, error: seatError } = await hub
    .from('hub_memberships')
    .select('user_id')
    .in('user_id', candidateIds)
    .eq('status', 'active');
  if (seatError) {
    console.error('[partner-welcome] seat lookup failed:', seatError.message);
    return NextResponse.json({ error: 'Seat lookup failed' }, { status: 500 });
  }
  const activeSeat = new Set((liveSeats || []).map(r => String(r.user_id)));

  const cohort: CohortRow[] = (rawCohort || [])
    .filter(r => activeSeat.has(r.id as string))
    .map(r => ({
      id: r.id as string,
      email: String(r.email || '').toLowerCase(),
      first_name: (r.first_name as string | null) ?? null,
    }));

  // Opt outs. Matched on either column because both are populated
  // inconsistently, and honouring only one is how someone who opted out still
  // gets mail.
  const { data: optOuts, error: optOutError } = await hub
    .from('hub_email_optouts')
    .select('email, user_id, email_type');
  if (optOutError) {
    console.error('[partner-welcome] opt out lookup failed:', optOutError.message);
    return NextResponse.json({ error: 'Opt out lookup failed' }, { status: 500 });
  }
  const optedOut = new Set<string>();
  for (const o of optOuts || []) {
    const applies = !o.email_type || o.email_type === emailType || o.email_type === 'all';
    if (!applies) continue;
    if (o.email) optedOut.add(String(o.email).toLowerCase());
    if (o.user_id) optedOut.add(String(o.user_id));
  }

  // Already sent. One email per person, so a second call is a no-op rather
  // than a duplicate.
  const { data: sentRows, error: sentError } = await hub
    .from('hub_email_sent_log')
    .select('user_id')
    .eq('email_type', emailType);
  if (sentError) {
    console.error('[partner-welcome] sent log lookup failed:', sentError.message);
    return NextResponse.json({ error: 'Sent log lookup failed' }, { status: 500 });
  }
  const alreadySent = new Set((sentRows || []).map(r => String(r.user_id)));

  const skippedOptOut: string[] = [];
  const skippedAlreadySent: string[] = [];
  const skippedNoEmail: string[] = [];
  const recipients: CohortRow[] = [];

  for (const person of cohort) {
    if (!person.email) {
      skippedNoEmail.push(person.id);
    } else if (optedOut.has(person.email) || optedOut.has(person.id)) {
      skippedOptOut.push(person.email);
    } else if (alreadySent.has(person.id)) {
      skippedAlreadySent.push(person.email);
    } else {
      recipients.push(person);
    }
  }

  const missingFirstName = recipients.filter(r => !(r.first_name || '').trim()).length;

  if (dryRun) {
    const sample = recipients[0];
    return NextResponse.json({
      dryRun: true,
      wouldSend: recipients.length,
      cohortSize: cohort.length,
      skipped: {
        optedOut: skippedOptOut.length,
        alreadySent: skippedAlreadySent.length,
        noEmail: skippedNoEmail.length,
      },
      greetingWithoutName: missingFirstName,
      from: FROM,
      subject,
      recipientEmails: recipients.map(r => r.email),
      sampleRecipient: sample?.email ?? null,
      sampleHtml: sample
        ? renderPartnerWelcomeEmail({
            firstName: sample.first_name,
            accessThrough,
            features,
          })
        : null,
    });
  }

  let sent = 0;
  const failures: { email: string; reason: string }[] = [];

  for (const person of recipients) {
    const html = renderPartnerWelcomeEmail({
      firstName: person.first_name,
      accessThrough,
      features,
    });

    let ok = false;
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to: [person.email], subject, html }),
      });
      if (res.ok) {
        ok = true;
      } else {
        failures.push({ email: person.email, reason: (await res.text()).slice(0, 300) });
      }
    } catch (err) {
      failures.push({ email: person.email, reason: String(err).slice(0, 300) });
    }

    if (!ok) continue;
    sent += 1;

    // Log only after the send succeeded, so the idempotency key never claims an
    // email that never left.
    const { error: logError } = await hub
      .from('hub_email_sent_log')
      .insert({ user_id: person.id, email_type: emailType });
    if (logError) {
      console.error(
        `[partner-welcome] sent to ${person.email} but log insert failed:`,
        logError.message
      );
      failures.push({ email: person.email, reason: `sent but not logged: ${logError.message}` });
    }

    // Resend allows 2 requests per second on this plan. 600ms keeps us under it
    // without turning 147 emails into a long job.
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  return NextResponse.json({
    dryRun: false,
    sent,
    attempted: recipients.length,
    failures,
    skipped: {
      optedOut: skippedOptOut.length,
      alreadySent: skippedAlreadySent.length,
      noEmail: skippedNoEmail.length,
    },
  });
}
