// ---------------------------------------------------------------------------
// The application queue: one decision function, used by the screen and by
// anything that comes later.
//
// Applications used to land in pending_creators and stop there. Nothing in the
// codebase read the table, so the only signal was a notification email at the
// moment of submission. Seven applications accumulated between 18 June and
// 31 July, none was ever marked reviewed, and no creator was added in that
// time. Accepting someone was a separate manual action with no link back to
// the application, so even an accepted applicant stayed pending forever.
//
// Everything a decision needs lives here, so the queue Bella reads and the
// action she takes can never disagree. That is the same shape as the agreement
// gate in lib/agreement-gate.ts, and for the same reason.
// ---------------------------------------------------------------------------

import { SITE_URL } from './reengagement-config';
import { creatorEmailTemplate } from './creator-email-template';
import { logCreatorEmail } from './creator-email-log';
import { creatorApplicationDecided } from './creator-slack';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

export type ApplicationStatus = 'pending' | 'accepted' | 'held' | 'declined' | 'dismissed';
export type Decision = 'accept' | 'hold' | 'decline' | 'dismiss';

interface Application {
  id: string;
  name: string | null;
  email: string | null;
  strategy: string | null;
  content_types: string | null;
  referral_dropdown: string | null;
  other_referral: string | null;
  submitted_at: string;
  status: ApplicationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  decision_reason: string | null;
  revisit_on: string | null;
  created_creator_id: string | null;
  notes: string | null;
}

/**
 * What we already know about this person before Bella answers.
 *
 * Nothing dedupes intake, so the same email can apply repeatedly, and a
 * previously declined or already active person can apply again. Answering
 * without this context is how you decline someone you accepted in May.
 */
interface PriorContact {
  /** An existing creator on this email, whatever state they are in. */
  existingCreator: {
    id: string;
    name: string | null;
    status: string | null;
    lifecycle_state: string | null;
    publish_status: string | null;
    created_at: string;
  } | null;
  /** Earlier applications from the same email, newest first. */
  earlierApplications: Array<{
    id: string;
    submitted_at: string;
    status: ApplicationStatus;
    decision_reason: string | null;
  }>;
}

export interface ApplicationWithContext extends Application {
  prior: PriorContact;
  /** Days this has been waiting. Only meaningful while pending. */
  waitingDays: number;
  /**
   * What accepting would actually do, given who this person already is.
   * Stated up front so the button never surprises anyone.
   */
  acceptEffect: 'creates a new creator' | 'reopens a paused creator' | 'reopens a closed creator' | 'blocked, already active';
}

const EMAIL_FROM = 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>';
const REPLY_TO = 'bella@teachersdeserveit.com';

function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

