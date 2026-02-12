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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMetricStatus, statusColors, statusShapes, statusLabels, formatMetricValue, getMetricDescription } from '@/lib/metric-thresholds';
import TDIPortalLoader from '@/components/TDIPortalLoader';

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
}

interface MetricSnapshot {
  id: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
}

interface TimelineEvent {
  id: string;
  action: string;
  details: {
    title?: string;
    description?: string;
    event_date?: string;
    building_id?: string;
    [key: string]: unknown;
  };
  created_at: string;
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

// Example Preview component for Day 1 dashboards
const ExamplePreview = ({ children, message }: { children: React.ReactNode; message?: string }) => {
  return (
    <div className="relative border-2 border-dashed border-[#FFBA06] rounded-xl overflow-hidden">
      {/* Yellow banner */}
      <div className="bg-[#FFBA06]/10 border-b border-[#FFBA06]/30 px-4 py-2 flex flex-wrap items-center gap-2">
        <svg className="w-4 h-4 text-[#d97706] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium text-[#92400e]">
          {message || "This is an example — your data will appear here as your partnership progresses."}
        </span>
      </div>
      {/* Example content with slight opacity to reinforce "not real" */}
      <div className="opacity-75 pointer-events-none select-none">
        {children}
      </div>
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
  const [staffStats, setStaffStats] = useState<StaffStats>({ total: 0, hubLoggedIn: 0 });
  const [metricSnapshots, setMetricSnapshots] = useState<MetricSnapshot[]>([]);
  const [apiBuildings, setApiBuildings] = useState<Building[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [blueprintSubTab, setBlueprintSubTab] = useState<'approach' | 'in-person' | 'learning-hub' | 'dashboard' | 'book' | 'results' | 'contract'>('approach');
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
        }
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

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'progress', label: 'Progress', icon: Users },
    ...(partnership?.partnership_type === 'district' ? [{ id: 'schools', label: 'Schools', icon: School }] : []),
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'preview', label: 'Growth Plan', icon: Sprout },
    { id: 'team', label: 'Team', icon: User },
  ];

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
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="dashboard-hero relative text-white py-4 md:py-8 px-4 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1B2A4A, #38618C)' }}
        />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">
              {organization?.name || partnership.contact_name}
            </h1>
            <p className="text-white/70 text-xs md:text-sm mt-1">
              {organization?.address_city}, {organization?.address_state} |{' '}
              {partnership.partnership_type === 'district' ? 'District' : 'School'} Partnership
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium"
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
        <div className="max-w-5xl mx-auto px-4 py-2 md:py-3">
          <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-1.5 md:gap-2 md:flex-wrap md:justify-center pb-1 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap snap-start flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
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
            {/* Stat Cards */}
            <div id="stat-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Staff Enrolled */}
              <div
                onClick={() => partnership.partnership_type === 'district' ? navigateToTab('schools', 'buildings-list') : undefined}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group ${partnership.partnership_type === 'district' ? 'cursor-pointer hover:shadow-md hover:border-[#80a4ed] transition-all' : ''}`}
              >
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#38618C]" />
                      <span className="text-xs text-gray-500 uppercase">Staff Enrolled</span>
                    </div>
                    {partnership.partnership_type === 'district' && (
                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#80a4ed] transition-colors opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                  <div className="stat-number text-[#1e2749]">{staffStats.total}</div>
                  <div className="text-xs text-[#38618C] font-medium">
                    {partnership.partnership_type === 'district' && apiBuildings.length > 0
                      ? `across ${apiBuildings.length} school${apiBuildings.length > 1 ? 's' : ''}`
                      : 'staff members'}
                  </div>
                </div>
              </div>

              {/* Observations */}
              <div
                onClick={() => navigateToTab('blueprint', 'contract-deliverables')}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-[#80a4ed] transition-all group"
              >
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs text-gray-500 uppercase">Observations</span>
                      </div>
                      <div className="stat-number text-[#1e2749]">
                        {partnership.observation_days_completed ?? 0}
                        <span className="text-lg font-normal text-gray-400">
                          /{partnership.observation_days_total ?? 0}
                        </span>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    {partnership.observation_days_total > 0 && (
                      <div className="w-16 hidden sm:block">
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
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-xs font-medium" style={{ color: getObservationColor() }}>
                      {getObservationText()}
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#80a4ed] transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </div>

              {/* Needs Attention */}
              <div
                onClick={() => scrollToSection('action-items')}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-[#80a4ed] transition-all group"
              >
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#80a4ed] transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="stat-number text-amber-500">
                    {pendingItems.length}
                  </div>
                  <div className="text-xs text-amber-600 font-medium">
                    {pendingItems.length === 0 ? 'All caught up!' : `${pendingItems.length} item${pendingItems.length !== 1 ? 's' : ''} pending`}
                  </div>
                </div>
              </div>

              {/* Current Phase */}
              <div
                onClick={() => navigateToTab('journey', 'phase-timeline')}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-[#80a4ed] transition-all group"
              >
                <div className="p-3 md:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                      </div>
                      <div className="stat-number text-[#1e2749]">
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
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      Phase {partnership.contract_phase === 'IGNITE' ? '1' : partnership.contract_phase === 'ACCELERATE' ? '2' : '3'} of 3
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#80a4ed] transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            </div>

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
                            <span className="text-[#1e2749] font-medium">65%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '65%'}} /></div>
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
                <ExamplePreview message="Example from a real TDI district — your indicators will appear after your baseline survey.">
                  {indicatorsContent}
                </ExamplePreview>
              ) : indicatorsContent;
            })()}

            {/* Building Spotlight */}
            {partnership.partnership_type === 'district' && (
              apiBuildings.length === 0 ? (
                <ExamplePreview message="Example from a TDI district with 6 buildings — your buildings will appear here after onboarding.">
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
              <ExamplePreview message="Example — your Hub engagement data appears once staff begin logging in.">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Donut Chart - Example Login Rate */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-28 h-28 md:w-36 md:h-36">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4ecdc4" strokeWidth="3"
                            strokeDasharray="87, 100" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-[#1e2749]">87%</span>
                          <span className="text-xs text-gray-500">logged in</span>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-sm font-semibold text-[#1e2749]">Hub Logins</p>
                        <p className="text-xs text-gray-500">223 of 255 staff</p>
                        <p className="text-xs text-[#4ecdc4] font-medium mt-1">Goal: 100% by Observation Day</p>
                      </div>
                    </div>

                    {/* Example Engagement Depth */}
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-[#1e2749] mb-3">Engagement Depth</p>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between text-xs py-1.5">
                          <span className="text-gray-600">Completed 1+ course</span>
                          <span className="text-[#4ecdc4] font-medium">68%</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5">
                          <span className="text-gray-600">Downloaded resources</span>
                          <span className="text-[#4ecdc4] font-medium">74%</span>
                        </div>
                        <div className="flex justify-between text-xs py-1.5">
                          <span className="text-gray-600">Active this month</span>
                          <span className="text-[#4ecdc4] font-medium">52%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center bg-gray-50 rounded-lg py-2 px-3">
                        By Building: Harmony 95%, Crescendo 91%, Rhythm 88%
                      </p>
                    </div>

                    {/* Example Love Notes & Sessions */}
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-[#1e2749] mb-3">Support Delivered</p>
                      <div className="space-y-3">
                        <div className="bg-pink-50 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-500" />
                          </div>
                          <div>
                            <span className="text-base font-bold text-[#1e2749]">127</span>
                            <p className="text-xs text-gray-500">Love Notes sent</p>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-base font-bold text-[#1e2749]">3 of 4</span>
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
                      <div className="bg-pink-50 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                          <span className="text-base font-bold text-[#1e2749]">{loveNotes}</span>
                          <p className="text-xs text-gray-500">Love Notes sent</p>
                        </div>
                      </div>
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

                <a href="https://tdi.thinkific.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#4ecdc4] font-medium hover:underline mt-4">
                  <BookOpen className="w-3.5 h-3.5" /> Open Learning Hub →
                </a>
              </div>
            )}

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

                            // Item 1: Complete Hub Onboarding - always show (simple button)
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
                    {getActionItemStatus('hub time') === 'completed' ? (
                      <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    ) : getActionItemStatus('hub time') === 'in_progress' ? (
                      <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Already on your list
                      </span>
                    ) : (
                      <button
                        onClick={() => navigateToActionItem('hub time')}
                        className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        Add Hub time to PLC agenda
                      </button>
                    )}
                    {getActionItemStatus('champion') === 'completed' ? (
                      <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    ) : getActionItemStatus('champion') === 'in_progress' ? (
                      <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Already on your list
                      </span>
                    ) : (
                      <button
                        onClick={() => navigateToActionItem('champion')}
                        className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        Designate building TDI Champions
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* District-wide Movement */}
            <div id="district-movement" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#4ecdc4]" />
                  <h3 className="text-base md:text-lg font-bold text-gray-900">District-wide Movement</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {[
                  { icon: Mail, label: 'Newsletter', stat: '32% higher adoption', link: 'https://raehughart.substack.com' },
                  { icon: BookOpen, label: 'Blog', stat: '2.5x more strategies', link: 'https://raehughart.substack.com' },
                  { icon: Headphones, label: 'Podcast', stat: '28% higher rates', link: 'https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274' },
                  { icon: Users, label: 'Community', stat: '45% less isolated', link: 'https://www.facebook.com/groups/tdimovement' },
                  { icon: FileText, label: 'Resources', stat: '3x more tools used', link: 'https://tdi.thinkific.com' },
                  { icon: GraduationCap, label: 'Courses', stat: '65% vs 10% avg', link: 'https://tdi.thinkific.com' },
                ].map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col p-2 md:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-[#4ecdc4]/10 hover:shadow-md hover:scale-[1.02] transition-all duration-200 border border-transparent hover:border-[#4ecdc4]/30"
                  >
                    <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                      <channel.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#4ecdc4] flex-shrink-0" />
                      <p className="text-xs md:text-sm font-medium text-[#1e2749]">{channel.label}</p>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 ml-auto hidden md:block" />
                    </div>
                    <p className="text-[10px] md:text-xs text-[#4ecdc4] font-medium">
                      ↗ {channel.stat}
                    </p>
                  </a>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Your staff engagement with TDI content helps drive implementation
              </p>
            </div>

            {/* Partnership Planning Card */}
            <div
              className="relative bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-6 text-white overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => setActiveTab('preview')}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="max-w-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-[#4ecdc4] text-[#1e2749] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                      Planning Ahead
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">
                    2026-27 Partnership Planning
                  </h3>
                  <p className="text-sm opacity-90 mt-2">
                    Whether you&apos;re deepening your current phase or ready to take the next step, your TDI partner will build a custom plan based on your school&apos;s progress and goals. Every partnership moves at its own pace.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('preview');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  Explore 2026-27 Options
                  <ArrowRight className="w-4 h-4" />
                </button>
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your TDI Team</h2>
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
                  <p className="text-base font-semibold text-[#1e2749]">Rae Hughart</p>
                  <p className="text-gray-500">Founder & CEO</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href="mailto:Rae@TeachersDeserveIt.com"
                        className="text-blue-600 hover:underline"
                      >
                        Rae@TeachersDeserveIt.com
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
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFBA06] text-[#1e2749] rounded-lg font-medium hover:bg-[#e5a805] transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule a Call
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href="mailto:Rae@TeachersDeserveIt.com"
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Team</h2>
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">Partnership Details</h2>
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
                            Most PD has a 10% implementation rate. Ours is 65%. The difference is in the design. Every course includes action steps, not just information. We measure what teachers do, not what they watch.
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
                              src="/images/teachers-deserve-it-book.png"
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
                              { before: '10% industry avg', after: '65% with TDI', metric: 'Strategy implementation' },
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
                              {partnership?.contract_start ? new Date(partnership.contract_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not set'} — {partnership?.contract_end ? new Date(partnership.contract_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not set'}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Partnership Type</p>
                            <p className="font-medium text-[#1e2749] capitalize">{partnership?.partnership_type}</p>
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
          </div>
        )}

        {/* JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div role="tabpanel" id="panel-journey" aria-labelledby="tab-journey" className="space-y-4 md:space-y-6">
            {/* Partnership Goal Statement */}
            {organization?.partnership_goal ? (
              <div id="partnership-goal" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex">
                  <div className="w-1 bg-[#1B2A4A] flex-shrink-0" />
                  <div className="p-4 md:p-8">
                    <p className="text-base md:text-lg text-[#1e2749] leading-relaxed font-medium">
                      &ldquo;{organization.partnership_goal}&rdquo;
                    </p>
                    <p className="text-sm text-gray-500 mt-4">— Your Partnership Goal</p>
                  </div>
                </div>
              </div>
            ) : (
              <div id="partnership-goal" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 md:p-8">
                  <h3 className="text-lg font-bold text-[#1e2749] mb-2">Your Partnership Goal</h3>
                  <p className="text-gray-600">
                    This will be personalized after your first planning session with TDI. Together, we&apos;ll define what success looks like for your team.
                  </p>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Example goals from other partnerships:</p>
                    <ul className="space-y-2">
                      <li className="text-sm text-gray-500 italic">&ldquo;Equip educators with practical strategies to confidently support students and each other.&rdquo;</li>
                      <li className="text-sm text-gray-500 italic">&ldquo;Reduce teacher burnout through sustainable, classroom-tested approaches.&rdquo;</li>
                      <li className="text-sm text-gray-500 italic">&ldquo;Build internal coaching capacity that outlasts the partnership.&rdquo;</li>
                    </ul>
                    <p className="text-xs text-gray-400 mt-4">Your TDI partner will customize this based on your {partnership?.partnership_type === 'district' ? 'district' : 'school'}&apos;s unique needs and priorities.</p>
                  </div>
                </div>
              </div>
            )}

            {/* The TDI Equation - Interactive Cards with Smooth Expansion */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6 text-center">The TDI Equation</h2>
              <div className="bg-gray-50/50 rounded-xl p-4">
                <div className="flex flex-col md:flex-row items-stretch gap-2">
                  {/* Strong Teachers Card */}
                  <div
                    className={`rounded-xl p-5 cursor-pointer transition-all duration-500 ease-in-out border ${
                      hoveredEquationCard === 0
                        ? 'md:flex-[1.3] bg-[#1B2A4A] shadow-lg border-[#1B2A4A] text-white'
                        : hoveredEquationCard !== null
                          ? 'md:flex-[0.85] bg-white shadow-sm border-gray-100'
                          : 'md:flex-1 bg-white shadow-sm border-gray-100'
                    }`}
                    onMouseEnter={() => setHoveredEquationCard(0)}
                    onMouseLeave={() => setHoveredEquationCard(null)}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <BookOpen
                        className="w-7 h-7 transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 0 ? '#ffffff' : '#1B2A4A' }}
                      />
                      <h3
                        className="text-sm font-semibold transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 0 ? '#ffffff' : '#1B2A4A' }}
                      >Strong Teachers</h3>
                      <p
                        className="text-xs transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 0 ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
                      >Practical strategies</p>
                      {/* Desktop: show on hover */}
                      <p
                        className={`text-xs mt-2 leading-relaxed transition-all duration-500 ease-in-out overflow-hidden hidden md:block ${
                          hoveredEquationCard === 0 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                        style={{ color: hoveredEquationCard === 0 ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
                      >
                        Practical strategies from the Learning Hub, tailored to your classrooms and tested by real educators.
                      </p>
                      {/* Mobile: always show */}
                      <p className="text-xs mt-2 leading-relaxed md:hidden" style={{ color: '#6B7280' }}>
                        Practical strategies from the Learning Hub, tailored to your classrooms and tested by real educators.
                      </p>
                    </div>
                  </div>

                  {/* Yellow Chevron Connector */}
                  <ChevronRight className="w-5 h-5 text-[#FFBA06] hidden md:block flex-shrink-0 self-center mx-1" />
                  <ChevronDown className="w-5 h-5 text-[#FFBA06] md:hidden self-center my-1" />

                  {/* Strong Support Card */}
                  <div
                    className={`rounded-xl p-5 cursor-pointer transition-all duration-500 ease-in-out border ${
                      hoveredEquationCard === 1
                        ? 'md:flex-[1.3] bg-[#1B2A4A] shadow-lg border-[#1B2A4A] text-white'
                        : hoveredEquationCard !== null
                          ? 'md:flex-[0.85] bg-white shadow-sm border-gray-100'
                          : 'md:flex-1 bg-white shadow-sm border-gray-100'
                    }`}
                    onMouseEnter={() => setHoveredEquationCard(1)}
                    onMouseLeave={() => setHoveredEquationCard(null)}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <Users
                        className="w-7 h-7 transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 1 ? '#ffffff' : '#1B2A4A' }}
                      />
                      <h3
                        className="text-sm font-semibold transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 1 ? '#ffffff' : '#1B2A4A' }}
                      >Strong Support</h3>
                      <p
                        className="text-xs transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 1 ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
                      >Coaching & community</p>
                      {/* Desktop: show on hover */}
                      <p
                        className={`text-xs mt-2 leading-relaxed transition-all duration-500 ease-in-out overflow-hidden hidden md:block ${
                          hoveredEquationCard === 1 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                        style={{ color: hoveredEquationCard === 1 ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
                      >
                        Ongoing coaching, Love Notes, observation feedback, and a community of 87,000+ educators.
                      </p>
                      {/* Mobile: always show */}
                      <p className="text-xs mt-2 leading-relaxed md:hidden" style={{ color: '#6B7280' }}>
                        Ongoing coaching, Love Notes, observation feedback, and a community of 87,000+ educators.
                      </p>
                    </div>
                  </div>

                  {/* Yellow Chevron Connector */}
                  <ChevronRight className="w-5 h-5 text-[#FFBA06] hidden md:block flex-shrink-0 self-center mx-1" />
                  <ChevronDown className="w-5 h-5 text-[#FFBA06] md:hidden self-center my-1" />

                  {/* Student Success Card */}
                  <div
                    className={`rounded-xl p-5 cursor-pointer transition-all duration-500 ease-in-out border ${
                      hoveredEquationCard === 2
                        ? 'md:flex-[1.3] bg-[#1B2A4A] shadow-lg border-[#1B2A4A] text-white'
                        : hoveredEquationCard !== null
                          ? 'md:flex-[0.85] bg-white shadow-sm border-gray-100'
                          : 'md:flex-1 bg-white shadow-sm border-gray-100'
                    }`}
                    onMouseEnter={() => setHoveredEquationCard(2)}
                    onMouseLeave={() => setHoveredEquationCard(null)}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <TrendingUp
                        className="w-7 h-7 transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 2 ? '#ffffff' : '#1B2A4A' }}
                      />
                      <h3
                        className="text-sm font-semibold transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 2 ? '#ffffff' : '#1B2A4A' }}
                      >Student Success</h3>
                      <p
                        className="text-xs transition-colors duration-500"
                        style={{ color: hoveredEquationCard === 2 ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
                      >Better outcomes</p>
                      {/* Desktop: show on hover */}
                      <p
                        className={`text-xs mt-2 leading-relaxed transition-all duration-500 ease-in-out overflow-hidden hidden md:block ${
                          hoveredEquationCard === 2 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                        style={{ color: hoveredEquationCard === 2 ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
                      >
                        When teachers thrive, students thrive. Better engagement, stronger relationships, measurable growth.
                      </p>
                      {/* Mobile: always show */}
                      <p className="text-xs mt-2 leading-relaxed md:hidden" style={{ color: '#6B7280' }}>
                        When teachers thrive, students thrive. Better engagement, stronger relationships, measurable growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phase Timeline with Milestones */}
            <div id="phase-timeline" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-8">Your Partnership Journey</h2>
              <div className="relative">
                {/* Timeline connector line - desktop only */}
                <div className="absolute top-6 left-[16.67%] right-[16.67%] h-0.5 bg-gray-200 hidden md:block" />

                {/* Milestone dots on the line - between IGNITE and ACCELERATE */}
                {(() => {
                  const phase = partnership?.contract_phase;
                  const isPhase2OrLater = phase === 'ACCELERATE' || phase === 'SUSTAIN';
                  const isPhase3 = phase === 'SUSTAIN';

                  // Milestones between IGNITE and ACCELERATE
                  const phase1Milestones = [
                    { id: 'hub', label: 'Hub onboarding', position: 28 },
                    { id: 'obs1', label: 'First observation day', position: 38 },
                    { id: 'survey', label: 'Baseline survey collected', position: 48 },
                  ];

                  // Milestones between ACCELERATE and SUSTAIN
                  const phase2Milestones = [
                    { id: 'growth', label: 'Growth Groups formed', position: 61 },
                    { id: 'midyear', label: 'Mid-year progress review', position: 72 },
                    { id: 'coaching', label: 'Internal coaching capacity', position: 83 },
                  ];

                  return (
                    <>
                      {/* Phase 1 milestones */}
                      {phase1Milestones.map((m) => (
                        <div
                          key={m.id}
                          className="absolute top-[22px] hidden md:block z-10"
                          style={{ left: `${m.position}%` }}
                        >
                          <div
                            className="relative cursor-pointer"
                            onClick={() => setActiveMilestoneTooltip(activeMilestoneTooltip === m.id ? null : m.id)}
                          >
                            <div className={`w-3 h-3 rounded-full border-2 ${
                              isPhase2OrLater
                                ? 'bg-[#4ecdc4] border-[#4ecdc4]'
                                : 'bg-white border-gray-300'
                            }`} />
                            {activeMilestoneTooltip === m.id && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1B2A4A] text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                                {isPhase2OrLater ? '✓ ' : ''}{m.label}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1B2A4A]" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Phase 2 milestones */}
                      {phase2Milestones.map((m) => (
                        <div
                          key={m.id}
                          className="absolute top-[22px] hidden md:block z-10"
                          style={{ left: `${m.position}%` }}
                        >
                          <div
                            className="relative cursor-pointer"
                            onClick={() => setActiveMilestoneTooltip(activeMilestoneTooltip === m.id ? null : m.id)}
                          >
                            <div className={`w-3 h-3 rounded-full border-2 ${
                              isPhase3
                                ? 'bg-[#4ecdc4] border-[#4ecdc4]'
                                : 'bg-white border-gray-300'
                            }`} />
                            {activeMilestoneTooltip === m.id && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1B2A4A] text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                                {isPhase3 ? '✓ ' : '○ '}{m.label}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1B2A4A]" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}

                <div className="grid md:grid-cols-3 gap-6">
                  {/* IGNITE Phase */}
                  {(() => {
                    const isActive = partnership?.contract_phase === 'IGNITE';
                    const isPast = partnership?.contract_phase === 'ACCELERATE' || partnership?.contract_phase === 'SUSTAIN';
                    return (
                      <div className="relative flex flex-col items-center group">
                        {isActive && (
                          <span className="absolute -top-4 px-2.5 py-1 bg-[#4ecdc4] text-white text-[10px] font-bold rounded-full whitespace-nowrap z-20 shadow-sm">
                            YOU ARE HERE
                          </span>
                        )}
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-md transition-all duration-300 group-hover:scale-110 ${
                            isPast ? 'bg-[#4ecdc4]' : isActive ? 'bg-[#1B2A4A] ring-4 ring-[#4ecdc4]/40 animate-[pulse_3s_ease-in-out_infinite]' : 'bg-gray-200'
                          }`}
                        >
                          {isPast ? (
                            <Check className="w-7 h-7 text-white" />
                          ) : (
                            <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>1</span>
                          )}
                        </div>
                        <h3 className={`font-bold mt-3 text-sm ${isPast || isActive ? 'text-[#1e2749]' : 'text-gray-400'}`}>IGNITE</h3>
                        <p className={`text-xs text-center mt-1 ${isPast || isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                          Build the foundation
                        </p>
                      </div>
                    );
                  })()}

                  {/* ACCELERATE Phase */}
                  {(() => {
                    const isActive = partnership?.contract_phase === 'ACCELERATE';
                    const isPast = partnership?.contract_phase === 'SUSTAIN';
                    const isFuture = partnership?.contract_phase === 'IGNITE';
                    return (
                      <div className="relative flex flex-col items-center group">
                        {isActive && (
                          <span className="absolute -top-4 px-2.5 py-1 bg-[#4ecdc4] text-white text-[10px] font-bold rounded-full whitespace-nowrap z-20 shadow-sm">
                            YOU ARE HERE
                          </span>
                        )}
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-md transition-all duration-300 group-hover:scale-110 ${
                            isPast ? 'bg-[#4ecdc4]' : isActive ? 'bg-[#38618C] ring-4 ring-[#4ecdc4]/40 animate-[pulse_3s_ease-in-out_infinite]' : 'bg-gray-200'
                          }`}
                        >
                          {isPast ? (
                            <Check className="w-7 h-7 text-white" />
                          ) : (
                            <span className={`text-xl font-bold ${isActive || isPast ? 'text-white' : 'text-gray-400'}`}>2</span>
                          )}
                        </div>
                        <h3 className={`font-bold mt-3 text-sm ${isFuture ? 'text-gray-400' : 'text-[#1e2749]'}`}>ACCELERATE</h3>
                        <p className={`text-xs text-center mt-1 ${isFuture ? 'text-gray-400' : 'text-gray-600'}`}>
                          Scale to full staff
                        </p>
                      </div>
                    );
                  })()}

                  {/* SUSTAIN Phase */}
                  {(() => {
                    const isActive = partnership?.contract_phase === 'SUSTAIN';
                    const isFuture = partnership?.contract_phase === 'IGNITE' || partnership?.contract_phase === 'ACCELERATE';
                    return (
                      <div className="relative flex flex-col items-center group">
                        {isActive && (
                          <span className="absolute -top-4 px-2.5 py-1 bg-[#4ecdc4] text-white text-[10px] font-bold rounded-full whitespace-nowrap z-20 shadow-sm">
                            YOU ARE HERE
                          </span>
                        )}
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-md transition-all duration-300 group-hover:scale-110 ${
                            isActive ? 'bg-[#4ecdc4] ring-4 ring-[#4ecdc4]/40 animate-[pulse_3s_ease-in-out_infinite]' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>3</span>
                        </div>
                        <h3 className={`font-bold mt-3 text-sm ${isFuture ? 'text-gray-400' : 'text-[#1e2749]'}`}>SUSTAIN</h3>
                        <p className={`text-xs text-center mt-1 ${isFuture ? 'text-gray-400' : 'text-gray-600'}`}>
                          Embed for lasting change
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Mobile milestone list */}
              <div className="md:hidden mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Milestones</p>
                <div className="space-y-1.5">
                  {[
                    { done: (partnership?.contract_phase === 'ACCELERATE' || partnership?.contract_phase === 'SUSTAIN'), label: 'Hub onboarding' },
                    { done: (partnership?.contract_phase === 'ACCELERATE' || partnership?.contract_phase === 'SUSTAIN'), label: 'First observation day' },
                    { done: (partnership?.contract_phase === 'ACCELERATE' || partnership?.contract_phase === 'SUSTAIN'), label: 'Baseline survey collected' },
                    { done: partnership?.contract_phase === 'SUSTAIN', label: 'Growth Groups formed' },
                    { done: partnership?.contract_phase === 'SUSTAIN', label: 'Mid-year progress review' },
                    { done: false, label: 'Internal coaching capacity' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={m.done ? 'text-[#4ecdc4]' : 'text-gray-300'}>
                        {m.done ? '✓' : '○'}
                      </span>
                      <span className={m.done ? 'text-gray-700' : 'text-gray-400'}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Your TDI Impact So Far */}
            <div className="dark-card bg-gradient-to-br from-[#1B2A4A] via-[#2a3f6e] to-[#38618C] rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
              <h2 className="text-lg font-bold text-white mb-4">Your TDI Impact So Far</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">{staffStats.total || 1}</div>
                  <div className="text-xs text-gray-300 mt-1">Staff enrolled</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">{partnership?.observation_days_completed || 0}</div>
                  <div className="text-xs text-gray-300 mt-1">Observation days</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-gray-300 mt-1">Love Notes sent</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-gray-300 mt-1">Courses started</div>
                </div>
              </div>
              <p className="text-xs text-gray-300 text-center mt-4">
                These numbers grow as your partnership progresses. Check the Progress tab for details.
              </p>
            </div>

            {/* What Success Looks Like - with Progress Tracking */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-4">What Success Looks Like</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {(() => {
                  // Default success targets with icons
                  const defaultTargets = [
                    { icon: TrendingUp, text: 'Staff report increased confidence in classroom strategies' },
                    { icon: ThumbsUp, text: 'Measurable improvement in feeling valued and supported' },
                    { icon: TrendingDown, text: 'Reduced stress levels compared to baseline' },
                    { icon: CheckCircle, text: 'Clear implementation of Hub strategies observed in classrooms' },
                  ];

                  // Use custom targets if available, with cycling icons
                  const cycleIcons = [TrendingUp, ThumbsUp, TrendingDown, CheckCircle, Target, Zap];
                  const targets = organization?.success_targets && organization.success_targets.length > 0
                    ? organization.success_targets.map((text, idx) => ({
                        icon: cycleIcons[idx % cycleIcons.length],
                        text,
                      }))
                    : defaultTargets;

                  return targets.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#4ecdc4] hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group"
                    >
                      {/* Status indicator */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Baseline pending</span>
                      </div>
                      <div className="flex-shrink-0">
                        <item.icon className="w-5 h-5 text-[#38618C]" />
                      </div>
                      <p className="text-sm text-gray-700 pr-16">{item.text}</p>
                    </div>
                  ));
                })()}
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Your TDI partner updates these as data comes in. No action needed from you.
              </p>

              {/* CTA Card */}
              <div className="mt-6 bg-gradient-to-r from-[#1B2A4A] to-[#2a3f6e] rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-center sm:text-left">Want to set custom goals? Let&apos;s talk about it in your next session.</p>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1B2A4A] text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  Schedule Session
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div role="tabpanel" id="panel-progress" aria-labelledby="tab-progress" className="space-y-4 md:space-y-6">
            {/* Status Banner */}
            {(() => {
              const daysSinceStart = partnership?.contract_start
                ? Math.floor((Date.now() - new Date(partnership.contract_start).getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              const hubLoginPct = staffStats.total > 0 ? (staffStats.hubLoggedIn / staffStats.total) * 100 : 0;
              const hasObservations = (partnership?.observation_days_completed ?? 0) > 0;

              let banner = {
                icon: Hammer,
                color: '#E8B84B',
                title: 'BUILDING YOUR FOUNDATION',
                message: "Your team is getting set up. Once Hub onboarding is complete, we'll begin collecting baseline data.",
              };

              if (hasObservations) {
                banner = {
                  icon: Target,
                  color: '#4ecdc4',
                  title: 'IMPLEMENTING',
                  message: 'Observation insights are in! Growth Groups are forming around key strategies.',
                };
              } else if (hubLoginPct >= 50) {
                banner = {
                  icon: TrendingUp,
                  color: '#80a4ed',
                  title: 'GAINING MOMENTUM',
                  message: 'Your educators are engaging with the Hub. Next milestone: first observation day.',
                };
              } else if (daysSinceStart > 90) {
                banner = {
                  icon: Zap,
                  color: '#E8B84B',
                  title: 'GROWING STRONGER',
                  message: 'Your team is deepening implementation. Review your progress data below.',
                };
              }

              const BannerIcon = banner.icon;
              return (
                <div
                  className="status-banner rounded-2xl p-4 md:p-6 text-white"
                  style={{ backgroundColor: banner.color }}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <BannerIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h2 className="text-sm md:text-base font-bold uppercase tracking-wide">{banner.title}</h2>
                      <p className="text-xs md:text-sm text-white/90">{banner.message}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Observation Day Highlights */}
            {(partnership?.observation_days_completed ?? 0) === 0 ? (
              <ExamplePreview message="Example — your observation highlights will appear after your first on-site visit.">
                <div id="observation-highlights" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Observation Day Highlights</h2>
                  <div className="space-y-6">
                    {/* Example Observation Day 1 */}
                    <div className="border-l-4 border-[#4ecdc4] pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-[#4ecdc4]" />
                        <span className="font-semibold text-[#1e2749]">Observation Day 1</span>
                        <span className="text-sm text-gray-500">— October 15, 2025</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Visited 4 buildings, 22 classrooms observed</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Teacher shoutout: Ms. Rivera (Harmony)</span>
                        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Teacher shoutout: Mr. Okafor (Crescendo)</span>
                      </div>
                      <p className="text-xs text-gray-500">Top strategy spotted: Collaborative learning structures</p>
                    </div>
                    {/* Example Observation Day 2 */}
                    <div className="border-l-4 border-[#80a4ed] pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-[#80a4ed]" />
                        <span className="font-semibold text-[#1e2749]">Observation Day 2</span>
                        <span className="text-sm text-gray-500">— January 22, 2026</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Visited 3 buildings, 18 classrooms observed</p>
                      <p className="text-xs text-gray-500">Focus: Differentiation strategies</p>
                    </div>
                  </div>
                </div>
              </ExamplePreview>
            ) : (
              <div id="observation-highlights" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Observation Day Highlights</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-[#4ecdc4]" />
                    <span>{partnership?.observation_days_completed} observation day{(partnership?.observation_days_completed ?? 0) > 1 ? 's' : ''} completed</span>
                  </div>
                  <p className="text-gray-600">
                    Observation highlights and teacher shoutouts will be added by your TDI partner after each visit.
                  </p>
                </div>
              </div>
            )}

            {/* Hub Engagement Breakdown */}
            {staffStats.hubLoggedIn === 0 ? (
              <ExamplePreview message="Example — your Hub engagement details appear once staff begin exploring courses.">
                <div id="hub-engagement-detail" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Hub Engagement</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-[#1e2749]">68%</p>
                      <p className="text-sm text-gray-500">Completed 1+ course</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-[#1e2749]">74%</p>
                      <p className="text-sm text-gray-500">Downloaded resources</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-[#1e2749]">52%</p>
                      <p className="text-sm text-gray-500">Active this month</p>
                    </div>
                  </div>
                </div>
              </ExamplePreview>
            ) : (
              <div id="hub-engagement-detail" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Hub Engagement</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#1e2749]">{staffStats.hubLoggedIn}</p>
                    <p className="text-sm text-gray-500">Staff Logged In</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#1e2749]">
                      {staffStats.total > 0 ? Math.round((staffStats.hubLoggedIn / staffStats.total) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-500">Login Rate</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-2xl font-bold text-[#1e2749]">{loveNotes}</p>
                    <p className="text-sm text-gray-500">Love Notes Sent</p>
                  </div>
                </div>
              </div>
            )}

            {/* Support Delivered Timeline */}
            <div id="support-timeline" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Support Delivered</h2>
              <div className="relative pl-8 space-y-6">
                {/* Timeline line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

                {/* Contract Signed */}
                <div className="relative">
                  <div className="absolute -left-5 w-4 h-4 rounded-full bg-[#4ecdc4] border-2 border-white" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Partnership Started</p>
                    <p className="text-sm text-gray-500">
                      {partnership?.contract_start
                        ? new Date(partnership.contract_start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : 'Recently'}
                    </p>
                  </div>
                </div>

                {/* Hub Access */}
                {staffStats.total > 0 && (
                  <div className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-[#80a4ed] border-2 border-white" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Hub Access Granted</p>
                      <p className="text-sm text-gray-500">{staffStats.total} staff members added</p>
                    </div>
                  </div>
                )}

                {/* Love Notes */}
                {loveNotes > 0 && (
                  <div className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-pink-400 border-2 border-white" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Love Notes Delivered</p>
                      <p className="text-sm text-gray-500">{loveNotes} personalized notes sent</p>
                    </div>
                  </div>
                )}

                {/* Dynamic Timeline Events from Database */}
                {timelineEvents.map((event) => {
                  const eventColors: Record<string, string> = {
                    observation_day_completed: '#4ecdc4',
                    virtual_session_completed: '#E8B84B',
                    executive_session_completed: '#80a4ed',
                    survey_completed: '#22c55e',
                    milestone_reached: '#f59e0b',
                    pd_hours_awarded: '#8b5cf6',
                    custom_event: '#6b7280',
                  };
                  const eventDate = event.details?.event_date
                    ? new Date(event.details.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : new Date(event.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                  return (
                    <div key={event.id} className="relative">
                      <div
                        className="absolute -left-5 w-4 h-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: eventColors[event.action] || '#6b7280' }}
                      />
                      <div>
                        <p className="font-medium text-[#1e2749]">{event.details?.title || event.action.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-500">{eventDate}</p>
                        {event.details?.description && (
                          <p className="text-sm text-gray-400 mt-1">{event.details.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Fallback: Virtual Sessions (if no timeline events for sessions) */}
                {virtualSessionsCompleted > 0 && !timelineEvents.some(e => e.action === 'virtual_session_completed') && (
                  <div className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-[#E8B84B] border-2 border-white" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Virtual Sessions Completed</p>
                      <p className="text-sm text-gray-500">{virtualSessionsCompleted} session{virtualSessionsCompleted > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}

                {/* Fallback: Observations (if no timeline events for observations) */}
                {(partnership?.observation_days_completed ?? 0) > 0 && !timelineEvents.some(e => e.action === 'observation_day_completed') && (
                  <div className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full bg-[#4ecdc4] border-2 border-white" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Observation Days Completed</p>
                      <p className="text-sm text-gray-500">{partnership?.observation_days_completed} on-site visit{(partnership?.observation_days_completed ?? 0) > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Curated Starting Points */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended Starting Points</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(partnership?.partnership_type === 'district'
                  ? [
                      { title: 'Building Your Teacher Toolkit', time: '45 min', desc: 'Essential strategies for any classroom' },
                      { title: 'PLC Power Moves', time: '30 min', desc: 'Make collaboration time count' },
                      { title: 'Sustainable Grading Practices', time: '1 hr', desc: 'Grade smarter, not harder' },
                    ]
                  : [
                      { title: 'Classroom Reset', time: '30 min', desc: 'Quick wins for immediate impact' },
                      { title: 'Stress Less, Teach More', time: '45 min', desc: 'Practical stress management' },
                      { title: 'The 15-Minute Planning Method', time: '20 min', desc: 'Efficient lesson planning' },
                    ]
                ).map((course, idx) => (
                  <a
                    key={idx}
                    href="https://tdi.thinkific.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-4 bg-gray-50 rounded-xl hover:bg-[#4ecdc4]/10 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-[#4ecdc4]" />
                      <span className="text-xs text-gray-500">{course.time}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#1e2749] group-hover:text-[#4ecdc4] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{course.desc}</p>
                  </a>
                ))}
              </div>
            </div>
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
              <ExamplePreview message="Example — your building data will populate as staff engage with the Hub and surveys are completed.">
                <div id="buildings-list" className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                  <h2 className="text-base md:text-lg font-bold text-gray-900 mb-4">Buildings</h2>
                  <div className="space-y-3">
                    {/* Example Building 1 - Harmony Elementary */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-[#1e2749]">Harmony Elementary</h3>
                            <p className="text-sm text-gray-500">K-5 · 40 staff · Champion: Ms. Rivera</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center" title="Hub: Strong (95%)">
                            <span className="text-lg leading-none" style={{ color: '#22c55e' }}>●</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Hub</span>
                          </div>
                          <div className="flex flex-col items-center" title="Courses: Strong (3.2 avg)">
                            <span className="text-lg leading-none" style={{ color: '#22c55e' }}>●</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Courses</span>
                          </div>
                          <div className="flex flex-col items-center" title="Stress: On Track (5.8)">
                            <span className="text-lg leading-none" style={{ color: '#4ecdc4' }}>◆</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Stress</span>
                          </div>
                          <div className="flex flex-col items-center" title="Implementation: Strong (72%)">
                            <span className="text-lg leading-none" style={{ color: '#22c55e' }}>●</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Impl.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Example Building 2 - Crescendo Middle */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-[#1e2749]">Crescendo Middle</h3>
                            <p className="text-sm text-gray-500">6-8 · 38 staff · Champion: Mr. Okafor</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center" title="Hub: Strong (91%)">
                            <span className="text-lg leading-none" style={{ color: '#22c55e' }}>●</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Hub</span>
                          </div>
                          <div className="flex flex-col items-center" title="Courses: On Track (2.1 avg)">
                            <span className="text-lg leading-none" style={{ color: '#4ecdc4' }}>◆</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Courses</span>
                          </div>
                          <div className="flex flex-col items-center" title="Stress: Developing (6.4)">
                            <span className="text-lg leading-none" style={{ color: '#f59e0b' }}>▲</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Stress</span>
                          </div>
                          <div className="flex flex-col items-center" title="Implementation: On Track (45%)">
                            <span className="text-lg leading-none" style={{ color: '#4ecdc4' }}>◆</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Impl.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Example Building 3 - Rhythm Academy */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-[#1e2749]">Rhythm Academy</h3>
                            <p className="text-sm text-gray-500">9-12 · 42 staff · Champion: Not yet assigned</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center" title="Hub: On Track (88%)">
                            <span className="text-lg leading-none" style={{ color: '#4ecdc4' }}>◆</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Hub</span>
                          </div>
                          <div className="flex flex-col items-center" title="Courses: Developing (1.3 avg)">
                            <span className="text-lg leading-none" style={{ color: '#f59e0b' }}>▲</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Courses</span>
                          </div>
                          <div className="flex flex-col items-center" title="Stress: Developing (7.1)">
                            <span className="text-lg leading-none" style={{ color: '#f59e0b' }}>▲</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Stress</span>
                          </div>
                          <div className="flex flex-col items-center" title="Implementation: Developing (28%)">
                            <span className="text-lg leading-none" style={{ color: '#f59e0b' }}>▲</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">Impl.</span>
                          </div>
                        </div>
                      </div>
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
        {activeTab === 'preview' && (
          <div role="tabpanel" id="panel-preview" aria-labelledby="tab-preview" className="space-y-4 md:space-y-6">
            {(() => {
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
                        Once your partnership is underway and we&apos;ve collected baseline data, this space will transform into your personalized growth plan — including impact metrics, recommended next steps, and resources to share with your leadership team.
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
                        Schedule a Call with Rae
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
                      Your Growth Plan: Building on {organization?.name || 'Your'}&apos;s Momentum
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
                          <span className="text-gray-500 ml-1 md:ml-2 text-xs md:text-sm">— {item.event}</span>
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
                  <ExamplePreview message="Example impact data from a mature TDI partnership — your metrics will populate over time.">
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
                &ldquo;Your TDI partner will build a custom Year 2 plan based on your specific needs, goals, and budget. Every partnership is different — because every {partnership?.partnership_type === 'district' ? 'district' : 'school'} is different.&rdquo;
              </p>
            </div>
                </>
              );
            })()}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1e2749] text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Teachers Deserve It</h3>
              <p className="text-sm opacity-70">PD that respects your time, strategies that actually work, and a community that gets it.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.teachersdeserveit.com" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="https://www.teachersdeserveit.com/for-schools" className="hover:text-white transition-colors">For Schools</a></li>
                <li><a href="https://www.teachersdeserveit.com/how-we-partner" className="hover:text-white transition-colors">How We Partner</a></li>
                <li><a href="https://www.teachersdeserveit.com/about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.teachersdeserveit.com/funding" className="hover:text-white transition-colors">Funding Options</a></li>
                <li><a href="https://www.teachersdeserveit.com/free-pd-plan" className="hover:text-white transition-colors">Free PD Plan</a></li>
                <li><a href="https://raehughart.substack.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="https://www.teachersdeserveit.com/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-3">Your TDI Partner</h4>
              <p className="text-sm">Rae Hughart</p>
              <p className="text-sm">Rae@TeachersDeserveIt.com</p>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="opacity-50">© 2026 Teachers Deserve It. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://www.teachersdeserveit.com/privacy" className="hover:text-white transition-colors opacity-50 hover:opacity-100">Privacy Policy</a>
              <a href="https://www.teachersdeserveit.com/terms" className="hover:text-white transition-colors opacity-50 hover:opacity-100">Terms of Service</a>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">TDI is committed to accessibility. We strive to ensure our website is usable by all educators, including those using assistive technologies.</p>
        </div>
      </footer>
    </div>
        )}
      </div>
    </>
  );
}
