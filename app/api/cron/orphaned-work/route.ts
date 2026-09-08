import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { findOrphanedWork, groupByRule } from '@/lib/orphaned-work';
import { postCreatorMessage } from '@/lib/creator-slack';

// ---------------------------------------------------------------------------
// The check nobody had.
//
// On 8 September 2026 Rae asked how an error survived more than ten dry runs.
// Every one of those dry runs tested a single job on its own, and the failure
// lived between two of them: the eligibility audit created a window question
// correctly, find_work had a correct branch for handing that research to Amara,
// each passed its own test, and the work reached nobody. Five copies of the same
// question sat on Bella's list while the agent's queue for those funders was
// empty. The only reason anyone found out is that Bella said so.
//
// This asks the question no single job owns: is there a party who can actually
// do this item, and are they being offered it?
//
// It reports reachability, not backlog. "Nobody has done this yet" is normal and
// is somebody's job to work through. "Nobody can do this, and nothing will
// surface it again" is invisible, because no screen is built to show absence.
//
// Weekly rather than daily. Stranded work does not appear hourly, and a report
// that arrives every morning is one nobody reads on the morning it matters. The
// board sweep learned that the hard way two days ago by claiming three repairs
// it had not made.
//
// Silent when nothing is stranded. Silence is the good outcome and has to stay
// meaningful.
//
// Goes to #rae-actions, not #bella-actions. This is a report about the system
// failing to route work, which is Rae's to decide on, and Bella already has a
// daily list of her own. If a rule here turns out to have a remedy that is
// routinely Bella's, the right fix is for that rule to create real work in her
// queue rather than for this digest to move channels.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const guard = guardCron(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 });
  }
  const { dryRun } = guard;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { findings, errors } = await findOrphanedWork(supabase);
  const grouped = groupByRule(findings);

  // A rule that could not run is itself a finding. A check that silently drops
  // half its rules and reports "nothing stranded" is worse than no check, and
  // is the exact shape this file exists to catch.
  const worthSaying = findings.length > 0 || errors.length > 0;

  const lines: string[] = [];
  if (findings.length > 0) {
    lines.push(
      `*Work that reaches nobody* | ${findings.length} item${findings.length === 1 ? '' : 's'}, ${grouped.size} cause${grouped.size === 1 ? '' : 's'}`
    );
    for (const [, list] of grouped) {
      lines.push('');
      lines.push(`_${list[0].why}_`);
      // Ten is plenty to act on, and the count above is the honest total. Says
      // what it dropped rather than trimming quietly.
      for (const f of list.slice(0, 10)) {
        lines.push(`• ${f.where} · ${f.what}`);
      }
      if (list.length > 10) lines.push(`• and ${list.length - 10} more of the same`);
    }
  }
  for (const e of errors) {
    lines.push(`Could not check: ${e}`);
  }

  const message = lines.join('\n');

  if (!dryRun && worthSaying) {
    await postCreatorMessage(message, 'rae');
  }

  return NextResponse.json({
    success: true,
    dryRun,
    stranded: findings.length,
    causes: grouped.size,
    checksThatFailed: errors.length,
    slack: {
      wouldPost: worthSaying,
      posted: !dryRun && worthSaying,
      channel: worthSaying ? '#rae-actions' : null,
      message: worthSaying ? message : null,
    },
    findings,
    errors,
  });
}
