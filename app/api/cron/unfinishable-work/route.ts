import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { findUnfinishableWork, groupUnfinishable } from '@/lib/unfinishable-work';
import { postCreatorMessage } from '@/lib/creator-slack';

// ---------------------------------------------------------------------------
// The check that asks whether a person could finish what is in front of them.
//
// Rae asked on 9 September why Bella keeps hitting these. The answer is that
// every one of her reports sits at a seam rather than inside a feature, and
// every check we have tests either a property of the code or the state of the
// data. Ten of them, and not one asks: if somebody opened this right now, could
// they complete it?
//
// So Bella has been that check, in production, one item at a time.
//
// This runs the real resolution logic, the same functions the routes and
// buttons use, so it cannot drift from what she would actually see. On its
// first run it found four grants that had gone to schools with nothing chasing
// them, one of them Title II-A, which is the grant that was lost this exact way
// in August.
//
// Daily rather than weekly, unlike orphaned-work. Stranded work accumulates
// slowly; an unanswerable email is sent tomorrow morning.
//
// Silent when clean, and posts only when the picture changes, because a report
// that arrives every morning is one nobody reads on the morning it matters.
//
// Goes to #rae-actions. These are product defects rather than Bella's queue.
// If a rule here turns out to have a remedy that is routinely hers, the fix is
// for that rule to create real work in her list, not for this to change channel.
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

  const { findings, errors } = await findUnfinishableWork(supabase);
  const grouped = groupUnfinishable(findings);

  const lines: string[] = [];
  for (const [, items] of grouped) {
    lines.push(`\n\n*${items.length} ${items.length === 1 ? 'item' : 'items'}*: ${items[0].why}`);
    for (const i of items.slice(0, 8)) {
      lines.push(`\n- ${i.what}${i.link ? `\n  ${i.link}` : ''}`);
    }
    // Never truncate silently. A capped list that looks complete is how a
    // backlog hides inside a report about backlogs.
    if (items.length > 8) lines.push(`\n_and ${items.length - 8} more of the same_`);
  }

  const message =
    findings.length === 0
      ? ''
      : `*Work nobody could finish* | ${findings.length} ${findings.length === 1 ? 'item' : 'items'}\n` +
        `Each of these is open, assigned, and cannot be completed as it stands.` +
        lines.join('') +
        (errors.length > 0 ? `\n\n_${errors.length} rule(s) could not run: ${errors.join('; ')}_` : '');

  const result = {
    dryRun,
    findings: findings.length,
    rules: [...grouped.keys()],
    errors,
    detail: findings.map((f) => ({ rule: f.rule, what: f.what })),
    posted: false,
    message,
  };

  if (findings.length === 0) {
    console.log('[unfinishable-work] Nothing open that a person could not finish, staying quiet');
    return NextResponse.json({ success: true, ...result });
  }

  if (!dryRun) {
    await postCreatorMessage(message, 'rae');
    result.posted = true;
  }

  console.log(
    `[unfinishable-work] ${dryRun ? 'DRY RUN ' : ''}${findings.length} unfinishable across ${grouped.size} rule(s)`
  );

  return NextResponse.json({ success: true, ...result });
}
