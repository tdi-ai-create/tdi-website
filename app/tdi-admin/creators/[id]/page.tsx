'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  AlertCircle,
  Circle,
  Lock,
  Loader2,
  Save,
  Plus,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  X,
  Users,
  UserCircle,
  PenLine,
  Package,
  GraduationCap,
  MoreVertical,
  Palette,
  Rocket,
  CalendarDays,
  Calendar,
  Globe,
  RotateCcw,
  Copy,
} from 'lucide-react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission, hasPermission } from '@/lib/tdi-admin/permissions';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { copyToClipboard } from '@/lib/tdi-admin/clipboard';

// Creators theme colors
const theme = PORTAL_THEMES.creators;
import { PhaseProgress } from '@/components/creator-portal/PhaseProgress';
import {
  getCreatorDashboardData,
  updateCreator,
  getCreatorNotes,
} from '@/lib/creator-portal-data';
import type {
  CreatorDashboardData,
  CreatorNote,
  MilestoneStatus,
  MilestoneWithStatus,
  PhaseWithMilestones,
} from '@/types/creator-portal';

const statusConfig: Record<
  MilestoneStatus,
  { icon: typeof Check; color: string; bg: string; label: string }
> = {
  completed: {
    icon: Check,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Completed',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'In Progress',
  },
  waiting_approval: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    label: 'Waiting Approval',
  },
  available: {
    icon: Circle,
    color: 'text-[#9B7CB8]',
    bg: 'bg-amber-50',
    label: 'Available',
  },
  locked: {
    icon: Lock,
    color: 'text-gray-400',
    bg: 'bg-gray-100',
    label: 'Locked',
  },
};

// Phase descriptions
const phaseDescriptions: Record<string, string> = {
  onboarding: 'Getting the creator set up and aligned with TDI\'s process.',
  agreement: 'Formalizing the partnership with signed agreements.',
  course_design: 'Collaborating on course structure and content planning.',
  production: 'Building the course content and media.',
  launch: 'Final preparations for publishing.',
};

