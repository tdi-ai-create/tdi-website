'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface TimeToCompleteData {
  courseId: string;
  courseTitle: string;
  category: string | null;
  avgDays: number;
  medianDays: number;
  fastestDays: number;
  slowestDays: number;
  completionCount: number;
}

interface TimeToCompleteProps {
  data: TimeToCompleteData[];
  isLoading?: boolean;
}

export function TimeToComplete({ data, isLoading = false }: TimeToCompleteProps) {
  if (isLoading) {
    return (
      <ChartCard title="Time to Complete Courses" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Time to Complete Courses" subtitle="Average days to completion">
        <EmptyChart
          title="No completion time data"
          description="Time to complete data will appear once users finish courses."
          icon="chart"
        />
      </ChartCard>
    );
  }

  // Find outlier (significantly longer than median of medians)
  const medianOfMedians = [...data.map(d => d.medianDays)].sort((a, b) => a - b)[Math.floor(data.length / 2)];
  const outlierThreshold = medianOfMedians * 2;

  const chartData = data.map(d => ({
    name: d.courseTitle.substring(0, 25),
    fullName: d.courseTitle,
    median: d.medianDays,
    avg: d.avgDays,
    fastest: d.fastestDays,
    slowest: d.slowestDays,
    count: d.completionCount,
    isOutlier: d.medianDays > outlierThreshold,
    category: d.category,
  }));

  const avgOfMedians = Math.round(data.reduce((sum, d) => sum + d.medianDays, 0) / data.length);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <p className="font-medium text-gray-900 text-sm">{d.fullName}</p>
        {d.category && <p className="text-xs text-gray-500 mb-2">{d.category}</p>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-gray-500">Median:</span>
          <span className="font-medium text-gray-700">{d.median} days</span>
          <span className="text-gray-500">Average:</span>
          <span className="text-gray-700">{d.avg} days</span>
          <span className="text-gray-500">Fastest:</span>
          <span className="text-gray-700">{d.fastest} days</span>
          <span className="text-gray-500">Slowest:</span>
          <span className="text-gray-700">{d.slowest} days</span>
          <span className="text-gray-500">Sample:</span>
          <span className="text-gray-700">{d.count} completions</span>
        </div>
        {d.isOutlier && (
          <p className="mt-2 text-xs text-amber-600 font-medium">
            ⚠️ Takes significantly longer than average
          </p>
        )}
      </div>
    );
  };

  const exportCSV = () => {
    let csv = 'Course,Category,Median Days,Avg Days,Fastest,Slowest,Completions\n';
    data.forEach(d => {
      csv += `"${d.courseTitle}","${d.category || ''}",${d.medianDays},${d.avgDays},${d.fastestDays},${d.slowestDays},${d.completionCount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `time-to-complete-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Time to Complete Courses"
      subtitle="Sorted by median completion time (fastest to longest)"
      onExportCSV={exportCSV}
    >
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v}d`}
              label={{ value: 'Days', position: 'insideRight', offset: -5, fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              x={avgOfMedians}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              label={{ value: `Avg: ${avgOfMedians}d`, position: 'top', fontSize: 10, fill: '#6B7280' }}
            />
            <Bar dataKey="median" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isOutlier ? '#F59E0B' : theme.primary}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.primary }} />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Takes longer than expected</span>
        </div>
      </div>
    </ChartCard>
  );
}

export default TimeToComplete;
