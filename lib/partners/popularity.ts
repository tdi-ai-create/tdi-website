/**
 * How popular a piece of content is, for a client's eyes.
 *
 * Rae, 2 October 2026: a leadership dashboard does not need to say how many
 * people. It needs to say that something is catching on. A share and a
 * direction do that. "8 people" also quietly publishes a headcount, and in a
 * small building it comes close to publishing the people.
 *
 * Pure, and the single definition of both rules. The API shapes rows with it,
 * the dashboard renders with it, and a check script can exercise it against
 * real rows without standing up Next. The district list and the per school list
 * printed two different things for two days because each was written where it
 * was needed instead of once.
 *
 * Internal surfaces under /tdi-admin are not this. They keep their counts.
 */

/**
 * Which way an item is moving: distinct people in the last 30 days against the
 * 30 days before that.
 *
 * null means we decline to claim a direction.
 */
export type EngagementTrend = 'up' | 'down' | 'flat' | null;

/**
 * One part of a population as a whole percent, for every figure a school sees
 * about itself.
 *
 * null when there is no denominator to divide by, so a caller can render an
 * absent reading rather than a confident zero. Clamped to 100 because a roster
 * can shrink underneath a window, and floored at 1 for any real activity at
 * all: a person who did the thing should never read as "0%".
 */
export function sharePct(part: number, whole: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole <= 0) return null;
  if (part <= 0) return 0;
  return Math.max(1, Math.min(100, Math.round((part / whole) * 100)));
}

/**
 * The direction for one item.
 *
 * `truncated` is not a detail. The activity read comes back newest first, so a
 * capped read loses the older half of the comparison and every item on the
 * board would point up. We say nothing rather than say something flattering.
 */
export function engagementTrend(
  recent: number,
  prior: number,
  truncated: boolean,
): EngagementTrend {
  if (truncated) return null;
  if (recent === 0 && prior === 0) return null;
  if (recent > prior) return 'up';
  if (recent < prior) return 'down';
  return 'flat';
}

/**
 * Below this many active people, a share stops being a measurement and starts
 * being a person.
 *
 * The same floor and the same reason as VIBE_MIN_PEOPLE on the dashboard route.
 * Tidioute has two staff: one of them opening a tool renders as "100%", which
 * tells its leader exactly who did it. Switching headcounts to percentages does
 * not fix that on its own, because the arithmetic is reversible when the
 * denominator is small enough to hold in your head.
 */
export const MIN_SHARE_POPULATION = 3;

/**
 * The share to print beside a piece of content, or null to print none.
 *
 * sharePct with the small-school floor applied. Content lists use this. The
 * activity tiles do not: those are a share of the whole roster, and a leader
 * reading them already sees their staff named one by one further down the page.
 */
export function contentSharePct(people: number, active: number): number | null {
  if (!Number.isFinite(active) || active < MIN_SHARE_POPULATION) return null;
  return sharePct(people, active);
}

/**
 * The share of a team that has NOT done something, as a whole percent.
 *
 * Reports kept printing "6 educators have not yet logged in", which is a
 * headcount of people arrived at by subtraction, and in a small school it names
 * them. Derived from the activation percentage rather than from two counts, so
 * it can never disagree with the figure printed beside it.
 */
export function remainderPct(activePct: number): number {
  if (!Number.isFinite(activePct)) return 0;
  return Math.max(0, Math.min(100, 100 - Math.round(activePct)));
}

/**
 * A day on which an organised event happened, rather than ordinary use.
 *
 * Rae, 2 October 2026, from Addison. Its dashboard pointed down on six of eight
 * rows the day this shipped, and the school was in fact climbing: 6, 1, 13 and
 * 19 people over the four most recent weeks. The arrow was comparing the last
 * 30 days against the 30 before, and that earlier window held both of Addison's
 * August in-service days, 27 people on one and 28 on another against an
 * ordinary day of one or two.
 *
 * This is not an Addison problem. Every school on a US calendar has the same
 * shape, so in early October every prior window is August and every dashboard
 * would point down exactly when schools are ramping up. A trend that is
 * reliably backwards for two months of the year is worse than no trend.
 *
 * A spike is a day that towers over the window's ordinary days. Both the
 * multiple and the floor matter: without the floor, two people on a two person
 * roster reads as an event.
 */
export function hasSpikeDay(dailyPeopleCounts: number[]): boolean {
  const active = dailyPeopleCounts.filter(n => n > 0).sort((a, b) => a - b);
  if (active.length < 2) return false;
  const max = active[active.length - 1];
  const median = active[Math.floor(active.length / 2)];
  return max >= 5 && max >= 4 * Math.max(1, median);
}

/**
 * Whether two windows can honestly be compared.
 *
 * A spike in EITHER half breaks it. An in-service day in the older half
 * manufactures a decline, and one in the newer half manufactures a rise.
 */
export function windowsAreComparable(recentDaily: number[], priorDaily: number[]): boolean {
  return !hasSpikeDay(recentDaily) && !hasSpikeDay(priorDaily);
}
