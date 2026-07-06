import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logCreatorEmail } from '@/lib/creator-email-log';
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
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

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
      .or('lifecycle_state.is.null,lifecycle_state.eq.active');

    if (!activeCreators || activeCreators.length === 0) {
      return NextResponse.json({ success: true, message: 'No active creators', sent: 0 });
    }

    // ---- Gather newsletter content ----

    // Recently published creators (last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: recentlyPublished } = await supabase
      .from('creators')
      .select('name, course_title, content_path, published_date')
      .eq('publish_status', 'published')
      .gte('published_date', sixtyDaysAgo.toISOString().split('T')[0])
      .order('published_date', { ascending: false })
      .limit(3);

    // Milestone celebrations this month
    const thirtyDaysAgo = new Date();
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
    const totalCreators = activeCreators.length;
    const { count: publishedCount } = await supabase
      .from('creators')
      .select('id', { count: 'exact', head: true })
      .eq('publish_status', 'published');

    // Pick this month's tip
    const monthIndex = new Date().getMonth();
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
            We're building something special with this creator community — ${totalCreators} educators
            who believe their experience is worth sharing. ${publishedCount ? `${publishedCount} have already launched their content, and more are on the way.` : 'The first launches are coming soon, and the work happening behind the scenes is exciting.'}
            Every one of you is part of something that's making educator-created PD a reality.
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
        celebrationItems.push(`${activeCreatorIds.size} creator${activeCreatorIds.size > 1 ? 's' : ''} completed milestones this month`);
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
    const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const subject = hasSpotlight
      ? `Creator Spotlight: ${recentlyPublished![0].name} just launched!`
      : `Your monthly Creator Studio update — ${monthName}`;

    const html = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <!-- Header -->
        <div style="background: #1e2749; color: white; padding: 24px 28px; border-radius: 12px 12px 0 0;">
          <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">TDI Creator Studio</p>
          <h1 style="margin: 6px 0 0; font-size: 22px; font-weight: 700;">Monthly Update</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">${monthName}</p>
        </div>

        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 15px; line-height: 1.7;">Hey there,</p>
          <p style="font-size: 15px; line-height: 1.7;">Here's what's happening in the Creator Studio this month.</p>

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

    // Send to all active creators
    let sent = 0;
    for (const creator of activeCreators) {
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
            html,
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

    console.log(`[monthly-newsletter] Sent to ${sent}/${activeCreators.length} creators`);

    return NextResponse.json({ success: true, sent, total: activeCreators.length });
  } catch (error) {
    console.error('[monthly-newsletter] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
