'use client';

import { RaeBrief as RaeBriefType, CMO_COLORS, CMOColor } from './types';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';

interface RaeBriefProps {
  briefs: RaeBriefType[];
}

const columns: { type: RaeBriefType['column_type']; color: CMOColor }[] = [
  { type: 'attract', color: CMO_COLORS.attract },
  { type: 'warm', color: CMO_COLORS.warm },
  { type: 'convert', color: CMO_COLORS.convert },
];

const fieldLabels: { key: keyof Pick<RaeBriefType, 'whats_working' | 'make_more' | 'format_to_use' | 'drop_or_missing'>; label: string }[] = [
  { key: 'whats_working', label: "What's Working" },
  { key: 'make_more', label: 'Make More Of This' },
  { key: 'format_to_use', label: 'Format to Use' },
  { key: 'drop_or_missing', label: 'Drop / Missing Signals' },
];

export function RaeBrief({ briefs }: RaeBriefProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: ADMIN_SHADOWS.card }}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold" style={{ color: '#2B3A67', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          Rae&apos;s Brief
        </h3>
        <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          Strategic guidance across the funnel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {columns.map(({ type, color }) => {
          const brief = briefs.find((b) => b.column_type === type);
          return (
            <div key={type} className="p-5">
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-4 pb-2 border-b-2"
                style={{ color: color.text, borderColor: color.accent }}
              >
                {color.label}
              </div>
              {brief ? (
                <div className="space-y-4">
                  {fieldLabels.map(({ key, label }) => (
                    <div key={key}>
                      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {brief[key] || <span className="text-gray-300 italic">Not set</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-300 italic py-4">No brief for this week</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
