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
  Archive,
  ArchiveRestore,
  Sparkles,
  History,
  ExternalLink,
  Settings,
  Mail,
  User,
  Folder,
  Activity,
} from 'lucide-react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission, hasPermission } from '@/lib/tdi-admin/permissions';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import ProjectedDateCountdown from '@/components/creator-portal/ProjectedDateCountdown';
import { copyToClipboard } from '@/lib/tdi-admin/clipboard';
import { getSupabase } from '@/lib/supabase';

// Creators theme colors
const theme = PORTAL_THEMES.creators;
import { PhaseProgress } from '@/components/creator-portal/PhaseProgress';
import { CourseDetailsPanel, getContentLabels } from '@/components/creator-portal/CourseDetailsPanel';
import { NotesPanel } from '@/components/creator-portal/NotesPanel';
import { NotePreview } from '@/components/creator-portal/NotePreview';
import { NoteModal } from '@/components/creator-portal/NoteModal';
import { RichTextEditor } from '@/components/creator-portal/RichTextEditor';
import {
  getCreatorDashboardData,
  getCreatorNotes,
  getContextAwareMilestoneDescription,
  getContextAwareMilestoneTitle,
} from '@/lib/creator-portal-data';
import type {
  CreatorDashboardData,
  CreatorNote,
  MilestoneStatus,
  MilestoneWithStatus,
  PhaseWithMilestones,
  ContentPath,
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
    color: 'text-[#8B5CF6]',
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
  marketing_blog: 'Writing and publishing the marketing blog post.',
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
  const [saveDetailsError, setSaveDetailsError] = useState<string | null>(null);
  const [editedDetails, setEditedDetails] = useState<{
    content_path: 'blog' | 'download' | 'course' | null;
    course_title: string;
    course_audience: string;
    target_publish_month: string;
    discount_code: string;
  }>({
    content_path: null,
    course_title: '',
    course_audience: '',
    target_publish_month: '',
    discount_code: '',
  });

  // New note state
  const [newNote, setNewNote] = useState('');
  const [noteVisibleToCreator, setNoteVisibleToCreator] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Expanded phases
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // View mode toggle
  // viewMode removed — admin view is the only view. Use "Open Portal" for creator preview.

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

  // Post-launch notes state
  const [postLaunchNotes, setPostLaunchNotes] = useState('');
  const [isEditingPostLaunch, setIsEditingPostLaunch] = useState(false);
  const [isSavingPostLaunch, setIsSavingPostLaunch] = useState(false);

  // Archive state
  const [isArchiving, setIsArchiving] = useState(false);
  const [showStartNewProjectModal, setShowStartNewProjectModal] = useState(false);
  const [isStartingNewProject, setIsStartingNewProject] = useState(false);

  // Creator Settings state
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldValue, setEditFieldValue] = useState('');
  const [isSavingField, setIsSavingField] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // Revision request modal state
  const [selectedMilestoneForRevision, setSelectedMilestoneForRevision] = useState<{ id: string; title: string } | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

  // Expanded note modal state (for reading full notes)
  const [expandedNote, setExpandedNote] = useState<CreatorNote | null>(null);

  // Previous projects state
  const [previousProjects, setPreviousProjects] = useState<Array<{
    id: string;
    course_title: string | null;
    content_path: string | null;
    published_date: string | null;
  }>>([]);

  // Projected date history state
  const [dateHistory, setDateHistory] = useState<Array<{
    id: string;
    old_completion_date: string | null;
    new_completion_date: string | null;
    old_publish_date: string | null;
    new_publish_date: string | null;
    changed_by: string | null;
    changed_by_type: string | null;
    reason: string | null;
    changed_at: string;
    notes: string | null;
  }>>([]);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  const adminEmail = teamMember?.email || '';

  const loadData = useCallback(async () => {
    const data = await getCreatorDashboardData(creatorId);
    if (data) {
      setDashboardData(data);
      setEditedDetails({
        content_path: data.creator.content_path || null,
        course_title: data.creator.course_title || '',
        course_audience: data.creator.course_audience || '',
        target_publish_month: data.creator.target_publish_month || '',
        discount_code: data.creator.discount_code || '',
      });

      // Initialize post-launch notes
      setPostLaunchNotes(data.creator.post_launch_notes || '');

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

    // Load projected date history via API (bypasses RLS)
    try {
      const historyRes = await fetch(`/api/admin/creators/${creatorId}/date-history`)
      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setDateHistory(historyData.history || [])
      }
    } catch {
      // Silently handle — history card will show "no changes"
    }

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

  const handleRequestRevision = (milestoneId: string, milestoneTitle: string) => {
    setSelectedMilestoneForRevision({ id: milestoneId, title: milestoneTitle });
    setRevisionNote('');
    setShowRevisionModal(true);
  };

  const submitRevisionRequest = async () => {
    if (!selectedMilestoneForRevision || !revisionNote.trim()) return;

    setIsRequestingRevision(true);

    try {
      const response = await fetch('/api/admin/request-revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: selectedMilestoneForRevision.id,
          creatorId,
          adminEmail,
          note: revisionNote.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setShowRevisionModal(false);
        setSelectedMilestoneForRevision(null);
        setRevisionNote('');
        await loadData();
        setSuccessMessage(`Revision requested for: ${selectedMilestoneForRevision.title}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`Failed to request revision: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Error requesting revision. Please try again.');
    } finally {
      setIsRequestingRevision(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    setSaveDetailsError(null);
    try {
      console.log('[handleSaveDetails] Saving:', editedDetails);

      // Save each field using the API route
      const fieldsToSave = [
        { field: 'content_path', value: editedDetails.content_path },
        { field: 'course_title', value: editedDetails.course_title },
        { field: 'course_audience', value: editedDetails.course_audience },
        { field: 'target_publish_month', value: editedDetails.target_publish_month },
        { field: 'discount_code', value: editedDetails.discount_code },
      ];

      for (const { field, value } of fieldsToSave) {
        const response = await fetch('/api/admin/update-creator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId,
            field,
            value: value || null,
            adminEmail,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          setSaveDetailsError(result.error || `Failed to save ${field}`);
          return;
        }
      }

      await loadData();
      setIsEditingDetails(false);
      setSuccessMessage('Details saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('[handleSaveDetails] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSaveDetailsError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWebsiteSettings = async () => {
    if (!canEdit) return;
    setIsSavingWebsite(true);
    try {
      // Save each field using the API route
      const fieldsToSave = [
        { field: 'display_on_website', value: websiteSettings.display_on_website },
        { field: 'website_display_name', value: websiteSettings.website_display_name },
        { field: 'website_title', value: websiteSettings.website_title },
        { field: 'website_bio', value: websiteSettings.website_bio },
        { field: 'display_order', value: websiteSettings.display_order },
      ];

      for (const { field, value } of fieldsToSave) {
        const response = await fetch('/api/admin/update-creator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creatorId,
            field,
            value: value ?? null,
            adminEmail,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          console.error(`Failed to save ${field}:`, result.error);
          return;
        }
      }

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

  const handleSaveCreatorField = async (field: string, value: string) => {
    if (!canEdit) return;
    setIsSavingField(true);
    setFieldError(null);
    try {
      const response = await fetch('/api/admin/update-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          field,
          value: value || null,
          adminEmail,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setFieldError(result.error || 'Failed to update');
        return;
      }

      await loadData();
      setEditingField(null);
      setEditFieldValue('');
      setSuccessMessage(`${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} updated!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving field:', error);
      setFieldError('Failed to save changes');
    } finally {
      setIsSavingField(false);
    }
  };

  const startEditingField = (field: string, currentValue: string | null | undefined) => {
    setEditingField(field);
    setEditFieldValue(currentValue || '');
    setFieldError(null);
  };

  const cancelEditingField = () => {
    setEditingField(null);
    setEditFieldValue('');
    setFieldError(null);
  };

  const handleOverrideTargetDate = async () => {
    if (!canEdit || !overrideDate || !overrideReason.trim()) return;
    setIsSavingOverride(true);
    try {
      const response = await fetch('/api/admin/override-target-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          newDate: overrideDate,
          reason: overrideReason.trim(),
          adminEmail,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await loadData();
        setShowOverrideModal(false);
        setOverrideDate('');
        setOverrideReason('');
        setSuccessMessage('Target date updated');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`Failed to override date: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error overriding target date:', error);
      alert('Error overriding target date.');
    } finally {
      setIsSavingOverride(false);
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

  // Handle post-launch notes save
  const handleSavePostLaunchNotes = async () => {
    if (!canEdit) return;
    setIsSavingPostLaunch(true);
    try {
      const response = await fetch('/api/admin/update-post-launch-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          postLaunchNotes: postLaunchNotes.trim() || null,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await loadData();
        setIsEditingPostLaunch(false);
        setSuccessMessage('Post-launch notes saved!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving post-launch notes:', error);
      alert('Error saving post-launch notes.');
    } finally {
      setIsSavingPostLaunch(false);
    }
  };

  // Handle archive/unarchive
  const handleArchiveToggle = async (action: 'archive' | 'unarchive') => {
    if (!canEdit) return;
    setIsArchiving(true);
    try {
      const response = await fetch('/api/admin/archive-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, action }),
      });
      const result = await response.json();
      if (result.success) {
        await loadData();
        setSuccessMessage(action === 'archive' ? 'Creator archived!' : 'Creator restored!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
      alert('Error updating archive status.');
    } finally {
      setIsArchiving(false);
    }
  };

  // Handle start new project
  const handleStartNewProject = async () => {
    if (!canEdit) return;
    setIsStartingNewProject(true);
    try {
      const response = await fetch('/api/admin/start-new-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId }),
      });
      const result = await response.json();
      if (result.success) {
        setShowStartNewProjectModal(false);
        // Redirect to the new project
        window.location.href = `/tdi-admin/creators/${result.newCreator.id}`;
      } else {
        alert(`Failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error starting new project:', error);
      alert('Error starting new project.');
    } finally {
      setIsStartingNewProject(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    // Strip HTML tags to check if there's actual content
    const textContent = newNote.replace(/<[^>]*>/g, '').trim();
    if (!textContent || !canEdit) return;

    setIsAddingNote(true);
    try {
      const response = await fetch('/api/admin/add-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          note: newNote, // Save as HTML
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
              backgroundColor: theme.accent,
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.accent }} />
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
            style={{ color: theme.accent }}
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
            <p className="mt-2 font-medium capitalize" style={{ color: theme.accent }}>
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
                  stroke={theme.accent}
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

      {/* Note: CreatorDashboardHeader removed from admin view to avoid double header
          The "Viewing as" banner below provides sufficient context for admin preview */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content - Milestones */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2
              className="text-xl font-semibold"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              Milestones
            </h2>

            <a
              href={`/creator-portal/dashboard?as_creator=${creatorId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: '#2B3A67' }}
            >
              <ExternalLink className="w-4 h-4" />
              Open Creator Portal
            </a>
          </div>

          {false && (
            <div className="hidden">
              {/* Removed Creator View banner */}
            </div>
          )}

          {/* Admin Helper Text */}
          {canEdit && (
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
          {(() => {
            // Filter phases based on content path
            // Blog: only onboarding, agreement, launch
            // Download: onboarding, agreement, production, launch
            // Course: all phases
            const phasesForPath: Record<string, string[]> = {
              blog: ['onboarding', 'agreement', 'launch'],
              download: ['onboarding', 'agreement', 'production', 'launch'],
              course: ['onboarding', 'agreement', 'course_design', 'test_prep', 'production', 'marketing_blog', 'launch'],
            };
            const allowedPhases = phasesForPath[creator.content_path || 'course'] || phasesForPath.course;
            const filteredPhases = phases.filter((phase) => allowedPhases.includes(phase.id));

            return filteredPhases.map((phase) => {
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
                        // Use context-aware title for content-path-specific milestones
                        const displayTitle = getContextAwareMilestoneTitle(milestone.id, creator.content_path) || milestone.title;

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
                              onClick={() => handleToggleMilestone(milestone.id, displayTitle, milestone.status)}
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
                                  {displayTitle}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                  {config.label}
                                </span>
                              </div>
                              {milestone.description && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {getContextAwareMilestoneDescription(milestone.id, creator.content_path) || milestone.description}
                                </p>
                              )}
                            </div>

                            {/* Actions - Both buttons always appear together for waiting_approval */}
                            {milestone.status === 'waiting_approval' && canEdit && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(milestone.id, displayTitle)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 bg-green-600 text-white hover:bg-green-700"
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
                                <button
                                  onClick={() => handleRequestRevision(milestone.id, displayTitle)}
                                  disabled={isProcessing}
                                  className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 bg-white border border-amber-500 text-amber-600 hover:bg-amber-50"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Request Changes
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {false ? (
            <>
              {/* Creator View Sidebar - mirrors what creators see */}
              <CourseDetailsPanel creator={creator} />
              <NotesPanel
                notes={allNotes.filter(n => n.visible_to_creator)}
                creatorId={creator.id}
                creatorName={creator.name}
              />

              {/* Admin Actions Panel - always accessible */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-5">
                <h3
                  className="font-semibold mb-4 flex items-center gap-2"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
                >
                  <Users className="w-4 h-4" style={{ color: theme.accent }} />
                  Admin Actions
                </h3>
                <div className="space-y-3">
                  {/* Quick Edit Button */}
                  {canEdit && (
                    <button
                      onClick={() => {
                        setIsEditingDetails(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                      style={{ color: '#2B3A67' }}
                    >
                      <PenLine className="w-4 h-4" />
                      Edit {getContentLabels(creator.content_path).panelTitle}
                    </button>
                  )}

                  {/* Publish Actions */}
                  {canEdit && creator.publish_status !== 'published' && (
                    <button
                      onClick={() => setShowPublishModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
                    >
                      <Rocket className="w-4 h-4" />
                      {creator.publish_status === 'scheduled' ? 'Change Schedule' : 'Publish'}
                    </button>
                  )}

                  {/* Add Note */}
                  {canEdit && (
                    <button
                      onClick={() => {}}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                      style={{ color: '#2B3A67' }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
          {/* Details Card - context-aware based on content path */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                {getContentLabels(creator.content_path).panelTitle}
              </h3>
              {canEdit && !isEditingDetails && (
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="text-sm hover:opacity-80"
                  style={{ color: theme.accent }}
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
                  <label className="block text-sm text-gray-600 mb-1">{getContentLabels(editedDetails.content_path).titleLabel}</label>
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
                  <label className="block text-sm text-gray-600 mb-1">{getContentLabels(editedDetails.content_path).launchLabel}</label>
                  <div className="flex gap-2 w-full">
                    <select
                      value={editedDetails.target_publish_month?.split(' ')[0] || ''}
                      onChange={(e) => {
                        const currentYear = editedDetails.target_publish_month?.split(' ')[1] || new Date().getFullYear().toString();
                        const newValue = e.target.value ? `${e.target.value} ${currentYear}` : '';
                        setEditedDetails({ ...editedDetails, target_publish_month: newValue });
                      }}
                      className="flex-1 border border-gray-200 rounded-lg p-3 text-sm bg-white"
                    >
                      <option value="">Month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                    <select
                      value={editedDetails.target_publish_month?.split(' ')[1] || ''}
                      onChange={(e) => {
                        const currentMonth = editedDetails.target_publish_month?.split(' ')[0] || '';
                        const newValue = e.target.value ? `${currentMonth || 'January'} ${e.target.value}` : '';
                        setEditedDetails({ ...editedDetails, target_publish_month: newValue });
                      }}
                      className="flex-1 border border-gray-200 rounded-lg p-3 text-sm bg-white"
                    >
                      <option value="">Year</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                    </select>
                  </div>
                </div>
                {saveDetailsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {saveDetailsError}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsEditingDetails(false);
                      setSaveDetailsError(null);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDetails}
                    disabled={isSaving}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                    style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
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
                  <p className="text-gray-500">{getContentLabels(creator.content_path).titleLabel}</p>
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
                  <p className="text-gray-500">{getContentLabels(creator.content_path).launchLabel}</p>
                  <p className="font-medium" style={{ color: '#2B3A67' }}>
                    {creator.target_publish_month || 'Not set'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Creator Settings Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                <Settings className="w-4 h-4" style={{ color: theme.accent }} />
                Creator Settings
              </h3>
              {isSettingsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {isSettingsExpanded && (
              <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                {/* Email Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </label>
                    {editingField !== 'email' && canEdit && (
                      <button
                        onClick={() => startEditingField('email', creator.email)}
                        className="text-xs text-[#1e2749] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingField === 'email' ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={editFieldValue}
                        onChange={(e) => setEditFieldValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2749] focus:border-transparent"
                        placeholder="email@example.com"
                      />
                      {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveCreatorField('email', editFieldValue)}
                          disabled={isSavingField}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#1e2749] hover:bg-[#2a3558] disabled:opacity-50"
                        >
                          {isSavingField ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditingField}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: '#2B3A67' }}>
                      {creator.email}
                    </p>
                  )}
                </div>

                {/* Name Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Name
                    </label>
                    {editingField !== 'name' && canEdit && (
                      <button
                        onClick={() => startEditingField('name', creator.name)}
                        className="text-xs text-[#1e2749] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingField === 'name' ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editFieldValue}
                        onChange={(e) => setEditFieldValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2749] focus:border-transparent"
                        placeholder="Creator name"
                      />
                      {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveCreatorField('name', editFieldValue)}
                          disabled={isSavingField}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#1e2749] hover:bg-[#2a3558] disabled:opacity-50"
                        >
                          {isSavingField ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditingField}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: '#2B3A67' }}>
                      {creator.name}
                    </p>
                  )}
                </div>

                {/* Content Path Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      Content Path
                    </label>
                    {editingField !== 'content_path' && canEdit && (
                      <button
                        onClick={() => startEditingField('content_path', creator.content_path || '')}
                        className="text-xs text-[#1e2749] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingField === 'content_path' ? (
                    <div className="space-y-2">
                      <select
                        value={editFieldValue}
                        onChange={(e) => setEditFieldValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2749] focus:border-transparent"
                      >
                        <option value="">Not set</option>
                        <option value="blog">Blog Post</option>
                        <option value="download">Digital Download</option>
                        <option value="course">Learning Hub Course</option>
                      </select>
                      {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveCreatorField('content_path', editFieldValue)}
                          disabled={isSavingField}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#1e2749] hover:bg-[#2a3558] disabled:opacity-50"
                        >
                          {isSavingField ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditingField}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: '#2B3A67' }}>
                      {creator.content_path === 'blog' ? 'Blog Post' :
                       creator.content_path === 'download' ? 'Digital Download' :
                       creator.content_path === 'course' ? 'Learning Hub Course' : 'Not set'}
                    </p>
                  )}
                </div>

                {/* Status Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Status
                    </label>
                    {editingField !== 'status' && canEdit && (
                      <button
                        onClick={() => startEditingField('status', creator.status)}
                        className="text-xs text-[#1e2749] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingField === 'status' ? (
                    <div className="space-y-2">
                      <select
                        value={editFieldValue}
                        onChange={(e) => setEditFieldValue(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2749] focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                      {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveCreatorField('status', editFieldValue)}
                          disabled={isSavingField}
                          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#1e2749] hover:bg-[#2a3558] disabled:opacity-50"
                        >
                          {isSavingField ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEditingField}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-medium capitalize" style={{ color: '#2B3A67' }}>
                      {creator.status}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  Changes are logged automatically for audit purposes.
                </p>
              </div>
            )}
          </div>

          {/* Publish Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                <Globe className="w-4 h-4" style={{ color: theme.accent }} />
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
                      style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
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

              {/* Post-Launch Notes (for published creators) */}
              {creator.publish_status === 'published' && canEdit && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700">Post-Launch Follow-up</p>
                    {!isEditingPostLaunch && (
                      <button
                        onClick={() => setIsEditingPostLaunch(true)}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        {creator.post_launch_notes ? 'Edit' : 'Add note'}
                      </button>
                    )}
                  </div>
                  {isEditingPostLaunch ? (
                    <div className="space-y-2">
                      <textarea
                        value={postLaunchNotes}
                        onChange={(e) => setPostLaunchNotes(e.target.value)}
                        placeholder="e.g., Blog in editing with team..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded resize-none"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSavePostLaunchNotes}
                          disabled={isSavingPostLaunch}
                          className="flex-1 px-2 py-1 text-xs font-medium rounded text-white"
                          style={{ backgroundColor: theme.accent }}
                        >
                          {isSavingPostLaunch ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setPostLaunchNotes(creator.post_launch_notes || '');
                            setIsEditingPostLaunch(false);
                          }}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : creator.post_launch_notes ? (
                    <p className="text-sm text-amber-700 bg-amber-50 px-2 py-1.5 rounded">
                      {creator.post_launch_notes}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No follow-up items</p>
                  )}
                </div>
              )}

              {/* Archive Actions */}
              {canEdit && creator.publish_status === 'published' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {creator.status === 'archived' ? (
                    <button
                      onClick={() => handleArchiveToggle('unarchive')}
                      disabled={isArchiving}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArchiveRestore className="w-4 h-4" />}
                      Restore from Archive
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowStartNewProjectModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
                      >
                        <Sparkles className="w-4 h-4" />
                        Start New Project
                      </button>
                      <button
                        onClick={() => handleArchiveToggle('archive')}
                        disabled={isArchiving}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {isArchiving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Archive className="w-3 h-3" />}
                        Archive Only
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Previous Projects Card */}
          {creator.previous_project_id && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3
                className="font-semibold flex items-center gap-2 mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                <History className="w-4 h-4" style={{ color: theme.accent }} />
                Previous Projects
              </h3>
              <div className="text-sm">
                <Link
                  href={`/tdi-admin/creators/${creator.previous_project_id}`}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  View previous project
                </Link>
              </div>
            </div>
          )}

          {/* Projected Date History Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-semibold flex items-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                <CalendarDays className="w-4 h-4" style={{ color: theme.accent }} />
                Projected Date History
              </h3>
              {canEdit && (
                <button
                  onClick={() => {
                    setOverrideDate((creator as any).projected_completion_date || '');
                    setOverrideReason('');
                    setShowOverrideModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  style={{ color: '#2B3A67' }}
                >
                  Override date
                </button>
              )}
            </div>

            {/* Current state */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Target completion</div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: '#2B3A67' }}>
                    {(creator as any).projected_completion_date
                      ? new Date((creator as any).projected_completion_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last updated</div>
                  <div className="text-sm mt-0.5 text-gray-700">
                    {(creator as any).projected_date_set_at ? (
                      <>
                        {(() => {
                          const diff = Date.now() - new Date((creator as any).projected_date_set_at).getTime();
                          const days = Math.floor(diff / 86400000);
                          if (days === 0) return 'Today';
                          if (days === 1) return 'Yesterday';
                          if (days < 30) return `${days} days ago`;
                          return `${Math.floor(days / 30)} months ago`;
                        })()}
                        {(creator as any).projected_date_set_by && (
                          <span className="text-gray-500">
                            {' by '}
                            {(creator as any).projected_date_set_by.startsWith('admin:')
                              ? (creator as any).projected_date_set_by.replace('admin:', '').split('@')[0]
                              : (creator as any).projected_date_set_by.includes('@')
                                ? 'creator'
                                : (creator as any).projected_date_set_by}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">Never</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Frequent-changes callout */}
            {(() => {
              const thirtyDaysAgo = Date.now() - 30 * 86400000;
              const recentChanges = dateHistory.filter(h => new Date(h.changed_at).getTime() > thirtyDaysAgo);
              if (recentChanges.length >= 3) {
                return (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4">
                    <p className="text-xs text-amber-800">
                      This creator has updated their date {recentChanges.length} times in the last 30 days. Consider checking in to see if they need support.
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* History table */}
            {dateHistory.length === 0 ? (
              <p className="text-sm text-gray-400">No date changes recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-3 font-medium text-gray-500 uppercase tracking-wide">Changed</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-500 uppercase tracking-wide">Date set to</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-500 uppercase tracking-wide">By</th>
                      <th className="text-left py-2 font-medium text-gray-500 uppercase tracking-wide">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateHistory.map((entry) => {
                      const setBy = entry.changed_by || '';
                      const isAdmin = setBy.startsWith('admin:');
                      const isSystemEstimate = setBy === 'system-estimate' || entry.changed_by_type === 'system-estimate';
                      const isSystem = setBy === 'system' || setBy.startsWith('system') || entry.changed_by_type === 'system';
                      const displayName = isAdmin
                        ? setBy.replace('admin:', '').split('@')[0]
                        : setBy.includes('@')
                          ? setBy.split('@')[0]
                          : setBy;

                      return (
                        <tr key={entry.id} className="border-b border-gray-50">
                          <td className="py-2 pr-3 text-gray-600">
                            {new Date(entry.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-2 pr-3 font-medium" style={{ color: '#2B3A67' }}>
                            {entry.new_completion_date
                              ? new Date(entry.new_completion_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'Cleared'}
                          </td>
                          <td className="py-2 pr-3 text-gray-600">{displayName}</td>
                          <td className="py-2">
                            {isAdmin && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                Admin override
                              </span>
                            )}
                            {isSystemEstimate && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                Auto-estimated
                              </span>
                            )}
                            {isSystem && !isSystemEstimate && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                System
                              </span>
                            )}
                            {!isAdmin && !isSystem && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
                                Creator
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Show notes for entries that have them */}
            {dateHistory.some(h => h.notes) && (
              <div className="mt-3 space-y-1">
                {dateHistory.filter(h => h.notes).map(entry => (
                  <div key={entry.id} className="text-xs text-gray-500 italic">
                    {new Date(entry.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {entry.notes}
                  </div>
                ))}
              </div>
            )}
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
                <RichTextEditor
                  content={newNote}
                  onChange={setNewNote}
                  placeholder="Add a note..."
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
                    disabled={!newNote.replace(/<[^>]*>/g, '').trim() || isAddingNote}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg disabled:opacity-50 flex items-center gap-1"
                    style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
                  >
                    {isAddingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes List - Truncated preview with "Read more" */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {allNotes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet</p>
              ) : (
                allNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg ${
                      note.visible_to_creator ? 'bg-gray-50' : 'bg-amber-50 border border-amber-200'
                    }`}
                  >
                    <NotePreview
                      content={note.content}
                      maxLines={3}
                      onReadMore={() => setExpandedNote(note)}
                    />
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
                  style={{ color: theme.accent }}
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
                    style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
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

            </>
          )}
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
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <Rocket size={24} style={{ color: theme.accent }} />
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
                        ? 'border-[#8B5CF6] bg-[#EDE9FE]'
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
                      style={{ backgroundColor: publishAction === 'publish_now' ? theme.accent : '#F3F4F6' }}
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
                        ? 'border-[#8B5CF6] bg-[#EDE9FE]'
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
                      style={{ backgroundColor: publishAction === 'schedule' ? theme.accent : '#F3F4F6' }}
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]"
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
                style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
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

      {/* Start New Project Modal */}
      {showStartNewProjectModal && (
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
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <Sparkles size={24} style={{ color: theme.accent }} />
                </div>
                <div>
                  <h2
                    className="font-bold text-lg"
                    style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: '#2B3A67' }}
                  >
                    Start a New Project
                  </h2>
                  <p className="text-sm text-gray-500">
                    Ready to create something new?
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-purple-800">
                  This will archive <strong>{creator.name}</strong>&apos;s current project
                  {creator.course_title && <> ({creator.course_title})</>} and create a fresh
                  project with the same profile info.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Profile info (name, email, bio) will be carried over
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Fresh milestones starting from content path selection
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  Current project fully preserved in archive
                </li>
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowStartNewProjectModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartNewProject}
                disabled={isStartingNewProject}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.accent, color: '#2B3A67' }}
              >
                {isStartingNewProject ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Start New Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && selectedMilestoneForRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Request Changes</h3>
              <p className="text-sm text-gray-500 mt-1">
                Send &quot;{selectedMilestoneForRevision.title}&quot; back for revision
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback for Creator
                </label>
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="What changes are needed? Be specific so the creator knows what to fix..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>
              <p className="text-xs text-gray-500">
                The creator will receive an email with your feedback and the milestone will be marked for revision.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setSelectedMilestoneForRevision(null);
                  setRevisionNote('');
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRevisionRequest}
                disabled={!revisionNote.trim() || isRequestingRevision}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRequestingRevision ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Request Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Date Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Override target date</h3>
              <p className="text-sm text-gray-500 mt-1">
                Set a new target completion date for {creator?.name || 'this creator'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New target date
                </label>
                <input
                  type="date"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you overriding?
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Creator requested extension due to schedule conflict..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowOverrideModal(false);
                  setOverrideDate('');
                  setOverrideReason('');
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideTargetDate}
                disabled={!overrideDate || !overrideReason.trim() || isSavingOverride}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.accent }}
              >
                {isSavingOverride ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4" />
                    Save override
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Read More Modal - Admin view (no reply button) */}
      {expandedNote && (
        <NoteModal
          note={expandedNote}
          creatorId={creatorId}
          creatorName={creator?.name || ''}
          onClose={() => setExpandedNote(null)}
          showReplyButton={false}
        />
      )}

    </div>
  );
}
