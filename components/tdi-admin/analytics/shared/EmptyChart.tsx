'use client';

import { BarChart2, AlertCircle, Database } from 'lucide-react';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface EmptyChartProps {
  title: string;
  description: string;
  icon?: 'chart' | 'alert' | 'data';
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyChart({
  title,
  description,
  icon = 'chart',
  actionLabel,
  onAction,
}: EmptyChartProps) {
  const Icon = icon === 'alert' ? AlertCircle : icon === 'data' ? Database : BarChart2;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${theme.primary}10` }}
      >
        <Icon size={24} style={{ color: theme.primary }} />
      </div>
      <h4
        className="font-medium mb-1"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#2B3A67',
        }}
      >
        {title}
      </h4>
      <p
        className="text-sm text-gray-500 max-w-xs mb-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
          style={{
            backgroundColor: `${theme.primary}15`,
            color: theme.primary,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyChart;
