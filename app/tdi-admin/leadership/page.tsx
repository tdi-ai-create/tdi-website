'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import {
  Building2,
  School,
  ClipboardList,
  TrendingUp,
  FileSpreadsheet,
  DollarSign,
  Construction,
  ExternalLink,
} from 'lucide-react';

// Tab configuration
const TABS = [
  { id: 'partnerships', label: 'Partnerships', icon: School },
  { id: 'reports', label: 'School Reports', icon: FileSpreadsheet },
  { id: 'diagnostics', label: 'Diagnostics', icon: ClipboardList },
  { id: 'billing', label: 'Billing', icon: DollarSign },
] as const;

type TabId = typeof TABS[number]['id'];

export default function LeadershipDashboardPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const [activeTab, setActiveTab] = useState<TabId>('partnerships');

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
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Leadership Dashboard
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage school partnerships, reports, diagnostics, and billing.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-all relative"
              style={{
                backgroundColor: isActive ? 'white' : 'transparent',
                color: isActive ? '#2B3A67' : '#6B7280',
                fontFamily: "'DM Sans', sans-serif",
                borderBottom: isActive ? '2px solid #E8B84B' : '2px solid transparent',
                marginBottom: '-2px',
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'partnerships' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                Active Partnerships
              </h2>
              <Link
                href="/hub/admin"
                className="flex items-center gap-1.5 text-sm hover:opacity-80"
                style={{ color: '#E8B84B' }}
              >
                <ExternalLink size={14} />
                View in Hub Admin
              </Link>
            </div>

            {/* Coming Soon Notice */}
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: '#FFF8E7', border: '2px dashed #E8B84B' }}
            >
              <Construction size={32} className="mx-auto mb-4" style={{ color: '#E8B84B' }} />
              <h3
                className="font-semibold text-lg mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                Partnership Management Coming Soon
              </h3>
              <p
                className="text-gray-600 max-w-md mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Full partnership management features are being migrated here.
                Currently, access partnerships through the Hub Admin or individual partner dashboards.
              </p>
            </div>

            {/* Placeholder Stats */}
            <div className="grid md:grid-cols-4 gap-4 mt-6 opacity-50">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Active Schools</p>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>-</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Teachers</p>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>-</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Pending Renewals</p>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>-</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>-</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2
              className="text-lg font-semibold mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              School Reports
            </h2>

            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: '#FFF8E7', border: '2px dashed #E8B84B' }}
            >
              <FileSpreadsheet size={32} className="mx-auto mb-4" style={{ color: '#E8B84B' }} />
              <h3
                className="font-semibold text-lg mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                School Reports Coming Soon
              </h3>
              <p
                className="text-gray-600 max-w-md mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Generate and view usage reports for partner schools.
                Track engagement, completion rates, and more.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                PD Diagnostics
              </h2>
              <Link
                href="/pd-diagnostic"
                className="flex items-center gap-1.5 text-sm hover:opacity-80"
                style={{ color: '#E8B84B' }}
              >
                <ExternalLink size={14} />
                View Public Diagnostic
              </Link>
            </div>

            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: '#FFF8E7', border: '2px dashed #E8B84B' }}
            >
              <ClipboardList size={32} className="mx-auto mb-4" style={{ color: '#E8B84B' }} />
              <h3
                className="font-semibold text-lg mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                Diagnostics Management Coming Soon
              </h3>
              <p
                className="text-gray-600 max-w-md mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                View and manage PD diagnostic submissions from schools.
                Analyze results and generate recommendations.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            <h2
              className="text-lg font-semibold mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              Billing & Invoicing
            </h2>

            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: '#FFF8E7', border: '2px dashed #E8B84B' }}
            >
              <DollarSign size={32} className="mx-auto mb-4" style={{ color: '#E8B84B' }} />
              <h3
                className="font-semibold text-lg mb-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                Billing Management Coming Soon
              </h3>
              <p
                className="text-gray-600 max-w-md mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Track partnership billing, generate invoices, and manage payment status
                for all school partnerships.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
