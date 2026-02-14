'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasPermission } from '@/lib/tdi-admin/permissions';
import {
  getAdminTips,
  getAdminRequests,
  getAdminStats,
  updateTipStatus,
  createTip,
  deleteTip,
  updateRequestStatus,
} from '@/lib/hub/admin';
import ExampleDataBanner from '@/components/tdi-admin/ExampleDataBanner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
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
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/tdi-admin/accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error('Error loading accounts:', error);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = accounts.filter(a => {
    if (roleFilter !== 'all' && a.role !== roleFilter) return false;
    if (statusFilter === 'active' && !a.onboarding_completed) return false;
    if (statusFilter === 'onboarding' && a.onboarding_completed) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    const schoolName = (a.onboarding_data as { school_name?: string })?.school_name || '';
    return (
      a.display_name?.toLowerCase().includes(s) ||
      schoolName.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const activeCount = accounts.filter(a => a.onboarding_completed).length;
  const thisMonthCount = accounts.filter(a => {
    const created = new Date(a.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return created > thirtyDaysAgo;
  }).length;

  const exportCSV = () => {
    let csv = 'Name,Role,Grade Level,School,State,Joined,Status\n';
    filtered.forEach(a => {
      const onboarding = a.onboarding_data as { school_name?: string; grade_level?: string; state?: string } | null;
      csv += `"${a.display_name || ''}",${a.role || 'teacher'},"${onboarding?.grade_level || ''}","${onboarding?.school_name || ''}","${onboarding?.state || ''}",${new Date(a.created_at).toLocaleDateString()},${a.onboarding_completed ? 'Active' : 'Onboarding'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `accounts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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
            placeholder="Search by name or school..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teacher</option>
          <option value="school_leader">School Leader</option>
          <option value="coach">Coach</option>
          <option value="para">Para</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="onboarding">Onboarding</option>
        </select>
        <button
          onClick={exportCSV}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={accounts.length} icon={Users} />
        <StatCard label="Onboarded" value={activeCount} icon={Activity} />
        <StatCard label="This Month" value={thisMonthCount} icon={Calendar} trend="up" />
        <StatCard label="Completion %" value={`${accounts.length > 0 ? Math.round((activeCount / accounts.length) * 100) : 0}%`} icon={Clock} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAFAF8]">
            <tr>
              <TableHeader sortable>Name</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Grade Level</TableHeader>
              <TableHeader>School/Org</TableHeader>
              <TableHeader sortable>Joined</TableHeader>
              <TableHeader>Status</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No accounts found</td>
              </tr>
            ) : (
              paginatedData.map((account, i) => {
                const onboarding = account.onboarding_data as { school_name?: string; grade_level?: string } | null;
                const schoolName = onboarding?.school_name || '-';
                const gradeLevel = onboarding?.grade_level || '-';
                return (
                  <tr key={account.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{account.display_name || 'No name'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.role === 'school_leader' ? 'bg-purple-100 text-purple-700' :
                        account.role === 'coach' ? 'bg-blue-100 text-blue-700' :
                        account.role === 'para' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {account.role?.replace('_', ' ') || 'teacher'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{gradeLevel}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{schoolName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(account.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {account.onboarding_completed ? (
                        <span className="flex items-center gap-1.5 text-green-600">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Onboarding
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page <= 3 ? i + 1 : page + i - 2;
              if (pageNum > totalPages || pageNum < 1) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    page === pageNum ? 'bg-[#2B3A67] text-white' : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
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
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/tdi-admin/enrollments');
        if (response.ok) {
          const data = await response.json();
          setEnrollments(data.enrollments || []);
        }
      } catch (error) {
        console.error('Error loading enrollments:', error);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = enrollments.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (!search) return true;
    const user = Array.isArray(e.user) ? e.user[0] : e.user;
    const course = Array.isArray(e.course) ? e.course[0] : e.course;
    const s = search.toLowerCase();
    return (
      user?.display_name?.toLowerCase().includes(s) ||
      course?.title?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const activeCount = enrollments.filter(e => e.status === 'active').length;
  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const droppedCount = enrollments.filter(e => e.status === 'dropped').length;
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_pct || 0), 0) / enrollments.length)
    : 0;

  const exportCSV = () => {
    let csv = 'User,Course,Enrolled,Progress,Status,Completed\n';
    filtered.forEach(e => {
      const user = Array.isArray(e.user) ? e.user[0] : e.user;
      const course = Array.isArray(e.course) ? e.course[0] : e.course;
      csv += `"${user?.display_name || ''}","${course?.title || ''}",${new Date(e.created_at).toLocaleDateString()},${e.progress_pct || 0}%,${e.status},${e.completed_at ? new Date(e.completed_at).toLocaleDateString() : ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `enrollments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading enrollments...</div>;
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Active" value={activeCount} icon={BookOpen} />
        <StatCard label="Completed" value={completedCount} icon={Check} />
        <StatCard label="Dropped" value={droppedCount} icon={X} />
        <StatCard label="Avg Progress" value={`${avgProgress}%`} icon={TrendingUp} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or course..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="dropped">Dropped</option>
        </select>
        <button
          onClick={exportCSV}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
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
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No enrollments found</td>
              </tr>
            ) : (
              paginatedData.map((enrollment, i) => {
                const user = Array.isArray(enrollment.user) ? enrollment.user[0] : enrollment.user;
                const course = Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course;
                return (
                  <tr key={enrollment.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user?.display_name || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{course?.title || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${enrollment.progress_pct || 0}%`, backgroundColor: enrollment.status === 'completed' ? '#16A34A' : '#E8B84B' }}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// CERTIFICATES TAB
function CertificatesTab() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/tdi-admin/certificates');
        if (response.ok) {
          const data = await response.json();
          setCertificates(data.certificates || []);
        }
      } catch (error) {
        console.error('Error loading certificates:', error);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const totalPdHours = certificates.reduce((sum, c) => sum + (c.pd_hours || 0), 0);
  const thisMonthCerts = certificates.filter(c => {
    const issued = new Date(c.issued_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return issued > thirtyDaysAgo;
  }).length;

  const filtered = certificates.filter(c => {
    if (!search) return true;
    const user = Array.isArray(c.user) ? c.user[0] : c.user;
    const course = Array.isArray(c.course) ? c.course[0] : c.course;
    const s = search.toLowerCase();
    return (
      user?.display_name?.toLowerCase().includes(s) ||
      course?.title?.toLowerCase().includes(s) ||
      c.verification_code?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = () => {
    let csv = 'User,Course,PD Hours,Issued Date,Verification Code\n';
    filtered.forEach(c => {
      const user = Array.isArray(c.user) ? c.user[0] : c.user;
      const course = Array.isArray(c.course) ? c.course[0] : c.course;
      csv += `"${user?.display_name || ''}","${course?.title || ''}",${c.pd_hours || 0},${c.issued_at ? new Date(c.issued_at).toLocaleDateString() : ''},${c.verification_code || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `certificates-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">Loading certificates...</div>;
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Certificates" value={certificates.length} icon={Award} />
        <StatCard label="Total PD Hours" value={totalPdHours} icon={Clock} />
        <StatCard label="This Month" value={thisMonthCerts} icon={Calendar} trend="up" />
        <StatCard label="Avg Hours/Cert" value={certificates.length > 0 ? (totalPdHours / certificates.length).toFixed(1) : '0'} icon={TrendingUp} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, course, or verification code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
          />
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
        >
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
              <TableHeader>PD Hours</TableHeader>
              <TableHeader sortable>Issued</TableHeader>
              <TableHeader>Verification Code</TableHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No certificates found</td>
              </tr>
            ) : (
              paginatedData.map((cert, i) => {
                const user = Array.isArray(cert.user) ? cert.user[0] : cert.user;
                const course = Array.isArray(cert.course) ? cert.course[0] : cert.course;
                return (
                  <tr key={cert.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user?.display_name || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{course?.title || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-700 text-sm font-medium">
                        {cert.pd_hours || 0} hrs
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{cert.verification_code || '-'}</code>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// REPORTS TAB
function ReportsTab() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportFilters, setReportFilters] = useState({
    state: '',
    org: '',
    dateFrom: '',
    dateTo: '',
  });

  const reports = [
    { id: 'user-summary', title: 'User Summary', description: 'Complete list of all users with their roles, schools, and enrollment status.' },
    { id: 'enrollment-report', title: 'Enrollment Report', description: 'All enrollments with user info, course, status, and progress.' },
    { id: 'completion-report', title: 'Completion Report', description: 'All completed courses with user info and PD hours earned.' },
    { id: 'pd-hours', title: 'PD Hours Report', description: 'Summary of PD hours by user, course, and date.' },
    { id: 'course-performance', title: 'Course Performance', description: 'Completion rates and enrollment counts for all courses.' },
    { id: 'demographics', title: 'Demographic Analysis', description: 'User breakdown by role, grade level, experience, and state.' },
    { id: 'stress-wellness', title: 'Stress & Wellness', description: 'Stress scores by user with improvement tracking.' },
    { id: 'engagement', title: 'Engagement Report', description: 'Activity patterns by day, hour, and monthly active users.' },
    { id: 'goals-report', title: 'Goals Report', description: 'User goals distribution and alignment.' },
    { id: 'state-rollup', title: 'State Roll-Up', description: 'Aggregated metrics by state for geographic analysis.' },
  ];

  const generateReport = async (reportId: string) => {
    setIsGenerating(reportId);
    setSelectedReport(reportId);

    try {
      const params = new URLSearchParams();
      if (reportFilters.state) params.set('state', reportFilters.state);
      if (reportFilters.org) params.set('org', reportFilters.org);
      if (reportFilters.dateFrom) params.set('date_from', reportFilters.dateFrom);
      if (reportFilters.dateTo) params.set('date_to', reportFilters.dateTo);

      const res = await fetch(`/api/tdi-admin/analytics?${params.toString()}`);
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setIsGenerating(null);
  };

  const downloadCSV = (reportId: string) => {
    if (!reportData) return;

    let csvContent = '';
    let filename = `${reportId}-${new Date().toISOString().split('T')[0]}.csv`;

    switch (reportId) {
      case 'user-summary':
        csvContent = 'Total Users,Onboarded,Teachers,School Leaders,Coaches,Paras\n';
        const roleData = reportData.roleDistribution || [];
        const teachers = roleData.find((r: any) => r.role === 'Teacher')?.count || 0;
        const leaders = roleData.find((r: any) => r.role === 'School Leader')?.count || 0;
        const coaches = roleData.find((r: any) => r.role === 'Coach')?.count || 0;
        const paras = roleData.find((r: any) => r.role === 'Para')?.count || 0;
        csvContent += `${reportData.stats?.totalUsers || 0},${reportData.stats?.totalUsers || 0},${teachers},${leaders},${coaches},${paras}\n`;
        break;

      case 'enrollment-report':
        csvContent = 'Month,Enrollments,Completions,Completion Rate\n';
        const enrollTS = reportData.enrollmentsTimeSeries || [];
        const compTS = reportData.completionsTimeSeries || [];
        enrollTS.forEach((e: any, i: number) => {
          const comp = compTS[i]?.value || 0;
          const rate = e.value > 0 ? Math.round((comp / e.value) * 100) : 0;
          csvContent += `${e.month},${e.value},${comp},${rate}%\n`;
        });
        break;

      case 'pd-hours':
        csvContent = 'Month,PD Hours Awarded\n';
        (reportData.pdTimeSeries || []).forEach((p: any) => {
          csvContent += `${p.month},${p.value}\n`;
        });
        break;

      case 'course-performance':
        csvContent = 'Course,Enrollments,Completions,Completion Rate\n';
        (reportData.topCourses || []).forEach((c: any) => {
          csvContent += `"${c.title}",${c.enrollments},${c.completions},${c.completionRate}%\n`;
        });
        break;

      case 'demographics':
        csvContent = 'Category,Segment,Count\n';
        (reportData.roleDistribution || []).forEach((r: any) => csvContent += `Role,${r.role},${r.count}\n`);
        (reportData.gradeDistribution || []).forEach((g: any) => csvContent += `Grade,${g.grade},${g.count}\n`);
        (reportData.experienceDistribution || []).forEach((e: any) => csvContent += `Experience,${e.range},${e.count}\n`);
        (reportData.stateDistribution || []).forEach((s: any) => csvContent += `State,${s.state},${s.count}\n`);
        break;

      case 'stress-wellness':
        csvContent = 'Role,Initial Stress,Current Stress,Improvement\n';
        (reportData.stressRoleComparison || []).forEach((s: any) => {
          const improvement = s.avgInitial - s.avgCurrent;
          csvContent += `${s.role},${s.avgInitial},${s.avgCurrent},${improvement.toFixed(1)}\n`;
        });
        break;

      case 'engagement':
        csvContent = 'Day,Activity Count\n';
        (reportData.activityByDay || []).forEach((d: any) => csvContent += `${d.day},${d.count}\n`);
        csvContent += '\nHour,Activity Count\n';
        (reportData.activityByHour || []).forEach((h: any) => csvContent += `${h.hour},${h.count}\n`);
        break;

      case 'goals-report':
        csvContent = 'Goal,User Count\n';
        (reportData.goalAlignment || []).forEach((g: any) => csvContent += `"${g.goal}",${g.count}\n`);
        break;

      case 'state-rollup':
        csvContent = 'State,User Count\n';
        (reportData.stateDistribution || []).forEach((s: any) => csvContent += `${s.state},${s.count}\n`);
        break;

      default:
        csvContent = 'Report data not available';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div>
      {/* Filter Bar for Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Report Filters (optional)</p>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="State (e.g., TX, CA)"
            value={reportFilters.state}
            onChange={(e) => setReportFilters({ ...reportFilters, state: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50"
          />
          <input
            type="text"
            placeholder="School/Organization"
            value={reportFilters.org}
            onChange={(e) => setReportFilters({ ...reportFilters, org: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50"
          />
          <input
            type="date"
            value={reportFilters.dateFrom}
            onChange={(e) => setReportFilters({ ...reportFilters, dateFrom: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50"
          />
          <span className="flex items-center text-gray-400">to</span>
          <input
            type="date"
            value={reportFilters.dateTo}
            onChange={(e) => setReportFilters({ ...reportFilters, dateTo: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50"
          />
          {(reportFilters.state || reportFilters.org || reportFilters.dateFrom || reportFilters.dateTo) && (
            <button
              onClick={() => setReportFilters({ state: '', org: '', dateFrom: '', dateTo: '' })}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">Select a report template to generate. Reports can be filtered and exported as CSV.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-lg border p-5 transition-all ${
              selectedReport === report.id ? 'border-[#E8B84B] shadow-sm' : 'border-gray-200 hover:border-[#E8B84B] hover:shadow-sm'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {report.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{report.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => generateReport(report.id)}
                disabled={isGenerating === report.id}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#E8B84B' }}
              >
                {isGenerating === report.id ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
              {selectedReport === report.id && reportData && (
                <button
                  onClick={() => downloadCSV(report.id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={14} />
                  CSV
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview */}
      {selectedReport && reportData && (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Report Preview: {reports.find(r => r.id === selectedReport)?.title}
            </h3>
            <button
              onClick={() => downloadCSV(selectedReport)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
              style={{ backgroundColor: '#5BBEC4' }}
            >
              <Download size={14} />
              Download CSV
            </button>
          </div>

          {/* Preview content based on report type */}
          {selectedReport === 'user-summary' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-[#2B3A67]">{reportData.stats?.totalUsers || 0}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
              {(reportData.roleDistribution || []).slice(0, 3).map((r: any) => (
                <div key={r.role} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#2B3A67]">{r.count}</p>
                  <p className="text-sm text-gray-500">{r.role}s</p>
                </div>
              ))}
            </div>
          )}

          {selectedReport === 'course-performance' && (
            <table className="w-full">
              <thead className="bg-[#FAFAF8]">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(reportData.topCourses || []).slice(0, 5).map((c: any) => (
                  <tr key={c.courseId}>
                    <td className="px-4 py-2 text-sm">{c.title}</td>
                    <td className="px-4 py-2 text-sm text-right">{c.enrollments}</td>
                    <td className="px-4 py-2 text-sm text-right">{c.completions}</td>
                    <td className="px-4 py-2 text-sm text-right font-medium">{c.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'demographics' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">By Role</h4>
                {(reportData.roleDistribution || []).map((r: any) => (
                  <div key={r.role} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{r.role}</span>
                    <span className="text-sm font-medium">{r.count}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">By Grade</h4>
                {(reportData.gradeDistribution || []).map((g: any) => (
                  <div key={g.grade} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{g.grade}</span>
                    <span className="text-sm font-medium">{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedReport === 'stress-wellness' && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{reportData.stats?.avgStressInitial || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Avg Initial Stress</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{reportData.stats?.avgStressCurrent || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Avg Current Stress</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{reportData.stats?.improvementRate || 0}%</p>
                  <p className="text-sm text-gray-500">Improved</p>
                </div>
              </div>
            </div>
          )}

          {!['user-summary', 'course-performance', 'demographics', 'stress-wellness'].includes(selectedReport) && (
            <p className="text-sm text-gray-500">Preview data loaded. Click Download CSV to export the full report.</p>
          )}
        </div>
      )}

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

// Color palette for charts (TDI colors: teal, gold, coral, green - no purple/violet)
const CHART_COLORS = ['#5BBEC4', '#E8B84B', '#E8927C', '#16A34A', '#EF4444', '#F59E0B', '#5BBEC4', '#E8927C'];

// ANALYTICS TAB
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    state: '',
    org: '',
    role: 'all',
    gradeLevel: 'all',
    gender: 'all',
    language: 'all',
  });
  const [activeSection, setActiveSection] = useState<string>('overview');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.state) params.set('state', filters.state);
      if (filters.org) params.set('org', filters.org);
      if (filters.role !== 'all') params.set('role', filters.role);
      if (filters.gradeLevel !== 'all') params.set('grade_level', filters.gradeLevel);
      if (filters.gender !== 'all') params.set('gender', filters.gender);
      if (filters.language !== 'all') params.set('language', filters.language);

      const res = await fetch(`/api/tdi-admin/analytics?${params.toString()}`);
      const data = await res.json();
      setAnalytics(data);
      setIsLoading(false);
    }
    load();
  }, [filters]);

  const resetFilters = () => setFilters({ state: '', org: '', role: 'all', gradeLevel: 'all', gender: 'all', language: 'all' });

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v && v !== 'all').length;
  const stats = analytics?.stats || {};
  const insights = analytics?.insights || {};
  const filterOptions = analytics?.filterOptions || { states: [], orgs: [] };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <RefreshCw className="animate-spin mx-auto text-gray-400 mb-3" size={24} />
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-10 bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 mr-1">
            <Filter size={16} />
            <span className="font-medium">Filters:</span>
          </div>

          {/* State Filter */}
          <select
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50 min-w-[120px] max-w-[160px]"
          >
            <option value="">All States</option>
            {filterOptions.states.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Organization Filter */}
          <select
            value={filters.org}
            onChange={(e) => setFilters({ ...filters, org: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50 min-w-[140px] max-w-[180px]"
          >
            <option value="">All Schools</option>
            {filterOptions.orgs.slice(0, 50).map((o: string) => (
              <option key={o} value={o}>{o.length > 20 ? o.slice(0, 20) + '...' : o}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50 min-w-[120px] max-w-[150px]"
          >
            <option value="all">All Roles</option>
            <option value="teacher">Teacher</option>
            <option value="school_leader">School Leader</option>
            <option value="coach">Coach</option>
            <option value="para">Para</option>
          </select>

          {/* Grade Level Filter */}
          <select
            value={filters.gradeLevel}
            onChange={(e) => setFilters({ ...filters, gradeLevel: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50 min-w-[120px] max-w-[140px]"
          >
            <option value="all">All Grades</option>
            <option value="Pre-K">Pre-K</option>
            <option value="K-2">K-2</option>
            <option value="3-5">3-5</option>
            <option value="6-8">6-8</option>
            <option value="9-12">9-12</option>
            <option value="Higher Ed">Higher Ed</option>
          </select>

          {/* Gender Filter */}
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50 min-w-[120px] max-w-[150px]"
          >
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non_binary">Non-Binary</option>
          </select>

          {/* Language Filter */}
          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBEC4]/50 min-w-[120px] max-w-[150px]"
          >
            <option value="all">All Languages</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
          </select>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-1"
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
            {filters.state && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#5BBEC4]/10 text-[#5BBEC4] text-xs rounded-full">
                State: {filters.state}
                <button onClick={() => setFilters({ ...filters, state: '' })} className="hover:text-[#2B3A67]"><X size={12} /></button>
              </span>
            )}
            {filters.org && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#5BBEC4]/10 text-[#5BBEC4] text-xs rounded-full">
                Org: {filters.org.length > 15 ? filters.org.slice(0, 15) + '...' : filters.org}
                <button onClick={() => setFilters({ ...filters, org: '' })} className="hover:text-[#2B3A67]"><X size={12} /></button>
              </span>
            )}
            {filters.role !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8B84B]/10 text-[#E8B84B] text-xs rounded-full">
                Role: {filters.role.replace('_', ' ')}
                <button onClick={() => setFilters({ ...filters, role: 'all' })} className="hover:text-[#2B3A67]"><X size={12} /></button>
              </span>
            )}
            {filters.gradeLevel !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8B84B]/10 text-[#E8B84B] text-xs rounded-full">
                Grade: {filters.gradeLevel}
                <button onClick={() => setFilters({ ...filters, gradeLevel: 'all' })} className="hover:text-[#2B3A67]"><X size={12} /></button>
              </span>
            )}
            {filters.gender !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8927C]/10 text-[#E8927C] text-xs rounded-full">
                Gender: {filters.gender}
                <button onClick={() => setFilters({ ...filters, gender: 'all' })} className="hover:text-[#2B3A67]"><X size={12} /></button>
              </span>
            )}
            {filters.language !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8927C]/10 text-[#E8927C] text-xs rounded-full">
                Language: {filters.language}
                <button onClick={() => setFilters({ ...filters, language: 'all' })} className="hover:text-[#2B3A67]"><X size={12} /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* AI Insights Box */}
      <div className="bg-gradient-to-r from-[#2B3A67] to-[#3d4f7a] rounded-lg p-5 text-white mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={18} />
          <h3 className="font-semibold">AI Insights</h3>
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">Filtered View</span>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-white/90">
          <div>
            <p className="mb-2">
              {insights.enrollmentChange >= 0 ? '📈' : '📉'} Enrollments{' '}
              <strong className="text-white">{insights.enrollmentChange >= 0 ? 'up' : 'down'} {Math.abs(insights.enrollmentChange || 0)}%</strong> this month
            </p>
            <p className="text-white/70 text-xs">{insights.enrollmentsThisMonth || 0} vs {insights.enrollmentsLastMonth || 0} last month</p>
          </div>
          <div>
            <p className="mb-2">
              🎓 Completion rate: <strong className="text-white">{insights.completionRate || 0}%</strong>
            </p>
            <p className="text-white/70 text-xs">{stats.totalCompletions || 0} of {stats.totalEnrollments || 0} enrollments completed</p>
          </div>
          <div>
            <p className="mb-2">
              📜 PD Hours: <strong className="text-white">{stats.totalPdHours || 0}</strong> total awarded
            </p>
            <p className="text-white/70 text-xs">Most popular: {insights.mostPopularCourse || 'N/A'}</p>
          </div>
          <div>
            <p className="mb-2">
              😌 Stress improved: <strong className="text-white">{stats.improvementRate || 0}%</strong> of users
            </p>
            <p className="text-white/70 text-xs">Avg reduction: {insights.avgStressReduction || 0} points</p>
          </div>
          <div>
            <p className="mb-2">
              ⏰ Peak activity: <strong className="text-white">{insights.peakDay || 'N/A'}</strong> at <strong className="text-white">{insights.peakHour || 'N/A'}</strong>
            </p>
            <p className="text-white/70 text-xs">Most requested goal: {insights.mostRequestedGoal || 'N/A'}</p>
          </div>
          {insights.lowestCompletionRate < 50 && insights.lowestCompletionCourse && (
            <div>
              <p className="mb-2">
                ⚠️ Needs attention: <strong className="text-white">{insights.lowestCompletionCourse}</strong>
              </p>
              <p className="text-white/70 text-xs">{insights.lowestCompletionRate}% completion rate</p>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers || 0} icon={Users} />
        <StatCard label="Total Enrollments" value={stats.totalEnrollments || 0} icon={BookOpen} />
        <StatCard label="Completions" value={stats.totalCompletions || 0} icon={Award} />
        <StatCard label="Completion Rate" value={`${stats.completionRate || 0}%`} icon={TrendingUp} trend={stats.completionRate > 50 ? 'up' : null} />
        <StatCard label="PD Hours" value={stats.totalPdHours || 0} icon={Clock} />
        <StatCard label="Avg Stress" value={stats.avgStressCurrent?.toFixed(1) || 'N/A'} icon={Activity} trend={stats.stressImproved ? 'up' : null} />
      </div>

      {/* Section Toggle */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'courses', label: 'Courses' },
          { id: 'demographics', label: 'Demographics' },
          { id: 'stress', label: 'Stress & Wellness' },
          { id: 'engagement', label: 'Engagement' },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeSection === section.id
                ? 'bg-[#2B3A67] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW SECTION */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Time Series Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Enrollments Over Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Enrollments Over Time</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.enrollmentsTimeSeries || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#5BBEC4" strokeWidth={2} dot={{ fill: '#5BBEC4' }} name="Enrollments" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Completions Over Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Completions Over Time</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.completionsTimeSeries || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2} dot={{ fill: '#16A34A' }} name="Completions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PD Hours Over Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">PD Hours Awarded Over Time</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.pdTimeSeries || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#E8B84B" radius={[4, 4, 0, 0]} name="PD Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Active Users */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Active Users</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.mauTimeSeries || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#E8927C" strokeWidth={2} dot={{ fill: '#E8927C' }} name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Goal Alignment */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">User Goals Distribution</h3>
            {analytics?.goalAlignment?.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.goalAlignment} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis
                      type="category"
                      dataKey="goal"
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                      width={140}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#E8927C" radius={[0, 4, 4, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No goal data available</p>
            )}
          </div>
        </div>
      )}

      {/* COURSES SECTION */}
      {activeSection === 'courses' && (
        <div className="space-y-8">
          {/* Top Courses by Enrollment */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Top Courses by Enrollment</h3>
            {analytics?.topCourses?.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topCourses} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis
                      type="category"
                      dataKey="title"
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                      width={180}
                      tickFormatter={(value) => value.length > 25 ? value.slice(0, 25) + '...' : value}
                    />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="#5BBEC4" radius={[0, 4, 4, 0]} name="Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No enrollment data available</p>
            )}
          </div>

          {/* Course Completion Rates */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Course Completion Rates</h3>
            {analytics?.courseCompletionRates?.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.courseCompletionRates} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} />
                    <YAxis
                      type="category"
                      dataKey="title"
                      tick={{ fontSize: 11 }}
                      stroke="#9CA3AF"
                      width={180}
                      tickFormatter={(value) => value.length > 25 ? value.slice(0, 25) + '...' : value}
                    />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="completionRate" fill="#16A34A" radius={[0, 4, 4, 0]} name="Completion Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No completion data available</p>
            )}
          </div>

          {/* Course Details Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Course Performance Details</h3>
            </div>
            <table className="w-full">
              <thead className="bg-[#FAFAF8]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analytics?.topCourses?.slice(0, 10).map((course: any, i: number) => (
                  <tr key={course.courseId} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{course.enrollments}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{course.completions}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        course.completionRate >= 70 ? 'bg-green-100 text-green-700' :
                        course.completionRate >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {course.completionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEMOGRAPHICS SECTION */}
      {activeSection === 'demographics' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Role Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Role Distribution</h3>
              {analytics?.roleDistribution?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.roleDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        nameKey="role"
                        label={({ role, percent }) => `${role} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {analytics.roleDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No role data available</p>
              )}
            </div>

            {/* Grade Level Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Grade Level Distribution</h3>
              {analytics?.gradeDistribution?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="grade" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#5BBEC4" radius={[4, 4, 0, 0]} name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No grade data available</p>
              )}
            </div>

            {/* Experience Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Years of Experience</h3>
              {analytics?.experienceDistribution?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.experienceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#E8B84B" radius={[4, 4, 0, 0]} name="Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No experience data available</p>
              )}
            </div>

            {/* Gender Distribution */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Gender Distribution</h3>
              {analytics?.genderDistribution?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.genderDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        nameKey="gender"
                        label={({ gender, percent }) => `${gender} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {analytics.genderDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No gender data available</p>
              )}
            </div>
          </div>

          {/* State Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Geographic Distribution (Top 10 States)</h3>
            {analytics?.stateDistribution?.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.stateDistribution} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#5BBEC4" radius={[0, 4, 4, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No state data available</p>
            )}
          </div>

          {/* Language Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Language Preferences</h3>
            {analytics?.languageDistribution?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.languageDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="count"
                        nameKey="language"
                      >
                        {analytics.languageDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                  {analytics.languageDistribution.map((lang: any, i: number) => (
                    <div key={lang.language} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-sm text-gray-700">{lang.language}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{lang.count} users</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No language data available</p>
            )}
          </div>
        </div>
      )}

      {/* STRESS & WELLNESS SECTION */}
      {activeSection === 'stress' && (
        <div className="space-y-8">
          {/* Stress Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Average Initial Stress</p>
              <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>{stats.avgStressInitial || 'N/A'}</p>
              <p className="text-xs text-gray-400">Scale: 1-10</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Average Current Stress</p>
              <p className="text-2xl font-bold" style={{ color: '#16A34A' }}>{stats.avgStressCurrent || 'N/A'}</p>
              <p className="text-xs text-gray-400">Scale: 1-10</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Users Improved</p>
              <p className="text-2xl font-bold" style={{ color: '#5BBEC4' }}>{stats.improvementRate || 0}%</p>
              <p className="text-xs text-gray-400">Lower stress score</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Avg Reduction</p>
              <p className="text-2xl font-bold" style={{ color: '#E8927C' }}>{insights.avgStressReduction || 0}</p>
              <p className="text-xs text-gray-400">Points improved</p>
            </div>
          </div>

          {/* Stress by Role */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Stress Comparison by Role</h3>
            {analytics?.stressRoleComparison?.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.stressRoleComparison} margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="role" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgInitial" name="Initial Stress" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgCurrent" name="Current Stress" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No stress data by role available</p>
            )}
          </div>

          {/* Stress Trends Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Stress Check-in Trends</h3>
            {analytics?.stressTimeSeries?.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.stressTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis domain={[1, 10]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgScore" stroke="#E8B84B" strokeWidth={2} dot={{ fill: '#E8B84B' }} name="Avg Stress" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No stress check-in data available</p>
            )}
          </div>
        </div>
      )}

      {/* ENGAGEMENT SECTION */}
      {activeSection === 'engagement' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Activity by Day of Week */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Activity by Day of Week</h3>
              {analytics?.activityByDay?.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.activityByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="count" name="Activity" radius={[4, 4, 0, 0]}>
                        {analytics.activityByDay.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.isPeak ? '#E8B84B' : '#5BBEC4'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No activity data available</p>
              )}
            </div>

            {/* Activity by Hour */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Activity by Hour</h3>
              {analytics?.activityByHour?.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.activityByHour}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#9CA3AF" interval={0} />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar dataKey="count" name="Activity" radius={[4, 4, 0, 0]}>
                        {analytics.activityByHour.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.isPeak ? '#E8B84B' : '#5BBEC4'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No hourly data available</p>
              )}
            </div>
          </div>

          {/* Monthly Active Users Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Active Users</h3>
            {analytics?.mauTimeSeries?.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.mauTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#5BBEC4" strokeWidth={2} dot={{ fill: '#5BBEC4' }} name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No MAU data available</p>
            )}
          </div>

          {/* Peak Times Summary */}
          <div className="bg-gradient-to-r from-[#5BBEC4]/10 to-[#E8B84B]/10 rounded-lg p-5 border border-[#5BBEC4]/20">
            <h3 className="font-semibold text-gray-900 mb-3">Peak Activity Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Peak Day</p>
                <p className="text-lg font-bold text-[#2B3A67]">{insights.peakDay || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Peak Hour</p>
                <p className="text-lg font-bold text-[#2B3A67]">{insights.peakHour || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Recommendation</p>
                <p className="text-sm text-gray-700">Schedule new content releases and emails for {insights.peakDay || 'weekdays'} around {insights.peakHour || 'mid-morning'} for maximum engagement.</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
