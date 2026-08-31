import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { loadTeamWork, formatTeamWork } from '@/lib/creator-team-work';
import { postCreatorMessage } from '@/lib/creator-slack';
import { shouldPostDigest, recordDigestPost, recordDigestSuppressed, heartbeatNote } from '@/lib/digest-state';

// ---------------------------------------------------------------------------
// The daily "waiting on TDI" list
//
// The Creator Studio has always handled a creator handing work in. It has never
// handled the ball being with us: a team step opens, and nothing records it,
// alerts anyone, or counts the days.
//
// On 19 Aug two creators had been sitting on our review step since 13 Aug with
// nobody told. Sixty six team steps read as open at the same time because
// nothing was locked, so the real backlog was impossible to see even by looking.
//
// Posts every weekday morning. Stays silent when there is nothing waiting,
// because a daily message saying "nothing" is how a channel gets muted, and a
// muted channel is where this failure came back.
//
// Supports ?dryRun=1 through lib/cron-guard.
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

    const items = await loadTeamWork(supabase);
    const message = formatTeamWork(items);

    const result = {
      dryRun,
      waiting: items.length,
      oldestDays: items[0]?.daysWaiting ?? 0,
      unowned: items.filter((i) => i.kind === 'unassigned').length,
      agentWorkNeverAsked: items.filter((i) => i.agentNeverAsked).length,
      items: items.map((i) => ({
        creator: i.creatorName,
        step: i.step,
        owner: `${i.who} (${i.kind})`,
        days: i.daysWaiting,
      })),
      message,
      posted: false,
    };

    if (items.length === 0) {
      console.log('[waiting-on-us] Nothing waiting on TDI, staying quiet');
      return NextResponse.json({ success: true, ...result });
    }

    // Post when the list changes, not because a day has passed. This named the
    // same creator on seventeen consecutive mornings and nothing moved, which
    // is how a channel gets muted. See lib/digest-state.
    const decision = await shouldPostDigest(supabase, 'creator-waiting-on-us', message);
    (result as Record<string, unknown>).digestReason = decision.reason;

    if (!decision.post) {
      await recordDigestSuppressed(supabase, 'creator-waiting-on-us', decision.suppressedRuns);
      console.log(`[waiting-on-us] Unchanged for ${decision.daysSinceLastPost} day(s), staying quiet`);
      return NextResponse.json({ success: true, ...result });
    }

    if (!dryRun) {
      const heading = decision.reason === 'heartbeat'
        ? `${message}${heartbeatNote(decision.daysSinceLastPost)}`
        : message;
      await postCreatorMessage(heading);
      await recordDigestPost(supabase, 'creator-waiting-on-us', message);
      result.posted = true;
    }

    console.log(
      `[waiting-on-us] ${dryRun ? 'DRY RUN ' : ''}${items.length} waiting, oldest ${result.oldestDays} days, ${result.unowned} unowned`
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[waiting-on-us] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