function normalise(email: string | null): string {
  return (email || '').trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Reading the queue
// ---------------------------------------------------------------------------

/**
 * Loads applications with everything a decision needs attached. Held items
 * whose revisit date has arrived come back as pending, because a hold that
 * never returns is the same failure as an application nobody reads.
 */
export async function loadApplications(
  supabase: DbClient,
  opts: { status?: ApplicationStatus | 'open' | 'all' } = {},
  now: Date = new Date()
): Promise<ApplicationWithContext[]> {
  const want = opts.status ?? 'open';

  const { data: rows, error } = await supabase
    .from('pending_creators')
    .select('*')
    .order('submitted_at', { ascending: true });

  if (error) {
    console.error('[applications] Failed to load:', error);
    return [];
  }

  const all = (rows || []) as Application[];

  const isDue = (a: Application) =>
    a.status === 'held' && !!a.revisit_on && new Date(a.revisit_on) <= now;

  const selected = all.filter((a) => {
    if (want === 'all') return true;
    if (want === 'open') return a.status === 'pending' || isDue(a);
    return a.status === want;
  });

  if (selected.length === 0) return [];

  const emails = Array.from(new Set(selected.map((a) => normalise(a.email)).filter(Boolean)));

  const { data: creators } = await supabase
    .from('creators')
    .select('id, name, email, status, lifecycle_state, publish_status, created_at')
    .in('email', emails);

  const creatorByEmail = new Map<string, PriorContact['existingCreator']>();
  for (const c of (creators || []) as Array<Record<string, any>>) {
    creatorByEmail.set(normalise(c.email), {
      id: c.id,
      name: c.name,
      status: c.status,
      lifecycle_state: c.lifecycle_state,
      publish_status: c.publish_status,
      created_at: c.created_at,
    });
  }

  return selected.map((a) => {
    const key = normalise(a.email);
    const existingCreator = creatorByEmail.get(key) || null;
    const earlierApplications = all
      .filter((o) => o.id !== a.id && normalise(o.email) === key)
      .sort((x, y) => new Date(y.submitted_at).getTime() - new Date(x.submitted_at).getTime())
      .map((o) => ({
        id: o.id,
        submitted_at: o.submitted_at,
        status: o.status,
        decision_reason: o.decision_reason,
      }));

    return {
      ...a,
      prior: { existingCreator, earlierApplications },
      waitingDays: daysSince(a.submitted_at, now),
      acceptEffect: describeAcceptEffect(existingCreator),
    };
  });
}

function describeAcceptEffect(
  existing: PriorContact['existingCreator']
): ApplicationWithContext['acceptEffect'] {
  if (!existing) return 'creates a new creator';
  if (existing.status === 'withdrawn') return 'reopens a closed creator';
  if (existing.lifecycle_state === 'paused') return 'reopens a paused creator';
  return 'blocked, already active';
}

// ---------------------------------------------------------------------------
// Making the decision
// ---------------------------------------------------------------------------

export interface DecisionInput {
  applicationId: string;
  decision: Decision;
  /** The signed in admin. Never taken from the request body. */
  decidedBy: string;
  /** Required for hold and decline. A decision without a reason cannot be reviewed later. */
  reason?: string;
  /** Required for hold. */
  revisitOn?: string;
  /** Reports what would happen and writes nothing. */
  dryRun?: boolean;
}

export interface DecisionResult {
  ok: boolean;
  dryRun: boolean;
  decision: Decision;
  application: { id: string; name: string | null; email: string | null };
  creatorId?: string;
  effect: string;
  emailSent: boolean;
  error?: string;
}

export async function decideApplication(
  supabase: DbClient,
  input: DecisionInput,
  now: Date = new Date()
): Promise<DecisionResult> {
  const { applicationId, decision, decidedBy, reason, revisitOn, dryRun = false } = input;

  const { data: app } = await supabase
    .from('pending_creators')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (!app) {
    return fail(decision, { id: applicationId, name: null, email: null }, 'Application not found');
  }

  const application = { id: app.id as string, name: app.name as string | null, email: app.email as string | null };

  if (app.status !== 'pending' && app.status !== 'held') {
    return fail(decision, application, `Already ${app.status}. Decisions are made once.`);
  }

  if ((decision === 'hold' || decision === 'decline' || decision === 'dismiss') && !reason?.trim()) {
    return fail(decision, application, 'A reason is required so the decision can be understood later.');
  }
  if (decision === 'hold' && !revisitOn) {
    return fail(decision, application, 'A hold needs a date to come back on.');
  }

  if (decision === 'hold') {
    if (!dryRun) {
      const { error } = await supabase
        .from('pending_creators')
        .update({
          status: 'held',
          reviewed_by: decidedBy,
          reviewed_at: now.toISOString(),
          decision_reason: reason!.trim(),
          revisit_on: revisitOn,
        })
        .eq('id', applicationId);
      if (error) return fail(decision, application, error.message);
    }
    if (!dryRun) announce(application, `held until ${revisitOn}`, decidedBy, false, false);
    return {
      ok: true,
      dryRun,
      decision,
      application,
      effect: `Held until ${revisitOn}. Comes back to the queue on that date. Nothing is sent to the applicant.`,
      emailSent: false,
    };
  }

  if (decision === 'dismiss') {
    // Sends nothing. This is for a test row or a duplicate created by a system
    // error, which is not a person and must never receive a decline.
    if (!dryRun) {
      const { error } = await supabase
        .from('pending_creators')
        .update({
          status: 'dismissed',
          reviewed_by: decidedBy,
          reviewed_at: now.toISOString(),
          decision_reason: reason!.trim(),
        })
        .eq('id', applicationId);
      if (error) return fail(decision, application, error.message);
    }
    if (!dryRun) announce(application, 'removed as not a real application', decidedBy, false, false);
    return {
      ok: true,
      dryRun,
      decision,
      application,
      effect: 'Removed from the queue. Nothing was sent to anyone. The row is kept with the reason, so this can be undone.',
      emailSent: false,
    };
  }

  if (decision === 'decline') {
    let emailSent = false;
    if (!dryRun) {
      // Record first, send second. The reverse order emailed a real applicant
      // and then failed the write on a CHECK constraint, leaving them told and
      // the row still reading pending, which is the exact state this queue
      // exists to prevent. A failed write now means nothing was sent.
      const { error } = await supabase
        .from('pending_creators')
        .update({
          status: 'declined',
          reviewed_by: decidedBy,
          reviewed_at: now.toISOString(),
          decision_reason: reason!.trim(),
        })
        .eq('id', applicationId);
      if (error) return fail(decision, application, `Nothing was sent. The decision could not be recorded: ${error.message}`);

      emailSent = await sendDeclineEmail(application, now);
      announce(application, 'declined', decidedBy, emailSent, true);
    }
    return {
      ok: true,
      dryRun,
      decision,
      application,
      effect: 'A warm note goes to the applicant inviting them to apply again. Reversible: the row keeps the reason and can be reopened.',
      emailSent,
    };
  }

  // ── accept ──
  return acceptApplication(supabase, app, decidedBy, dryRun, now);
}

function announce(
  application: { name: string | null; email: string | null },
  decision: string,
  decidedBy: string,
  emailSent: boolean,
  sendsEmail: boolean
): void {
  creatorApplicationDecided(
    application.name || application.email || 'Unknown applicant',
    decision,
    decidedBy,
    emailSent,
    sendsEmail
  ).catch(() => {
    /* a decision must never fail over a notification */
  });
}

function fail(decision: Decision, application: DecisionResult['application'], error: string): DecisionResult {
  return { ok: false, dryRun: false, decision, application, effect: 'nothing happened', emailSent: false, error };
}

// ---------------------------------------------------------------------------
// Accept
// ---------------------------------------------------------------------------

async function acceptApplication(
  supabase: DbClient,
  app: Record<string, any>,
  decidedBy: string,
  dryRun: boolean,
  now: Date
): Promise<DecisionResult> {
  const application = { id: app.id as string, name: app.name as string | null, email: app.email as string | null };
  const email = normalise(app.email);
  const name = (app.name as string) || 'there';

  if (!email) return fail('accept', application, 'This application has no email address.');

  const { data: existing } = await supabase
    .from('creators')
    .select('id, name, status, lifecycle_state, publish_status')
    .eq('email', email)
    .maybeSingle();

  if (existing && existing.status !== 'withdrawn' && existing.lifecycle_state !== 'paused') {
    return fail(
      'accept',
      application,
      `${existing.name || email} is already an active creator. Open their record instead of creating a second one.`
    );
  }

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      decision: 'accept',
      application,
      effect: existing
        ? `Would reopen the existing creator ${existing.name || email} and send a welcome with a sign in link.`
        : 'Would create a creator, seed their steps, and send a welcome with a sign in link.',
      emailSent: false,
    };
  }

  let creatorId: string;
  let effect: string;

  if (existing) {
    const { error } = await supabase
      .from('creators')
      .update({
        status: 'active',
        lifecycle_state: 'active',
        is_active: true,
        paused_at: null,
        pause_reason: null,
        pause_type: null,
        unpaused_at: now.toISOString(),
        display_on_website: true,
        recruitment_source: 'reapplied',
        updated_at: now.toISOString(),
      })
      .eq('id', existing.id);
    if (error) return fail('accept', application, error.message);
    creatorId = existing.id;
    effect = `Reopened the existing creator ${existing.name || email}. Their previous work is untouched.`;
  } else {
    const { data: created, error } = await supabase
      .from('creators')
      .insert({
        email,
        name,
        current_phase: 'onboarding',
        display_on_website: true,
        website_display_name: name,
        recruitment_source: app.referral_dropdown || 'application',
        intake_responses: {
          strategy: app.strategy || null,
          content_types: app.content_types || null,
          referral: app.referral_dropdown || null,
          other_referral: app.other_referral || null,
          applied_at: app.submitted_at,
        },
      })
      .select('id')
      .single();

    if (error || !created) {
      return fail('accept', application, error?.message || 'Failed to create the creator record.');
    }
    creatorId = created.id;

    const seeded = await seedMilestones(supabase, creatorId, now);
    effect = `Created the creator and seeded ${seeded} steps.`;
  }

  // Link the application to what it became. Without this an accepted
  // application stays pending forever, which is how seven of them piled up.
  //
  // The error here was previously discarded. A CHECK constraint rejected the
  // status and nothing said so, so a creator existed, a welcome went out, and
  // the application still read as waiting for an answer. The creator is real by
  // this point and must not be rolled back, so the failure is surfaced instead:
  // the account is fine, the queue entry needs a hand.
  const { error: linkError } = await supabase
    .from('pending_creators')
    .update({
      status: 'accepted',
      reviewed_by: decidedBy,
      reviewed_at: now.toISOString(),
      created_creator_id: creatorId,
    })
    .eq('id', app.id);

  await supabase.from('creator_notes').insert({
    creator_id: creatorId,
    content: `Accepted from an application submitted ${new Date(app.submitted_at).toDateString()}, by ${decidedBy}.`,
    author: 'System',
    visible_to_creator: false,
    phase_id: 'onboarding',
  });

  if (linkError) {
    // Do not send. An unrecorded acceptance can be accepted a second time, and
    // a second welcome to someone who already has an account is worse than a
    // late one.
    return {
      ok: false,
      dryRun: false,
      decision: 'accept',
      application,
      creatorId,
      effect: `The account was created and is fine, but this application could not be marked accepted, so no welcome was sent. Resend it from their record once the queue entry is corrected.`,
      emailSent: false,
      error: `Account created. Marking the application accepted failed: ${linkError.message}`,
    };
  }

  const emailSent = await sendWelcomeEmail(supabase, { creatorId, name, email }, decidedBy);
  announce(application, 'accepted', decidedBy, emailSent, true);

  return {
    ok: true,
    dryRun: false,
    decision: 'accept',
    application,
    creatorId,
    effect: emailSent
      ? `${effect} A welcome with a one click sign in link was sent.`
      : `${effect} The welcome email did not send and needs resending from their record.`,
    emailSent,
  };
}

