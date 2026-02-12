'use client';

import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import {
  Building2,
  School,
  ClipboardList,
  TrendingUp,
  FileSpreadsheet,
  Construction,
} from 'lucide-react';

export default function LeadershipAdminPage() {
  const { permissions, isOwner } = useTDIAdmin();

  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'leadership');

  if (!hasAccess) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Building2 size={32} style={{ color: '#DC2626' }} />
          </div>
          <h1
            className="font-bold mb-3"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            Access Restricted
          </h1>
          <p
            className="mb-6"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#6B7280',
            }}
          >
            You don&apos;t have permission to access the Leadership Dashboard.
            Contact your administrator to request access.
          </p>
          <Link
            href="/tdi-admin/hub"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Go to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Leadership Dashboard Management
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage school partnerships, diagnostics, and leadership analytics.
        </p>
      </div>

      {/* Migration Notice */}
      <div
        className="rounded-xl p-8 mb-8 text-center"
        style={{ backgroundColor: '#FFF8E7', border: '2px dashed #E8B84B' }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: 'white' }}
        >
          <Construction size={32} style={{ color: '#E8B84B' }} />
        </div>
        <h2
          className="font-semibold text-xl mb-3"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          Leadership Admin Features Coming Soon
        </h2>
        <p
          className="text-gray-600 mb-6 max-w-lg mx-auto"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Leadership admin features are being migrated to this unified portal.
          The following capabilities will be available here:
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto mb-6">
          <div className="bg-white rounded-lg p-4 text-left">
            <School size={20} className="mb-2" style={{ color: '#E8B84B' }} />
            <p className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}>
              School Accounts
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Manage partnerships
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left">
            <ClipboardList size={20} className="mb-2" style={{ color: '#E8B84B' }} />
            <p className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}>
              Diagnostics
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              View diagnostic data
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left">
            <TrendingUp size={20} className="mb-2" style={{ color: '#E8B84B' }} />
            <p className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}>
              Analytics
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Partnership performance
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 text-left">
            <FileSpreadsheet size={20} className="mb-2" style={{ color: '#E8B84B' }} />
            <p className="text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}>
              Reports
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Export partnership data
            </p>
          </div>
        </div>

        <p
          className="text-sm text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <strong>Current partnership admin locations:</strong>{' '}
          <Link href="/hub/admin" className="underline hover:no-underline">/hub/admin</Link>,{' '}
          partner dashboards, and school-specific portals.
        </p>
      </div>

      {/* Placeholder Cards */}
      <div className="grid md:grid-cols-3 gap-6 opacity-50 pointer-events-none">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3
            className="font-semibold mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            Active Partnerships
          </h3>
          <p className="text-3xl font-bold" style={{ color: '#2B3A67' }}>-</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3
            className="font-semibold mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            Pending Diagnostics
          </h3>
          <p className="text-3xl font-bold" style={{ color: '#2B3A67' }}>-</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3
            className="font-semibold mb-2"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            Total Schools
          </h3>
          <p className="text-3xl font-bold" style={{ color: '#2B3A67' }}>-</p>
        </div>
      </div>
    </div>
  );
}
