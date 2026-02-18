'use client';

import { Download, FileText } from 'lucide-react';
import { ADMIN_SHADOWS, ADMIN_TRANSITIONS } from '../../ui/design-tokens';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  className?: string;
  minHeight?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  onExportCSV,
  onExportPDF,
  className = '',
  minHeight = 'min-h-[300px]',
}: ChartCardProps) {
  const hasExport = onExportCSV || onExportPDF;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-5 ${className}`}
      style={{ boxShadow: ADMIN_SHADOWS.card }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className="text-base font-semibold"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#2B3A67',
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className="text-sm text-gray-500 mt-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {hasExport && (
          <div className="flex items-center gap-1">
            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className={`p-2 rounded-lg ${ADMIN_TRANSITIONS.fast} hover:bg-gray-100`}
                title="Export CSV"
              >
                <Download size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className={`p-2 rounded-lg ${ADMIN_TRANSITIONS.fast} hover:bg-gray-100`}
                title="Export PDF"
              >
                <FileText size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className={minHeight}>{children}</div>
    </div>
  );
}

export default ChartCard;
