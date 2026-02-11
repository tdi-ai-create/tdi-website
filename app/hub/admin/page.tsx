'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import {
  isAdmin,
  getAdminCourses,
  toggleCoursePublished,
  getAdminEnrollments,
  getAdminTips,
  updateTipStatus,
  createTip,
  deleteTip,
  getAdminRequests,
  updateRequestStatus,
  getAdminStats,
} from '@/lib/hub/admin';
import { getSupabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BookOpen,
  Users,
  Award,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

type Tab = 'courses' | 'enrollments' | 'tips' | 'requests' | 'stats';

const TABS: { id: Tab; label: string }[] = [
  { id: 'stats', label: 'Stats' },
  { id: 'courses', label: 'Courses' },
  { id: 'enrollments', label: 'Enrollments' },
  { id: 'tips', label: 'TDI Tips' },
  { id: 'requests', label: 'Requests' },
];

const TIP_CATEGORIES = ['wellness', 'motivation', 'self-care', 'mindset', 'general'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useHub();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [isLoading, setIsLoading] = useState(true);

  // Courses state
  const [courses, setCourses] = useState<any[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Enrollments state
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentFilters, setEnrollmentFilters] = useState({
    courseId: '',
    status: '',
    search: '',
  });
  const [allCourses, setAllCourses] = useState<any[]>([]);

  // Tips state
  const [tips, setTips] = useState<any[]>([]);
  const [showAddTip, setShowAddTip] = useState(false);
  const [newTipContent, setNewTipContent] = useState('');
  const [newTipCategory, setNewTipCategory] = useState('general');

  // Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  // Stats state
  const [stats, setStats] = useState<any>(null);

  // Check admin access
  useEffect(() => {
    async function checkAccess() {
      // If no user, redirect to login (HubAuthGuard should handle this, but just in case)
      if (!user?.id) {
        router.push('/hub/login');
        return;
      }

      const authorized = await isAdmin(user.id, user.email || undefined);
      setIsAuthorized(authorized);

      if (!authorized) {
        router.push('/hub');
      }
    }

    checkAccess();
  }, [user, router]);

  // Load data based on active tab
  useEffect(() => {
    if (!isAuthorized) return;

    async function loadData() {
      setIsLoading(true);
      try {
        switch (activeTab) {
          case 'stats':
            const statsData = await getAdminStats();
            setStats(statsData);
            break;
          case 'courses':
            const coursesData = await getAdminCourses();
            setCourses(coursesData);
            break;
          case 'enrollments':
            const [enrollmentsData, coursesForFilter] = await Promise.all([
              getAdminEnrollments(enrollmentFilters),
              getAdminCourses(),
            ]);
            setEnrollments(enrollmentsData);
            setAllCourses(coursesForFilter);
            break;
          case 'tips':
            const tipsData = await getAdminTips();
            setTips(tipsData);
            break;
          case 'requests':
            const requestsData = await getAdminRequests();
            setRequests(requestsData);
            break;
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthorized, activeTab, enrollmentFilters]);

  // Handle course publish toggle
  const handleTogglePublished = async (courseId: string, currentStatus: boolean) => {
    const success = await toggleCoursePublished(courseId, !currentStatus);
    if (success) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, is_published: !currentStatus } : c))
      );
    }
  };

  // Handle tip status change
  const handleTipStatusChange = async (tipId: string, newStatus: string) => {
    const success = await updateTipStatus(tipId, newStatus);
    if (success) {
      setTips((prev) =>
        prev.map((t) => (t.id === tipId ? { ...t, approval_status: newStatus } : t))
      );
    }
  };

  // Handle add tip
  const handleAddTip = async () => {
    if (!newTipContent.trim()) return;

    const success = await createTip(newTipContent.trim(), newTipCategory);
    if (success) {
      const tipsData = await getAdminTips();
      setTips(tipsData);
      setNewTipContent('');
      setNewTipCategory('general');
      setShowAddTip(false);
    }
  };

  // Handle delete tip
  const handleDeleteTip = async (tipId: string) => {
    if (!confirm('Are you sure you want to delete this tip?')) return;

    const success = await deleteTip(tipId);
    if (success) {
      setTips((prev) => prev.filter((t) => t.id !== tipId));
    }
  };

  // Handle request status change
  const handleRequestStatusChange = async (requestId: string, newStatus: string) => {
    const success = await updateRequestStatus(requestId, newStatus);
    if (success) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, metadata: { ...r.metadata, status: newStatus } }
            : r
        )
      );
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: '#D1FAE5', text: '#065F46' },
      completed: { bg: '#D1FAE5', text: '#065F46' },
      approved: { bg: '#D1FAE5', text: '#065F46' },
      pending: { bg: '#FEF3C7', text: '#92400E' },
      new: { bg: '#DBEAFE', text: '#1E40AF' },
      reviewed: { bg: '#FEF3C7', text: '#92400E' },
      planned: { bg: '#E0E7FF', text: '#3730A3' },
      draft: { bg: '#F3F4F6', text: '#374151' },
      rejected: { bg: '#FEE2E2', text: '#991B1B' },
      dropped: { bg: '#FEE2E2', text: '#991B1B' },
    };

    const color = colors[status] || colors.pending;

    return (
      <span
        className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full capitalize"
        style={{
          backgroundColor: color.bg,
          color: color.text,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {status}
      </span>
    );
  };

  // Loading state
  if (isAuthorized === null) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8B84B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  // Not authorized (will redirect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Teachers Deserve It Admin Dashboard
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage courses, enrollments, tips, and view analytics.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: activeTab === tab.id ? '#2B3A67' : '#6B7280',
                borderBottomColor: activeTab === tab.id ? '#E8B84B' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-[#E8B84B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Loading...
          </p>
        </div>
      ) : (
        <>
          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={stats.totalUsers}
                />
                <StatCard
                  icon={BookOpen}
                  label="Enrollments"
                  value={stats.totalEnrollments}
                />
                <StatCard
                  icon={Award}
                  label="Completions"
                  value={stats.totalCompletions}
                />
                <StatCard
                  icon={Award}
                  label="Certificates"
                  value={stats.totalCertificates}
                />
                <StatCard
                  icon={Clock}
                  label="PD Hours"
                  value={stats.totalPdHours}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Avg Stress"
                  value={stats.avgStressScore}
                  subtitle="1=great, 5=rough"
                />
              </div>

              {/* Enrollments per Course Chart */}
              {stats.courseEnrollments.length > 0 && (
                <div className="hub-card">
                  <h3
                    className="font-semibold mb-4"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '16px',
                      color: '#2B3A67',
                    }}
                  >
                    Enrollments by Course
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.courseEnrollments.slice(0, 10)}>
                        <XAxis
                          dataKey="title"
                          tick={{ fontSize: 11, fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E5E5' }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                          tickLine={false}
                          axisLine={{ stroke: '#E5E5E5' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E5E5',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="#E8B84B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="hub-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FAFAF8' }}>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Title
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Category
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      PD Hours
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Lessons
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Enrollments
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr
                      key={course.id}
                      className="border-t border-gray-100"
                      style={{ backgroundColor: index % 2 === 0 ? 'white' : '#FAFAF8' }}
                    >
                      <td className="p-3">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedCourses);
                            if (newExpanded.has(course.id)) {
                              newExpanded.delete(course.id);
                            } else {
                              newExpanded.add(course.id);
                            }
                            setExpandedCourses(newExpanded);
                          }}
                          className="flex items-center gap-2 text-left font-medium text-[14px] hover:text-[#E8B84B]"
                          style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {expandedCourses.has(course.id) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                          {course.title}
                        </button>
                      </td>
                      <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                        {course.category}
                      </td>
                      <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                        {course.pd_hours}
                      </td>
                      <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                        {course.lessons_count}
                      </td>
                      <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                        {course.enrollments_count}
                      </td>
                      <td className="p-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={course.is_published}
                            onChange={() => handleTogglePublished(course.id, course.is_published)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <StatusBadge status={course.is_published ? 'active' : 'draft'} />
                        </label>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No courses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={enrollmentFilters.courseId}
                  onChange={(e) =>
                    setEnrollmentFilters((prev) => ({ ...prev, courseId: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <option value="">All Courses</option>
                  {allCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <select
                  value={enrollmentFilters.status}
                  onChange={(e) =>
                    setEnrollmentFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={enrollmentFilters.search}
                    onChange={(e) =>
                      setEnrollmentFilters((prev) => ({ ...prev, search: e.target.value }))
                    }
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''} found
              </p>

              {/* Table */}
              <div className="hub-card overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr style={{ backgroundColor: '#FAFAF8' }}>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                        User
                      </th>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                        Course
                      </th>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                        Enrolled
                      </th>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                        Progress
                      </th>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment, index) => {
                      const user = Array.isArray(enrollment.user)
                        ? enrollment.user[0]
                        : enrollment.user;
                      const course = Array.isArray(enrollment.course)
                        ? enrollment.course[0]
                        : enrollment.course;

                      return (
                        <tr
                          key={enrollment.id}
                          className="border-t border-gray-100"
                          style={{ backgroundColor: index % 2 === 0 ? 'white' : '#FAFAF8' }}
                        >
                          <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {user?.display_name || user?.email || 'Unknown'}
                          </td>
                          <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {course?.title || 'Unknown'}
                          </td>
                          <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {new Date(enrollment.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {enrollment.progress_pct || 0}%
                          </td>
                          <td className="p-3">
                            <StatusBadge status={enrollment.status} />
                          </td>
                        </tr>
                      );
                    })}
                    {enrollments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No enrollments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tips Tab */}
          {activeTab === 'tips' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowAddTip(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Plus size={16} />
                Add Tip
              </button>

              {/* Add Tip Form */}
              {showAddTip && (
                <div className="hub-card" style={{ backgroundColor: '#FFF8E7' }}>
                  <h3
                    className="font-semibold mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
                  >
                    Add New Tip
                  </h3>
                  <textarea
                    value={newTipContent}
                    onChange={(e) => setNewTipContent(e.target.value)}
                    placeholder="Enter tip content..."
                    className="w-full p-3 border border-gray-200 rounded-lg mb-3"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={newTipCategory}
                      onChange={(e) => setNewTipCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {TIP_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddTip}
                      className="px-4 py-2 rounded-lg font-medium text-sm"
                      style={{
                        backgroundColor: '#2B3A67',
                        color: 'white',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Save Tip
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTip(false);
                        setNewTipContent('');
                      }}
                      className="px-4 py-2 text-gray-500 text-sm"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Tips Table */}
              <div className="hub-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#FAFAF8' }}>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                        Content
                      </th>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500 w-24">
                        Category
                      </th>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500 w-32">
                        Status
                      </th>
                      <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500 w-16">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tips.map((tip, index) => (
                      <tr
                        key={tip.id}
                        className="border-t border-gray-100"
                        style={{ backgroundColor: index % 2 === 0 ? 'white' : '#FAFAF8' }}
                      >
                        <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                          {tip.content?.substring(0, 100)}
                          {(tip.content?.length || 0) > 100 && '...'}
                        </td>
                        <td className="p-3 text-[14px] capitalize" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                          {tip.category}
                        </td>
                        <td className="p-3">
                          <select
                            value={tip.approval_status}
                            onChange={(e) => handleTipStatusChange(tip.id, e.target.value)}
                            className="text-sm border border-gray-200 rounded px-2 py-1"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeleteTip(tip.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tips.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No tips found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="hub-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#FAFAF8' }}>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Title
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Type
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Priority
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      User
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Date
                    </th>
                    <th className="text-left p-3 text-[12px] uppercase font-semibold text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, index) => {
                    const user = Array.isArray(request.user)
                      ? request.user[0]
                      : request.user;
                    const metadata = request.metadata || {};

                    return (
                      <>
                        <tr
                          key={request.id}
                          className="border-t border-gray-100 cursor-pointer hover:bg-gray-50"
                          style={{ backgroundColor: index % 2 === 0 ? 'white' : '#FAFAF8' }}
                          onClick={() => {
                            const newExpanded = new Set(expandedRequests);
                            if (newExpanded.has(request.id)) {
                              newExpanded.delete(request.id);
                            } else {
                              newExpanded.add(request.id);
                            }
                            setExpandedRequests(newExpanded);
                          }}
                        >
                          <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            <div className="flex items-center gap-2">
                              {expandedRequests.has(request.id) ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                              {metadata.title || 'Untitled'}
                            </div>
                          </td>
                          <td className="p-3 text-[14px] capitalize" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {metadata.type || '-'}
                          </td>
                          <td className="p-3 text-[14px] capitalize" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {metadata.priority || '-'}
                          </td>
                          <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {user?.display_name || user?.email || 'Unknown'}
                          </td>
                          <td className="p-3 text-[14px]" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={metadata.status || 'new'}
                              onChange={(e) => handleRequestStatusChange(request.id, e.target.value)}
                              className="text-sm border border-gray-200 rounded px-2 py-1"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              <option value="new">New</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="planned">Planned</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                        {expandedRequests.has(request.id) && (
                          <tr style={{ backgroundColor: '#FAFAF8' }}>
                            <td colSpan={6} className="p-4">
                              <p
                                className="text-sm text-gray-600"
                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                              >
                                {metadata.description || 'No description provided.'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Stat Card Component
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
    <div className="hub-card text-center">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
        style={{ backgroundColor: '#FFF8E7' }}
      >
        <Icon size={20} style={{ color: '#E8B84B' }} />
      </div>
      <p
        className="text-2xl font-bold"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          color: '#2B3A67',
        }}
      >
        {value}
      </p>
      <p
        className="text-xs text-gray-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
      {subtitle && (
        <p
          className="text-[10px] text-gray-400 mt-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
