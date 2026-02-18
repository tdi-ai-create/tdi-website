'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { getAdminStats } from '@/lib/hub/admin';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
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
  LayoutGrid,
  Menu,
  ChevronLeft,
  Settings,
  Info,
  X,
} from 'lucide-react';

// Hub theme colors
const theme = PORTAL_THEMES.hub;

// Tab configuration for sidebar
type TabId = 'overview' | 'operations' | 'production';

const TABS: { id: TabId; label: string; icon: React.ElementType; href?: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'operations', label: 'Operations', icon: BarChart3, href: '/tdi-admin/hub/operations' },
  { id: 'production', label: 'Production', icon: Clapperboard, href: '/tdi-admin/hub/production' },
];

interface HubStats {
  totalUsers: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalCertificates: number;
  totalPdHours: number;
  avgStressScore: number | null;
}

// Sidebar Navigation Item Component (matching Creator Studio)
function SidebarNavItem({
  active,
  onClick,
  href,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick?: () => void;
  href?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <Icon size={20} className={active ? '' : 'text-gray-400'} style={active ? { color: theme.primary } : undefined} />
      <span className={active ? 'font-semibold' : ''}>{children}</span>
    </>
  );

  const className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left ${
    active ? '' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
  }`;

  const activeStyles = active
    ? {
        backgroundColor: `${theme.primary}10`,
        color: theme.primary,
      }
    : undefined;

  if (href && !active) {
    return (
      <Link href={href} className={className} style={activeStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className} style={activeStyles}>
      {content}
    </button>
  );
}

// Modern Stat Card Component (matching Creator Studio exactly)
function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtitle?: string;
}) {
  return (
    <div
      className="group bg-white rounded-xl p-5 text-left transition-all duration-200"
      style={{
        backgroundColor: theme.light,
        borderLeft: `3px solid ${theme.primary}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-3xl font-bold mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"
            style={{ color: theme.primary }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
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

// Section Card Component (clean style without left border)
function SectionCard({
  title,
  description,
  features,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  features: string[];
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 group"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: theme.light }}
        >
          <Icon size={24} style={{ color: theme.primary }} />
        </div>
        <ChevronRight
          size={20}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all duration-200"
        />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
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
  const { teamMember, permissions } = useTDIAdmin();
  const [stats, setStats] = useState<HubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExampleData, setHasExampleData] = useState(false);
  const [showExampleNotice, setShowExampleNotice] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-[#FAFBFC]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ boxShadow: '1px 0 3px rgba(0,0,0,0.03)' }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Learning Hub</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {TABS.map((tab) => (
              <SidebarNavItem
                key={tab.id}
                active={tab.id === 'overview'}
                onClick={tab.id === 'overview' ? () => setSidebarOpen(false) : undefined}
                href={tab.href}
                icon={tab.icon}
              >
                {tab.label}
              </SidebarNavItem>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 py-4 border-t border-gray-100">
            <Link
              href="/hub/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings size={16} />
              Legacy Admin
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Learning Hub Overview
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage enrollments, content, and analytics
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-6 py-6">
          {/* Example Data Notice (subtle) */}
          {hasExampleData && showExampleNotice && (
            <ExampleDataNotice onDismiss={() => setShowExampleNotice(false)} />
          )}

          {/* Stats Overview */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Stats</h2>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-5 animate-pulse"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-20" />
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Users} label="Total Users" value={stats.totalUsers || 0} />
                <StatCard icon={BookOpen} label="Enrollments" value={stats.totalEnrollments || 0} />
                <StatCard icon={Award} label="Completions" value={stats.totalCompletions || 0} />
                <StatCard icon={GraduationCap} label="Certificates" value={stats.totalCertificates || 0} />
                <StatCard icon={Clock} label="PD Hours" value={stats.totalPdHours || 0} />
                <StatCard
                  icon={TrendingUp}
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
            <h2 className="text-base font-semibold text-gray-900 mb-4">Manage</h2>
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
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tdi-admin/hub/operations"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.light)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <BarChart3 size={16} />
                View Analytics
              </Link>
              <Link
                href="/tdi-admin/hub/production"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.light)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <FileText size={16} />
                Manage Courses
              </Link>
              <Link
                href="/tdi-admin/hub/production"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.light)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Zap size={16} />
                Quick Wins
              </Link>
              <Link
                href="/tdi-admin/hub/operations"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.light)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Download size={16} />
                Export Reports
              </Link>
              <Link
                href="/tdi-admin/hub/operations"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border hover:shadow-sm"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.light)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Mail size={16} />
                Email Management
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
