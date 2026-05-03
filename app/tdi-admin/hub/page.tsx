'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { getAdminStats } from '@/lib/hub/admin';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import {
  ChevronRight,
  BarChart3,
  FileText,
  Zap,
  Mail,
  Download,
  Info,
  X,
} from 'lucide-react';

// Hub theme colors
const theme = PORTAL_THEMES.hub;

// Tab configuration for top nav
const HUB_TABS = [
  { id: 'overview', label: 'Overview', href: '/tdi-admin/hub' },
  { id: 'operations', label: 'Operations', href: '/tdi-admin/hub/operations' },
  { id: 'production', label: 'Production', href: '/tdi-admin/hub/production' },
];

interface HubStats {
  totalUsers: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalCertificates: number;
  totalPdHours: number;
  avgStressScore: number | null;
}

// Modern Stat Card Component - simplified without icon circles
function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 relative overflow-hidden"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: theme.accent }} />
      <div className="p-5">
        <p
          className="font-bold mb-1"
          style={{ color: theme.accent, fontSize: 28, fontFamily: "'DM Sans', sans-serif" }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-gray-500">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// Section Card Component - with small dot accent instead of large icon
function SectionCard({
  title,
  description,
  features,
  href,
}: {
  title: string;
  description: string;
  features: string[];
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl p-6 border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-200 group"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />
        <ChevronRight
          size={20}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-200"
        />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
            {feature}
          </li>
        ))}
      </ul>
    </Link>
  );
}

// Subtle Example Data Notice
function ExampleDataNotice({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-6">
      <Info size={16} className="text-amber-600 flex-shrink-0" />
      <p className="text-sm text-amber-700 flex-1">
        Viewing example data for demonstration purposes.
      </p>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-amber-100 transition-colors"
        title="Dismiss"
      >
        <X size={14} className="text-amber-600" />
      </button>
    </div>
  );
}

export default function HubAdminPage() {
  const { teamMember, permissions, isOwner } = useTDIAdmin();
  const [stats, setStats] = useState<HubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExampleData, setHasExampleData] = useState(false);
  const [showExampleNotice, setShowExampleNotice] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
        setHasExampleData((data?.totalUsers || 0) >= 100);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Sticky Tab Bar */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-gray-100"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-0 px-6">
          {HUB_TABS.map(tab => (
            <Link
              key={tab.id}
              href={tab.href}
              className="px-4 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: tab.id === 'overview' ? '#111827' : '#6B7280',
                borderBottom: tab.id === 'overview'
                  ? '2px solid #00B5AD'
                  : '2px solid transparent',
              }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-extrabold" style={{ fontSize: 28, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Learning Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage enrollments, content, and analytics</p>
        </div>

        {/* Example Data Notice (subtle) */}
        {hasExampleData && showExampleNotice && (
          <ExampleDataNotice onDismiss={() => setShowExampleNotice(false)} />
        )}

        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="font-bold mb-4" style={{ fontSize: 18, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Quick Stats</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 animate-pulse border border-gray-100"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Total Users" value={stats.totalUsers || 0} />
              <StatCard label="Enrollments" value={stats.totalEnrollments || 0} />
              <StatCard label="Completions" value={stats.totalCompletions || 0} />
              <StatCard label="Certificates" value={stats.totalCertificates || 0} />
              <StatCard label="PD Hours" value={stats.totalPdHours || 0} />
              <StatCard
                label="Avg Stress"
                value={stats.avgStressScore || '-'}
                subtitle="1=great, 5=rough"
              />
            </div>
          ) : (
            <p className="text-gray-500">Unable to load stats.</p>
          )}
        </div>

        {/* Section Cards */}
        <div className="mb-8">
          <h2 className="font-bold mb-4" style={{ fontSize: 18, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>Manage</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard
              title="Operations"
              description="Accounts, enrollments, reports, analytics"
              features={[
                'View and manage enrollments',
                'Export reports and data',
                'View analytics dashboards',
                'Manage user accounts',
                'Send bulk emails',
                'Certificate management',
              ]}
              href="/tdi-admin/hub/operations"
            />
            <SectionCard
              title="Production"
              description="Courses, content, Quick Wins, media"
              features={[
                'Create and edit courses',
                'Manage lessons and modules',
                'Publish/unpublish content',
                'Manage Quick Wins',
                'Upload videos and resources',
                'Content calendar',
              ]}
              href="/tdi-admin/hub/production"
            />
          </div>
        </div>

        {/* CMO Dashboard Widget — owners only */}
        {isOwner && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Executive</h2>
            <Link
              href="/tdi-admin/cmo"
              className="flex items-center justify-between bg-white rounded-xl p-5 border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all duration-200 group"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(13, 148, 136, 0.1)' }}
                >
                  <BarChart3 size={20} style={{ color: '#0D9488' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">CMO Dashboard</p>
                  <p className="text-xs text-gray-500 mt-0.5">Weekly metrics, ARR, TikTok, Substack, UTM tracking</p>
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-200"
              />
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tdi-admin/hub/operations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
              style={{
                color: theme.accent,
                borderColor: theme.accent,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentLight)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <BarChart3 size={16} />
              View Analytics
            </Link>
            <Link
              href="/tdi-admin/hub/production"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
              style={{
                color: theme.accent,
                borderColor: theme.accent,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentLight)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <FileText size={16} />
              Manage Courses
            </Link>
            <Link
              href="/tdi-admin/hub/production"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
              style={{
                color: theme.accent,
                borderColor: theme.accent,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentLight)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Zap size={16} />
              Quick Wins
            </Link>
            <Link
              href="/tdi-admin/hub/operations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
              style={{
                color: theme.accent,
                borderColor: theme.accent,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentLight)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Download size={16} />
              Export Reports
            </Link>
            <Link
              href="/tdi-admin/hub/operations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
              style={{
                color: theme.accent,
                borderColor: theme.accent,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.accentLight)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Mail size={16} />
              Email Management
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
