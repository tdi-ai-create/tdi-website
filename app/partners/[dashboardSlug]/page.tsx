'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import InviteLeader from '@/components/partners/InviteLeader';
import RosterAccessManager from '@/components/partners/RosterAccessManager';
import Link from 'next/link';
import FooterSymbol from '@/components/FooterSymbol';
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
  TrendingDown,
  CheckCircle,
  School,
  Sparkles,
  Sprout,
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
  Headphones,
  GraduationCap,
  ArrowUpRight,
  Quote,
  Hammer,
  ChartLine,
  Rocket,
  CalendarDays,
  Pencil,
  ThumbsUp,
  HelpCircle,
  Handshake,
  Receipt,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

const LeadershipQuiz = dynamic(() => import('@/components/dashboard/shared/LeadershipQuiz'), { ssr: false });
const AICoachingCard = dynamic(() => import('@/components/dashboard/shared/AICoachingCard'), { ssr: false });
const LeadershipToolkit = dynamic(() => import('@/components/dashboard/shared/LeadershipToolkit'), { ssr: false });
import { getMetricStatus, statusColors, statusShapes, statusLabels, formatMetricValue, getMetricDescription } from '@/lib/metric-thresholds';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PilotNextYearTab from '@/components/dashboard/pilot/PilotNextYearTab';
// BillingTab moved inline per CCP spec
import { TeacherQuotes } from '@/components/dashboard/shared/TeacherQuotes';
import { TDISuggestions } from '@/components/dashboard/shared/TDISuggestions';
import { DashboardHeader } from '@/components/dashboard/shared/DashboardHeader';
import { StatCards } from '@/components/dashboard/shared/StatCards';
import { generateSuggestions, type TDISuggestion } from '@/lib/dashboard/generateSuggestions';

// Types
interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  slug: string;
  contact_name: string;
  contact_email: string;
  phone?: string | null;
  contract_phase: 'IGNITE' | 'ACCELERATE' | 'SUSTAIN';
  contract_start: string | null;
  contract_end: string | null;
  building_count: number;
  observation_days_total: number;
  observation_days_completed: number;
  virtual_sessions_total: number;
  virtual_sessions_completed: number;
  executive_sessions_total: number;
  executive_sessions_completed?: number;
  staff_enrolled?: number;
  status: string;
  org_name?: string | null;
  partnership_goal?: string | null;
  has_grant_support?: boolean;
  base_observation_days?: number | null;
  base_virtual_sessions?: number | null;
  base_executive_sessions?: number | null;
  base_staff_enrolled?: number | null;
  year2_planning_notes?: string | null;
}

interface Organization {
  id: string;
  name: string;
  org_type: string;
  address?: string;
  address_city: string;
  address_state: string;
  address_zip?: string;
  website?: string;
  partnership_goal?: string | null;
  success_targets?: string[] | null;
  curated_courses?: string[] | null;
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
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  sort_order: number;
  evidence_file_path?: string;
  completed_at?: string;
  paused_at?: string;
  paused_reason?: string;
  resurface_at?: string;
  cta_label?: string;
  cta_url?: string;
  visible_to_partner?: boolean;
}

interface MetricSnapshot {
  id: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  date?: string;
  event_type: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  notes?: string;
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

interface SessionRecord {
  id: string;
  partnership_id: string;
  session_type: string;
  session_number: number;
  session_date: string;
  love_notes_count: number;
  internal_notes: string | null;
  completed_by: string;
  created_at: string;
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
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 bg-[#1e2749] text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom-5"
    >
      <Check className="w-5 h-5 text-teal-400" aria-hidden="true" />
      {message}
    </div>
  );
};

// Tooltip component
const Tooltip = ({
  id,
  text,
  activeTooltip,
  setActiveTooltip,
  children,
}: {
  id: string;
  text: string;
  activeTooltip: string | null;
  setActiveTooltip: (id: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip(null)}
        onClick={() => setActiveTooltip(activeTooltip === id ? null : id)}
        className="text-gray-400 hover:text-gray-600 cursor-help"
        aria-label="More info"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {activeTooltip === id && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1B2A4A] text-white text-xs rounded-lg shadow-lg max-w-xs text-center whitespace-normal">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1B2A4A] rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
};

// Empty state for sections that don't have data yet
const ExamplePreview = ({ children, message }: { children: React.ReactNode; message?: string }) => {
  // Show clean empty state instead of fake data
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <Clock className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">Coming Soon</p>
      <p className="text-xs text-gray-400 max-w-md mx-auto">
        {message || "This section will populate with real data as your partnership progresses."}
      </p>
      {/* Keep children hidden -- preserves layout but doesn't confuse with fake data */}
      <div className="hidden">{children}</div>
    </div>
  );
};

export default function PartnerDashboard() {
  const router = useRouter();
  const params = useParams();
  const dashboardSlug = params.dashboardSlug as string;

  // TDI Loading screen state
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [dataReady, setDataReady] = useState(false);

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
  const [partnershipKpis, setPartnershipKpis] = useState<{ kpi_key: string; kpi_label: string; target_value: number; target_unit: string; current_value: number; benchmark_low: number; benchmark_high: number; how_tdi_delivers: string; status: string }[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStats>({ total: 0, hubLoggedIn: 0 });
  const [metricSnapshots, setMetricSnapshots] = useState<MetricSnapshot[]>([]);
  const [apiBuildings, setApiBuildings] = useState<Building[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [teacherQuotes, setTeacherQuotes] = useState<{ id: string; quote_text: string; teacher_role: string; session_type: string; created_at: string }[]>([]);
  const [suggestions, setSuggestions] = useState<TDISuggestion[]>([]);
  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ action: string; details?: Record<string, unknown>; created_at: string }[]>([]);
  const [staffRoster, setStaffRoster] = useState<{ id: string; name: string; role: string; hubActive: boolean }[]>([]);
  const [hubIntel, setHubIntel] = useState<Record<string, unknown> | null>(null);
  const [observationImpact, setObservationImpact] = useState<{ has_data: boolean; observations: { event_title: string; event_date: string; before_logins: number; after_logins: number; engagement_change_pct: number; before_mood: number | null; after_mood: number | null; mood_change: number | null; before_quick_wins: number; after_quick_wins: number }[] } | null>(null);
  const [hubStats, setHubStats] = useState<{
    has_real_data: boolean
    member_count: number
    logins_this_month: number | null
    active_users_7d: number | null
    hub_login_pct: number | null
    course_completions: number | null
    quick_wins_completed: number | null
    mood_avg_7d: number | null
    mood_avg_30d: number | null
    moment_mode_uses_7d: number | null
  } | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewSections, setOverviewSections] = useState<Record<string, boolean>>({
    'hub-detail': false,
    'hub-activity': false,
    'timeline': false,
    'indicators': false,
    'buildings': false,
    'investment': false,
    'actions': false,
    'leadership': false,
    'community': false,
  });
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [metricsRange, setMetricsRange] = useState<'month' | 'quarter' | 'all'>('all');
  const [tourStep, setTourStep] = useState(-1); // -1 = not showing
  const [tourDismissed, setTourDismissed] = useState(false);
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certAwards, setCertAwards] = useState<{award: string; tagline: string; recipient: string}[]>([]);
  const [showDateRequest, setShowDateRequest] = useState(false);
  const [dateRequestType, setDateRequestType] = useState('');
  const [dateRequestDate, setDateRequestDate] = useState('');
  const [dateRequestAltDate, setDateRequestAltDate] = useState('');
  const [dateRequestNotes, setDateRequestNotes] = useState('');
  const [dateRequestSubmitting, setDateRequestSubmitting] = useState(false);
  const [showPreviewData, setShowPreviewData] = useState(true); // ON by default for new partnerships
  const [goalStep, setGoalStep] = useState(0);
  const [goalSelections, setGoalSelections] = useState<Record<string, boolean>>({});
  const [goalTargets, setGoalTargets] = useState<Record<string, number>>({});
  const toggleOverviewSection = (key: string) => setOverviewSections(prev => ({ ...prev, [key]: !prev[key] }));
  const [blueprintSubTab, setBlueprintSubTab] = useState<'approach' | 'in-person' | 'learning-hub' | 'dashboard' | 'book' | 'results' | 'contract' | 'tools' | 'community'>('approach');
  const [mobileExpandedBlueprint, setMobileExpandedBlueprint] = useState<string | null>('approach');
  const [showPausedItems, setShowPausedItems] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [expandedActionFormId, setExpandedActionFormId] = useState<string | null>(null);
  const [highlightedActionId, setHighlightedActionId] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [snoozePickerItemId, setSnoozePickerItemId] = useState<string | null>(null);
  const [recentlyResurfacedIds, setRecentlyResurfacedIds] = useState<string[]>([]);
  const [activeMilestoneTooltip, setActiveMilestoneTooltip] = useState<string | null>(null);

