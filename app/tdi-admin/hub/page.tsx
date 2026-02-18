'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { getAdminStats } from '@/lib/hub/admin';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import ExampleDataBanner from '@/components/tdi-admin/ExampleDataBanner';
import {
  Users,
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  ChevronRight,
  BarChart3,
  FileText,
  Zap,
  Mail,
  Download,
  GraduationCap,
  Clapperboard,
} from 'lucide-react';

// Hub theme colors
const theme = PORTAL_THEMES.hub;

interface HubStats {
  totalUsers: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalCertificates: number;
  totalPdHours: number;
  avgStressScore: number | null;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtitle?: string;
}

function StatCard({ icon: Icon, label, value, subtitle }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 transition-all duration-200 group"
      style={{
        backgroundColor: theme.light,
        borderLeft: `3px solid ${theme.primary}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[28px] font-bold mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: theme.primary,
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p
            className="text-sm text-gray-500 font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {label}
          </p>
          {subtitle && (
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${theme.primary}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: theme.primary }} />
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  description: string;
  features: string[];
  href: string;
  icon: React.ElementType;
  color: string;
}

function SectionCard({ title, description, features, href, icon: Icon, color }: SectionCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
      style={{ borderLeft: `4px solid ${theme.primary}` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: theme.light }}
        >
          <Icon size={24} style={{ color: theme.primary }} />
        </div>
        <ChevronRight
          size={20}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all"
        />
      </div>
      <h3
        className="font-semibold text-lg mb-2"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#2B3A67',
        }}
      >
        {title}
      </h3>
      <p
        className="text-sm text-gray-500 mb-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {description}
      </p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-gray-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
            {feature}
          </li>
        ))}
      </ul>
    </Link>
  );
}

export default function HubAdminPage() {
  const { teamMember, permissions } = useTDIAdmin();
  const [stats, setStats] = useState<HubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExampleData, setHasExampleData] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
        // Check if we likely have example data (500+ users suggests seeded data)
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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Example Data Banner */}
      {hasExampleData && <ExampleDataBanner />}

      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
            borderLeft: `4px solid ${theme.primary}`,
            paddingLeft: '16px',
          }}
        >
          Learning Hub Management
        </h1>
        <p
          className="text-gray-500 pl-5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage enrollments, content, and analytics for the TDI Learning Hub.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <h2
          className="font-semibold mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: '#2B3A67',
          }}
        >
          Quick Overview
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-gray-100 mb-2" />
                <div className="h-8 bg-gray-100 rounded mb-2" />
                <div className="h-4 bg-gray-50 rounded w-20" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers || 0}
            />
            <StatCard
              icon={BookOpen}
              label="Enrollments"
              value={stats.totalEnrollments || 0}
            />
            <StatCard
              icon={Award}
              label="Completions"
              value={stats.totalCompletions || 0}
            />
            <StatCard
              icon={GraduationCap}
              label="Certificates"
              value={stats.totalCertificates || 0}
            />
            <StatCard
              icon={Clock}
              label="PD Hours"
              value={stats.totalPdHours || 0}
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Stress"
              value={stats.avgStressScore || '-'}
              subtitle="1=great, 5=rough"
            />
          </div>
        ) : (
          <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Unable to load stats.
          </p>
        )}
      </div>

      {/* Section Cards */}
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
          icon={BarChart3}
          color="#2B3A67"
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
          icon={Clapperboard}
          color={theme.dark}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2
          className="font-semibold mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: '#2B3A67',
          }}
        >
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tdi-admin/hub/operations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: theme.primary,
              border: `1.5px solid ${theme.primary}`,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.light}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <BarChart3 size={16} />
            View Analytics
          </Link>
          <Link
            href="/tdi-admin/hub/production"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: theme.primary,
              border: `1.5px solid ${theme.primary}`,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.light}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FileText size={16} />
            Manage Courses
          </Link>
          <Link
            href="/tdi-admin/hub/production"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: theme.primary,
              border: `1.5px solid ${theme.primary}`,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.light}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Zap size={16} />
            Manage Quick Wins
          </Link>
          <Link
            href="/tdi-admin/hub/operations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: theme.primary,
              border: `1.5px solid ${theme.primary}`,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.light}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Download size={16} />
            Export Reports
          </Link>
          <Link
            href="/tdi-admin/hub/operations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: theme.primary,
              border: `1.5px solid ${theme.primary}`,
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.light}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Mail size={16} />
            Email Management
          </Link>
        </div>
      </div>

      {/* Legacy Admin Link */}
      <div className="mt-8 p-4 rounded-lg border border-amber-200 bg-amber-50">
        <p
          className="text-sm text-amber-800"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <strong>Note:</strong> The full admin features are being migrated to this new portal.
          You can still access the{' '}
          <Link href="/hub/admin" className="underline hover:no-underline">
            legacy admin dashboard
          </Link>{' '}
          while we complete the migration.
        </p>
      </div>
    </div>
  );
}
