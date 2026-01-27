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
  Info,
  RotateCcw,
  X,
  Unlock,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { supabase } from '@/lib/supabase';
import {
  isAdmin,
  getCreatorDashboardData,
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
  { icon: typeof Check; color: string; bg: string; label: string; tooltip: string }
> = {
  completed: {
    icon: Check,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Completed',
    tooltip: 'This step has been finished successfully',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'In Progress',
    tooltip: 'The creator is currently working on this step',
  },
  waiting_approval: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    label: 'Waiting Approval',
    tooltip: 'The creator has completed this step and is waiting for your review',
  },
  available: {
    icon: Circle,
    color: 'text-[#80a4ed]',
    bg: 'bg-blue-50',
    label: 'Available',
    tooltip: 'Ready for action - either by the creator or the TDI team',
  },
  locked: {
    icon: Lock,
    color: 'text-gray-400',
    bg: 'bg-gray-100',
    label: 'Locked',
    tooltip: 'Previous steps must be completed before this unlocks',
  },
};

// Phase descriptions for admin context
const phaseDescriptions: Record<string, string> = {
  onboarding: 'Getting the creator set up and aligned with TDI\'s process. Review their intake form and schedule a kickoff meeting.',
  agreement: 'Formalizing the partnership. Send the agreement and ensure it\'s signed before moving forward.',
  course_design: 'Collaborating on course structure. Review outlines and provide feedback during milestone meetings.',
  production: 'The creator is building their course. Review test videos and provide editing support as needed.',
  launch: 'Final preparations for publishing. Create marketing materials and coordinate the launch date.',
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

  // Revision request state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [selectedMilestoneForRevision, setSelectedMilestoneForRevision] = useState<{id: string; title: string} | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

  // Reopen milestone state
  const [reopeningMilestone, setReopeningMilestone] = useState<string | null>(null);

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
        setSuccessMessage(`Approved: ${milestoneTitle} (creator notified)`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.error('Approve failed:', result);
        alert(`Failed to approve milestone: ${result.error || 'Unknown error'}`);
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

  const handleReopen = async (milestoneId: string, milestoneTitle: string) => {
    if (!confirm('Are you sure you want to reopen this milestone? The creator will need to complete it again.')) {
      return;
    }

    setReopeningMilestone(milestoneId);

    try {
      const response = await fetch('/api/admin/reopen-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          creatorId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadData();
        setSuccessMessage(`Reopened: ${milestoneTitle}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert('Failed to reopen: ' + data.error);
      }
    } catch (error) {
      console.error('Error reopening milestone:', error);
      alert('Error reopening milestone');
    } finally {
      setReopeningMilestone(null);
    }
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
                onRequestRevision={handleRequestRevision}
                onReopen={handleReopen}
                approvingMilestoneId={approvingMilestoneId}
                reopeningMilestone={reopeningMilestone}
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

      {/* Revision Request Modal */}
      {showRevisionModal && selectedMilestoneForRevision && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1e2749]">Request Revision</h3>
                <p className="text-sm text-gray-500 mt-1">
                  For: {selectedMilestoneForRevision.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setSelectedMilestoneForRevision(null);
                  setRevisionNote('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              This will move the creator back to this step. They&apos;ll receive an email with your feedback.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What needs to be revised? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Please re-record your test video with better lighting..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setSelectedMilestoneForRevision(null);
                  setRevisionNote('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRevisionRequest}
                disabled={!revisionNote.trim() || isRequestingRevision}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isRequestingRevision ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Send Request
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

function PhaseSection({
  phase,
  isExpanded,
  onToggle,
  onApprove,
  onRequestRevision,
  onReopen,
  approvingMilestoneId,
  reopeningMilestone,
}: {
  phase: PhaseWithMilestones;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: (milestoneId: string, milestoneTitle: string) => void;
  onRequestRevision: (milestoneId: string, milestoneTitle: string) => void;
  onReopen: (milestoneId: string, milestoneTitle: string) => void;
  approvingMilestoneId: string | null;
  reopeningMilestone: string | null;
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
        <div className="border-t border-gray-100">
          {/* Phase description */}
          {phaseDescriptions[phase.id] && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm text-gray-600">{phaseDescriptions[phase.id]}</p>
            </div>
          )}
          <div className="divide-y divide-gray-100">
            {phase.milestones.map((milestone) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const m = milestone as any;
              const milestoneTitle = m.title || m.name || m.admin_description || `Milestone`;
              return (
                <MilestoneRow
                  key={milestone.id}
                  milestone={milestone}
                  onApprove={() => onApprove(milestone.id, milestoneTitle)}
                  onRequestRevision={() => onRequestRevision(milestone.id, milestoneTitle)}
                  onReopen={() => onReopen(milestone.id, milestoneTitle)}
                  isApproving={approvingMilestoneId === milestone.id}
                  isReopening={reopeningMilestone === milestone.id}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneRow({
  milestone,
  onApprove,
  onRequestRevision,
  onReopen,
  isApproving,
  isReopening,
}: {
  milestone: MilestoneWithStatus;
  onApprove: () => void;
  onRequestRevision: () => void;
  onReopen: () => void;
  isApproving: boolean;
  isReopening: boolean;
}) {
  const config = statusConfig[milestone.status];
  const Icon = config.icon;
  const canApprove =
    milestone.requires_team_action &&
    (milestone.status === 'available' ||
      milestone.status === 'in_progress' ||
      milestone.status === 'waiting_approval');

  // Handle different possible field names for milestone title and description
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = milestone as any;
  const milestoneTitle = m.title || m.name || `Milestone ${milestone.id.slice(0, 8)}`;
  const adminDescription = m.admin_description || m.description || null;
  const creatorDescription = m.creator_description || null;

  return (
    <div className="px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center mt-0.5`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-medium ${
              milestone.status === 'locked' ? 'text-gray-400' : 'text-[#1e2749]'
            }`}>
              {milestoneTitle}
            </p>
            {adminDescription && (
              <p className="text-sm text-gray-500 mt-1">{adminDescription}</p>
            )}
            {creatorDescription && creatorDescription !== adminDescription && (
              <p className="text-xs text-gray-400 mt-1 italic">
                Creator sees: {creatorDescription}
              </p>
            )}
            {milestone.requires_team_action && milestone.status !== 'completed' && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Team action required
                </span>
                <Tooltip content="This milestone requires TDI team review or action before the creator can proceed." position="right">
                  <Info className="w-3.5 h-3.5 text-amber-400 cursor-help" />
                </Tooltip>
              </div>
            )}
            {/* Show submission indicator when waiting for approval */}
            {milestone.status === 'waiting_approval' && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Creator submitted - awaiting your review
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Click &quot;Approve&quot; to complete this milestone and notify the creator.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip content={config.tooltip} position="left">
            <span className={`text-xs px-2 py-1 rounded-full cursor-help ${config.bg} ${config.color}`}>
              {config.label}
            </span>
          </Tooltip>
          {canApprove && (
            <>
              <Tooltip content="Mark this step as complete and unlock the next step. The creator will receive an email notification." position="left">
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
              </Tooltip>
              <Tooltip content="Send this back to the creator with feedback for revision." position="left">
                <button
                  onClick={onRequestRevision}
                  disabled={isApproving}
                  className="inline-flex items-center gap-1 bg-white border border-amber-500 text-amber-600 px-3 py-1.5 rounded-lg text-sm hover:bg-amber-50 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revise
                </button>
              </Tooltip>
            </>
          )}
          {milestone.status === 'completed' && (
            <div className="flex items-center gap-2">
              <Tooltip content="Quietly reopen this milestone so the creator can redo it (no email sent)." position="left">
                <button
                  onClick={onReopen}
                  disabled={isReopening}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors disabled:opacity-50"
                  title="Reopen this milestone"
                >
                  {isReopening ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
              </Tooltip>
              <Tooltip content="Send this back to the creator with feedback for revision (sends email)." position="left">
                <button
                  onClick={onRequestRevision}
                  className="inline-flex items-center gap-1 text-amber-600 hover:bg-amber-50 px-2 py-1 rounded text-xs transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Request Revision
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
