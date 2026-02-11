'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Users,
  Building2,
  School,
  Plus,
  X,
  Loader2,
  Copy,
  Check,
  Mail,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  Filter,
  AlertCircle,
  Trash2,
  Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Types
interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  slug: string | null;
  contact_name: string;
  contact_email: string;
  contract_phase: 'IGNITE' | 'ACCELERATE' | 'SUSTAIN';
  contract_start: string | null;
  contract_end: string | null;
  building_count: number;
  observation_days_total: number;
  virtual_sessions_total: number;
  executive_sessions_total: number;
  invite_token: string;
  invite_sent_at: string | null;
  invite_accepted_at: string | null;
  status: 'invited' | 'setup_in_progress' | 'active' | 'paused' | 'completed';
  created_at: string;
  org_name: string | null;
  staff_count: number;
}

interface Stats {
  activeCount: number;
  totalEducators: number;
  pendingSetup: number;
  awaitingAccept: number;
}

// Check if user is TDI admin
async function checkTDIAdmin(email: string): Promise<boolean> {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

// Status badge colors
const statusColors: Record<string, string> = {
  invited: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  setup_in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  paused: 'bg-gray-100 text-gray-600 border-gray-200',
  completed: 'bg-purple-100 text-purple-700 border-purple-200',
};

const statusLabels: Record<string, string> = {
  invited: 'Awaiting Accept',
  setup_in_progress: 'Setup In Progress',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

// Phase badge colors
const phaseColors: Record<string, string> = {
  IGNITE: 'bg-orange-100 text-orange-700',
  ACCELERATE: 'bg-blue-100 text-blue-700',
  SUSTAIN: 'bg-green-100 text-green-700',
};

// Helper function for relative time
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
}

export default function AdminPartnershipsPage() {
  const router = useRouter();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [filteredPartnerships, setFilteredPartnerships] = useState<Partnership[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [newPartnership, setNewPartnership] = useState({
    partnership_type: 'district' as 'district' | 'school',
    contact_name: '',
    contact_email: '',
    contract_phase: 'IGNITE' as 'IGNITE' | 'ACCELERATE' | 'SUSTAIN',
    contract_start: '',
    contract_end: '',
    building_count: 1,
    observation_days_total: 0,
    virtual_sessions_total: 0,
    executive_sessions_total: 0,
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnershipToDelete, setPartnershipToDelete] = useState<Partnership | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Login state for unauthenticated users
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loadPartnerships = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/admin/partnerships', {
        headers: {
          'x-user-email': email,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPartnerships(data.partnerships);
          setFilteredPartnerships(data.partnerships);
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Failed to load partnerships:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        // No session - show login form instead of redirecting
        setShowLoginForm(true);
        setIsLoading(false);
        return;
      }

      const isAdmin = await checkTDIAdmin(session.user.email);
      if (!isAdmin) {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }

      setUserEmail(session.user.email);
      await loadPartnerships(session.user.email);
    };

    checkAuth();
  }, [router, loadPartnerships]);

  // Handle login for admin panel
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Check if email is TDI domain before attempting login
      if (!loginEmail.toLowerCase().endsWith('@teachersdeserveit.com')) {
        setLoginError('This admin panel is only for TDI team members.');
        setIsLoggingIn(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        setLoginError(error.message);
        setIsLoggingIn(false);
        return;
      }

      if (data.session) {
        setShowLoginForm(false);
        setUserEmail(data.session.user.email || null);
        await loadPartnerships(data.session.user.email || '');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Filter partnerships
  useEffect(() => {
    if (!partnerships.length) return;

    let filtered = [...partnerships];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.contact_name.toLowerCase().includes(query) ||
          p.contact_email.toLowerCase().includes(query) ||
          (p.org_name?.toLowerCase().includes(query) ?? false)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((p) => p.partnership_type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    // Phase filter
    if (filterPhase !== 'all') {
      filtered = filtered.filter((p) => p.contract_phase === filterPhase);
    }

    setFilteredPartnerships(filtered);
  }, [searchQuery, partnerships, filterType, filterStatus, filterPhase]);

  const handleAddPartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setIsAdding(true);

    try {
      const response = await fetch('/api/admin/partnerships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify(newPartnership),
      });

      const data = await response.json();

      if (data.success) {
        // Copy invite URL to clipboard
        await navigator.clipboard.writeText(data.inviteUrl);
        setCopiedId(data.partnership.id);
        setTimeout(() => setCopiedId(null), 3000);

        setShowAddModal(false);
        setNewPartnership({
          partnership_type: 'district',
          contact_name: '',
          contact_email: '',
          contract_phase: 'IGNITE',
          contract_start: '',
          contract_end: '',
          building_count: 1,
          observation_days_total: 0,
          virtual_sessions_total: 0,
          executive_sessions_total: 0,
        });

        await loadPartnerships(userEmail);
      }
    } catch (error) {
      console.error('Error creating partnership:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const copyInviteLink = async (token: string, id: string) => {
    const url = `${window.location.origin}/partner-setup/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const openDeleteModal = (partnership: Partnership) => {
    setPartnershipToDelete(partnership);
    setDeleteConfirmation('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!partnershipToDelete || !userEmail) return;

    const expectedName = partnershipToDelete.org_name || partnershipToDelete.contact_name;
    if (deleteConfirmation !== expectedName) {
      setDeleteError('Name does not match. Please type the exact name to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch(`/api/admin/partnerships/${partnershipToDelete.id}/delete`, {
        method: 'DELETE',
        headers: {
          'x-user-email': userEmail,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setPartnerships(prev => prev.filter(p => p.id !== partnershipToDelete.id));
        setFilteredPartnerships(prev => prev.filter(p => p.id !== partnershipToDelete.id));

        // Update stats
        if (stats) {
          setStats({
            ...stats,
            activeCount: stats.activeCount - (partnershipToDelete.status === 'active' ? 1 : 0),
            totalEducators: stats.totalEducators - partnershipToDelete.staff_count,
            pendingSetup: stats.pendingSetup - (partnershipToDelete.status === 'setup_in_progress' ? 1 : 0),
            awaitingAccept: stats.awaitingAccept - (partnershipToDelete.status === 'invited' ? 1 : 0),
          });
        }

        setShowDeleteModal(false);
        setPartnershipToDelete(null);
        setDeleteConfirmation('');

        // Show success message
        setDeleteSuccess('Partnership deleted. Email can now be reused.');
        setTimeout(() => setDeleteSuccess(''), 5000);
      } else {
        setDeleteError(data.error || 'Failed to delete partnership');
      }
    } catch (error) {
      console.error('Error deleting partnership:', error);
      setDeleteError('Failed to delete partnership. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const activeFiltersCount =
    (filterType !== 'all' ? 1 : 0) +
    (filterStatus !== 'all' ? 1 : 0) +
    (filterPhase !== 'all' ? 1 : 0);

  // Login form for unauthenticated users
  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1e2749] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-[#1e2749] mb-2">TDI Admin Login</h1>
            <p className="text-gray-600 text-sm">
              Sign in with your @teachersdeserveit.com email
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@teachersdeserveit.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#1e2749] text-white px-4 py-3 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1e2749]">
              Return to main site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Access Denied state (logged in but not TDI email)
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-[#1e2749] mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This page is only accessible to TDI team members (@teachersdeserveit.com).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setAccessDenied(false);
                setShowLoginForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors"
            >
              Sign in with TDI account
            </button>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-[#1e2749]"
            >
              Return to main site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading partnerships...</p>
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
            <div className="flex items-center gap-2">
              <span className="text-sm bg-[#1e2749] text-white px-3 py-1 rounded-full">
                TDI Admin
              </span>
              <span className="text-sm text-gray-600">Partnership Management</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/creators"
              className="text-sm text-gray-600 hover:text-[#1e2749]"
            >
              Creator Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1e2749]">Partnership Dashboard</h1>
            <p className="text-gray-600">Manage school and district partnerships</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Partnership
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1e2749]">{stats.activeCount}</p>
                  <p className="text-xs text-gray-600">Active Partnerships</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#80a4ed]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-[#80a4ed]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1e2749]">{stats.totalEducators}</p>
                  <p className="text-xs text-gray-600">Total Educators</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1e2749]">{stats.pendingSetup}</p>
                  <p className="text-xs text-gray-600">Pending Setup</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1e2749]">{stats.awaitingAccept}</p>
                  <p className="text-xs text-gray-600">Awaiting Accept</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partnership Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or organization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
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

            {/* Expanded Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="district">District</option>
                    <option value="school">School</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="invited">Awaiting Accept</option>
                    <option value="setup_in_progress">Setup In Progress</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phase</label>
                  <select
                    value={filterPhase}
                    onChange={(e) => setFilterPhase(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  >
                    <option value="all">All Phases</option>
                    <option value="IGNITE">IGNITE</option>
                    <option value="ACCELERATE">ACCELERATE</option>
                    <option value="SUSTAIN">SUSTAIN</option>
                  </select>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setFilterStatus('all');
                      setFilterPhase('all');
                    }}
                    className="self-end px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Organization
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Phase
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden xl:table-cell">
                    Contact
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Created
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPartnerships.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery || activeFiltersCount > 0
                        ? 'No partnerships found matching your criteria.'
                        : 'No partnerships yet. Create your first partnership to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredPartnerships.map((partnership) => (
                    <tr
                      key={partnership.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/partnerships/${partnership.id}`)}
                    >
                      {/* Organization */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            partnership.partnership_type === 'district'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {partnership.partnership_type === 'district' ? (
                              <Building2 className="w-4 h-4" />
                            ) : (
                              <School className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#1e2749] truncate">
                              {partnership.org_name || partnership.contact_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {partnership.staff_count > 0 ? `${partnership.staff_count} educators` : 'No staff yet'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-700 capitalize">
                          {partnership.partnership_type}
                        </span>
                      </td>

                      {/* Phase */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`inline-flex text-xs px-2 py-1 rounded-full font-medium ${
                          phaseColors[partnership.contract_phase]
                        }`}>
                          {partnership.contract_phase}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs px-2 py-1 rounded-full border ${
                          statusColors[partnership.status]
                        }`}>
                          {statusLabels[partnership.status]}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="text-sm">
                          <p className="text-[#1e2749]">{partnership.contact_name}</p>
                          <p className="text-gray-500 text-xs">{partnership.contact_email}</p>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">
                          {getRelativeTime(partnership.created_at)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/partnerships/${partnership.id}`}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            title="View details"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </Link>
                          {partnership.status === 'invited' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyInviteLink(partnership.invite_token, partnership.id);
                              }}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                                copiedId === partnership.id
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              title="Copy invite link"
                            >
                              {copiedId === partnership.id ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy Link
                                </>
                              )}
                            </button>
                          )}
                          {partnership.slug && partnership.status === 'active' && (
                            <Link
                              href={`/partners/${partnership.slug}-dashboard`}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#80a4ed]/10 text-[#1e2749] hover:bg-[#80a4ed]/20 transition-colors"
                              title="View dashboard"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Dashboard
                            </Link>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(partnership);
                            }}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete partnership"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            Showing {filteredPartnerships.length} of {partnerships.length} partnerships
          </div>
        </div>
      </main>

      {/* Add Partnership Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1e2749]">New Partnership</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartnership} className="p-6 space-y-4">
              {/* Partnership Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partnership Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewPartnership({ ...newPartnership, partnership_type: 'district' })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      newPartnership.partnership_type === 'district'
                        ? 'border-[#1e2749] bg-[#1e2749]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>District</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPartnership({ ...newPartnership, partnership_type: 'school' })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      newPartnership.partnership_type === 'school'
                        ? 'border-[#1e2749] bg-[#1e2749]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <School className="w-5 h-5" />
                    <span>School</span>
                  </button>
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPartnership.contact_name}
                  onChange={(e) => setNewPartnership({ ...newPartnership, contact_name: e.target.value })}
                  placeholder="e.g., Dr. Sarah Johnson"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={newPartnership.contact_email}
                  onChange={(e) => setNewPartnership({ ...newPartnership, contact_email: e.target.value })}
                  placeholder="contact@district.edu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
              </div>

              {/* Contract Phase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Phase *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['IGNITE', 'ACCELERATE', 'SUSTAIN'] as const).map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setNewPartnership({ ...newPartnership, contract_phase: phase })}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        newPartnership.contract_phase === phase
                          ? `${phaseColors[phase]} border-transparent`
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contract Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Start
                  </label>
                  <input
                    type="date"
                    value={newPartnership.contract_start}
                    onChange={(e) => setNewPartnership({ ...newPartnership, contract_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract End
                  </label>
                  <input
                    type="date"
                    value={newPartnership.contract_end}
                    onChange={(e) => setNewPartnership({ ...newPartnership, contract_end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Buildings (for districts) */}
              {newPartnership.partnership_type === 'district' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Buildings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPartnership.building_count}
                    onChange={(e) => setNewPartnership({ ...newPartnership, building_count: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                  />
                </div>
              )}

              {/* Service Allocations */}
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Service Allocations</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Observation Days</label>
                    <input
                      type="number"
                      min="0"
                      value={newPartnership.observation_days_total}
                      onChange={(e) => setNewPartnership({ ...newPartnership, observation_days_total: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Virtual Sessions</label>
                    <input
                      type="number"
                      min="0"
                      value={newPartnership.virtual_sessions_total}
                      onChange={(e) => setNewPartnership({ ...newPartnership, virtual_sessions_total: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Exec Sessions</label>
                    <input
                      type="number"
                      min="0"
                      value={newPartnership.executive_sessions_total}
                      onChange={(e) => setNewPartnership({ ...newPartnership, executive_sessions_total: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create & Copy Link
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                The invite link will be automatically copied to your clipboard.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && partnershipToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#1e2749]">Delete Partnership</h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPartnershipToDelete(null);
                  setDeleteConfirmation('');
                  setDeleteError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Delete <strong>{partnershipToDelete.org_name || partnershipToDelete.contact_name}</strong>?
                This will remove all data and the partner&apos;s account. This cannot be undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700">
                  <strong>What will be deleted:</strong>
                </p>
                <ul className="text-sm text-red-600 mt-2 space-y-1">
                  <li>• Partnership record and all settings</li>
                  <li>• {partnershipToDelete.staff_count} staff members</li>
                  <li>• Action items and activity history</li>
                  <li>• Organization and building data</li>
                  <li>• Partner&apos;s login account (email can be reused)</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type &quot;{partnershipToDelete.org_name || partnershipToDelete.contact_name}&quot; to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => {
                    setDeleteConfirmation(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="Enter name to confirm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPartnershipToDelete(null);
                    setDeleteConfirmation('');
                    setDeleteError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || deleteConfirmation !== (partnershipToDelete.org_name || partnershipToDelete.contact_name)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {deleteSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-5">
          <Check className="w-5 h-5" />
          {deleteSuccess}
        </div>
      )}
    </div>
  );
}
