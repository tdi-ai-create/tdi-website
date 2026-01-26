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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isAdmin, getAllCreators, createCreator } from '@/lib/creator-portal-data';
import type { CreatorListItem } from '@/types/creator-portal';

export default function AdminCreatorsPage() {
  const router = useRouter();
  const [creators, setCreators] = useState<CreatorListItem[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCreator, setNewCreator] = useState({
    name: '',
    email: '',
    course_title: '',
    course_audience: '',
    target_launch_month: '',
  });

  const loadCreators = useCallback(async () => {
    const data = await getAllCreators();
    setCreators(data);
    setFilteredCreators(data);
    setIsLoading(false);
  }, []);

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

      await loadCreators();
    };

    checkAuth();
  }, [router, loadCreators]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCreators(creators);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = creators.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.course_title?.toLowerCase().includes(query) ?? false)
    );
    setFilteredCreators(filtered);
  }, [searchQuery, creators]);

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

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#80a4ed]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#80a4ed]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1e2749]">{totalCreators}</p>
                <p className="text-sm text-gray-600">Total Creators</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ffba06]/20 flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-[#ffba06]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1e2749]">{inProgressCreators}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1e2749]">{launchedCreators}</p>
                <p className="text-sm text-gray-600">Launched</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or course title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
              />
            </div>
          </div>

          {/* Creator list */}
          <div className="divide-y divide-gray-100">
            {filteredCreators.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchQuery
                  ? 'No creators found matching your search.'
                  : 'No creators yet. Add your first creator to get started.'}
              </div>
            ) : (
              filteredCreators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/admin/creators/${creator.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1e2749] text-white flex items-center justify-center font-medium">
                      {creator.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749]">{creator.name}</p>
                      <p className="text-sm text-gray-500">{creator.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-[#1e2749]">
                        {creator.course_title || 'No course yet'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {creator.current_phase.replace('_', ' ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#1e2749]">
                          {creator.progressPercentage}%
                        </p>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              creator.progressPercentage === 100
                                ? 'bg-green-500'
                                : 'bg-[#80a4ed]'
                            }`}
                            style={{ width: `${creator.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
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
