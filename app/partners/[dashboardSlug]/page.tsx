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
  Play,
  Zap,
  TrendingUp,
  School,
  Sparkles,
  X,
  ExternalLink,
  Copy,
  Plus,
  Save,
  Link2,
  Clock,
  Target,
  Award,
  ArrowRight,
  MessageCircle,
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
  website?: string;
}

interface BuildingInput {
  name: string;
  building_type: string;
  lead_name: string;
  lead_email: string;
  staff_count: number;
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

interface Building {
  id: string;
  name: string;
  building_type: string;
  lead_name: string | null;
  lead_email: string | null;
  staff_count: number;
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
  const [apiBuildings, setApiBuildings] = useState<Building[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [showPausedItems, setShowPausedItems] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Action item form state
  const [championName, setChampionName] = useState('');
  const [championEmail, setChampionEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [buildings, setBuildings] = useState<BuildingInput[]>([
    { name: '', building_type: 'elementary', lead_name: '', lead_email: '', staff_count: 0 },
  ]);

  // View tracking refs
  const tabStartTime = useRef<number>(Date.now());
  const currentTab = useRef<string>('overview');

  // Extract slug from URL - strip -dashboard suffix for database lookup
  // URL: /partners/ford-district-dashboard → DB slug: ford-district
  const partnerSlug = dashboardSlug?.endsWith('-dashboard')
    ? dashboardSlug.slice(0, -10) // Remove "-dashboard" (10 chars)
    : dashboardSlug;

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
          setApiBuildings(data.buildings || []);
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
        // Debug logging
        console.log('=== DASHBOARD DEBUG START ===');
        console.log('1. Raw slug from URL:', dashboardSlug);
        console.log('2. Cleaned slug (partnerSlug):', partnerSlug);

        // Check if this is a valid dashboard URL
        if (!partnerSlug) {
          console.log('3. FAILED: partnerSlug is falsy');
          setErrorMessage('Invalid dashboard URL');
          setIsLoading(false);
          return;
        }

        // Check auth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('4. Session check - error:', sessionError);
        console.log('5. Session exists:', !!session);
        console.log('6. User email:', session?.user?.email);
        console.log('7. User ID:', session?.user?.id);

        if (!session?.user) {
          console.log('8. REDIRECT: No session, going to login');
          router.push('/partners/login');
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        console.log('9. Calling auth-check API...');

        // Use API route to look up partnership (bypasses RLS)
        const authResponse = await fetch('/api/partners/auth-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: partnerSlug,
            userId: session.user.id,
            userEmail: session.user.email,
          }),
        });

        const authData = await authResponse.json();
        console.log('10. Auth-check response:', authData);

        if (!authData.success) {
          console.log('11. FAILED:', authData.error);
          console.log('=== DASHBOARD DEBUG END (FAILED) ===');

          if (authResponse.status === 404) {
            setErrorMessage('Partnership not found');
          } else if (authResponse.status === 403) {
            setErrorMessage('You do not have access to this dashboard');
          } else {
            setErrorMessage(authData.error || 'Failed to load dashboard');
          }
          setIsLoading(false);
          return;
        }

        console.log('12. SUCCESS - User authorized, partnership ID:', authData.partnership.id);
        setPartnership(authData.partnership);
        setIsAuthorized(true);

        // Load additional data
        console.log('13. Loading additional dashboard data...');
        await loadDashboardData(authData.partnership.id);
        console.log('14. Dashboard data loaded');
        console.log('=== DASHBOARD DEBUG END (SUCCESS) ===');

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