/**
 * Seeds a new creator's steps deterministically.
 *
 * The previous version ordered by sort_order alone and marked index 0 complete
 * and index 1 available. Six milestones share sort_order 1, so which two steps
 * those were was left to the database. This names them instead: the intake step
 * is complete because filling in the application is the intake, and choosing a
 * path is what opens next.
 *
 * Everything else is left available rather than locked, matching how the portal
 * behaves today. Locking is a separate change and is not safe until every step
 * carries an owner and a clock.
 */
async function seedMilestones(supabase: DbClient, creatorId: string, now: Date): Promise<number> {
  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, phase_id, name, sort_order')
    .is('is_collapsed_into', null);

  const all = (milestones || []) as Array<{ id: string; phase_id: string; name: string; sort_order: number }>;
  if (all.length === 0) return 0;

  const intake = all.find((m) => m.phase_id === 'onboarding' && m.name === 'Intake Form Completed');

  const records = all.map((m) => ({
    creator_id: creatorId,
    milestone_id: m.id,
    status: m.id === intake?.id ? 'completed' : 'available',
    completed_at: m.id === intake?.id ? now.toISOString() : null,
    completed_by: m.id === intake?.id ? 'application' : null,
  }));

  const { error } = await supabase
    .from('creator_milestones')
    .upsert(records, { onConflict: 'creator_id,milestone_id', ignoreDuplicates: true });

  if (error) {
    console.error('[applications] Milestone seeding failed:', error);
    return 0;
  }
  return records.length;
}

