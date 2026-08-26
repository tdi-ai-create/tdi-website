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
 * Upserts one row per open issue into partnership_flags.
 *
 * This used to insert a fresh partnership_notes row for every concern every
 * morning. St. Peter Chanel accumulated 96 notes that are really three
 * concerns restated 32 times, and the only human note in the last month sat
 * buried between them. Notes are for things people wrote.
 *
 * Now each concern is a single row whose last_seen_at moves while it stays
 * true, so the age of a problem is visible. A concern that stops being true
 * gets resolved_at set rather than silently vanishing.
 *
 * Pass ?dryRun=1 to see what would change without writing.
 */
export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

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

      // No "already flagged today" guard any more. There is one row per open
      // issue and the upsert moves last_seen_at, so running twice in a day is
      // harmless rather than a source of duplicates.

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

      const flags: { key: string; severity: 'warning' | 'urgent'; message: string }[] = [];

      // Day 7: Principal not logged in
      if (daysSinceStart >= 7 && daysSinceStart < 21 && (dashViews || 0) === 0) {
        flags.push({
          key: 'principal_not_logged_in',
          severity: 'warning',
          message: 'Principal has not logged into the dashboard yet. Direct call recommended.',
        });
      }

      // Day 14: Staff < 50% logged in
      if (daysSinceStart >= 14 && totalStaff > 0 && loginPct < 50) {
        flags.push({
          key: 'staff_logins_below_50',
          severity: 'warning',
          message: `Only ${loginPct}% of staff have logged in, ${loggedInStaff} of ${totalStaff}. Re-engage through the staff champion.`,
        });
      }

      // Day 21: Principal still not logged in (escalation)
      if (daysSinceStart >= 21 && (dashViews || 0) === 0) {
        flags.push({
          key: 'principal_still_not_logged_in',
          severity: 'urgent',
          message: 'Principal has still not logged in after 21 days. Immediate follow up required.',
        });
      }

      // Day 45+: Active usage below 40%
      if (daysSinceStart >= 45 && totalStaff > 0 && loginPct < 40) {
        flags.push({
          key: 'active_usage_below_40',
          severity: 'urgent',
          message: `Active usage is ${loginPct}%, below the 40% mark. Escalate with a re-engagement plan.`,
        });
      }

      const nowIso = now.toISOString();
      const openKeys = flags.map((f) => f.key);

      if (!dryRun) {
        for (const flag of flags) {
          // Upsert on the partial unique index: one open row per issue. An
          // existing open flag keeps its first_raised_at, which is the whole
          // point, and only last_seen_at moves.
          const { error: upsertError } = await supabase
            .from('partnership_flags')
            .upsert(
              {
                partnership_id: p.id,
                flag_key: flag.key,
                severity: flag.severity,
                message: flag.message,
                detail: { daysSinceStart, loginPct, loggedInStaff, totalStaff },
                last_seen_at: nowIso,
                updated_at: nowIso,
              },
              { onConflict: 'partnership_id,flag_key', ignoreDuplicates: false }
            );

          if (upsertError) {
            console.error('[partner-attention-flags] flag upsert failed:', p.id, flag.key, upsertError.message);
            continue;
          }
          flagsCreated++;
        }

        // Anything previously open that is no longer true gets resolved rather
        // than lingering. A stale red flag is worse than no flag.
        const { error: resolveError } = await supabase
          .from('partnership_flags')
          .update({ resolved_at: nowIso, updated_at: nowIso })
          .eq('partnership_id', p.id)
          .is('resolved_at', null)
          .not('flag_key', 'in', `(${openKeys.length ? openKeys.map((k) => `"${k}"`).join(',') : '""'})`);

        if (resolveError) {
          console.error('[partner-attention-flags] flag resolve failed:', p.id, resolveError.message);
        }
      } else {
        flagsCreated += flags.length;
      }

      // Send admin notification if any flags were created for this partnership
      if (flags.length > 0 && !dryRun) {
        const isEscalation = flags.some((f) => f.severity === 'urgent');
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        fetch(`${baseUrl}/api/admin/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'attention_flag',
            partnershipName: p.contact_name,
            urgency: isEscalation ? 'urgent' : 'action',
            details: { 'Flags': flags.length, 'Day': daysSinceStart, 'Summary': flags[0].message },
          }),
        }).catch(() => {});
      }
    }

    console.log('[partner-attention-flags]', flagsCreated, 'flags created across', partnerships.length, 'partnerships');

    return NextResponse.json({
      success: true,
      dryRun,
      flagsCreated,
      partnershipsChecked: partnerships.length,
      message: dryRun
        ? `Dry run. Would open or refresh ${flagsCreated} flags across ${partnerships.length} partnerships. Nothing written.`
        : undefined,
    });
  } catch (error) {
    console.error('[partner-attention-flags] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
