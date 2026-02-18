'use client';

import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface HeatmapData {
  data: Record<number, Record<number, number>>;
  peakTime: {
    day: string;
    hour: string;
    count: number;
  };
}

interface PeakUsageHeatmapProps {
  heatmapData: HeatmapData;
  isLoading?: boolean;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_RANGE = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

const getHourLabel = (hour: number): string => {
  if (hour === 12) return '12p';
  if (hour === 0) return '12a';
  return hour < 12 ? `${hour}a` : `${hour - 12}p`;
};

const getColorIntensity = (value: number, max: number): string => {
  if (max === 0 || value === 0) return '#F3F4F6'; // gray-100
  const intensity = Math.min(value / max, 1);

  // Gradient from light teal to dark teal
  const r = Math.round(240 - intensity * 227);
  const g = Math.round(253 - intensity * 105);
  const b = Math.round(250 - intensity * 112);

  return `rgb(${r}, ${g}, ${b})`;
};

export function PeakUsageHeatmap({
  heatmapData,
  isLoading = false,
}: PeakUsageHeatmapProps) {
  if (isLoading) {
    return (
      <ChartCard title="Peak Usage Times" subtitle="Loading...">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!heatmapData?.data) {
    return (
      <ChartCard title="Peak Usage Times" subtitle="When users are most active">
        <EmptyChart
          title="No activity data"
          description="Usage heatmap will appear once there is user activity data."
          icon="chart"
        />
      </ChartCard>
    );
  }

  // Find max value for color scaling
  let maxValue = 0;
  Object.values(heatmapData.data).forEach(hours => {
    Object.values(hours).forEach(count => {
      if (count > maxValue) maxValue = count;
    });
  });

  return (
    <ChartCard
      title="Peak Usage Times"
      subtitle="Activity heatmap from the last 30 days"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header row with hours */}
          <div className="flex">
            <div className="w-12" /> {/* Spacer for day labels */}
            {HOUR_RANGE.map(hour => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-gray-400 pb-1"
                style={{ minWidth: 28 }}
              >
                {hour % 2 === 0 ? getHourLabel(hour) : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {DAY_LABELS.map((day, dayIdx) => (
            <div key={day} className="flex items-center">
              <div className="w-12 text-xs text-gray-500 font-medium pr-2 text-right">
                {day}
              </div>
              {HOUR_RANGE.map(hour => {
                const value = heatmapData.data[dayIdx]?.[hour] || 0;
                const isPeak =
                  day === heatmapData.peakTime.day &&
                  getHourLabel(hour).replace('a', 'am').replace('p', 'pm') === heatmapData.peakTime.hour;

                return (
                  <div
                    key={`${dayIdx}-${hour}`}
                    className="flex-1 aspect-square m-0.5 rounded-sm relative group cursor-default"
                    style={{
                      minWidth: 24,
                      minHeight: 24,
                      backgroundColor: getColorIntensity(value, maxValue),
                      border: isPeak ? `2px solid ${theme.primary}` : undefined,
                    }}
                    title={`${day} ${getHourLabel(hour)}: ${value} sessions`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute hidden group-hover:block z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                      {day} {getHourLabel(hour)}: {value} sessions
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend and peak time */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Less</span>
          <div className="flex gap-0.5">
            {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: getColorIntensity(intensity * maxValue, maxValue) }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">More</span>
        </div>

        <div
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{
            backgroundColor: `${theme.primary}10`,
            color: theme.primary,
          }}
        >
          <span className="font-medium">Most active:</span> {heatmapData.peakTime.day} at {heatmapData.peakTime.hour}
        </div>
      </div>
    </ChartCard>
  );
}

export default PeakUsageHeatmap;
