'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  isAdmin,
  getCreatorDashboardData,
  updateMilestoneStatus,
  updateCreator,
  addNote,
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
    color: 'text-[#80a4ed]',
    bg: 'bg-blue-50',
    label: 'Available',
  },
  locked: {
    icon: Lock,
    color: 'text-gray-400',
    bg: 'bg-gray-100',
    label: 'Locked',
  },
};

export default function AdminCreatorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const creatorId = params.id as string;

  const [dashboardData, setDashboardData] = useState<CreatorDashboardData | null>(null);
  const [allNotes, setAllNotes] = useState<CreatorNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [approvingMilestoneId, setApprovingMilestoneId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');

  // Course details editing
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
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

  const loadData = useCallback(async () => {
    const data = await getCreatorDashboardData(creatorId);
    if (data) {
      setDashboardData(data);
      setEditedDetails({
        course_title: data.creator.course_title || '',
        course_audience: data.creator.course_audience || '',
        target_launch_month: data.creator.target_launch_month || '',
        discount_code: data.creator.discount_code || '',
      });

      // Expand current phase by default
      setExpandedPhases(new Set([data.creator.current_phase]));
    }

    // Get all notes including internal ones
    const notes = await getCreatorNotes(creatorId, true);
    setAllNotes(notes);

    setIsLoading(false);
  }, [creatorId]);

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
      await loadData();
    };

    checkAuth();
  }, [router, loadData]);

  const handleApprove = async (milestoneId: string, milestoneTitle: string) => {
    if (!dashboardData) return;

    setApprovingMilestoneId(milestoneId);
    try {
      const success = await updateMilestoneStatus(
        creatorId,
        milestoneId,
        'completed',
        adminEmail
      );

      if (success) {
        await loadData();
        setSuccessMessage(`Approved: ${milestoneTitle}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert('Failed to approve milestone. Please try again.');
      }
    } catch (error) {
      console.error('Error approving milestone:', error);
      alert('Error approving milestone. Please try again.');
    } finally {
      setApprovingMilestoneId(null);
    }
  };

  const handleSaveDetails = async () => {
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
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      await addNote({
        creator_id: creatorId,
        note: newNote.trim(),
        created_by: adminEmail,
        visible_to_creator: noteVisibleToCreator,
      });

      setNewNote('');
      const notes = await getCreatorNotes(creatorId, true);
      setAllNotes(notes);
    } catch (error) {
      console.error('Error adding note:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading creator details...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Creator not found.</p>
          <Link href="/admin/creators" className="text-[#80a4ed] hover:underline mt-2 inline-block">
            Back to creators
          </Link>
        </div>
      </div>
    );
  }

  const { creator, phases, progressPercentage, completedMilestones, totalMilestones } = dashboardData;

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
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Back link */}
        <Link
          href="/admin/creators"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1e2749] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to creators
        </Link>

        {/* Creator header */}
        <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{creator.name}</h1>
              <p className="text-white/70 mt-1">{creator.email}</p>
              <p className="text-[#ffba06] mt-2 font-medium capitalize">
                Current Phase: {creator.current_phase.replace('_', ' ')}
              </p>
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
                    stroke="#ffba06"
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
            <h2 className="text-xl font-semibold text-[#1e2749]">Milestones</h2>

            {/* Success message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}

            {phases.map((phase) => (
              <PhaseSection
                key={phase.id}
                phase={phase}
                isExpanded={expandedPhases.has(phase.id)}
                onToggle={() => togglePhase(phase.id)}
                onApprove={handleApprove}
                approvingMilestoneId={approvingMilestoneId}
              />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1e2749]">Course Details</h3>
                {!isEditingDetails ? (
                  <button
                    onClick={() => setIsEditingDetails(true)}
                    className="text-sm text-[#80a4ed] hover:text-[#1e2749]"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingDetails(false)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDetails}
                      disabled={isSaving}
                      className="text-sm text-[#80a4ed] hover:text-[#1e2749] flex items-center gap-1"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Save
                    </button>
                  </div>
                )}
              </div>

              {isEditingDetails ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      value={editedDetails.course_title}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, course_title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={editedDetails.course_audience}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, course_audience: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Target Launch Month
                    </label>
                    <input
                      type="text"
                      value={editedDetails.target_launch_month}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, target_launch_month: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">
                      Discount Code
                    </label>
                    <input
                      type="text"
                      value={editedDetails.discount_code}
                      onChange={(e) =>
                        setEditedDetails({ ...editedDetails, discount_code: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Course Title</p>
                    <p className={creator.course_title ? 'text-[#1e2749] font-medium' : 'text-gray-400 italic'}>
                      {creator.course_title || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Target Audience</p>
                    <p className={creator.course_audience ? 'text-[#1e2749]' : 'text-gray-400 italic'}>
                      {creator.course_audience || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Target Launch</p>
                    <p className={creator.target_launch_month ? 'text-[#1e2749]' : 'text-gray-400 italic'}>
                      {creator.target_launch_month || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Discount Code</p>
                    <p className={creator.discount_code ? 'text-[#1e2749] font-mono bg-[#ffba06]/20 px-2 py-1 rounded inline-block' : 'text-gray-400 italic'}>
                      {creator.discount_code || 'Not set'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Add Note */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1e2749] mb-4">Add Note</h3>
              <form onSubmit={handleAddNote}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note for this creator..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteVisibleToCreator}
                      onChange={(e) => setNoteVisibleToCreator(e.target.checked)}
                      className="rounded border-gray-300 text-[#80a4ed] focus:ring-[#80a4ed]"
                    />
                    {noteVisibleToCreator ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Visible to creator
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Internal only
                      </>
                    )}
                  </label>
                  <button
                    type="submit"
                    disabled={isAddingNote || !newNote.trim()}
                    className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#2a3459] transition-colors disabled:opacity-50"
                  >
                    {isAddingNote ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add
                  </button>
                </div>
              </form>
            </div>

            {/* Notes History */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-[#1e2749] mb-4">Notes History</h3>
              {allNotes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No notes yet.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg text-sm border-l-4 ${
                        note.visible_to_creator
                          ? 'bg-blue-50 border-[#80a4ed]'
                          : 'bg-gray-50 border-gray-400'
                      }`}
                    >
                      <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          {note.visible_to_creator ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {note.created_by}
                        </span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PhaseSection({
  phase,
  isExpanded,
  onToggle,
  onApprove,
  approvingMilestoneId,
}: {
  phase: PhaseWithMilestones;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: (milestoneId: string, milestoneTitle: string) => void;
  approvingMilestoneId: string | null;
}) {
  const completedCount = phase.milestones.filter((m) => m.status === 'completed').length;

  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${
      phase.isCurrentPhase ? 'border-[#80a4ed] shadow-sm' : 'border-gray-200'
    }`}>
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
            phase.isComplete ? 'bg-green-500' : phase.isCurrentPhase ? 'bg-[#80a4ed]' : 'bg-gray-400'
          }`}>
            {phase.isComplete ? <Check className="w-4 h-4" /> : phase.sort_order + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1e2749]">{phase.name}</h3>
              {phase.isCurrentPhase && (
                <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {completedCount} / {phase.milestones.length} completed
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {phase.milestones.map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              onApprove={() => onApprove(milestone.id, milestone.title)}
              isApproving={approvingMilestoneId === milestone.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MilestoneRow({
  milestone,
  onApprove,
  isApproving,
}: {
  milestone: MilestoneWithStatus;
  onApprove: () => void;
  isApproving: boolean;
}) {
  const config = statusConfig[milestone.status];
  const Icon = config.icon;
  const canApprove =
    milestone.requires_team_action &&
    (milestone.status === 'available' ||
      milestone.status === 'in_progress' ||
      milestone.status === 'waiting_approval');

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="min-w-0">
          <p className={`font-medium truncate ${
            milestone.status === 'locked' ? 'text-gray-400' : 'text-[#1e2749]'
          }`}>
            {milestone.title}
          </p>
          {milestone.requires_team_action && milestone.status !== 'completed' && (
            <p className="text-xs text-[#ffba06]">Team action required</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        {canApprove && (
          <button
            onClick={onApprove}
            disabled={isApproving}
            className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isApproving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
