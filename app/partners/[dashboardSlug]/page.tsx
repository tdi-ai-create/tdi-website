'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Users,
  BookOpen,
  Star,
  Heart,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  Building,
  User,
  BarChart3,
  FileText,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Upload,
  Pause,
  Play,
  Zap,
  TrendingUp,
  School,
  Sparkles,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Types
interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  slug: string;
  contact_name: string;
  contact_email: string;
  contract_phase: 'IGNITE' | 'ACCELERATE' | 'SUSTAIN';
  contract_start: string | null;
  contract_end: string | null;
  building_count: number;
  observation_days_total: number;
  observation_days_completed: number;
  virtual_sessions_total: number;
  virtual_sessions_completed: number;
  executive_sessions_total: number;
  status: string;
}

interface Organization {
  id: string;
  name: string;
  org_type: string;
  address_city: string;
  address_state: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'paused';
  sort_order: number;
  evidence_file_path?: string;
  completed_at?: string;
  paused_at?: string;
}

interface MetricSnapshot {
  id: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
}

interface StaffStats {
  total: number;
  hubLoggedIn: number;
}

// Design colors
const colors = {
  navy: '#1B2A4A',
  navyLight: '#1e2749',
  blue: '#35A7FF',
  blueAccent: '#38618C',
  yellow: '#FFBA06',
  teal: '#4ecdc4',
  amber: '#f59e0b',
  coral: '#F96767',
  green: '#22c55e',
  gray: '#9CA3AF',
};

// Icon mapping by category
const categoryIcons: Record<string, React.ElementType> = {
  onboarding: BookOpen,
  scheduling: Calendar,
  engagement: Star,
  data: BarChart3,
  documentation: FileText,
};

// Priority groups
const priorityGroups = {
  high: { label: 'Get Started', color: colors.coral, emoji: '' },
  medium: { label: 'Build Your Foundation', color: colors.amber, emoji: '' },
  low: { label: 'When You\'re Ready', color: colors.gray, emoji: '' },
};

// Donut chart component
const DonutChart = ({
  value,
  max,
  color,
  size = 72,
  strokeWidth = 6,
  label,
  subLabel,
  ariaLabel,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label: string;
  subLabel?: string;
  ariaLabel: string;
}) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center" aria-label={ariaLabel}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>
            {label}
          </span>
        </div>
      </div>
      {subLabel && (
        <p className="text-xs text-gray-500 mt-2 text-center">{subLabel}</p>
      )}
    </div>
  );
};

// Toast component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-[#1e2749] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-5">
      <Check className="w-5 h-5 text-teal-400" />
      {message}
    </div>
  );
};

