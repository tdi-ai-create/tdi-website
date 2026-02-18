'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showDots?: boolean;
}

export function Sparkline({
  data,
  color = theme.primary,
  height = 24,
  width = 80,
  showDots = false,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-300"
        style={{ width, height }}
      >
        —
      </div>
    );
  }

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={showDots}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Sparkline;
