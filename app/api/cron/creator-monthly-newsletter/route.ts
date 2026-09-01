import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';
import { guardCron } from '@/lib/cron-guard';
import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Monthly Creator Newsletter
// Runs 1st of each month at 10 AM. Sends a valuable newsletter to all
// active creators. Smart content that adapts:
//   - Spotlight a creator if someone published recently
//   - If no spotlight, feature what TDI is building or an educator content tip
//   - Always: milestone celebrations, one actionable tip, nomination CTA
//
// Philosophy: Every email should make the creator glad they opened it.
// No guilt, no "you haven't logged in." Just value + community.
// ---------------------------------------------------------------------------

const DASHBOARD_LINK = 'https://www.teachersdeserveit.com/creator-portal/dashboard';
const NOMINATE_LINK = 'https://www.teachersdeserveit.com/create-with-us';

// Rotating tips — one per month, cycles through
const CREATOR_TIPS = [
  {
    title: 'Start with what you already teach',
    body: 'The best creator content comes from things you\'ve already explained 50 times. That lesson you could teach in your sleep? That\'s your course outline.',
  },
  {
    title: 'Imperfect is better than invisible',
    body: 'Your first version doesn\'t need to be perfect. Educators out there need your perspective right now — not a polished version six months from now.',
  },
  {
    title: 'Write the way you talk',
    body: 'The most engaging educator content sounds like a conversation, not a textbook. Imagine you\'re explaining this to a colleague over coffee.',
  },
  {
    title: 'One idea per lesson, one lesson at a time',
    body: 'Don\'t try to cover everything at once. Each piece of content should leave someone with one clear takeaway they can use tomorrow.',
  },
  {
    title: 'Your experience is the differentiator',
    body: 'Other people can teach the same topic. Nobody else has your specific experience, your stories, your perspective. That\'s what makes your content valuable.',
  },
  {
    title: 'Stuck? Talk it out',
    body: 'If you\'re staring at a blank page, try recording yourself explaining your topic to a friend. Then transcribe it. You\'ll be surprised how much content you already have.',
  },
  {
    title: 'Think about one specific person',
    body: 'When creating content, picture one real educator you know. Write for them. Content that tries to speak to everyone ends up resonating with no one.',
  },
  {
    title: 'Progress beats perfection',
    body: 'The creators who launch aren\'t the ones who had the best ideas — they\'re the ones who kept showing up for 15 minutes at a time.',
  },
  {
    title: 'Your "obvious" knowledge isn\'t obvious to everyone',
    body: 'That thing you think everyone knows? They don\'t. The strategies you use naturally took years to develop. That expertise is worth sharing.',
  },
  {
    title: 'Set a tiny deadline',
    body: 'Don\'t set a deadline to "finish the course." Set a deadline to "write the first three bullet points for lesson one." Small deadlines create momentum.',
  },
  {
    title: 'Borrow energy from your students',
    body: 'Think about the moment a student finally gets something because of how you explained it. That\'s the feeling your content will create for educators everywhere.',
  },
  {
    title: 'Done is a feature',
    body: 'The TDI team handles production, design, and polish. Your job is the ideas and the expertise. Let us worry about making it look good.',
  },
];

