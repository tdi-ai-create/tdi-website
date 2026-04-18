'use client';

import { ExternalLink } from 'lucide-react';
import { UTMTracking as UTMTrackingType } from './types';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';

interface UTMTrackingProps {
  rows: UTMTrackingType[];
}

export function UTMTracking({ rows }: UTMTrackingProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: ADMIN_SHADOWS.card }}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold" style={{ color: '#2B3A67', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          UTM Link Tracking
        </h3>
        <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          Convert — tracked link performance by source
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-8 text-center text-gray-400 text-sm">No UTM tracking data this week</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Source</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">UTM Link</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Clicks</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Form Subs</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">DM Triggers</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900 font-medium">{row.source}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-[250px] truncate">
                    {row.utm_link ? (
                      <span className="flex items-center gap-1">
                        <span className="truncate">{row.utm_link}</span>
                        <ExternalLink size={12} className="text-gray-400 flex-shrink-0" />
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-900 font-medium">{row.clicks.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{row.form_submissions.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{row.dm_triggers.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-100 font-medium">
                <td className="px-5 py-3 text-gray-700" colSpan={2}>Totals</td>
                <td className="px-5 py-3 text-right text-gray-900">{rows.reduce((s, r) => s + r.clicks, 0).toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-gray-700">{rows.reduce((s, r) => s + r.form_submissions, 0).toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-gray-700">{rows.reduce((s, r) => s + r.dm_triggers, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
