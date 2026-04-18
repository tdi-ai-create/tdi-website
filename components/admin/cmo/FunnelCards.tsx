'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WeeklyMetrics, CMO_COLORS, CMOColor } from './types';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';

interface FunnelCardsProps {
  current: WeeklyMetrics | null;
  previous: WeeklyMetrics | null;
}

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr > 0 ? 100 : null;
  return Math.round(((curr - prev) / prev) * 100);
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface CardDef {
  label: string;
  stage: string;
  color: CMOColor;
  getValue: (m: WeeklyMetrics) => number;
  format: (n: number) => string;
  subtitle: string;
}

const cards: CardDef[] = [
  {
    label: 'TikTok Weekly Views',
    stage: 'Attract',
    color: CMO_COLORS.attract,
    getValue: (m) => m.tiktok_views,
    format: formatNumber,
    subtitle: 'Total video views this week',
  },
  {
    label: 'Substack Subscribers',
    stage: 'Warm',
    color: CMO_COLORS.warm,
    getValue: (m) => m.substack_subscribers,
    format: (n) => `${formatNumber(n)} subs`,
    subtitle: 'Total active subscribers',
  },
  {
    label: 'Form Clicks (UTM)',
    stage: 'Convert',
    color: CMO_COLORS.convert,
    getValue: (m) => m.form_clicks,
    format: formatNumber,
    subtitle: 'Tracked link clicks this week',
  },
  {
    label: 'Applications',
    stage: 'Convert',
    color: CMO_COLORS.amber,
    getValue: (m) => m.applications_received,
    format: formatNumber,
    subtitle: 'New applications this week',
  },
];

export function FunnelCards({ current, previous }: FunnelCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const value = current ? card.getValue(current) : 0;
        const prevValue = previous ? card.getValue(previous) : null;
        const change = prevValue !== null ? pctChange(value, prevValue) : null;

        return (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 border border-gray-100"
            style={{
              boxShadow: ADMIN_SHADOWS.card,
              borderLeft: `3px solid ${card.color.accent}`,
            }}
          >
            <div
              className="text-xs font-medium uppercase tracking-wide mb-1"
              style={{ color: card.color.text, fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}
            >
              {card.stage}
            </div>
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: '#111827', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}
            >
              {current ? card.format(value) : '—'}
            </div>
            <div
              className="text-xs mb-2"
              style={{ color: '#6B7280', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}
            >
              {card.label}
            </div>
            {change !== null && (
              <div className="flex items-center gap-1 text-xs">
                {change > 0 ? (
                  <TrendingUp size={12} className="text-green-600" />
                ) : change < 0 ? (
                  <TrendingDown size={12} className="text-red-500" />
                ) : (
                  <Minus size={12} className="text-gray-400" />
                )}
                <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-red-500' : 'text-gray-400'}>
                  {change > 0 ? '+' : ''}{change}% vs last week
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
