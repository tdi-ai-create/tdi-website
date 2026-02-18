'use client';

import { useState } from 'react';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { FileText, TrendingDown, TrendingUp, Minus, Building2 } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

interface MetricChange {
  before: number | null;
  after: number | null;
}

interface SchoolImpact {
  partnershipId: string;
  school: string;
  phase: string;
  startDate: string;
  metrics: {
    stress: MetricChange;
    planningHours: MetricChange;
    implementationRate: MetricChange;
  };
  hasSurveyData: boolean;
  surveyCount: number;
}

interface SchoolImpactCardsProps {
  data: SchoolImpact[];
  isLoading?: boolean;
  onExportPDF?: (school: SchoolImpact) => void;
}

const PHASE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  IGNITE: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  ACCELERATE: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  SUSTAIN: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
};

function MetricDelta({
  before,
  after,
  label,
  lowerIsBetter = false,
  unit = '',
}: {
  before: number | null;
  after: number | null;
  label: string;
  lowerIsBetter?: boolean;
  unit?: string;
}) {
  if (before === null && after === null) {
    return (
      <div className="text-center p-2">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-300">No data</p>
      </div>
    );
  }

  const hasChange = before !== null && after !== null;
  const delta = hasChange ? after! - before! : 0;
  const isImproved = lowerIsBetter ? delta < 0 : delta > 0;
  const isWorsened = lowerIsBetter ? delta > 0 : delta < 0;

  return (
    <div className="text-center p-2">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {before !== null && (
          <span className="text-sm text-gray-400 line-through">{before}{unit}</span>
        )}
        {hasChange && (
          <>
            <span className="text-gray-300">→</span>
            <span
              className="text-sm font-semibold"
              style={{ color: isImproved ? '#10B981' : isWorsened ? '#EF4444' : '#6B7280' }}
            >
              {after}{unit}
            </span>
          </>
        )}
        {!hasChange && after !== null && (
          <span className="text-sm font-medium text-gray-700">{after}{unit}</span>
        )}
      </div>
      {hasChange && (
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {isImproved ? (
            <TrendingDown size={10} className="text-green-500" />
          ) : isWorsened ? (
            <TrendingUp size={10} className="text-red-500" />
          ) : (
            <Minus size={10} className="text-gray-400" />
          )}
          <span
            className="text-xs"
            style={{ color: isImproved ? '#10B981' : isWorsened ? '#EF4444' : '#6B7280' }}
          >
            {Math.abs(delta).toFixed(1)}{unit}
          </span>
        </div>
      )}
    </div>
  );
}

export function SchoolImpactCards({
  data,
  isLoading = false,
  onExportPDF,
}: SchoolImpactCardsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  if (isLoading) {
    return (
      <ChartCard title="School Impact Overview" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartCard title="School Impact Overview" subtitle="Before/after comparisons per school">
        <EmptyChart
          title="No school data yet"
          description="School impact cards will appear once partnerships have survey data."
          icon="data"
        />
      </ChartCard>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <ChartCard
      title="School Impact Overview"
      subtitle="Before/after comparisons per partner school"
      minHeight="min-h-[400px]"
    >
      <div className="grid md:grid-cols-2 gap-4">
        {data.slice(0, 8).map(school => {
          const phaseStyle = PHASE_STYLES[school.phase] || { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' };
          const isExpanded = expandedCard === school.partnershipId;

          return (
            <div
              key={school.partnershipId}
              className="border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md"
              style={{ borderColor: phaseStyle.border, borderWidth: 2 }}
              onClick={() => setExpandedCard(isExpanded ? null : school.partnershipId)}
            >
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: phaseStyle.bg }}
              >
                <div className="flex items-center gap-2">
                  <Building2 size={16} style={{ color: phaseStyle.text }} />
                  <div>
                    <h4
                      className="font-semibold text-sm"
                      style={{ color: phaseStyle.text }}
                    >
                      {school.school}
                    </h4>
                    <p className="text-xs" style={{ color: phaseStyle.text, opacity: 0.7 }}>
                      Since {formatDate(school.startDate)}
                    </p>
                  </div>
                </div>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ backgroundColor: 'white', color: phaseStyle.text }}
                >
                  {school.phase || 'N/A'}
                </span>
              </div>

              {/* Metrics */}
              <div className="px-4 py-3 bg-white">
                {school.hasSurveyData ? (
                  <div className="grid grid-cols-3 gap-2">
                    <MetricDelta
                      before={school.metrics.stress.before}
                      after={school.metrics.stress.after}
                      label="Stress"
                      lowerIsBetter
                      unit="/10"
                    />
                    <MetricDelta
                      before={school.metrics.planningHours.before}
                      after={school.metrics.planningHours.after}
                      label="Planning"
                      lowerIsBetter
                      unit="h"
                    />
                    <MetricDelta
                      before={school.metrics.implementationRate.before}
                      after={school.metrics.implementationRate.after}
                      label="Implementation"
                      unit="%"
                    />
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-400">
                    <p>Survey data pending</p>
                    <p className="text-xs mt-1">Add pre/post surveys to track impact</p>
                  </div>
                )}

                {/* Survey count */}
                {school.surveyCount > 0 && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Based on {school.surveyCount} survey responses
                  </p>
                )}
              </div>

              {/* Export button (when expanded) */}
              {isExpanded && school.hasSurveyData && onExportPDF && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportPDF(school);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all"
                    style={{
                      backgroundColor: theme.primary,
                      color: 'white',
                    }}
                  >
                    <FileText size={14} />
                    <span className="text-sm font-medium">Export Impact Report</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data.length > 8 && (
        <p className="text-center text-sm text-gray-400 mt-4">
          +{data.length - 8} more schools
        </p>
      )}
    </ChartCard>
  );
}

export default SchoolImpactCards;
