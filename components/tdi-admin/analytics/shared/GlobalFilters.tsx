'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Download, FileText, RefreshCw } from 'lucide-react';
import { ADMIN_SHADOWS, ADMIN_TRANSITIONS } from '../../ui/design-tokens';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

export type DateRangePreset = '7d' | '30d' | '90d' | 'school_year' | 'all_time' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
  preset: DateRangePreset;
}

interface GlobalFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onExportPDF?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'school_year', label: 'This school year' },
  { value: 'all_time', label: 'All time' },
];

function getDateRangeFromPreset(preset: DateRangePreset): { from: Date; to: Date } {
  const now = new Date();
  const to = now;

  switch (preset) {
    case '7d':
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to };
    case '30d':
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to };
    case '90d':
      return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to };
    case 'school_year':
      // School year starts August 1
      const currentYear = now.getFullYear();
      const schoolYearStart = now.getMonth() >= 7
        ? new Date(currentYear, 7, 1)
        : new Date(currentYear - 1, 7, 1);
      return { from: schoolYearStart, to };
    case 'all_time':
      return { from: new Date(2020, 0, 1), to };
    default:
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to };
  }
}

export function GlobalFilters({
  dateRange,
  onDateRangeChange,
  onExportPDF,
  onRefresh,
  isLoading = false,
}: GlobalFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    const { from, to } = getDateRangeFromPreset(preset);
    onDateRangeChange({ from, to, preset });
    setIsOpen(false);
  };

  const currentPreset = PRESETS.find(p => p.value === dateRange.preset);

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg ${ADMIN_TRANSITIONS.default} hover:border-gray-300`}
            style={{ boxShadow: ADMIN_SHADOWS.card }}
          >
            <Calendar size={16} style={{ color: theme.primary }} />
            <span
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {currentPreset?.label || 'Select date range'}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {isOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg overflow-hidden z-50"
              style={{ boxShadow: ADMIN_SHADOWS.cardHover }}
            >
              {PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetChange(preset.value)}
                  className={`w-full px-4 py-2.5 text-left text-sm ${ADMIN_TRANSITIONS.fast} hover:bg-gray-50 ${
                    dateRange.preset === preset.value
                      ? 'font-medium'
                      : 'text-gray-600'
                  }`}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: dateRange.preset === preset.value ? theme.primary : undefined,
                    backgroundColor: dateRange.preset === preset.value ? `${theme.primary}08` : undefined,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`p-2.5 bg-white border border-gray-200 rounded-lg ${ADMIN_TRANSITIONS.default} hover:border-gray-300 disabled:opacity-50`}
            style={{ boxShadow: ADMIN_SHADOWS.card }}
            title="Refresh data"
          >
            <RefreshCw
              size={16}
              className={`text-gray-500 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${ADMIN_TRANSITIONS.default}`}
            style={{
              backgroundColor: theme.primary,
              color: 'white',
            }}
          >
            <FileText size={16} />
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Export PDF
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export function getInitialDateRange(): DateRange {
  const { from, to } = getDateRangeFromPreset('30d');
  return { from, to, preset: '30d' };
}

export default GlobalFilters;