// ---------------------------------------------------------------------------
// The two emails
// ---------------------------------------------------------------------------

async function sendWelcomeEmail(
  supabase: DbClient,
  creator: { creatorId: string; name: string; email: string },
  decidedBy: string
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return false;

  const firstName = creator.name.split(' ')[0];

  // A sign in link rather than credentials. Twenty seven of thirty six
  // creators have never signed in, and asking someone to invent and remember
  // a password is where that fails.
  let signInUrl = `${SITE_URL}/creator-portal`;
  try {
    const { data: link } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: creator.email,
      options: { redirectTo: `${SITE_URL}/creator-portal/dashboard` },
    });
    if (link?.properties?.action_link) signInUrl = link.properties.action_link;
  } catch (e) {
    console.error('[applications] Magic link generation failed, falling back to the portal URL:', e);
  }

  const subject = `Creator Studio | You are in, ${firstName}`;
  const html = creatorEmailTemplate({
    firstName,
    tagline: 'Welcome to the Creator Studio',
    body: `
      <p>Hey ${firstName},</p>
      <p>We read your application and we would love to work with you. Welcome to the TDI Creator Studio.</p>
      <p>The button below signs you straight into your Creator Studio. There is no password to set up and nothing to remember, so you can start whenever you have ten minutes.</p>
      <p>The first thing it will ask you is what you want to make. That one answer shapes everything after it, so take a moment with it. You can talk it through with me before you decide if you would rather.</p>
      <p>From there you will see one step at a time, with a suggested date on each one. Those dates are our recommendation, never a deadline. If you need longer, there is a button that says so and nobody has to be told why.</p>
      <p>I am the person on the other end of this the whole way through. Reply to this email any time.</p>
      <p>Really glad you are here,<br/>Bella</p>
    `,
    ctaLabel: 'Open My Creator Studio',
    ctaUrl: signInUrl,
  });

  const sent = await send(resendApiKey, creator.email, subject, html);

  await logCreatorEmail({
    creator_id: creator.creatorId,
    creator_name: creator.name,
    creator_email: creator.email,
    direction: 'to_creator',
    category: 'application_accepted',
    subject,
    sent_by: `application-queue:${decidedBy}`,
    dry_run: !sent,
  });

  return sent;
}

