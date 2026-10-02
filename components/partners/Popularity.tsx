'use client';

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { contentSharePct, type EngagementTrend } from '@/lib/partners/popularity';

/**
 * The one way a school sees its own content ranked.
 *
 * Rendering only. Both rules behind it live in lib/partners/popularity, which
 * the API shapes rows with, so what a row means and what a row looks like
 * cannot come apart.
 *
 * Internal surfaces under /tdi-admin are not this. They keep their counts.
 */

const TREND_COPY: Record<Exclude<EngagementTrend, null>, string> = {
  up: 'More people than the 30 days before',
  down: 'Fewer people than the 30 days before',
  flat: 'About the same as the 30 days before',
};

/**
 * The share and the direction, as one right-aligned unit.
 *
 * Renders nothing at all when there is neither. An empty cell is honest about
 * a school we have no reading for; a 0% with a flat arrow is not.
 */
export function PopularityIndicator({
  people,
  active,
  trend,
  size = 'md',
}: {
  /** Distinct people on this item in the last 30 days. */
  people: number;
  /** Distinct people who signed in at all in the last 30 days. */
  active: number;
  trend: EngagementTrend;
  size?: 'sm' | 'md';
}) {
  const pct = contentSharePct(people, active);
  if (pct === null && !trend) return null;

  const Icon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const textSize = size === 'sm' ? 'text-[12px]' : 'text-sm';

  // Up is the house teal. Down and flat stay grey rather than going red: this
  // is a school reading its own dashboard, and a quiet month is not a failure.
  const tone = trend === 'up' ? '#2A9D8F' : '#8A90A2';

  const label = [
    pct === null ? null : `${pct}% of the staff who signed in this month`,
    trend ? TREND_COPY[trend] : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 tabular-nums ${textSize}`}
      title={label}
      aria-label={label}
    >
      {trend && <Icon className={`${iconSize} shrink-0`} style={{ color: tone }} aria-hidden="true" />}
      {pct !== null && (
        <span className="font-semibold" style={{ color: trend === 'up' ? '#1e2749' : '#4A5068' }}>
          {pct}%
        </span>
      )}
    </span>
  );
}

/**
 * What the percentages and the arrows mean, in the client's own words.
 *
 * Required under any list using PopularityIndicator. A bare percentage invites
 * the reader to guess its denominator, and the obvious guess (the whole staff)
 * is the wrong one.
 */
export function PopularityLegend({ showTrend = true }: { showTrend?: boolean }) {
  return (
    <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
      Percentages are a share of the staff who signed in this month.
      {showTrend && ' An arrow compares the last 30 days with the 30 days before.'}
    </p>
  );
}
