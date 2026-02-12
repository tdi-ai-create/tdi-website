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
} from 'lucide-react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission, hasPermission } from '@/lib/tdi-admin/permissions';
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
    color: 'text-[#E8B84B]',
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
              backgroundColor: '#E8B84B',
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#E8B84B' }} />
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
            style={{ color: '#E8B84B' }}
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
            <p className="text-white/70">{creator.email}</p>
            <p className="mt-2 font-medium capitalize" style={{ color: '#E8B84B' }}>
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
                  stroke="#E8B84B"
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
                                style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
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
                  style={{ color: '#E8B84B' }}
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
                    style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
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
                    style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
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
        </div>
      </div>
    </div>
  );
}