async function sendDeclineEmail(
  application: { id: string; name: string | null; email: string | null },
  now: Date
): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey || !application.email) return false;

  const firstName = (application.name || 'there').split(' ')[0];
  const subject = `Creator Studio | Thank you for applying, ${firstName}`;
  const html = creatorEmailTemplate({
    firstName,
    tagline: 'Not this round',
    body: `
      <p>Hey ${firstName},</p>
      <p>Thank you for applying to the TDI Creator Studio, and for being willing to put what you know in front of other educators. That takes something.</p>
      <p>We are not able to take your application forward this time. That is a decision about what we can support right now rather than a judgement on you or your work.</p>
      <p>We open again regularly, and I would genuinely welcome your application next time. If you want a sense of what would strengthen it, reply to this email and I will tell you honestly.</p>
      <p>Thank you again for asking,<br/>Bella</p>
    `,
    showNominate: true,
  });

  const sent = await send(resendApiKey, application.email, subject, html);

  await logCreatorEmail({
    creator_name: application.name || undefined,
    creator_email: application.email,
    direction: 'to_creator',
    category: 'application_declined',
    subject,
    sent_by: 'application-queue',
    metadata: { application_id: application.id, decided_at: now.toISOString() },
    dry_run: !sent,
  });

  return sent;
}

async function send(apiKey: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        bcc: ['bella@teachersdeserveit.com', 'creatorstudio@teachersdeserveit.com'],
        subject,
        html,
        reply_to: REPLY_TO,
      }),
    });
    if (!res.ok) {
      console.error('[applications] Resend error:', await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('[applications] Send failed:', e);
    return false;
  }
}
