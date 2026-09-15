// ---------------------------------------------------------------------------
// Whether a funder still exists, answered once rather than per school.
//
// Saunemin's Community Schools Budget went through three QA cycles and failed
// all three on the same thing, which was never a writing problem: the likely
// funder shows non-continuation letters sent December 2025, litigation pending
// over the programme's future, and no open notice for this cycle. Julie said so
// on the first pass, repeated it on the second, and on the third escalated with
// a recommendation to stop rather than redraft a fourth time.
//
// Nobody made the call, and the cause is structural. Viability was only ever
// asked as a question about one school's path, so answering it could only ever
// close one school's path. The same programme is seeded onto every new school by
// the standard template, so the same dead funder is re-litigated school by
// school, and each re-litigation costs three drafting and review cycles.
//
// This reads the answer from the funder catalogue instead. Measured 15 Sep 2026:
// 30 of 37 live opportunities are linked to a catalogue funder, so one decision
// reaches 30 of them. The other 7 have no link and behave exactly as they do
// today, which is stated rather than hidden.
// ---------------------------------------------------------------------------

export const VIABILITY_VALUES = ['viable', 'non_continuing', 'unknown'] as const;
export type Viability = (typeof VIABILITY_VALUES)[number];

/**
 * How long a non-continuation finding holds before it should be re-checked.
 *
 * A programme that sent non-continuation letters can reopen a cycle later, and
 * the Catholic Education Trust Fund on these pursuits has a February to April
 * pattern worth catching. A stop from a year ago should not quietly keep
 * holding work down, so it expires rather than standing forever.
 */
export const VIABILITY_RECHECK_DAYS = 180;

export interface FunderViabilityRow {
  id: string;
  name?: string | null;
  viability?: string | null;
  viability_note?: string | null;
  viability_checked_on?: string | null;
}

export interface ViabilityVerdict {
  /** Stop work on every school carrying this funder. */
  stop: boolean;
  /** Why, in words that can go on an action item. */
  reason: string | null;
  /** The finding exists but is old enough to want re-checking. */
  stale: boolean;
}

export function viabilityOf(
  funder: FunderViabilityRow | null | undefined,
  asOf: Date = new Date(),
): ViabilityVerdict {
  // No catalogue row, or nobody has asked. Behaves exactly as it does today:
  // the path is screened on its own merits and nothing here withholds it.
  if (!funder || !funder.viability || funder.viability !== 'non_continuing') {
    return { stop: false, reason: null, stale: false };
  }

  const checked = funder.viability_checked_on
    ? new Date(String(funder.viability_checked_on).slice(0, 10) + 'T00:00:00')
    : null;

  const ageDays =
    checked && !Number.isNaN(checked.getTime())
      ? (asOf.getTime() - checked.getTime()) / 86_400_000
      : null;

  const stale = ageDays !== null && ageDays > VIABILITY_RECHECK_DAYS;

  // A stale finding stops withholding work. It does not silently flip to
  // viable either: the caller is told it is stale so the funder goes back into
  // research rather than being treated as open on the strength of an old note.
  if (stale) {
    return {
      stop: false,
      stale: true,
      reason: `Recorded as not continuing on ${funder.viability_checked_on}, which is more than ${VIABILITY_RECHECK_DAYS} days ago. Worth re-checking before any more work goes in.`,
    };
  }

  return {
    stop: true,
    stale: false,
    reason:
      `${funder.name ?? 'This funder'} is recorded as not continuing` +
      (funder.viability_checked_on ? `, established ${funder.viability_checked_on}` : '') +
      `. ${funder.viability_note ?? ''}`.trimEnd() +
      ' This is a decision about the funder, so it holds for every school carrying it.',
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/**
 * The catalogue's viability findings, keyed by funder id.
 *
 * Read once per run. An error is returned rather than swallowed, because an
 * empty map and a failed read mean opposite things: one says every funder is
 * fine, the other says we do not know, and treating the second as the first
 * would quietly resume work on a programme somebody already stopped.
 */
export async function readFunderViability(
  supabase: DbClient,
): Promise<{ byFunderId: Map<string, FunderViabilityRow>; error?: string }> {
  const { data, error } = await supabase
    .from('funders')
    .select('id, name, viability, viability_note, viability_checked_on');

  if (error) return { byFunderId: new Map(), error: error.message };

  const byFunderId = new Map<string, FunderViabilityRow>();
  for (const row of (data ?? []) as FunderViabilityRow[]) {
    byFunderId.set(row.id, row);
  }
  return { byFunderId };
}
