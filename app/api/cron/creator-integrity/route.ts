import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { slackNotify } from '@/lib/slack-notify';
import { runIntegrityChecks, formatIntegritySummary } from '@/lib/creator-integrity';

// ---------------------------------------------------------------------------
// Weekly creator integrity report
//
// Reports records that contradict themselves. It never writes and never emails
// a creator. The whole point is to surface a disagreement to a person, because
// every incident behind this was an automation acting confidently on one field.
//
// Shares lib/creator-integrity.ts with the admin panel, so the Slack message
// and the Creator Command Center can never disagree about what is wrong.
//
// ?dryRun=1 computes and returns everything without posting to Slack.
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const guard = guardCron(request);
    if (!guard.ok) {
      return NextResponse.json({ error: guard.error }, { status: guard.status });
    }
    const { dryRun } = guard;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Missing Supabase config' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const report = await runIntegrityChecks(supabase);
    const summary = formatIntegritySummary(report);
    const clean = report.findings.length === 0 && report.system.length === 0;

    // Silence when clean. A weekly "nothing to report" trains people to ignore
    // the channel, which is how the four day agent outage went unnoticed.
    if (!clean && !dryRun) {
      slackNotify(
        'rae',
        `*Creator records that disagree with themselves*\n\n${summary}\n\nCreator Command Center: https://www.teachersdeserveit.com/admin/creators`
      );
    }

    return NextResponse.json({
      success: true,
      dryRun,
      clean,
      posted: !clean && !dryRun,
      findings: report.findings.length,
      system: report.system,
      summary,
      detail: report.findings,
    });
  } catch (error) {
    console.error('[creator-integrity] Failed:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
