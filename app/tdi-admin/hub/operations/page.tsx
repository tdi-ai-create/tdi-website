'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasPermission } from '@/lib/tdi-admin/permissions';
import {
  getAdminEnrollments,
  getAdminTips,
  getAdminRequests,
  getAdminStats,
  updateTipStatus,
  createTip,
  deleteTip,
  updateRequestStatus,
} from '@/lib/hub/admin';
import { getSupabase } from '@/lib/supabase';
import ExampleDataBanner from '@/components/tdi-admin/ExampleDataBanner';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Award,
  FileText,
  BarChart3,
  Lightbulb,
  Mail,
  Search,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Send,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';

type Tab = 'accounts' | 'enrollments' | 'certificates' | 'reports' | 'analytics' | 'tips' | 'emails';

// Stat Card Component
function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: React.ElementType; trend?: 'up' | 'down' | null }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF8E7' }}>
          <Icon size={18} style={{ color: '#E8B84B' }} />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: '#2B3A67' }}>{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
        {trend && (
          <div className={`ml-auto ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </div>
        )}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
        active
          ? 'border-[#E8B84B] text-[#2B3A67]'
          : disabled
          ? 'border-transparent text-gray-300 cursor-not-allowed'
          : 'border-transparent text-gray-500 hover:text-[#2B3A67] hover:border-gray-200'
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {children}
    </button>
  );
}

// Table Header Component
function TableHeader({ children, sortable, sorted, onSort }: { children: React.ReactNode; sortable?: boolean; sorted?: 'asc' | 'desc' | null; onSort?: () => void }) {
  return (
    <th
      className={`text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:text-gray-700' : ''}`}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && sorted && (
          sorted === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        )}
      </div>
    </th>
  );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

// ============= TAB COMPONENTS =============

// ACCOUNTS TAB
function AccountsTab() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('hub_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setAccounts(data || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = accounts.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (a.display_name?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s));
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading accounts...</div>;
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={16} />
          Filters
        </button>
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={accounts.length} icon={Users} />
        <StatCard label="Active" value={accounts.filter(a => a.role !== 'inactive').length} icon={Activity} />
        <StatCard label="This Month" value={accounts.filter(a => new Date(a.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length} icon={Calendar} trend="up" />
        <StatCard label="Avg PD Hours" value="4.2" icon={Clock} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAFAF8]">
            <tr>
              <TableHeader sortable>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>School/Org</TableHeader>
              <TableHeader sortable>Joined</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No accounts found</td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((account, i) => (
                <tr
                  key={account.id}
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'} hover:bg-gray-50 cursor-pointer`}
                  onClick={() => setExpandedId(expandedId === account.id ? null : account.id)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{account.display_name || 'No name'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{account.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {account.role || 'member'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{account.school_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="flex items-center gap-1.5 text-green-600">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 50 && (
        <p className="mt-3 text-sm text-gray-500 text-center">Showing 50 of {filtered.length} accounts</p>
      )}
    </div>
  );
}

// ENROLLMENTS TAB
function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const data = await getAdminEnrollments();
      setEnrollments(data || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = enrollments.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (!search) return true;
    const user = Array.isArray(e.user) ? e.user[0] : e.user;
    const s = search.toLowerCase();
    return (user?.display_name?.toLowerCase().includes(s) || user?.email?.toLowerCase().includes(s));
  });

  const activeCount = enrollments.filter(e => e.status === 'active').length;
  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const droppedCount = enrollments.filter(e => e.status === 'dropped').length;

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading enrollments...</div>;
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Active" value={activeCount} icon={BookOpen} />
        <StatCard label="Completed" value={completedCount} icon={Check} />
        <StatCard label="Dropped" value={droppedCount} icon={X} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAFAF8]">
            <tr>
              <TableHeader>User</TableHeader>
              <TableHeader>Course</TableHeader>
              <TableHeader sortable>Enrolled</TableHeader>
              <TableHeader>Progress</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No enrollments found</td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((enrollment, i) => {
                const user = Array.isArray(enrollment.user) ? enrollment.user[0] : enrollment.user;
                const course = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course;
                return (
                  <tr key={enrollment.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.display_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{course?.title || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${enrollment.progress_pct || 0}%`, backgroundColor: '#E8B84B' }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{enrollment.progress_pct || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                        enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// CERTIFICATES TAB
function CertificatesTab() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('hub_certificates')
        .select(`
          *,
          user:hub_profiles!hub_certificates_user_id_fkey(display_name, email),
          course:hub_courses!hub_certificates_course_id_fkey(title)
        `)
        .order('issued_at', { ascending: false })
        .limit(100);
      setCertificates(data || []);
      setIsLoading(false);
    }
    load();
  }, []);

  const totalPdHours = certificates.reduce((sum, c) => sum + (c.pd_hours || 0), 0);

  const filtered = certificates.filter(c => {
    if (!search) return true;
    const user = Array.isArray(c.user) ? c.user[0] : c.user;
    const course = Array.isArray(c.course) ? c.course[0] : c.course;
    const s = search.toLowerCase();
    return (
      user?.display_name?.toLowerCase().includes(s) ||
      user?.email?.toLowerCase().includes(s) ||
      course?.title?.toLowerCase().includes(s) ||
      c.verification_code?.toLowerCase().includes(s)
    );
  });

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading certificates...</div>;
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Certificates" value={certificates.length} icon={Award} />
        <StatCard label="Total PD Hours Awarded" value={totalPdHours} icon={Clock} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, course, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
          <Download size={16} />
          Bulk Download
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAFAF8]">
            <tr>
              <TableHeader>User</TableHeader>
              <TableHeader>Course</TableHeader>
              <TableHeader>PD Hours</TableHeader>
              <TableHeader sortable>Issued</TableHeader>
              <TableHeader>Verification Code</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No certificates found</td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((cert, i) => {
                const user = Array.isArray(cert.user) ? cert.user[0] : cert.user;
                const course = Array.isArray(cert.course) ? cert.course[0] : cert.course;
                return (
                  <tr key={cert.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.display_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{course?.title || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cert.pd_hours || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{cert.verification_code || '-'}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-blue-600 hover:underline">Download</button>
                        <button className="text-xs text-red-600 hover:underline">Revoke</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// REPORTS TAB
function ReportsTab() {
  const reports = [
    { id: 'school-pd', title: 'School PD Summary', description: 'Generate a PD summary report for a specific school with date range filtering.' },
    { id: 'district', title: 'District Roll-Up', description: 'Aggregate report across multiple schools in a district.' },
    { id: 'effectiveness', title: 'Course Effectiveness', description: 'Completion rate, avg rating, and drop-off funnel for a course.' },
    { id: 'compliance', title: 'Compliance Report', description: 'Who has/hasn\'t completed required courses for a school.' },
    { id: 'engagement', title: 'Engagement Report', description: 'Active users, return rate, and peak times for a date range.' },
    { id: 'ratings', title: 'Course Ratings', description: 'Compare all courses by average rating and trends.' },
    { id: 'demographics', title: 'Demographic Analysis', description: 'Break down data by state, grade level, gender, or experience.' },
    { id: 'stress', title: 'Stress Trends', description: 'Aggregate stress data over time, sliceable by school/role/region.' },
  ];

  return (
    <div>
      <p className="text-sm text-gray-600 mb-6">Select a report template to generate. Each report can be filtered by date range and exported as CSV or PDF.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#E8B84B] hover:shadow-sm transition-all">
            <h3 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {report.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{report.description}</p>
            <button
              className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: '#E8B84B' }}
            >
              Generate Report
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg border border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-2">Schedule Reports</h3>
        <p className="text-sm text-gray-600 mb-3">Set up automatic monthly report delivery to an email address.</p>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white flex items-center gap-2">
          <Calendar size={16} />
          Set Up Schedule
        </button>
      </div>
    </div>
  );
}

// ANALYTICS TAB
function AnalyticsTab() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAdminStats();
      setStats(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading analytics...</div>;
  }

  return (
    <div>
      {/* Real-time Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Live</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: '#2B3A67' }}>-</p>
          <p className="text-sm text-gray-500">Active Users Right Now</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-3xl font-bold" style={{ color: '#2B3A67' }}>{stats?.totalEnrollments || 0}</p>
          <p className="text-sm text-gray-500">Total Enrollments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-3xl font-bold" style={{ color: '#2B3A67' }}>{stats?.totalCompletions || 0}</p>
          <p className="text-sm text-gray-500">Total Completions</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Enrollments Over Time</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">Chart coming soon</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Completions Over Time</h3>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-400">Chart coming soon</p>
          </div>
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Top Courses by Enrollment</h3>
        {stats?.courseEnrollments?.length > 0 ? (
          <div className="space-y-3">
            {stats.courseEnrollments.slice(0, 5).map((course: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-6">{i + 1}.</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{course.title}</span>
                    <span className="text-sm text-gray-500">{course.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(course.count / (stats.courseEnrollments[0]?.count || 1)) * 100}%`,
                        backgroundColor: '#E8B84B'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No enrollment data available</p>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-[#2B3A67] to-[#3d4f7a] rounded-lg p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} />
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <ul className="space-y-2 text-sm text-white/90">
          <li>• Total enrollments: {stats?.totalEnrollments || 0} across all courses.</li>
          <li>• {stats?.totalCompletions || 0} course completions have been recorded.</li>
          <li>• {stats?.totalCertificates || 0} certificates issued with {stats?.totalPdHours || 0} total PD hours.</li>
          <li>• Average stress score: {stats?.avgStressScore || 'N/A'} (1=great, 5=rough).</li>
        </ul>
      </div>
    </div>
  );
}

// TIPS & REQUESTS TAB
function TipsTab() {
  const [tips, setTips] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTip, setNewTip] = useState('');
  const [newTipCategory, setNewTipCategory] = useState('general');

  useEffect(() => {
    async function load() {
      const [tipsData, requestsData] = await Promise.all([
        getAdminTips(),
        getAdminRequests(),
      ]);
      setTips(tipsData);
      setRequests(requestsData);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleAddTip = async () => {
    if (!newTip.trim()) return;
    await createTip(newTip, newTipCategory);
    setNewTip('');
    const data = await getAdminTips();
    setTips(data);
  };

  const handleDeleteTip = async (tipId: string) => {
    if (!confirm('Delete this tip?')) return;
    await deleteTip(tipId);
    setTips(tips.filter(t => t.id !== tipId));
  };

  const handleStatusChange = async (tipId: string, status: string) => {
    await updateTipStatus(tipId, status);
    setTips(tips.map(t => t.id === tipId ? { ...t, approval_status: status } : t));
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading tips & requests...</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* TDI Tips */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">TDI Tips</h3>

        {/* Add Tip Form */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <textarea
            placeholder="Enter a new tip..."
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
            rows={2}
          />
          <div className="flex items-center gap-2 mt-2">
            <select
              value={newTipCategory}
              onChange={(e) => setNewTipCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded text-sm"
            >
              <option value="general">General</option>
              <option value="classroom">Classroom</option>
              <option value="wellbeing">Wellbeing</option>
              <option value="motivation">Motivation</option>
            </select>
            <button
              onClick={handleAddTip}
              className="px-3 py-1.5 rounded text-sm font-medium text-white"
              style={{ backgroundColor: '#E8B84B' }}
            >
              Add Tip
            </button>
          </div>
        </div>

        {/* Tips List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {tips.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No tips yet</p>
          ) : (
            tips.map((tip) => (
              <div key={tip.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">{tip.content}</p>
                <div className="flex items-center justify-between">
                  <select
                    value={tip.approval_status || 'pending'}
                    onChange={(e) => handleStatusChange(tip.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded ${
                      tip.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                      tip.approval_status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => handleDeleteTip(tip.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PD Requests */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">PD Requests</h3>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No requests yet</p>
          ) : (
            requests.map((request) => {
              const user = Array.isArray(request.user) ? request.user[0] : request.user;
              return (
                <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.display_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <select
                      value={request.metadata?.status || 'new'}
                      onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded bg-gray-100"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="planned">Planned</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-600">{request.metadata?.request || 'No details'}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// EMAILS TAB
function EmailsTab() {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [testEmail, setTestEmail] = useState('');

  const templates = {
    welcome: {
      name: 'Welcome Email',
      subject: 'Welcome to the TDI Learning Hub!',
      preview: 'Sent when a new user creates an account',
    },
    nudge: {
      name: 'Nudge Email',
      subject: 'We miss you at the Learning Hub!',
      preview: 'Sent to inactive users to encourage return',
    },
    digest: {
      name: 'Weekly Digest',
      subject: 'Your Weekly TDI Update',
      preview: 'Sent weekly with progress and recommendations',
    },
  };

  const currentTemplate = templates[selectedTemplate as keyof typeof templates];

  return (
    <div>
      {/* Template Selector */}
      <div className="flex gap-3 mb-6">
        {Object.entries(templates).map(([key, template]) => (
          <button
            key={key}
            onClick={() => setSelectedTemplate(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTemplate === key
                ? 'bg-[#2B3A67] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>

      {/* Template Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{currentTemplate.name}</h3>
            <p className="text-sm text-gray-500">{currentTemplate.preview}</p>
          </div>
          <Eye size={20} className="text-gray-400" />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-1">Subject Line:</p>
          <p className="text-sm font-medium text-gray-900 mb-4">{currentTemplate.subject}</p>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              [Email preview will render here with sample data]
            </p>
          </div>
        </div>
      </div>

      {/* Send Test */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Send Test Email</h3>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="Enter email address..."
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: '#E8B84B' }}
          >
            <Send size={16} />
            Send Test
          </button>
        </div>
      </div>

      {/* Send History */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Send History</h3>
        <p className="text-sm text-gray-500">Email send history will appear here once connected to Resend.</p>
      </div>
    </div>
  );
}

// ============= MAIN PAGE COMPONENT =============

export default function HubOperationsPage() {
  const { permissions } = useTDIAdmin();
  const [activeTab, setActiveTab] = useState<Tab>('accounts');

  const canViewEnrollments = hasPermission(permissions, 'learning_hub', 'view_enrollments');
  const canExportReports = hasPermission(permissions, 'learning_hub', 'export_reports');
  const canManageCertificates = hasPermission(permissions, 'learning_hub', 'manage_certificates');
  const canViewAnalytics = hasPermission(permissions, 'learning_hub', 'view_analytics');
  const canManageTips = hasPermission(permissions, 'learning_hub', 'manage_tips');
  const canManageEmails = hasPermission(permissions, 'learning_hub', 'email_management');

  // Default to first available tab
  useEffect(() => {
    if (!canViewEnrollments && activeTab === 'accounts') {
      if (canExportReports) setActiveTab('reports');
      else if (canViewAnalytics) setActiveTab('analytics');
      else if (canManageTips) setActiveTab('tips');
      else if (canManageEmails) setActiveTab('emails');
    }
  }, [canViewEnrollments, canExportReports, canViewAnalytics, canManageTips, canManageEmails, activeTab]);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Example Data Banner */}
      <ExampleDataBanner />

      {/* Page Header */}
      <div className="mb-6">
        <Link
          href="/tdi-admin/hub"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Hub
        </Link>
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Operations
        </h1>
        <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Manage accounts, enrollments, reports, and analytics.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <TabButton
            active={activeTab === 'accounts'}
            onClick={() => setActiveTab('accounts')}
            disabled={!canViewEnrollments}
          >
            <Users size={16} className="mr-2 inline" />
            Accounts
          </TabButton>
          <TabButton
            active={activeTab === 'enrollments'}
            onClick={() => setActiveTab('enrollments')}
            disabled={!canViewEnrollments}
          >
            <BookOpen size={16} className="mr-2 inline" />
            Enrollments
          </TabButton>
          <TabButton
            active={activeTab === 'certificates'}
            onClick={() => setActiveTab('certificates')}
            disabled={!canManageCertificates}
          >
            <Award size={16} className="mr-2 inline" />
            Certificates
          </TabButton>
          <TabButton
            active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
            disabled={!canExportReports}
          >
            <FileText size={16} className="mr-2 inline" />
            Reports
          </TabButton>
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            disabled={!canViewAnalytics}
          >
            <BarChart3 size={16} className="mr-2 inline" />
            Analytics
          </TabButton>
          <TabButton
            active={activeTab === 'tips'}
            onClick={() => setActiveTab('tips')}
            disabled={!canManageTips}
          >
            <Lightbulb size={16} className="mr-2 inline" />
            Tips & Requests
          </TabButton>
          <TabButton
            active={activeTab === 'emails'}
            onClick={() => setActiveTab('emails')}
            disabled={!canManageEmails}
          >
            <Mail size={16} className="mr-2 inline" />
            Emails
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'accounts' && canViewEnrollments && <AccountsTab />}
        {activeTab === 'enrollments' && canViewEnrollments && <EnrollmentsTab />}
        {activeTab === 'certificates' && canManageCertificates && <CertificatesTab />}
        {activeTab === 'reports' && canExportReports && <ReportsTab />}
        {activeTab === 'analytics' && canViewAnalytics && <AnalyticsTab />}
        {activeTab === 'tips' && canManageTips && <TipsTab />}
        {activeTab === 'emails' && canManageEmails && <EmailsTab />}

        {/* No Permission State */}
        {!canViewEnrollments && !canExportReports && !canViewAnalytics && !canManageTips && !canManageEmails && (
          <EmptyState
            icon={AlertCircle}
            title="No Access"
            description="You don't have permission to view any operations data. Contact your admin for access."
          />
        )}
      </div>
    </div>
  );
}