export async function GET(request: NextRequest) {
  try {
    const guard = guardCron(request);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const { dryRun } = guard;

    // ?asOf=2026-10-01 renders a future issue, dry run only.
    //
    // "What will next month's look like" had no answer short of waiting for it
    // to send. The month name, the rotating tip, and the windows that decide
    // whether there is a spotlight all read the clock, so rendering today only
    // ever shows today's issue. A real send ignores this and always uses now.
    const asOfParam = dryRun ? request.nextUrl.searchParams.get('asOf') : null;
    const asOfDate = asOfParam ? new Date(`${asOfParam.slice(0, 10)}T12:00:00`) : null;
    const now = asOfDate && !Number.isNaN(asOfDate.getTime()) ? asOfDate : new Date();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
      return NextResponse.json({ success: false, error: 'Missing config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all active creators to send to
    const { data: activeCreators } = await supabase
      .from('creators')
      .select('id, email, name')
      .eq('status', 'active')
      // status and is_active are different columns and this only ever read the
      // first. Katie Welch has been paused since 12 May, reason recorded as
      // "Creator declined to create again at this time", and the September
      // issue asked her to open her Studio and go recruit other educators.
      // Holly Stuart was paused on 13 August and got the same. Someone who has
      // told us they are done should not be receiving a monthly nudge.
      .eq('is_active', true)
      .is('paused_at', null)
      .or('lifecycle_state.is.null,lifecycle_state.eq.active');

    if (!activeCreators || activeCreators.length === 0) {
      return NextResponse.json({ success: true, message: 'No active creators', sent: 0 });
    }

    // ---- Gather newsletter content ----

    // Recently published creators (last 60 days)
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: recentlyPublished } = await supabase
      .from('creators')
      .select('name, course_title, content_path, published_date')
      .eq('publish_status', 'published')
      .gte('published_date', sixtyDaysAgo.toISOString().split('T')[0])
      .order('published_date', { ascending: false })
      .limit(3);

    // Milestone celebrations this month
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentMilestones } = await supabase
      .from('creator_milestones')
      .select('creator_id, completed_at')
      .eq('status', 'completed')
      .gte('completed_at', thirtyDaysAgo.toISOString());

    // Count unique creators who completed milestones
    const activeCreatorIds = new Set((recentMilestones || []).map((m: any) => m.creator_id));
    const milestonesCompletedCount = recentMilestones?.length || 0;

    // Total creators and published count
    // Whether anyone has published, not how many.
    //
    // Absolute counts do not go in creator facing email. Rae, 1 Sep 2026: a
    // headcount is an internal gauge, and telling an outsider how many of us
    // there are gives away more than it earns. Percentages are allowed; raw
    // numbers are not.
    //
    // The September issue is why. It opened "13 educators who believe their
    // experience is worth sharing", and 13 was not a count of anything: it was
    // the length of the send list, assigned from activeCreators.length. There
    // are 35 active creators. So the sentence carrying the whole emotional
    // pitch told thirteen people the community was a third of its real size.
    // A number that is both revealing and wrong is the worst of both.
    const { count: publishedCount } = await supabase
      .from('creators')
      .select('id', { count: 'exact', head: true })
      .eq('publish_status', 'published');

    // What each creator's next step actually is.
    //
    // The issue that went out said "Hey there" and then told everyone the same
    // thing about the community. Meanwhile four of the eleven were already
    // overdue on Confirm Your Path from 26 August, and two were waiting on US
    // to review something. We hold every one of those facts. Sending a warm
    // generality to someone whose step has been sitting open for a month is
    // how a newsletter teaches people it is safe to ignore.
    //
    // "Locked" steps are excluded: a creator cannot act on those, and naming
    // one would be asking for something the portal will not let them do.
    const { data: openSteps } = await supabase
      .from('creator_milestones')
      .select('creator_id, status, due_on, opened_at, milestones(name)')
      .not('status', 'in', '(completed,locked)');

    type NextStep = { milestone: string; dueOn: string | null; withUs: boolean };
    const nextStepFor = new Map<string, NextStep>();
    for (const row of (openSteps ?? []) as any[]) {
      const name = row.milestones?.name;
      if (!name) continue;
      const existing = nextStepFor.get(row.creator_id);
      // Soonest due date wins, undated last, so the email names the thing with
      // a clock on it rather than whatever the database returned first.
      const better =
        !existing ||
        (row.due_on && !existing.dueOn) ||
        (row.due_on && existing.dueOn && row.due_on < existing.dueOn);
      if (better) {
        nextStepFor.set(row.creator_id, {
          milestone: name,
          dueOn: row.due_on ?? null,
          withUs: row.status === 'waiting_approval',
        });
      }
    }

    const todayIso = now.toISOString().slice(0, 10);
    const prettyDate = (iso: string) =>
      new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    /** The one paragraph that is about the reader rather than about us. */
    const yourStepHtml = (creatorId: string): string => {
      const step = nextStepFor.get(creatorId);
      if (!step) return '';

      // Waiting on us. Never ask someone to act when we are the holdup.
      if (step.withUs) {
        return `
        <div style="background: #E8F0FD; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; margin: 0 0 8px; font-weight: 600;">Where you are</p>
          <p style="color: #1e3a5f; margin: 0; line-height: 1.6;">
            <strong>${step.milestone}</strong> is with our team, not with you. Nothing is needed from
            your side. If it has been sitting longer than feels right, reply here and Bella will chase it.
          </p>
        </div>`;
      }

      const overdue = step.dueOn && step.dueOn < todayIso;
      const timing = !step.dueOn
        ? 'whenever you have a clear hour'
        : overdue
          ? `set for ${prettyDate(step.dueOn)}, so it is sitting open`
          : `due ${prettyDate(step.dueOn)}`;

      return `
        <div style="background: #E8F0FD; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; margin: 0 0 8px; font-weight: 600;">Your next step</p>
          <p style="color: #1e3a5f; margin: 0; line-height: 1.6;">
            <strong>${step.milestone}</strong>, ${timing}.
            ${overdue ? 'No judgement, September is brutal. If something is in the way, reply and tell us what it is.' : 'It is the only thing standing between you and the next one.'}
          </p>
        </div>`;
    };

    // Pick this month's tip
    const monthIndex = now.getMonth();
    const tip = CREATOR_TIPS[monthIndex % CREATOR_TIPS.length];

    // Build the spotlight section
    let spotlightHtml = '';
    const hasSpotlight = recentlyPublished && recentlyPublished.length > 0;

    if (hasSpotlight) {
      const spotlight = recentlyPublished[0];
      const contentType = spotlight.content_path === 'course' ? 'course' :
                          spotlight.content_path === 'blog' ? 'blog post' :
                          spotlight.content_path === 'download' ? 'quick tool' : 'content';
      spotlightHtml = `
        <div style="background: linear-gradient(135deg, #fef3c7, #fef9c3); border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #92400e; margin: 0 0 8px; font-weight: 600;">Creator Spotlight</p>
          <p style="font-size: 17px; font-weight: 700; color: #1e2749; margin: 0 0 6px;">${spotlight.name}</p>
          <p style="color: #374151; margin: 0;">
            Just launched their ${contentType}${spotlight.course_title ? `: "${spotlight.course_title}"` : ''}!
            From idea to live content — this is what it looks like when educators share their expertise.
          </p>
        </div>
      `;
    } else {
      // No spotlight — use AI to generate a short "what TDI is up to" blurb
      // or fall back to a static message about the creator community
      spotlightHtml = `
        <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; margin: 0 0 8px; font-weight: 600;">From the TDI Team</p>
          <p style="color: #1e3a5f; margin: 0; line-height: 1.6;">
            We're building something special here: a community of educators who believe
            what they know is worth sharing. ${publishedCount ? 'Some have already launched their content, and more are on the way every month.' : 'The first launches are coming soon, and the work happening behind the scenes is exciting.'}
            Every one of you is part of making educator-created PD a reality.
          </p>
        </div>
      `;
    }

    // Celebrations section
    let celebrationsHtml = '';
    if (milestonesCompletedCount > 0 || (recentlyPublished && recentlyPublished.length > 0)) {
      const celebrationItems: string[] = [];

      if (recentlyPublished && recentlyPublished.length > 0) {
        for (const pub of recentlyPublished) {
          celebrationItems.push(`${pub.name} launched their content`);
        }
      }
      if (activeCreatorIds.size > 0) {
        celebrationItems.push(
          activeCreatorIds.size > 1
            ? 'Creators across the community hit milestones this month'
            : 'A creator hit a milestone this month'
        );
      }

      celebrationsHtml = `
        <div style="margin: 20px 0;">
          <p style="font-size: 13px; font-weight: 600; color: #1e2749; margin: 0 0 8px;">This Month's Wins</p>
          ${celebrationItems.map(item => `
            <p style="margin: 4px 0; font-size: 14px; color: #374151;">
              <span style="color: #22c55e; margin-right: 6px;">&#10003;</span> ${item}
            </p>
          `).join('')}
        </div>
      `;
    }

    // Build the full email
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const subject = hasSpotlight
      ? `Creator Spotlight: ${recentlyPublished![0].name} just launched!`
      : `Your monthly Creator Studio update — ${monthName}`;

    // One email per creator now, because two of the three things worth saying
    // are about them: their name, and the step they are actually on.
    const buildHtml = (creator: { id: string; name?: string | null }) => {
      const firstName = (creator.name ?? '').trim().split(/\s+/)[0] || 'there';
      return `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <!-- Header -->
        <div style="background: #1e2749; color: white; padding: 24px 28px; border-radius: 12px 12px 0 0;">
          <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">TDI Creator Studio</p>
          <h1 style="margin: 6px 0 0; font-size: 22px; font-weight: 700;">Monthly Update</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">${monthName}</p>
        </div>

        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 15px; line-height: 1.7;">Hi ${firstName},</p>
          <p style="font-size: 15px; line-height: 1.7;">Here's where you are, and what's happening in the Creator Studio this month.</p>

          <!-- The part that is about them -->
          ${yourStepHtml(creator.id)}

          <!-- Spotlight or Team Update -->
          ${spotlightHtml}

          <!-- Celebrations -->
          ${celebrationsHtml}

          <!-- Tip of the Month -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 8px; font-weight: 600;">Creator Tip</p>
            <p style="font-size: 16px; font-weight: 700; color: #1e2749; margin: 0 0 6px;">${tip.title}</p>
            <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">${tip.body}</p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 28px 0 20px;">
            <a href="${DASHBOARD_LINK}" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Open Your Creator Studio
            </a>
          </div>

          <!-- Nomination CTA -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 24px;">
            <p style="font-size: 14px; color: #374151; margin: 0 0 8px;">
              <strong>Know an educator who should create with us?</strong>
            </p>
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 12px;">
              We're always looking for educators with real classroom experience and a passion for sharing what works.
              If someone comes to mind, send them our way.
            </p>
            <a href="${NOMINATE_LINK}" style="font-size: 13px; color: #1e2749; font-weight: 600; text-decoration: underline;">
              Share the Creator Application
            </a>
          </div>

          <!-- Footer -->
          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Teachers Deserve It &middot; Creator Studio
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0;">
              Questions? Reply to this email — Bella is here to help.
            </p>
          </div>
        </div>
      </div>
    `;
    };

    // Dedupe guard.
    //
    // This job had none, so every invocation mailed every active creator. The
    // cron schedule is "0 10 1 * *", but the endpoint was also hit twice
    // off-schedule on 2026-08-03 at 16:47 and 27 creators received the same
    // August newsletter three times, twice within 40 seconds.
    //
    // One newsletter per creator per calendar month, checked against the log
    // that already records every send.
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: alreadySentThisMonth, error: sentLookupError } = await supabase
      .from('creator_email_log')
      .select('creator_id')
      .eq('category', 'monthly_newsletter')
      .gte('sent_at', monthStart.toISOString());

    if (sentLookupError) {
      // Refuse to send rather than risk mailing everyone a duplicate.
      console.error('[monthly-newsletter] Dedupe lookup failed:', sentLookupError.message);
      return NextResponse.json(
        { success: false, error: `Dedupe lookup failed, refusing to send: ${sentLookupError.message}` },
        { status: 500 }
      );
    }

    const alreadySent = new Set((alreadySentThisMonth || []).map((r) => r.creator_id));
    const recipients = activeCreators.filter((c) => !alreadySent.has(c.id));
    const skipped = activeCreators.length - recipients.length;

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        renderedAsOf: now.toISOString().slice(0, 10),
        isFutureIssue: Boolean(asOfDate),
        subject,
        audience: activeCreators.length,
        skippedAlreadySentThisMonth: skipped,
        wouldSend: recipients.length,
        plan: recipients.map((c) => ({ creator: c.name, to: c.email })),
        // The email itself, so it can be read before it goes.
        //
        // The dry run used to return only the plan: who, how many, what
        // subject. Nobody could see the words. The September issue went to
        // thirteen creators carrying our own headcount and an incorrect one,
        // and there was no way to have caught that short of reading the
        // template source. A preview that shows everything except the message
        // is not a preview.
        //
        // Rendered for the first recipient rather than a blank template, so the
        // personalised block is visible. Every issue differs per reader now.
        previewFor: recipients[0]?.name ?? activeCreators[0]?.name ?? null,
        html: buildHtml(recipients[0] ?? activeCreators[0] ?? { id: '', name: null }),
      });
    }

    // Send to all active creators who have not already had this month's issue
    let sent = 0;
    for (const creator of recipients) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
            to: [creator.email],
            bcc: ['bella@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
            subject,
            html: buildHtml(creator),
            reply_to: 'bella@teachersdeserveit.com',
          }),
        });

        if (res.ok) {
          await logCreatorEmail({
            creator_id: creator.id,
            creator_name: creator.name,
            creator_email: creator.email,
            direction: 'to_creator',
            category: 'monthly_newsletter',
            subject,
            sent_by: 'cron:creator-monthly-newsletter',
          });
          sent++;
        }
      } catch (e) {
        console.error(`[monthly-newsletter] Failed for ${creator.email}:`, e);
      }
    }

    console.log(`[monthly-newsletter] Sent to ${sent}/${recipients.length} creators (${skipped} already had this month's issue)`);

    return NextResponse.json({
      success: true,
      sent,
      total: activeCreators.length,
      skippedAlreadySentThisMonth: skipped,
    });
  } catch (error) {
    console.error('[monthly-newsletter] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
