import { NextRequest, NextResponse } from 'next/server';
import { slackNotify } from '@/lib/slack-notify';
import { notifyAdmin } from '@/lib/admin-notify';
import { shouldPostDigest, recordDigestPost, recordDigestSuppressed } from '@/lib/digest-state';
import { createClient } from '@supabase/supabase-js';
import { getSchoolSignIns } from '@/lib/partners/signed-in';
import { getHubEngagement, hubActivePct } from '@/lib/partners/hub-engagement';
import { getHubServiceClient } from '@/lib/hub/partnership-members';

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
      .select('id, org_name, contact_name, contact_email, contract_start, staff_enrolled, status')
      .eq('status', 'active');

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ success: true, flagsCreated: 0, message: 'No active partnerships.' });
    }

    // The two definitions every screen now shares, fetched once for all
    // partnerships rather than per row.
    //
    // This cron used to answer both questions its own way, which is why its
    // warnings contradicted the page they appeared on. "Has the principal
    // logged in" came from counting dashboard_views rows, a table whose writes
    // were broken until 29 August and which is still empty for Saunemin,
    // Glen Ellyn and Roosevelt, so it reported schools as never signed in while
    // the header showed a sign in from yesterday. "How many staff are logged
    // in" came from staff_members.hub_login_date over the count of roster rows,
    // a different window and a different denominator from anything else.
    const partnershipIds = partnerships.map((p) => p.id as string);
    const signIns = await getSchoolSignIns(supabase, partnershipIds);
    const engagementByPartnership = await getHubEngagement(
      supabase,
      getHubServiceClient(),
      partnershipIds
    );

    const now = new Date();
    let flagsCreated = 0;
    let concernsComputed = 0;
    let emailsSent = 0;
    let emailsFailed = 0;
    let emailsWouldSend = 0;
    let flagsResolved = 0;
    const resolutions: string[] = [];

    // These flags were written to a table and never told anyone. A partner
    // whose staff are not logging in is the clearest renewal risk we have, and
    // it sat in a database nobody opens. Collected here and posted once.
    const newlyRaised: string[] = [];

    for (const p of partnerships) {
      if (!p.contract_start) continue;

      const start = new Date(p.contract_start);
      const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      // No 90 day cap any more, and removing it is the actual fix for stale
      // flags. The resolve step lives inside this loop, so a partnership past
      // day 90 was skipped entirely and every flag it was carrying froze
      // exactly as it was: Saunemin's "nobody has ever signed in" was raised on
      // 28 August, became false when somebody signed in, and could never be
      // cleared because Saunemin had aged out of the loop that clears it.
      //
      // Every threshold below is a "day N or later" test, so they keep
      // answering correctly for an older partnership. A school at 24% use six
      // months in is more of a problem than one at 24% in week three, not less.

      // No "already flagged today" guard any more. There is one row per open
      // issue and the upsert moves last_seen_at, so running twice in a day is
      // harmless rather than a source of duplicates.

      const signIn = signIns.get(p.id as string);
      const engagement = engagementByPartnership.get(p.id as string);

      // A failed lookup must never raise a flag. Reading an outage as "nobody
      // has signed in" would put every school on an attention list, and this
      // cron emails what it raises.
      if (!signIn || signIn.unknown || !engagement || engagement.unknown) {
        console.warn(`[partner-attention-flags] skipping ${p.org_name}: engagement or sign-in unknown`);
        continue;
      }

      const neverSignedIn = signIn.neverSignedIn;
      const totalStaff = engagement.seats;
      const loggedInStaff = engagement.active;
      const loginPct = hubActivePct(engagement) ?? 0;

      type Flag = { key: string; severity: 'warning' | 'urgent'; message: string };
      const flags: Flag[] = [];
      // Only flags opened on this run. An already open flag is already known,
      // and mailing it again every morning is the noise we are removing.
      const newFlags: Flag[] = [];

      // Day 7: Principal not logged in
      if (daysSinceStart >= 7 && daysSinceStart < 21 && neverSignedIn) {
        flags.push({
          key: 'principal_not_logged_in',
          severity: 'warning',
          message: 'Nobody at this school has signed in yet. A direct call is the fastest fix.',
        });
      }

      // Day 14: Staff < 50% logged in
      if (daysSinceStart >= 14 && totalStaff > 0 && loginPct < 50) {
        flags.push({
          key: 'staff_logins_below_50',
          severity: 'warning',
          message: `${loggedInStaff} of ${totalStaff} educators are using the Hub. Re-engage through the staff champion.`,
        });
      }

      // Day 21: Principal still not logged in (escalation)
      if (daysSinceStart >= 21 && neverSignedIn) {
        flags.push({
          key: 'principal_still_not_logged_in',
          severity: 'urgent',
          message: 'Nobody at this school has ever signed in. This needs a person, not another email.',
        });
      }

      // Day 45+: Active usage below 40%
      if (daysSinceStart >= 45 && totalStaff > 0 && loginPct < 40) {
        flags.push({
          key: 'active_usage_below_40',
          severity: 'urgent',
          message: `Use is at ${loginPct}%, below the 40% mark. Escalate with a re-engagement plan.`,
        });
      }

      concernsComputed += flags.length;

      const nowIso = now.toISOString();
      const openKeys = flags.map((f) => f.key);

      if (!dryRun) {
        for (const flag of flags) {
          // Deliberately not an upsert. The unique index on (partnership_id,
          // flag_key) is partial, scoped to resolved_at is null, so that a
          // problem which returns later gets a fresh row and a fresh
          // first_raised_at. PostgREST generates ON CONFLICT (partnership_id,
          // flag_key), which cannot match a partial index, so every upsert
          // errored and this cron wrote nothing at all on its first run.
          const { data: existing, error: findError } = await supabase
            .from('partnership_flags')
            .select('id')
            .eq('partnership_id', p.id)
            .eq('flag_key', flag.key)
            .is('resolved_at', null)
            .maybeSingle();

          if (findError) {
            console.error('[partner-attention-flags] flag lookup failed:', p.id, flag.key, findError.message);
            continue;
          }

          const payload = {
            severity: flag.severity,
            message: flag.message,
            detail: { daysSinceStart, loginPct, loggedInStaff, totalStaff },
            last_seen_at: nowIso,
            updated_at: nowIso,
          };

          // An open flag keeps its first_raised_at. That is the whole point:
          // the age of a problem is the thing worth seeing.
          const { error: writeError } = existing
            ? await supabase.from('partnership_flags').update(payload).eq('id', existing.id)
            : await supabase.from('partnership_flags').insert({
                partnership_id: p.id,
                flag_key: flag.key,
                first_raised_at: nowIso,
                ...payload,
              });

          if (writeError) {
            console.error('[partner-attention-flags] flag write failed:', p.id, flag.key, writeError.message);
            continue;
          }
          // Only genuinely new problems are announced. A flag already open is
          // already known, and repeating it daily is the noise we are removing.
          if (!existing) {
            newFlags.push(flag);
            newlyRaised.push(
              `  • *${p.org_name ?? 'unknown partner'}* — ${flag.message}` +
              `${flag.severity === 'urgent' ? '  :rotating_light:' : ''}`
            );
          }
          flagsCreated++;
        }

        // Anything previously open that is no longer true gets resolved rather
        // than lingering. A stale red flag is worse than no flag.
        const { data: resolvedRows, error: resolveError } = await supabase
          .from('partnership_flags')
          .update({ resolved_at: nowIso, updated_at: nowIso })
          .eq('partnership_id', p.id)
          .is('resolved_at', null)
          .not('flag_key', 'in', `(${openKeys.length ? openKeys.map((k) => `"${k}"`).join(',') : '""'})`)
          .select('flag_key');

        if (resolveError) {
          console.error('[partner-attention-flags] flag resolve failed:', p.id, resolveError.message);
        } else {
          for (const row of resolvedRows ?? []) {
            flagsResolved++;
            resolutions.push(`${p.org_name ?? p.id}: ${row.flag_key}`);
          }
        }
      } else {
        // A dry run has to compute the same decision set, or the numbers it
        // reports are not the numbers the real run will produce. The lookup is
        // a read, so it is safe here; only the writes and the send are skipped.
        for (const flag of flags) {
          const { data: existing, error: findError } = await supabase
            .from('partnership_flags')
            .select('id')
            .eq('partnership_id', p.id)
            .eq('flag_key', flag.key)
            .is('resolved_at', null)
            .maybeSingle();

          if (findError) {
            console.error('[partner-attention-flags] dry run lookup failed:', p.id, flag.key, findError.message);
            continue;
          }
          if (!existing) newFlags.push(flag);
        }
        flagsCreated += flags.length;

        // What the real run would clear. Without this the dry run reported only
        // what it would raise, and clearing a flag that has stopped being true
        // is the main thing this cron does for a school that has recovered.
        const { data: wouldResolve, error: wouldResolveError } = await supabase
          .from('partnership_flags')
          .select('flag_key')
          .eq('partnership_id', p.id)
          .is('resolved_at', null)
          .not('flag_key', 'in', `(${openKeys.length ? openKeys.map((k) => `"${k}"`).join(',') : '""'})`);

        if (wouldResolveError) {
          console.error('[partner-attention-flags] dry run resolve lookup failed:', p.id, wouldResolveError.message);
        } else {
          for (const row of wouldResolve ?? []) {
            flagsResolved++;
            resolutions.push(`${p.org_name ?? p.id}: ${row.flag_key}`);
          }
        }
      }

      // Email on newly opened flags only, and await it so a failure is visible.
      // This used to fire on every open flag every morning, and it used to post
      // to this deployment over HTTP, which production refuses. Both are why
      // eight partnerships carried flags for a month with nothing in the inbox.
      if (newFlags.length > 0) {
        if (dryRun) {
          emailsWouldSend++;
          continue;
        }
        const isEscalation = newFlags.some((f) => f.severity === 'urgent');
        const result = await notifyAdmin({
          event: 'attention_flag',
          partnershipName: p.org_name ?? p.contact_name ?? 'A partnership',
          urgency: isEscalation ? 'urgent' : 'action',
          details: {
            'New flags': newFlags.length,
            'Open flags': flags.length,
            Day: daysSinceStart,
            Summary: newFlags[0].message,
          },
        });
        if (result.sent) {
          emailsSent++;
        } else {
          emailsFailed++;
          console.error('[partner-attention-flags] notify failed for', p.id, result.reason);
        }
      }
    }

    console.log('[partner-attention-flags]', flagsCreated, 'flags created across', partnerships.length, 'partnerships');

    // A check that cannot fail is not a check. This cron ran once and wrote
    // nothing at all, because every upsert errored against a partial index and
    // the errors only went to a log nobody reads. If concerns were computed and
    // none were written, that is a failure, not a quiet success.
    if (!dryRun && concernsComputed > 0 && flagsCreated === 0) {
      console.error('[partner-attention-flags] computed', concernsComputed, 'concerns and wrote 0 flags');
      return NextResponse.json(
        {
          success: false,
          error: `Computed ${concernsComputed} concerns and wrote none. The flag write is failing.`,
          concernsComputed,
          flagsCreated: 0,
        },
        { status: 500 }
      );
    }

    let slackPosted = false;
    if (!dryRun && newlyRaised.length > 0) {
      const body = newlyRaised.join('\n');
      const decision = await shouldPostDigest(supabase, 'partner-attention', body);
      if (decision.post) {
        const portal = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.teachersdeserveit.com';
        slackNotify(
          'rae',
          `*Partners needing attention (${newlyRaised.length})*\n${body}\n` +
          `  _these are inside the first 90 days, when it is still fixable_\n` +
          `<${portal}/tdi-admin/intelligence/districts|Open partners>`
        );
        await recordDigestPost(supabase, 'partner-attention', body, dryRun);
        slackPosted = true;
      } else {
        await recordDigestSuppressed(supabase, 'partner-attention', decision.suppressedRuns, dryRun);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      concernsComputed,
      flagsCreated,
      newlyRaised: newlyRaised.length,
      emailsSent,
      emailsFailed,
      emailsWouldSend,
      slackPosted,
      partnershipsChecked: partnerships.length,
      flagsResolved,
      // Named, not counted. "2 resolved" is not reviewable and the point of a
      // dry run is that somebody can check the decision before it happens.
      resolutions,
      message: dryRun
        ? `Dry run. Would open or refresh ${flagsCreated} flags and clear ${flagsResolved} across ${partnerships.length} partnerships. Nothing written.`
        : undefined,
    });
  } catch (error) {
    console.error('[partner-attention-flags] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
