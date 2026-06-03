import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/hub/wellness-check
 *
 * Scans for educators with 2+ negative vibe scores (<=2 out of 5)
 * in their recent check-ins. Sends a warm check-in email from Rae.
 * Logs the outreach to hub_activity_log.
 *
 * Called by cron or manually from admin.
 */
export async function POST() {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend not configured' }, { status: 500 });
    }

    // Get all recent vibe checks (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: recentChecks } = await hubSupabase
      .from('hub_activity_log')
      .select('user_id, metadata')
      .eq('action', 'wellbeing_check')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(5000);

    // Group by user, check for negative streaks
    const userScores: Record<string, number[]> = {};
    (recentChecks || []).forEach((check: { user_id: string; metadata: { score?: number } }) => {
      if (!userScores[check.user_id]) userScores[check.user_id] = [];
      if (check.metadata?.score) userScores[check.user_id].push(check.metadata.score);
    });

    // Find users with 2+ recent scores <= 2
    const needsSupport: string[] = [];
    Object.entries(userScores).forEach(([userId, scores]) => {
      const recentNegative = scores.slice(0, 3).filter(s => s <= 2).length;
      if (recentNegative >= 2) needsSupport.push(userId);
    });

    if (needsSupport.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No educators need support right now' });
    }

    // Check who we already reached out to recently (don't spam)
    const { data: recentOutreach } = await hubSupabase
      .from('hub_activity_log')
      .select('user_id')
      .eq('action', 'wellness_outreach_sent')
      .gte('created_at', sevenDaysAgo)
      .in('user_id', needsSupport);

    const alreadyContacted = new Set((recentOutreach || []).map((r: { user_id: string }) => r.user_id));
    const toContact = needsSupport.filter(id => !alreadyContacted.has(id));

    if (toContact.length === 0) {
      return NextResponse.json({ sent: 0, message: 'All educators already contacted this week' });
    }

    // Get their emails and names
    const { data: profiles } = await hubSupabase
      .from('hub_profiles')
      .select('id, email, display_name')
      .in('id', toContact);

    let sent = 0;
    for (const profile of (profiles || []) as { id: string; email: string; display_name: string | null }[]) {
      if (!profile.email) continue;

      const firstName = profile.display_name?.split(' ')[0] || 'there';

      const html = `<div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <p style="font-size: 15px; color: #374151; line-height: 1.7;">Hey ${firstName},</p>
        <p style="font-size: 15px; color: #374151; line-height: 1.7;">I just wanted to check in. I noticed you have been having some tough days lately, and I wanted you to know that is completely normal -- and that you are not alone in it.</p>
        <p style="font-size: 15px; color: #374151; line-height: 1.7;">If there is anything we can do to support you, even just listening, hit reply. This email goes straight to a real person.</p>
        <p style="font-size: 15px; color: #374151; line-height: 1.7;">You are doing harder work than most people understand. And you deserve someone in your corner.</p>
        <p style="font-size: 15px; color: #374151; line-height: 1.7; margin-top: 24px;">Warmly,<br/>Rae Hughart<br/><span style="color: #9CA3AF; font-size: 13px;">Founder, Teachers Deserve It</span></p>
      </div>`;

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Rae Hughart <rae@teachersdeserveit.com>',
            to: [profile.email],
            subject: 'Just checking in',
            html,
          }),
        });

        // Log the outreach
        await hubSupabase.from('hub_activity_log').insert({
          user_id: profile.id,
          action: 'wellness_outreach_sent',
          metadata: { triggered_by: 'vibe_check_negative_streak', email_sent: true },
        });

        sent++;
      } catch (emailErr) {
        console.error(`[Wellness] Failed to email ${profile.email}:`, emailErr);
      }
    }

    return NextResponse.json({ sent, total_needing_support: needsSupport.length, already_contacted: alreadyContacted.size });
  } catch (error) {
    console.error('[Wellness Check]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
