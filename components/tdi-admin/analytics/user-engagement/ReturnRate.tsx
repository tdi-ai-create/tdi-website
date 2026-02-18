'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface ReturnRateData {
  week: string;
  returningUsers: number;
  returningPct: number;
  newEnrollments: number;
}

interface ReturnRateProps {
  data: ReturnRateData[];
  totalUsers: number;
  isLoading?: boolean;
}

export function ReturnRate({
  data,
  totalUsers,
  isLoading = false,
}: ReturnRateProps) {
  if (isLoading) {
    return (
      <ChartCard title="Return Rate Over Time" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Return Rate Over Time" subtitle="Weekly returning users">
        <EmptyChart
          title="No return rate data"
          description="Return rate data will appear once users have been active over multiple weeks."
          icon="chart"
        />
      </ChartCard>
    );
  }

  // Format week labels
  const chartData = data.map(d => ({
    ...d,
    weekLabel: new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Calculate averages
  const avgReturning = Math.round(data.reduce((sum, d) => sum + d.returningUsers, 0) / data.length);
  const avgNewEnrollments = Math.round(data.reduce((sum, d) => sum + d.newEnrollments, 0) / data.length);

  // Recent trend
  const recentWeeks = data.slice(-4);
  const olderWeeks = data.slice(0, Math.max(data.length - 4, 1));
  const recentAvg = recentWeeks.reduce((sum, d) => sum + d.returningUsers, 0) / recentWeeks.length;
  const olderAvg = olderWeeks.reduce((sum, d) => sum + d.returningUsers, 0) / olderWeeks.length;
  const trendUp = recentAvg > olderAvg;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <p className="font-medium text-gray-900 text-sm mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-800">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const exportCSV = () => {
    let csv = 'Week,Returning Users,Returning %,New Enrollments\n';
    data.forEach(d => {
      csv += `${d.week},${d.returningUsers},${d.returningPct}%,${d.newEnrollments}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `return-rate-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Return Rate Over Time"
      subtitle="Users active 2+ days per week vs new enrollments"
      onExportCSV={exportCSV}
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 11 }}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }} />
            <Line
              type="monotone"
              dataKey="returningUsers"
              name="Returning Users"
              stroke={theme.primary}
              strokeWidth={2}
              dot={{ r: 3, fill: theme.primary }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="newEnrollments"
              name="New Enrollments"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#8B5CF6' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${theme.primary}10` }}>
          <p className="text-xs text-gray-500 mb-1">Avg Returning/Week</p>
          <p className="text-lg font-semibold" style={{ color: theme.primary }}>
            {avgReturning}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-purple-50">
          <p className="text-xs text-gray-500 mb-1">Avg New Enrollments</p>
          <p className="text-lg font-semibold text-purple-600">{avgNewEnrollments}</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-500 mb-1">Recent Trend</p>
          <p className={`text-lg font-semibold ${trendUp ? 'text-green-600' : 'text-amber-600'}`}>
            {trendUp ? '↑ Growing' : '↓ Declining'}
          </p>
        </div>
      </div>
    </ChartCard>
  );
}

export default ReturnRate;
