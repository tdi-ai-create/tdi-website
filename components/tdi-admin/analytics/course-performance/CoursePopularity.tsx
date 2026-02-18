'use client';

import { ChartCard, EmptyChart, Sparkline } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

interface CoursePopularityData {
  courseId: string;
  courseTitle: string;
  category: string | null;
  totalEnrolled: number;
  active: number;
  completed: number;
  completionRate: number;
  enrollmentTrend: number[];
}

interface CoursePopularityProps {
  data: CoursePopularityData[];
  isLoading?: boolean;
}

export function CoursePopularity({ data, isLoading = false }: CoursePopularityProps) {
  if (isLoading) {
    return (
      <ChartCard title="Course Popularity Rankings" subtitle="Loading...">
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Course Popularity Rankings" subtitle="Most to least enrolled">
        <EmptyChart
          title="No enrollment data"
          description="Course popularity data will appear once users start enrolling."
          icon="chart"
        />
      </ChartCard>
    );
  }

  const maxEnrolled = Math.max(...data.map(d => d.totalEnrolled));

  // Calculate trend direction
  const getTrend = (trend: number[]): 'up' | 'down' | 'stable' => {
    if (trend.length < 2) return 'stable';
    const recent = trend.slice(-3).reduce((a, b) => a + b, 0);
    const earlier = trend.slice(0, 3).reduce((a, b) => a + b, 0);
    if (recent > earlier * 1.2) return 'up';
    if (recent < earlier * 0.8) return 'down';
    return 'stable';
  };

  const exportCSV = () => {
    let csv = 'Rank,Course,Category,Total Enrolled,Active,Completed,Completion Rate\n';
    data.forEach((d, idx) => {
      csv += `${idx + 1},"${d.courseTitle}","${d.category || ''}",${d.totalEnrolled},${d.active},${d.completed},${d.completionRate}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `course-popularity-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Course Popularity Rankings"
      subtitle="Most to least enrolled with 6-month trend"
      onExportCSV={exportCSV}
      minHeight="min-h-[400px]"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 font-medium text-gray-500 w-12">#</th>
              <th className="text-left py-2 px-2 font-medium text-gray-500">Course</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Enrolled</th>
              <th className="text-center py-2 px-2 font-medium text-gray-500 w-24">Progress</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Active</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Completed</th>
              <th className="text-right py-2 px-2 font-medium text-gray-500">Rate</th>
              <th className="text-center py-2 px-2 font-medium text-gray-500 w-24">6mo Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((course, idx) => {
              const isTop3 = idx < 3;
              const isBottom3 = idx >= data.length - 3 && data.length > 5;
              const trend = getTrend(course.enrollmentTrend);
              const barWidth = maxEnrolled > 0 ? (course.totalEnrolled / maxEnrolled) * 100 : 0;

              return (
                <tr
                  key={course.courseId}
                  className="border-b border-gray-50"
                  style={{
                    backgroundColor: isTop3
                      ? 'rgba(16, 185, 129, 0.05)'
                      : isBottom3
                      ? 'rgba(245, 158, 11, 0.05)'
                      : undefined,
                  }}
                >
                  <td className="py-3 px-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: isTop3 ? '#10B981' : isBottom3 ? '#F59E0B' : '#E5E7EB',
                        color: isTop3 || isBottom3 ? 'white' : '#6B7280',
                      }}
                    >
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-gray-800">{course.courseTitle}</p>
                      {course.category && (
                        <p className="text-xs text-gray-400">{course.category}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold" style={{ color: theme.primary }}>
                    {course.totalEnrolled.toLocaleString()}
                  </td>
                  <td className="py-3 px-2">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isTop3 ? '#10B981' : isBottom3 ? '#F59E0B' : theme.primary,
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">{course.active}</td>
                  <td className="py-3 px-2 text-right text-gray-600">{course.completed}</td>
                  <td className="py-3 px-2 text-right font-medium text-gray-700">{course.completionRate}%</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkline
                        data={course.enrollmentTrend}
                        color={trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#9CA3AF'}
                      />
                      {trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                      {trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
                      {trend === 'stable' && <Minus size={12} className="text-gray-400" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Top 3</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Bottom 3</span>
        </div>
      </div>
    </ChartCard>
  );
}

export default CoursePopularity;