  const handleFileUpload = async (itemId: string, file: File, folder?: string) => {
    if (!partnership?.id || !userId) return;

    setUploadingItemId(itemId);

    try {
      // Upload via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('partnershipId', partnership.id);
      formData.append('itemId', itemId);
      formData.append('userId', userId);
      if (folder) formData.append('folder', folder);

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

  // Save action item form data
  const handleSaveActionData = async (
    itemId: string,
    dataType: 'champion' | 'website' | 'buildings' | 'confirmation',
    data: Record<string, unknown>
  ) => {
    if (!partnership?.id || !userId) return;

    setSavingItemId(itemId);

    try {
      const response = await fetch('/api/partners/action-item-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnershipId: partnership.id,
          actionItemId: itemId,
          userId,
          dataType,
          data,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? { ...item, status: 'completed', completed_at: new Date().toISOString() }
              : item
          )
        );

        // Clear form state
        if (dataType === 'champion') {
          setChampionName('');
          setChampionEmail('');
        } else if (dataType === 'website') {
          setWebsiteUrl('');
        } else if (dataType === 'buildings') {
          setBuildings([{ name: '', building_type: 'elementary', lead_name: '', lead_email: '', staff_count: 0 }]);
        }

        setToastMessage(result.message || 'Saved successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setToastMessage('Failed to save. Please try again.');
    } finally {
      setSavingItemId(null);
    }
  };

  // Copy hub link to clipboard
  const handleCopyHubLink = async () => {
    const hubUrl = 'https://hub.teachersdeserveit.com'; // Replace with actual Hub URL
    try {
      await navigator.clipboard.writeText(hubUrl);
      setCopiedLink(true);
      setToastMessage('Hub access link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setToastMessage('Failed to copy link');
    }
  };

  // Add building to form
  const addBuilding = () => {
    setBuildings(prev => [
      ...prev,
      { name: '', building_type: 'elementary', lead_name: '', lead_email: '', staff_count: 0 },
    ]);
  };

  // Update building in form
  const updateBuilding = (index: number, field: keyof BuildingInput, value: string | number) => {
    setBuildings(prev =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  // Remove building from form
  const removeBuilding = (index: number) => {
    if (buildings.length > 1) {
      setBuildings(prev => prev.filter((_, i) => i !== index));
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
      <div className="max-w-5xl mx-auto px-4 py-8">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#38618C]" />
                    <span className="text-xs text-gray-500 uppercase">Staff Enrolled</span>
                  </div>
                  <div className="text-2xl font-bold text-[#1e2749]">{staffStats.total}</div>
                  <div className="text-xs text-[#38618C] font-medium">
                    {partnership.partnership_type === 'district' && apiBuildings.length > 0
                      ? `across ${apiBuildings.length} school${apiBuildings.length > 1 ? 's' : ''}`
                      : 'staff members'}
                  </div>
                </div>
              </div>

              {/* Observations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs text-gray-500 uppercase">Observations</span>
                      </div>
                      <div className="text-2xl font-bold text-[#1e2749]">
                        {partnership.observation_days_completed ?? 0}
                        <span className="text-lg font-normal text-gray-400">
                          /{partnership.observation_days_total ?? 0}
                        </span>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    {partnership.observation_days_total > 0 && (
                      <div className="w-16">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4ecdc4] rounded-full"
                            style={{ width: `${((partnership.observation_days_completed ?? 0) / (partnership.observation_days_total || 1)) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-right mt-0.5">
                          {Math.round(((partnership.observation_days_completed ?? 0) / (partnership.observation_days_total || 1)) * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium mt-1" style={{ color: getObservationColor() }}>
                    {getObservationText()}
                  </div>
                </div>
              </div>

              {/* Needs Attention */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-500">
                    {pendingItems.length}
                  </div>
                  <div className="text-xs text-amber-600 font-medium">
                    {pendingItems.length === 0 ? 'All caught up!' : `${pendingItems.length} item${pendingItems.length !== 1 ? 's' : ''} pending`}
                  </div>
                </div>
              </div>

              {/* Current Phase */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                      </div>
                      <div className="text-2xl font-bold text-[#1e2749]">
                        Phase {partnership.contract_phase === 'IGNITE' ? '1' : partnership.contract_phase === 'ACCELERATE' ? '2' : '3'}
                      </div>
                      <div className="text-xs text-[#38618C] font-medium">
                        {partnership.contract_phase}
                      </div>
                    </div>
                    {/* Phase indicator dots */}
                    <div className="flex gap-1">
                      <div className={`w-3 h-3 rounded-full ${partnership.contract_phase === 'IGNITE' ? 'bg-[#38618C]' : 'bg-gray-300'}`} />
                      <div className={`w-3 h-3 rounded-full ${partnership.contract_phase === 'ACCELERATE' ? 'bg-[#38618C]' : 'bg-gray-200'}`} />
                      <div className={`w-3 h-3 rounded-full ${partnership.contract_phase === 'SUSTAIN' ? 'bg-[#38618C]' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-[#38618C] rounded-full"
                      style={{ width: `${partnership.contract_phase === 'IGNITE' ? 33 : partnership.contract_phase === 'ACCELERATE' ? 66 : 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Phase {partnership.contract_phase === 'IGNITE' ? '1' : partnership.contract_phase === 'ACCELERATE' ? '2' : '3'} of 3 · {partnership.contract_phase === 'IGNITE' ? '33' : partnership.contract_phase === 'ACCELERATE' ? '66' : '100'}%
                  </div>
                </div>
              </div>
            </div>

            {/* Leading Indicators */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#4ecdc4]" />
                  <h3 className="text-base font-bold text-[#1e2749]">Leading Indicators</h3>
                </div>
              </div>

              <div className="space-y-4">
                {/* Teacher Stress */}
                <div className="rounded-lg p-3 -mx-3">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Teacher Stress</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">↓ Lower is better</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Industry</span>
                        <span className="text-red-400 font-medium">8-9/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-300 rounded-full" style={{width: '87%'}} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">TDI Partners</span>
                        <span className="text-[#1e2749] font-medium">5-7/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '60%'}} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Your Data</span>
                        <span className="text-gray-400 font-medium italic">Pending</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-gray-200 rounded-full" style={{width: '0%'}} /></div>
                      <p className="text-[10px] text-gray-400 mt-1">Collecting after baseline survey</p>
                    </div>
                  </div>
                </div>

                {/* Strategy Implementation */}
                <div className="rounded-lg p-3 -mx-3">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Strategy Implementation</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">↑ Higher is better</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Industry</span>
                        <span className="text-red-400 font-medium">10%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-300 rounded-full" style={{width: '10%'}} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">TDI Partners</span>
                        <span className="text-[#1e2749] font-medium">65%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '65%'}} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Your Data</span>
                        <span className="text-gray-400 font-medium italic">Pending</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-gray-200 rounded-full" style={{width: '0%'}} /></div>
                      <p className="text-[10px] text-gray-400 mt-1">Collecting after first observation</p>
                    </div>
                  </div>
                </div>

                {/* Retention Intent */}
                <div className="rounded-lg p-3 -mx-3">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Retention Intent</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">↑ Higher is better</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Industry</span>
                        <span className="text-red-400 font-medium">2-4/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-300 rounded-full" style={{width: '30%'}} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">TDI Partners</span>
                        <span className="text-[#1e2749] font-medium">5-7/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '60%'}} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Your Data</span>
                        <span className="text-gray-400 font-medium italic">Pending</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-gray-200 rounded-full" style={{width: '0%'}} /></div>
                      <p className="text-[10px] text-gray-400 mt-1">Collecting after baseline survey</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Industry data: RAND 2025, Learning Policy Institute · TDI data: Partner school surveys</p>
              </div>
            </div>

            {/* Building Spotlight */}
            {partnership.partnership_type === 'district' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-[#1e2749]">Building Spotlight</h3>
                </div>

                {apiBuildings.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-2">
                      Building spotlight will appear here once you add your buildings and we begin collecting engagement data.
                    </p>
                    <button
                      onClick={() => {
                        const addBuildingItem = pendingItems.find(item => item.title.toLowerCase().includes('building'));
                        if (addBuildingItem) {
                          const el = document.getElementById(`action-${addBuildingItem.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-sm text-[#4ecdc4] font-medium hover:underline"
                    >
                      Add Building Details →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiBuildings.map((building) => (
                      <div key={building.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#1e2749]">{building.name}</span>
                          <span className="text-xs text-gray-400">· {building.staff_count || 0} staff</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Champion: {building.lead_name || 'Not yet assigned'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hub Engagement */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#4ecdc4]" />
                  <h3 className="text-base font-bold text-[#1e2749]">Hub Engagement</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Donut Chart - Login Rate */}
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4ecdc4" strokeWidth="3"
                        strokeDasharray={`${hubLoginPct}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-[#1e2749]">{hubLoginPct}%</span>
                      <span className="text-xs text-gray-500">logged in</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-semibold text-[#1e2749]">Hub Logins</p>
                    <p className="text-xs text-gray-500">{staffStats.hubLoggedIn} of {staffStats.total} staff</p>
                    <p className="text-xs text-[#4ecdc4] font-medium mt-1">Goal: 100% by Observation Day</p>
                  </div>
                </div>

                {/* Engagement Depth */}
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-[#1e2749] mb-3">Engagement Depth</p>
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Completed 1+ course</span>
                        <span className="font-semibold text-gray-400">—</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 rounded-full" style={{width: '0%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Downloaded resources</span>
                        <span className="font-semibold text-gray-400">—</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 rounded-full" style={{width: '0%'}} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Active this month</span>
                        <span className="font-semibold text-gray-400">—</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-200 rounded-full" style={{width: '0%'}} />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 italic">Data populates as staff engage with Hub</p>
                </div>

                {/* Love Notes & Sessions */}
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-[#1e2749] mb-3">Support Delivered</p>
                  <div className="space-y-3">
                    <div className="bg-pink-50 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-pink-500" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-[#1e2749]">{loveNotes}</span>
                        <p className="text-xs text-gray-500">Love Notes sent</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-xl font-bold text-[#1e2749]">{virtualSessionsCompleted} of {partnership.virtual_sessions_total || 4}</span>
                        <p className="text-xs text-gray-500">Virtual sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <a href="https://tdi.thinkific.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#4ecdc4] font-medium hover:underline mt-4">
                <BookOpen className="w-3.5 h-3.5" /> Open Learning Hub →
              </a>
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
                      <div className="space-y-4">
                        {items.sort((a, b) => a.sort_order - b.sort_order).map((item) => {
                          const Icon = categoryIcons[item.category] || FileText;
                          const isSaving = savingItemId === item.id;
                          const isUploading = uploadingItemId === item.id;

                          // Render inline action based on item title
                          const renderInlineAction = () => {
                            const titleLower = item.title.toLowerCase();

                            // Item 1: Complete Hub Onboarding
                            if (titleLower.includes('hub onboarding') || titleLower.includes('hub access')) {
                              return (
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <button
                                    onClick={handleCopyHubLink}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                  >
                                    {copiedLink ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                    {copiedLink ? 'Copied!' : 'Share Hub Access Link'}
                                  </button>
                                  <span className="text-xs text-gray-500">
                                    {staffStats.hubLoggedIn}/{staffStats.total} logged in
                                  </span>
                                </div>
                              );
                            }

                            // Item 2: Schedule Virtual Session
                            if (titleLower.includes('virtual session')) {
                              return (
                                <div className="mt-3">
                                  <a
                                    href="https://calendly.com/teachersdeserveit"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Schedule Now
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              );
                            }

                            // Item 3: Suggest TDI Champion(s)
                            if (titleLower.includes('champion')) {
                              return (
                                <div className="mt-3 space-y-2">
                                  <div className="flex flex-wrap gap-2">
                                    <input
                                      type="text"
                                      placeholder="Champion Name"
                                      value={championName}
                                      onChange={(e) => setChampionName(e.target.value)}
                                      className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <input
                                      type="email"
                                      placeholder="Champion Email"
                                      value={championEmail}
                                      onChange={(e) => setChampionEmail(e.target.value)}
                                      className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                      onClick={() => handleSaveActionData(item.id, 'champion', { championName, championEmail })}
                                      disabled={!championName.trim() || isSaving}
                                      className="px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                      Save
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            // Item 4: Add Hub Time to PLCs
                            if (titleLower.includes('hub time') || titleLower.includes('plc')) {
                              return (
                                <div className="mt-3">
                                  <button
                                    onClick={() => handleSaveActionData(item.id, 'confirmation', { confirmationMessage: 'Hub time added to PLCs!' })}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50"
                                  >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    We&apos;ve added Hub time to our PLC schedule
                                  </button>
                                </div>
                              );
                            }

                            // Item 5: Share Website
                            if (titleLower.includes('website')) {
                              return (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                                    <Link2 className="w-4 h-4 text-gray-400" />
                                    <input
                                      type="url"
                                      placeholder="https://yourschool.edu"
                                      value={websiteUrl}
                                      onChange={(e) => setWebsiteUrl(e.target.value)}
                                      className="flex-1 text-sm focus:outline-none"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleSaveActionData(item.id, 'website', { website: websiteUrl })}
                                    disabled={!websiteUrl.trim() || isSaving}
                                    className="px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save
                                  </button>
                                </div>
                              );
                            }

                            // Item 6: Add Building Details (Districts only)
                            if (titleLower.includes('building') && partnership?.partnership_type === 'district') {
                              return (
                                <div className="mt-3 space-y-3">
                                  {buildings.map((building, idx) => (
                                    <div key={idx} className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded-lg">
                                      <input
                                        type="text"
                                        placeholder="Building Name"
                                        value={building.name}
                                        onChange={(e) => updateBuilding(idx, 'name', e.target.value)}
                                        className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                      <select
                                        value={building.building_type}
                                        onChange={(e) => updateBuilding(idx, 'building_type', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      >
                                        <option value="elementary">Elementary</option>
                                        <option value="middle">Middle School</option>
                                        <option value="high">High School</option>
                                        <option value="k8">K-8</option>
                                        <option value="other">Other</option>
                                      </select>
                                      <input
                                        type="text"
                                        placeholder="Lead Name"
                                        value={building.lead_name}
                                        onChange={(e) => updateBuilding(idx, 'lead_name', e.target.value)}
                                        className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                      <input
                                        type="email"
                                        placeholder="Lead Email"
                                        value={building.lead_email}
                                        onChange={(e) => updateBuilding(idx, 'lead_email', e.target.value)}
                                        className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                      <input
                                        type="number"
                                        placeholder="Staff #"
                                        value={building.staff_count || ''}
                                        onChange={(e) => updateBuilding(idx, 'staff_count', parseInt(e.target.value) || 0)}
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                      {buildings.length > 1 && (
                                        <button
                                          onClick={() => removeBuilding(idx)}
                                          className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={addBuilding}
                                      className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Another Building
                                    </button>
                                    <button
                                      onClick={() => handleSaveActionData(item.id, 'buildings', { buildings })}
                                      disabled={!buildings.some(b => b.name.trim()) || isSaving}
                                      className="ml-auto px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                      Save Buildings
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            // Item 7 & 8: File uploads (Baseline Survey, SIP)
                            if (titleLower.includes('survey') || titleLower.includes('improvement plan') || titleLower.includes('sip')) {
                              const folder = titleLower.includes('survey') ? 'baseline-survey' : 'sip';
                              return (
                                <div className="mt-3">
                                  <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    {isUploading ? (
                                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                    ) : (
                                      <Upload className="w-5 h-5 text-gray-400" />
                                    )}
                                    <span className="text-sm text-gray-600">
                                      {isUploading ? 'Uploading...' : 'Drop file here or click to upload'}
                                    </span>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.docx,.xlsx,.csv"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(item.id, file, folder);
                                      }}
                                      disabled={isUploading}
                                    />
                                  </label>
                                  <p className="text-xs text-gray-500 mt-1 text-center">
                                    Accepted: PDF, DOCX, XLSX, CSV
                                  </p>
                                </div>
                              );
                            }

                            // Item 9: Confirm Observation Day Dates
                            if (titleLower.includes('observation')) {
                              return (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <a
                                    href="https://calendly.com/teachersdeserveit"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Schedule with TDI
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <a
                                    href="mailto:hello@teachersdeserveit.com?subject=Observation Day Scheduling"
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                  >
                                    <Mail className="w-4 h-4" />
                                    Email TDI to Schedule
                                  </a>
                                </div>
                              );
                            }

                            // Item 10: Schedule Executive Impact Session
                            if (titleLower.includes('executive') || titleLower.includes('impact session')) {
                              return (
                                <div className="mt-3">
                                  <a
                                    href="https://calendly.com/teachersdeserveit"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Schedule Now
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              );
                            }

                            // Default: no specific action
                            return null;
                          };

                          return (
                            <div
                              key={item.id}
                              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-colors"
                            >
                              <div className="flex items-start gap-3">
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
                                      className="text-xs px-2 py-0.5 rounded-full uppercase"
                                      style={{
                                        backgroundColor: `${group.color}20`,
                                        color: group.color,
                                      }}
                                    >
                                      {priority}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>

                                  {/* Inline Action */}
                                  {renderInlineAction()}

                                  {/* Secondary Buttons */}
                                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200">
                                    <button
                                      onClick={() => handleCompleteItem(item.id)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                                    >
                                      <Check className="w-4 h-4" />
                                      Mark Complete
                                    </button>
                                    <button
                                      onClick={() => handlePauseItem(item.id)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      <Clock className="w-4 h-4" />
                                      Not Right Now
                                    </button>
                                  </div>
                                </div>
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

            {/* Recommendation Card - Matching Example Dashboard */}
            <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Recommendation: Dedicated Hub Time</p>
                  <p className="text-sm text-gray-600">
                    Districts that build in 15-30 minutes of protected Hub time during PLCs or
                    staff meetings see <span className="font-bold text-[#1e2749]">3x higher implementation rates</span>.
                    We&apos;d suggest each building designate a TDI Champion.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                      Add Hub time to PLC agenda
                    </button>
                    <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                      Designate building TDI Champions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* District-wide Movement */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#4ecdc4]" />
                  <h3 className="text-lg font-bold text-[#1e2749]">Join the TDI Movement</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: Mail, label: 'Newsletter', value: 0, stat: '32% higher strategy adoption', link: 'https://raehughart.substack.com' },
                  { icon: BookOpen, label: 'Blog', value: 0, stat: '2.5x more likely to try new strategies', link: 'https://raehughart.substack.com' },
                  { icon: Star, label: 'Podcast', value: 0, stat: '28% higher implementation rates', link: 'https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274' },
                  { icon: Users, label: 'Community', value: 0, stat: '45% report feeling less isolated', link: 'https://www.facebook.com/groups/tdimovement' },
                  { icon: FileText, label: 'Resources', value: 0, stat: '3x more classroom tools used', link: 'https://tdi.thinkific.com' },
                  { icon: BookOpen, label: 'Courses', value: 0, stat: '65% completion vs 10% industry avg', link: 'https://tdi.thinkific.com' },
                ].map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-[#4ecdc4]/10 hover:shadow-md hover:scale-[1.02] transition-all duration-200 border border-transparent hover:border-[#4ecdc4]/30"
                  >
                    <channel.icon className="w-4 h-4 text-gray-400 group-hover:text-[#4ecdc4] flex-shrink-0 transition-colors" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 truncate">{channel.label}</p>
                      <p className="text-xs text-[#1e2749] font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗ {channel.stat}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Your staff engagement with TDI content helps drive implementation
              </p>
            </div>

            {/* Phase Preview Teaser */}
            <div
              className="relative bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-6 text-white overflow-hidden group"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="max-w-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-[#4ecdc4] text-[#1e2749] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                      {partnership.contract_phase === 'IGNITE' ? 'Phase 2: ACCELERATE' : partnership.contract_phase === 'ACCELERATE' ? 'Phase 3: SUSTAIN' : 'Renewal'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    {partnership.contract_phase === 'IGNITE'
                      ? 'Coming Up: Full Implementation'
                      : partnership.contract_phase === 'ACCELERATE'
                      ? 'Year 3: Make the Gains Permanent'
                      : 'Continue Your Partnership'}
                  </h3>
                  <p className="text-sm opacity-90 mt-2">
                    {partnership.contract_phase === 'IGNITE'
                      ? 'Once IGNITE is complete, you\'ll move into full implementation with Learning Hub access, observation days, and coaching sessions for your entire team.'
                      : partnership.contract_phase === 'ACCELERATE'
                      ? 'You\'ve built momentum. Now lock it in with internal coaching capacity, peer observation circles, and systems that sustain beyond the partnership.'
                      : 'Continue building on your success with ongoing support, advanced modules, and sustainability planning.'}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* FERPA / Data Privacy Note */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500">
                🔒 <span className="font-medium text-gray-600">Data Privacy:</span> In your partnership dashboard,
                access is role-based. Superintendents see district-wide data. Principals see only their building.
                Teacher-level data is never displayed. All data handling follows FERPA guidelines.
              </p>
            </div>
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
            {/* TDI Team */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Your TDI Team</h2>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-28 h-28 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 shadow-md">
                  <Image
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-semibold text-[#1e2749]">Rae Hughart</p>
                  <p className="text-gray-500">Founder & CEO</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href="mailto:hello@teachersdeserveit.com"
                        className="text-blue-600 hover:underline"
                      >
                        hello@teachersdeserveit.com
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href="tel:+18477215503"
                        className="text-blue-600 hover:underline"
                      >
                        847-721-5503
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Also available by text!</span>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-5">
                    <a
                      href="https://calendly.com/teachersdeserveit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFBA06] text-[#1e2749] rounded-lg font-medium hover:bg-[#e5a805] transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule a Call
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="mailto:hello@teachersdeserveit.com"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[#1e2749] text-[#1e2749] rounded-lg font-medium hover:bg-[#1e2749]/5 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send an Email
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-[#1e2749]/5 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong className="text-[#1e2749]">Your TDI partner is with you every step of the way.</strong>{' '}
                  Reach out anytime — call, text, or email. We mean it.
                </p>
              </div>
            </div>

            {/* Your Team (Partnership Contact) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Your Team</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#1e2749] to-[#38618C] rounded-full flex items-center justify-center text-white font-bold text-xl">
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

            {/* Partnership Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Partnership Details</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partnership Type</p>
                    <p className="font-medium text-[#1e2749] capitalize">{partnership.partnership_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Phase</p>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: colors.teal + '20', color: colors.teal }}
                      >
                        {partnership.contract_phase}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract Period</p>
                    <p className="font-medium text-[#1e2749]">
                      {partnership.contract_start
                        ? new Date(partnership.contract_start).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Not set'}{' '}
                      —{' '}
                      {partnership.contract_end
                        ? new Date(partnership.contract_end).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                    <p className="font-medium text-[#1e2749]">
                      {organization?.address_city}, {organization?.address_state}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  <strong>Dashboard Active Since:</strong>{' '}
                  {partnership.contract_start
                    ? new Date(partnership.contract_start).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div
            role="tabpanel"
            id="panel-blueprint"
            aria-labelledby="tab-blueprint"
            className="space-y-6"
          >
            {/* Phase Journey - Vertical Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-2">A Phased Journey, Not a One-Time Event</h2>
              <p className="text-sm text-gray-600 mb-6">
                Real change takes time. Our three-phase model meets your school where you are and grows with you.
              </p>

              {/* Vertical Timeline */}
              <div className="py-4">
                <div className="space-y-0">
                  {/* Phase 1: IGNITE */}
                  {(() => {
                    const isActive = partnership?.contract_phase === 'IGNITE';
                    const isPast = partnership?.contract_phase === 'ACCELERATE' || partnership?.contract_phase === 'SUSTAIN';
                    return (
                      <div className="flex gap-4 md:gap-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md ${
                              isPast ? 'bg-[#4ecdc4] text-white' : ''
                            }`}
                            style={!isPast ? { backgroundColor: '#ffba06', color: '#1e2749' } : undefined}
                          >
                            {isPast ? <Check className="w-6 h-6" /> : '1'}
                          </div>
                          <div className="w-1 flex-1 mt-2" style={{ backgroundColor: isPast ? '#4ecdc4' : '#ffba06' }} />
                        </div>
                        <div className="flex-1 pb-8">
                          <div
                            className={`bg-white rounded-xl p-5 md:p-6 shadow-md ${
                              isActive ? 'ring-2 ring-[#4ecdc4]' : ''
                            }`}
                            style={{ border: `2px solid ${isActive ? '#4ecdc4' : '#ffba06'}` }}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className="inline-block px-3 py-1 text-xs font-bold rounded-full"
                                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                              >
                                Start Here
                              </span>
                              <h3 className="text-lg md:text-xl font-bold text-[#1e2749]">IGNITE</h3>
                              {isActive && (
                                <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4] text-white text-xs font-bold rounded">
                                  YOU ARE HERE
                                </span>
                              )}
                              {isPast && (
                                <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4]/20 text-[#4ecdc4] text-xs font-bold rounded flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Complete
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>
                              Leadership + Pilot Group
                            </p>
                            <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
                              <span className="text-xs font-medium text-[#1e2749]">Awareness</span>
                              <ArrowRight className="w-4 h-4" style={{ color: '#ffba06' }} />
                              <span className="text-xs font-bold" style={{ color: '#ffba06' }}>Buy-in</span>
                            </div>
                            <p className="text-sm mb-3 text-gray-600">
                              Build buy-in with your leadership team and a pilot group of 10-25 educators. See early wins. Lay the foundation for school-wide change.
                            </p>
                            <div className="mb-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-bold mb-2 text-[#1e2749]">What&apos;s Included:</p>
                              <ul className="space-y-1">
                                {['2 On-Campus Observation Days', '4 Virtual Strategy Sessions', '2 Executive Impact Sessions', 'Learning Hub access for pilot group', 'Leadership Dashboard'].map((item) => (
                                  <li key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#ffba06' }} />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-xs text-gray-400">Typical timeline: One semester to one year</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Phase 2: ACCELERATE */}
                  {(() => {
                    const isActive = partnership?.contract_phase === 'ACCELERATE';
                    const isPast = partnership?.contract_phase === 'SUSTAIN';
                    const isFuture = partnership?.contract_phase === 'IGNITE';
                    return (
                      <div className="flex gap-4 md:gap-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md ${
                              isPast ? 'bg-[#4ecdc4] text-white' : isFuture ? 'bg-gray-200 text-gray-500' : ''
                            }`}
                            style={!isPast && !isFuture ? { backgroundColor: '#80a4ed', color: '#ffffff' } : undefined}
                          >
                            {isPast ? <Check className="w-6 h-6" /> : '2'}
                          </div>
                          <div
                            className="w-1 flex-1 mt-2"
                            style={{ backgroundColor: isPast ? '#4ecdc4' : isFuture ? '#e5e7eb' : '#80a4ed' }}
                          />
                        </div>
                        <div className="flex-1 pb-8">
                          <div
                            className={`bg-white rounded-xl p-5 md:p-6 shadow-md ${
                              isActive ? 'ring-2 ring-[#4ecdc4]' : ''
                            } ${isFuture ? 'opacity-75' : ''}`}
                            style={{ border: `2px solid ${isFuture ? '#e5e7eb' : '#80a4ed'}` }}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className="inline-block px-3 py-1 text-xs font-bold rounded-full"
                                style={{ backgroundColor: isFuture ? '#e5e7eb' : '#80a4ed', color: isFuture ? '#6b7280' : '#ffffff' }}
                              >
                                Scale
                              </span>
                              <h3 className="text-lg md:text-xl font-bold text-[#1e2749]">ACCELERATE</h3>
                              {isActive && (
                                <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4] text-white text-xs font-bold rounded">
                                  YOU ARE HERE
                                </span>
                              )}
                              {isPast && (
                                <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4]/20 text-[#4ecdc4] text-xs font-bold rounded flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Complete
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Full Staff</p>
                            <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#f0f9ff' }}>
                              <span className="text-xs font-medium text-[#1e2749]">Buy-in</span>
                              <ArrowRight className="w-4 h-4" style={{ color: '#80a4ed' }} />
                              <span className="text-xs font-bold" style={{ color: '#80a4ed' }}>Action</span>
                            </div>
                            <p className="text-sm mb-3 text-gray-600">
                              Expand support to your full staff. Every teacher, para, and coach gets access. Strategies get implemented school-wide, not just talked about.
                            </p>
                            <div className="mb-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-bold mb-2 text-[#1e2749]">What&apos;s Included:</p>
                              <p className="text-xs italic mb-1.5" style={{ color: '#80a4ed' }}>Everything in IGNITE, plus:</p>
                              <ul className="space-y-1">
                                {['Learning Hub access for ALL staff', '4 Executive Impact Sessions', 'Teachers Deserve It book for every educator', 'Retention tracking tools'].map((item) => (
                                  <li key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#80a4ed' }} />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-xs text-gray-400">Typical timeline: 1-3 years (many schools stay here)</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Phase 3: SUSTAIN */}
                  {(() => {
                    const isActive = partnership?.contract_phase === 'SUSTAIN';
                    const isFuture = partnership?.contract_phase === 'IGNITE' || partnership?.contract_phase === 'ACCELERATE';
                    return (
                      <div className="flex gap-4 md:gap-6">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md ${
                              isFuture ? 'bg-gray-200 text-gray-500' : ''
                            }`}
                            style={!isFuture ? { backgroundColor: '#abc4ab', color: '#1e2749' } : undefined}
                          >
                            3
                          </div>
                        </div>
                        <div className="flex-1">
                          <div
                            className={`bg-white rounded-xl p-5 md:p-6 shadow-md ${
                              isActive ? 'ring-2 ring-[#4ecdc4]' : ''
                            } ${isFuture ? 'opacity-75' : ''}`}
                            style={{ border: `2px solid ${isFuture ? '#e5e7eb' : '#abc4ab'}` }}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className="inline-block px-3 py-1 text-xs font-bold rounded-full"
                                style={{ backgroundColor: isFuture ? '#e5e7eb' : '#abc4ab', color: isFuture ? '#6b7280' : '#1e2749' }}
                              >
                                Embed
                              </span>
                              <h3 className="text-lg md:text-xl font-bold text-[#1e2749]">SUSTAIN</h3>
                              {isActive && (
                                <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4] text-white text-xs font-bold rounded">
                                  YOU ARE HERE
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Embedded Systems</p>
                            <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
                              <span className="text-xs font-medium text-[#1e2749]">Action</span>
                              <ArrowRight className="w-4 h-4" style={{ color: '#abc4ab' }} />
                              <span className="text-xs font-bold" style={{ color: '#22c55e' }}>Identity</span>
                            </div>
                            <p className="text-sm mb-3 text-gray-600">
                              Wellness becomes part of your school&apos;s identity. Systems sustain through staff turnover. Your school becomes a model for others.
                            </p>
                            <div className="mb-3 pt-3 border-t border-gray-200">
                              <p className="text-xs font-bold mb-2 text-[#1e2749]">What&apos;s Included:</p>
                              <p className="text-xs italic mb-1.5" style={{ color: '#abc4ab' }}>Everything in ACCELERATE, plus:</p>
                              <ul className="space-y-1">
                                {['Desi AI Assistant (24/7 support)', 'Advanced analytics', 'Ongoing partnership support'].map((item) => (
                                  <li key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#abc4ab' }} />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <p className="text-xs text-gray-400">Typical timeline: Ongoing partnership</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Footer Note */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
                <p className="text-sm text-[#1e2749]">
                  <strong>Every phase</strong> includes support for teachers, paraprofessionals, instructional coaches, and administrators. We meet each role where they are.
                </p>
              </div>
            </div>

            {/* Your Partnership Includes - Dynamic Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Your Partnership Includes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Deliverable</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Your Contract</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Delivered</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-[#1e2749]">Learning Hub Memberships</td>
                      <td className="py-3 px-4 text-center font-medium">{staffStats.total}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{staffStats.hubLoggedIn} active</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ecdc4]/20 text-[#4ecdc4] rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-[#1e2749]">On-Site Observation Days</td>
                      <td className="py-3 px-4 text-center font-medium">{partnership?.observation_days_total ?? 0}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{partnership?.observation_days_completed ?? 0} complete</td>
                      <td className="py-3 px-4 text-center">
                        {(partnership?.observation_days_completed ?? 0) > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 bg-[#1e2749]/10 text-[#1e2749] rounded-full text-xs font-medium">
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Not Started
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-[#1e2749]">Virtual Strategy Sessions</td>
                      <td className="py-3 px-4 text-center font-medium">{partnership?.virtual_sessions_total ?? 0}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{virtualSessionsCompleted} complete</td>
                      <td className="py-3 px-4 text-center">
                        {virtualSessionsCompleted > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 bg-[#1e2749]/10 text-[#1e2749] rounded-full text-xs font-medium">
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                            Upcoming
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-[#1e2749]">Executive Impact Sessions</td>
                      <td className="py-3 px-4 text-center font-medium">{partnership?.executive_sessions_total ?? 0}</td>
                      <td className="py-3 px-4 text-center text-gray-600">0 complete</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          Upcoming
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-[#1e2749]">Personalized Love Notes</td>
                      <td className="py-3 px-4 text-center font-medium">Per observation</td>
                      <td className="py-3 px-4 text-center text-gray-600">{loveNotes} delivered</td>
                      <td className="py-3 px-4 text-center">
                        {loveNotes > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ecdc4]/20 text-[#4ecdc4] rounded-full text-xs font-medium">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            Not Started
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-[#1e2749]">Partnership Dashboard</td>
                      <td className="py-3 px-4 text-center font-medium">1</td>
                      <td className="py-3 px-4 text-center text-gray-600">1 active</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ecdc4]/20 text-[#4ecdc4] rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TDI's Approach */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1e2749] mb-4">TDI&apos;s Approach</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">65% implementation rate</p>
                    <p className="text-sm text-gray-500">vs 10% industry average</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">Bottom-up, not top-down</p>
                    <p className="text-sm text-gray-500">Strategies teachers actually want to use</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">Ongoing support</p>
                    <p className="text-sm text-gray-500">Love Notes, virtual sessions, observations, dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">Measurable outcomes</p>
                    <p className="text-sm text-gray-500">Tracked on your dashboard</p>
                  </div>
                </div>
              </div>
              <Link
                href="/how-we-partner"
                target="_blank"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Learn more about how we partner
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {!['overview', 'team', 'blueprint'].includes(activeTab) && (
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
