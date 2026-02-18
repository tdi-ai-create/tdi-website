'use client';

import { useState } from 'react';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { ChevronDown, ChevronRight } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

interface PartnershipEngagement {
  school: string;
  totalStaff: number;
  enrolled: number;
  active7d: number;
  coursesStarted: number;
  coursesCompleted: number;
  avgCompletionRate: number;
  phase?: string;
}

interface EngagementByPartnershipProps {
  data: PartnershipEngagement[];
  isLoading?: boolean;
}

const getCompletionRateColor = (rate: number): string => {
  if (rate >= 60) return '#10B981'; // green
  if (rate >= 30) return '#3B82F6'; // blue
  if (rate >= 10) return '#F59E0B'; // amber
  return '#EF4444'; // red
};

const getCompletionRateBg = (rate: number): string => {
  if (rate >= 60) return 'rgba(16, 185, 129, 0.08)';
  if (rate >= 30) return 'rgba(59, 130, 246, 0.08)';
  if (rate >= 10) return 'rgba(245, 158, 11, 0.08)';
  return 'rgba(239, 68, 68, 0.08)';
};

export function EngagementByPartnership({
  data,
  isLoading = false,
}: EngagementByPartnershipProps) {
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <ChartCard title="Engagement by Partnership Group" subtitle="Loading...">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="Engagement by Partnership Group" subtitle="Metrics by school">
        <EmptyChart
          title="No partnership data"
          description="Partnership engagement data will appear once schools are enrolled."
          icon="data"
        />
      </ChartCard>
    );
  }

  const toggleExpand = (school: string) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(school)) {
      newExpanded.delete(school);
    } else {
      newExpanded.add(school);
    }
    setExpandedSchools(newExpanded);
  };

  const exportCSV = () => {
    let csv = 'School,Phase,Total Staff,Enrolled,Active (7d),Courses Started,Courses Completed,Avg Completion Rate\n';
    data.forEach(row => {
      csv += `"${row.school}","${row.phase || ''}",${row.totalStaff},${row.enrolled},${row.active7d},${row.coursesStarted},${row.coursesCompleted},${row.avgCompletionRate}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `engagement-by-partnership-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <ChartCard
      title="Engagement by Partnership Group"
      subtitle="Sorted by completion rate"
      onExportCSV={exportCSV}
      minHeight="min-h-[400px]"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-3 font-medium text-gray-500 w-8"></th>
              <th className="text-left py-3 px-3 font-medium text-gray-500">School</th>
              <th className="text-center py-3 px-3 font-medium text-gray-500">Phase</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Staff</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Enrolled</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Active (7d)</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Started</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Completed</th>
              <th className="text-right py-3 px-3 font-medium text-gray-500">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const isExpanded = expandedSchools.has(row.school);
              const rateColor = getCompletionRateColor(row.avgCompletionRate);
              const rateBg = getCompletionRateBg(row.avgCompletionRate);

              return (
                <tr
                  key={row.school}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  style={{ backgroundColor: rateBg }}
                  onClick={() => toggleExpand(row.school)}
                >
                  <td className="py-3 px-3">
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-400" />
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-gray-800">{row.school}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.phase && (
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor:
                            row.phase === 'IGNITE'
                              ? '#FEF3C7'
                              : row.phase === 'ACCELERATE'
                              ? '#DBEAFE'
                              : row.phase === 'SUSTAIN'
                              ? '#D1FAE5'
                              : '#F3F4F6',
                          color:
                            row.phase === 'IGNITE'
                              ? '#92400E'
                              : row.phase === 'ACCELERATE'
                              ? '#1E40AF'
                              : row.phase === 'SUSTAIN'
                              ? '#065F46'
                              : '#374151',
                        }}
                      >
                        {row.phase}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600">{row.totalStaff}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{row.enrolled}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-medium ${
                        row.active7d > 0 ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {row.active7d}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-600">{row.coursesStarted}</td>
                  <td className="py-3 px-3 text-right text-gray-600">{row.coursesCompleted}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: rateColor, color: 'white' }}
                    >
                      {row.avgCompletionRate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="font-medium">Completion Rate:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>&gt;60%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>30-60%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>10-30%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>&lt;10%</span>
        </div>
      </div>
    </ChartCard>
  );
}

export default EngagementByPartnership;