  // Cross-tab navigation helper
  const navigateToTab = (tab: string, sectionId?: string) => {
    setActiveTab(tab);
    if (sectionId) {
      // Wait for tab content to render, then scroll
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      // Scroll to top of tab content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Scroll to section in current tab
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  // Hard timer for loading screen (runs once on mount, never resets)
  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Triple gate: ALL THREE must be true before showing dashboard
  const showDashboard = animationComplete && timerDone && dataReady;

  // Extract slug from URL - strip -dashboard suffix for database lookup
  // URL: /partners/ford-district-dashboard → DB slug: ford-district
  const partnerSlug = dashboardSlug?.endsWith('-dashboard')
    ? dashboardSlug.slice(0, -10) // Remove "-dashboard" (10 chars)
    : dashboardSlug;

  // Check TDI admin
  const isTDIAdmin = (email: string) => email.toLowerCase().endsWith('@teachersdeserveit.com');

  // Helper: Format date with ordinal suffix (e.g., "March 3rd")
  const formatDateWithOrdinal = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st'
      : day === 2 || day === 22 ? 'nd'
      : day === 3 || day === 23 ? 'rd'
      : 'th';
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    return `${month} ${day}${suffix}`;
  };

  // Auto-resurface paused items that are due
  const autoResurfaceItems = useCallback(async (items: ActionItem[], partnershipId: string) => {
    const now = new Date();
    const itemsToResurface = items.filter(
      item => item.status === 'paused' && item.resurface_at && new Date(item.resurface_at) <= now
    );

    if (itemsToResurface.length === 0) return items;

    const resurfacedIds: string[] = [];

    for (const item of itemsToResurface) {
      try {
        const response = await fetch('/api/partners/action-items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.id,
            status: 'pending',
            userId,
            partnershipId,
          }),
        });

        if (response.ok) {
          resurfacedIds.push(item.id);
          // Log the resurface activity
          await fetch('/api/partners/log-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              partnershipId,
              userId,
              action: 'action_item_resurfaced',
              details: {
                item_id: item.id,
                item_title: item.title,
                was_paused_for: item.paused_reason,
              },
            }),
          });
        }
      } catch (error) {
        console.error('Error resurfacing item:', error);
      }
    }

    if (resurfacedIds.length > 0) {
      setRecentlyResurfacedIds(resurfacedIds);
      // Clear the "resurfaced" badges after 5 seconds
      setTimeout(() => setRecentlyResurfacedIds([]), 5000);
    }

    // Return updated items
    return items.map(item =>
      resurfacedIds.includes(item.id)
        ? { ...item, status: 'pending' as const, paused_at: undefined, paused_reason: undefined, resurface_at: undefined }
        : item
    );
  }, [userId]);

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
          // Auto-resurface any overdue paused items
          const items = data.actionItems || [];
          const updatedItems = await autoResurfaceItems(items, partnershipId);
          setActionItems(updatedItems);
          setStaffStats(data.staffStats || { total: 0, hubLoggedIn: 0 });
          setMetricSnapshots(data.metricSnapshots || []);
          setApiBuildings(data.buildings || []);
          setTimelineEvents(data.timelineEvents || []);
          setTeacherQuotes(data.teacherQuotes || []);
          setSessionRecords(data.sessionRecords || []);
          setRecentActivity(data.activityLog || []);
          setStaffRoster(data.staffMembers || []);
          if (data.kpis) setPartnershipKpis(data.kpis);
        }
      }

      // Fetch Hub stats (separate endpoint for real-time Hub data)
      try {
        const hubResponse = await fetch(`/api/partnerships/${partnershipId}/hub-stats`);
        if (hubResponse.ok) {
          const hubData = await hubResponse.json();
          setHubStats(hubData);
        }
      } catch (hubError) {
        console.error('Error fetching hub stats:', hubError);
      }

      // Fetch Hub Intelligence (rich data for leadership view)
      try {
        const intelResponse = await fetch(`/api/partnerships/${partnershipId}/hub-intelligence`);
        if (intelResponse.ok) {
          const intelData = await intelResponse.json();
          if (intelData.hasData) setHubIntel(intelData);
        }
      } catch (intelError) {
        console.error('Error fetching hub intelligence:', intelError);
      }

      // Fetch Observation Impact (before/after metrics around visits)
      try {
        const impactResponse = await fetch(`/api/partnerships/${partnershipId}/hub-observation-impact`);
        if (impactResponse.ok) {
          const impactData = await impactResponse.json();
          if (impactData.has_data) setObservationImpact(impactData);
        }
      } catch (impactError) {
        console.error('Error fetching observation impact:', impactError);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [userId, autoResurfaceItems]);

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

        if (!authData.success) {
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

        setPartnership(authData.partnership);
        setIsAuthorized(true);

        // Load additional data
        await loadDashboardData(authData.partnership.id);

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
        setDataReady(true); // Always mark data as ready (even on error) so loader completes
      }
    };

    checkAuthAndLoad();
  }, [partnerSlug, router, loadDashboardData]);

  // Show guided tour on first visit
  useEffect(() => {
    if (!isLoading && partnership && !tourDismissed) {
      const tourKey = `tdi_tour_seen_${partnership.id}`;
      if (!localStorage.getItem(tourKey)) {
        const timer = setTimeout(() => setTourStep(0), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, partnership, tourDismissed]);

  const tourSteps = [
    {
      title: 'Welcome to Your Dashboard',
      body: 'This is your partnership command center. Everything you need to track your team\'s growth, see what\'s working, and stay connected with TDI is right here.',
      icon: '1',
    },
    {
      title: 'Setup Checklist & Progress',
      body: 'Start at the top. Your setup checklist walks you through getting your team on the Hub, setting goals, and scheduling key dates. Below that, live metrics show how your team is engaging in real time.',
      icon: '2',
    },
    {
      title: 'Reports You Can Share',
      body: 'The Reports tab generates professional documents for any audience: board presentations, staff engagement analyses, ROI reports, and newsletter content. Each one opens as a branded PDF ready to print or share.',
      icon: '3',
    },
    {
      title: 'Celebrate Your Staff',
      body: 'Under Reports, you\'ll find Staff Celebrations. Pick from 24 fun awards, assign names, and print beautiful certificates. Drop one in a teacher\'s mailbox and watch what happens.',
      icon: '4',
    },
    {
      title: 'Your Plan & Services',
      body: 'The "Your Plan" tab explains everything in your partnership: what observation days look like, how to prepare (almost nothing), leadership tools, FAQ, and your contract details.',
      icon: '5',
    },
    {
      title: 'Newsletter Content',
      body: 'Need content for your weekly staff email? The Newsletter Ready report gives you 4 weeks of copy-paste TDI tips, strategy spotlights, and conversation starters for PLCs.',
      icon: '6',
    },
    {
      title: 'Team & Community',
      body: 'The Team tab shows your staff roster, Hub activity, and photo uploads. Your educators can also engage with the Hub community: Q&A threads, "Tried It" reflections, and practice notes.',
      icon: '7',
    },
    {
      title: 'You\'re All Set',
      body: 'Hit the ? icon anytime to replay this tour. Click "Schedule Session" to book a call. Or just reply to any TDI email. We read every one.',
      icon: '8',
    },
  ];

  const advanceTour = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(-1);
      setTourDismissed(true);
      if (partnership) localStorage.setItem(`tdi_tour_seen_${partnership.id}`, '1');
    }
  };

  const dismissTour = () => {
    setTourStep(-1);
    setTourDismissed(true);
    if (partnership) localStorage.setItem(`tdi_tour_seen_${partnership.id}`, '1');
  };

  // Generate suggestions when data is ready
  useEffect(() => {
    if (!partnership || !staffStats) return;

    // Build partnership data for suggestion engine
    const partnershipData = {
      slug: partnership.slug,
      contract_phase: partnership.contract_phase,
      momentum_status: partnership.status || 'Active',
      staff_enrolled: staffStats.total,
      hub_login_pct: staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : null,
      love_notes_count: null, // Not available in principal view
      observation_days_used: partnership.observation_days_completed || 0,
      observation_days_total: partnership.observation_days_total || 0,
      virtual_sessions_used: partnership.virtual_sessions_completed || 0,
      virtual_sessions_total: partnership.virtual_sessions_total || 0,
      executive_sessions_used: 0, // Not in Partnership interface
      executive_sessions_total: partnership.executive_sessions_total || 0,
      teacher_stress_score: null,
      strategy_implementation_pct: null,
      retention_intent_score: null,
      contract_end: partnership.contract_end,
      data_updated_at: null,
    };

    // Convert timeline events to expected format for suggestions
    const formattedEvents = timelineEvents.map(e => ({
      status: e.status || 'upcoming',
      event_type: e.event_type || 'event',
      event_date: e.date || null,
    }));

    const generated = generateSuggestions(partnershipData, formattedEvents, actionItems);
    setSuggestions(generated);
  }, [partnership, staffStats, timelineEvents, actionItems]);

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

  const handlePauseItem = async (itemId: string, weeks: 1 | 2 | 4 = 2) => {
    if (!partnership?.id || !userId) return;

    const now = new Date();
    const resurfaceAt = new Date(now.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    const pausedReason = `${weeks}_week${weeks > 1 ? 's' : ''}`;

    try {
      const response = await fetch('/api/partners/action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          status: 'paused',
          pausedReason,
          resurfaceAt: resurfaceAt.toISOString(),
          userId,
          partnershipId: partnership.id,
        }),
      });

      if (response.ok) {
        setActionItems(prev =>
          prev.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'paused',
                  paused_at: now.toISOString(),
                  paused_reason: pausedReason,
                  resurface_at: resurfaceAt.toISOString(),
                }
              : item
          )
        );
        // Format date nicely: "March 3rd"
        const formattedDate = resurfaceAt.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric'
        });
        // Add ordinal suffix
        const day = resurfaceAt.getDate();
        const suffix = day === 1 || day === 21 || day === 31 ? 'st'
          : day === 2 || day === 22 ? 'nd'
          : day === 3 || day === 23 ? 'rd'
          : 'th';
        const dateWithSuffix = formattedDate.replace(/\d+/, `${day}${suffix}`);
        setToastMessage(`No problem! We'll bring this back on ${dateWithSuffix}.`);
        setSnoozePickerItemId(null);
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

  // Navigate to and highlight an action item by title keywords
  const navigateToActionItem = async (titleKeywords: string) => {
    const item = actionItems.find(i =>
      i.title.toLowerCase().includes(titleKeywords.toLowerCase())
    );

    if (!item) return null;

    // If pending, mark as in_progress
    if (item.status === 'pending' && partnership?.id && userId) {
      try {
        const response = await fetch('/api/partners/action-items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.id,
            status: 'in_progress',
            userId,
            partnershipId: partnership.id,
          }),
        });

        if (response.ok) {
          setActionItems(prev =>
            prev.map(i =>
              i.id === item.id ? { ...i, status: 'in_progress' } : i
            )
          );
        }
      } catch (error) {
        console.error('Error updating action item:', error);
      }
    }

    // Navigate to overview tab and scroll to action items section
    setActiveTab('overview');

    // Small delay to allow tab change, then scroll and highlight
    setTimeout(() => {
      const element = document.getElementById(`action-item-${item.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedActionId(item.id);
        // Remove highlight after 2 seconds
        setTimeout(() => setHighlightedActionId(null), 2000);
      }
    }, 100);

    return item;
  };

  // Helper to check action item status by title keywords
  const getActionItemStatus = (titleKeywords: string) => {
    const item = actionItems.find(i =>
      i.title.toLowerCase().includes(titleKeywords.toLowerCase())
    );
    return item?.status || null;
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
    const completed = partnership.observation_days_completed ?? 0;
    const total = partnership.observation_days_total ?? 0;
    if (completed === 0) return colors.amber;
    if (completed >= total) return colors.teal;
    return colors.blueAccent;
  };

  const getObservationText = () => {
    if (!partnership) return 'Not yet scheduled';
    const completed = partnership.observation_days_completed ?? 0;
    const total = partnership.observation_days_total ?? 0;
    if (completed === 0 && total === 0) return 'Not yet scheduled';
    if (completed === 0) return 'Not started';
    if (completed >= total) return 'All complete';
    return `${completed}/${total} complete`;
  };

  // Tabs configuration - matches CCP approved structure
  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'our-partnership', label: 'Our Partnership' },
    { id: 'blueprint', label: 'Your Plan' },
    { id: 'reporting', label: 'Reports' },
    { id: 'next-year', label: 'Next Year', badge: true },
    { id: 'team', label: 'Team' },
  ];

  // Reporting state
  const [reportGenerating, setReportGenerating] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<{ type: string; content: string; title: string } | null>(null);

  const generateAIReport = async (reportType: string) => {
    if (!partnership) return;
    setReportGenerating(reportType);
    setGeneratedReport(null);

    const schoolName = partnership.org_name || partnership.contact_name || 'Your School';
    const hubPctVal = hubStats?.hub_login_pct ?? (staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : 0);
    const totalDel = (partnership.observation_days_total || 0) + (partnership.virtual_sessions_total || 0);
    const completedDel = (partnership.observation_days_completed || 0) + (partnership.virtual_sessions_completed || 0);

    // Fetch live popular content from Hub
    let popularTools: string[] = [];
    let popularCourses: string[] = [];
    try {
      const statsResp = await fetch('/api/tdi-admin/stats');
      if (statsResp.ok) {
        const statsData = await statsResp.json();
        popularTools = (statsData.topQuickWins || []).slice(0, 6).map((q: { title: string }) => q.title);
        popularCourses = (statsData.topCourses || []).slice(0, 6).map((c: { title: string }) => c.title);
      }
    } catch { /* non-fatal */ }

    // Fallback if API didn't return data
    if (popularTools.length === 0) {
      popularTools = ['Lesson Flow Checklist', 'The Shift Kit', 'Reset Without the Guilt', 'Class Skipping Intervention Plan', 'Professional Email Practices'];
    }
    if (popularCourses.length === 0) {
      popularCourses = ['Calm Classrooms, Not Chaos', 'The Differentiation Fix', 'Communication that Clicks', 'Building Strong Teacher-Para Partnerships'];
    }

    const dataContext = {
      schoolName,
      phase: partnership.contract_phase || 'IGNITE',
      staffTotal: staffStats.total,
      staffLoggedIn: staffStats.hubLoggedIn,
      hubLoginPct: hubPctVal,
      toolsExplored: hubStats?.quick_wins_completed ?? 0,
      courseCompletions: hubStats?.course_completions ?? 0,
      wellnessScore: hubStats?.mood_avg_7d ?? null,
      totalDeliverables: totalDel,
      completedDeliverables: completedDel,
      kpis: partnershipKpis.map(k => ({ label: k.kpi_label, current: k.current_value, target: k.target_value, unit: k.target_unit })),
      quotes: teacherQuotes.slice(0, 5).map(q => ({ text: q.quote_text, role: q.teacher_role })),
      actionItemsCompleted: actionItems.filter(i => i.status === 'completed').length,
      actionItemsPending: actionItems.filter(i => i.status === 'pending' || i.status === 'in_progress').length,
      popularTools,
      popularCourses,
      year1Data: partnership.year2_planning_notes || null,
      observationImpact: observationImpact?.observations?.[0] || null,
      upcomingEvents: timelineEvents.filter(e => e.status === 'upcoming' || e.status === 'in_progress').map(e => ({ title: e.title, date: e.date, status: e.status })),
      completedEvents: timelineEvents.filter(e => e.status === 'completed').map(e => ({ title: e.title, date: e.date })),
      sessionCount: sessionRecords.length,
    };

    try {
      const response = await fetch('/api/hub/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tab: 'partnership_report',
          context: JSON.stringify({
            reportType,
            ...dataContext,
          }),
          data: {
            prompt: reportType === 'board'
              ? `Write a professional board presentation report for ${schoolName}'s TDI partnership. Include: executive summary, key metrics, educator testimonials, ROI analysis, and recommendations. Data: ${JSON.stringify(dataContext)}. Format with clear sections. No emojis. Professional tone.`
              : reportType === 'engagement'
              ? `Write a detailed staff engagement analysis for ${schoolName}. Cover: Hub adoption rates, most-used tools, engagement trends, educator feedback, and specific recommendations to increase participation. Data: ${JSON.stringify(dataContext)}. Be specific and actionable.`
              : reportType === 'impact'
              ? `Write an impact and ROI report for ${schoolName}'s TDI partnership investment. Include: investment summary, measurable outcomes, educator wellness changes, professional development hours, before/after comparisons, and projected year-end outcomes. Data: ${JSON.stringify(dataContext)}. Make it compelling for budget justification.`
              : reportType === 'quarterly'
              ? `Write a quarterly progress report for ${schoolName}'s TDI partnership. Include: this quarter's highlights, metrics vs targets, challenges and solutions, upcoming milestones, and a forward-looking summary. Data: ${JSON.stringify(dataContext)}. Keep it concise but thorough.`
              : reportType === 'teacher'
              ? `Write a celebratory staff highlights summary for ${schoolName}'s teachers. Include: most popular Hub tools, educator quotes and shout-outs, courses completed, PD hours earned, and fun engagement stats. Tone: warm, encouraging, celebratory. Perfect for a staff newsletter or PLC agenda. Data: ${JSON.stringify(dataContext)}.`
              : reportType === 'community'
              ? `Write a parent-friendly community update about ${schoolName}'s professional development investment through TDI. Explain in plain language: what teachers are learning, how it benefits students, popular topics (stress management, classroom strategies, communication), and the school's commitment to educator growth. Tone: positive, accessible, no jargon. Suitable for a school newsletter or website. Data: ${JSON.stringify(dataContext)}.`
              : `Write a comprehensive partnership summary for ${schoolName}. Data: ${JSON.stringify(dataContext)}.`,
          },
        }),
      });

      const reportTitles: Record<string, string> = {
        board: 'Board Presentation Report',
        engagement: 'Staff Engagement Analysis',
        impact: 'Impact & ROI Report',
        quarterly: 'Quarterly Progress Report',
        teacher: 'Teacher Highlights',
        community: 'Community Update',
        newsletter: 'Newsletter Ready Content',
        certificates: 'Staff Celebration Certificates',
      };
      const title = reportTitles[reportType] || 'Partnership Report';

      if (response.ok) {
        const data = await response.json();
        const content = data.insight || data.text || data.content || generateFallbackReport(reportType, dataContext);
        printReport(title, content);
      } else {
        printReport(title, generateFallbackReport(reportType, dataContext));
      }
    } catch {
      const reportTitles: Record<string, string> = {
        board: 'Board Presentation Report',
        engagement: 'Staff Engagement Analysis',
        impact: 'Impact & ROI Report',
        quarterly: 'Quarterly Progress Report',
        teacher: 'Teacher Highlights',
        community: 'Community Update',
      };
      printReport(reportTitles[reportType] || 'Report', generateFallbackReport(reportType, dataContext));
    } finally {
      setReportGenerating(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateFallbackReport = (type: string, data: any) => {
    const s = data.schoolName;
    const hasEngagement = data.hubLoginPct > 0;
    const costPerEducator = data.staffTotal > 0 ? Math.round(18000 / data.staffTotal) : 0; // Approximate based on typical contract
    const quotesBlock = data.quotes.length > 0 ? '\n\nWHAT EDUCATORS ARE SAYING\n\n' + data.quotes.map((q: {text:string;role:string}) => `"${q.text}"\n-- ${q.role}`).join('\n\n') : '';
    const kpiBlock = data.kpis.length > 0 ? '\n\nPARTNERSHIP GOALS\n\n' + data.kpis.map((k: {label:string;current:number;target:number;unit:string}) => `${k.label}: ${k.current}${k.unit} of ${k.target}${k.unit} target`).join('\n') : '';

    switch (type) {
      case 'board':
        return `THE 30-SECOND VERSION

${s} has ${data.staffTotal} educators with TDI Learning Hub access. ${hasEngagement ? `${data.hubLoginPct}% are actively engaged, ${data.toolsExplored} tools explored, ${data.completedDeliverables} of ${data.totalDeliverables} contracted sessions delivered.` : `The team is onboarding now. Contracted sessions and Hub engagement tracking begin this school year.`} TDI's implementation rate is 74%, compared to 10% for traditional PD. Investment: approximately $${costPerEducator} per educator for the full school year.

EXECUTIVE SUMMARY

${s} ${hasEngagement ? `is ${data.hubLoginPct >= 60 ? 'thriving' : 'building momentum'} in Phase ${data.phase} of its TDI partnership.` : `has launched its TDI partnership with ${data.staffTotal} educators enrolled in Phase ${data.phase}.`} ${hasEngagement ? `${data.hubLoginPct}% of ${data.staffTotal} educators are actively engaging with the Learning Hub, exploring ${data.toolsExplored} classroom tools and strategies.` : `As staff begin engaging with the Learning Hub, this report will reflect real-time data on adoption, engagement, and classroom impact.`}

TDI partners with schools to build sustainable, educator-centered professional development. Unlike traditional PD, which has a 10% classroom implementation rate nationally, TDI's approach achieves 74% implementation because every course includes action steps, not just information. This is a school-year partnership, not a one-day event.

KEY METRICS

Hub Engagement: ${data.hubLoginPct}% of staff active
Educators Enrolled: ${data.staffTotal}
Tools and Strategies Explored: ${data.toolsExplored}
Course Completions: ${data.courseCompletions}
Deliverables Completed: ${data.completedDeliverables} of ${data.totalDeliverables}${data.wellnessScore ? `\nEducator Wellness Score: ${data.wellnessScore}/5` : ''}
${kpiBlock}

INVESTMENT ANALYSIS

Cost per educator: approximately $${costPerEducator}/year
This includes: Learning Hub access (100+ hours of content), ${data.totalDeliverables} in-person and virtual sessions, personalized observation feedback (Love Notes), leadership dashboard with real-time data, and ongoing support.

For comparison, a single-day PD conference costs $500-2,000 per teacher with no follow-up and no implementation tracking. TDI provides year-round support at a fraction of that cost with measurable outcomes.

HOW TDI IS DIFFERENT

Most PD is consumed and forgotten. TDI measures what teachers DO, not what they watch. Every course includes classroom action steps. Every observation day produces personalized feedback. Every data point on this dashboard is evidence of real change happening in real classrooms.

National PD implementation rate: 10%
TDI partner implementation rate: 74%
${quotesBlock}

${hasEngagement && data.hubLoginPct > 0 ? `EDUCATOR CHAMPIONS

${data.staffLoggedIn > 0 ? `${data.staffLoggedIn} educator${data.staffLoggedIn > 1 ? 's have' : ' has'} already engaged with the Hub. These early adopters are your implementation champions. Research shows that peer influence is the strongest driver of PD adoption. When teachers see a colleague using a tool and getting results, they follow. Consider recognizing these educators at your next staff meeting.` : ''}` : ''}

PARTNERSHIP CALENDAR

${data.upcomingEvents && data.upcomingEvents.length > 0 ? `Upcoming this school year:\n${data.upcomingEvents.map((e: {title:string;date:string;status:string}) => `- ${e.title}${e.date ? ' (' + new Date(e.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) + ')' : ''} ${e.status === 'in_progress' ? '[In Progress]' : ''}`).join('\n')}` : `Your contracted deliverables for this school year include ${data.totalDeliverables} sessions. Dates will appear here as they are confirmed. Check the "Your Plan" tab on your dashboard to schedule.`}

${data.completedEvents && data.completedEvents.length > 0 ? `\nCompleted:\n${data.completedEvents.map((e: {title:string;date:string}) => `- ${e.title}${e.date ? ' (' + new Date(e.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) + ')' : ''}`).join('\n')}` : ''}

WHAT OTHER TDI SCHOOLS ARE SEEING

A K-8 school in New Jersey with 19 educators saw 68% Hub engagement in their first quarter, with teachers independently exploring stress management tools between observation visits. Their principal reported that "teachers are talking about TDI at lunch, which never happens with PD."

A district in Illinois with 45 educators across multiple buildings achieved 82% login rates after their principal started each staff meeting with a 5-minute Quick Win from the Hub. Their observation day feedback showed measurable shifts in classroom management strategies within 6 weeks.

An elementary school in Pennsylvania used TDI's wellness tools to address mid-year burnout. Their educator wellness scores improved from 2.8 to 4.1 out of 5 over one semester. The principal credited the daily check-in feature with helping her identify struggling teachers before they reached crisis.

These are real TDI partner outcomes. Every school's journey is different, but the pattern is consistent: when educators get practical tools with follow-up support, they use them.

TDI RECOMMENDATION

${hasEngagement ? `${s} is showing strong early signals of engagement. ${data.hubLoginPct >= 50 ? 'With over half the staff actively using the Hub, this partnership is well-positioned to deepen classroom impact in the coming months.' : 'Continue building momentum by encouraging staff to explore Hub tools during PLCs and team meetings.'}` : `${s} is in the onboarding phase. The foundation is set with ${data.staffTotal} educators enrolled. As the team begins exploring the Hub and observation days take place, this report will show measurable impact on teaching practice, staff wellness, and classroom implementation.`}

${data.phase === 'IGNITE' ? 'When your team is ready, Phase 2 (ACCELERATE) expands from a pilot group to full staff. Schools that make this move typically see 3x the implementation depth. Phase progression is based on your school\'s growth milestones, not a calendar.' : ''}

${data.year1Data ? `YEAR-OVER-YEAR COMPARISON

${data.year1Data}

This data represents your school's baseline from the previous contract year. As this year progresses, your dashboard will show how current metrics compare to these benchmarks. Growth is not always linear, but the trajectory matters.` : ''}

ABOUT TEACHERS DESERVE IT

TDI has partnered with schools across all 50 states, supporting over 100,000 educators. Our three-phase model (IGNITE, ACCELERATE, SUSTAIN) meets schools where they are and grows with them. Learn more at teachersdeserveit.com.`;

      case 'engagement':
        return `STAFF ENGAGEMENT ANALYSIS

${hasEngagement ? `${data.hubLoginPct}% of ${s}'s ${data.staffTotal} educators have logged into the TDI Learning Hub. Here is what the data shows about how your team is engaging.` : `${s} has ${data.staffTotal} educators enrolled in the TDI Learning Hub. As your team begins exploring, this report will show adoption rates, popular content, and engagement trends.`}

ADOPTION OVERVIEW

Total Staff Enrolled: ${data.staffTotal}
Active on Hub: ${data.staffLoggedIn} (${data.hubLoginPct}%)
Not Yet Logged In: ${data.staffTotal - data.staffLoggedIn}
Tools Explored: ${data.toolsExplored}
Courses Completed: ${data.courseCompletions}

${hasEngagement ? `Your adoption rate of ${data.hubLoginPct}% ${data.hubLoginPct >= 60 ? 'exceeds the typical TDI partner benchmark of 60% in the first quarter.' : data.hubLoginPct >= 30 ? 'is building steadily. Most TDI partners reach 60%+ within the first quarter.' : 'has room to grow. Here are strategies that work for other schools.'}` : 'Typical TDI partners see 30-40% adoption in the first two weeks and 60%+ by the end of the first month.'}

POPULAR HUB CONTENT

TDI's Learning Hub includes 100+ hours of practical, classroom-ready content organized by what educators need most:

Most Popular Quick Wins Right Now:
${data.popularTools.slice(0, 5).map((t: string) => `- ${t}`).join('\n')}

Most Popular Courses:
${data.popularCourses.slice(0, 4).map((c: string) => `- ${c}`).join('\n')}

Each tool takes 5-15 minutes and includes a specific classroom action step. This is why TDI's implementation rate is 74%, compared to the national average of 10%.

RECOMMENDATIONS FOR YOUR NEXT PLC

${hasEngagement ? `1. Celebrate early adopters. Recognize the ${data.staffLoggedIn} educators who have already engaged.
2. Start a staff meeting with a 5-minute Quick Win. The Lesson Flow Checklist or Professional Email Practices guide are great starters.
3. Ask your team: "What is one classroom challenge you are facing this week?" Then point them to a specific Hub tool that addresses it.` : `1. Send a brief email letting your staff know they have Hub access. We provide a template you can copy and paste.
2. Start your next staff meeting with a 5-minute Quick Win from the Hub. Screen-share it so the team sees how easy it is.
3. Identify 2-3 early adopters who can champion the Hub in your building.`}

${data.staffTotal - data.staffLoggedIn > 0 ? `\nREACHING INACTIVE STAFF\n\n${data.staffTotal - data.staffLoggedIn} educators have not yet logged in. This is normal in the first weeks. Research shows that peer influence is the strongest driver of PD adoption. When teachers see colleagues using a tool and getting results, they follow. Focus on your early adopters first.` : ''}
${quotesBlock}

TRENDING ACROSS TDI SCHOOLS RIGHT NOW

These are the most-used tools across all TDI partner schools this month. If your team has not explored them yet, they are worth a look:
${data.popularTools.map((t: string) => `- ${t} (Quick Win)`).join('\n')}
${data.popularCourses.length > 0 ? data.popularCourses.slice(0, 3).map((c: string) => `- ${c} (Course, PD eligible)`).join('\n') : ''}

Schools with similar staff sizes to yours are averaging 65% Hub engagement and 12 tools explored per educator. These numbers grow fastest when leaders model engagement by sharing a Quick Win at staff meetings.

COMMUNITY ENGAGEMENT

The Hub is not just content. It is a community. Here is how TDI educators are engaging beyond courses and tools:

- "Tried It" Responses: Educators share when they have used a strategy in their classroom and what happened. These anonymous, honest reflections are some of the most valuable content on the Hub.
- Q&A Threads: Teachers ask questions and get answers from peers and TDI experts. Topics range from classroom management to work-life balance.
- Practice Notes: Educators document what they are implementing and how it is going. These become a record of professional growth over time.

Encourage your team to check the community section after trying a tool. Seeing that a colleague across the country had the same experience makes the strategy feel more real.

YOUR SCHOOL YEAR AT A GLANCE

This partnership runs for the full school year. Your team has access to the Hub every day, not just during scheduled sessions. The most successful schools weave Hub tools into their existing rhythms: PLCs, staff meetings, coaching conversations, and personal planning time.

Explore the Hub: teachersdeserveit.com/hub
Questions? hello@teachersdeserveit.com`;

      case 'impact':
        return `IMPACT AND ROI REPORT

INVESTMENT SUMMARY

${s} has invested in a TDI ${data.phase} partnership providing ${data.staffTotal} educators with year-round professional development support. This is not a one-day workshop. It is a sustained, multi-channel approach to building teaching capacity.

Your partnership includes:
- Learning Hub access for ${data.staffTotal} educators (100+ hours of content)
- ${data.totalDeliverables} contracted deliverables (observation days, virtual sessions, executive sessions)
- Personalized observation feedback (Love Notes) for every observed teacher
- Real-time leadership dashboard with engagement data
- AI-generated reports for board presentations and grant reporting

COST COMPARISON

TDI Partnership: approximately $${costPerEducator} per educator per year
Traditional PD Conference: $500-2,000 per teacher per day (no follow-up)
External Coaching: $150-300 per hour per teacher

TDI provides daily access to tools, ongoing support, in-person feedback, and measurable outcomes at a fraction of what traditional approaches cost.

MEASURABLE OUTCOMES

Hub Engagement: ${data.hubLoginPct}% of staff active
Tools and Strategies Explored: ${data.toolsExplored}
Courses Completed: ${data.courseCompletions}
Deliverables Completed: ${data.completedDeliverables} of ${data.totalDeliverables}
${data.wellnessScore ? `Educator Wellness Score: ${data.wellnessScore}/5` : ''}
${kpiBlock}

WHY THIS MATTERS

Teachers are nearly twice as likely to suffer from job-related stress compared to other industries, yet only 2% of schools offer comprehensive wellness support for staff. TDI's Learning Hub addresses this directly with stress management tools, boundary-setting resources, and daily wellness check-ins.

When teachers feel supported, student outcomes improve. Research consistently shows that teacher effectiveness is the single largest in-school factor affecting student achievement, and teacher effectiveness improves when educators have access to practical, implementable strategies with follow-up support.

TDI BENCHMARK: IMPLEMENTATION RATE

National average PD implementation: 10%
TDI partner implementation rate: 74%

This is not a typo. The difference is in the design. Every TDI course includes action steps, not just information. We measure what teachers do, not what they watch.
${quotesBlock}

GRANT-READY LANGUAGE

"${s} has partnered with Teachers Deserve It (TDI) to provide ${data.staffTotal} educators with sustained, evidence-based professional development. The TDI model combines on-demand digital learning, in-person classroom observations with personalized feedback, and data-driven leadership support. TDI partners report a 74% classroom implementation rate, compared to the national average of 10% for traditional professional development."

PROJECTED OUTCOMES

${data.phase === 'IGNITE' ? `As a Phase 1 (IGNITE) partnership, ${s} is building the foundation for school-wide change. Based on data from similar TDI partnerships, projected outcomes by end of this school year include:
- 60-80% Hub engagement rate
- 15-20% reduction in reported teacher stress
- 50%+ course completion rate among active users
- Observable changes in classroom practice during observation days

Phase progression is milestone-based. When your team demonstrates consistent engagement and classroom implementation, the conversation about Phase 2 (ACCELERATE) happens naturally. There is no pressure to move on a timeline that does not fit your school.` : `${s} is seeing deepening impact as the partnership matures. Schools in this phase typically see 3x the implementation depth compared to their first year. The growth is compounding.`}`;

      case 'quarterly':
        return `QUARTERLY PROGRESS REPORT

QUARTER HIGHLIGHTS

${hasEngagement ? `${s} has ${data.staffLoggedIn} of ${data.staffTotal} educators actively using the Learning Hub (${data.hubLoginPct}%). ${data.toolsExplored > 0 ? `The team has explored ${data.toolsExplored} classroom tools and strategies.` : ''} ${data.completedDeliverables > 0 ? `${data.completedDeliverables} of ${data.totalDeliverables} contracted deliverables are complete.` : 'Deliverables are scheduled and upcoming.'}` : `${s} launched its TDI partnership this quarter with ${data.staffTotal} educators enrolled. The team is in the onboarding phase with Hub access being activated.`}
${kpiBlock}

METRICS VS TARGETS

Hub Engagement: ${data.hubLoginPct}% (TDI benchmark: 60-80%)
Tools Explored: ${data.toolsExplored}
Courses Completed: ${data.courseCompletions}
Deliverables: ${data.completedDeliverables}/${data.totalDeliverables}
Action Items: ${data.actionItemsCompleted} completed, ${data.actionItemsPending} pending
${data.wellnessScore ? `Wellness Score: ${data.wellnessScore}/5` : ''}
${quotesBlock}

WHAT TDI IS DELIVERING NEXT

${data.completedDeliverables < data.totalDeliverables ? `Your partnership still has ${data.totalDeliverables - data.completedDeliverables} deliverables remaining this school year. These may include observation days, virtual strategy sessions, or executive impact sessions. Check your dashboard's "Your Plan" tab for details on what each session includes and how to prepare.` : 'All contracted deliverables have been completed for this school year.'}

${data.upcomingEvents && data.upcomingEvents.length > 0 ? `Coming up:\n${data.upcomingEvents.map((e: {title:string;date:string;status:string}) => `- ${e.title}${e.date ? ' (' + new Date(e.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) + ')' : ' (date TBD)'}`).join('\n')}` : ''}

The Learning Hub continues to add new content regularly, including seasonal tools, timely resources, and courses built by practicing educators. Encourage your team to check the "Quick Wins" section for 5-minute tools they can use immediately.

HOW OTHER SCHOOLS ARE USING THIS QUARTER

A middle school in the Midwest used their second observation day as a catalyst. After receiving Love Notes, 8 teachers independently started a "strategy swap" channel where they shared Hub tools with each other. Their Hub engagement jumped from 45% to 78% in two weeks.

An elementary principal in the Southeast started reading one educator quote from the Hub aloud at each staff meeting. Within a month, teachers were asking to be the one quoted next. It became a quiet competition to try new strategies.

LOOKING AHEAD

${data.phase === 'IGNITE' ? 'As Phase 1 progresses, focus on building a core group of Hub champions who can model engagement for the rest of the staff. Schools that identify 3-5 early adopters see significantly faster whole-staff adoption. Phase progression is milestone-based, not calendar-based.' : 'Continue deepening implementation by connecting Hub tools to your existing PLC structure and school improvement goals.'}

${data.year1Data ? `\nCOMPARISON TO PREVIOUS YEAR\n\n${data.year1Data}\n\nUse these benchmarks to evaluate this quarter's progress against your school's historical data.` : ''}

Dashboard: teachersdeserveit.com/partners
Questions: hello@teachersdeserveit.com`;

      case 'teacher':
        return `TEACHER HIGHLIGHTS

FOR YOUR NEXT STAFF MEETING, NEWSLETTER, OR PLC AGENDA

${hasEngagement ? `Your team has been exploring the TDI Learning Hub, and here is what is getting the most attention.` : `The TDI Learning Hub is now available to your entire team. Here is what educators at schools like yours are finding most valuable.`}

WHAT EDUCATORS LOVE MOST

Quick Wins (5-minute tools):
${data.popularTools.slice(0, 5).map((t: string) => `- ${t}`).join('\n')}

Courses (PD credit eligible):
${data.popularCourses.slice(0, 4).map((c: string) => `- ${c}`).join('\n')}

Every tool includes a specific action step for your classroom. This is not theory. It is "try this tomorrow" practical.

${data.toolsExplored > 0 ? `YOUR TEAM BY THE NUMBERS\n\n${data.staffLoggedIn} educators have logged in\n${data.toolsExplored} tools explored\n${data.courseCompletions} courses completed` : 'Once your team starts exploring, we will track tools used, courses completed, and PD hours earned right here.'}
${quotesBlock}

SHARE THIS WITH YOUR TEAM

Copy and paste this into your next staff email:

"Hey team, just a reminder that you have full access to the TDI Learning Hub. If you have 5 minutes, try a Quick Win. If you have 30 minutes, start a course. Everything counts toward your PD hours, and the tools are designed to be used in your classroom the next day. Log in at teachersdeserveit.com/hub."

RECOMMENDED FOR THIS MONTH

Based on what is popular across TDI partner schools right now:
${data.popularTools.slice(0, 2).map((t: string, i: number) => `${i + 1}. ${t} (Quick Win, 5 min)`).join('\n')}
${data.popularCourses.slice(0, 1).map((c: string) => `3. ${c} (Course, PD eligible)`).join('\n')}

Explore everything: teachersdeserveit.com/hub`;

      case 'community':
        return `COMMUNITY UPDATE

WHAT YOUR SCHOOL IS DOING TO SUPPORT GREAT TEACHING

${s} has partnered with Teachers Deserve It (TDI), a nationally recognized professional development organization, to give our educators the tools, strategies, and support they need to thrive.

WHAT OUR TEACHERS ARE LEARNING

Our ${data.staffTotal} educators now have access to the TDI Learning Hub, an online platform with over 100 hours of practical, classroom-ready professional development. Unlike traditional PD workshops, which often feel disconnected from daily teaching, TDI's content is designed to be used the next day.

Popular topics include:
- Managing stress and avoiding burnout
- Classroom management strategies that work
- Time-saving tools for lesson planning and communication
- Building strong relationships with students and families
- Supporting diverse learners with practical differentiation strategies

HOW THIS HELPS YOUR STUDENTS

When teachers have better tools, students have better experiences. Research shows that teacher effectiveness is the single largest in-school factor affecting student achievement. By investing in our educators' growth, we are investing directly in every student's success.

TDI's approach is different from traditional professional development:
- 74% of educators who complete a TDI course implement strategies in their classroom within one week (national average: 10%)
- Every tool includes a specific action step, not just theory
- Educators access support on their own schedule, not just during workshop days

OUR COMMITMENT

${s} is committed to building a school where educators are supported, valued, and growing. Our partnership with TDI is one part of that commitment. ${data.totalDeliverables > 0 ? `This year, our partnership includes ${data.totalDeliverables} in-person and virtual sessions where TDI's team works directly with our staff.` : ''}

We believe that when teachers thrive, students thrive. That is what Teachers Deserve It is all about.

BY THE NUMBERS

${data.staffTotal} educators with Hub access
100+ hours of on-demand professional development
${data.totalDeliverables} contracted support sessions this year
50 states served by TDI nationally

Learn more about TDI: teachersdeserveit.com`;

      case 'newsletter':
        return `NEWSLETTER READY CONTENT

Copy and paste these into your weekly or monthly staff newsletter. Each one takes 30 seconds to add and gives your team a reason to check the Hub.

WEEK 1: QUICK WIN OF THE WEEK

Subject line suggestion: "This 5-minute tool is the most popular across TDI schools"

${data.popularTools[0] ? `"${data.popularTools[0]}" is the most-used tool across all TDI partner schools right now. It takes less than 5 minutes and it is designed to be used in your classroom the next day.` : 'Check out the Quick Wins section on the Hub for 5-minute tools you can use tomorrow.'}

Find it at: teachersdeserveit.com/hub

Try it this week and let me know what you think.

WEEK 2: STRATEGY SPOTLIGHT

Subject line suggestion: "One strategy that changes how students respond"

${data.popularCourses[0] ? `This week, check out "${data.popularCourses[0]}" on the Hub. It is one of the most popular courses across TDI schools. Teachers say they see a difference the same week they start.` : 'Check out the Courses section on the Hub for PD-eligible content your team will actually use.'}

Find it at: teachersdeserveit.com/hub

WEEK 3: HIDDEN GEM

Subject line suggestion: "A tool most people miss but everyone loves"

${data.popularTools[1] ? `"${data.popularTools[1]}" does not get as much attention as some of the bigger tools, but teachers who find it keep coming back to it. Give it 5 minutes this week.` : 'Explore the Quick Wins section. Some of the best tools are the ones you did not expect.'}

Grab it: teachersdeserveit.com/hub

WEEK 4: TEAM CELEBRATION

Subject line suggestion: "Look what our team is doing"

${hasEngagement ? `So far, ${data.staffLoggedIn} of us have explored the Learning Hub. ${data.toolsExplored > 0 ? `We have collectively tried ${data.toolsExplored} classroom tools and strategies.` : ''} That is real engagement, not just clicking through slides.` : `Our team now has access to the TDI Learning Hub with 100+ hours of practical tools and strategies. This is not sit-and-get PD. Everything is designed to be used in your classroom the next day.`}

If you have not logged in yet, give it 5 minutes this week. Start with a Quick Win. I think you will be surprised.

Log in: teachersdeserveit.com/hub

COMMUNITY HIGHLIGHTS

${hasEngagement ? `Across all TDI partner schools, educators are sharing what works. The "Tried It" feature lets teachers share when they have used a strategy in their classroom and what happened. It is anonymous, honest, and incredibly helpful. Encourage your team to check the community section after trying a tool.` : `The Hub includes a community feature where educators across TDI schools share what they have tried and what worked. As your team starts using tools, they can contribute their own experiences and learn from others.`}

BONUS: CONVERSATION STARTERS FOR YOUR NEXT PLC

- "What is one thing you tried from the Hub this week?"
- "Which Quick Win would be most useful for our students right now?"
- "Has anyone taken a course? What was your biggest takeaway?"
- "If you could pick one classroom challenge for TDI to address, what would it be?"

These questions turn the Hub from a solo experience into a team conversation. That is when real implementation happens.`;

      case 'certificates':
        return `STAFF CELEBRATION CERTIFICATES

Print these out, drop them in a mailbox, and watch what happens. Recognition does not need to be formal to be meaningful.

CERTIFICATE 1: HUB EXPLORER AWARD

Awarded to: ________________________________

For diving into the TDI Learning Hub and exploring tools that make a real difference. Your curiosity is contagious.

"The best teachers never stop learning. You are proof of that."

CERTIFICATE 2: STRATEGY CHAMPION

Awarded to: ________________________________

For trying a new classroom strategy this week and sharing what happened. Implementation is where the magic lives, and you brought it.

"You did not just learn it. You used it. That is what sets you apart."

CERTIFICATE 3: TEAM PLAYER AWARD

Awarded to: ________________________________

For making your colleagues' day better. Whether it was covering a duty, sharing a resource, or just checking in, you made this school a better place to work today.

"Schools run on people like you."

CERTIFICATE 4: WELLNESS WARRIOR

Awarded to: ________________________________

For taking care of yourself so you can take care of your students. Using the wellness tools on the Hub is not a luxury. It is leadership.

"You cannot pour from an empty cup. Thank you for filling yours."

CERTIFICATE 5: MOST LIKELY TO...

Awarded to: ________________________________

Most likely to: ________________________________

(Make this one your own. Funniest email signature? Best snack drawer? Most creative use of a whiteboard? You know your people.)

"This school would not be the same without you."

HOW TO USE THESE

- Print on cardstock if you have it, regular paper if you do not
- Handwrite the name. It matters more than you think
- Drop it in their mailbox before school or leave it on their desk
- Do one a week. By the end of the month, four teachers will have their day made

The research is clear: specific, personal recognition is one of the strongest drivers of teacher retention. And it costs nothing.

Want custom certificates with your school logo? Contact hello@teachersdeserveit.com and we will create them for you.`;

      default:
        return `${s} Partnership Report\n\nStaff: ${data.staffTotal} enrolled, ${data.staffLoggedIn} active (${data.hubLoginPct}%)\nTools explored: ${data.toolsExplored}\nDeliverables: ${data.completedDeliverables}/${data.totalDeliverables}`;
    }
  };

  const printReport = (title: string, content: string) => {
    const schoolName = partnership?.org_name || partnership?.contact_name || 'School';
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const hubPctVal = hubStats?.hub_login_pct ?? (staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : 0);
    const totalDel = (partnership?.observation_days_total || 0) + (partnership?.virtual_sessions_total || 0);
    const completedDel = (partnership?.observation_days_completed || 0) + (partnership?.virtual_sessions_completed || 0);
    const wellness = hubStats?.mood_avg_7d;
    const tools = hubStats?.quick_wins_completed ?? 0;
    const courses = hubStats?.course_completions ?? 0;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${title} - ${schoolName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e2749; max-width: 850px; margin: 0 auto; padding: 0; line-height: 1.7; }

        .cover { background: linear-gradient(135deg, #1B2A4A 0%, #38618C 100%); color: white; padding: 48px; margin-bottom: 32px; }
        .cover h1 { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
        .cover .school { font-size: 20px; font-weight: 600; opacity: 0.9; margin-bottom: 24px; }
        .cover .meta { font-size: 13px; opacity: 0.5; }
        .cover .logo-text { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; opacity: 0.4; margin-bottom: 32px; }

        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 0 40px; margin-bottom: 32px; margin-top: -24px; }
        .metric { background: white; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #f3f4f6; }
        .metric-value { font-size: 28px; font-weight: 800; }
        .metric-label { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
        .metric-green { color: #059669; }
        .metric-blue { color: #2563EB; }
        .metric-amber { color: #D97706; }
        .metric-purple { color: #7C3AED; }

        .body { padding: 0 40px 40px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 16px; font-weight: 700; color: #1e2749; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #E8B84B; display: flex; align-items: center; gap: 8px; }
        .section-icon { width: 20px; height: 20px; display: inline-block; }

        .content-text { font-size: 14px; line-height: 1.8; color: #374151; }
        .content-text p { margin-bottom: 14px; }
        .content-text h2 { font-size: 18px; font-weight: 700; color: #1e2749; margin: 32px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #E8B84B; }
        .content-text h3 { font-size: 15px; font-weight: 700; color: #1e2749; margin: 24px 0 8px; }
        .content-text ul { margin: 8px 0 16px 0; padding-left: 0; list-style: none; }
        .content-text li { padding: 4px 0 4px 20px; position: relative; }
        .content-text li:before { content: ''; position: absolute; left: 0; top: 12px; width: 6px; height: 6px; border-radius: 50%; background: #E8B84B; }
        .content-text strong, .content-text b { font-weight: 700; color: #1e2749; }
        .stat-inline { display: inline-block; background: #F3F4F6; padding: 2px 10px; border-radius: 6px; font-weight: 700; color: #1e2749; }

        .quote-block { border-left: 3px solid #E8B84B; padding: 12px 20px; margin: 16px 0; background: #FFFBEB; border-radius: 0 8px 8px 0; }
        .quote-text { font-style: italic; font-size: 14px; color: #1e2749; }
        .quote-attr { font-size: 11px; color: #9CA3AF; margin-top: 4px; }

        .highlight-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 20px; margin: 16px 0; }
        .highlight-title { font-size: 14px; font-weight: 700; color: #059669; margin-bottom: 4px; }
        .highlight-text { font-size: 13px; color: #374151; }

        .footer { padding: 24px 40px; border-top: 2px solid #1e2749; margin-top: 32px; display: flex; justify-content: space-between; align-items: center; }
        .footer-left { font-size: 11px; color: #1e2749; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .footer-right { font-size: 10px; color: #9CA3AF; }

        @media print {
          body { padding: 0; }
          .cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .metric { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .highlight-box { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .quote-block { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head><body>
      <!-- Cover -->
      <div class="cover">
        <div class="logo-text">Teachers Deserve It</div>
        <h1>${title}</h1>
        <div class="school">${schoolName}</div>
        <div class="meta">${date} | Phase: ${partnership?.contract_phase || 'IGNITE'} | Contract: ${partnership?.contract_start ? new Date(partnership.contract_start).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : ''} - ${partnership?.contract_end ? new Date(partnership.contract_end).toLocaleDateString('en-US', {month: 'short', year: 'numeric'}) : ''}</div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics">
        ${[
          { value: hubPctVal + '%', label: 'Hub Engagement', pct: hubPctVal, color: '#059669' },
          { value: staffStats.total.toString(), label: 'Educators', pct: staffStats.total > 0 ? Math.min(staffStats.hubLoggedIn / staffStats.total * 100, 100) : 0, color: '#2563EB' },
          { value: completedDel + '/' + totalDel, label: 'Deliverables', pct: totalDel > 0 ? (completedDel / totalDel) * 100 : 0, color: '#D97706' },
          { value: wellness ? wellness + '/5' : tools > 0 ? tools.toString() : '--', label: wellness ? 'Wellness' : tools > 0 ? 'Tools Used' : 'Coming Soon', pct: wellness ? (wellness / 5) * 100 : tools > 0 ? Math.min(tools, 100) : 0, color: '#7C3AED' },
        ].map(m => `
          <div class="metric">
            <div style="width:80px;height:80px;margin:0 auto 8px;position:relative;">
              <div style="width:80px;height:80px;border-radius:50%;background:conic-gradient(${m.color} ${m.pct * 3.6}deg, #f3f4f6 ${m.pct * 3.6}deg);display:flex;align-items:center;justify-content:center;">
                <div style="width:62px;height:62px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;flex-direction:column;">
                  <span style="font-size:18px;font-weight:800;color:${m.color};line-height:1;">${m.value}</span>
                </div>
              </div>
            </div>
            <div class="metric-label">${m.label}</div>
          </div>
        `).join('')}
      </div>

      <!-- TDI vs National Benchmark Chart -->
      <div style="padding: 0 40px; margin-bottom: 32px;">
        <div style="background: #F9FAFB; border-radius: 12px; padding: 24px; border: 1px solid #f3f4f6;">
          <p style="font-size: 13px; font-weight: 700; color: #1e2749; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Classroom Implementation Rate</p>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <span style="font-size: 11px; color: #6B7280; width: 100px; text-align: right;">National Avg</span>
            <div style="flex: 1; height: 24px; background: #E5E7EB; border-radius: 6px; overflow: hidden; position: relative;">
              <div style="width: 10%; height: 100%; background: #9CA3AF; border-radius: 6px;"></div>
              <span style="position: absolute; left: 12%; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 700; color: #6B7280;">10%</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 11px; color: #1e2749; width: 100px; text-align: right; font-weight: 700;">TDI Partners</span>
            <div style="flex: 1; height: 24px; background: #E5E7EB; border-radius: 6px; overflow: hidden; position: relative;">
              <div style="width: 74%; height: 100%; background: linear-gradient(90deg, #E8B84B, #D97706); border-radius: 6px;"></div>
              <span style="position: absolute; left: 76%; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 700; color: #1e2749;">74%</span>
            </div>
          </div>
          <p style="font-size: 10px; color: #9CA3AF; margin-top: 12px;">TDI measures what teachers DO, not what they watch. Every course includes classroom action steps.</p>
        </div>
      </div>

      ${partnershipKpis.length > 0 ? `
      <!-- KPI Progress Bars -->
      <div style="padding: 0 40px; margin-bottom: 32px;">
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
          <p style="font-size: 13px; font-weight: 700; color: #1e2749; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Partnership Goals</p>
          ${partnershipKpis.map(k => {
            const pct = k.target_value > 0 ? Math.min((k.current_value / k.target_value) * 100, 100) : 0;
            return `
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 13px; font-weight: 600; color: #1e2749;">${k.kpi_label}</span>
                <span style="font-size: 13px; font-weight: 700; color: #7C3AED;">${k.current_value}${k.target_unit} / ${k.target_value}${k.target_unit}</span>
              </div>
              <div style="height: 8px; background: #F3F4F6; border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #8B5CF6, #7C3AED); border-radius: 4px;"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Report Content -->
      <div class="body">
        <div class="content-text">${(() => {
          let inList = false;
          const lines = content.split('\n');
          const html: string[] = [];

          for (const line of lines) {
            const t = line.trim();
            if (!t) {
              if (inList) { html.push('</ul>'); inList = false; }
              continue;
            }

            const isBullet = /^[-*]/.test(t);
            const isNumbered = /^\d+[\.\)]/.test(t);
            const isHeader = /^[A-Z][A-Z\s&:,\-\/\']+$/.test(t) && t.length > 3 && t.length < 80;
            const isStat = /^[A-Z][a-zA-Z\s]+:/.test(t) && t.length < 100 && !t.includes('. ') && !isBullet;

            // Close list if current line is not a list item
            if (inList && !isBullet && !isNumbered) {
              html.push('</ul>');
              inList = false;
            }

            if (isHeader) {
              const title = t.charAt(0) + t.slice(1).toLowerCase()
                .replace(/\b(tdi|hub|plc|roi|pd|faq|k-12|nps)\b/gi, m => m.toUpperCase())
                .replace(/\bi\b/g, 'I');
              html.push('<h2>' + title + '</h2>');
            } else if (isBullet || isNumbered) {
              if (!inList) { html.push('<ul>'); inList = true; }
              const text = t.replace(/^[-*]\s*/, '').replace(/^\d+[\.\)]\s*/, '');
              // Bold the part before a colon if it exists
              const colonIdx = text.indexOf(':');
              if (colonIdx > 0 && colonIdx < 60) {
                html.push('<li><strong>' + text.slice(0, colonIdx) + ':</strong>' + text.slice(colonIdx + 1) + '</li>');
              } else {
                html.push('<li>' + text + '</li>');
              }
            } else if (isStat) {
              const [label, ...rest] = t.split(':');
              html.push('<p><strong>' + label + ':</strong> ' + rest.join(':').trim() + '</p>');
            } else {
              html.push('<p>' + t + '</p>');
            }
          }
          if (inList) html.push('</ul>');

          // Add hyperlinks
          return html.join('')
            .replace(/teachersdeserveit\.com\/hub\/courses/g, '<a href="https://www.teachersdeserveit.com/hub/courses" style="color:#2563EB;text-decoration:underline;">teachersdeserveit.com/hub/courses</a>')
            .replace(/teachersdeserveit\.com\/hub/g, '<a href="https://www.teachersdeserveit.com/hub" style="color:#2563EB;text-decoration:underline;">teachersdeserveit.com/hub</a>')
            .replace(/teachersdeserveit\.com\/partners/g, '<a href="https://www.teachersdeserveit.com/partners" style="color:#2563EB;text-decoration:underline;">teachersdeserveit.com/partners</a>')
            .replace(/teachersdeserveit\.com(?!\/)/g, '<a href="https://www.teachersdeserveit.com" style="color:#2563EB;text-decoration:underline;">teachersdeserveit.com</a>')
            .replace(/hello@teachersdeserveit\.com/g, '<a href="mailto:hello@teachersdeserveit.com" style="color:#2563EB;text-decoration:underline;">hello@teachersdeserveit.com</a>');
        })()}</div>

        ${teacherQuotes.length > 0 ? `
          <div class="section">
            <div class="section-title">What Educators Are Saying</div>
            ${teacherQuotes.slice(0, 3).map(q => `
              <div class="quote-block">
                <div class="quote-text">"${q.quote_text}"</div>
                <div class="quote-attr">-- ${q.teacher_role}${q.session_type ? ', ' + q.session_type : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${partnershipKpis.length > 0 ? `
          <div class="section">
            <div class="section-title">Partnership Goals</div>
            ${partnershipKpis.map(k => `
              <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:14px;font-weight:500;">${k.kpi_label}</span>
                <span style="font-size:14px;font-weight:700;color:#7C3AED;">${k.current_value}${k.target_unit} of ${k.target_value}${k.target_unit}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="highlight-box">
          <div class="highlight-title">About Teachers Deserve It</div>
          <div class="highlight-text">TDI partners with schools to build sustainable, educator-centered professional development. Our approach combines on-demand learning through the Hub, in-person observation days with personalized feedback, and data-driven leadership support. 74% of educators who complete a TDI course report implementing strategies in their classroom within one week.</div>
        </div>

        <!-- Partnership Status & Next Steps -->
        <div style="background: #1B2A4A; border-radius: 12px; padding: 24px; margin-top: 24px; color: white;">
          <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #E8B84B; margin-bottom: 12px;">Your Partnership</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <p style="font-size: 11px; color: rgba(255,255,255,0.5);">Current Phase</p>
              <p style="font-size: 16px; font-weight: 700;">${partnership?.contract_phase || 'IGNITE'}</p>
            </div>
            <div>
              <p style="font-size: 11px; color: rgba(255,255,255,0.5);">Contract Through</p>
              <p style="font-size: 16px; font-weight: 700;">${partnership?.contract_end ? new Date(partnership.contract_end).toLocaleDateString('en-US', {month: 'long', year: 'numeric'}) : 'Active'}</p>
            </div>
            <div>
              <p style="font-size: 11px; color: rgba(255,255,255,0.5);">Deliverables Remaining</p>
              <p style="font-size: 16px; font-weight: 700;">${totalDel - completedDel} of ${totalDel}</p>
            </div>
            <div>
              <p style="font-size: 11px; color: rgba(255,255,255,0.5);">Hub Content Available</p>
              <p style="font-size: 16px; font-weight: 700;">100+ hours</p>
            </div>
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.6); line-height: 1.6;">
            Phase progression is based on your school's growth, not a calendar. When your team hits its stride in ${partnership?.contract_phase || 'IGNITE'}, we will talk together about what the next phase looks like and whether expanding makes sense for your goals.
          </p>
        </div>

        <!-- What Else TDI Offers -->
        <div style="margin-top: 24px; border: 1px solid #f3f4f6; border-radius: 12px; padding: 24px;">
          <p style="font-size: 13px; font-weight: 700; color: #1e2749; margin-bottom: 12px;">Expand Your Impact</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="padding: 12px; background: #F9FAFB; border-radius: 8px;">
              <p style="font-size: 13px; font-weight: 600; color: #1e2749;">Additional Observation Days</p>
              <p style="font-size: 11px; color: #6B7280;">More classroom visits, more Love Notes, deeper coaching conversations.</p>
            </div>
            <div style="padding: 12px; background: #F9FAFB; border-radius: 8px;">
              <p style="font-size: 13px; font-weight: 600; color: #1e2749;">Executive Impact Sessions</p>
              <p style="font-size: 11px; color: #6B7280;">Strategic planning sessions for your leadership team with TDI experts.</p>
            </div>
            <div style="padding: 12px; background: #F9FAFB; border-radius: 8px;">
              <p style="font-size: 13px; font-weight: 600; color: #1e2749;">District Expansion</p>
              <p style="font-size: 11px; color: #6B7280;">Bring TDI to additional buildings. Multi-school partnerships see 2x engagement.</p>
            </div>
            <div style="padding: 12px; background: #F9FAFB; border-radius: 8px;">
              <p style="font-size: 13px; font-weight: 600; color: #1e2749;">Custom Course Development</p>
              <p style="font-size: 11px; color: #6B7280;">We build courses around your school's specific initiatives and priorities.</p>
            </div>
          </div>
        </div>

        <!-- Referral & Satisfaction -->
        <div style="margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 20px;">
            <p style="font-size: 13px; font-weight: 700; color: #92400E; margin-bottom: 4px;">Know Another School?</p>
            <p style="font-size: 12px; color: #92400E; line-height: 1.6;">If you know a principal or superintendent who could benefit from TDI, we would love an introduction. Our best partnerships start with a recommendation from a leader like you.</p>
            <p style="font-size: 11px; color: #B45309; margin-top: 8px;">Email hello@teachersdeserveit.com to connect us.</p>
          </div>
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 20px;">
            <p style="font-size: 13px; font-weight: 700; color: #1E40AF; margin-bottom: 4px;">How Are We Doing?</p>
            <p style="font-size: 12px; color: #1E40AF; line-height: 1.6;">Your feedback helps us get better. If something is working well, or if something could be better, we want to hear it. We read every response personally.</p>
            <p style="font-size: 11px; color: #2563EB; margin-top: 8px;">Reply to any TDI email or contact hello@teachersdeserveit.com.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-left">Teachers Deserve It</div>
        <div class="footer-right">Confidential | Prepared for ${schoolName} | ${date}</div>
      </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <>
      {/* LOADER — shows until animation completes */}
      {!animationComplete && (
        <TDIPortalLoader
          portal="leadership"
          onComplete={() => setAnimationComplete(true)}
        />
      )}

      {/* BACKUP — covers gap if animation unmounts but timer/data aren't done */}
      {!showDashboard && animationComplete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'linear-gradient(135deg, #1e3a5f, #2c5a8f)',
          transition: 'opacity 500ms ease-out',
          opacity: timerDone && dataReady ? 0 : 1,
        }} />
      )}

      {/* DASHBOARD — completely hidden until ALL three gates pass */}
      <div style={{
        visibility: showDashboard ? 'visible' : 'hidden',
        opacity: showDashboard ? 1 : 0,
        transition: 'opacity 300ms ease-in',
      }}>
        {/* Not a dashboard URL (let Next.js handle 404) */}
        {!partnerSlug ? null : !isAuthorized || !partnership ? (
          /* Access denied */
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
                  href="mailto:Rae@TeachersDeserveIt.com"
                  className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Contact TDI
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Main Dashboard Content */
          <div className="min-h-screen bg-gray-50">
      {/* Skip to main content - accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-white focus:text-[#1B2A4A] focus:font-semibold focus:rounded-lg focus:shadow-lg focus:top-2 focus:left-2"
      >
        Skip to main content
      </a>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      )}

      {/* Navigation */}
      <nav className="bg-[#1e2749] sticky top-0 z-50 shadow-lg" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.webp"
                alt="Teachers Deserve It"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
              <span className="text-white/40 text-xs hidden sm:inline">|</span>
              <span className="text-white/60 text-xs uppercase tracking-wider hidden sm:inline">
                Partner Dashboard
              </span>
            </div>
            <a
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFBA06] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#e5a805] transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule Session</span>
            </a>
            <button
              onClick={() => { setTourStep(0); setTourDismissed(false); }}
              className="text-white/50 hover:text-white/90 transition-colors"
              title="Take a tour"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── GUIDED TOUR OVERLAY ─── */}
      {tourStep >= 0 && tourStep < tourSteps.length && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={dismissTour}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#38618C] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                    {tourSteps[tourStep].icon}
                  </div>
                  <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>{tourSteps[tourStep].title}</h3>
                </div>
                <button onClick={dismissTour} className="text-white/40 hover:text-white/80 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 leading-relaxed">{tourSteps[tourStep].body}</p>
              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-1.5">
                  {tourSteps.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === tourStep ? 'bg-[#1B2A4A]' : i < tourStep ? 'bg-[#E8B84B]' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={dismissTour}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-3 py-2"
                  >
                    Skip
                  </button>
                  <button
                    onClick={advanceTour}
                    className="text-sm font-semibold px-5 py-2 rounded-lg bg-[#1B2A4A] text-white hover:bg-[#2d3a5c] transition-colors"
                  >
                    {tourStep < tourSteps.length - 1 ? 'Next' : 'Got it'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STAFF CERTIFICATES MODAL ─── */}
      {showCertificates && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowCertificates(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#38618C] px-6 py-5 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#E8B84B]" />
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Staff Celebration Certificates</h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Select awards, assign names, print. Drop one in a mailbox and watch what happens.</p>
                  </div>
                </div>
                <button onClick={() => setShowCertificates(false)} className="text-white/40 hover:text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {/* Action buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    // Use real staff names if available, otherwise fallback
                    const names = staffRoster.length > 0
                      ? staffRoster.map(s => s.name).filter(n => n.length > 0)
                      : [];
                    if (names.length === 0 && staffStats.total > 0) {
                      for (let n = 1; n <= Math.min(staffStats.total, certAwards.length); n++) {
                        names.push(`Educator ${n}`);
                      }
                    }
                    // Shuffle names and awards independently for fun pairings
                    const shuffledNames = [...names].sort(() => Math.random() - 0.5);
                    const shuffledAwards = [...certAwards].sort(() => Math.random() - 0.5);
                    const updated = shuffledAwards.map((cert, i) => ({
                      ...cert,
                      recipient: i < shuffledNames.length ? shuffledNames[i] : '',
                    }));
                    setCertAwards(updated);
                    const count = Math.min(shuffledNames.length, certAwards.length);
                    setToastMessage(staffRoster.length > 0
                      ? `Auto-assigned ${count} staff members to awards. Swap any names you want.`
                      : `Assigned ${count} placeholders. Upload your roster in the Team tab for real names.`);
                    setTimeout(() => setToastMessage(''), 4000);
                  }}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Assign Awards
                </button>
                <button
                  onClick={() => setCertAwards(certAwards.map(c => ({ ...c, recipient: '' })))}
                  className="text-xs font-medium px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 mb-4 border border-amber-100">
                <p className="text-xs text-amber-800"><strong>Tip:</strong> Click "Auto-Assign" to get started, then edit names to match your people. Print on cardstock for extra impact. Want custom designs with your school logo? Drop these into Canva, or email hello@teachersdeserveit.com.</p>
              </div>

              <div className="space-y-2">
                {certAwards.map((cert, i) => (
                  <div key={i} className={`p-3 rounded-xl border transition-all ${cert.recipient ? 'border-green-200 bg-green-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#E8B84B]/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-3.5 h-3.5 text-[#E8B84B]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1e2749]">{cert.award}</p>
                        <p className="text-[10px] text-gray-500">{cert.tagline}</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Type recipient name..."
                      value={cert.recipient}
                      onChange={e => {
                        const updated = [...certAwards];
                        updated[i] = { ...updated[i], recipient: e.target.value };
                        setCertAwards(updated);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-gray-400">{certAwards.filter(c => c.recipient).length} of {certAwards.length} assigned</p>
              <button
                onClick={() => {
                  const selected = certAwards.filter(c => c.recipient);
                  if (selected.length === 0) {
                    setToastMessage('Assign at least one name to print');
                    setTimeout(() => setToastMessage(''), 2000);
                    return;
                  }
                  const schoolName = partnership?.org_name || partnership?.contact_name || 'Your School';
                  const w = window.open('', '_blank');
                  if (!w) return;
                  w.document.write(`<!DOCTYPE html><html><head><title>Staff Certificates - ${schoolName}</title>
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      @page { size: landscape; margin: 0; }
                      body { font-family: 'Georgia', serif; }
                      .cert { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px; page-break-after: always; position: relative; overflow: hidden; background: white; }
                      .cert:last-child { page-break-after: auto; }
                      .border-frame { position: absolute; inset: 20px; border: 3px solid #E8B84B; border-radius: 8px; }
                      .border-inner { position: absolute; inset: 28px; border: 1px solid #E8B84B40; border-radius: 4px; }
                      .corner { position: absolute; width: 40px; height: 40px; border: 2px solid #E8B84B; }
                      .corner-tl { top: 16px; left: 16px; border-right: none; border-bottom: none; }
                      .corner-tr { top: 16px; right: 16px; border-left: none; border-bottom: none; }
                      .corner-bl { bottom: 16px; left: 16px; border-right: none; border-top: none; }
                      .corner-br { bottom: 16px; right: 16px; border-left: none; border-top: none; }
                      .logo { font-size: 11px; text-transform: uppercase; letter-spacing: 4px; color: #9CA3AF; margin-bottom: 32px; }
                      .award-title { font-size: 18px; text-transform: uppercase; letter-spacing: 3px; color: #E8B84B; font-weight: 700; margin-bottom: 16px; }
                      .recipient { font-size: 48px; font-weight: 700; color: #1e2749; margin-bottom: 16px; border-bottom: 2px solid #E8B84B; padding-bottom: 8px; display: inline-block; min-width: 300px; }
                      .tagline { font-size: 16px; color: #374151; font-style: italic; max-width: 500px; line-height: 1.6; margin-bottom: 32px; }
                      .school { font-size: 14px; font-weight: 600; color: #1e2749; }
                      .date { font-size: 12px; color: #9CA3AF; margin-top: 4px; }
                      .signature { display: flex; justify-content: center; gap: 80px; margin-top: 32px; }
                      .sig-block { text-align: center; }
                      .sig-line { width: 180px; border-bottom: 1px solid #1e2749; margin-bottom: 4px; height: 24px; }
                      .sig-label { font-size: 10px; color: #6B7280; font-family: 'Helvetica Neue', sans-serif; }
                      .star { font-size: 24px; color: #E8B84B; margin: 0 4px; }
                      @media print { .cert { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                    </style>
                  </head><body>
                    ${selected.map(cert => `
                      <div class="cert">
                        <div class="border-frame"></div>
                        <div class="border-inner"></div>
                        <div class="corner corner-tl"></div>
                        <div class="corner corner-tr"></div>
                        <div class="corner corner-bl"></div>
                        <div class="corner corner-br"></div>
                        <div class="logo">Teachers Deserve It</div>
                        <div class="star">&#9733;</div>
                        <div class="award-title">${cert.award}</div>
                        <div class="recipient">${cert.recipient}</div>
                        <div class="tagline">${cert.tagline}</div>
                        <div class="star">&#9733; &#9733; &#9733;</div>
                        <div class="school">${schoolName}</div>
                        <div class="date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <div class="signature">
                          <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Principal / Administrator</div></div>
                          <div class="sig-block"><div class="sig-line"></div><div class="sig-label">Date</div></div>
                        </div>
                      </div>
                    `).join('')}
                  </body></html>`);
                  w.document.close();
                  setTimeout(() => w.print(), 500);
                  setShowCertificates(false);
                }}
                className="text-sm font-semibold px-6 py-2.5 rounded-lg bg-[#E8B84B] text-[#1e2749] hover:bg-[#d4a63e] transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4" /> Print {certAwards.filter(c => c.recipient).length > 0 ? certAwards.filter(c => c.recipient).length : ''} Certificate{certAwards.filter(c => c.recipient).length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DATE REQUEST MODAL ─── */}
      {showDateRequest && partnership && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowDateRequest(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#38618C] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-[#E8B84B]" />
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Request a Date</h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Pick your event type and preferred date. We will confirm within 48 hours.</p>
                  </div>
                </div>
                <button onClick={() => setShowDateRequest(false)} className="text-white/40 hover:text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Event Type Selection */}
              <div>
                <label className="text-sm font-semibold text-[#1e2749] block mb-2">What are you scheduling?</label>
                <div className="space-y-2">
                  {[
                    ...(partnership.observation_days_total > 0 ? [{
                      id: 'observation',
                      label: 'On-Campus Observation Day',
                      detail: 'Full day, students in session. Our team observes classrooms and delivers personalized Love Notes to every teacher visited.',
                      timing: partnership.observation_days_total >= 3
                        ? 'Day 1: Sept-Dec, Day 2: Jan-Mar, Day 3: Apr-May'
                        : partnership.observation_days_total >= 2
                        ? 'Day 1: Sept-Dec, Day 2: Jan-Mar'
                        : 'Best scheduled Sept-Dec',
                      tips: 'Pick a regular school day with students in session. Early release or late start works if you want time for a staff debrief. We can start as early and stay as late as you need. Consider morning donuts for your team if you want to set the tone.',
                      icon: Eye,
                      color: '#D97706',
                    }] : []),
                    ...(partnership.executive_sessions_total > 0 ? [{
                      id: 'executive',
                      label: 'Executive Impact Session',
                      detail: 'Virtual strategic session with your leadership team. Align vision, review progress, plan next steps.',
                      timing: partnership.executive_sessions_total >= 3
                        ? 'Session 1: Jul-Aug, Session 2: Dec, Session 3: Apr-May'
                        : partnership.executive_sessions_total >= 2
                        ? 'Session 1: Jul-Aug, Session 2: Apr-May'
                        : 'Best scheduled Jul-Aug',
                      tips: 'Block a full 2 hours for your team even though the session is 90 minutes. This gives breathing room for the conversation to go where it needs to go. Virtual, so no travel needed.',
                      icon: GraduationCap,
                      color: '#2563EB',
                    }] : []),
                    ...(partnership.virtual_sessions_total > 0 ? [{
                      id: 'virtual',
                      label: 'Virtual Strategy Session',
                      detail: '45-60 minute virtual session. Coaching, problem-solving, planning support, or check-ins.',
                      timing: 'Flexible throughout the year. Most useful between observation days or when your team needs a boost.',
                      tips: 'These are designed to be responsive to what you need right now. No prep required. Come with questions, challenges, or just a "here is what is happening" and we will work through it together.',
                      icon: Headphones,
                      color: '#2A9D8F',
                    }] : []),
                  ].map(event => {
                    const Icon = event.icon;
                    const selected = dateRequestType === event.id;
                    return (
                      <button
                        key={event.id}
                        onClick={() => setDateRequestType(event.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selected ? 'border-[#E8B84B] bg-amber-50/50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${event.color}15` }}>
                            <Icon className="w-4 h-4" style={{ color: event.color }} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#1e2749]">{event.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>
                            {selected && (
                              <div className="mt-3 space-y-2">
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <p className="text-[10px] font-bold text-[#E8B84B] uppercase tracking-wide mb-1">Ideal Timing</p>
                                  <p className="text-xs text-gray-700">{event.timing}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <p className="text-[10px] font-bold text-[#2A9D8F] uppercase tracking-wide mb-1">Tips</p>
                                  <p className="text-xs text-gray-700">{event.tips}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selection */}
              {dateRequestType && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-[#1e2749] block mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={dateRequestDate}
                      onChange={e => setDateRequestDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#1e2749] block mb-1">Alternate Date <span className="font-normal text-gray-400">(optional)</span></label>
                    <input
                      type="date"
                      value={dateRequestAltDate}
                      onChange={e => setDateRequestAltDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#1e2749] block mb-1">Notes <span className="font-normal text-gray-400">(optional)</span></label>
                    <textarea
                      value={dateRequestNotes}
                      onChange={e => setDateRequestNotes(e.target.value)}
                      placeholder={dateRequestType === 'observation' ? 'e.g., We have an early release that day at 1pm. Would love a staff debrief after students leave.' : 'Any details that would help us prepare...'}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!dateRequestDate) {
                        setToastMessage('Please select a preferred date');
                        setTimeout(() => setToastMessage(''), 2000);
                        return;
                      }
                      setDateRequestSubmitting(true);
                      const eventLabels: Record<string, string> = {
                        observation: 'On-Campus Observation Day',
                        executive: 'Executive Impact Session',
                        virtual: 'Virtual Strategy Session',
                      };
                      try {
                        const resp = await fetch('/api/partners/request-date', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            partnershipId: partnership.id,
                            eventType: eventLabels[dateRequestType] || dateRequestType,
                            preferredDate: dateRequestDate,
                            alternateDate: dateRequestAltDate || null,
                            notes: dateRequestNotes || null,
                            requesterName: partnership.contact_name,
                            requesterEmail: partnership.contact_email,
                            needsTravel: dateRequestType === 'observation',
                          }),
                        });
                        const data = await resp.json();
                        if (data.success) {
                          setShowDateRequest(false);
                          setDateRequestType('');
                          setDateRequestDate('');
                          setDateRequestAltDate('');
                          setDateRequestNotes('');
                          setToastMessage('Date request submitted. We will confirm within 48 hours.');
                          setTimeout(() => setToastMessage(''), 4000);
                        }
                      } catch {
                        setToastMessage('Something went wrong. Please try again.');
                        setTimeout(() => setToastMessage(''), 3000);
                      } finally {
                        setDateRequestSubmitting(false);
                      }
                    }}
                    disabled={dateRequestSubmitting || !dateRequestDate}
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {dateRequestSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><CalendarDays className="w-4 h-4" /> Request This Date</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── GOAL SETTING WIZARD ─── */}
      {showGoalWizard && partnership && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => setShowGoalWizard(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#38618C] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-[#E8B84B]" />
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>
                      {goalStep === 0 ? 'What matters most to your team?' : goalStep === 1 ? 'Set your targets' : 'Review your goals'}
                    </h3>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Step {goalStep + 1} of 3</p>
                  </div>
                </div>
                <button onClick={() => setShowGoalWizard(false)} className="text-white/40 hover:text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Priority Selection */}
              {goalStep === 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Pick the areas that matter most to your {partnership.partnership_type === 'district' ? 'district' : 'school'}. We&apos;ll suggest targets based on what TDI partners typically aim for.</p>
                  <div className="space-y-2">
                    {[
                      { key: 'hub_engagement', label: 'Hub Engagement', desc: 'Get my team actively using the Learning Hub', icon: '1' },
                      { key: 'stress_reduction', label: 'Teacher Wellness', desc: 'Reduce staff stress and prevent burnout', icon: '2' },
                      { key: 'course_completion', label: 'PD Completion', desc: 'Teachers completing courses and earning PD hours', icon: '3' },
                      { key: 'classroom_application', label: 'Classroom Implementation', desc: 'Teachers applying what they learn in their classrooms', icon: '4' },
                      { key: 'retention_intent', label: 'Staff Retention', desc: 'Keep great teachers at our school', icon: '5' },
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => setGoalSelections(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          goalSelections[item.key]
                            ? 'border-[#8B5CF6] bg-purple-50'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            goalSelections[item.key] ? 'bg-[#8B5CF6] text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {goalSelections[item.key] ? <Check className="w-3.5 h-3.5" /> : item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1e2749]">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setShowGoalWizard(false)} className="text-xs text-gray-400 px-3 py-2">Cancel</button>
                    <button
                      onClick={() => {
                        // Set default targets for selected goals
                        const defaults: Record<string, number> = { hub_engagement: 70, stress_reduction: 15, course_completion: 50, classroom_application: 60, retention_intent: 85 };
                        const targets: Record<string, number> = {};
                        Object.keys(goalSelections).filter(k => goalSelections[k]).forEach(k => { targets[k] = defaults[k] || 50; });
                        setGoalTargets(targets);
                        setGoalStep(1);
                      }}
                      disabled={Object.values(goalSelections).filter(Boolean).length === 0}
                      className="text-sm font-semibold px-5 py-2 rounded-lg bg-[#1e2749] text-white hover:bg-[#2a3459] disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Target Setting with Sliders */}
              {goalStep === 1 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Adjust each target to what feels ambitious but achievable. These are starting points -- you&apos;ll finalize them with our team on your kickoff call.</p>
                  <div className="space-y-5">
                    {Object.entries(goalTargets).map(([key, value]) => {
                      const labels: Record<string, { label: string; unit: string; max: number; benchmark: string }> = {
                        hub_engagement: { label: 'Hub Login Rate', unit: '%', max: 100, benchmark: 'Most TDI partners aim for 60-80%' },
                        stress_reduction: { label: 'Stress Reduction', unit: '%', max: 50, benchmark: 'Average TDI partner sees 10-20% improvement' },
                        course_completion: { label: 'Course Completion Rate', unit: '%', max: 100, benchmark: 'Strong schools hit 40-60% completion' },
                        classroom_application: { label: 'Classroom Implementation', unit: '%', max: 100, benchmark: 'Top partners see 50-70% application rate' },
                        retention_intent: { label: 'Staff Retention Intent', unit: '%', max: 100, benchmark: 'National average is 82%, TDI partners avg 90%' },
                      };
                      const info = labels[key] || { label: key, unit: '%', max: 100, benchmark: '' };
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#1e2749]">{info.label}</span>
                            <span className="text-sm font-bold text-[#8B5CF6]">{value}{info.unit}</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max={info.max}
                            step="5"
                            value={value}
                            onChange={e => setGoalTargets(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">{info.benchmark}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-6">
                    <button onClick={() => setGoalStep(0)} className="text-xs text-gray-400 px-3 py-2">Back</button>
                    <button
                      onClick={() => setGoalStep(2)}
                      className="text-sm font-semibold px-5 py-2 rounded-lg bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Save */}
              {goalStep === 2 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Here&apos;s what we&apos;ll track together. These are draft goals -- you&apos;ll review and finalize them with our team on your kickoff call.</p>
                  <div className="space-y-2 mb-4">
                    {Object.entries(goalTargets).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        hub_engagement: 'Hub Login Rate',
                        stress_reduction: 'Stress Reduction',
                        course_completion: 'Course Completion',
                        classroom_application: 'Classroom Implementation',
                        retention_intent: 'Staff Retention',
                      };
                      return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                          <span className="text-sm text-[#1e2749]">{labels[key] || key}</span>
                          <span className="text-sm font-bold text-[#8B5CF6]">{value}%</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 mb-6">
                    <p className="text-xs text-amber-700">
                      <strong>These are draft goals.</strong> During your kickoff call, our team will review these with you, adjust based on your school&apos;s context, and lock them in. You can always update them later.
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setGoalStep(1)} className="text-xs text-gray-400 px-3 py-2">Back</button>
                    <button
                      onClick={async () => {
                        const kpis = Object.entries(goalTargets).map(([key, target]) => {
                          const labels: Record<string, string> = {
                            hub_engagement: 'Hub Login Rate', stress_reduction: 'Stress Reduction',
                            course_completion: 'Course Completion', classroom_application: 'Classroom Implementation',
                            retention_intent: 'Staff Retention',
                          };
                          return { kpi_key: key, kpi_label: labels[key] || key, target_value: target, target_unit: '%', current_value: 0, status: 'draft' };
                        });
                        await fetch(`/api/tdi-admin/leadership/${partnership.id}/kpis`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ kpis }),
                        });
                        setShowGoalWizard(false);
                        setGoalStep(0);
                        window.location.reload();
                      }}
                      className="text-sm font-semibold px-5 py-2 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors"
                    >
                      Save Draft Goals
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero - Elevated DashboardHeader component */}
      <DashboardHeader
        schoolName={partnership?.org_name || organization?.name || 'Your School'}
        location={
          organization?.address_city || organization?.address_state
            ? [organization?.address_city, organization?.address_state].filter(Boolean).join(', ')
            : undefined
        }
        phase={partnership.contract_phase}
        contractStart={partnership.contract_start}
        contractEnd={partnership.contract_end}
        partnershipGoal={partnership.partnership_goal}
        partnershipType={partnership.partnership_type}
      />

      {/* Tab Navigation - CCP approved sticky tab bar */}
      <div
        className="sticky top-0 z-30 bg-white border-b border-gray-100"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        role="tablist"
        aria-label="Dashboard sections"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className="flex items-center gap-1.5 px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0"
                style={{
                  borderBottomColor: activeTab === tab.id ? '#1B2A4A' : 'transparent',
                  color: activeTab === tab.id ? '#1B2A4A' : '#9CA3AF',
                }}
              >
                {tab.label}
                {tab.badge && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: '#DBEAFE', color: '#1D4ED8' }}
                  >
                    New
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main id="main-content" className="dashboard-content max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-8" role="main">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div
            role="tabpanel"
            id="panel-overview"
            aria-labelledby="tab-overview"
            className="space-y-6"
          >
            {/* ─── PARTNERSHIP SETUP CHECKLIST (contract-specific onboarding) ─── */}
            {showGettingStarted && (() => {
              const hasObservations = (partnership.observation_days_total || 0) > 0;
              const hasVirtualSessions = (partnership.virtual_sessions_total || 0) > 0;
              const isDistrict = partnership.partnership_type === 'district';

              const setupSteps = [
                // Always: staff roster
                {
                  id: 'roster',
                  title: staffStats.total > 0 ? 'Verify Your Team for the New Year' : 'Set Up Your Team\'s Access',
                  description: staffStats.total > 0
                    ? `${staffStats.total} educators on your roster. Review for any changes (new hires, departures) and assign Hub memberships and complimentary blog access.`
                    : `Upload your staff list to give your team Learning Hub access and complimentary blog subscriptions. CSV, spreadsheet, or a list of names and emails works.`,
                  done: staffStats.total > 0,
                  icon: Users,
                  action: staffStats.total > 0 ? undefined : () => navigateToTab('team'),
                  actionLabel: staffStats.total > 0 ? 'Review Team' : 'Add Staff',
                },
                // Only if contract includes in-person observations
                ...(hasObservations ? [{
                  id: 'photos',
                  title: 'Share Staff Photos',
                  description: 'Even a few photos help. When our team visits your building for observations, knowing faces makes the experience more personal for everyone. Send whatever you have -- a staff directory page, a few headshots, or a ZIP file. New staff can be added later.',
                  done: false,
                  icon: Eye,
                  action: () => navigateToTab('team'),
                  actionLabel: 'Upload',
                }] : []),
                // Always: Hub access
                {
                  id: 'hub_access',
                  title: 'Your Team Starts Exploring',
                  description: staffStats.hubLoggedIn > 0
                    ? `${staffStats.hubLoggedIn} of ${staffStats.total} educators have logged into the Hub so far.`
                    : 'Once your roster is uploaded, your team will receive an email with Hub access. This usually happens within 24 hours.',
                  done: staffStats.hubLoggedIn > 0,
                  icon: BookOpen,
                  action: () => window.open('https://teachersdeserveit.com/hub', '_blank'),
                  actionLabel: 'Preview Hub',
                },
                // Always: kickoff call
                {
                  id: 'schedule',
                  title: 'Schedule Your Kickoff Call',
                  description: 'A 30-minute call with our team to align on goals, walk through your dashboard, and answer any questions.',
                  done: actionItems.some(i => i.category === 'scheduling' && i.status === 'completed'),
                  icon: Calendar,
                  action: () => window.open('https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat', '_blank'),
                  actionLabel: 'Book Call',
                },
                // Always: goals
                {
                  id: 'goals',
                  title: 'Define What Success Looks Like',
                  description: partnershipKpis.length > 0
                    ? 'Goals are set. You can adjust these anytime.'
                    : 'What does a great year look like for your team? We\'ll track progress together.',
                  done: partnershipKpis.length > 0,
                  icon: Target,
                  action: partnershipKpis.length > 0 ? undefined : () => setShowGoalWizard(true),
                  actionLabel: 'Get Started',
                },
                // Only if contract includes observations or virtual sessions
                ...((hasObservations || hasVirtualSessions) ? [{
                  id: 'dates',
                  title: hasObservations ? 'Confirm Observation Dates' : 'Schedule Virtual Sessions',
                  description: hasObservations
                    ? `Your contract includes ${partnership.observation_days_total} in-person observation day${partnership.observation_days_total > 1 ? 's' : ''}. Let\'s get those on the calendar.`
                    : `Your contract includes ${partnership.virtual_sessions_total} virtual session${partnership.virtual_sessions_total > 1 ? 's' : ''}. Pick times that work for your team.`,
                  done: actionItems.some(i => (i.title?.toLowerCase().includes('observation') || i.title?.toLowerCase().includes('session')) && i.status === 'completed'),
                  icon: CalendarDays,
                  action: () => setShowDateRequest(true),
                  actionLabel: 'Request Date',
                }] : []),
              ];

              const completedCount = setupSteps.filter(s => s.done).length;
              const allDone = completedCount === setupSteps.length;

              if (allDone) return null;

              return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-[#1B2A4A] to-[#38618C] px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Rocket className="w-5 h-5 text-[#E8B84B]" />
                        <div>
                          <h2 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Set Up Your Partnership</h2>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{completedCount} of {setupSteps.length} steps complete</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#E8B84B] rounded-full transition-all" style={{ width: `${(completedCount / setupSteps.length) * 100}%` }} />
                        </div>
                        <button onClick={() => setShowGettingStarted(false)} className="text-white/30 hover:text-white/70 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="divide-y divide-gray-50">
                    {setupSteps.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className={`px-6 py-4 flex items-center gap-4 ${step.done ? 'bg-gray-50/50' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.done ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {step.done ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Icon className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${step.done ? 'text-gray-400 line-through' : 'text-[#1e2749]'}`}>{step.title}</p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                          {!step.done && step.action && (
                            <button
                              onClick={step.action}
                              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors flex-shrink-0"
                            >
                              {step.actionLabel}
                            </button>
                          )}
                          {step.done && (
                            <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">Done</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ─── YOUR NEXT STEPS (action items) ─── */}
            {actionItems.filter(i => i.status === 'pending' || i.status === 'in_progress').length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#E0F7F6' }}>
                      <Target className="w-3.5 h-3.5" style={{ color: '#2A9D8F' }} />
                    </div>
                    <span className="text-sm font-bold text-[#1e2749]">Your Next Steps</span>
                    <span className="text-[10px] bg-[#E0F7F6] text-[#2A9D8F] px-2 py-0.5 rounded-full font-semibold">
                      {actionItems.filter(i => i.status === 'pending' || i.status === 'in_progress').length} remaining
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {actionItems
                    .filter(i => i.status === 'pending' || i.status === 'in_progress')
                    .slice(0, 4)
                    .map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          item.status === 'in_progress' ? 'border-[#E8B84B] bg-[#FFF8E7]' : 'border-gray-300'
                        }`}>
                          {item.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-[#E8B84B]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1e2749]">{item.title}</p>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>}
                        </div>
                        {item.cta_url && (
                          <a href={item.cta_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#2A9D8F] hover:underline flex-shrink-0 flex items-center gap-1">
                            {item.cta_label || 'Go'} <ArrowRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                </div>
                {actionItems.filter(i => i.status === 'completed').length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-3 text-center">
                    {actionItems.filter(i => i.status === 'completed').length} completed
                  </p>
                )}
              </div>
            )}

            {/* ─── STAFF ACTIVATION ─── */}
            {staffStats.total > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EDE9FE' }}>
                      <Users className="w-3.5 h-3.5" style={{ color: '#8B5CF6' }} />
                    </div>
                    <span className="text-sm font-bold text-[#1e2749]">Team Activation</span>
                  </div>
                  <button
                    onClick={() => navigateToTab('team')}
                    className="text-xs font-medium text-[#8B5CF6] hover:underline flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8B5CF6" strokeWidth="3"
                        strokeDasharray={`${staffStats.total > 0 ? (staffStats.hubLoggedIn / staffStats.total) * 100 : 0}, 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#1e2749]">{staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : 0}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#1e2749]">{staffStats.hubLoggedIn}</span>
                      <span className="text-sm text-gray-500">of {staffStats.total} educators active on Hub</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {staffStats.hubLoggedIn === 0
                        ? 'Your team hasn\'t logged in yet -- they\'ll receive an email invite shortly.'
                        : staffStats.hubLoggedIn < staffStats.total
                          ? `${staffStats.total - staffStats.hubLoggedIn} educators haven't logged in yet. A quick reminder can help.`
                          : 'Your entire team is active on the Hub!'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── WHAT EDUCATORS ARE SAYING ─── */}
            {teacherQuotes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FFF8E7' }}>
                    <Quote className="w-3.5 h-3.5" style={{ color: '#E8B84B' }} />
                  </div>
                  <span className="text-sm font-bold text-[#1e2749]">What Educators Are Saying</span>
                </div>
                <div className="space-y-3">
                  {teacherQuotes.slice(0, 3).map((q) => (
                    <div key={q.id} className="border-l-2 border-[#E8B84B] pl-4 py-1">
                      <p className="text-sm text-gray-700 italic" style={{ fontFamily: 'Georgia, serif' }}>
                        &ldquo;{q.quote_text}&rdquo;
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        -- {q.teacher_role}{q.session_type ? `, ${q.session_type}` : ''}{q.created_at ? `, ${new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── OBSERVATION IMPACT ─── */}
            {observationImpact?.has_data && observationImpact.observations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#E0F7F6' }}>
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: '#2A9D8F' }} />
                  </div>
                  <span className="text-sm font-bold text-[#1e2749]">Impact Spotlight</span>
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold">After your last visit</span>
                </div>
                {(() => {
                  const latest = observationImpact.observations[0];
                  return (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
                        After your {latest.event_title || 'observation'} on {new Date(latest.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, here&apos;s what changed in the week that followed:
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl p-3 bg-gray-50 text-center">
                          <p className={`text-lg font-bold ${latest.engagement_change_pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {latest.engagement_change_pct >= 0 ? '+' : ''}{latest.engagement_change_pct}%
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Hub engagement</p>
                        </div>
                        {latest.mood_change !== null && (
                          <div className="rounded-xl p-3 bg-gray-50 text-center">
                            <p className={`text-lg font-bold ${latest.mood_change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {latest.mood_change >= 0 ? '+' : ''}{latest.mood_change.toFixed(1)}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Wellness shift</p>
                          </div>
                        )}
                        <div className="rounded-xl p-3 bg-gray-50 text-center">
                          <p className="text-lg font-bold text-[#E8B84B]">{latest.after_quick_wins}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Tools used after</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ─── EXAMPLE DASHBOARD BANNER ─── show when no real Hub data yet */}
            {staffStats.hubLoggedIn === 0 && !hubStats?.has_real_data && (
              <div className="flex items-center justify-between bg-[#F0FDFA] rounded-2xl px-5 py-4 border border-[#99F6E4]">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#134E4A] mb-0.5">Your dashboard is ready and waiting for your team</p>
                  <p className="text-xs text-[#5F9EA0]">Once your educators log into the Hub, real engagement data will appear here automatically.</p>
                </div>
                <a
                  href="/Example-Dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors whitespace-nowrap ml-4"
                >
                  See an Example Dashboard
                </a>
              </div>
            )}

            {/* ─── AI SUMMARY ─── replaces data overload */}
            {(() => {
              // Always show real data -- no fake preview numbers
              const isPreview = false;
              const hubPct = hubStats?.hub_login_pct ?? (staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : 0);
              const toolsExplored = hubStats?.quick_wins_completed ?? 0;
              const wellnessScore = metricsRange === 'month' ? (hubStats?.mood_avg_30d ?? hubStats?.mood_avg_7d ?? null) : (hubStats?.mood_avg_7d ?? null);
              const activeUsers = metricsRange === 'month' ? (hubStats?.logins_this_month ?? hubStats?.active_users_7d ?? 0) : (hubStats?.active_users_7d ?? 0);
              const totalDeliverables = (partnership.observation_days_total || 0) + (partnership.virtual_sessions_total || 0);
              const completedDeliverables = (partnership.observation_days_completed || 0) + (partnership.virtual_sessions_completed || 0);
              const phaseNum = partnership.contract_phase === 'IGNITE' ? 1 : partnership.contract_phase === 'ACCELERATE' ? 2 : 3;

              return (
                <>
                  {/* AI Summary Card */}
                  <div className={`bg-white rounded-2xl p-6 md:p-7 shadow-sm border ${isPreview ? 'border-purple-200 ring-1 ring-purple-100' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8B84B]" />
                      <span className="text-[10px] font-bold text-[#E8B84B] uppercase tracking-widest">Partnership Intelligence</span>
                      {isPreview && <span className="text-[9px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full ml-2">PREVIEW</span>}
                    </div>
                    <p className="text-base md:text-lg leading-relaxed text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                      {hubPct > 0 ? (
                        <>Your team is {hubPct >= 70 ? 'engaged' : hubPct >= 40 ? 'building momentum' : 'getting started'}. {hubPct}% of {staffStats.total} educators logged into the Hub this month{toolsExplored > 0 ? `, exploring ${toolsExplored} tools` : ''}{partnership.partnership_type === 'district' ? ` across ${apiBuildings.length} buildings` : ''}. {completedDeliverables > 0 ? `${completedDeliverables} of ${totalDeliverables} deliverables are complete.` : ''} {wellnessScore ? `Your educators' average wellness score is ${wellnessScore} out of 5${wellnessScore >= 4 ? ' -- stronger than the national average' : ''}.` : ''}</>
                      ) : (
                        <>Your partnership is active with {staffStats.total} educators enrolled. {completedDeliverables} of {totalDeliverables} deliverables completed so far. As your team engages with the Hub, this summary will update with real-time insights.</>
                      )}
                    </p>
                    <button
                      onClick={() => toggleOverviewSection('hub-detail')}
                      className="text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors"
                    >
                      {overviewSections['hub-detail'] ? 'Hide details \u2191' : 'See detailed breakdown \u2193'}
                    </button>
                    {overviewSections['hub-detail'] && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-xl p-3 bg-gray-50">
                            <p className="text-xl font-bold" style={{ color: '#E8B84B' }}>{hubPct}%</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">team logged in</p>
                          </div>
                          <div className="rounded-xl p-3 bg-gray-50">
                            <p className="text-xl font-bold" style={{ color: '#2A9D8F' }}>{toolsExplored}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">tools explored</p>
                          </div>
                          <div className="rounded-xl p-3 bg-gray-50">
                            <p className="text-xl font-bold" style={{ color: '#2563EB' }}>{activeUsers}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{metricsRange === 'month' ? 'active this month' : 'active this week'}</p>
                          </div>
                          <div className="rounded-xl p-3 bg-gray-50">
                            <p className="text-xl font-bold" style={{ color: '#2A9D8F' }}>{wellnessScore ? `${wellnessScore}/5` : `${staffStats.hubLoggedIn}/${staffStats.total}`}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{wellnessScore ? 'wellness score' : 'staff logged in'}</p>
                          </div>
                        </div>
                        {hubStats?.course_completions && hubStats.course_completions > 0 && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                            <Award className="w-4 h-4 text-[#E8B84B] flex-shrink-0" />
                            <p className="text-sm text-gray-600"><strong>{hubStats.course_completions}</strong> courses completed -- PD credit your team can show you.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Date Range Toggle + Visual Gauge Rings */}
                  <div className="flex justify-end mb-1">
                    <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
                      {([['month', 'This Month'], ['quarter', 'Quarter'], ['all', 'All Time']] as const).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setMetricsRange(key)}
                          className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                            metricsRange === key
                              ? 'bg-white text-[#1e2749] shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(partnershipKpis.length > 0
                      ? partnershipKpis.slice(0, 4).map(kpi => {
                          const kpiColors: Record<string, string> = {
                            strategy_implementation: '#8B5CF6', classroom_application: '#2563EB',
                            course_completion: '#4ecdc4', field_notes_earned: '#E8B84B',
                            pd_hours_completed: '#F97316', team_wellness: '#2A9D8F',
                            stress_reduction: '#EC4899', retention_intent: '#10B981',
                            hub_engagement: '#E8B84B', custom_course_mandate: '#1e2749',
                          }
                          const pct = kpi.target_value > 0 ? Math.min((kpi.current_value / kpi.target_value) * 100, 100) : 0
                          return {
                            value: pct,
                            label: kpi.kpi_label.length > 25 ? kpi.kpi_label.slice(0, 22) + '...' : kpi.kpi_label,
                            display: `${kpi.current_value}${kpi.target_unit}`,
                            color: kpiColors[kpi.kpi_key] || '#1e2749',
                            max: 100,
                          }
                        })
                      : [
                          { value: hubPct, label: 'Hub Engagement', display: `${hubPct}%`, color: '#E8B84B', max: 100 },
                          { value: totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0, label: 'Deliverables', display: `${completedDeliverables}/${totalDeliverables}`, color: '#4ecdc4', max: 100 },
                          { value: wellnessScore ? (wellnessScore / 5) * 100 : (staffStats.total > 0 ? (staffStats.hubLoggedIn / staffStats.total) * 100 : 0), label: wellnessScore ? (metricsRange === 'month' ? '30-Day Wellness' : 'Team Wellness') : 'Staff Active', display: wellnessScore ? `${wellnessScore}` : `${staffStats.hubLoggedIn}`, color: '#2A9D8F', max: 100 },
                          { value: (phaseNum / 3) * 100, label: 'Current Phase', display: `${phaseNum}/3`, color: '#1e2749', max: 100 },
                        ]
                    ).map((gauge, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="relative w-20 h-20 mb-3">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="#F3F4F6" strokeWidth="6" />
                            <circle cx="40" cy="40" r="34" fill="none" stroke={gauge.color} strokeWidth="6"
                              strokeDasharray={`${gauge.value * 2.136} ${(100 - gauge.value) * 2.136}`} strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold" style={{ color: gauge.color }}>{gauge.display}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">{gauge.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Principal Goal Setting -- show when no KPIs set yet */}
                  {partnershipKpis.length === 0 && (
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#8B5CF6]" />
                          <span className="text-sm font-semibold text-[#1e2749]">Set a Goal for Your Team</span>
                        </div>
                        <button
                          onClick={() => setShowGoalWizard(true)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-colors"
                        >
                          Get Started
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Tell us what success looks like for your school. We&apos;ll track progress and help you get there.</p>
                    </div>
                  )}

                  {/* Board Report Download */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const w = window.open('', '_blank');
                        if (!w) return;
                        const schoolName = partnership.org_name || partnership.contact_name || 'School';
                        const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        w.document.write(`<!DOCTYPE html><html><head><title>${schoolName} - TDI Partnership Report</title>
                          <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e2749; max-width: 800px; margin: 0 auto; padding: 40px; }
                            h1 { font-size: 28px; margin-bottom: 4px; }
                            .subtitle { color: #6B7280; font-size: 14px; margin-bottom: 32px; }
                            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
                            .stat { background: #F9FAFB; border-radius: 12px; padding: 20px; text-align: center; }
                            .stat-value { font-size: 32px; font-weight: 700; color: #2A9D8F; }
                            .stat-label { font-size: 11px; color: #6B7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
                            .section { margin-bottom: 28px; }
                            .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #F3F4F6; }
                            .quote { border-left: 3px solid #E8B84B; padding: 8px 16px; margin: 8px 0; font-style: italic; color: #374151; }
                            .quote-attr { font-size: 11px; color: #9CA3AF; font-style: normal; }
                            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #9CA3AF; font-size: 11px; text-align: center; }
                            @media print { body { padding: 20px; } }
                          </style>
                        </head><body>
                          <h1>${schoolName}</h1>
                          <p class="subtitle">TDI Partnership Report | ${date} | Phase: ${partnership.contract_phase || 'IGNITE'}</p>
                          <div class="stats">
                            <div class="stat"><div class="stat-value">${staffStats.total}</div><div class="stat-label">Educators Enrolled</div></div>
                            <div class="stat"><div class="stat-value">${hubPct}%</div><div class="stat-label">Hub Engagement</div></div>
                            <div class="stat"><div class="stat-value">${completedDeliverables}/${totalDeliverables}</div><div class="stat-label">Deliverables</div></div>
                            <div class="stat"><div class="stat-value">${wellnessScore ? wellnessScore + '/5' : staffStats.hubLoggedIn}</div><div class="stat-label">${wellnessScore ? 'Wellness Score' : 'Staff Active'}</div></div>
                          </div>
                          <div class="section">
                            <div class="section-title">Partnership Summary</div>
                            <p style="font-size:14px;line-height:1.7;color:#374151;">
                              ${hubPct > 0
                                ? `${hubPct}% of ${staffStats.total} educators are actively engaging with the TDI Learning Hub. ${toolsExplored > 0 ? `The team has explored ${toolsExplored} classroom tools. ` : ''}${completedDeliverables > 0 ? `${completedDeliverables} of ${totalDeliverables} contracted deliverables are complete.` : ''}`
                                : `${staffStats.total} educators are enrolled in the TDI Learning Hub with access to courses, tools, and PD resources. The partnership is in the onboarding phase.`
                              }
                            </p>
                          </div>
                          ${teacherQuotes.length > 0 ? `
                            <div class="section">
                              <div class="section-title">What Educators Are Saying</div>
                              ${teacherQuotes.slice(0, 3).map(q => `<div class="quote">"${q.quote_text}"<div class="quote-attr">-- ${q.teacher_role}</div></div>`).join('')}
                            </div>
                          ` : ''}
                          ${partnershipKpis.length > 0 ? `
                            <div class="section">
                              <div class="section-title">Key Performance Indicators</div>
                              ${partnershipKpis.map(k => `<p style="font-size:14px;margin:6px 0;"><strong>${k.kpi_label}:</strong> ${k.current_value}${k.target_unit} of ${k.target_value}${k.target_unit} target</p>`).join('')}
                            </div>
                          ` : ''}
                          <div class="footer">
                            <p>Teachers Deserve It | teachersdeserveit.com</p>
                            <p style="margin-top:4px;">Generated ${new Date().toLocaleDateString()}</p>
                          </div>
                        </body></html>`);
                        w.document.close();
                        setTimeout(() => w.print(), 500);
                      }}
                      className="text-xs font-medium text-gray-500 hover:text-[#1e2749] flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download Board Report
                    </button>
                  </div>

                  {/* Partnership Health */}
                  <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-4">
                    {(() => {
                      const momentum = totalDeliverables > 0
                        ? Math.round(((completedDeliverables / totalDeliverables) * 100 + hubPct + (pendingItems.length === 0 ? 100 : Math.max(0, 100 - pendingItems.length * 10))) / 3)
                        : 0;
                      const status = momentum >= 70 ? 'Strong' : momentum >= 40 ? 'Building' : 'Getting Started';
                      const dotColor = momentum >= 70 ? '#22c55e' : momentum >= 40 ? '#EAB308' : '#9CA3AF';
                      return (
                        <>
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}60` }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1e2749]">Partnership Momentum: <span style={{ color: dotColor }}>{status}</span></p>
                            <p className="text-xs text-gray-500 truncate">
                              {hubPct > 0 ? `${hubPct}% Hub engagement` : 'Hub onboarding'} | {completedDeliverables}/{totalDeliverables} deliverables | {pendingItems.length} items pending
                            </p>
                          </div>
                          <button
                            onClick={() => navigateToTab('blueprint', 'contract-deliverables')}
                            className="text-xs font-medium text-[#4ecdc4] hover:underline flex-shrink-0 flex items-center gap-1"
                          >
                            Blueprint <ArrowRight className="w-3 h-3" />
                          </button>
                        </>
                      );
                    })()}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { href: 'https://teachersdeserveit.com/hub', icon: BookOpen, label: 'Open Hub', bg: '#FFF8E7', iconColor: '#E8B84B' },
                      { href: 'https://calendly.com/raehughart', icon: CalendarDays, label: 'Schedule', bg: '#E0F7F6', iconColor: '#2A9D8F' },
                      { href: '#', icon: Star, label: 'Quiz', bg: '#EDE9FE', iconColor: '#8B5CF6', onClick: () => toggleOverviewSection('leadership') },
                      { href: '#', icon: FileText, label: 'Tools', bg: '#DBEAFE', iconColor: '#2563EB', onClick: () => toggleOverviewSection('leadership') },
                    ].map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <a
                          key={i}
                          href={action.onClick ? undefined : action.href}
                          target={action.onClick ? undefined : '_blank'}
                          rel={action.onClick ? undefined : 'noopener noreferrer'}
                          onClick={action.onClick ? (e: React.MouseEvent) => { e.preventDefault(); action.onClick?.(); } : undefined}
                          className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: action.bg }}>
                            <Icon className="w-4 h-4" style={{ color: action.iconColor }} />
                          </div>
                          <span className="text-[11px] font-semibold text-[#1e2749]">{action.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* ─── RECENT ACTIVITY FEED ─── */}
            {recentActivity.length > 0 && (
              <>
                <button
                  onClick={() => toggleOverviewSection('community')}
                  className="w-full bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                      <Zap className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#1e2749]">What&apos;s New</p>
                      <p className="text-xs text-gray-500">{recentActivity.length} recent activities</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${overviewSections['community'] ? 'rotate-180' : ''}`} />
                </button>
                {overviewSections['community'] && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 -mt-4 pt-8">
                    <div className="space-y-3">
                      {recentActivity.slice(0, 8).map((a, i) => {
                        const actionLabels: Record<string, string> = {
                          'login': 'Dashboard viewed',
                          'account_created': 'Account activated',
                          'action_completed': 'Action item completed',
                          'action_paused': 'Action item paused',
                          'evidence_uploaded': 'Evidence uploaded',
                          'monthly_email_sent': 'Monthly update sent',
                          'staff_provisioned': 'Staff added to Hub',
                          'invite_accepted': 'Portal invite accepted',
                        };
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700">{actionLabels[a.action] || a.action.replace(/_/g, ' ')}</p>
                              <p className="text-[10px] text-gray-400">{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ─── COLLAPSIBLE: Hub Intelligence ─── */}
            {hubIntel && (
              <>
                <button
                  onClick={() => toggleOverviewSection('hub-activity')}
                  className="w-full bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFF8E7' }}>
                      <Sparkles className="w-4 h-4" style={{ color: '#E8B84B' }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#1e2749]">Hub Intelligence</p>
                      <p className="text-xs text-gray-500">Popular tools, educator types, community activity, teacher quotes</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${overviewSections['hub-activity'] ? 'rotate-180' : ''}`} />
                </button>
                {overviewSections['hub-activity'] && (
                  <div className="-mt-4">

            {/* Partnership Momentum Bar -- hidden, replaced by visual-first health bar above */}
            <div className="hidden">
            <div
              className="rounded-2xl p-5 md:p-6"
              style={{
                background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 50%, #38618C 100%)',
                boxShadow: '0 4px 24px rgba(27,42,74,0.2)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <Sparkles className="w-7 h-7 text-[#FFBA06]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Partnership Momentum</p>
                    <p className="text-white text-xl md:text-2xl font-bold">
                      {(() => {
                        // Calculate momentum score based on completed items
                        const totalDeliverables = (partnership.observation_days_total || 0) + (partnership.virtual_sessions_total || 0);
                        const completedDeliverables = (partnership.observation_days_completed || 0) + (partnership.virtual_sessions_completed || 0);
                        const deliverableScore = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;
                        const hubScore = staffStats.total > 0 ? (staffStats.hubLoggedIn / staffStats.total) * 100 : 0;
                        const actionScore = pendingItems.length === 0 ? 100 : Math.max(0, 100 - (pendingItems.length * 10));
                        const momentum = Math.round((deliverableScore + hubScore + actionScore) / 3);
                        return `${momentum}%`;
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs text-white/60 mb-2">
                    <span>Starting Out</span>
                    <span>Building</span>
                    <span>Thriving</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: (() => {
                          const totalDeliverables = (partnership.observation_days_total || 0) + (partnership.virtual_sessions_total || 0);
                          const completedDeliverables = (partnership.observation_days_completed || 0) + (partnership.virtual_sessions_completed || 0);
                          const deliverableScore = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;
                          const hubScore = staffStats.total > 0 ? (staffStats.hubLoggedIn / staffStats.total) * 100 : 0;
                          const actionScore = pendingItems.length === 0 ? 100 : Math.max(0, 100 - (pendingItems.length * 10));
                          return `${Math.round((deliverableScore + hubScore + actionScore) / 3)}%`;
                        })(),
                        background: 'linear-gradient(90deg, #4ecdc4, #FFBA06, #F59E0B)',
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigateToTab('blueprint', 'contract-deliverables')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  View Blueprint
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>{/* end hidden momentum bar */}

            {/* Hub Activity -- What your teachers are doing on the Hub (inside collapsible wrapper) */}
            {hubStats && hubStats.has_real_data && (
              <div
                className="bg-white rounded-2xl p-5 md:p-6"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,184,75,0.12)' }}>
                    <Sparkles className="w-5 h-5" style={{ color: '#E8B84B' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: '#1B2A4A' }}>Learning Hub Activity</h3>
                    <p className="text-xs text-gray-500">What your team is doing on the TDI Learning Hub this month</p>
                  </div>
                </div>

                {/* Core metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
                    <p className="text-2xl font-bold" style={{ color: '#E8B84B' }}>{hubStats.hub_login_pct ?? 0}%</p>
                    <p className="text-xs text-gray-500 mt-1">of your team logged in this month</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
                    <p className="text-2xl font-bold" style={{ color: '#2A9D8F' }}>{hubStats.quick_wins_completed ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">tools explored by your educators</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
                    <p className="text-2xl font-bold" style={{ color: '#2563EB' }}>{hubStats.active_users_7d ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">active in the last 7 days</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: '#F9FAFB' }}>
                    {hubStats.mood_avg_7d !== null ? (
                      <>
                        <p className="text-2xl font-bold" style={{ color: hubStats.mood_avg_7d >= 4 ? '#2A9D8F' : hubStats.mood_avg_7d >= 3 ? '#EAB308' : '#EF4444' }}>{hubStats.mood_avg_7d}/5</p>
                        <p className="text-xs text-gray-500 mt-1">avg team wellness score</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>{hubStats.moment_mode_uses_7d ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-1">wellness resets this week</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Rich intelligence data */}
                {hubIntel && (() => {
                  const intel = hubIntel as {
                    popularTools?: { title: string; views: number }[];
                    mostCommonType?: { type: string; count: number } | null;
                    quizBreakdown?: Record<string, number>;
                    communityPostCount?: number;
                    qaThreadCount?: number;
                    communityHighlights?: { quote: string; type: string }[];
                    fieldNotesEarned?: number;
                    educatorsNeedingSupport?: number;
                    testimonials?: string[];
                  };
                  return (
                  <div className="space-y-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>

                    {/* Popular tools in your building */}
                    {(intel.popularTools as { title: string; views: number }[])?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Popular in Your Building</p>
                        <div className="flex flex-wrap gap-2">
                          {(intel.popularTools as { title: string; views: number }[]).slice(0, 4).map((tool, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#FFF8E7', color: '#92400E' }}>
                              {tool.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Educator quiz breakdown */}
                    {intel.mostCommonType && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F9FAFB' }}>
                        <span className="text-lg">&#9734;</span>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                            Your building&apos;s most common educator type: <strong>The {(intel.mostCommonType as { type: string; count: number }).type}</strong>
                          </p>
                          {Object.keys(intel.quizBreakdown as Record<string, number>).length > 1 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {Object.entries(intel.quizBreakdown as Record<string, number>).map(([type, count]) => `${count} ${type}${(count as number) !== 1 ? 's' : ''}`).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Community engagement */}
                    {((intel.communityPostCount as number) > 0 || (intel.qaThreadCount as number) > 0) && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F0FDF4' }}>
                        <span className="text-lg">&#128172;</span>
                        <p className="text-sm" style={{ color: '#374151' }}>
                          Your team contributed <strong>{intel.communityPostCount as number} posts</strong> and engaged in <strong>{intel.qaThreadCount as number} Q&A threads</strong> -- helping other educators across the country.
                        </p>
                      </div>
                    )}

                    {/* Community highlight (anonymized) */}
                    {(intel.communityHighlights as { quote: string; type: string }[])?.length > 0 && (
                      <div className="p-4 rounded-xl" style={{ background: '#FFFBEB', borderLeft: '3px solid #E8B84B' }}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">From Your Team</p>
                        <p className="text-sm italic" style={{ color: '#374151', lineHeight: 1.6 }}>
                          &ldquo;{(intel.communityHighlights as { quote: string }[])[0].quote}&rdquo;
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">-- An educator in your building</p>
                      </div>
                    )}

                    {/* Field Notes earned */}
                    {(intel.fieldNotesEarned as number) > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F9FAFB' }}>
                        <span className="text-lg">&#127942;</span>
                        <p className="text-sm" style={{ color: '#374151' }}>
                          Your team earned <strong>{intel.fieldNotesEarned as number} Field Notes</strong> -- recognitions for showing up and doing the work.
                        </p>
                      </div>
                    )}

                    {/* TDI wellness outreach */}
                    {(intel.educatorsNeedingSupport as number) > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#EFF6FF' }}>
                        <span className="text-lg">&#128153;</span>
                        <p className="text-sm" style={{ color: '#374151' }}>
                          TDI personally reached out to <strong>{intel.educatorsNeedingSupport as number}</strong> team member{(intel.educatorsNeedingSupport as number) !== 1 ? 's' : ''} this week for a wellness check-in.
                        </p>
                      </div>
                    )}

                    {/* Broader community testimonial */}
                    {(intel.testimonials as string[])?.length > 0 && (
                      <div className="pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">From the TDI Community</p>
                        <p className="text-sm italic text-gray-500" style={{ lineHeight: 1.6 }}>
                          &ldquo;{(intel.testimonials as string[])[0]}&rdquo;
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">-- TDI Hub educator</p>
                      </div>
                    )}
                  </div>
                  );
                })()}

                {hubStats.course_completions && hubStats.course_completions > 0 && (
                  <p className="text-xs text-gray-500 mt-4 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                    {hubStats.course_completions} course{hubStats.course_completions !== 1 ? 's' : ''} completed by your team -- PD credit they can show you.
                  </p>
                )}
              </div>
            )}
                  </div>
                )}
              </>
            )}

            {/* ─── COLLAPSIBLE: Partnership Timeline ─── */}
            {timelineEvents.length > 0 && (
              <>
                <button
                  onClick={() => toggleOverviewSection('timeline')}
                  className="w-full bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E0F7F6' }}>
                      <CalendarDays className="w-4 h-4" style={{ color: '#2A9D8F' }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#1e2749]">Partnership Timeline</p>
                      <p className="text-xs text-gray-500">
                        {timelineEvents.filter(e => e.status === 'completed').length} done, {timelineEvents.filter(e => e.status === 'in_progress').length} in progress, {timelineEvents.filter(e => e.status === 'upcoming').length} coming
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${overviewSections['timeline'] ? 'rotate-180' : ''}`} />
                </button>
              </>
            )}
            {overviewSections['timeline'] && timelineEvents.length > 0 && (
              <div className="-mt-4">

            {/* Three-Column Timeline - Done / In Progress / Coming Soon */}
            {timelineEvents.length > 0 && (
              <div
                className="bg-white rounded-2xl p-5 md:p-6"
                style={{
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(78,205,196,0.15), rgba(56,97,140,0.1))' }}
                    >
                      <CalendarDays className="w-5 h-5" style={{ color: '#4ecdc4' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Your Partnership Journey</h3>
                      <p className="text-xs text-gray-400">Key milestones and upcoming activities</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToTab('blueprint', 'contract-deliverables')}
                    className="text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: '#4ecdc4', background: 'rgba(78,205,196,0.1)' }}
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Done Column */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                      <span className="text-sm font-semibold" style={{ color: '#10B981' }}>Completed</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        {timelineEvents.filter(e => e.status === 'completed').length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {timelineEvents.filter(e => e.status === 'completed').slice(0, 4).map((event, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(16,185,129,0.1)' }}
                          >
                            <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                            {event.date && (
                              <p className="text-xs text-gray-400">
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {timelineEvents.filter(e => e.status === 'completed').length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">Milestones will appear here</p>
                      )}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#FBBF24' }} />
                      <span className="text-sm font-semibold" style={{ color: '#F59E0B' }}>In Progress</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#F59E0B' }}>
                        {timelineEvents.filter(e => e.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {timelineEvents.filter(e => e.status === 'in_progress').slice(0, 4).map((event, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid rgba(251,191,36,0.2)' }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(251,191,36,0.1)' }}
                          >
                            <Play className="w-4 h-4" style={{ color: '#F59E0B' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                            {event.date && (
                              <p className="text-xs text-gray-400">
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {timelineEvents.filter(e => e.status === 'in_progress').length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">Active items will appear here</p>
                      )}
                    </div>
                  </div>

                  {/* Coming Soon Column */}
                  <div className="rounded-xl p-4" style={{ background: 'rgba(56,97,140,0.05)', border: '1px solid rgba(56,97,140,0.1)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4" style={{ color: '#38618C' }} />
                      <span className="text-sm font-semibold" style={{ color: '#38618C' }}>Coming Soon</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(56,97,140,0.1)', color: '#38618C' }}>
                        {timelineEvents.filter(e => e.status === 'upcoming').length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {timelineEvents.filter(e => e.status === 'upcoming').slice(0, 4).map((event, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white"
                          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(56,97,140,0.1)' }}
                          >
                            <Calendar className="w-4 h-4" style={{ color: '#38618C' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                            {event.date && (
                              <p className="text-xs text-gray-400">
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {timelineEvents.filter(e => e.status === 'upcoming').length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">Upcoming items will appear here</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* end original timeline conditional */}
              </div>
            )}

            {/* ─── COLLAPSIBLE: Data & Indicators ─── wraps Leading Indicators + Building Spotlight + Investment */}
            <button
              onClick={() => toggleOverviewSection('indicators')}
              className="w-full bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F3F4F6' }}>
                  <BarChart3 className="w-4 h-4 text-[#38618C]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1e2749]">Data & Impact</p>
                  <p className="text-xs text-gray-500">Leading indicators, building spotlight, investment numbers, teacher quotes</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${overviewSections['indicators'] ? 'rotate-180' : ''}`} />
            </button>
            {overviewSections['indicators'] && (
              <div className="-mt-4 space-y-6">

            {/* Leading Indicators */}
            {(() => {
              // Get latest metrics from snapshots
              const getLatestMetric = (name: string) => {
                const matching = metricSnapshots.filter(m => m.metric_name === name);
                return matching.length > 0 ? matching[0].metric_value : null;
              };

              const avgStress = getLatestMetric('avg_stress');
              const avgImplementation = getLatestMetric('avg_implementation_confidence') || getLatestMetric('implementation_pct');
              const avgRetention = getLatestMetric('avg_retention_intent');

              // Check if ALL survey metrics are null - show example preview
              const hasNoSurveyData = avgStress === null && avgImplementation === null && avgRetention === null;

              const indicatorsContent = (
                <div id="leading-indicators" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#4ecdc4]" />
                      <h3 className="text-lg font-bold text-gray-900">Leading Indicators</h3>
                    </div>
                    <button
                      onClick={() => navigateToTab('preview', 'roi-summary')}
                      className="text-xs text-[#4ecdc4] font-medium hover:underline flex items-center gap-1"
                    >
                      View Impact <ArrowRight className="w-3 h-3" />
                    </button>
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
                            <span className="text-gray-500">{hasNoSurveyData ? 'Example District' : 'Your Data'}</span>
                            {hasNoSurveyData ? (
                              <span className="font-medium text-[#E8B84B]">6.0/10</span>
                            ) : avgStress !== null ? (
                              <span className={`font-medium ${avgStress <= 5 ? 'text-[#4ecdc4]' : avgStress <= 7 ? 'text-[#E8B84B]' : 'text-red-500'}`}>
                                {avgStress.toFixed(1)}/10
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium italic">Pending</span>
                            )}
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div
                              className={`h-full rounded-full ${hasNoSurveyData ? 'bg-[#E8B84B]' : avgStress !== null ? (avgStress <= 5 ? 'bg-[#4ecdc4]' : avgStress <= 7 ? 'bg-[#E8B84B]' : 'bg-red-400') : 'bg-gray-200'}`}
                              style={{width: hasNoSurveyData ? '60%' : avgStress !== null ? `${(avgStress / 10) * 100}%` : '0%'}}
                            />
                          </div>
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
                            <span className="text-[#1e2749] font-medium">74%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '74%'}} /></div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">{hasNoSurveyData ? 'Example District' : 'Your Data'}</span>
                            {hasNoSurveyData ? (
                              <span className="font-medium text-[#E8B84B]">21%</span>
                            ) : avgImplementation !== null ? (
                              <span className={`font-medium ${avgImplementation >= 7 ? 'text-[#4ecdc4]' : avgImplementation >= 5 ? 'text-[#E8B84B]' : 'text-red-500'}`}>
                                {avgImplementation <= 10 ? `${avgImplementation.toFixed(1)}/10` : `${avgImplementation.toFixed(0)}%`}
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium italic">Pending</span>
                            )}
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div
                              className={`h-full rounded-full ${hasNoSurveyData ? 'bg-[#E8B84B]' : avgImplementation !== null ? (avgImplementation >= 7 || avgImplementation >= 70 ? 'bg-[#4ecdc4]' : avgImplementation >= 5 || avgImplementation >= 50 ? 'bg-[#E8B84B]' : 'bg-red-400') : 'bg-gray-200'}`}
                              style={{width: hasNoSurveyData ? '21%' : avgImplementation !== null ? `${avgImplementation <= 10 ? (avgImplementation / 10) * 100 : avgImplementation}%` : '0%'}}
                            />
                          </div>
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
                            <span className="text-gray-500">{hasNoSurveyData ? 'Example District' : 'Your Data'}</span>
                            {hasNoSurveyData ? (
                              <span className="font-medium text-[#4ecdc4]">9.8/10</span>
                            ) : avgRetention !== null ? (
                              <span className={`font-medium ${avgRetention >= 7 ? 'text-[#4ecdc4]' : avgRetention >= 5 ? 'text-[#E8B84B]' : 'text-red-500'}`}>
                                {avgRetention.toFixed(1)}/10
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium italic">Pending</span>
                            )}
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full">
                            <div
                              className={`h-full rounded-full ${hasNoSurveyData ? 'bg-[#4ecdc4]' : avgRetention !== null ? (avgRetention >= 7 ? 'bg-[#4ecdc4]' : avgRetention >= 5 ? 'bg-[#E8B84B]' : 'bg-red-400') : 'bg-gray-200'}`}
                              style={{width: hasNoSurveyData ? '98%' : avgRetention !== null ? `${(avgRetention / 10) * 100}%` : '0%'}}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Industry data: RAND 2025, Learning Policy Institute · TDI data: Partner school surveys</p>
                  </div>
                </div>
              );

              return hasNoSurveyData ? (
                <ExamplePreview message="Example from a real TDI district - your indicators will appear after your baseline survey.">
                  {indicatorsContent}
                </ExamplePreview>
              ) : indicatorsContent;
            })()}

            {/* Building Spotlight */}
            {partnership.partnership_type === 'district' && (
              apiBuildings.length === 0 ? (
                <ExamplePreview message="Example from a TDI district with 6 buildings - your buildings will appear here after onboarding.">
                  <div id="building-spotlight" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                        <h3 className="text-base md:text-lg font-bold text-gray-900">Building Spotlight</h3>
                      </div>
                      <button className="text-xs text-[#4ecdc4] font-medium hover:underline flex items-center gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {/* Example Building 1 */}
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1e2749]">Harmony Elementary</span>
                            <span className="text-xs text-gray-400">· 40 staff · K-5</span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Most Engaged</span>
                            <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">Implementation</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Champion: Ms. Rivera</p>
                      </div>
                      {/* Example Building 2 */}
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1e2749]">Crescendo Middle</span>
                            <span className="text-xs text-gray-400">· 38 staff · 6-8</span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Top Learners</span>
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">Movement Leader</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Champion: Mr. Okafor</p>
                      </div>
                      {/* Example Building 3 */}
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1e2749]">Melody Primary</span>
                            <span className="text-xs text-gray-400">· 30 staff · PreK-2</span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-xs px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full font-medium">Wellness Leader</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Champion: Dr. Chen</p>
                      </div>
                    </div>
                  </div>
                </ExamplePreview>
              ) : (
                <div id="building-spotlight" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                      <h3 className="text-base md:text-lg font-bold text-gray-900">Building Spotlight</h3>
                    </div>
                    <button
                      onClick={() => navigateToTab('schools', 'buildings-list')}
                      className="text-xs text-[#4ecdc4] font-medium hover:underline flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
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
                </div>
              )
            )}

            {/* Hub Engagement */}
            {hubLoginPct === 0 ? (
              <ExamplePreview message="Example - your Hub engagement data appears once staff begin logging in.">
                <div id="hub-engagement" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#4ecdc4]" />
                      <h3 className="text-lg font-bold text-gray-900">Hub Engagement</h3>
                    </div>
                    <button className="text-xs text-[#4ecdc4] font-medium hover:underline flex items-center gap-1">
                      View Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Staff Enrolled Info */}
                    <div className="flex flex-col items-center justify-center p-4 bg-[#4ecdc4]/10 rounded-xl">
                      <span className="text-3xl font-bold text-[#1e2749]">{staffStats.total || '—'}</span>
                      <span className="text-sm text-gray-600 mt-1">Staff with Hub Access</span>
                      <p className="text-xs text-[#4ecdc4] font-medium mt-2">Logins will appear here once staff begin using the Hub</p>
                    </div>

                    {/* What to Expect */}
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-[#1e2749] mb-3">Coming Soon</p>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-xs py-1.5 text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-[#4ecdc4]" />
                          <span>Login rates by staff</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs py-1.5 text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-[#4ecdc4]" />
                          <span>Course completion tracking</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs py-1.5 text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-[#4ecdc4]" />
                          <span>Engagement depth metrics</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <a href="https://www.teachersdeserveit.com/hub" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[#4ecdc4] font-medium hover:underline mt-4">
                    <BookOpen className="w-3.5 h-3.5" /> Open Learning Hub →
                  </a>
                </div>
              </ExamplePreview>
            ) : (
              <div id="hub-engagement" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#4ecdc4]" />
                    <h3 className="text-lg font-bold text-gray-900">Hub Engagement</h3>
                  </div>
                  <button
                    onClick={() => navigateToTab('progress', 'hub-engagement-detail')}
                    className="text-xs text-[#4ecdc4] font-medium hover:underline flex items-center gap-1"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Donut Chart - Login Rate */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 md:w-36 md:h-36">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4ecdc4" strokeWidth="3"
                          strokeDasharray={`${hubLoginPct}, 100`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-[#1e2749]">{hubLoginPct}%</span>
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
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-xs py-1.5">
                        <span className="text-gray-600">Completed 1+ course</span>
                        <span className="text-gray-400 italic">Awaiting data</span>
                      </div>
                      <div className="flex justify-between text-xs py-1.5">
                        <span className="text-gray-600">Downloaded resources</span>
                        <span className="text-gray-400 italic">Awaiting data</span>
                      </div>
                      <div className="flex justify-between text-xs py-1.5">
                        <span className="text-gray-600">Active this month</span>
                        <span className="text-gray-400 italic">Awaiting data</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center bg-gray-50 rounded-lg py-2 px-3">
                      Data populates as staff engage with Hub
                    </p>
                  </div>

                  {/* Love Notes & Sessions */}
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-[#1e2749] mb-3">Support Delivered</p>
                    <div className="space-y-3">
                      {/* Love Notes - only show if there are any */}
                      {loveNotes > 0 && (
                        <div className="bg-pink-50 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-500" />
                          </div>
                          <div>
                            <span className="text-base font-bold text-[#1e2749]">{loveNotes}</span>
                            <p className="text-xs text-gray-500">Love Notes sent</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-[#1e2749]">{virtualSessionsCompleted} of {partnership.virtual_sessions_total || 4}</span>
                          <p className="text-xs text-gray-500">Virtual sessions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <a href="https://www.teachersdeserveit.com/hub" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#4ecdc4] font-medium hover:underline mt-4">
                  <BookOpen className="w-3.5 h-3.5" /> Open Learning Hub →
                </a>
              </div>
            )}

            {/* Investment By The Numbers - Dark Card */}
            <div
              className="rounded-2xl p-6 md:p-8 overflow-hidden relative"
              style={{
                background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 50%, #38618C 100%)',
                boxShadow: '0 8px 32px rgba(27,42,74,0.25)',
              }}
            >
              {/* Background pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,186,6,0.15)' }}
                  >
                    <BarChart3 className="w-6 h-6 text-[#FFBA06]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Investment By The Numbers</h3>
                    <p className="text-white/50 text-sm">Your partnership impact at a glance</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {/* Total Sessions */}
                  <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {(partnership.observation_days_completed || 0) + (partnership.virtual_sessions_completed || 0)}
                    </p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Sessions Delivered</p>
                  </div>

                  {/* Staff Reached */}
                  <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-3xl md:text-4xl font-bold text-[#4ecdc4] mb-1">
                      {staffStats.total}
                    </p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Staff Reached</p>
                  </div>

                  {/* Hours Invested */}
                  <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-3xl md:text-4xl font-bold text-[#FFBA06] mb-1">
                      {((partnership.observation_days_completed || 0) * 6) + ((partnership.virtual_sessions_completed || 0) * 1)}+
                    </p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">PD Hours</p>
                  </div>

                  {/* Love Notes - if any */}
                  <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-3xl md:text-4xl font-bold text-pink-400 mb-1">
                      {loveNotes || 0}
                    </p>
                    <p className="text-xs text-white/50 uppercase tracking-wider">Love Notes Sent</p>
                  </div>
                </div>

                {/* View Full Report Link */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => navigateToTab('preview', 'roi-summary')}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255,186,6,0.15)',
                      color: '#FFBA06',
                      border: '1px solid rgba(255,186,6,0.3)',
                    }}
                  >
                    <ChartLine className="w-4 h-4" />
                    View Impact Report
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Teacher Quotes - Voices from your school */}
            <TeacherQuotes quotes={teacherQuotes} />

            {/* TDI Suggestions */}
            <TDISuggestions suggestions={suggestions} isAdminView={false} />

              </div>
            )}
            {/* end Data & Impact collapsible */}

            {/* ─── COLLAPSIBLE: Action Items ─── */}
            <button
              onClick={() => toggleOverviewSection('actions')}
              className="w-full bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FEF3C7' }}>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1e2749]">Next Steps & Actions</p>
                  <p className="text-xs text-gray-500">{pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''} need attention</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${overviewSections['actions'] ? 'rotate-180' : ''}`} />
            </button>
            {overviewSections['actions'] && (
              <div className="-mt-4">

            {/* Action Items */}
            <div id="action-items" className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-bold text-gray-900">Next Steps Together</h2>
                <span className="text-xs md:text-sm text-gray-500">
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
                          const isFormExpanded = expandedActionFormId === item.id;
                          const renderInlineAction = () => {
                            const titleLower = item.title.toLowerCase();

                            // Item 1: Complete Hub Onboarding - instructional text
                            if (titleLower.includes('hub onboarding') || titleLower.includes('hub access')) {
                              return (
                                <div className="mt-3">
                                  <p style={{ color: '#6b7280' }} className="text-sm">
                                    Your TDI partner will send your staff a welcome email with Hub access instructions. If you need to resend, contact hello@teachersdeserveit.com
                                  </p>
                                  <p style={{ color: '#9ca3af' }} className="text-xs mt-1">
                                    {staffStats.hubLoggedIn}/{staffStats.total} logged in
                                  </p>
                                </div>
                              );
                            }

                            // Item 2: Schedule Virtual Session - always show (simple link)
                            if (titleLower.includes('virtual session')) {
                              return (
                                <div className="mt-3">
                                  <a
                                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
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

                            // Item 3: Suggest TDI Champion(s) - collapsible form
                            if (titleLower.includes('champion')) {
                              if (!isFormExpanded) {
                                return (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => setExpandedActionFormId(item.id)}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Champion
                                    </button>
                                  </div>
                                );
                              }
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
                                    <button
                                      onClick={() => setExpandedActionFormId(null)}
                                      className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            // Item 4: Add Hub Time to PLCs - confirmation button only (no Mark Complete needed)
                            if (titleLower.includes('hub time') || titleLower.includes('plc')) {
                              return (
                                <div className="mt-3">
                                  <button
                                    onClick={() => handleSaveActionData(item.id, 'confirmation', { confirmationMessage: 'Hub time added to PLCs!' })}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    We&apos;ve added Hub time to our PLC schedule
                                  </button>
                                </div>
                              );
                            }

                            // Item 5: Share Website - collapsible form
                            if (titleLower.includes('website')) {
                              if (!isFormExpanded) {
                                return (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => setExpandedActionFormId(item.id)}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                    >
                                      <Link2 className="w-4 h-4" />
                                      Add Website
                                    </button>
                                  </div>
                                );
                              }
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
                                  <button
                                    onClick={() => setExpandedActionFormId(null)}
                                    className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              );
                            }

                            // Item 6: Add Building Details (Districts only) - collapsible form
                            if (titleLower.includes('building') && partnership?.partnership_type === 'district') {
                              if (!isFormExpanded) {
                                return (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => setExpandedActionFormId(item.id)}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                    >
                                      <Building className="w-4 h-4" />
                                      Add Buildings
                                    </button>
                                  </div>
                                );
                              }
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
                                    <button
                                      onClick={() => setExpandedActionFormId(null)}
                                      className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            // Item 7: Baseline Survey - TDI sends this, no file upload needed
                            if (titleLower.includes('survey') && titleLower.includes('baseline')) {
                              return (
                                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <p className="text-sm text-gray-700 mb-3">
                                    TDI will send your team a brief wellness survey. We&apos;ll handle the setup and share results with you on this dashboard.
                                  </p>
                                  <a
                                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Schedule Survey Setup Call
                                    <ArrowRight className="w-3 h-3" />
                                  </a>
                                </div>
                              );
                            }

                            // Item 8: File uploads (SIP, PD Calendar) - collapsible
                            if (titleLower.includes('improvement plan') || titleLower.includes('sip') || titleLower.includes('pd calendar')) {
                              const folder = titleLower.includes('sip') || titleLower.includes('improvement') ? 'sip' : 'pd-calendar';
                              const buttonLabel = titleLower.includes('sip') || titleLower.includes('improvement') ? 'Upload Plan' : 'Upload Calendar';
                              if (!isFormExpanded) {
                                return (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => setExpandedActionFormId(item.id)}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                    >
                                      <Upload className="w-4 h-4" />
                                      {buttonLabel}
                                    </button>
                                  </div>
                                );
                              }
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
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                      Accepted: PDF, DOCX, XLSX, CSV
                                    </p>
                                    <button
                                      onClick={() => setExpandedActionFormId(null)}
                                      className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            // Item 9: Confirm Observation Day Dates - always show (simple links)
                            if (titleLower.includes('observation')) {
                              return (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <a
                                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-partnership-school-clone"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Schedule with TDI
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <a
                                    href="mailto:Rae@TeachersDeserveIt.com?subject=Observation Day Scheduling"
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                  >
                                    <Mail className="w-4 h-4" />
                                    Email TDI to Schedule
                                  </a>
                                </div>
                              );
                            }

                            // Item 10: Schedule Executive Impact Session - always show (simple link)
                            if (titleLower.includes('executive') || titleLower.includes('impact session')) {
                              return (
                                <div className="mt-3">
                                  <a
                                    href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
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

                            // Onboarding: Upload staff roster + assign access
                            if (titleLower.includes('staff roster') || titleLower.includes('upload roster') || titleLower.includes('team') || titleLower.includes('educator') || titleLower.includes('staff onboarding') || titleLower.includes('staff list')) {
                              if (!isFormExpanded) {
                                return (
                                  <div className="mt-3">
                                    <button
                                      onClick={() => setExpandedActionFormId(item.id)}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                    >
                                      <Upload className="w-4 h-4" />
                                      {staffStats.total > 0 ? 'Review & Update Team' : 'Upload Roster'}
                                    </button>
                                  </div>
                                );
                              }
                              return (
                                <div className="mt-3 space-y-3">
                                  <p className="text-xs text-gray-500">
                                    {staffStats.total > 0
                                      ? 'Add new staff or paste an updated CSV. Existing staff will not be duplicated.'
                                      : 'Paste CSV data (First Name, Last Name, Email, Role) or add staff one at a time.'}
                                  </p>
                                  <textarea
                                    placeholder={"First Name,Last Name,Email,Role\nJane,Smith,jane@school.edu,Teacher\nJohn,Doe,john@school.edu,Para"}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    id={`roster-csv-${item.id}`}
                                  />

                                  {/* Access type info */}
                                  <div className="bg-[#F8FAFC] rounded-lg p-3 text-xs text-gray-600 space-y-1">
                                    <p className="font-semibold text-gray-800">What your team gets:</p>
                                    <p><strong>Hub Membership</strong> -- Full access to courses, Quick Wins, PD hours, and certificates ({partnership.base_staff_enrolled || partnership.staff_enrolled || '?'} seats included in your contract)</p>
                                    <p><strong>Blog Access</strong> -- Complimentary paid blog subscription for your entire team (unlimited)</p>
                                    <p className="text-gray-400 mt-1">After uploading, you can manage access levels in the Team tab.</p>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={async () => {
                                        const textarea = document.getElementById(`roster-csv-${item.id}`) as HTMLTextAreaElement;
                                        if (!textarea?.value.trim()) return;
                                        setSavingItemId(item.id);
                                        try {
                                          const res = await fetch('/api/partners/roster', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ partnershipId: partnership?.id, csv: textarea.value }),
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            setToastMessage(data.message + ' Manage access levels in the Team tab.');
                                            if (data.added > 0) {
                                              setActionItems(prev => prev.map(ai => ai.id === item.id ? { ...ai, status: 'completed', completed_at: new Date().toISOString() } : ai));
                                            }
                                            setExpandedActionFormId(null);
                                          } else {
                                            setToastMessage(data.error || 'Upload failed');
                                          }
                                        } catch { setToastMessage('Upload failed'); }
                                        finally { setSavingItemId(null); }
                                      }}
                                      disabled={isSaving}
                                      className="px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                      Upload CSV
                                    </button>
                                    <button onClick={() => setExpandedActionFormId(null)} className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
                                  </div>
                                </div>
                              );
                            }

                            // Onboarding: Schedule kickoff walkthrough
                            if (titleLower.includes('kickoff') || titleLower.includes('walkthrough')) {
                              return (
                                <div className="mt-3">
                                  <a
                                    href={item.cta_url || 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    {item.cta_label || 'Schedule Walkthrough'}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              );
                            }

                            // Onboarding: Distribute Hub access
                            if (titleLower.includes('distribute') && titleLower.includes('hub')) {
                              return (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-3">
                                    Share this link with your staff: <strong>teachersdeserveit.com/hub</strong>. Every team member has an account ready. They log in with their school email.
                                  </p>
                                  <button
                                    onClick={() => handleSaveActionData(item.id, 'confirmation', { confirmationMessage: 'Hub access distributed to staff' })}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    I&apos;ve shared Hub access with my team
                                  </button>
                                </div>
                              );
                            }

                            // Onboarding: Upload roster photos
                            if (titleLower.includes('roster photo') || titleLower.includes('upload photo')) {
                              return (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-3">
                                    Share staff headshots with TDI so we can personalize Hub profiles. If photos are not available, teachers can upload their own after logging in.
                                  </p>
                                  <button
                                    onClick={() => handleSaveActionData(item.id, 'confirmation', { confirmationMessage: 'Photos shared or skipped' })}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Done (or skip for now)
                                  </button>
                                </div>
                              );
                            }

                            // Default: no specific action
                            return null;
                          };

                          // Check if this is the Hub Time/PLC item (no separate Mark Complete needed)
                          const isPLCItem = item.title.toLowerCase().includes('hub time') || item.title.toLowerCase().includes('plc');

                          return (
                            <div
                              key={item.id}
                              id={`action-item-${item.id}`}
                              className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100/50 transition-all duration-300 ${
                                highlightedActionId === item.id
                                  ? 'ring-2 ring-[#FFBA06] ring-offset-2 bg-yellow-50'
                                  : ''
                              }`}
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
                                    {recentlyResurfacedIds.includes(item.id) && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#4ecdc4]/20 text-[#4ecdc4] font-medium animate-pulse">
                                        ↩ Back on your list
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>

                                  {/* Inline Action */}
                                  {renderInlineAction()}

                                  {/* Secondary Buttons - hide Mark Complete for PLC item since confirmation button serves same purpose */}
                                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-200 flex-wrap">
                                    {snoozePickerItemId === item.id ? (
                                      <>
                                        <span className="text-sm text-gray-500">Bring this back in:</span>
                                        {([1, 2, 4] as const).map((weeks) => (
                                          <button
                                            key={weeks}
                                            onClick={() => handlePauseItem(item.id, weeks)}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-[#4ecdc4] hover:text-white transition-colors"
                                          >
                                            {weeks} week{weeks > 1 ? 's' : ''}
                                          </button>
                                        ))}
                                        <button
                                          onClick={() => setSnoozePickerItemId(null)}
                                          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        {!isPLCItem && (
                                          <button
                                            onClick={() => handleCompleteItem(item.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                                          >
                                            <Check className="w-4 h-4" />
                                            Mark Complete
                                          </button>
                                        )}
                                        <button
                                          onClick={() => setSnoozePickerItemId(item.id)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                          <Clock className="w-4 h-4" />
                                          Not Right Now
                                        </button>
                                      </>
                                    )}
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
                          const resurfaceDate = item.resurface_at ? formatDateWithOrdinal(item.resurface_at) : null;

                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg"
                            >
                              <Icon className="w-4 h-4 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-600 block">{item.title}</span>
                                {resurfaceDate && (
                                  <span className="text-xs text-[#4ecdc4]">Coming back {resurfaceDate}</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleResumeItem(item.id)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
                              >
                                <Play className="w-3 h-3" />
                                Resume Now
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
              </div>
            )}
            {/* end Action Items collapsible */}

            {/* Overview Footer - Dark Navy */}
            <div
              className="rounded-2xl p-6 md:p-8 mt-4"
              style={{
                background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 100%)',
                boxShadow: '0 4px 24px rgba(27,42,74,0.15)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                    <Image
                      src="/images/logo.webp"
                      alt="Teachers Deserve It"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Teachers Deserve It</p>
                    <p className="text-white/50 text-sm">We&apos;re here for you every step of the way</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="mailto:rae@teachersdeserveit.com"
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    Email Us
                  </a>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
                    style={{
                      background: '#FFBA06',
                      color: '#1B2A4A',
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule a Call
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <a
                    href="https://www.teachersdeserveit.com/hub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Learning Hub
                  </a>
                  <span className="text-white/20">•</span>
                  <button
                    onClick={() => navigateToTab('blueprint', 'contract-deliverables')}
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Your Blueprint
                  </button>
                  <span className="text-white/20">•</span>
                  <button
                    onClick={() => navigateToTab('team')}
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Your Team
                  </button>
                  <span className="text-white/20">•</span>
                  <a
                    href="https://www.teachersdeserveit.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    TDI Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div
            role="tabpanel"
            id="panel-team"
            aria-labelledby="tab-team"
            className="py-6 space-y-4"
          >
            {/* Rae contact card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Your TDI Team</h2>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  <img
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Rae Hughart</p>
                  <p className="text-sm text-gray-500 mb-3">Co-Founder, Teachers Deserve It</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href="mailto:rae@teachersdeserveit.com"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
                      style={{ background: '#1B2A4A', color: '#FFFFFF' }}>
                      Email Us
                    </a>
                    <a href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700">
                      Schedule a Call
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Invite leaders to dashboard */}
            {partnership?.id && <InviteLeader partnershipId={partnership.id} />}

            {/* Roster access management: Hub membership + blog access checkboxes */}
            {partnership?.id && (
              <RosterAccessManager
                partnershipId={partnership.id}
                baseStaffEnrolled={partnership.base_staff_enrolled || partnership.staff_enrolled || null}
              />
            )}

            {/* School info card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Your School</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'School', value: organization?.name || partnership?.org_name },
                  { label: 'Primary Contact', value: partnership?.contact_name },
                  { label: 'Email', value: partnership?.contact_email },
                  { label: 'Phone', value: partnership?.phone },
                  {
                    label: 'Address',
                    value: [organization?.address, organization?.address_city, organization?.address_state, organization?.address_zip]
                      .filter(Boolean).join(', ') || null
                  },
                  { label: 'Current Phase', value: partnership?.contract_phase },
                  {
                    label: 'Contract Period',
                    value: partnership?.contract_start && partnership?.contract_end
                      ? `${new Date(partnership.contract_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - ${new Date(partnership.contract_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                      : null
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Roster with Photos */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Your Educators</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{staffStats.hubLoggedIn}/{staffStats.total} on Hub</span>
                </div>
              </div>

              {staffStats.total === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600 mb-1">No staff uploaded yet</p>
                  <p className="text-xs text-gray-400 mb-4">Upload your roster to give your team Hub access.</p>
                  <label className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2a3459] transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload CSV
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !partnership) return;
                        const text = await file.text();
                        const lines = text.split('\n').filter(l => l.trim());
                        const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/[^a-z0-9\s]/g, ''));
                        const fnIdx = headers.findIndex(h => (h.includes('first') && h.includes('name')) || h === 'firstname' || h === 'first');
                        const lnIdx = headers.findIndex(h => (h.includes('last') && h.includes('name')) || h === 'lastname' || h === 'last');
                        const emIdx = headers.findIndex(h => h.includes('email'));
                        const rlIdx = headers.findIndex(h => h.includes('role') || h.includes('title') || h.includes('position'));

                        const staff = [];
                        for (let i = 1; i < lines.length; i++) {
                          const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                          if (vals.length < 2) continue;
                          const fn = fnIdx >= 0 ? vals[fnIdx] : vals[0] || '';
                          const ln = lnIdx >= 0 ? vals[lnIdx] : vals[1] || '';
                          const em = emIdx >= 0 ? vals[emIdx] : vals[2] || '';
                          if (!fn && !ln && !em) continue;
                          staff.push({ first_name: fn, last_name: ln, email: em, role_title: rlIdx >= 0 ? vals[rlIdx] : '' });
                        }
                        if (staff.length > 0) {
                          await fetch('/api/partners/roster', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ partnershipId: partnership.id, staff }),
                          });
                          window.location.reload();
                        }
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Photo upload -- only show if contract includes observations */}
                  {(partnership.observation_days_total || 0) > 0 && (
                    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-white border border-amber-100 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Eye className="w-4 h-4 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 mb-1">Help us know your team</p>
                          <p className="text-xs text-amber-700 leading-relaxed mb-3">
                            When our team visits for observations, knowing faces makes the experience more personal. Even a few photos is a great start -- you can always add more later as new staff join.
                          </p>
                          <p className="text-[10px] text-amber-600 mb-3">
                            Send whatever you have: a staff directory PDF, individual headshots, a ZIP file, or a spreadsheet with photo links. We&apos;ll sort it out.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <label className="text-xs font-semibold px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer inline-flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              Upload Photos
                              <input
                                type="file"
                                accept=".zip,.pdf,.jpg,.jpeg,.png,.webp"
                                multiple
                                className="hidden"
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (!files || !partnership) return;

                                  // If it's a ZIP, use bulk upload
                                  if (files[0]?.name.endsWith('.zip')) {
                                    const formData = new FormData();
                                    formData.append('file', files[0]);
                                    formData.append('consentChecked', 'true');
                                    const resp = await fetch(`/api/tdi-admin/leadership/${partnership.id}/staff-photos/bulk`, {
                                      method: 'POST',
                                      headers: { 'x-user-email': partnership.contact_email || '' },
                                      body: formData,
                                    });
                                    const result = await resp.json();
                                    setToastMessage(result.uploaded > 0 ? `${result.uploaded} photos matched and uploaded` : 'Photos received -- we\'ll match them to your roster');
                                  } else {
                                    // For individual files or PDFs, upload as evidence
                                    for (const file of Array.from(files)) {
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      formData.append('partnershipId', partnership.id);
                                      formData.append('itemId', 'staff-photos');
                                      formData.append('userId', userId || '');
                                      await fetch('/api/partners/upload-evidence', { method: 'POST', body: formData });
                                    }
                                    setToastMessage(`${files.length} file${files.length > 1 ? 's' : ''} uploaded -- we'll match photos to your roster`);
                                  }
                                  setTimeout(() => setToastMessage(''), 4000);
                                }}
                              />
                            </label>
                            <a
                              href={`mailto:rae@teachersdeserveit.com?subject=Staff%20Photos%20for%20${encodeURIComponent(partnership.org_name || partnership.contact_name || 'Partnership')}`}
                              className="text-xs font-medium px-3 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email them instead
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-[#1e2749]">{staffStats.total}</p>
                      <p className="text-[10px] text-gray-500">Total Staff</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-green-600">{staffStats.hubLoggedIn}</p>
                      <p className="text-[10px] text-gray-500">Hub Active</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-amber-600">{staffStats.total - staffStats.hubLoggedIn}</p>
                      <p className="text-[10px] text-gray-500">Not Yet Active</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Add Team Access */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Dashboard Access</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Want your assistant principal, coach, or admin team to see this dashboard too? Add their details and we will set up access within 24 hours.</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    id="access-name"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    id="access-email"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g., AP, Coach)"
                    id="access-role"
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/50"
                  />
                </div>
                <button
                  onClick={async () => {
                    const nameEl = document.getElementById('access-name') as HTMLInputElement;
                    const emailEl = document.getElementById('access-email') as HTMLInputElement;
                    const roleEl = document.getElementById('access-role') as HTMLInputElement;
                    if (!emailEl?.value) {
                      setToastMessage('Please enter an email address');
                      setTimeout(() => setToastMessage(''), 2000);
                      return;
                    }
                    const resp = await fetch('/api/partners/request-access', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        partnershipId: partnership?.id,
                        requesterName: partnership?.contact_name,
                        requesterEmail: partnership?.contact_email,
                        newMembers: [{ name: nameEl?.value || '', email: emailEl.value, role: roleEl?.value || '' }],
                      }),
                    });
                    const data = await resp.json();
                    if (data.success) {
                      setToastMessage('Request submitted. Access will be set up within 24 hours.');
                      if (nameEl) nameEl.value = '';
                      if (emailEl) emailEl.value = '';
                      if (roleEl) roleEl.value = '';
                    } else {
                      setToastMessage('Something went wrong. Please try again.');
                    }
                    setTimeout(() => setToastMessage(''), 4000);
                  }}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Request Access
                </button>
              </div>
            </div>

            {/* Partnership Includes card -- two-tier when grant-supported */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-4">Your Partnership Includes</h2>

              {/* Show base contract when grant-supported, otherwise show full contract */}
              {(() => {
                const isGrantSupported = partnership?.has_grant_support;
                const showBase = isGrantSupported && partnership?.base_observation_days != null;

                // Base contract numbers (guaranteed)
                const obsDays = showBase ? partnership.base_observation_days! : (partnership?.observation_days_total ?? 0);
                const virtSessions = showBase ? (partnership.base_virtual_sessions ?? partnership?.virtual_sessions_total ?? 0) : (partnership?.virtual_sessions_total ?? 0);
                const execSessions = showBase ? (partnership.base_executive_sessions ?? partnership?.executive_sessions_total ?? 0) : (partnership?.executive_sessions_total ?? 0);
                const staffCount = showBase ? (partnership.base_staff_enrolled ?? partnership?.staff_enrolled ?? 0) : (partnership?.staff_enrolled ?? 0);

                return (
                  <>
                    <div className="divide-y divide-gray-50">
                      {obsDays > 0 && (
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-sm text-gray-600">Observation Days</span>
                          <span className="text-sm font-semibold text-gray-900">{obsDays}</span>
                        </div>
                      )}
                      {virtSessions > 0 && (
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-sm text-gray-600">Virtual Sessions</span>
                          <span className="text-sm font-semibold text-gray-900">{virtSessions}</span>
                        </div>
                      )}
                      {execSessions > 0 && (
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-sm text-gray-600">Executive Sessions</span>
                          <span className="text-sm font-semibold text-gray-900">{execSessions}</span>
                        </div>
                      )}
                      {staffCount > 0 && (
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-sm text-gray-600">Hub Memberships</span>
                          <span className="text-sm font-semibold text-gray-900">{staffCount}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-gray-600">The TDI Book</span>
                        <span className="text-sm font-semibold text-gray-900">1 per educator</span>
                      </div>
                    </div>

                    {/* Grant expansion note */}
                    {isGrantSupported && (
                      <div className="mt-4 p-4 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#7C3AED' }}>Funding in progress</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          TDI is actively pursuing additional funding to expand your partnership.
                          {showBase && (partnership?.observation_days_total ?? 0) > obsDays && (
                            <> If awarded, your plan grows to include {partnership.observation_days_total} observation days, {partnership.virtual_sessions_total} virtual sessions, and {partnership.staff_enrolled} Hub memberships.</>
                          )}
                          {!showBase && (
                            <> Our team handles the research, writing, and tracking. You will be updated as funding decisions are made.</>
                          )}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Data privacy note */}
            <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
              Data Privacy: In your partnership dashboard, access is role-based.
              All data handling follows FERPA guidelines.
            </p>
          </div>
        )}

        {/* REPORTING TAB */}
        {activeTab === 'reporting' && partnership && (
          <div className="py-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#38618C] rounded-2xl p-6 md:p-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#E8B84B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Partnership Reports</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>AI-generated reports ready to share with your board, staff, or community.</p>
                </div>
              </div>
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Board Report */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-50">
                    <GraduationCap className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Board Presentation</h3>
                    <p className="text-xs text-gray-500">For superintendents, board members, and district leadership</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">Executive summary with key metrics, ROI analysis, educator testimonials, and renewal recommendations. Formatted for board meeting presentations.</p>
                <button
                  onClick={() => generateAIReport('board')}
                  disabled={reportGenerating !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportGenerating === 'board' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Report</>}
                </button>
              </div>

              {/* Staff Engagement */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50">
                    <Users className="w-4.5 h-4.5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Staff Engagement</h3>
                    <p className="text-xs text-gray-500">For principals, coaches, and team leads</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">Hub adoption rates, most-used tools, engagement trends, and actionable recommendations to share at your next PLC or staff meeting.</p>
                <button
                  onClick={() => generateAIReport('engagement')}
                  disabled={reportGenerating !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportGenerating === 'engagement' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Report</>}
                </button>
              </div>

              {/* Impact & ROI */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50">
                    <TrendingUp className="w-4.5 h-4.5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Impact & ROI</h3>
                    <p className="text-xs text-gray-500">For budget justification and grant reporting</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">Investment analysis, measurable outcomes, wellness improvements, PD hours earned, and projected outcomes. Perfect for budget season and grant applications.</p>
                <button
                  onClick={() => generateAIReport('impact')}
                  disabled={reportGenerating !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportGenerating === 'impact' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Report</>}
                </button>
              </div>

              {/* Quarterly Progress */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
                    <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Quarterly Progress</h3>
                    <p className="text-xs text-gray-500">For check-ins and progress tracking</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">This quarter&apos;s highlights, metrics vs targets, milestones reached, challenges addressed, and what&apos;s ahead. Share with leadership or use for your own planning.</p>
                <button
                  onClick={() => generateAIReport('quarterly')}
                  disabled={reportGenerating !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportGenerating === 'quarterly' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Report</>}
                </button>
              </div>

              {/* Teacher Highlights */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50">
                    <Heart className="w-4.5 h-4.5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Teacher Highlights</h3>
                    <p className="text-xs text-gray-500">For staff newsletters, emails, and PLC agendas</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">Popular tools your team loves, educator quotes, completion milestones, and celebration-worthy moments. Great for staff newsletters or morning announcements.</p>
                <button
                  onClick={() => generateAIReport('teacher')}
                  disabled={reportGenerating !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportGenerating === 'teacher' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Report</>}
                </button>
              </div>

              {/* Community / Parent Report */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-50">
                    <MessageCircle className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Community Update</h3>
                    <p className="text-xs text-gray-500">For parent newsletters, school websites, and social media</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">A parent-friendly summary of your school&apos;s PD investment: what teachers are learning, how it helps students, and why it matters. Ready for newsletters or your school website.</p>
                <button
                  onClick={() => generateAIReport('community')}
                  disabled={reportGenerating !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportGenerating === 'community' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Report</>}
                </button>
              </div>
            </div>

            {/* Newsletter & Certificates Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Newsletter Ready */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-50">
                    <Pencil className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Newsletter Ready</h3>
                    <p className="text-xs text-gray-500">4 weeks of copy-paste content for staff emails</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">TDI tips, strategy spotlights, and Hub tool recommendations formatted for your weekly or monthly staff newsletter. Copy, paste, send.</p>
                <button
                  onClick={() => generateAIReport('newsletter')}
                  disabled={reportGenerating !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportGenerating === 'newsletter' ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Content</>}
                </button>
              </div>

              {/* Fun Staff Certificates */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-yellow-50">
                    <Award className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e2749]">Staff Celebrations</h3>
                    <p className="text-xs text-gray-500">Printable certificates and fun awards</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">Make your staff feel great. Auto-generated printable certificates for fun awards, milestones, and shout-outs. Drop one in a mailbox and watch what happens.</p>
                <button
                  onClick={() => {
                    const allAwards = [
                      // Growth & Learning
                      { award: 'Hub Explorer', tagline: 'For diving into the Learning Hub and discovering tools that make a real difference.' },
                      { award: 'Strategy Champion', tagline: 'For trying a new strategy this week and actually using it in the classroom.' },
                      { award: 'Growth Mindset', tagline: 'For saying "I have not figured it out yet" instead of "I can not."' },
                      { award: 'New Idea Generator', tagline: 'For starting sentences with "What if we tried..." and meaning it.' },
                      { award: 'Lifelong Learner', tagline: 'For never being too experienced to try something new.' },
                      { award: 'PD Trailblazer', tagline: 'For being the first to try a new tool and then showing everyone else how.' },
                      { award: 'Curiosity Award', tagline: 'For asking the questions nobody else thinks to ask.' },
                      { award: 'Risk Taker', tagline: 'For trying something that might not work and learning from it either way.' },
                      { award: 'Reflective Practitioner', tagline: 'For always asking "how can I do this better?" and meaning it.' },
                      { award: 'Most Improved', tagline: 'For the growth that is obvious to everyone who works with you.' },
                      // Classroom Excellence
                      { award: 'Classroom Magician', tagline: 'For making 45 minutes feel like 10 and a small room feel like the world.' },
                      { award: 'Most Creative Lesson', tagline: 'For the lesson that made students forget they were learning.' },
                      { award: 'Student Whisperer', tagline: 'For reaching the kid everyone else had given up on.' },
                      { award: 'Differentiation Pro', tagline: 'For making one lesson work for 25 different learners.' },
                      { award: 'Engagement Expert', tagline: 'For the lesson where every hand went up and nobody checked the clock.' },
                      { award: 'Transition Master', tagline: 'For getting 30 kids from one activity to the next without losing a single second.' },
                      { award: 'Assessment Innovator', tagline: 'For finding ways to check understanding that do not involve a worksheet.' },
                      { award: 'The Warm Demander', tagline: 'For holding high expectations and giving the support to reach them.' },
                      { award: 'Flexible Planner', tagline: 'For throwing out the lesson plan when students needed something different and nailing it anyway.' },
                      // Teamwork & Collaboration
                      { award: 'Team Heartbeat', tagline: 'For being the person everyone goes to when they need a lift.' },
                      { award: 'PLC MVP', tagline: 'For bringing the best ideas to the table and making everyone better.' },
                      { award: 'Collaboration King/Queen', tagline: 'For making co-planning actually enjoyable.' },
                      { award: 'Unsung Hero', tagline: 'For the hundred small things you do that nobody notices but everyone benefits from.' },
                      { award: 'Mentor of the Year', tagline: 'For making a new teacher feel like they belong here.' },
                      { award: 'Bridge Builder', tagline: 'For connecting people and ideas across grade levels and departments.' },
                      { award: 'The Includer', tagline: 'For making sure nobody sits alone at the table, literally or figuratively.' },
                      { award: 'Feedback Champion', tagline: 'For giving honest feedback that actually helps people grow.' },
                      { award: 'The Glue', tagline: 'For holding the team together during the tough stretches.' },
                      // Wellness & Self-Care
                      { award: 'Wellness Warrior', tagline: 'For taking care of yourself so you can take care of your students.' },
                      { award: 'Calm in the Storm', tagline: 'For keeping it together when the day goes sideways.' },
                      { award: 'Boundary Setter', tagline: 'For leaving work at work and being fully present at home.' },
                      { award: 'Joy Finder', tagline: 'For finding something to laugh about on the hardest days.' },
                      { award: 'Self-Care Role Model', tagline: 'For showing everyone that taking a break is not weakness, it is strategy.' },
                      { award: 'The Recharger', tagline: 'For knowing when to pause, reset, and come back stronger.' },
                      // Communication & Relationships
                      { award: 'Parent Communicator', tagline: 'For turning tough conversations into partnerships.' },
                      { award: 'Hallway High-Fiver', tagline: 'For making every kid feel seen between classes.' },
                      { award: 'Positive Energy', tagline: 'For walking into the building and making it better just by being there.' },
                      { award: 'Most Likely to Brighten Your Day', tagline: 'For the smile, the joke, or the perfectly timed meme.' },
                      { award: 'The Listener', tagline: 'For hearing what people mean, not just what they say.' },
                      { award: 'Conflict Resolver', tagline: 'For turning "us vs them" into "how do we fix this together?"' },
                      { award: 'Community Connector', tagline: 'For bringing families into the school in ways that actually matter.' },
                      { award: 'The Encourager', tagline: 'For the note, the text, or the word that came at exactly the right time.' },
                      // Dedication & Hustle
                      { award: 'First One In', tagline: 'For showing up early, staying late, and never complaining about it.' },
                      { award: 'Above and Beyond', tagline: 'For the thing you did this week that was not in your job description.' },
                      { award: 'Data Detective', tagline: 'For finding the story inside the numbers and using it to help kids.' },
                      { award: 'Tech Whisperer', tagline: 'For fixing the printer, resetting passwords, and saving the day.' },
                      { award: 'The Organizer', tagline: 'For the spreadsheet, the system, or the label maker that saved the day.' },
                      { award: 'Resource Finder', tagline: 'For always knowing where to find what the team needs, even with no budget.' },
                      { award: 'The Multitasker', tagline: 'For grading, emailing, supervising, and somehow still smiling.' },
                      { award: 'Problem Solver', tagline: 'For fixing things before anyone else even knew they were broken.' },
                      // Fun & Culture
                      { award: 'Snack Hero', tagline: 'For keeping the lounge stocked and morale high. The real MVP.' },
                      { award: 'Coffee Champion', tagline: 'For running on caffeine and compassion in equal measure.' },
                      { award: 'Friday Survivor', tagline: 'For making it through the week with grace, humor, and only minimal caffeine.' },
                      { award: 'Best Playlist', tagline: 'For the music that makes the classroom (or the workroom) a better place.' },
                      { award: 'Best Desk Snacks', tagline: 'For the drawer that everyone knows about but nobody admits to raiding.' },
                      { award: 'Spirit Week MVP', tagline: 'For going all in when the theme was announced. Every. Single. Time.' },
                      { award: 'Best Email Sign-Off', tagline: 'For the signature that makes people actually smile when they see your name in the inbox.' },
                      { award: 'Meeting Energizer', tagline: 'For the comment, the joke, or the snack run that made the staff meeting survivable.' },
                      { award: 'Most Likely to Go Viral', tagline: 'For the classroom moment that deserved a million views.' },
                      { award: 'Dress Code MVP', tagline: 'For showing up looking like a professional even on the days it took everything you had.' },
                      { award: 'The Decorator', tagline: 'For the classroom, the bulletin board, or the door that makes people stop and look.' },
                      { award: 'Meme Lord', tagline: 'For the group chat contributions that got everyone through the week.' },
                      // Leadership
                      { award: 'Quiet Leader', tagline: 'For leading by example without ever needing the title.' },
                      { award: 'Culture Keeper', tagline: 'For protecting what makes this school special.' },
                      { award: 'The Advocate', tagline: 'For speaking up when it mattered, even when it was uncomfortable.' },
                      { award: 'Innovation Award', tagline: 'For the idea that changed how we do things around here.' },
                      { award: 'Legacy Builder', tagline: 'For the impact that will last long after the school year ends.' },
                    ];
                    setCertAwards(allAwards.map(a => ({ ...a, recipient: '' })));
                    setShowCertificates(true);
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#1e2749] text-white hover:bg-[#2a3459] transition-colors flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" /> Create Certificates
                </button>
              </div>
            </div>

            {/* Quick Data Export */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-[#1e2749] mb-4">Quick Data Export</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Engagement Summary', icon: Users, action: () => {
                    const csv = `Metric,Value\nTotal Staff,${staffStats.total}\nHub Active,${staffStats.hubLoggedIn}\nHub Login %,${staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : 0}%\nTools Explored,${hubStats?.quick_wins_completed ?? 0}\nCourse Completions,${hubStats?.course_completions ?? 0}\nWellness Score,${hubStats?.mood_avg_7d ?? 'N/A'}`;
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
                    link.download = `engagement-summary-${new Date().toISOString().slice(0,10)}.csv`; link.click();
                  }},
                  { label: 'KPI Summary', icon: Target, action: () => {
                    const csv = 'KPI,Current,Target,Unit\n' + partnershipKpis.map(k => `${k.kpi_label},${k.current_value},${k.target_value},${k.target_unit}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
                    link.download = `kpi-summary-${new Date().toISOString().slice(0,10)}.csv`; link.click();
                  }},
                  { label: 'Action Items', icon: CheckCircle, action: () => {
                    const csv = 'Title,Status,Priority,Category\n' + actionItems.map(i => `"${i.title}",${i.status},${i.priority},${i.category}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
                    link.download = `action-items-${new Date().toISOString().slice(0,10)}.csv`; link.click();
                  }},
                  { label: 'Educator Quotes', icon: Quote, action: () => {
                    const csv = 'Quote,Role,Date\n' + teacherQuotes.map(q => `"${q.quote_text}","${q.teacher_role}","${q.created_at}"`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
                    link.download = `educator-quotes-${new Date().toISOString().slice(0,10)}.csv`; link.click();
                  }},
                ].map((exp, i) => {
                  const Icon = exp.icon;
                  return (
                    <button
                      key={i}
                      onClick={exp.action}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all text-center"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-[11px] font-medium text-gray-600">{exp.label}</span>
                      <span className="text-[9px] text-gray-400">CSV</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="py-6 space-y-4">

            {/* Header card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Billing and Invoices</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                For questions about your contract, invoices, or payment - reach the TDI billing team directly.
                A real person responds within one business day.
              </p>
            </div>

            {/* Contact billing CTA */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="#6B7280" strokeWidth="1.5"/>
                  <path d="M2 9h20" stroke="#6B7280" strokeWidth="1.5"/>
                  <path d="M6 14h4M6 17h2" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-base mb-2">Questions about your invoice?</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto leading-relaxed">
                Our billing team handles all contract, invoice, and payment questions.
                They&apos;ll get back to you within one business day.
              </p>
              <a
                href="mailto:Billing@Teachersdeserveit.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: '#1B2A4A', color: '#FFFFFF' }}>
                Contact Billing Team
              </a>
              <p className="text-xs text-gray-400 mt-3">Billing@Teachersdeserveit.com</p>
            </div>

            {/* Payment policy */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                {[
                  {
                    label: 'Payment methods',
                    value: 'Check, ACH transfer, or credit card. Details provided on your invoice.'
                  },
                  {
                    label: 'Invoice timing',
                    value: 'Invoices are sent at the start of each service period or as outlined in your contract.'
                  },
                  {
                    label: 'Net terms',
                    value: 'Payment is due within 30 days of invoice unless otherwise agreed in your contract.'
                  },
                  {
                    label: 'Questions or disputes',
                    value: 'Contact Billing@Teachersdeserveit.com. We respond within one business day.'
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract access */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Contract</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Your signed partnership agreement is on file with TDI.
                Need a copy? Contact the billing team and we&apos;ll send it over.
              </p>
              <a
                href="mailto:Billing@Teachersdeserveit.com?subject=Contract Copy Request"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                Request Contract Copy
              </a>
            </div>

          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div
            role="tabpanel"
            id="panel-blueprint"
            aria-labelledby="tab-blueprint"
          >
            {/* Blueprint Tabs - matches How We Partner page layout */}
            {(() => {
              const blueprintTabs = [
                { id: 'approach', name: 'Our Approach', icon: <Target className="w-5 h-5" /> },
                { id: 'in-person', name: 'In-Person Support', icon: <Users className="w-5 h-5" /> },
                { id: 'learning-hub', name: 'Learning Hub', icon: <BookOpen className="w-5 h-5" /> },
                { id: 'dashboard', name: 'Leadership Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
                { id: 'book', name: 'The Book', icon: <FileText className="w-5 h-5" /> },
                { id: 'results', name: 'Proven Results', icon: <TrendingUp className="w-5 h-5" /> },
                { id: 'contract', name: 'Your Contract', icon: <Award className="w-5 h-5" /> },
                { id: 'tools', name: 'Leadership Tools', icon: <Hammer className="w-5 h-5" /> },
                { id: 'community', name: 'Community & FAQ', icon: <MessageCircle className="w-5 h-5" /> },
              ] as const;

              const renderBlueprintPanel = () => {
                switch (blueprintSubTab) {
                  case 'approach':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">
                            A Phased Journey,<br />Not a One-Time Event
                          </h2>
                          <p className="text-lg text-[#1e2749]/80">
                            Real change takes time. Our three-phase model meets your school where you are and grows with you.
                          </p>
                        </div>

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
                                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md ${isPast ? 'bg-[#4ecdc4] text-white' : ''}`}
                                      style={!isPast ? { backgroundColor: '#ffba06', color: '#1e2749' } : undefined}
                                    >
                                      {isPast ? <Check className="w-6 h-6" /> : '1'}
                                    </div>
                                    <div className="w-1 flex-1 mt-2" style={{ backgroundColor: isPast ? '#4ecdc4' : '#ffba06' }} />
                                  </div>
                                  <div className="flex-1 pb-8">
                                    <div
                                      className={`bg-white rounded-xl p-5 md:p-6 shadow-md ${isActive ? 'ring-2 ring-[#4ecdc4]' : ''}`}
                                      style={{ border: `2px solid ${isActive ? '#4ecdc4' : '#ffba06'}` }}
                                    >
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                                          Start Here
                                        </span>
                                        <h3 className="text-base font-bold text-[#1e2749]">IGNITE</h3>
                                        {isActive && <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4] text-white text-xs font-bold rounded">YOU ARE HERE</span>}
                                        {isPast && <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4]/20 text-[#4ecdc4] text-xs font-bold rounded flex items-center gap-1"><Check className="w-3 h-3" /> Complete</span>}
                                      </div>
                                      <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Leadership + Pilot Group</p>
                                      <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
                                        <span className="text-xs font-medium text-[#1e2749]">Awareness</span>
                                        <ArrowRight className="w-4 h-4" style={{ color: '#ffba06' }} />
                                        <span className="text-xs font-bold" style={{ color: '#ffba06' }}>Buy-in</span>
                                      </div>
                                      <p className="text-sm mb-3 text-[#1e2749]/70">
                                        Build buy-in with your leadership team and a pilot group of 10-25 educators. See early wins. Lay the foundation for school-wide change.
                                      </p>
                                      <div className="mb-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs font-bold mb-2 text-[#1e2749]">What&apos;s Included:</p>
                                        <ul className="space-y-1">
                                          {['2 On-Campus Observation Days', '4 Virtual Strategy Sessions', '2 Executive Impact Sessions', 'Learning Hub access for pilot group', 'Leadership Dashboard'].map((item) => (
                                            <li key={item} className="flex items-center gap-1.5 text-xs text-[#1e2749]/70">
                                              <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#ffba06' }} />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <p className="text-xs text-[#1e2749]/50">Typical timeline: One semester to one year</p>
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
                                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md ${isPast ? 'bg-[#4ecdc4] text-white' : isFuture ? 'bg-gray-200 text-gray-500' : ''}`}
                                      style={!isPast && !isFuture ? { backgroundColor: '#80a4ed', color: '#ffffff' } : undefined}
                                    >
                                      {isPast ? <Check className="w-6 h-6" /> : '2'}
                                    </div>
                                    <div className="w-1 flex-1 mt-2" style={{ backgroundColor: isPast ? '#4ecdc4' : isFuture ? '#e5e7eb' : '#80a4ed' }} />
                                  </div>
                                  <div className="flex-1 pb-8">
                                    <div
                                      className={`bg-white rounded-xl p-5 md:p-6 shadow-md ${isActive ? 'ring-2 ring-[#4ecdc4]' : ''} ${isFuture ? 'opacity-75' : ''}`}
                                      style={{ border: `2px solid ${isFuture ? '#e5e7eb' : '#80a4ed'}` }}
                                    >
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: isFuture ? '#e5e7eb' : '#80a4ed', color: isFuture ? '#6b7280' : '#ffffff' }}>
                                          Scale
                                        </span>
                                        <h3 className="text-base font-bold text-[#1e2749]">ACCELERATE</h3>
                                        {isActive && <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4] text-white text-xs font-bold rounded">YOU ARE HERE</span>}
                                        {isPast && <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4]/20 text-[#4ecdc4] text-xs font-bold rounded flex items-center gap-1"><Check className="w-3 h-3" /> Complete</span>}
                                      </div>
                                      <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Full Staff</p>
                                      <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#f0f9ff' }}>
                                        <span className="text-xs font-medium text-[#1e2749]">Buy-in</span>
                                        <ArrowRight className="w-4 h-4" style={{ color: '#80a4ed' }} />
                                        <span className="text-xs font-bold" style={{ color: '#80a4ed' }}>Action</span>
                                      </div>
                                      <p className="text-sm mb-3 text-[#1e2749]/70">
                                        Expand support to your full staff. Every teacher, para, and coach gets access. Strategies get implemented school-wide, not just talked about.
                                      </p>
                                      <div className="mb-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs font-bold mb-2 text-[#1e2749]">What&apos;s Included:</p>
                                        <p className="text-xs italic mb-1.5" style={{ color: '#80a4ed' }}>Everything in IGNITE, plus:</p>
                                        <ul className="space-y-1">
                                          {['Learning Hub access for ALL staff', '4 Executive Impact Sessions', 'Teachers Deserve It book for every educator', 'Retention tracking tools'].map((item) => (
                                            <li key={item} className="flex items-center gap-1.5 text-xs text-[#1e2749]/70">
                                              <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#80a4ed' }} />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <p className="text-xs text-[#1e2749]/50">Typical timeline: 1-3 years (many schools stay here)</p>
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
                                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md ${isFuture ? 'bg-gray-200 text-gray-500' : ''}`}
                                      style={!isFuture ? { backgroundColor: '#abc4ab', color: '#1e2749' } : undefined}
                                    >
                                      3
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div
                                      className={`bg-white rounded-xl p-5 md:p-6 shadow-md ${isActive ? 'ring-2 ring-[#4ecdc4]' : ''} ${isFuture ? 'opacity-75' : ''}`}
                                      style={{ border: `2px solid ${isFuture ? '#e5e7eb' : '#abc4ab'}` }}
                                    >
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: isFuture ? '#e5e7eb' : '#abc4ab', color: isFuture ? '#6b7280' : '#1e2749' }}>
                                          Embed
                                        </span>
                                        <h3 className="text-base font-bold text-[#1e2749]">SUSTAIN</h3>
                                        {isActive && <span className="ml-auto px-2 py-0.5 bg-[#4ecdc4] text-white text-xs font-bold rounded">YOU ARE HERE</span>}
                                      </div>
                                      <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Embedded Systems</p>
                                      <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
                                        <span className="text-xs font-medium text-[#1e2749]">Action</span>
                                        <ArrowRight className="w-4 h-4" style={{ color: '#abc4ab' }} />
                                        <span className="text-xs font-bold" style={{ color: '#22c55e' }}>Identity</span>
                                      </div>
                                      <p className="text-sm mb-3 text-[#1e2749]/70">
                                        Wellness becomes part of your school&apos;s identity. Systems sustain through staff turnover. Your school becomes a model for others.
                                      </p>
                                      <div className="mb-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs font-bold mb-2 text-[#1e2749]">What&apos;s Included:</p>
                                        <p className="text-xs italic mb-1.5" style={{ color: '#abc4ab' }}>Everything in ACCELERATE, plus:</p>
                                        <ul className="space-y-1">
                                          {['Desi AI Assistant (24/7 support)', 'Advanced analytics', 'Ongoing partnership support'].map((item) => (
                                            <li key={item} className="flex items-center gap-1.5 text-xs text-[#1e2749]/70">
                                              <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#abc4ab' }} />
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      <p className="text-xs text-[#1e2749]/50">Typical timeline: Ongoing partnership</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
                          <p className="text-sm text-[#1e2749]">
                            <strong>Every phase</strong> includes support for teachers, paraprofessionals, instructional coaches, and administrators. We meet each role where they are.
                          </p>
                        </div>
                      </div>
                    );

                  case 'in-person':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">
                            What Happens When<br />We Visit Your School
                          </h2>
                          <p className="text-lg text-[#1e2749]/80">
                            Our on-campus days happen while students are in session. We are in real classrooms, watching real teaching, and giving real feedback. This is not a sit-and-get workshop in the library.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">What a Visit Looks Like</h3>
                          <ul className="space-y-3">
                            {[
                              'We observe up to 15 classrooms per visit',
                              'Observations are growth-focused, not evaluative',
                              'We meet with teachers one-on-one after observations',
                              'Leadership debrief at the end of each day',
                            ].map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ffba06' }} />
                                <span className="text-[#1e2749]">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-3">Love Notes: Personalized Teacher Feedback</h3>
                          <p className="mb-4 text-[#1e2749]/80">
                            Every teacher we observe receives a Love Note, a personalized note highlighting specific strengths we saw in their classroom. These are not generic praise. They are detailed observations that help teachers see what they are already doing well.
                          </p>

                          <div className="relative p-6 rounded-xl shadow-lg mb-4" style={{ backgroundColor: '#fffbeb', border: '2px solid #ffba06', transform: 'rotate(-0.5deg)' }}>
                            <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                              <Heart className="w-4 h-4 text-[#1e2749]" />
                            </div>
                            <p className="text-sm italic leading-relaxed text-[#1e2749]">
                              &quot;During your small group rotation today, I noticed how you used proximity and a calm voice to redirect Marcus without stopping instruction. The other students did not even look up. That is classroom management mastery. The way you had materials pre-sorted for each group saved at least 3 minutes of transition time. Your students knew exactly where to go and what to grab. Keep leaning into those systems.&quot;
                            </p>
                          </div>

                          <p className="text-sm text-[#1e2749]/70">
                            This is what teachers tell us they remember months later. Not the PD slides. The moment someone noticed what they were doing right.
                          </p>
                        </div>

                        {/* Preparation Guide */}
                        <div className="bg-[#F0FDF4] rounded-xl p-6 border border-green-100">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h3 className="text-base font-bold text-gray-900">How to Prepare (Spoiler: Almost Nothing)</h3>
                          </div>
                          <p className="text-sm text-gray-700 mb-4">
                            We designed observation days to require almost zero preparation from you. Here is everything you need to do:
                          </p>
                          <div className="space-y-2">
                            {[
                              { task: 'Let your staff know we are coming', detail: 'A simple email works. We provide a template you can copy and paste.' },
                              { task: 'Keep your normal schedule', detail: 'We want to see a real day, not a performance. The more normal, the better.' },
                              { task: 'Block 30 minutes at the end of the day', detail: 'For our leadership debrief. This is where the gold is.' },
                            ].map((item, i) => (
                              <div key={i} className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                                <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700 flex-shrink-0 mt-0.5">{i + 1}</span>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.task}</p>
                                  <p className="text-xs text-gray-600">{item.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Teacher Experience */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                          <h3 className="text-base font-bold text-gray-900 mb-3">What Your Teachers Will Experience</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">10-15 minute classroom visit</p>
                                <p className="text-xs text-gray-600">Our observer sits quietly and takes notes. No interruptions. No checklists being waved around. Most teachers tell us they forgot we were there.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <Heart className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">A Love Note in their mailbox</p>
                                <p className="text-xs text-gray-600">Within 24 hours, every observed teacher gets a personalized note highlighting specific strengths. This is often the first time someone has told them what they are doing right.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">No evaluations. No judgment.</p>
                                <p className="text-xs text-gray-600">This is not tied to teacher evaluations in any way. It is purely growth-focused. Teachers can be themselves. That is the whole point.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                  case 'learning-hub':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">
                            On-Demand Support for Every Educator
                          </h2>
                          <p className="text-lg text-[#1e2749]/80">
                            The Learning Hub is not about watching videos and checking boxes. It is about finding the right strategy for the challenge you are facing today and using it tomorrow.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">What Your Staff Gets Access To</h3>
                          <ul className="space-y-3">
                            {[
                              '100+ hours of practical, classroom-ready content',
                              'Courses for teachers, paras, instructional coaches, and admins',
                              'Downloadable tools, templates, and resources',
                              'New content added regularly',
                            ].map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ffba06' }} />
                                <span className="text-[#1e2749]">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
                          <h3 className="font-bold text-gray-900 mb-2">Built for Implementation,<br />Not Consumption</h3>
                          <p className="text-sm text-[#1e2749]/80">
                            Most PD has a 10% implementation rate. Ours is 74%. The difference is in the design. Every course includes action steps, not just information. We measure what teachers do, not what they watch.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">Popular Courses</h3>
                          <div className="flex flex-wrap gap-2">
                            {['The Differentiation Fix', 'Calm Classrooms, Not Chaos', 'Communication that Clicks', 'Building Strong Teacher-Para Partnerships', 'Teachers Deserve their Time Back'].map((course) => (
                              <span key={course} className="px-3 py-2 rounded-full text-sm" style={{ backgroundColor: '#f5f5f5', color: '#1e2749' }}>
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );

                  case 'dashboard':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">
                            See Your School&apos;s Progress in Real Time
                          </h2>
                          <p className="text-lg text-[#1e2749]/80">
                            As a school leader, you need to show your superintendent and board that this investment is working. The Leadership Dashboard gives you the data to do that.
                          </p>
                        </div>

                        <div className="p-4 rounded-lg bg-[#4ecdc4]/10 border border-[#4ecdc4]">
                          <p className="text-sm font-medium text-[#1e2749]">
                            <Check className="w-4 h-4 inline mr-2 text-[#4ecdc4]" />
                            You&apos;re looking at your dashboard right now! Use the tabs at the top to explore all the data available to you.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4 text-center">What You Can Track</h3>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              { icon: <Users className="w-5 h-5" />, title: 'Staff Engagement', desc: 'Who is logging in, completing courses, using resources' },
                              { icon: <Check className="w-5 h-5" />, title: 'Implementation Progress', desc: 'Which strategies are being used in classrooms' },
                              { icon: <Eye className="w-5 h-5" />, title: 'Observation Insights', desc: 'Trends from on-campus visits, themes across classrooms' },
                              { icon: <Heart className="w-5 h-5" />, title: 'Love Notes Delivered', desc: 'Personalized feedback your teachers have received' },
                              { icon: <TrendingUp className="w-5 h-5" />, title: 'Wellness Trends', desc: 'Staff stress and satisfaction over time' },
                              { icon: <FileText className="w-5 h-5" />, title: 'Contract Delivery', desc: 'What you purchased vs. what has been delivered' },
                            ].map((item) => (
                              <div key={item.title} className="p-4 rounded-lg bg-white shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <div style={{ color: '#80a4ed' }}>{item.icon}</div>
                                  <p className="font-semibold text-[#1e2749]">{item.title}</p>
                                </div>
                                <p className="text-sm text-[#1e2749]/70">{item.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #ffba06' }}>
                          <h3 className="font-bold text-gray-900 mb-2">Why This Matters</h3>
                          <p className="text-sm text-[#1e2749]/80">
                            When renewal conversations come up, you will have the data. Not just &quot;teachers liked it&quot; but &quot;here is the measurable change we saw.&quot; That is how you justify the investment to your board.
                          </p>
                        </div>
                      </div>
                    );

                  case 'book':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">
                            Teachers Deserve It:<br />The Book That Started a Movement
                          </h2>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                          <div className="flex-shrink-0">
                            <Image
                              src="/images/teachers-deserve-it-book.jpg"
                              alt="Teachers Deserve It book cover"
                              width={200}
                              height={300}
                              className="rounded-lg shadow-xl"
                            />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-2">About the Book</h3>
                              <p className="text-[#1e2749]/80">
                                Teachers Deserve It is the book that started this whole movement. Written by Rae Hughart and Adam Welcome, it is a practical guide for educators who want to reclaim their time, rebuild their confidence, and remember why they started teaching in the first place.
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-gray-50">
                              <h3 className="font-bold text-gray-900 mb-2">What Readers Say</h3>
                              <p className="text-sm italic text-[#1e2749]/80">
                                &quot;This is not a book about doing more. It is about doing what matters. Small, manageable steps that add up to real change.&quot;
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">When Your Staff Gets the Book</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                              <span className="font-bold" style={{ color: '#ffba06' }}>IGNITE</span>
                              <span className="text-[#1e2749]/70">Not included</span>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#f0f9ff' }}>
                              <span className="font-bold" style={{ color: '#80a4ed' }}>ACCELERATE</span>
                              <span className="text-[#1e2749]">Every educator receives a copy</span>
                              <Check className="w-5 h-5 ml-auto text-green-500" />
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
                              <span className="font-bold" style={{ color: '#abc4ab' }}>SUSTAIN</span>
                              <span className="text-[#1e2749]">Every educator receives a copy</span>
                              <Check className="w-5 h-5 ml-auto text-green-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                  case 'results':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">
                            This is What Change<br />Looks Like
                          </h2>
                          <p className="text-lg text-[#1e2749]/80">
                            We do not measure success by course completions. We measure it by what changes in your school.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-4">Verified Outcomes from<br />TDI Partner Schools</h3>
                          <div className="rounded-xl overflow-hidden border border-gray-200">
                            <div className="grid grid-cols-3 text-sm font-bold bg-[#1e2749] text-white">
                              <div className="p-3 border-r border-white/20">Before TDI</div>
                              <div className="p-3 border-r border-white/20">After TDI</div>
                              <div className="p-3">What Changed</div>
                            </div>
                            {[
                              { before: '12 hours/week', after: '6-8 hours/week', metric: 'Weekly planning time' },
                              { before: '9 out of 10', after: '5-7 out of 10', metric: 'Staff stress levels' },
                              { before: '2-4 out of 10', after: '5-7 out of 10', metric: 'Teacher retention intent' },
                              { before: '10% industry avg', after: '74% with TDI', metric: 'Strategy implementation' },
                            ].map((row, idx) => (
                              <div key={idx} className={`grid grid-cols-3 text-sm border-b border-gray-200 ${idx % 2 ? 'bg-gray-50' : ''}`}>
                                <div className="p-3 border-r border-gray-200 text-red-500">{row.before}</div>
                                <div className="p-3 border-r border-gray-200 text-green-600">{row.after}</div>
                                <div className="p-3 text-[#1e2749]">{row.metric}</div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs mt-2 text-[#1e2749]/50">
                            Based on verified survey data from TDI partner schools after 3-4 months.
                          </p>
                        </div>

                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
                          <h3 className="font-bold text-gray-900 mb-2">Results in Action, Not Boxes Checked</h3>
                          <p className="text-sm text-[#1e2749]/80">
                            The goal is not to complete a course. The goal is for a teacher to try a new strategy on Monday and see it work by Friday. That is what we measure. That is what we celebrate.
                          </p>
                        </div>
                      </div>
                    );

                  case 'contract':
                    return (
                      <div id="contract-deliverables" className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">
                            Your Partnership Contract
                          </h2>
                          <div className="p-4 rounded-lg bg-[#4ecdc4]/10 border border-[#4ecdc4]">
                            <p className="text-[#1e2749]">
                              You are currently in <strong className="text-[#4ecdc4]">{partnership?.contract_phase}</strong> phase. Here&apos;s what&apos;s included in your partnership:
                            </p>
                          </div>
                        </div>

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
                                    <span className="inline-flex items-center px-2 py-1 bg-[#1e2749]/10 text-[#1e2749] rounded-full text-xs font-medium">In Progress</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Not Started</span>
                                  )}
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 text-[#1e2749]">Virtual Strategy Sessions</td>
                                <td className="py-3 px-4 text-center font-medium">{partnership?.virtual_sessions_total ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-600">{virtualSessionsCompleted} complete</td>
                                <td className="py-3 px-4 text-center">
                                  {virtualSessionsCompleted > 0 ? (
                                    <span className="inline-flex items-center px-2 py-1 bg-[#1e2749]/10 text-[#1e2749] rounded-full text-xs font-medium">In Progress</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Upcoming</span>
                                  )}
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 text-[#1e2749]">Executive Impact Sessions</td>
                                <td className="py-3 px-4 text-center font-medium">{partnership?.executive_sessions_total ?? 0}</td>
                                <td className="py-3 px-4 text-center text-gray-600">0 complete</td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Upcoming</span>
                                </td>
                              </tr>
                              <tr className="border-b border-gray-100">
                                <td className="py-3 px-4 text-[#1e2749]">Personalized Love Notes</td>
                                <td className="py-3 px-4 text-center font-medium">Per observation</td>
                                <td className="py-3 px-4 text-center text-gray-600">{loveNotes} delivered</td>
                                <td className="py-3 px-4 text-center">
                                  {loveNotes > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ecdc4]/20 text-[#4ecdc4] rounded-full text-xs font-medium"><Check className="w-3 h-3" /> Active</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Not Started</span>
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4 text-[#1e2749]">Partnership Dashboard</td>
                                <td className="py-3 px-4 text-center font-medium">1</td>
                                <td className="py-3 px-4 text-center text-gray-600">1 active</td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#4ecdc4]/20 text-[#4ecdc4] rounded-full text-xs font-medium"><Check className="w-3 h-3" /> Active</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-gray-50">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contract Period</p>
                            <p className="font-medium text-[#1e2749]">
                              {partnership?.contract_start ? new Date(partnership.contract_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not set'} - {partnership?.contract_end ? new Date(partnership.contract_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not set'}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partnership Type</p>
                            <p className="font-medium text-[#1e2749] capitalize">{partnership?.partnership_type}</p>
                          </div>
                        </div>
                      </div>
                    );

                  case 'tools':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">Leadership Tools & Resources</h2>
                          <p className="text-lg text-[#1e2749]/80">
                            Practical resources designed for school leaders. Use these in PLCs, staff meetings, or your own planning time.
                          </p>
                        </div>
                        <LeadershipQuiz />
                        <AICoachingCard />
                        <LeadershipToolkit />
                      </div>
                    );

                  case 'community':
                    return (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-3">Community, Tips & FAQ</h2>
                          <p className="text-lg text-[#1e2749]/80">
                            Seasonal resources, answers to common questions, and tips from the TDI community of school leaders.
                          </p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                          <h3 className="text-base font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                          <div className="space-y-4">
                            {[
                              { q: 'How do my teachers get Hub access?', a: 'Once you upload your staff roster, each educator receives an email invitation to create their Learning Hub account. They can log in with email or Google.' },
                              { q: 'What happens during an observation day?', a: 'Our team visits classrooms for 10-15 minutes each, takes notes on strengths, and leaves every teacher a personalized Love Note. We end the day with a leadership debrief. No evaluation, no judgment.' },
                              { q: 'Can I add more staff members later?', a: 'Yes. Go to the Team tab anytime to upload additional staff via CSV or add them one by one. They will receive Hub access automatically.' },
                              { q: 'How do I share this dashboard with my admin team?', a: 'Go to the Team tab and click "Invite a Leader." Enter their name and email, and they will receive an invite to create their own login. You can add assistant principals, department heads, or anyone who should see your team\'s data.' },
                              { q: 'What if a teacher is struggling with the Hub?', a: 'The Hub is designed to be intuitive, but if someone needs help, they can use the "I need a moment" button or email hello@teachersdeserveit.com.' },
                            ].map((faq, i) => (
                              <details key={i} className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                                  <span className="text-sm font-medium text-[#1e2749]">{faq.q}</span>
                                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                                </summary>
                                <p className="text-sm text-gray-600 pb-2 pl-0 leading-relaxed">{faq.a}</p>
                              </details>
                            ))}
                          </div>
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }
              };

              return (
                <>
                  {/* Desktop Layout: Side Tabs + Panel */}
                  <div className="hidden lg:flex gap-6">
                    {/* Left Side: Vertical Tabs */}
                    <div className="w-56 flex-shrink-0">
                      <div className="sticky top-24 space-y-2">
                        {blueprintTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setBlueprintSubTab(tab.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                              blueprintSubTab === tab.id ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md hover:scale-[1.01]'
                            }`}
                            style={{
                              backgroundColor: blueprintSubTab === tab.id ? '#ffffff' : '#f5f5f5',
                              border: blueprintSubTab === tab.id ? '2px solid #ffba06' : '1px solid #e5e7eb',
                              color: '#1e2749',
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                backgroundColor: blueprintSubTab === tab.id ? '#ffba06' : '#e5e7eb',
                                color: blueprintSubTab === tab.id ? '#1e2749' : '#6b7280',
                              }}
                            >
                              {tab.icon}
                            </div>
                            <span className={`text-sm ${blueprintSubTab === tab.id ? 'font-bold' : 'font-medium'}`}>
                              {tab.name}
                            </span>
                            {blueprintSubTab === tab.id && (
                              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: '#ffba06' }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right Side: Detail Panel */}
                    <div className="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
                      {renderBlueprintPanel()}
                    </div>
                  </div>

                  {/* Mobile Layout: Accordion Style */}
                  <div className="lg:hidden space-y-3">
                    {blueprintTabs.map((tab) => (
                      <div key={tab.id}>
                        <button
                          onClick={() => {
                            setMobileExpandedBlueprint(mobileExpandedBlueprint === tab.id ? null : tab.id);
                            setBlueprintSubTab(tab.id);
                          }}
                          className="w-full text-left p-4 rounded-xl transition-all flex items-center gap-3"
                          style={{
                            backgroundColor: mobileExpandedBlueprint === tab.id ? '#ffffff' : '#f5f5f5',
                            border: mobileExpandedBlueprint === tab.id ? '2px solid #ffba06' : '1px solid #e5e7eb',
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: mobileExpandedBlueprint === tab.id ? '#ffba06' : '#e5e7eb',
                              color: mobileExpandedBlueprint === tab.id ? '#1e2749' : '#6b7280',
                            }}
                          >
                            {tab.icon}
                          </div>
                          <span className="font-medium flex-1 text-[#1e2749]">{tab.name}</span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform text-[#1e2749] ${mobileExpandedBlueprint === tab.id ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${mobileExpandedBlueprint === tab.id ? 'max-h-[5000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                            {mobileExpandedBlueprint === tab.id && renderBlueprintPanel()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* Leadership Tools & Community moved to Your Plan sub-tabs */}
            {false && (
              <div className="hidden">

            {/* Quick Access Bar -- hidden, replaced by quick actions above */}
            <div className="hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a href="https://teachersdeserveit.com/hub" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF8E7' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#E8B84B' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>Open the Hub</p>
                  <p className="text-[10px] text-gray-500">See what your teachers see</p>
                </div>
              </a>
              <a href="https://calendly.com/raehughart" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E0F7F6' }}>
                  <CalendarDays className="w-5 h-5" style={{ color: '#2A9D8F' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>Schedule with TDI</p>
                  <p className="text-[10px] text-gray-500">Book a check-in or session</p>
                </div>
              </a>
              <a href="https://teachersdeserveit.com/hub/quick-wins" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EDE9FE' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>Browse Quick Wins</p>
                  <p className="text-[10px] text-gray-500">Tools your team can use today</p>
                </div>
              </a>
              <a href="https://teachersdeserveit.com/hub/courses" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                  <GraduationCap className="w-5 h-5" style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>PD Courses</p>
                  <p className="text-[10px] text-gray-500">Full course library</p>
                </div>
              </a>
            </div>
            </div>{/* end hidden quick access */}

            {/* Seasonal Leadership Tip */}
            <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1e2749 0%, #2d3a5c 50%, #38618C 100%)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <CalendarDays className="w-5 h-5 text-[#FFBA06]" />
                </div>
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-wider">June Leadership Strategy</p>
                  <p className="text-white font-bold text-sm">End-of-Year Teacher Appreciation</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Your team has worked hard this year. Before summer break: (1) a personal note to each educator highlighting something you noticed, (2) a 5-minute staff meeting shout-out for Hub engagement, and (3) share their PD certificate count with the board.
              </p>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold mb-4" style={{ color: '#1e2749' }}>Common Questions</h3>
              <div className="space-y-3">
                {[
                  { q: 'How do I know if my teachers are using the Hub?', a: 'Check the Hub Activity section above -- login %, tools explored, and active users update in real time.' },
                  { q: 'What should I say to teachers who have not logged in?', a: '"We have a free resource for you -- 5-minute tools at teachersdeserveit.com/hub. Your account is ready."' },
                  { q: 'Can my teachers earn PD credit?', a: 'Yes. Courses earn PD certificates with tracked hours -- printable and shareable.' },
                  { q: 'What if a teacher is struggling?', a: 'TDI sends a private wellness check-in. You will see the count on your dashboard but never individual names.' },
                ].map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="flex items-center gap-3 cursor-pointer py-2 text-sm font-medium" style={{ color: '#1e2749' }}>
                      <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                      {faq.q}
                    </summary>
                    <p className="text-sm text-gray-600 ml-7 pb-2 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Leadership Quiz/Coaching/Toolkit moved to leadership collapsible above */}

              </div>
            )}
            {/* end Community collapsible */}

          </div>
        )}

        {/* OUR PARTNERSHIP TAB */}
        {activeTab === 'our-partnership' && (
          <div className="py-6 space-y-4">

            {/* Welcome / Context Section */}
            <div className="bg-gradient-to-br from-[#1B2A4A] to-[#38618C] rounded-2xl p-6 md:p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Handshake className="w-6 h-6 text-[#E8B84B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-2" style={{ color: '#FFFFFF' }}>Your Partnership Story</h2>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    This is where your year with TDI comes to life. As we work together, this page will fill with session notes, teacher feedback, milestone celebrations, and the data that tells your school&apos;s growth story. Everything you need for board presentations, grant reporting, or just remembering how far your team has come.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => { setActiveTab('blueprint'); }}
                      className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Your Plan
                    </button>
                    <button
                      onClick={() => { setActiveTab('reporting'); }}
                      className="text-xs font-semibold px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Generate Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-4">What Your Partnership Includes</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: staffStats.total, label: 'Hub Memberships', icon: Users, color: '#8B5CF6' },
                  { value: partnership?.observation_days_total || 0, label: 'Observation Days', icon: Eye, color: '#D97706' },
                  { value: partnership?.executive_sessions_total || 0, label: 'Executive Sessions', icon: GraduationCap, color: '#2563EB' },
                  { value: partnership?.virtual_sessions_total || 0, label: 'Virtual Sessions', icon: Headphones, color: '#2A9D8F' },
                ].filter(item => item.value > 0).map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="rounded-xl bg-gray-50 p-4 text-center">
                      <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: item.color }} />
                      <p className="text-2xl font-bold text-[#1e2749]">{item.value}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Partnership Goal */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: '#2D7D78' }} />
                <h2 className="text-base font-semibold text-gray-900">Our Partnership Goal</h2>
              </div>
              <p className="text-base text-gray-700 leading-relaxed font-medium">
                {partnership?.partnership_goal ||
                  'Your partnership goal will be set during your onboarding call with our team.'}
              </p>
            </div>

            {/* Grant Funding Status -- only for grant-supported partnerships */}
            {partnership?.has_grant_support && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {/* Header with funding goal countdown */}
                <div className="bg-gradient-to-r from-[#1B2A4A] to-[#38618C] px-6 py-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Sprout className="w-5 h-5 text-[#E8B84B]" />
                    <h2 className="text-base font-bold" style={{ color: '#FFFFFF' }}>Funding Your Full Partnership</h2>
                  </div>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>TDI is actively pursuing funding so your entire staff gets access. Here is where things stand.</p>

                  {/* Funding Progress Bar */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>Funding Goal: $66,225</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>For 75 educators</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: '4%' }} />
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <span>$2,332 confirmed (base contract)</span>
                      <span>$63,893 being pursued</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Funding Paths */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Funding Paths</p>
                    <div className="space-y-2">
                      {[
                        { name: 'Base Contract (Signed)', amount: '$2,332', status: 'confirmed', detail: '13 Hub memberships, guaranteed regardless of grants' },
                        { name: 'Section 1003 / ATSI (Federal)', amount: 'TBD', status: 'submitted', detail: 'The big lever. Letter sent to school June 21 for Dr. Porter to submit to Dr. Gloster (Innovation & Performance). Not competitive, Allenwood is entitled to this money as an ATSI school.' },
                        { name: 'NEA Grant', amount: 'Pending', status: 'submitted', detail: 'Application submitted June 16 via Jovita Ortiz. Awaiting decision.' },
                        { name: 'Walmart Spark Good', amount: '$1,800', status: 'ready', detail: 'Easy win. Application drafted for professional books. School applies directly by NCES number. Next cycle Aug 1 to Nov 30. Instructions sent to school June 21.' },
                        { name: 'Excellence in Education Foundation', amount: 'Exploring', status: 'outreach', detail: 'Inquiry sent June 18 to Thea Wilson at PGCPS foundation. Awaiting response.' },
                        { name: 'Greater Washington Community Foundation', amount: 'Exploring', status: 'outreach', detail: 'Inquiry sent June 18 to Darcelle Wilson. Awaiting response.' },
                        { name: 'Title II-A (Federal)', amount: '$33,225', status: 'stalled', detail: 'Submitted May 18. Bounced between Mrs. Flood, Clarence Parker ("we don\'t offer grants"), and Kevin Thompson. TDI tracking.' },
                        { name: 'IDEA/CEIS (Federal)', amount: '$27,000', status: 'pending', detail: 'Budget narrative drafted May 2026. Not yet submitted to PGCPS Special Education office. TDI will coordinate timing.' },
                        { name: 'Community Schools', amount: '$6,000', status: 'pending', detail: 'Budget narrative drafted May 2026. Not yet submitted. Kevin Thompson identified as contact.' },
                      ].map((path, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                          path.status === 'confirmed' ? 'bg-green-50 border border-green-100' :
                          path.status === 'ready' ? 'bg-teal-50 border border-teal-100' :
                          path.status === 'submitted' ? 'bg-blue-50 border border-blue-100' :
                          path.status === 'outreach' ? 'bg-purple-50 border border-purple-100' :
                          path.status === 'stalled' ? 'bg-amber-50 border border-amber-100' :
                          'bg-gray-50 border border-gray-100'
                        }`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            path.status === 'confirmed' ? 'bg-green-200' :
                            path.status === 'ready' ? 'bg-teal-200' :
                            path.status === 'submitted' ? 'bg-blue-200' :
                            path.status === 'outreach' ? 'bg-purple-200' :
                            path.status === 'stalled' ? 'bg-amber-200' :
                            'bg-gray-200'
                          }`}>
                            {path.status === 'confirmed' ? <Check className="w-3.5 h-3.5 text-green-700" /> :
                             path.status === 'ready' ? <FileText className="w-3.5 h-3.5 text-teal-700" /> :
                             path.status === 'submitted' ? <Clock className="w-3.5 h-3.5 text-blue-700" /> :
                             path.status === 'outreach' ? <Mail className="w-3.5 h-3.5 text-purple-700" /> :
                             path.status === 'stalled' ? <AlertCircle className="w-3.5 h-3.5 text-amber-700" /> :
                             <div className="w-2 h-2 rounded-full bg-gray-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-[#1e2749]">{path.name}</p>
                              <span className={`text-xs font-bold ${
                                path.status === 'confirmed' ? 'text-green-700' :
                                path.status === 'ready' ? 'text-teal-700' :
                                path.status === 'submitted' ? 'text-blue-700' :
                                path.status === 'outreach' ? 'text-purple-700' :
                                path.status === 'stalled' ? 'text-amber-700' :
                                'text-gray-500'
                              }`}>{path.amount}</span>
                            </div>
                            <p className="text-[10px] text-gray-500">{path.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What Expands */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">What Full Funding Unlocks</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: '75', label: 'Hub Memberships', current: String(partnership.staff_enrolled || 0) },
                        { value: '3', label: 'Observation Days', current: String(partnership.observation_days_total || 0) },
                        { value: '3', label: 'Exec Sessions', current: String(partnership.executive_sessions_total || 0) },
                        { value: '4', label: 'Virtual Sessions', current: String(partnership.virtual_sessions_total || 0) },
                      ].map((item, i) => (
                        <div key={i} className="rounded-lg bg-green-50 p-3 text-center border border-green-100">
                          <p className="text-lg font-bold text-green-700">{item.value}</p>
                          <p className="text-[10px] text-green-600">{item.label}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">Currently: {item.current}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TDI Work Timeline */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">What TDI Has Done</p>
                    <div className="space-y-3">
                      {[
                        { phase: 'Research', status: 'done', detail: 'Identified 8 funding paths. Researched PGCPS contacts, mapped eligibility for Title II-A, IDEA/CEIS, Community Schools, Section 1003/ATSI, NEA, Walmart, and private foundations.' },
                        { phase: 'Document Prep', status: 'done', detail: 'Drafted 3 federal budget narratives, NEA packet, 2 foundation emails, Section 1003 principal letter, Walmart Spark Good application. All copy-paste ready.' },
                        { phase: 'Title II-A Submission', status: 'done', detail: 'Submitted May 18. Got redirected between 4 offices (Flood, Parker, Thompson). Parker said "we don\'t offer grants." TDI diagnosed as a framing issue and is tracking.' },
                        { phase: 'NEA Grant', status: 'done', detail: 'Found NEA member Jovita Ortiz on staff, drafted full packet. Application submitted June 16.' },
                        { phase: 'Foundation Outreach', status: 'done', detail: 'Emails sent June 18 to Excellence in Education Foundation (PGCPS) and Greater Washington Community Foundation.' },
                        { phase: 'Section 1003 / ATSI', status: 'active', detail: 'New approach. Letter drafted for Dr. Porter to send to Dr. Gloster (Innovation & Performance). Sent to school June 21. Waiting for Dr. Porter to send.' },
                        { phase: 'Corporate & Local Grants', status: 'active', detail: 'Walmart Spark Good application drafted ($1,800 for books). Account setup instructions sent to school June 21. Application cycle opens August 1.' },
                        { phase: 'IDEA/CEIS & Community Schools', status: 'pending', detail: 'Budget narratives drafted. TDI will coordinate submission timing after Section 1003 response comes back.' },
                        { phase: 'Approvals & Decisions', status: 'pending', detail: 'Awaiting NEA decision, foundation responses, Dr. Porter/Dr. Gloster response on Section 1003.' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            step.status === 'done' ? 'bg-green-100' : step.status === 'active' ? 'bg-amber-100' : 'bg-gray-100'
                          }`}>
                            {step.status === 'done' ? <Check className="w-3.5 h-3.5 text-green-600" /> :
                             step.status === 'active' ? <Clock className="w-3.5 h-3.5 text-amber-600" /> :
                             <div className="w-2 h-2 rounded-full bg-gray-300" />}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${step.status === 'pending' ? 'text-gray-400' : 'text-[#1e2749]'}`}>{step.phase}</p>
                            <p className="text-xs text-gray-500">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1B2A4A] rounded-lg p-4">
                    <p className="text-xs font-semibold" style={{ color: '#E8B84B' }}>Why TDI does this</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Most PD companies sign a contract and move on. We believe every educator at your school deserves access, not just the ones the budget covers. That is why we research, draft, submit, and follow up on funding applications on your behalf. Your base contract is guaranteed. Everything we find through grants expands what your team gets at no additional cost to your school.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Timeline */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-5">Your TDI Journey</h2>
              <div className="flex items-start">
                {(['IGNITE', 'ACCELERATE', 'SUSTAIN'] as const).map((p, i) => {
                  const phases = ['IGNITE', 'ACCELERATE', 'SUSTAIN']
                  const currentIndex = phases.indexOf(partnership?.contract_phase || 'IGNITE')
                  const thisIndex = phases.indexOf(p)
                  const isCurrent = p === (partnership?.contract_phase || 'IGNITE')
                  const isComplete = thisIndex < currentIndex
                  const phaseColors = ['#D97706', '#2D7D78', '#16A34A']
                  const color = phaseColors[i]
                  return (
                    <div key={p} className="flex items-start flex-1">
                      <div className="flex-1 text-center">
                        <div className="flex justify-center mb-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              background: isCurrent ? color : isComplete ? '#E5E7EB' : '#F3F4F6',
                              color: isCurrent ? '#fff' : isComplete ? '#6B7280' : '#9CA3AF',
                              border: isCurrent ? `2px solid ${color}` : '2px solid #E5E7EB',
                            }}>
                            {isComplete ? '✓' : i + 1}
                          </div>
                        </div>
                        <p className="text-xs font-bold mb-0.5"
                          style={{ color: isCurrent ? color : isComplete ? '#6B7280' : '#9CA3AF' }}>
                          Phase {i + 1}
                        </p>
                        <p className="text-xs font-semibold"
                          style={{ color: isCurrent ? '#1B2A4A' : '#9CA3AF' }}>
                          {p}
                        </p>
                        {isCurrent && (
                          <div className="mt-1 text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                            style={{ background: `${color}15`, color }}>
                            You Are Here
                          </div>
                        )}
                      </div>
                      {i < 2 && (
                        <div className="flex-shrink-0 w-8 h-0.5 mt-5"
                          style={{ background: isComplete ? '#2D7D78' : '#E5E7EB' }} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Partnership Timeline */}
            <div className="bg-white rounded-xl border border-gray-100 p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h2 className="text-base font-semibold text-gray-900 mb-5">Partnership Timeline</h2>
              {timelineEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Your timeline will fill in as we deliver sessions and reach milestones together.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {(['completed', 'in_progress', 'upcoming'] as const).map(status => {
                    const config = {
                      completed: { label: 'Done', color: '#16A34A', bg: '#DCFCE7' },
                      in_progress: { label: 'In Progress', color: '#D97706', bg: '#FEF3C7' },
                      upcoming: { label: 'Coming Soon', color: '#2563EB', bg: '#EFF6FF' },
                    }[status]
                    const events = timelineEvents.filter(e => e.status === status)
                    return (
                      <div key={status}>
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: config.color }} />
                          <span className="text-xs font-bold uppercase tracking-wide"
                            style={{ color: config.color }}>
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">{events.length}</span>
                        </div>
                        {events.length === 0 ? (
                          <p className="text-xs text-gray-300 italic">Nothing here yet</p>
                        ) : (
                          events.map(event => (
                            <div key={event.id} className="flex items-start gap-2 mb-3">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                                style={{ background: config.color }} />
                              <div>
                                <p className="text-sm text-gray-700 leading-snug">{event.title}</p>
                                {event.date && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Session Records */}
            {sessionRecords && sessionRecords.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h2 className="text-base font-semibold text-gray-900 mb-4">Sessions Completed</h2>
                <div className="space-y-3">
                  {sessionRecords.map((record) => (
                    <div key={record.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {record.session_type === 'observation' ? 'Observation Day' :
                             record.session_type === 'virtual_session' ? 'Virtual Session' :
                             record.session_type === 'executive_session' ? 'Executive Session' :
                             'Session'} {record.session_number}
                          </p>
                          {record.session_date && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(record.session_date).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      {record.love_notes_count > 0 && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0"
                          style={{ background: '#FEF3C7', color: '#92400E' }}>
                          {record.love_notes_count} Love Notes
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Quotes */}
            {teacherQuotes && teacherQuotes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Voices From Your School
                </h2>
                <div className="space-y-3">
                  {teacherQuotes.map((quote) => (
                    <div key={quote.id}
                      className="p-4 rounded-xl border-l-4"
                      style={{ background: '#F9FAFB', borderLeftColor: '#2D7D78' }}>
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        &ldquo;{quote.quote_text}&rdquo;
                      </p>
                      {quote.teacher_role && (
                        <p className="text-xs text-gray-400 mt-2 font-medium">
                          - {quote.teacher_role}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* SCHOOLS TAB (District Only) */}
        {activeTab === 'schools' && partnership?.partnership_type === 'district' && (
          <div role="tabpanel" id="panel-schools" aria-labelledby="tab-schools" className="space-y-4 md:space-y-6">
            {/* Schools Overview */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">District Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-[#1e2749]">{apiBuildings.length}</p>
                  <p className="text-xs md:text-sm text-gray-500">Buildings</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-[#1e2749]">{staffStats.total}</p>
                  <p className="text-xs md:text-sm text-gray-500">Total Staff</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-[#1e2749]">
                    {staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : 0}%
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">Avg Hub Login</p>
                </div>
                <div className="p-3 md:p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-xl md:text-2xl font-bold text-[#1e2749]">—</p>
                  <p className="text-xs md:text-sm text-gray-500">Need Attention</p>
                </div>
              </div>
            </div>

            {/* Building Cards */}
            {apiBuildings.length === 0 ? (
              <ExamplePreview message="Example from a real TDI district - your Schools tab will show this level of detail for every building, including teacher vs. para breakdowns, individual engagement tracking, awards, and personalized TDI notes.">
                <div id="buildings-list" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Buildings</h2>
                  <div className="space-y-4">
                    {/* ===== HARMONY ELEMENTARY — EXPANDED EXAMPLE ===== */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">

                      {/* Header Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 style={{ color: '#1B2A4A' }} className="text-base font-semibold">Harmony Elementary</h3>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">K-5</span>
                          <span style={{ color: '#14b8a6' }} className="text-xs font-medium">Champion: Ms. Rivera</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span style={{ color: '#14b8a6' }} className="text-xs font-medium">Obs. ✓</span>
                          <div className="text-right">
                            <span style={{ color: '#14b8a6' }} className="text-xl font-bold">88%</span>
                            <p style={{ color: '#6b7280' }} className="text-[10px]">logged in</p>
                          </div>
                        </div>
                      </div>

                      {/* Subtitle */}
                      <p style={{ color: '#6b7280' }} className="text-xs mb-3">45 Teachers · 20 Paras</p>

                      {/* Health Dots */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <div className="w-3 h-3 rounded-full bg-teal-500" />
                        <div className="w-3 h-3 rounded-full bg-teal-500" />
                        <div className="w-3 h-3 rounded-full bg-teal-500" />
                        <div className="w-3 h-3 rounded-full bg-teal-500" />
                        <span style={{ color: '#9ca3af' }} className="text-xs ml-1">Health</span>
                      </div>

                      {/* Awards */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p style={{ color: '#6b7280' }} className="text-[10px] font-semibold uppercase tracking-wide mb-2">Awards</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-[#FFBA06]/10 border border-[#FFBA06]/30 rounded-full text-xs font-medium" style={{ color: '#92400e' }}>🥇 Most Engaged</span>
                          <span className="px-2 py-1 bg-[#FFBA06]/10 border border-[#FFBA06]/30 rounded-full text-xs font-medium" style={{ color: '#92400e' }}>🥇 Implementation</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">🥈 Top Learners</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">🥈 Wellness Leader</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">🥈 Retention</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">🥈 Movement Leader</span>
                        </div>
                      </div>

                      {/* 4 Donut Charts Row */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Hub Logins', value: '88%', pct: 88, status: 'On Track' },
                          { label: 'Courses', value: '68%', pct: 68, status: 'On Track' },
                          { label: 'Avg. Stress', value: '5.2/10', pct: 52, status: 'On Track' },
                          { label: 'Implementation', value: '34%', pct: 34, status: 'On Track' },
                        ].map((item, i) => (
                          <div key={i} className="text-center">
                            <div className="relative w-14 h-14 md:w-16 md:h-16 mx-auto mb-1">
                              <svg viewBox="0 0 36 36" className="w-full h-full">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#14b8a6" strokeWidth="3" strokeDasharray={`${item.pct}, 100`} />
                              </svg>
                              <span style={{ color: '#14b8a6' }} className="absolute inset-0 flex items-center justify-center text-xs font-bold">{item.value}</span>
                            </div>
                            <p style={{ color: '#6b7280' }} className="text-[10px]">{item.label}</p>
                            <p style={{ color: '#14b8a6' }} className="text-[10px] font-medium">{item.status}</p>
                          </div>
                        ))}
                      </div>

                      {/* Observation Day Status */}
                      <div className="mb-4">
                        <p style={{ color: '#14b8a6' }} className="text-xs font-medium">
                          Observation Day: Completed ✓ - Personalized feedback delivered, follow-up coaching scheduled
                        </p>
                      </div>

                      {/* TDI Note */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-5">
                        <p style={{ color: '#374151' }} className="text-xs">
                          <span className="font-semibold">TDI Note:</span> Most medals in the district (2 golds, 4 silvers). Ms. Rivera's PLC structure is a model we'd love to share with other buildings.
                        </p>
                      </div>

                      {/* Teacher vs Para Split */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Teachers Column */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">👩‍🏫</span>
                            <h4 style={{ color: '#1B2A4A' }} className="text-sm font-bold">Teachers</h4>
                          </div>
                          <p style={{ color: '#6b7280' }} className="text-xs mb-2">42/45 logged in (93%)</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div className="bg-[#1B2A4A] h-2 rounded-full" style={{ width: '93%' }} />
                          </div>

                          {/* Teacher Donuts */}
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {[
                              { label: 'Logins', value: '100%', pct: 100 },
                              { label: 'Courses', value: '78%', pct: 78 },
                              { label: 'Stress', value: '4.8', pct: 48 },
                              { label: 'Impl.', value: '38%', pct: 38 },
                            ].map((item, i) => (
                              <div key={i} className="text-center">
                                <div className="relative w-10 h-10 mx-auto mb-0.5">
                                  <svg viewBox="0 0 36 36" className="w-full h-full">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#14b8a6" strokeWidth="3.5" strokeDasharray={`${item.pct}, 100`} />
                                  </svg>
                                  <span style={{ color: '#1B2A4A' }} className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">{item.value}</span>
                                </div>
                                <p style={{ color: '#9ca3af' }} className="text-[9px]">{item.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* What Teachers Are Exploring */}
                          <p style={{ color: '#6b7280' }} className="text-[10px] font-medium mb-1">What Teachers Are Exploring:</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">The Differentiation Fix</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">Small Group Mastery</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">Time Management</span>
                          </div>

                          {/* Teacher Names with Status Dots */}
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {['Emily W.', 'Robert J.', 'Michelle P.', 'Kevin D.', 'Patricia A.', 'Brian M.', 'Jessica L.'].map((name, i) => (
                              <span key={i} className="flex items-center gap-1 text-[10px]" style={{ color: '#6b7280' }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                                {name}
                              </span>
                            ))}
                            <span className="text-[10px]" style={{ color: '#9ca3af' }}>+35 more</span>
                          </div>
                        </div>

                        {/* Paras Column */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">🤝</span>
                            <h4 style={{ color: '#14b8a6' }} className="text-sm font-bold">Paras</h4>
                          </div>
                          <p style={{ color: '#6b7280' }} className="text-xs mb-2">15/20 logged in (75%)</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }} />
                          </div>

                          {/* Para Donuts */}
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            {[
                              { label: 'Logins', value: '85%', pct: 85 },
                              { label: 'Courses', value: '58%', pct: 58 },
                              { label: 'Stress', value: '5.9', pct: 59 },
                              { label: 'Impl.', value: '26%', pct: 26 },
                            ].map((item, i) => (
                              <div key={i} className="text-center">
                                <div className="relative w-10 h-10 mx-auto mb-0.5">
                                  <svg viewBox="0 0 36 36" className="w-full h-full">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#14b8a6" strokeWidth="3.5" strokeDasharray={`${item.pct}, 100`} />
                                  </svg>
                                  <span style={{ color: '#1B2A4A' }} className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">{item.value}</span>
                                </div>
                                <p style={{ color: '#9ca3af' }} className="text-[9px]">{item.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* What Paras Are Exploring */}
                          <p style={{ color: '#6b7280' }} className="text-[10px] font-medium mb-1">What Paras Are Exploring:</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="px-2 py-0.5 bg-teal-50 rounded text-[10px] text-teal-700">Teacher-Para Partnerships</span>
                            <span className="px-2 py-0.5 bg-teal-50 rounded text-[10px] text-teal-700">Small-Group Instruction</span>
                            <span className="px-2 py-0.5 bg-teal-50 rounded text-[10px] text-teal-700">De-Escalation</span>
                          </div>

                          {/* Para Names with Status Dots */}
                          <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {['Carmen S.', 'Jose M.', 'Linda R.', 'Marcus T.', 'Derek W.', 'Yolanda J.'].map((name, i) => (
                              <span key={i} className="flex items-center gap-1 text-[10px]" style={{ color: '#6b7280' }}>
                                <span className={`w-1.5 h-1.5 rounded-full ${i < 4 ? 'bg-teal-500' : 'bg-gray-300'} inline-block`} />
                                {name}
                              </span>
                            ))}
                            <span className="text-[10px]" style={{ color: '#9ca3af' }}>+14 more</span>
                          </div>
                        </div>
                      </div>

                      {/* TDI Spotlight */}
                      <div className="mt-5 bg-[#FFBA06]/5 border border-[#FFBA06]/20 rounded-lg p-3">
                        <p style={{ color: '#92400e' }} className="text-xs">
                          <span className="font-semibold">⭐ TDI Spotlight:</span> Harmony is your model building! Ms. Rivera's PLC structure is driving results across every metric. We'd love to have her share her approach at the Leadership Recap.
                        </p>
                      </div>
                    </div>

                    {/* ===== COLLAPSED BUILDINGS ===== */}
                    <div className="space-y-3">
                      {[
                        { name: 'Crescendo Middle', info: '38 staff · 6-8 · Champion: Mr. Okafor', dots: ['teal', 'teal', 'amber', 'teal'], pct: '91%' },
                        { name: 'Melody Primary', info: '30 staff · PreK-2 · Champion: Mrs. Patel', dots: ['teal', 'amber', 'amber', 'amber'], pct: '85%' },
                      ].map((bldg, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                          <div>
                            <h3 style={{ color: '#1B2A4A' }} className="text-sm font-semibold">{bldg.name}</h3>
                            <p style={{ color: '#6b7280' }} className="text-xs">{bldg.info}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                              {bldg.dots.map((color, j) => (
                                <div key={j} className={`w-2.5 h-2.5 rounded-full ${color === 'teal' ? 'bg-teal-500' : 'bg-[#FFBA06]'}`} />
                              ))}
                            </div>
                            <span style={{ color: '#14b8a6' }} className="text-sm font-bold">{bldg.pct}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ExamplePreview>
            ) : (
              <div id="buildings-list" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Buildings</h2>
                <div className="space-y-3">
                  {apiBuildings.map((building) => {
                    const hubStatus = getMetricStatus('hub_login_pct', null);
                    const coursesStatus = getMetricStatus('courses_avg', null);
                    const stressStatus = getMetricStatus('avg_stress', null);
                    const implStatus = getMetricStatus('implementation_pct', null);

                    return (
                      <div
                        key={building.id}
                        className="p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building className="w-5 h-5 text-gray-400" />
                            <div>
                              <h3 className="font-medium text-[#1e2749]">{building.name}</h3>
                              <p className="text-sm text-gray-500">
                                {building.building_type} · {building.staff_count || 0} staff
                                {building.lead_name && ` · ${building.lead_name}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {/* 4-dot health indicator */}
                            <div className="flex items-center gap-2">
                              {[
                                { status: hubStatus, label: 'Hub' },
                                { status: coursesStatus, label: 'Courses' },
                                { status: stressStatus, label: 'Stress' },
                                { status: implStatus, label: 'Impl.' },
                              ].map((metric, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col items-center"
                                  title={`${metric.label}: ${statusLabels[metric.status]}`}
                                  aria-label={`${metric.label}: ${statusLabels[metric.status]}`}
                                >
                                  <span
                                    className="text-lg leading-none"
                                    style={{ color: statusColors[metric.status] }}
                                  >
                                    {statusShapes[metric.status]}
                                  </span>
                                  <span className="text-[10px] text-gray-400 mt-0.5">{metric.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metric Legend */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Health Indicator Legend</p>
              <div className="flex flex-wrap gap-4">
                {(['strong', 'on_track', 'developing', 'needs_support', 'no_data'] as const).map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <span style={{ color: statusColors[status] }}>{statusShapes[status]}</span>
                    <span className="text-sm text-gray-600">{statusLabels[status]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* GROWTH PLAN TAB (formerly 2026-27 Preview) */}
        {activeTab === 'next-year' && (
          <div role="tabpanel" id="panel-next-year" aria-labelledby="tab-next-year" className="space-y-4 md:space-y-6">
            {/* Roosevelt School Pilot gets custom PilotNextYearTab */}
            {partnerSlug === 'roosevelt-school' && (
              <PilotNextYearTab
                partnership={partnership}
                schoolName={partnership?.org_name || organization?.name || 'Roosevelt School'}
              />
            )}

            {/* Standard Growth Plan for all other schools */}
            {partnerSlug !== 'roosevelt-school' && (() => {
              // Check if partnership is new (less than 3 months old OR no metric snapshots)
              const daysSinceStart = partnership?.contract_start
                ? Math.floor((Date.now() - new Date(partnership.contract_start).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              const isNewPartnership = daysSinceStart < 90 || metricSnapshots.length === 0;

              if (isNewPartnership) {
                return (
                  <>
                    {/* Unbuilt State for New Partnerships */}
                    <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 text-center">
                      <div className="w-16 h-16 bg-[#4ecdc4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sprout className="w-8 h-8 text-[#4ecdc4]" />
                      </div>
                      <h1 className="text-xl md:text-2xl font-bold text-[#1e2749] mb-2">Your Growth Plan</h1>
                      <h2 className="text-base md:text-lg text-gray-600 mb-4">Building Your Foundation First</h2>
                      <p className="text-gray-500 max-w-xl mx-auto">
                        Once your partnership is underway and we&apos;ve collected baseline data, this space will transform into your personalized growth plan - including impact metrics, recommended next steps, and resources to share with your leadership team.
                      </p>
                    </div>

                    {/* Preview of What's Coming */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-4 text-center">What&apos;s coming to your Growth Plan:</p>
                      <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                          <BarChart3 className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Impact metrics with before/after comparisons</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                          <Target className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Personalized recommendations for Year 2</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Board presentation resources</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                          <TrendingUp className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-500">ROI analysis with your actual data</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Questions about what&apos;s ahead?</p>
                      <a
                        href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e2749] text-white rounded-lg font-medium hover:bg-[#2a3459] transition-colors"
                      >
                        Schedule a Call
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </>
                );
              }

              // Has data - show the full Growth Plan content
              return (
                <>
                  {/* Headline */}
                  <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100 text-center">
                    <h1 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                      Your Growth Plan: Building on {partnership?.org_name || organization?.name || 'Your'}&apos;s Momentum
                    </h1>
                    <p className="text-sm md:text-base text-gray-600">
                      {partnership?.partnership_type === 'district'
                        ? `Your ${apiBuildings.length || ''} building${apiBuildings.length !== 1 ? 's have' : ' has'} established a strong foundation. Here's how Year 2 takes it further.`
                        : "Your team has established a strong foundation. Here's how Year 2 takes it further."}
                    </p>
                  </div>

            {/* Proposed Year 2 Timeline */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">Proposed 2026-27 Timeline</h2>
              <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6 italic">
                This proposed timeline will be customized based on your partnership progress.
              </p>
              <div className="relative pl-6 md:pl-8 space-y-3 md:space-y-4">
                {/* Timeline line */}
                <div className="absolute left-2 md:left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

                {[
                  { month: 'Aug', event: 'Leadership Planning Session', icon: Users },
                  { month: 'Sep', event: 'On-Site Kickoff (full team)', icon: Rocket },
                  { month: 'Oct', event: 'Virtual Session: Advanced strategies', icon: BookOpen },
                  { month: 'Nov', event: 'Observation Day: Expanded groups', icon: Eye },
                  { month: 'Jan', event: 'Mid-Year Check-in + Growth Group refresh', icon: TrendingUp },
                  { month: 'Mar', event: 'Observation Day: Full implementation', icon: Eye },
                  { month: 'May', event: 'Executive Impact Session: Annual results + Year 3', icon: Award },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="relative flex items-start gap-3 md:gap-4">
                      <div className="absolute -left-4 md:-left-5 w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#80a4ed] border-2 border-white" />
                      <div className="flex-1 flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                        <ItemIcon className="w-4 h-4 md:w-5 md:h-5 text-[#80a4ed] flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="font-medium text-[#1e2749] text-sm md:text-base">{item.month}</span>
                          <span className="text-gray-500 ml-1 md:ml-2 text-xs md:text-sm">- {item.event}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROI / Impact Summary */}
            {(() => {
              // Get metrics for change comparison
              const getMetricValues = (name: string) => {
                const matching = metricSnapshots
                  .filter(m => m.metric_name === name)
                  .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
                if (matching.length === 0) return null;
                const earliest = matching[0].metric_value;
                const latest = matching[matching.length - 1].metric_value;
                const hasChange = matching.length > 1 && earliest !== latest;
                return { earliest, latest, hasChange };
              };

              const stressData = getMetricValues('avg_stress');
              const planningData = getMetricValues('avg_planning_hours');
              const retentionData = getMetricValues('avg_retention_intent');
              const implementationData = getMetricValues('implementation_pct') || getMetricValues('avg_implementation_confidence');

              const hasAnyMetricData = stressData || planningData || retentionData || implementationData;

              // Helper to format change
              const formatChange = (earliest: number, latest: number, isLowerBetter: boolean) => {
                const pctChange = ((latest - earliest) / earliest) * 100;
                const improved = isLowerBetter ? pctChange < 0 : pctChange > 0;
                const arrow = pctChange > 0 ? '↑' : pctChange < 0 ? '↓' : '';
                return {
                  text: `${earliest.toFixed(1)} → ${latest.toFixed(1)} (${arrow}${Math.abs(pctChange).toFixed(0)}%)`,
                  improved,
                };
              };

              // Show example preview when no metric data exists
              if (!hasAnyMetricData) {
                return (
                  <ExamplePreview message="Example impact data from a mature TDI partnership - your metrics will populate over time.">
                    <div id="roi-summary" className="dark-card bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-4 md:p-8 text-white">
                      <h2 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6">Your Impact Summary</h2>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <div>
                          <p className="text-white/70 text-xs md:text-sm mb-1">Educators Supported</p>
                          <p className="text-xl md:text-2xl font-bold">255 <span className="text-sm md:text-lg font-normal text-white/70">(6 bldgs)</span></p>
                        </div>
                        <div>
                          <p className="text-white/70 text-xs md:text-sm mb-1">Hub Engagement</p>
                          <p className="text-xl md:text-2xl font-bold">87% <span className="text-sm md:text-lg font-normal text-white/70 hidden md:inline">(vs 10% avg)</span></p>
                        </div>
                        <div>
                          <p className="text-white/70 text-xs md:text-sm mb-1">Love Notes</p>
                          <p className="text-xl md:text-2xl font-bold">127</p>
                        </div>
                        <div>
                          <p className="text-white/70 text-xs md:text-sm mb-1">Educator Stress</p>
                          <p className="text-xl md:text-2xl font-bold text-[#4ecdc4]">8.2 → 6.0 (↓27%)</p>
                        </div>
                        <div>
                          <p className="text-white/70 text-xs md:text-sm mb-1">Planning Time</p>
                          <p className="text-xl md:text-2xl font-bold text-[#4ecdc4]">12 → 7 hrs (↓42%)</p>
                        </div>
                        <div>
                          <p className="text-white/70 text-xs md:text-sm mb-1">Retention Intent</p>
                          <p className="text-xl md:text-2xl font-bold text-[#4ecdc4]">4.2 → 9.8 (↑133%)</p>
                        </div>
                      </div>
                    </div>
                  </ExamplePreview>
                );
              }

              return (
                <div id="roi-summary" className="dark-card bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-4 md:p-8 text-white">
                  <h2 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6">Your Impact Summary</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <p className="text-white/70 text-xs md:text-sm mb-1">Educators Supported</p>
                      <p className="text-xl md:text-2xl font-bold">
                        {staffStats.total > 0 ? staffStats.total : '—'}
                        {partnership?.partnership_type === 'district' && apiBuildings.length > 0 && (
                          <span className="text-sm md:text-lg font-normal text-white/70 block md:inline"> ({apiBuildings.length} bldgs)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs md:text-sm mb-1">Hub Engagement</p>
                      <p className="text-xl md:text-2xl font-bold">
                        {staffStats.total > 0 ? `${Math.round((staffStats.hubLoggedIn / staffStats.total) * 100)}%` : '—'}
                        <span className="text-sm md:text-lg font-normal text-white/70 hidden md:inline"> (vs 10% avg)</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs md:text-sm mb-1">Love Notes</p>
                      <p className="text-xl md:text-2xl font-bold">{loveNotes > 0 ? loveNotes : '—'}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs md:text-sm mb-1">Educator Stress</p>
                      {stressData ? (
                        stressData.hasChange ? (
                          <p className={`text-xl md:text-2xl font-bold ${formatChange(stressData.earliest, stressData.latest, true).improved ? 'text-[#4ecdc4]' : 'text-red-300'}`}>
                            {formatChange(stressData.earliest, stressData.latest, true).text}
                          </p>
                        ) : (
                          <p className="text-xl md:text-2xl font-bold">{stressData.latest.toFixed(1)}/10</p>
                        )
                      ) : (
                        <p className="text-xl md:text-2xl font-bold">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-white/70 text-xs md:text-sm mb-1">Planning Time</p>
                      {planningData ? (
                        planningData.hasChange ? (
                          <p className={`text-xl md:text-2xl font-bold ${formatChange(planningData.earliest, planningData.latest, false).improved ? 'text-[#4ecdc4]' : 'text-red-300'}`}>
                            {formatChange(planningData.earliest, planningData.latest, false).text} hrs
                          </p>
                        ) : (
                          <p className="text-xl md:text-2xl font-bold">{planningData.latest.toFixed(1)} hrs/wk</p>
                        )
                      ) : (
                        <p className="text-xl md:text-2xl font-bold">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-white/70 text-xs md:text-sm mb-1">Retention Intent</p>
                      {retentionData ? (
                        retentionData.hasChange ? (
                          <p className={`text-xl md:text-2xl font-bold ${formatChange(retentionData.earliest, retentionData.latest, false).improved ? 'text-[#4ecdc4]' : 'text-red-300'}`}>
                            {formatChange(retentionData.earliest, retentionData.latest, false).text}
                          </p>
                        ) : (
                          <p className="text-xl md:text-2xl font-bold">{retentionData.latest.toFixed(1)}/10</p>
                        )
                      ) : (
                        <p className="text-xl md:text-2xl font-bold">—</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Board Presentation Offer */}
            <div className="bg-[#FFF8E7] rounded-2xl p-6 border border-[#E8B84B]/30">
              <h2 className="text-base font-bold text-gray-900 mb-2">NEED HELP MAKING THE CASE?</h2>
              <p className="text-gray-700 mb-4">
                We&apos;ll help you build a board presentation with your actual impact data, cost analysis, and recommended next steps. Your success is our pitch.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/calculator"
                  className="px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3459] transition-colors inline-flex items-center gap-2"
                >
                  Explore Our Impact Calculator
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-[#1e2749]/5 transition-colors inline-flex items-center gap-2"
                >
                  Schedule a Planning Call
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Closing Statement */}
            <div className="text-center py-6">
              <p className="text-gray-600 italic max-w-2xl mx-auto">
                &ldquo;Your TDI partner will build a custom Year 2 plan based on your specific needs, goals, and budget. Every partnership is different - because every {partnership?.partnership_type === 'district' ? 'district' : 'school'} is different.&rdquo;
              </p>
            </div>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* Dashboard Footer - Clean and minimal */}
      <footer className="text-center py-6 border-t border-gray-200 bg-white mt-8">
        <p className="text-sm text-gray-400">
          Teachers Deserve It | Partner Dashboard for {partnership?.org_name || organization?.name || 'Your School'}
        </p>
        <a
          href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: '#1B2A4A', color: '#FFFFFF' }}
        >
          <Phone className="w-4 h-4" />
          Schedule a Call
        </a>
      </footer>
    </div>
        )}
      </div>
    </>
  );
}
