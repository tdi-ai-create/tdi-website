import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const HUB_URL = 'https://www.teachersdeserveit.com/hub';

/**
 * GET /api/cron/community-monthly-digest
 *
 * Runs on the 1st of each month at 9 AM CT. Sends a community
 * highlights email to all Hub members who have been active in the
 * past 60 days. Surfaces top discussions, most-helpful posts,
 * and trending Quick Wins from community activity.
 *
 * Voice: Warm, collegial. Fellow educators sharing wins.
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

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
    if (!hubUrl || !hubKey) {
      return NextResponse.json({ error: 'Hub Supabase not configured' }, { status: 500 });
    }

    const hubSupabase = createClient(hubUrl, hubKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();

    // ── Gather community highlights ──

    // Top posts by helpful_count in the past 30 days
    const { data: topPosts } = await hubSupabase
      .from('hub_qa_posts')
      .select('id, body, helpful_count, content_type, content_id, user_id, created_at')
      .is('parent_id', null) // top-level posts only
      .gte('created_at', thirtyDaysAgo)
      .order('helpful_count', { ascending: false })
      .limit(5);

    // Most-replied discussions (count replies per parent)
    const { data: recentReplies } = await hubSupabase
      .from('hub_qa_posts')
      .select('parent_id')
      .not('parent_id', 'is', null)
      .gte('created_at', thirtyDaysAgo)
      .limit(500);

    const replyCounts: Record<string, number> = {};
    (recentReplies || []).forEach(r => {
      if (r.parent_id) replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1;
    });

    const topDiscussionIds = Object.entries(replyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({ id, replyCount: count }));

    // Fetch those parent posts
    let topDiscussions: { id: string; body: string; replyCount: number; content_type: string; content_id: string }[] = [];
    if (topDiscussionIds.length > 0) {
      const { data: discussionPosts } = await hubSupabase
        .from('hub_qa_posts')
        .select('id, body, content_type, content_id')
        .in('id', topDiscussionIds.map(d => d.id));

      topDiscussions = (discussionPosts || []).map(p => ({
        ...p,
        replyCount: topDiscussionIds.find(d => d.id === p.id)?.replyCount || 0,
      }));
    }

    // Trending Quick Wins from community posts (which content_ids show up most)
    const { data: recentPosts } = await hubSupabase
      .from('hub_qa_posts')
      .select('content_type, content_id')
      .eq('content_type', 'quick_win')
      .gte('created_at', thirtyDaysAgo)
      .limit(500);

    const qwPostCounts: Record<string, number> = {};
    (recentPosts || []).forEach(p => {
      if (p.content_id) qwPostCounts[p.content_id] = (qwPostCounts[p.content_id] || 0) + 1;
    });

    const topQwIds = Object.entries(qwPostCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    let trendingQws: { id: string; title: string; slug: string; category: string }[] = [];
    if (topQwIds.length > 0) {
      const { data: qws } = await hubSupabase
        .from('hub_quick_wins')
        .select('id, title, slug, category')
        .in('id', topQwIds);
      trendingQws = qws || [];
    }

    // Community stats for the month
    const { count: totalPosts } = await hubSupabase
      .from('hub_qa_posts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    const { count: totalHelpful } = await hubSupabase
      .from('hub_qa_post_helpfuls')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    // ── Get active members (logged in within 60 days) ──

    const { data: activeProfiles } = await hubSupabase
      .from('hub_profiles')
      .select('id, email, display_name')
      .gte('last_login', sixtyDaysAgo)
      .not('email', 'is', null)
      .limit(2000);

    if (!activeProfiles || activeProfiles.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No active members to email' });
    }

    // ── Build email HTML ──

    // Top helpful post highlight
    const bestPost = (topPosts || []).find(p => p.helpful_count > 0 && p.body && p.body.length > 20);
    const bestPostSnippet = bestPost
      ? bestPost.body.substring(0, 200) + (bestPost.body.length > 200 ? '...' : '')
      : null;

    // Discussion highlights
    const discussionHtml = topDiscussions.length > 0
      ? topDiscussions.map(d => {
          const snippet = d.body.substring(0, 120) + (d.body.length > 120 ? '...' : '');
          const link = d.content_type === 'quick_win'
            ? `${HUB_URL}/quick-wins?post=${d.id}`
            : `${HUB_URL}/community`;
          return `<li style="margin-bottom:10px;"><a href="${link}" style="color:#1e2749;font-weight:600;text-decoration:none;">${snippet}</a> <span style="color:#94A3B8;font-size:12px;">${d.replyCount} replies</span></li>`;
        }).join('')
      : '<li style="color:#64748B;">Be the first to start a discussion this month!</li>';

    // Trending Quick Wins from community
    const trendingHtml = trendingQws.length > 0
      ? trendingQws.map(q => {
          const catColor = getCategoryColor(q.category);
          return `<li style="margin-bottom:8px;"><a href="${HUB_URL}/quick-wins/${q.slug}" style="color:#1e2749;font-weight:600;text-decoration:none;">${q.title}</a> <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${catColor};vertical-align:middle;margin:0 4px;"></span><span style="color:#94A3B8;font-size:12px;">${q.category}</span></li>`;
        }).join('')
      : '<li style="color:#64748B;">Browse the <a href="' + HUB_URL + '/quick-wins" style="color:#2A9D8F;">Quick Wins library</a></li>';

    // Stats line
    const statsHtml = `
      <td style="padding:20px 24px;background:#1e2749;border-radius:12px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td width="33%" style="text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:700;color:white;">${totalPosts || 0}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;">Posts</p>
          </td>
          <td width="33%" style="text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:700;color:#E8B84B;">${totalHelpful || 0}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;">Helpful Marks</p>
          </td>
          <td width="33%" style="text-align:center;">
            <p style="margin:0;font-size:24px;font-weight:700;color:#2A9D8F;">${topDiscussions.length}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;">Active Threads</p>
          </td>
        </tr></table>
      </td>
    `;

    const buildEmailHtml = (firstName: string) => `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
        <p style="margin:0 0 20px;font-size:15px;">${firstName},</p>

        <p style="margin:0 0 24px;font-size:15px;color:#64748B;">Here is what educators have been sharing, asking, and building in the TDI Community this month.</p>

        <!-- Stats -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>${statsHtml}</tr>
        </table>

        ${bestPostSnippet ? `
        <!-- Most Helpful Post -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;">
          <tr>
            <td style="padding:24px;background:white;border-radius:12px;border:1px solid #E5E7EB;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#E8B84B;">Most Helpful This Month</p>
              <p style="margin:0 0 8px;font-size:15px;color:#334155;line-height:1.6;font-style:italic;">"${bestPostSnippet}"</p>
              <p style="margin:0;font-size:13px;color:#94A3B8;">${bestPost?.helpful_count || 0} educators found this helpful</p>
            </td>
          </tr>
        </table>
        ` : ''}

        <!-- Active Discussions -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;">
          <tr>
            <td style="padding:24px;background:white;border-radius:12px;border:1px solid #E5E7EB;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#2563EB;">Conversations Worth Joining</p>
              <ul style="margin:0;padding:0 0 0 16px;list-style:none;">
                ${discussionHtml}
              </ul>
            </td>
          </tr>
        </table>

        <!-- Trending from Community -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;">
          <tr>
            <td style="padding:24px;background:#F0FDFA;border-radius:12px;border:1px solid #99F6E4;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#0D9488;">Trending in Community</p>
              <p style="margin:0 0 12px;font-size:14px;color:#134E4A;">Quick Wins educators are talking about the most:</p>
              <ul style="margin:0;padding:0 0 0 16px;list-style:none;">
                ${trendingHtml}
              </ul>
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;">
          <tr>
            <td align="center">
              <a href="${HUB_URL}/quick-wins" style="display:inline-block;padding:14px 32px;background:#1e2749;color:white;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Explore the Hub</a>
            </td>
          </tr>
        </table>

        <hr style="border:none;border-top:1px solid #E5E7EB;margin:32px 0 16px;" />
        <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center;">
          You are receiving this because you are an active member of the TDI Learning Hub.
        </p>
      </div>
    `;

    // ── Dedup + send ──

    // Check if already sent this month
    const { data: existingLog } = await hubSupabase
      .from('hub_activity_log')
      .select('id')
      .eq('action', `community_digest_${monthKey}`)
      .limit(1);

    if (existingLog && existingLog.length > 0) {
      return NextResponse.json({ success: true, sent: 0, message: `Already sent for ${monthKey}` });
    }

    let sent = 0;
    const batchSize = 50;

    for (let i = 0; i < activeProfiles.length; i += batchSize) {
      const batch = activeProfiles.slice(i, i + batchSize);

      const emailPromises = batch.map(async (profile) => {
        if (!profile.email) return;
        const firstName = (profile.display_name || profile.email.split('@')[0] || '').split(' ')[0] || 'there';

        try {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Teachers Deserve It Team <hello@teachersdeserveit.com>',
              to: profile.email,
              subject: `Your TDI Community This Month: ${totalPosts || 0} posts, ${totalHelpful || 0} helpful marks`,
              html: buildEmailHtml(firstName),
            }),
          });

          if (resp.ok) sent++;
          else console.error(`[community-digest] Failed for ${profile.email}:`, await resp.text());
        } catch (e) {
          console.error(`[community-digest] Error for ${profile.email}:`, e);
        }
      });

      await Promise.all(emailPromises);
    }

    // Log that we sent this month
    await hubSupabase.from('hub_activity_log').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      action: `community_digest_${monthKey}`,
      metadata: { sent, total_profiles: activeProfiles.length, month: monthKey },
    });

    return NextResponse.json({ success: true, sent, total: activeProfiles.length, month: monthKey });
  } catch (error) {
    console.error('[community-monthly-digest] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Social-Emotional Learning': '#2563EB',
    'Instructional Strategies': '#059669',
    'Behavioral Support': '#DC2626',
    'Inclusion & Accessibility': '#7C3AED',
    'Data & Assessment': '#0891B2',
    'Family Engagement': '#EA580C',
    'Educator Wellness': '#2A9D8F',
    'Leadership & Coaching': '#1e2749',
    'Culture & Climate': '#E8B84B',
    'Literacy & Math': '#6366F1',
    'Technology Integration': '#64748B',
    'Collaboration & Planning': '#BE185D',
  };
  return colors[category] || '#94A3B8';
}
