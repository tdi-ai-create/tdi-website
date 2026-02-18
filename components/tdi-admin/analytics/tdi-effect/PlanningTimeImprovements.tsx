'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { TrendingDown } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

interface PlanningTimeData {
  school: string;
  avgBefore: number | null;
  avgAfter: number | null;
  improvement: number | null;
  sampleSizeBefore: number;
  sampleSizeAfter: number;
}

interface OverallPlanningData {
  before: number | null;
  after: number | null;
  target: { min: number; max: number };
}

interface PlanningTimeImprovementsProps {
  bySchoolData: PlanningTimeData[];
  overallData: OverallPlanningData;
  isLoading?: boolean;
}

export function PlanningTimeImprovements({
  bySchoolData,
  overallData,
  isLoading = false,
}: PlanningTimeImprovementsProps) {
  if (isLoading) {
    return (
      <ChartCard title="Planning Time Improvements" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  const hasData = bySchoolData.some(d => d.avgBefore !== null || d.avgAfter !== null);

  if (!hasData) {
    return (
      <ChartCard title="Planning Time Improvements" subtitle="Before vs after TDI">
        <EmptyChart
          title="Planning time data will appear once surveys are collected"
          description="Add intake and follow-up surveys to track planning time reductions."
          icon="data"
        />
      </ChartCard>
    );
  }

  // Prepare chart data - only include schools with before AND after data
  const chartData = bySchoolData
    .filter(d => d.avgBefore !== null && d.avgAfter !== null)
    .map(d => ({
      school: d.school.substring(0, 15),
      fullSchool: d.school,
      before: d.avgBefore!,
      after: d.avgAfter!,
      improvement: d.improvement || 0,
    }))
    .slice(0, 10);

  // Add overall data
  if (overallData.before !== null && overallData.after !== null) {
    chartData.unshift({
      school: 'OVERALL',
      fullSchool: 'Overall Average',
      before: overallData.before,
      after: overallData.after,
      improvement: overallData.before - overallData.after,
    });
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { fullSchool: string; improvement: number } }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <p className="font-medium text-gray-900 text-sm mb-2">{d.fullSchool}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.name === 'before' ? '#EF4444' : '#10B981' }}
            />
            <span className="text-gray-600">{entry.name === 'before' ? 'Before TDI' : 'After TDI'}:</span>
            <span className="font-medium text-gray-800">{entry.value} hrs/week</span>
          </div>
        ))}
        {d.improvement > 0 && (
          <p className="text-xs text-green-600 mt-2 font-medium">
            ↓ {d.improvement.toFixed(1)} hours saved per week
          </p>
        )}
      </div>
    );
  };

  const exportCSV = () => {
    let csv = 'School,Before (hrs/week),After (hrs/week),Improvement,Sample Before,Sample After\n';
    bySchoolData.forEach(d => {
      csv += `"${d.school}",${d.avgBefore || ''},${d.avgAfter || ''},${d.improvement || ''},${d.sampleSizeBefore},${d.sampleSizeAfter}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `planning-time-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Planning Time Improvements"
      subtitle={`Target: ${overallData.target.min}-${overallData.target.max} hours/week`}
      onExportCSV={exportCSV}
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="school" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: 'Hours/Week', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />

            {/* Target range */}
            <ReferenceLine
              y={overallData.target.max}
              stroke="#10B981"
              strokeDasharray="3 3"
            />

            <Bar dataKey="before" name="before" fill="#FCA5A5" radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="after" name="after" radius={[4, 4, 0, 0]} maxBarSize={30}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.after <= overallData.target.max ? '#10B981' : '#FBBF24'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-200" />
            <span className="text-gray-500">Before TDI</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-500">After TDI (on target)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-gray-500">After TDI (improving)</span>
          </div>
        </div>

        {overallData.before && overallData.after && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: '#D1FAE5' }}
          >
            <TrendingDown size={14} className="text-green-600" />
            <span className="text-xs font-medium text-green-700">
              {(overallData.before - overallData.after).toFixed(1)} hrs/week saved overall
            </span>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

export default PlanningTimeImprovements;
