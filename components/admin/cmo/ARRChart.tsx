'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PaidARR } from './types';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';

interface ARRChartProps {
  data: PaidARR[];
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface ChartRow {
  month: string;
  arr: number;
  arrDisplay: string;
}

function transformData(data: PaidARR[]): ChartRow[] {
  return data
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((d) => ({
      month: new Date(d.month + 'T00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      arr: d.arr_cents,
      arrDisplay: formatCurrency(d.arr_cents),
    }));
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-sm">
      <div className="font-medium text-gray-900 mb-1">{label}</div>
      <div className="text-gray-600">ARR: {formatCurrency(payload[0].value)}</div>
    </div>
  );
};

export function ARRChart({ data }: ARRChartProps) {
  const chartData = transformData(data);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: ADMIN_SHADOWS.card }}>
      <h3 className="text-base font-semibold mb-1" style={{ color: '#2B3A67', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
        Paid ARR Growth
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
        Monthly annualized recurring revenue from paid subscribers
      </p>

      {chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">No ARR data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(v: number) => formatCurrency(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="arr" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
