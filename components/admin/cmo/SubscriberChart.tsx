'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { SubscriberSource } from './types';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';

interface SubscriberChartProps {
  data: SubscriberSource[];
}

const SOURCE_COLORS: Record<string, string> = {
  direct: '#00B5AD',
  substack_network: '#8B5CF6',
  search: '#F59E0B',
  social: '#F96767',
  email: '#6366F1',
  import: '#9CA3AF',
};

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct / Import',
  substack_network: 'Substack Network',
  search: 'Search',
  social: 'Social',
  email: 'Email',
  import: 'Import',
};

interface ChartRow {
  month: string;
  [source: string]: string | number;
}

function transformData(data: SubscriberSource[]): ChartRow[] {
  const byMonth = new Map<string, ChartRow>();
  for (const d of data) {
    const label = new Date(d.month + 'T00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!byMonth.has(d.month)) byMonth.set(d.month, { month: label });
    const row = byMonth.get(d.month)!;
    row[d.source] = d.count;
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, row]) => row);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm">
      <div className="font-medium text-gray-900 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-gray-600">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {SOURCE_LABELS[p.name] || p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export function SubscriberChart({ data }: SubscriberChartProps) {
  const chartData = transformData(data);
  const sources = [...new Set(data.map((d) => d.source))];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: ADMIN_SHADOWS.card }}>
      <h3 className="text-base font-semibold mb-1" style={{ color: '#2B3A67', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
        Subscriber Sources
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
        Monthly breakdown by acquisition channel
      </p>

      {chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">No subscriber source data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => SOURCE_LABELS[value] || value}
              wrapperStyle={{ fontSize: 12 }}
            />
            {sources.map((source) => (
              <Bar key={source} dataKey={source} stackId="a" fill={SOURCE_COLORS[source] || '#D1D5DB'} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
