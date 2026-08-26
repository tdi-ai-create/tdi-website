import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/**
 * Convert the cron written concern notes into flags, once.
 *
 * partner-attention-flags used to insert a partnership_notes row for every
 * concern every morning. On 26 Aug 2026 that was 364 of the 373 notes in the
 * table, and they are not 364 concerns: St. Peter Chanel's 96 are three
 * concerns restated 32 times. The nine notes a person actually wrote were
 * buried among them.
 *
 * This reads those notes, groups them into the four concern types, and creates
 * one flag per partnership per type with first_raised_at taken from the
 * earliest note of that type. The notes themselves are archived rather than
 * deleted, so the record survives and the timeline becomes readable.
 *
 * Run with ?dryRun=1 first. It reports exactly what it would create and
 * archive, and writes nothing.
 */

/**
 * Matched on the note text because that is all the old rows carry. Order
 * matters: the escalation wording contains the day 7 wording, so the more
 * specific pattern has to be tested first.
 */
const PATTERNS: { key: string; severity: 'warning' | 'urgent'; test: RegExp; message: string }[] = [
  {
    key: 'principal_still_not_logged_in',
    severity: 'urgent',
    test: /STILL not logged in/i,
    message: 'Principal has still not logged in after 21 days. Immediate follow up required.',
  },
  {
    key: 'principal_not_logged_in',
    severity: 'warning',
    test: /Principal has not logged into the dashboard/i,
    message: 'Principal has not logged into the dashboard yet. Direct call recommended.',
  },
  {
    key: 'active_usage_below_40',
    severity: 'urgent',
    test: /Active usage below 40/i,
    message: 'Active usage is below the 40% mark. Escalate with a re-engagement plan.',
  },
  {
    key: 'staff_logins_below_50',
    severity: 'warning',
    test: /of staff have logged in/i,
    message: 'Staff logins are below 50%. Re-engage through the staff champion.',
  },
];

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const { data: notes, error: notesError } = await supabase
      .from('partnership_notes')
      .select('id, partnership_id, content, created_at')
      .eq('author', 'TDI System')
      .eq('note_type', 'concern')
      .is('archived_at', null)
      .order('created_at', { ascending: true });

    if (notesError) {
      return NextResponse.json({ error: notesError.message }, { status: 500 });
    }

    const rows = notes ?? [];
    if (rows.length === 0) {
      return NextResponse.json({ success: true, dryRun, notesFound: 0, message: 'Nothing to backfill.' });
    }

    // partnership -> flag key -> earliest and latest sighting
    const grouped = new Map<string, Map<string, { first: string; last: string; count: number }>>();
    const unmatched: string[] = [];

    for (const n of rows) {
      const pattern = PATTERNS.find((p) => p.test.test(n.content ?? ''));
      if (!pattern) {
        unmatched.push(String(n.content ?? '').slice(0, 80));
        continue;
      }
      if (!grouped.has(n.partnership_id)) grouped.set(n.partnership_id, new Map());
      const byKey = grouped.get(n.partnership_id)!;
      const existing = byKey.get(pattern.key);
      if (!existing) {
        byKey.set(pattern.key, { first: n.created_at, last: n.created_at, count: 1 });
      } else {
        existing.last = n.created_at;
        existing.count++;
      }
    }

    const plan = [...grouped.entries()].flatMap(([partnershipId, byKey]) =>
      [...byKey.entries()].map(([key, span]) => ({
        partnershipId,
        flagKey: key,
        firstRaisedAt: span.first,
        lastSeenAt: span.last,
        collapsedFrom: span.count,
      }))
    );

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        notesFound: rows.length,
        wouldCreateFlags: plan.length,
        wouldArchiveNotes: rows.length - unmatched.length,
        unmatchedNotes: unmatched.length,
        unmatchedSamples: unmatched.slice(0, 5),
        plan,
        message: `Dry run. ${rows.length} cron notes collapse into ${plan.length} flags. Nothing written.`,
      });
    }

    let created = 0;
    for (const item of plan) {
      const pattern = PATTERNS.find((p) => p.key === item.flagKey)!;
      const { error: insertError } = await supabase.from('partnership_flags').upsert(
        {
          partnership_id: item.partnershipId,
          flag_key: item.flagKey,
          severity: pattern.severity,
          message: pattern.message,
          detail: { backfilled: true, collapsedFrom: item.collapsedFrom },
          first_raised_at: item.firstRaisedAt,
          last_seen_at: item.lastSeenAt,
        },
        { onConflict: 'partnership_id,flag_key', ignoreDuplicates: false }
      );

      if (insertError) {
        console.error('[backfill-flags] insert failed:', item.partnershipId, item.flagKey, insertError.message);
        continue;
      }
      created++;
    }

    // Archive rather than delete. The record of when a problem was first
    // noticed is the one genuinely useful thing in those 364 rows, and the
    // flags carry it forward, but throwing the originals away is not reversible.
    const archivable = rows.filter((n) => PATTERNS.some((p) => p.test.test(n.content ?? ''))).map((n) => n.id);
    const nowIso = new Date().toISOString();

    let archived = 0;
    for (let i = 0; i < archivable.length; i += 200) {
      const batch = archivable.slice(i, i + 200);
      const { error: archiveError } = await supabase
        .from('partnership_notes')
        .update({ archived_at: nowIso })
        .in('id', batch);

      if (archiveError) {
        console.error('[backfill-flags] archive failed for batch:', archiveError.message);
        return NextResponse.json(
          { error: archiveError.message, flagsCreated: created, archived },
          { status: 500 }
        );
      }
      archived += batch.length;
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      notesFound: rows.length,
      flagsCreated: created,
      notesArchived: archived,
      unmatchedNotes: unmatched.length,
      message: `Collapsed ${archived} cron notes into ${created} flags. Notes archived, not deleted.`,
    });
  } catch (error) {
    console.error('[backfill-flags] failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