export default function TDIAdminCreatorDetailPage() {
  const params = useParams();
  const creatorId = params.id as string;
  const { teamMember, permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');
  const canEdit = isOwner || hasPermission(permissions, 'creator_studio', 'edit');

  const [dashboardData, setDashboardData] = useState<CreatorDashboardData | null>(null);
  const [allNotes, setAllNotes] = useState<CreatorNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [approvingMilestoneId, setApprovingMilestoneId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // Course details editing
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState<{
    content_path: 'blog' | 'download' | 'course' | null;
    course_title: string;
    course_audience: string;
    target_launch_month: string;
    discount_code: string;
  }>({
    content_path: null,
    course_title: '',
    course_audience: '',
    target_launch_month: '',
    discount_code: '',
  });

  // New note state
  const [newNote, setNewNote] = useState('');
  const [noteVisibleToCreator, setNoteVisibleToCreator] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Expanded phases
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // View mode toggle
  const [viewMode, setViewMode] = useState<'admin' | 'creator'>('admin');

  // Website visibility state
  const [isEditingWebsite, setIsEditingWebsite] = useState(false);
  const [websiteSettings, setWebsiteSettings] = useState({
    display_on_website: false,
    website_display_name: '',
    website_title: 'Content Creator',
    website_bio: '',
    display_order: 99,
  });
  const [isSavingWebsite, setIsSavingWebsite] = useState(false);

  // Publish workflow state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishAction, setPublishAction] = useState<'publish_now' | 'schedule'>('publish_now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [publishNotes, setPublishNotes] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const adminEmail = teamMember?.email || '';

  const loadData = useCallback(async () => {
    const data = await getCreatorDashboardData(creatorId);
    if (data) {
      setDashboardData(data);
      setEditedDetails({
        content_path: data.creator.content_path || null,
        course_title: data.creator.course_title || '',
        course_audience: data.creator.course_audience || '',
        target_launch_month: data.creator.target_launch_month || '',
        discount_code: data.creator.discount_code || '',
      });

      // Initialize website settings
      setWebsiteSettings({
        display_on_website: data.creator.display_on_website || false,
        website_display_name: data.creator.website_display_name || data.creator.name || '',
        website_title: data.creator.website_title || 'Content Creator',
        website_bio: data.creator.website_bio || '',
        display_order: data.creator.display_order || 99,
      });

      // Find current phase and expand it
      let currentPhaseId: string | null = null;
      for (const phase of data.phases) {
        const applicableMilestones = phase.milestones.filter((m: MilestoneWithStatus) => m.isApplicable !== false);
        const hasCurrentStep = applicableMilestones.some(
          (m: MilestoneWithStatus) => m.status === 'available' || m.status === 'in_progress' || m.status === 'waiting_approval'
        );
        if (hasCurrentStep) {
          currentPhaseId = phase.id;
          break;
        }
      }

      if (currentPhaseId) {
        setExpandedPhases(new Set([currentPhaseId]));
      } else {
        const incompletePhase = data.phases.find((p: PhaseWithMilestones) => !p.isComplete);
        if (incompletePhase) {
          setExpandedPhases(new Set([incompletePhase.id]));
        }
      }
    }

    const notes = await getCreatorNotes(creatorId, true);
    setAllNotes(notes);

    setIsLoading(false);
  }, [creatorId]);

  useEffect(() => {
    if (hasAccess) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [hasAccess, loadData]);

  const handleApprove = async (milestoneId: string, milestoneTitle: string) => {
    if (!dashboardData || !canEdit) return;

    setApprovingMilestoneId(milestoneId);
    try {
      const response = await fetch('/api/admin/approve-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          creatorId,
          adminEmail,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData();
        setSuccessMessage(`Approved: ${milestoneTitle}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`Failed to approve: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Error approving milestone.');
    } finally {
      setApprovingMilestoneId(null);
    }
  };

  const handleSaveDetails = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    try {
      await updateCreator(creatorId, editedDetails);
      await loadData();
      setIsEditingDetails(false);
    } catch (error) {
      console.error('Error saving details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWebsiteSettings = async () => {
    if (!canEdit) return;
    setIsSavingWebsite(true);
    try {
      await updateCreator(creatorId, websiteSettings);
      await loadData();
      setIsEditingWebsite(false);
      setSuccessMessage('Website visibility settings saved!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving website settings:', error);
    } finally {
      setIsSavingWebsite(false);
    }
  };

  const handlePublishStatusUpdate = async (action: string) => {
    if (!canEdit) return;
    setIsPublishing(true);
    try {
      const response = await fetch('/api/admin/update-publish-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          action,
          scheduledDate: action === 'schedule' || action === 'reschedule' ? scheduledDate : undefined,
          publishNotes: publishNotes || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadData();
        setShowPublishModal(false);
        setScheduledDate('');
        setPublishNotes('');
        setPublishAction('publish_now');

        const actionMessages: Record<string, string> = {
          publish_now: 'Creator published successfully!',
          schedule: 'Creator scheduled for publishing!',
          reschedule: 'Publish date rescheduled!',
          unpublish: 'Creator unpublished.',
          mark_published: 'Marked as published!',
        };
        setSuccessMessage(actionMessages[action] || 'Status updated!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      alert('Error updating publish status.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Check if this is the final milestone in Launch phase
  const isFinalLaunchMilestone = (milestoneId: string): boolean => {
    if (!dashboardData) return false;
    const launchPhase = dashboardData.phases.find(p => p.id === 'launch');
    if (!launchPhase) return false;
    const applicableMilestones = launchPhase.milestones.filter((m: MilestoneWithStatus) => m.isApplicable !== false);
    if (applicableMilestones.length === 0) return false;
    const lastMilestone = applicableMilestones[applicableMilestones.length - 1];
    return lastMilestone.id === milestoneId;
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !canEdit) return;

    setIsAddingNote(true);
    try {
      const response = await fetch('/api/admin/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          note: newNote.trim(),
          createdBy: adminEmail,
          visibleToCreator: noteVisibleToCreator,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewNote('');
        const notes = await getCreatorNotes(creatorId, true);
        setAllNotes(notes);
      } else {
        alert('Failed to add note: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const handleToggleMilestone = async (milestoneId: string, milestoneTitle: string, currentStatus: string) => {
    if (!canEdit) return;

    setApprovingMilestoneId(milestoneId);

    try {
      if (currentStatus === 'completed') {
        const response = await fetch('/api/admin/reopen-milestone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ milestoneId, creatorId, adminEmail }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        await loadData();
        setSuccessMessage(`Reopened: ${milestoneTitle}`);
      } else if (currentStatus !== 'locked') {
        const response = await fetch('/api/admin/approve-milestone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ milestoneId, creatorId, adminEmail }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        await loadData();
        setSuccessMessage(`Completed: ${milestoneTitle}`);

        // Check if this was the final Launch milestone - show publish modal
        if (isFinalLaunchMilestone(milestoneId)) {
          // Only show if not already published
          setTimeout(() => {
            if (dashboardData?.creator.publish_status !== 'published') {
              setShowPublishModal(true);
            }
          }, 500);
        }
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating milestone');
    } finally {
      setApprovingMilestoneId(null);
    }
  };

  // Access denied view
  if (!hasAccess) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Palette size={32} style={{ color: '#DC2626' }} />
          </div>
          <h1
            className="font-bold mb-3"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            Access Restricted
          </h1>
          <p
            className="mb-6"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#6B7280',
            }}
          >
            You don&apos;t have permission to view this creator.
          </p>
          <Link
            href="/tdi-admin/creators"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: theme.primary,
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Back to Creators
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.primary }} />
          <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Loading creator details...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Creator not found.
          </p>
          <Link
            href="/tdi-admin/creators"
            className="mt-4 inline-block"
            style={{ color: theme.primary }}
          >
            Back to creators
          </Link>
        </div>
      </div>
    );
  }

  const { creator, phases, progressPercentage, completedMilestones, totalMilestones } = dashboardData;

  // Get path badge
  const getPathBadge = (path: string | null) => {
    switch (path) {
      case 'course':
        return { icon: <GraduationCap className="w-4 h-4" />, label: 'Course', color: 'bg-blue-100 text-blue-700' };
      case 'blog':
        return { icon: <PenLine className="w-4 h-4" />, label: 'Blog', color: 'bg-green-100 text-green-700' };
      case 'download':
        return { icon: <Package className="w-4 h-4" />, label: 'Download', color: 'bg-amber-100 text-amber-700' };
      default:
        return null;
    }
  };

  const pathBadge = getPathBadge(creator.content_path);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
      {/* Back link */}
      <Link
        href="/tdi-admin/creators"
        className="inline-flex items-center gap-2 text-gray-600 hover:opacity-80 mb-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to creators
      </Link>

      {/* Creator header */}
      <div
        className="rounded-2xl p-6 md:p-8 text-white mb-8"
        style={{ background: 'linear-gradient(to right, #2B3A67, #3d5280)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {creator.name}
              </h1>
              {pathBadge && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${pathBadge.color}`}>
                  {pathBadge.icon}
                  {pathBadge.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-white/70">{creator.email}</p>
              <button
                onClick={async () => {
                  await copyToClipboard(creator.email);
                  setEmailCopied(true);
                  setTimeout(() => setEmailCopied(false), 2000);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg transition-colors hover:bg-white/20 text-xs"
                title="Copy email to clipboard"
              >
                {emailCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-white/70 hover:text-white" />
                )}
              </button>
            </div>
            <p className="mt-2 font-medium capitalize" style={{ color: theme.primary }}>
              Current Phase: {creator.current_phase.replace('_', ' ')}
            </p>
            {creator.course_title && (
              <p className="text-white/80 mt-1">&ldquo;{creator.course_title}&rdquo;</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold">{progressPercentage}%</p>
              <p className="text-sm text-white/60">
                {completedMilestones} / {totalMilestones} milestones
              </p>
            </div>
            <div className="w-20 h-20 relative">
              <svg className="transform -rotate-90" width="80" height="80">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke={theme.primary}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={220}
                  strokeDashoffset={220 - (220 * progressPercentage) / 100}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Milestones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2
              className="text-xl font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              {viewMode === 'admin' ? 'Milestones' : 'Creator View Preview'}
            </h2>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'admin'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ color: viewMode === 'admin' ? '#2B3A67' : undefined }}
              >
                <Users className="w-4 h-4" />
                Admin
              </button>
              <button
                onClick={() => setViewMode('creator')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'creator'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{ color: viewMode === 'creator' ? '#2B3A67' : undefined }}
              >
                <UserCircle className="w-4 h-4" />
                Creator View
              </button>
            </div>
          </div>

          {/* Creator View Banner */}
          {viewMode === 'creator' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-blue-800 font-medium">Viewing as: {creator.name}</p>
                <p className="text-blue-600 text-sm">This is what the creator sees in their dashboard</p>
              </div>
            </div>
          )}

          {/* Admin Helper Text */}
          {viewMode === 'admin' && canEdit && (
            <p className="text-sm text-gray-500">Click checkboxes to mark complete during calls</p>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Milestones */}
          {viewMode === 'admin' ? (
            phases.map((phase) => {
              const isExpanded = expandedPhases.has(phase.id);
              const applicableMilestones = phase.milestones.filter((m: MilestoneWithStatus) => m.isApplicable !== false);
              const completedCount = applicableMilestones.filter((m: MilestoneWithStatus) => m.status === 'completed').length;

              return (
                <div key={phase.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Phase Header */}
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          phase.isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {phase.isComplete ? <Check className="w-4 h-4" /> : phase.sort_order + 1}
                      </div>
                      <div className="text-left">
                        <h3
                          className="font-semibold"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
                        >
                          {phase.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {completedCount}/{applicableMilestones.length} complete
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Milestones */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-3 space-y-2">
                      {phaseDescriptions[phase.id] && (
                        <p className="text-sm text-gray-500 mb-3 pb-3 border-b border-gray-100">
                          {phaseDescriptions[phase.id]}
                        </p>
                      )}
                      {applicableMilestones.map((milestone: MilestoneWithStatus) => {
                        const config = statusConfig[milestone.status];
                        const Icon = config.icon;
                        const isProcessing = approvingMilestoneId === milestone.id;

                        return (
                          <div
                            key={milestone.id}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                              milestone.status === 'waiting_approval'
                                ? 'bg-orange-50 border border-orange-200'
                                : milestone.status === 'completed'
                                  ? 'bg-green-50/50'
                                  : 'hover:bg-gray-50'
                            }`}
                          >
                            {/* Checkbox/Status */}
                            <button
                              onClick={() => handleToggleMilestone(milestone.id, milestone.title, milestone.status)}
                              disabled={isProcessing || milestone.status === 'locked' || !canEdit}
                              className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                                milestone.status === 'completed'
                                  ? 'bg-green-500 text-white'
                                  : milestone.status === 'locked'
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-2 border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : milestone.status === 'completed' ? (
                                <Check className="w-4 h-4" />
                              ) : milestone.status === 'locked' ? (
                                <Lock className="w-3 h-3" />
                              ) : null}
                            </button>

                            {/* Milestone Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p
                                  className={`font-medium ${
                                    milestone.status === 'completed' ? 'text-gray-500 line-through' : ''
                                  }`}
                                  style={{ color: milestone.status !== 'completed' ? '#2B3A67' : undefined }}
                                >
                                  {milestone.title}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                  {config.label}
                                </span>
                              </div>
                              {milestone.description && (
                                <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                              )}
                            </div>

                            {/* Actions */}
                            {milestone.status === 'waiting_approval' && canEdit && (
                              <button
                                onClick={() => handleApprove(milestone.id, milestone.title)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                                style={{ backgroundColor: theme.primary, color: '#2B3A67' }}
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Approve
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // Creator View Preview
            <div className="space-y-4">
              <PhaseProgress
                phases={phases}
                creator={creator}
                isAdminPreview={true}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                <Globe className="w-4 h-4" style={{ color: theme.primary }} />
                Publish Status
              </h3>
            </div>

            {/* Status Display */}
            <div className="space-y-3">
              {creator.publish_status === 'published' ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Published</p>
                    {creator.published_date && (
                      <p className="text-sm text-green-600">
                        Since {new Date(creator.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ) : creator.publish_status === 'scheduled' ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Scheduled</p>
                    {creator.scheduled_publish_date && (
                      <p className="text-sm text-blue-600">
                        For {new Date(creator.scheduled_publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-700">In Progress</p>
                    <p className="text-sm text-gray-500">Not yet ready to publish</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {canEdit && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {creator.publish_status !== 'published' && (
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                      style={{ backgroundColor: theme.primary, color: '#2B3A67' }}
                    >
                      <Rocket className="w-4 h-4" />
                      {creator.publish_status === 'scheduled' ? 'Change' : 'Publish'}
                    </button>
                  )}
                  {creator.publish_status === 'published' && (
                    <button
                      onClick={() => handlePublishStatusUpdate('unpublish')}
                      disabled={isPublishing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                      Unpublish
                    </button>
                  )}
                  {creator.publish_status === 'scheduled' && creator.scheduled_publish_date && new Date(creator.scheduled_publish_date) <= new Date() && (
                    <button
                      onClick={() => handlePublishStatusUpdate('mark_published')}
                      disabled={isPublishing}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-orange-700 border border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Mark Published
                    </button>
                  )}
                </div>
              )}

              {/* Publish Notes */}
              {creator.publish_notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                  <p className="font-medium text-gray-700 text-xs mb-1">Note:</p>
                  {creator.publish_notes}
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3
              className="font-semibold mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              Notes
            </h3>

            {/* Add Note Form */}
            {canEdit && (
              <form onSubmit={handleAddNote} className="mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={noteVisibleToCreator}
                      onChange={(e) => setNoteVisibleToCreator(e.target.checked)}
                      className="rounded"
                    />
                    Visible to creator
                  </label>
                  <button
                    type="submit"
                    disabled={!newNote.trim() || isAddingNote}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-1"
                    style={{ backgroundColor: theme.primary, color: '#2B3A67' }}
                  >
                    {isAddingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {allNotes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet</p>
              ) : (
                allNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg text-sm ${
                      note.visible_to_creator ? 'bg-gray-50' : 'bg-amber-50 border border-amber-200'
                    }`}
                  >
                    <p className="text-gray-800">{note.content}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{note.author}</span>
                      <div className="flex items-center gap-2">
                        {!note.visible_to_creator && (
                          <span className="flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Internal
                          </span>
                        )}
                        <span>
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Course Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                Course Details
              </h3>
              {canEdit && !isEditingDetails && (
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="text-sm hover:opacity-80"
                  style={{ color: theme.primary }}
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingDetails ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Content Path</label>
                  <select
                    value={editedDetails.content_path || ''}
                    onChange={(e) =>
                      setEditedDetails({
                        ...editedDetails,
                        content_path: (e.target.value as 'blog' | 'download' | 'course') || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">Not set</option>
                    <option value="blog">Blog</option>
                    <option value="download">Download</option>
                    <option value="course">Course</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Course Title</label>
                  <input
                    type="text"
                    value={editedDetails.course_title}
                    onChange={(e) => setEditedDetails({ ...editedDetails, course_title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={editedDetails.course_audience}
                    onChange={(e) => setEditedDetails({ ...editedDetails, course_audience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Target Launch</label>
                  <input
                    type="text"
                    value={editedDetails.target_launch_month}
                    onChange={(e) => setEditedDetails({ ...editedDetails, target_launch_month: e.target.value })}
                    placeholder="e.g., March 2026"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsEditingDetails(false)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDetails}
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    style={{ backgroundColor: theme.primary, color: '#2B3A67' }}
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Content Path</p>
                  <p className="font-medium capitalize" style={{ color: '#2B3A67' }}>
                    {creator.content_path || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Course Title</p>
                  <p className="font-medium" style={{ color: '#2B3A67' }}>
                    {creator.course_title || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Target Audience</p>
                  <p className="font-medium" style={{ color: '#2B3A67' }}>
                    {creator.course_audience || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Target Launch</p>
                  <p className="font-medium" style={{ color: '#2B3A67' }}>
                    {creator.target_launch_month || 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Website Visibility Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                Website Visibility
              </h3>
              {canEdit && !isEditingWebsite && (
                <button
                  onClick={() => setIsEditingWebsite(true)}
                  className="text-sm hover:opacity-80"
                  style={{ color: theme.primary }}
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingWebsite ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={websiteSettings.display_on_website}
                      onChange={(e) => setWebsiteSettings({ ...websiteSettings, display_on_website: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#E8B84B]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E8B84B]"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">Show on website</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={websiteSettings.website_display_name}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, website_display_name: e.target.value })}
                    placeholder={creator.name}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={websiteSettings.website_title}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, website_title: e.target.value })}
                    placeholder="Content Creator"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Short Bio (optional, 150 chars)</label>
                  <textarea
                    value={websiteSettings.website_bio}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, website_bio: e.target.value.slice(0, 150) })}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right">{websiteSettings.website_bio.length}/150</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={websiteSettings.display_order}
                    onChange={(e) => setWebsiteSettings({ ...websiteSettings, display_order: parseInt(e.target.value) || 99 })}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                {/* Preview Card */}
                {websiteSettings.display_on_website && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-gray-500 mb-2">Preview on website:</p>
                    <div className="text-center">
                      <div
                        className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                        style={{ backgroundColor: '#80a4ed' }}
                      >
                        <span className="text-white font-bold text-xs">
                          {(websiteSettings.website_display_name || creator.name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                        {websiteSettings.website_display_name || creator.name}
                      </p>
                      <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
                        {websiteSettings.website_title || 'Content Creator'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsEditingWebsite(false)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveWebsiteSettings}
                    disabled={isSavingWebsite}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    style={{ backgroundColor: theme.primary, color: '#2B3A67' }}
                  >
                    {isSavingWebsite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {websiteSettings.display_on_website ? (
                    <>
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Visible on website</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Not shown on website</span>
                    </>
                  )}
                </div>
                {websiteSettings.display_on_website && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <div className="text-center">
                      <div
                        className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                        style={{ backgroundColor: '#80a4ed' }}
                      >
                        <span className="text-white font-bold text-xs">
                          {(websiteSettings.website_display_name || creator.name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>
                        {websiteSettings.website_display_name || creator.name}
                      </p>
                      <p className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>
                        {websiteSettings.website_title || 'Content Creator'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.light }}
                >
                  <Rocket size={24} style={{ color: theme.primary }} />
                </div>
                <div>
                  <h2
                    className="font-bold text-lg"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#2B3A67' }}
                  >
                    Ready to Publish!
                  </h2>
                  <p className="text-sm text-gray-500">
                    {creator.name} is ready to go live
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Action Selection */}
              <div className="space-y-3">
                <label className="block">
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      publishAction === 'publish_now'
                        ? 'border-[#9B7CB8] bg-[#F3EDF8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPublishAction('publish_now')}
                  >
                    <input
                      type="radio"
                      name="publishAction"
                      value="publish_now"
                      checked={publishAction === 'publish_now'}
                      onChange={() => setPublishAction('publish_now')}
                      className="sr-only"
                    />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: publishAction === 'publish_now' ? theme.primary : '#F3F4F6' }}
                    >
                      <Rocket size={20} className={publishAction === 'publish_now' ? 'text-white' : 'text-gray-500'} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#2B3A67' }}>Publish Now</p>
                      <p className="text-sm text-gray-500">Make visible on website immediately</p>
                    </div>
                  </div>
                </label>

                <label className="block">
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      publishAction === 'schedule'
                        ? 'border-[#9B7CB8] bg-[#F3EDF8]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPublishAction('schedule')}
                  >
                    <input
                      type="radio"
                      name="publishAction"
                      value="schedule"
                      checked={publishAction === 'schedule'}
                      onChange={() => setPublishAction('schedule')}
                      className="sr-only"
                    />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: publishAction === 'schedule' ? theme.primary : '#F3F4F6' }}
                    >
                      <Calendar size={20} className={publishAction === 'schedule' ? 'text-white' : 'text-gray-500'} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#2B3A67' }}>Schedule for Later</p>
                      <p className="text-sm text-gray-500">Set a specific launch date</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Date Picker (shown if scheduling) */}
              {publishAction === 'schedule' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#9B7CB8]/50 focus:border-[#9B7CB8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={publishNotes}
                      onChange={(e) => setPublishNotes(e.target.value)}
                      placeholder="e.g., Coordinating with social media campaign..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#9B7CB8]/50 focus:border-[#9B7CB8]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setScheduledDate('');
                  setPublishNotes('');
                  setPublishAction('publish_now');
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePublishStatusUpdate(publishAction)}
                disabled={isPublishing || (publishAction === 'schedule' && !scheduledDate)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: theme.primary, color: '#2B3A67' }}
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : publishAction === 'publish_now' ? (
                  <>
                    <Rocket className="w-4 h-4" />
                    Publish Now
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
