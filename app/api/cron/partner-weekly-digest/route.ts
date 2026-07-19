import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const HUB_URL = 'https://www.teachersdeserveit.com/hub';

/**
 * GET /api/cron/partner-weekly-digest
 *
 * Runs weekly (Monday 8 AM CT). Sends a leadership digest to each
 * active partnership's primary contact. Not a data report -- a
 * leadership resource with copy-paste content for staff newsletters,
 * team topics, and a rotating challenge.
 *
 * Voice: TDI Team. Warm, practical, direct. No em dashes.
 * From: Teachers Deserve It Team <hello@teachersdeserveit.com>
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });

    const portalSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

    if (!hubUrl || !hubKey) {
      return NextResponse.json({ error: 'Hub Supabase not configured' }, { status: 500 });
    }

    const hubSupabase = createClient(hubUrl, hubKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get active partnerships
    const { data: partnerships } = await portalSupabase
      .from('partnerships')
      .select('id, slug, contact_name, contact_email, org_name, contract_phase, staff_enrolled')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No active partnerships' });
    }

    // Get curated Quick Wins for the "Share With Your Team" section
    // Rotate weekly by using the ISO week number
    const weekNum = getISOWeek(new Date());
    const isLeaderWeek = weekNum % 2 === 1; // odd weeks = leader challenge, even = staff

    // Get a diverse set of Quick Wins to feature
    const { data: featuredQuickWins } = await hubSupabase
      .from('hub_quick_wins')
      .select('id, title, slug, category, lift, description')
      .eq('is_published', true)
      .not('description', 'is', null)
      .limit(100);

    // Pick the featured Quick Win for this week (rotate by week number)
    const qws = featuredQuickWins || [];
    const featuredIndex = weekNum % Math.max(qws.length, 1);
    const featured = qws[featuredIndex] || null;

    // Get recent popular Quick Wins from activity log (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: recentActivity } = await hubSupabase
      .from('hub_activity_log')
      .select('metadata')
      .eq('action', 'quick_win_viewed')
      .gte('created_at', twoWeeksAgo.toISOString())
      .limit(500);

    // Count QW views to find trending topics
    const qwViewCounts: Record<string, number> = {};
    (recentActivity || []).forEach((a: { metadata: { quick_win_id?: string; title?: string } | null }) => {
      const title = a.metadata?.title;
      if (title) qwViewCounts[title] = (qwViewCounts[title] || 0) + 1;
    });

    // Get top 3 trending
    const trending = Object.entries(qwViewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title]) => {
        const match = qws.find(q => q.title === title);
        return match || { title, slug: '', category: '', lift: 'LOW', description: '' };
      });

    // Challenges that rotate weekly
    const leaderChallenges = [
      'Walk into one classroom this week with no agenda. Just watch for 5 minutes. Notice one thing that is going well and tell that teacher before the day ends.',
      'Send a 2-sentence email to your staff this week that starts with "I noticed..." and names something specific a teacher did that helped a student.',
      'Ask one teacher this week: "What is one thing I could take off your plate?" Then actually do it.',
      'Block 15 minutes on your calendar this week labeled "Think." No phone, no email. Just think about one teacher who needs support and what that support looks like.',
      'Find the teacher who seems most overwhelmed this week. Leave a sticky note on their desk that says something real. Not "You are amazing." Something specific.',
      'This week, eat lunch in the staff lounge instead of your office. Don\'t bring an agenda. Just be present.',
      'Ask your team this week: "What is one thing about this school that makes you proud?" Listen to every answer.',
    ];

    const staffChallenges = [
      'Share this with your team: "Try one new Quick Win from the Hub this week. At our next meeting, tell us what you tried and whether it worked. No pressure, just curiosity."',
      'Drop this in your staff newsletter: "The TDI Hub has tools that take less than 5 minutes. If you are having a tough week, start there. Sometimes the smallest thing makes the biggest difference."',
      'Share this with your team: "Pick one student this week and try a strategy from the Hub specifically for them. Just one student. Just one strategy."',
      'Add this to your next staff email: "If you have not explored the TDI Hub yet, start with Quick Wins. They are short, practical, and designed for days when you are running on empty."',
      'Share this challenge: "This week, find a Quick Win in a category you would not normally pick. Try something outside your comfort zone and see what happens."',
      'Drop this in Slack or email: "The Hub tracks your PD hours automatically. Every Quick Win and course you complete counts. Check your progress when you get a chance."',
      'Share with your team: "Find one Quick Win that you think a colleague would love. Send it to them with a note about why you thought of them."',
    ];

    const challenge = isLeaderWeek
      ? { type: 'For You', text: leaderChallenges[Math.floor(weekNum / 2) % leaderChallenges.length] }
      : { type: 'For Your Staff', text: staffChallenges[Math.floor(weekNum / 2) % staffChallenges.length] };

    let sent = 0;

    for (const p of partnerships) {
      if (!p.contact_email) continue;

      const firstName = (p.contact_name || '').split(' ')[0] || 'there';
      const dashboardUrl = `https://www.teachersdeserveit.com/partners/${p.slug}`;

      // Get topics this partnership's team has been exploring
      let teamTopics = trending;

      // If we have partnership-linked profiles, get their specific activity
      const { data: partnerProfiles } = await hubSupabase
        .from('hub_profiles')
        .select('id')
        .eq('partnership_id', p.id)
        .limit(500);

      if (partnerProfiles && partnerProfiles.length > 0) {
        const userIds = partnerProfiles.map(pp => pp.id);

        const { data: partnerActivity } = await hubSupabase
          .from('hub_activity_log')
          .select('metadata')
          .eq('action', 'quick_win_viewed')
          .in('user_id', userIds.slice(0, 100))
          .gte('created_at', twoWeeksAgo.toISOString())
          .limit(200);

        if (partnerActivity && partnerActivity.length > 0) {
          const partnerCounts: Record<string, number> = {};
          partnerActivity.forEach((a: { metadata: { title?: string } | null }) => {
            const title = a.metadata?.title;
            if (title) partnerCounts[title] = (partnerCounts[title] || 0) + 1;
          });

          const partnerTrending = Object.entries(partnerCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([title]) => {
              const match = qws.find(q => q.title === title);
              return match || { title, slug: '', category: '', lift: '', description: '' };
            });

          if (partnerTrending.length > 0) {
            teamTopics = partnerTrending;
          }
        }
      }

      // Build topics section
      const topicsHtml = teamTopics.length > 0
        ? teamTopics.map(t => {
            const link = t.slug ? `${HUB_URL}/quick-wins/${t.slug}` : HUB_URL;
            const cat = t.category ? ` <span style="color:#94A3B8;font-size:13px;">${t.category}</span>` : '';
            return `<li style="margin-bottom:8px;"><a href="${link}" style="color:#1e2749;font-weight:600;text-decoration:none;">${t.title}</a>${cat}</li>`;
          }).join('')
        : `<li style="margin-bottom:8px;"><a href="${HUB_URL}/quick-wins" style="color:#1e2749;font-weight:600;text-decoration:none;">Browse Quick Wins</a> <span style="color:#94A3B8;font-size:13px;">100+ tools ready to use</span></li>`;

      // Build featured section with copy-paste blurb
      let featuredHtml = '';
      if (featured) {
        const featuredLink = `${HUB_URL}/quick-wins/${featured.slug}`;
        const liftLabel = featured.lift === 'LOW' ? 'Grab & Go' : featured.lift === 'MED' ? 'Short Prep' : 'Deep Dive';
        const copyPaste = `Have you checked out "${featured.title}" on the TDI Hub yet? It is a ${liftLabel.toLowerCase()} tool that ${(featured.description || '').toLowerCase().replace(/\.$/, '')}. Takes less than 5 minutes. Worth a look when you get a chance.`;

        featuredHtml = `
          <td style="padding:24px;background:white;border-radius:12px;border:1px solid #E5E7EB;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Share With Your Team This Week</p>
            <p style="margin:0 0 8px;"><a href="${featuredLink}" style="font-size:17px;font-weight:700;color:#1e2749;text-decoration:none;">${featured.title}</a></p>
            <p style="margin:0 0 12px;font-size:14px;color:#64748B;">${featured.description || ''} <span style="display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;background:#D9E8E2;color:#0F4438;vertical-align:middle;margin-left:4px;">${liftLabel}</span></p>
            <div style="background:#F8FAFC;border-radius:8px;padding:14px 16px;border-left:3px solid #2A9D8F;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Copy & Paste for Your Newsletter</p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${copyPaste}</p>
            </div>
          </td>
        `;
      }

      const html = `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 20px;font-size:15px;">${firstName},</p>

          <p style="margin:0 0 24px;font-size:15px;color:#64748B;">Here is this week's digest to support you and your team.</p>

          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>${featuredHtml}</tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;">
            <tr>
              <td style="padding:24px;background:white;border-radius:12px;border:1px solid #E5E7EB;">
                <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;">Topics Your Team Has Been Exploring</p>
                <ul style="margin:0;padding:0 0 0 16px;list-style:none;">
                  ${topicsHtml}
                </ul>
              </td>
            </tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;">
            <tr>
              <td style="padding:24px;background:${isLeaderWeek ? '#1e2749' : '#F0FDFA'};border-radius:12px;${isLeaderWeek ? '' : 'border:1px solid #99F6E4;'}">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${isLeaderWeek ? '#94A3B8' : '#0D9488'};">This Week's Challenge: ${challenge.type}</p>
                <p style="margin:0;font-size:15px;color:${isLeaderWeek ? 'white' : '#134E4A'};line-height:1.6;">${challenge.text}</p>
              </td>
            </tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;">
            <tr>
              <td align="center">
                <a href="${dashboardUrl}" style="display:inline-block;padding:14px 32px;background:#1e2749;color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Open Your Dashboard</a>
              </td>
            </tr>
          </table>

          <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0 16px;" />
          <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center;">
            Sent by the Teachers Deserve It Team as part of your partnership with ${p.org_name || p.contact_name || 'your school'}.
          </p>
        </div>
      `;

      // Check we haven't already sent this week
      const weekKey = `weekly_digest_${new Date().toISOString().split('T')[0].substring(0, 7)}_w${weekNum}`;
      const { data: existingLog } = await portalSupabase
        .from('activity_log')
        .select('id')
        .eq('partnership_id', p.id)
        .eq('action', weekKey)
        .limit(1);

      if (existingLog && existingLog.length > 0) continue;

      // Send email
      const subject = featured
        ? `This Week from TDI: ${featured.title}`
        : 'This Week from TDI: New tools for your team';

      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
          to: p.contact_email,
          subject,
          html,
        }),
      });

      if (resp.ok) {
        await portalSupabase.from('activity_log').insert({
          partnership_id: p.id,
          action: weekKey,
          details: { featured: featured?.title, challenge: challenge.type, sent_to: p.contact_email },
        });
        sent++;
      } else {
        console.error(`[weekly-digest] Failed for ${p.contact_email}:`, await resp.text());
      }
    }

    return NextResponse.json({ success: true, sent, total: partnerships.length });
  } catch (error) {
    console.error('[partner-weekly-digest] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
