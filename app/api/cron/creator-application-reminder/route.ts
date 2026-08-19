import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { loadApplications } from '@/lib/creator-applications';
import { creatorApplicationsWaiting } from '@/lib/creator-slack';

// ---------------------------------------------------------------------------
// Unanswered applications
//
// The arrival notification is a single message at the moment someone applies.
// If it is missed, an unanswered application is indistinguishable from no
// application, which is how seven of them accumulated between 18 June and
// 31 July with nobody ever marking one reviewed.
//
// This chases anything that has waited three days, and repeats no more often
// than every three days per application so the channel does not become noise
// that gets muted, which would put us back where we started.
//
// Held applications whose revisit date has arrived count as waiting, because a
// hold that never comes back is the same failure wearing a different word.
//
// Supports ?dryRun=1 through lib/cron-guard.
// ---------------------------------------------------------------------------

const CHASE_AFTER_DAYS = 3;
const REPEAT_EVERY_DAYS = 3;

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

    const now = new Date();
    const open = await loadApplications(supabase, { status: 'open' }, now);

    const repeatCutoff = new Date(now.getTime() - REPEAT_EVERY_DAYS * 86400000);

    const due = open.filter((a) => {
      if (a.waitingDays < CHASE_AFTER_DAYS) return false;
      const last = (a as unknown as { last_reminded_at?: string | null }).last_reminded_at;
      if (!last) return true;
      return new Date(last) < repeatCutoff;
    });

    const oldest = open.length ? Math.max(...open.map((a) => a.waitingDays)) : 0;

    const result = {
      dryRun,
      waiting: open.length,
      oldestDays: oldest,
      chased: due.length,
      names: due.map((a) => a.name || a.email),
    };

    if (due.length === 0) {
      console.log(`[application-reminder] ${dryRun ? 'DRY RUN ' : ''}nothing due, ${open.length} waiting`);
      return NextResponse.json({ success: true, ...result });
    }

    if (!dryRun) {
      await creatorApplicationsWaiting(open.length, oldest);
      await supabase
        .from('pending_creators')
        .update({ last_reminded_at: now.toISOString() })
        .in('id', due.map((a) => a.id));
    }

    console.log(
      `[application-reminder] ${dryRun ? 'DRY RUN ' : ''}${open.length} waiting, oldest ${oldest} days, chased ${due.length}`
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[application-reminder] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
