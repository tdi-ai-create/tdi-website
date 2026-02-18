'use client';

import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { Target, Award } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

interface SchoolImplementation {
  school: string;
  rate: number;
  sampleSize: number;
}

interface StrategyImplementationProps {
  bySchoolData: SchoolImplementation[];
  overallRate: number | null;
  targetRate: number;
  industryAverage: number;
  isLoading?: boolean;
}

export function StrategyImplementation({
  bySchoolData,
  overallRate,
  targetRate,
  industryAverage,
  isLoading = false,
}: StrategyImplementationProps) {
  if (isLoading) {
    return (
      <ChartCard title="Strategy Implementation Tracking" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (overallRate === null && bySchoolData.length === 0) {
    return (
      <ChartCard title="Strategy Implementation Tracking" subtitle="% of strategies being used">
        <EmptyChart
          title="Implementation tracking will appear once data is collected"
          description="Add implementation surveys at 30/60/90 day marks to track strategy adoption."
          icon="data"
        />
      </ChartCard>
    );
  }

  const displayRate = overallRate || 0;
  const isAtTarget = displayRate >= targetRate;
  const isAboveIndustry = displayRate > industryAverage;

  // Calculate gauge angles
  const gaugeAngle = (displayRate / 100) * 180;
  const targetAngle = (targetRate / 100) * 180;

  return (
    <ChartCard
      title="Strategy Implementation Tracking"
      subtitle="Percentage of taught strategies being implemented"
    >
      <div className="flex flex-col items-center">
        {/* Gauge */}
        <div className="relative w-[200px] h-[100px] overflow-hidden">
          {/* Background arc */}
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 180deg, #E5E7EB 0deg, #E5E7EB 180deg)`,
              borderRadius: '100px 100px 0 0',
            }}
          />

          {/* Industry average indicator */}
          <div
            className="absolute w-1 h-4 bg-red-400"
            style={{
              left: '50%',
              bottom: 0,
              transformOrigin: 'bottom center',
              transform: `rotate(${industryAverage * 1.8 - 90}deg)`,
            }}
          />

          {/* Target indicator */}
          <div
            className="absolute w-1 h-5 bg-green-500"
            style={{
              left: '50%',
              bottom: 0,
              transformOrigin: 'bottom center',
              transform: `rotate(${targetAngle - 90}deg)`,
            }}
          />

          {/* Progress arc */}
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from 180deg, ${isAtTarget ? '#10B981' : theme.primary} 0deg, ${isAtTarget ? '#10B981' : theme.primary} ${gaugeAngle}deg, transparent ${gaugeAngle}deg)`,
              borderRadius: '100px 100px 0 0',
            }}
          />

          {/* Center cover */}
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[140px] h-[70px] bg-white"
            style={{ borderRadius: '70px 70px 0 0' }}
          />

          {/* Value display */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-3xl font-bold" style={{ color: isAtTarget ? '#10B981' : theme.primary }}>
              {displayRate}%
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-red-400" />
            <span className="text-gray-500">Industry Avg ({industryAverage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-green-500" />
            <span className="text-gray-500">TDI Target ({targetRate}%)</span>
          </div>
        </div>

        {/* Status message */}
        <div
          className="mt-4 px-4 py-2 rounded-lg flex items-center gap-2"
          style={{
            backgroundColor: isAtTarget ? '#D1FAE5' : isAboveIndustry ? '#FEF3C7' : '#FEE2E2',
          }}
        >
          {isAtTarget ? (
            <>
              <Award size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Exceeding target! {displayRate - targetRate}% above goal
              </span>
            </>
          ) : isAboveIndustry ? (
            <>
              <Target size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                {targetRate - displayRate}% to reach target
              </span>
            </>
          ) : (
            <>
              <Target size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-700">
                Below industry average - needs attention
              </span>
            </>
          )}
        </div>
      </div>

      {/* By school breakdown */}
      {bySchoolData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">By School</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {bySchoolData.slice(0, 6).map(school => {
              const isSchoolAtTarget = school.rate >= targetRate;
              return (
                <div
                  key={school.school}
                  className="p-2 rounded-lg border"
                  style={{
                    borderColor: isSchoolAtTarget ? '#10B981' : '#E5E7EB',
                    backgroundColor: isSchoolAtTarget ? '#F0FDF4' : 'white',
                  }}
                >
                  <p className="text-xs text-gray-500 truncate">{school.school}</p>
                  <p
                    className="text-lg font-semibold"
                    style={{ color: isSchoolAtTarget ? '#10B981' : '#374151' }}
                  >
                    {school.rate}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison callout */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <span className="font-medium">TDI Impact:</span> Teachers implementing strategies at{' '}
        <span className="font-semibold" style={{ color: theme.primary }}>
          {displayRate > industryAverage
            ? `${Math.round((displayRate / industryAverage) * 10) / 10}x`
            : `${displayRate}%`}
        </span>{' '}
        {displayRate > industryAverage
          ? `the industry average rate (${industryAverage}% typical)`
          : `(industry average: ${industryAverage}%)`
        }
      </div>
    </ChartCard>
  );
}

export default StrategyImplementation;
