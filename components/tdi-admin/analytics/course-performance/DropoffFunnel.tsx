'use client';

import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { AlertTriangle } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  isDropoff?: boolean;
}

interface DropoffFunnelProps {
  data: FunnelStage[];
  courses: { id: string; title: string }[];
  selectedCourseId: string | null;
  onCourseChange: (courseId: string) => void;
  isLoading?: boolean;
}

export function DropoffFunnel({
  data,
  courses,
  selectedCourseId,
  onCourseChange,
  isLoading = false,
}: DropoffFunnelProps) {
  if (isLoading) {
    return (
      <ChartCard title="Course Drop-off Analysis" subtitle="Loading...">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Course Drop-off Analysis" subtitle="Where learners stop in each course">
        <div className="mb-4">
          <select
            value={selectedCourseId || ''}
            onChange={(e) => onCourseChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <EmptyChart
          title="No progress data"
          description="Drop-off analysis requires lesson-level progress tracking data."
          icon="chart"
        />
      </ChartCard>
    );
  }

  // Find the biggest drop-off
  const dropoffStage = data.find(d => d.isDropoff);
  const dropoffIndex = dropoffStage ? data.indexOf(dropoffStage) : -1;
  const dropoffAmount = dropoffIndex > 0 ? data[dropoffIndex - 1].count - dropoffStage!.count : 0;
  const dropoffPercent = dropoffIndex > 0 && data[dropoffIndex - 1].count > 0
    ? Math.round((dropoffAmount / data[dropoffIndex - 1].count) * 100)
    : 0;

  const maxCount = data[0]?.count || 1;

  const exportCSV = () => {
    let csv = 'Stage,Count,Percentage of Total\n';
    data.forEach(d => {
      csv += `"${d.stage}",${d.count},${d.percentage}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dropoff-funnel-${selectedCourse?.title.replace(/\s+/g, '-').toLowerCase() || 'course'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Course Drop-off Analysis"
      subtitle={`Funnel for: ${selectedCourse?.title || 'Select a course'}`}
      onExportCSV={exportCSV}
      minHeight="min-h-[400px]"
    >
      <div className="mb-4">
        <select
          value={selectedCourseId || ''}
          onChange={(e) => onCourseChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Funnel visualization */}
      <div className="space-y-1">
        {data.map((stage, idx) => {
          const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const prevCount = idx > 0 ? data[idx - 1].count : stage.count;
          const dropoff = idx > 0 ? prevCount - stage.count : 0;
          const dropoffPct = prevCount > 0 ? Math.round((dropoff / prevCount) * 100) : 0;

          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-center gap-3">
                {/* Funnel bar */}
                <div className="flex-1 relative">
                  <div
                    className="h-10 rounded-lg flex items-center px-3 transition-all duration-300"
                    style={{
                      width: `${Math.max(width, 10)}%`,
                      backgroundColor: stage.isDropoff
                        ? '#FEE2E2'
                        : `${theme.primary}${Math.round(15 + (width / 100) * 85).toString(16).padStart(2, '0')}`,
                      borderLeft: stage.isDropoff ? '3px solid #EF4444' : `3px solid ${theme.primary}`,
                    }}
                  >
                    <span
                      className="text-sm font-medium truncate"
                      style={{
                        color: stage.isDropoff ? '#DC2626' : theme.dark,
                      }}
                    >
                      {stage.stage}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="w-32 flex items-center gap-2">
                  <span className="font-semibold text-gray-800 w-12 text-right">{stage.count}</span>
                  <span
                    className="text-sm px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: stage.isDropoff ? '#FEE2E2' : `${theme.primary}15`,
                      color: stage.isDropoff ? '#DC2626' : theme.primary,
                    }}
                  >
                    {stage.percentage}%
                  </span>
                </div>

                {/* Drop indicator */}
                {idx > 0 && dropoffPct > 0 && (
                  <div className="w-20 flex items-center gap-1 text-xs text-gray-400">
                    <span>↓</span>
                    <span className={dropoffPct > 30 ? 'text-red-500 font-medium' : ''}>
                      -{dropoffPct}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert for biggest drop-off */}
      {dropoffStage && dropoffPercent > 20 && (
        <div
          className="mt-6 p-4 rounded-lg flex items-start gap-3"
          style={{ backgroundColor: '#FEF3C7' }}
        >
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Significant drop-off detected
            </p>
            <p className="text-sm text-amber-700 mt-1">
              {dropoffPercent}% of learners ({dropoffAmount} users) stopped at "{dropoffStage.stage}".
              Consider reviewing the content difficulty or engagement at this point.
            </p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}

export default DropoffFunnel;
