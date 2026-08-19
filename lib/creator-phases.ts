// ---------------------------------------------------------------------------
// The order the Creator Studio phases actually run in.
//
// This existed in four places and two of them were wrong. Both copies inside
// the portal routes left out marketing_blog, so comparing a marketing blog step
// against anything produced NaN, the sort silently gave up, and which step a
// returning creator landed on came down to whatever order Postgres happened to
// return rows in.
//
// One definition, imported everywhere, so it cannot drift again.
// ---------------------------------------------------------------------------

export const PHASE_ORDER = [
  'onboarding',
  'agreement',
  'course_design',
  'test_prep',
  'production',
  'marketing_blog',
  'launch',
] as const;

export type PhaseName = (typeof PHASE_ORDER)[number];

/**
 * Rank of a phase. Unknown phases sort last rather than producing NaN, so a
 * phase added to the database without being added here degrades to "goes at the
 * end" instead of corrupting the whole ordering.
 */
export function phaseRank(phaseId: string | null | undefined): number {
  const i = (PHASE_ORDER as readonly string[]).indexOf(phaseId ?? '');
  return i === -1 ? PHASE_ORDER.length : i;
}

/**
 * Sort comparator for anything carrying a phase_id and a sort_order.
 */
export function byPhaseThenOrder(
  a: { phase_id?: string | null; sort_order?: number | null },
  b: { phase_id?: string | null; sort_order?: number | null }
): number {
  const phase = phaseRank(a.phase_id) - phaseRank(b.phase_id);
  if (phase !== 0) return phase;
  return (a.sort_order ?? 0) - (b.sort_order ?? 0);
}