export default function PartnerDashboard() {
  const router = useRouter();
  const params = useParams();
  const dashboardSlug = params.dashboardSlug as string;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Data state
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStats>({ total: 0, hubLoggedIn: 0 });
  const [metricSnapshots, setMetricSnapshots] = useState<MetricSnapshot[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showPausedItems, setShowPausedItems] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  // View tracking refs
  const tabStartTime = useRef<number>(Date.now());
  const currentTab = useRef<string>('overview');

  // Check if slug matches dashboard pattern
  const slugMatch = dashboardSlug?.match(/^(.+)-dashboard$/);
  const partnerSlug = slugMatch ? slugMatch[1] : null;

  // Check TDI admin
  const isTDIAdmin = (email: string) => email.toLowerCase().endsWith('@teachersdeserveit.com');

  // Load dashboard data
  const loadDashboardData = useCallback(async (partnershipId: string) => {
    try {
      const response = await fetch(`/api/partners/dashboard/${partnershipId}`, {
        headers: {
          'x-user-id': userId || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrganization(data.organization);
          setActionItems(data.actionItems || []);
          setStaffStats(data.staffStats || { total: 0, hubLoggedIn: 0 });
          setMetricSnapshots(data.metricSnapshots || []);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [userId]);

  // Track tab view
  const trackTabView = useCallback(async (tabName: string, duration: number) => {
    if (!partnership?.id || !userId) return;

    try {
      await fetch('/api/partners/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnership_id: partnership.id,
          user_id: userId,
          tab_name: tabName,
          duration_seconds: Math.round(duration / 1000),
        }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, [partnership?.id, userId]);

  // Handle tab change with tracking
  const handleTabChange = useCallback((newTab: string) => {
    // Track previous tab duration
    const duration = Date.now() - tabStartTime.current;
    trackTabView(currentTab.current, duration);

    // Update refs and state
    currentTab.current = newTab;
    tabStartTime.current = Date.now();
    setActiveTab(newTab);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [trackTabView]);

  // Track on page unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const duration = Date.now() - tabStartTime.current;
        trackTabView(currentTab.current, duration);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [trackTabView]);

  // Auth check and data load
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        // Check if this is a valid dashboard URL
        if (!partnerSlug) {
          setErrorMessage('Invalid dashboard URL');
          setIsLoading(false);
          return;
        }

        // Check auth
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/partners/login');
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        const isAdmin = session.user.email ? isTDIAdmin(session.user.email) : false;

        // Look up partnership by slug
        const { data: partnershipData, error: pError } = await supabase
          .from('partnerships')
          .select('*')
          .eq('slug', partnerSlug)
          .single();

        if (pError || !partnershipData) {
          setErrorMessage('Partnership not found');
          setIsLoading(false);
          return;
        }

        // Check authorization (user linked to partnership OR TDI admin)
        if (!isAdmin) {
          const { data: puData } = await supabase
            .from('partnership_users')
            .select('id')
            .eq('partnership_id', partnershipData.id)
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!puData) {
            setErrorMessage('You do not have access to this dashboard');
            setIsLoading(false);
            return;
          }
        }

        setPartnership(partnershipData);
        setIsAuthorized(true);

        // Load additional data
        await loadDashboardData(partnershipData.id);

        // Log activity
        await fetch('/api/partners/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            action: 'dashboard_viewed',
            details: { tab: 'overview' },
          }),
        });
      } catch (error) {
        console.error('Error in auth check:', error);
        setErrorMessage('Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [partnerSlug, router, loadDashboardData]);

  // Action item handlers
  const handleCompleteItem = async (itemId: string) => {
    if (!partnership?.id || !userId) return;

    try {
      const response = await fetch('/api/partners/action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          status: 'completed',
          userId,
          partnershipId: partnership.id,
        }),
      });

      if (response.ok) {
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, status: 'completed', completed_at: new Date().toISOString() }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error completing item:', error);
    }
  };

  const handlePauseItem = async (itemId: string) => {
    if (!partnership?.id || !userId) return;

    try {
      const response = await fetch('/api/partners/action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          status: 'paused',
          userId,
          partnershipId: partnership.id,
        }),
      });

      if (response.ok) {
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, status: 'paused', paused_at: new Date().toISOString() }
              : item
          )
        );
        setToastMessage('No problem - you can come back to this anytime.');
      }
    } catch (error) {
      console.error('Error pausing item:', error);
    }
  };

  const handleResumeItem = async (itemId: string) => {
    if (!partnership?.id || !userId) return;

    try {
      const response = await fetch('/api/partners/action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          status: 'pending',
          userId,
          partnershipId: partnership.id,
        }),
      });

      if (response.ok) {
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, status: 'pending', paused_at: undefined }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error resuming item:', error);
    }
  };

  const handleFileUpload = async (itemId: string, file: File) => {
    if (!partnership?.id || !userId) return;

    setUploadingItemId(itemId);

    try {
      // Upload via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('partnershipId', partnership.id);
      formData.append('itemId', itemId);
      formData.append('userId', userId);

      const response = await fetch('/api/partners/upload-evidence', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  evidence_file_path: data.filePath,
                }
              : item
          )
        );
        setToastMessage('File uploaded successfully!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setToastMessage('Failed to upload file. Please try again.');
    } finally {
      setUploadingItemId(null);
    }
  };

  // Computed values
  const pendingItems = actionItems.filter(i => i.status === 'pending');
  const pausedItems = actionItems.filter(i => i.status === 'paused');
  const completedCount = actionItems.filter(i => i.status === 'completed').length;

  const hubLoginPct = staffStats.total > 0
    ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100)
    : 0;

  const getHubLoginColor = (pct: number) => {
    if (pct >= 90) return colors.teal;
    if (pct >= 70) return colors.blueAccent;
    if (pct >= 50) return colors.amber;
    return colors.coral;
  };

  const loveNotes = metricSnapshots.find(m => m.metric_name === 'love_notes_sent')?.metric_value || 0;
  const virtualSessionsCompleted = metricSnapshots.find(m => m.metric_name === 'virtual_sessions_completed')?.metric_value || 0;

  const getObservationColor = () => {
    if (!partnership) return colors.amber;
    if (partnership.observation_days_completed === 0) return colors.amber;
    if (partnership.observation_days_completed >= partnership.observation_days_total) return colors.teal;
    return colors.blueAccent;
  };

  const getObservationText = () => {
    if (!partnership) return 'Not started';
    if (partnership.observation_days_completed === 0) return 'Not started';
    if (partnership.observation_days_completed >= partnership.observation_days_total) return 'All complete';
    return `${partnership.observation_days_completed}/${partnership.observation_days_total} complete`;
  };

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'progress', label: 'Progress', icon: Users },
    ...(partnership?.partnership_type === 'district' ? [{ id: 'schools', label: 'Schools', icon: School }] : []),
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'preview', label: '2026-27 Preview', icon: Sparkles },
    { id: 'team', label: 'Team', icon: User },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not a dashboard URL (let Next.js handle 404)
  if (!partnerSlug) {
    return null;
  }

  // Access denied
  if (!isAuthorized || !partnership) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{errorMessage || 'You do not have access to this dashboard.'}</p>
          <div className="space-y-3">
            <Link
              href="/partners/login"
              className="block w-full bg-[#1e2749] text-white py-3 rounded-lg hover:bg-[#2a3459] transition-colors"
            >
              Log In
            </Link>
            <a
              href="mailto:hello@teachersdeserveit.com"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact TDI
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      {/* Navigation */}
      <nav className="bg-[#1e2749] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-white" />
              <span className="text-white/60 text-xs uppercase tracking-wider hidden sm:inline">
                Teachers Deserve It | Partner Dashboard
              </span>
            </div>
            <a
              href="https://calendly.com/teachersdeserveit"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFBA06] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#e5a805] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule Session</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative text-white py-8 px-4 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #38618C)' }}
        />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {organization?.name || partnership.contact_name}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {organization?.address_city}, {organization?.address_state} |{' '}
              {partnership.partnership_type === 'district' ? 'District' : 'School'} Partnership
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'rgba(78, 205, 196, 0.2)',
                borderColor: colors.teal,
                borderWidth: 1,
              }}
            >
              Phase {partnership.contract_phase === 'IGNITE' ? '1' : partnership.contract_phase === 'ACCELERATE' ? '2' : '3'} - {partnership.contract_phase}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div
        className="bg-white border-b border-gray-200 sticky top-14 z-40"
        role="tablist"
        aria-label="Dashboard sections"
      >
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div
            role="tabpanel"
            id="panel-overview"
            aria-labelledby="tab-overview"
            className="space-y-6"
          >
            {/* Stat Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Staff Enrolled */}
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                aria-label={`Staff enrolled: ${staffStats.total} ${partnership.partnership_type === 'district' ? `across buildings` : 'staff members'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" style={{ color: colors.teal }} />
                  <span className="text-xs text-gray-500 uppercase">Staff Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">{staffStats.total}</div>
                <div className="text-xs font-medium" style={{ color: colors.teal }}>
                  {partnership.partnership_type === 'district'
                    ? `across ${partnership.building_count || 1} school${(partnership.building_count || 1) > 1 ? 's' : ''}`
                    : `${staffStats.total} staff members`}
                </div>
              </div>

              {/* Observations */}
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                aria-label={`Observations: ${getObservationText()}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4" style={{ color: getObservationColor() }} />
                  <span className="text-xs text-gray-500 uppercase">Observations</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">
                  {partnership.observation_days_completed || 0}
                  <span className="text-lg font-normal text-gray-400">
                    /{partnership.observation_days_total || 0}
                  </span>
                </div>
                <div className="text-xs font-medium" style={{ color: getObservationColor() }}>
                  {getObservationText()}
                </div>
              </div>

              {/* Needs Attention */}
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                aria-label={`Needs attention: ${pendingItems.length} items pending, ${pausedItems.length} paused`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" style={{ color: pendingItems.length > 0 ? colors.coral : colors.teal }} />
                  <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: pendingItems.length > 0 ? colors.coral : colors.teal }}
                >
                  {pendingItems.length}
                </div>
                <div className="text-xs font-medium" style={{ color: colors.amber }}>
                  {pausedItems.length} on your timeline
                </div>
              </div>

              {/* Current Phase */}
              <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                aria-label={`Current phase: ${partnership.contract_phase}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4" style={{ color: colors.blueAccent }} />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">
                  Phase {partnership.contract_phase === 'IGNITE' ? '1' : partnership.contract_phase === 'ACCELERATE' ? '2' : '3'}
                </div>
                <div className="text-xs font-medium" style={{ color: colors.blueAccent }}>
                  {partnership.contract_phase}
                </div>
              </div>
            </div>

            {/* Health Check */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Health Check</h2>
              <div className="flex flex-wrap justify-around gap-6">
                {/* Hub Logins */}
                <DonutChart
                  value={staffStats.hubLoggedIn}
                  max={staffStats.total}
                  color={getHubLoginColor(hubLoginPct)}
                  label={`${hubLoginPct}%`}
                  subLabel={`${staffStats.hubLoggedIn}/${staffStats.total} logged in`}
                  ariaLabel={`Hub logins: ${hubLoginPct} percent, ${staffStats.hubLoggedIn} of ${staffStats.total} logged in`}
                />

                {/* Love Notes Sent */}
                <DonutChart
                  value={loveNotes}
                  max={Math.max(loveNotes, 50)}
                  color={colors.teal}
                  label={String(loveNotes)}
                  subLabel="Love Notes sent"
                  ariaLabel={`Love notes sent: ${loveNotes}`}
                />

                {/* Virtual Sessions */}
                <DonutChart
                  value={virtualSessionsCompleted}
                  max={partnership.virtual_sessions_total || 4}
                  color={
                    virtualSessionsCompleted >= (partnership.virtual_sessions_total || 4)
                      ? colors.teal
                      : virtualSessionsCompleted > 0
                      ? colors.blueAccent
                      : colors.amber
                  }
                  label={`${virtualSessionsCompleted}/${partnership.virtual_sessions_total || 4}`}
                  subLabel="Virtual sessions"
                  ariaLabel={`Virtual sessions: ${virtualSessionsCompleted} of ${partnership.virtual_sessions_total || 4} completed`}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Goal: 100% Hub engagement by Observation Day
              </p>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1e2749]">Next Steps Together</h2>
                <span className="text-sm text-gray-500">
                  {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''} remaining
                </span>
              </div>

              <div className="space-y-6" aria-live="polite">
                {(['high', 'medium', 'low'] as const).map((priority) => {
                  const items = pendingItems.filter(i => i.priority === priority);
                  if (items.length === 0) return null;

                  const group = priorityGroups[priority];

                  return (
                    <div key={priority}>
                      <h3
                        className="text-sm font-medium mb-3 flex items-center gap-2"
                        style={{ color: group.color }}
                      >
                        {group.emoji} {group.label}
                      </h3>
                      <div className="space-y-3">
                        {items.sort((a, b) => a.sort_order - b.sort_order).map((item) => {
                          const Icon = categoryIcons[item.category] || FileText;
                          const showUpload = ['data', 'documentation'].includes(item.category);

                          return (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${group.color}20` }}
                              >
                                <Icon className="w-5 h-5" style={{ color: group.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-[#1e2749]">{item.title}</span>
                                  <span
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                      backgroundColor: `${group.color}20`,
                                      color: group.color,
                                    }}
                                  >
                                    {priority}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {showUpload && (
                                  <label
                                    className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group"
                                    title="Upload evidence"
                                  >
                                    {uploadingItemId === item.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                    ) : (
                                      <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                    )}
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(item.id, file);
                                      }}
                                      disabled={uploadingItemId === item.id}
                                    />
                                  </label>
                                )}
                                <button
                                  onClick={() => handleCompleteItem(item.id)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                                  title="Mark as done"
                                >
                                  <Check className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                                </button>
                                <button
                                  onClick={() => handlePauseItem(item.id)}
                                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors group"
                                  title="Pause for later"
                                >
                                  <Pause className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Paused Items Section */}
                {pausedItems.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <button
                      onClick={() => setShowPausedItems(!showPausedItems)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${showPausedItems ? 'rotate-180' : ''}`}
                      />
                      On Your Timeline
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {pausedItems.length}
                      </span>
                    </button>

                    {showPausedItems && (
                      <div className="mt-3 space-y-2">
                        {pausedItems.map((item) => {
                          const Icon = categoryIcons[item.category] || FileText;

                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg opacity-75"
                            >
                              <Icon className="w-4 h-4 text-gray-400" />
                              <span className="flex-1 text-sm text-gray-600">{item.title}</span>
                              <button
                                onClick={() => handleResumeItem(item.id)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                              >
                                <Play className="w-3 h-3" />
                                Resume
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* All Complete */}
                {pendingItems.length === 0 && pausedItems.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-600">All caught up! You&apos;ve completed all action items.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendation Card */}
            <div
              className="rounded-xl p-6"
              style={{ backgroundColor: 'rgba(30, 39, 73, 0.05)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.yellow }}
                >
                  <Zap className="w-6 h-6 text-[#1e2749]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1e2749] mb-2">
                    Recommendation: Dedicated Hub Time
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Schools that build in 15-30 minutes of protected Hub time during PLCs see 3x higher implementation rates. Consider designating a TDI Champion to help maintain momentum.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        fetch('/api/partners/log-activity', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            user_id: userId,
                            action: 'recommendation_clicked',
                            details: { recommendation: 'hub_time_plc' },
                          }),
                        });
                      }}
                      className="px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                    >
                      Add Hub time to PLC agenda
                    </button>
                    <button
                      onClick={() => {
                        fetch('/api/partners/log-activity', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            user_id: userId,
                            action: 'recommendation_clicked',
                            details: { recommendation: 'designate_champion' },
                          }),
                        });
                      }}
                      className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Designate TDI Champions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Looking Ahead Card */}
            <button
              onClick={() => handleTabChange('preview')}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1B2A4A, #38618C)' }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1e2749]">2026-27 Partnership Plan</h3>
                  <p className="text-sm text-gray-600">
                    Based on your engagement data, we&apos;ll build a tailored plan for Year 2.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div
            role="tabpanel"
            id="panel-team"
            aria-labelledby="tab-team"
            className="space-y-6"
          >
            {/* School/District Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">
                {partnership.partnership_type === 'district' ? 'District' : 'School'} Contact
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#1e2749] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {partnership.contact_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-[#1e2749]">{partnership.contact_name}</p>
                  <p className="text-sm text-gray-500">Partnership Administrator</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${partnership.contact_email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {partnership.contact_email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* TDI Team */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Your TDI Team</h2>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/rae.webp"
                    alt="Rae Hughart"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1e2749]">Rae Hughart</p>
                  <p className="text-sm text-gray-500">Founder & CEO</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href="mailto:hello@teachersdeserveit.com"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        hello@teachersdeserveit.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href="tel:+18477215503"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        847-721-5503
                      </a>
                    </div>
                  </div>
                  <a
                    href="https://calendly.com/teachersdeserveit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#FFBA06] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-[#e5a805] transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule a Call
                  </a>
                </div>
              </div>
            </div>

            {/* Partnership Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Partnership Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Contract Period</p>
                  <p className="font-medium text-[#1e2749]">
                    {partnership.contract_start
                      ? new Date(partnership.contract_start).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Not set'}{' '}
                    -{' '}
                    {partnership.contract_end
                      ? new Date(partnership.contract_end).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Current Phase</p>
                  <p className="font-medium text-[#1e2749]">{partnership.contract_phase}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Partnership Type</p>
                  <p className="font-medium text-[#1e2749] capitalize">{partnership.partnership_type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Renewal Date</p>
                  <p className="font-medium text-[#1e2749]">
                    {partnership.contract_end
                      ? new Date(partnership.contract_end).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {!['overview', 'team'].includes(activeTab) && (
          <div
            role="tabpanel"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e2749] mb-2">Coming Soon</h2>
            <p className="text-gray-600">
              The {tabs.find(t => t.id === activeTab)?.label} tab is being built.
              Check back soon for more features!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
