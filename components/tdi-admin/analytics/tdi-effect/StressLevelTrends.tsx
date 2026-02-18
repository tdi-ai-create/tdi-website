'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface StressTrendData {
  month: string;
  avgStress: number;
  sampleSize: number;
}

interface SchoolStressData {
  school: string;
  data: { month: string; avgStress: number }[];
}

interface StressLevelTrendsProps {
  overallData: StressTrendData[];
  bySchoolData: SchoolStressData[];
  avgInitialStress: number | null;
  targetRange: { min: number; max: number };
  isLoading?: boolean;
}

const SCHOOL_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6'];

export function StressLevelTrends({
  overallData,
  bySchoolData,
  avgInitialStress,
  targetRange,
  isLoading = false,
}: StressLevelTrendsProps) {
  const [viewMode, setViewMode] = useState<'overall' | 'bySchool'>('overall');

  if (isLoading) {
    return (
      <ChartCard title="Stress Level Changes Over Time" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if ((!overallData || overallData.length === 0) && (!bySchoolData || bySchoolData.length === 0)) {
    return (
      <ChartCard title="Stress Level Changes Over Time" subtitle="Monthly stress level trends">
        <EmptyChart
          title="Stress tracking will appear once survey data is collected"
          description="Add pre/post stress surveys to track teacher wellness improvements over time."
          icon="data"
        />
      </ChartCard>
    );
  }

  // Format month labels
  const chartData = overallData.map(d => ({
    ...d,
    monthLabel: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));

  // Calculate current average
  const currentAvg = overallData.length > 0
    ? overallData[overallData.length - 1].avgStress
    : null;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { sampleSize?: number } }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <p className="font-medium text-gray-900 text-sm mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-800">{entry.value}/10</span>
          </div>
        ))}
        {payload[0]?.payload?.sampleSize && (
          <p className="text-xs text-gray-400 mt-1">
            Sample size: {payload[0].payload.sampleSize}
          </p>
        )}
      </div>
    );
  };

  const exportCSV = () => {
    let csv = 'Month,Average Stress,Sample Size\n';
    overallData.forEach(d => {
      csv += `${d.month},${d.avgStress},${d.sampleSize}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stress-trends-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Stress Level Changes Over Time"
      subtitle="Tracking teacher stress reduction (lower is better)"
      onExportCSV={exportCSV}
    >
      {/* Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('overall')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            viewMode === 'overall' ? '' : 'text-gray-500 hover:bg-gray-100'
          }`}
          style={viewMode === 'overall' ? { backgroundColor: `${theme.primary}15`, color: theme.primary } : undefined}
        >
          Overall
        </button>
        <button
          onClick={() => setViewMode('bySchool')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            viewMode === 'bySchool' ? '' : 'text-gray-500 hover:bg-gray-100'
          }`}
          style={viewMode === 'bySchool' ? { backgroundColor: `${theme.primary}15`, color: theme.primary } : undefined}
        >
          By School
        </button>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={viewMode === 'overall' ? chartData : undefined}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 11 }}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />

            {/* Target range (green band) */}
            <ReferenceArea
              y1={targetRange.min}
              y2={targetRange.max}
              fill="#10B981"
              fillOpacity={0.1}
              label={{ value: 'Target', position: 'right', fontSize: 10, fill: '#10B981' }}
            />

            {/* Initial stress baseline (red line) */}
            {avgInitialStress && (
              <ReferenceLine
                y={avgInitialStress}
                stroke="#EF4444"
                strokeDasharray="5 5"
                label={{ value: `Initial: ${avgInitialStress}`, position: 'left', fontSize: 10, fill: '#EF4444' }}
              />
            )}

            {viewMode === 'overall' ? (
              <Line
                type="monotone"
                dataKey="avgStress"
                name="Avg Stress"
                stroke={theme.primary}
                strokeWidth={2}
                dot={{ r: 4, fill: theme.primary }}
                activeDot={{ r: 6 }}
              />
            ) : (
              bySchoolData.slice(0, 6).map((school, idx) => (
                <Line
                  key={school.school}
                  type="monotone"
                  data={school.data.map(d => ({
                    monthLabel: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    avgStress: d.avgStress,
                  }))}
                  dataKey="avgStress"
                  name={school.school.substring(0, 20)}
                  stroke={SCHOOL_COLORS[idx % SCHOOL_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span className="text-gray-500">Target Range ({targetRange.min}-{targetRange.max})</span>
          </div>
          {avgInitialStress && (
            <div className="flex items-center gap-1">
              <div className="w-6 h-0 border-t-2 border-dashed border-red-400" />
              <span className="text-gray-500">Initial Avg ({avgInitialStress})</span>
            </div>
          )}
        </div>

        {currentAvg && avgInitialStress && (
          <div
            className="px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: currentAvg < avgInitialStress ? '#D1FAE5' : '#FEE2E2' }}
          >
            <span className={currentAvg < avgInitialStress ? 'text-green-700' : 'text-red-700'}>
              {currentAvg < avgInitialStress
                ? `↓ ${(avgInitialStress - currentAvg).toFixed(1)} point improvement`
                : `↑ ${(currentAvg - avgInitialStress).toFixed(1)} point increase`
              }
            </span>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default StressLevelTrends;
