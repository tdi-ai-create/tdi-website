'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Users,
  PlayCircle,
  Rocket,
  Plus,
  X,
  Loader2,
  ChevronRight,
  CheckCircle,
  PenLine,
  Package,
  GraduationCap,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isAdmin, getAllCreators, createCreator } from '@/lib/creator-portal-data';
import { AdminTasks, type AdminNotification } from '@/components/admin/AdminTasks';
import type { CreatorListItem } from '@/types/creator-portal';

export default function AdminCreatorsPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<CreatorListItem[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorListItem[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    course_title: '',
    course_audience: '',
    target_launch_month: '',
  });

  // Filter state
  const [filterPath, setFilterPath] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadCreators = useCallback(async () => {
    const data = await getAllCreators();
    setCreators(data);
    setFilteredCreators(data);
    setIsLoading(false);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, adminEmail }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, adminEmail }),
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.push('/creator-portal');
        return;
      }

      const adminStatus = await isAdmin(session.user.email);
      if (!adminStatus) {
        router.push('/creator-portal');
        return;
      }

      setAdminEmail(session.user.email);
      await Promise.all([loadCreators(), loadNotifications()]);
    };

    checkAuth();
  }, [router, loadCreators, loadNotifications]);

  useEffect(() => {
    let filtered = creators;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          (c.course_title?.toLowerCase().includes(query) ?? false)
      );
    }

    // Apply content path filter
    if (filterPath !== 'all') {
      filtered = filtered.filter((c) => c.content_path === filterPath);
    }

    // Apply phase filter
    if (filterPhase !== 'all') {
      filtered = filtered.filter((c) => c.current_phase === filterPhase);
    }

    setFilteredCreators(filtered);
  }, [searchQuery, creators, filterPath, filterPhase]);

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const creator = await createCreator(newCreator);
      if (creator) {
        setShowAddModal(false);
        setNewCreator({
          name: '',
          email: '',
          course_title: '',
          course_audience: '',
          target_launch_month: '',
        });
        await loadCreators();
      }
    } catch (error) {
      console.error('Error adding creator:', error);
    } finally {
      setIsAdding(false);
    }
  };

  // Stats calculations
  const totalCreators = creators.length;
  const inProgressCreators = creators.filter(
    (c) => c.progressPercentage > 0 && c.progressPercentage < 100
  ).length;
  const launchedCreators = creators.filter(
    (c) => c.progressPercentage === 100
  ).length;
  const needsAttentionCreators = creators.filter((c) => {
    // Needs attention if they have notifications
    return notifications.some((n) => n.creator_id === c.id);
  }).length;

  // Helper functions for content path display
  const getPathIcon = (path: string | null) => {
    switch (path) {
      case 'blog':
        return <PenLine className="w-4 h-4" />;
      case 'download':
        return <Package className="w-4 h-4" />;
      case 'course':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPathLabel = (path: string | null) => {
    switch (path) {
      case 'blog':
        return 'Blog Post';
      case 'download':
        return 'Download';
      case 'course':
        return 'Course';
      default:
        return 'Not selected';
    }
  };

  const getPathBadgeColor = (path: string | null) => {
    switch (path) {
      case 'blog':
        return 'bg-purple-100 text-purple-700';
      case 'download':
        return 'bg-blue-100 text-blue-700';
      case 'course':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getPhaseBadgeColor = (phase: string) => {
    switch (phase) {
      case 'onboarding':
        return 'bg-yellow-100 text-yellow-700';
      case 'agreement':
        return 'bg-orange-100 text-orange-700';
      case 'course_design':
        return 'bg-blue-100 text-blue-700';
      case 'production':
        return 'bg-purple-100 text-purple-700';
      case 'launch':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatPhase = (phase: string) => {
    return phase.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getLastActivity = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const hasNotification = (creatorId: string) => {
    return notifications.some((n) => n.creator_id === creatorId);
  };

  const activeFiltersCount = (filterPath !== 'all' ? 1 : 0) + (filterPhase !== 'all' ? 1 : 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={140}
              height={42}
              className="h-10 w-auto"
            />
            <span className="text-sm bg-[#1e2749] text-white px-3 py-1 rounded-full">
              Admin
            </span>
          </div>

          <Link
            href="/creator-portal/dashboard"
            className="text-sm text-gray-600 hover:text-[#1e2749]"
          >
            Exit Admin View
          </Link>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e2749]">Content Creators</h1>
            <p className="text-gray-600">Manage and track creator progress</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Creator
          </button>
        </div>

        {/* Admin Tasks / Notifications */}
        <AdminTasks
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* All caught up message when no notifications */}
        {notifications.length === 0 && creators.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">All caught up! No pending actions.</p>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#80a4ed]/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-[#80a4ed]" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-[#1e2749]">{totalCreators}</p>
                <p className="text-xs md:text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-[#1e2749]">{needsAttentionCreators}</p>
                <p className="text-xs md:text-sm text-gray-600">Needs Attention</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ffba06]/20 flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-5 h-5 md:w-6 md:h-6 text-[#ffba06]" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-[#1e2749]">{inProgressCreators}</p>
                <p className="text-xs md:text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-[#1e2749]">{launchedCreators}</p>
                <p className="text-xs md:text-sm text-gray-600">Launched</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or course title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'border-[#80a4ed] bg-[#80a4ed]/10 text-[#1e2749]'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-[#80a4ed] text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter options */}
          {showFilters && (
            <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Content Path</label>
                <select
                  value={filterPath}
                  onChange={(e) => setFilterPath(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                >
                  <option value="all">All Paths</option>
                  <option value="blog">Blog Post</option>
                  <option value="download">Download</option>
                  <option value="course">Course</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phase</label>
                <select
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                >
                  <option value="all">All Phases</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="agreement">Agreement</option>
                  <option value="course_design">Course Design</option>
                  <option value="production">Production</option>
                  <option value="launch">Launch</option>
                </select>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setFilterPath('all');
                    setFilterPhase('all');
                  }}
                  className="self-end px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Creator Cards Grid */}
        {filteredCreators.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            {searchQuery || activeFiltersCount > 0
              ? 'No creators found matching your criteria.'
              : 'No creators yet. Add your first creator to get started.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCreators.map((creator) => (
              <Link
                key={creator.id}
                href={`/admin/creators/${creator.id}`}
                className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all group ${
                  hasNotification(creator.id)
                    ? 'border-orange-300 shadow-sm'
                    : 'border-gray-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${
                      creator.progressPercentage === 100
                        ? 'bg-green-500 text-white'
                        : 'bg-[#1e2749] text-white'
                    }`}>
                      {creator.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1e2749] group-hover:text-[#80a4ed] transition-colors">
                        {creator.name}
                      </p>
                      <p className="text-sm text-gray-500">{creator.email}</p>
                    </div>
                  </div>
                  {hasNotification(creator.id) && (
                    <span className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Action needed
                    </span>
                  )}
                </div>

                {/* Course Title */}
                {creator.course_title && (
                  <p className="text-sm font-medium text-[#1e2749] mb-3 line-clamp-1">
                    {creator.course_title}
                  </p>
                )}

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Content Path Badge */}
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${getPathBadgeColor(creator.content_path)}`}>
                    {getPathIcon(creator.content_path)}
                    {getPathLabel(creator.content_path)}
                  </span>

                  {/* Phase Badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-full ${getPhaseBadgeColor(creator.current_phase)}`}>
                    {formatPhase(creator.current_phase)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-[#1e2749]">
                      {creator.completedMilestones}/{creator.totalMilestones} milestones ({creator.progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        creator.progressPercentage === 100
                          ? 'bg-green-500'
                          : 'bg-[#80a4ed]'
                      }`}
                      style={{ width: `${creator.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {getLastActivity(creator.updated_at)}
                  </span>
                  {creator.target_launch_month && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {creator.target_launch_month}
                    </span>
                  )}
                </div>

                {/* Hover Arrow */}
                <div className="mt-3 flex justify-end">
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#80a4ed] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Add Creator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1e2749]">Add Creator</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCreator} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCreator.name}
                  onChange={(e) =>
                    setNewCreator({ ...newCreator, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newCreator.email}
                  onChange={(e) =>
                    setNewCreator({ ...newCreator, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={newCreator.course_title}
                  onChange={(e) =>
                    setNewCreator({ ...newCreator, course_title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={newCreator.course_audience}
                  onChange={(e) =>
                    setNewCreator({ ...newCreator, course_audience: e.target.value })
                  }
                  placeholder="e.g., Elementary teachers, K-12 paras"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Launch Month
                </label>
                <input
                  type="text"
                  value={newCreator.target_launch_month}
                  onChange={(e) =>
                    setNewCreator({ ...newCreator, target_launch_month: e.target.value })
                  }
                  placeholder="e.g., March 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Creator'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
