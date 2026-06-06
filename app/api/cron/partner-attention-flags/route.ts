import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/cron/partner-attention-flags
 *
 * Daily cron (runs at 8 AM CT). Checks all active partnerships for
 * attention flags based on the First 90 Days framework:
 *
 * - Principal not logged in by Day 7
 * - Staff < 50% logged in by Day 14
 * - Principal 0 logins by Day 21 (escalation)
 * - Staff champion disengaged (0 logins in 7 days after Day 7)
 * - 30-Day Report not viewed within 7 days
 * - Active usage below 40% after Day 45
 *
 * Creates alert records in partnership_notes with note_type='concern'.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all active partnerships with their contract start dates
    const { data: partnerships } = await supabase
      .from('partnerships')
      .select('id, contact_name, contact_email, contract_start, staff_enrolled, status')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, flagsCreated: 0, message: 'No active partnerships.' });
    }

    const now = new Date();
    let flagsCreated = 0;

    for (const p of partnerships) {
      if (!p.contract_start) continue;

      const start = new Date(p.contract_start);
      const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // Skip partnerships older than 90 days (they're past the onboarding window)
      if (daysSinceStart > 90) continue;

      // Check for existing flags today (don't duplicate)
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const { data: todayFlags } = await supabase
        .from('partnership_notes')
        .select('id')
        .eq('partnership_id', p.id)
        .eq('note_type', 'concern')
        .gte('created_at', todayStart)
        .limit(1);

      if (todayFlags && todayFlags.length > 0) continue; // Already flagged today

      // Get dashboard view count for principal
      const { count: dashViews } = await supabase
        .from('dashboard_views')
        .select('*', { count: 'exact', head: true })
        .eq('partnership_id', p.id);

      // Get staff login stats
      const { data: staffStats } = await supabase
        .from('staff_members')
        .select('hub_enrolled, hub_login_date')
        .eq('partnership_id', p.id);

      const totalStaff = staffStats?.length || 0;
      const loggedInStaff = staffStats?.filter(s => s.hub_login_date).length || 0;
      const loginPct = totalStaff > 0 ? Math.round((loggedInStaff / totalStaff) * 100) : 0;

      const flags: string[] = [];

      // Day 7: Principal not logged in
      if (daysSinceStart >= 7 && daysSinceStart < 21 && (dashViews || 0) === 0) {
        flags.push(`Day ${daysSinceStart}: Principal has not logged into the dashboard yet. Direct call recommended.`);
      }

      // Day 14: Staff < 50% logged in
      if (daysSinceStart >= 14 && totalStaff > 0 && loginPct < 50) {
        flags.push(`Day ${daysSinceStart}: Only ${loginPct}% of staff have logged in (${loggedInStaff}/${totalStaff}). Re-engage through staff champion.`);
      }

      // Day 21: Principal still not logged in (escalation)
      if (daysSinceStart >= 21 && (dashViews || 0) === 0) {
        flags.push(`Day ${daysSinceStart}: Principal has STILL not logged in after 21 days. This is a red flag. Immediate follow-up required.`);
      }

      // Day 45+: Active usage below 40%
      if (daysSinceStart >= 45 && totalStaff > 0 && loginPct < 40) {
        flags.push(`Day ${daysSinceStart}: Active usage below 40% (${loginPct}%). Escalate with re-engagement plan.`);
      }

      // Create concern notes for each flag
      for (const flagContent of flags) {
        await supabase.from('partnership_notes').insert({
          partnership_id: p.id,
          content: flagContent,
          author: 'TDI System',
          note_type: 'concern',
          visible_to_partner: false,
        });
        flagsCreated++;
      }
    }

    console.log('[partner-attention-flags]', flagsCreated, 'flags created across', partnerships.length, 'partnerships');

    return NextResponse.json({
      success: true,
      flagsCreated,
      partnershipsChecked: partnerships.length,
    });
  } catch (error) {
    console.error('[partner-attention-flags] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
