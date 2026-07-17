'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Send,
  MessageCircle,
  Phone,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  milestone_record_id: string;
  submission_version: number;
  submitted_value: string | null;
  submission_notes: string | null;
  submitted_at: string | null;
  feedback_content: string | null;
  feedback_draft_status: string | null;
  feedback_approved_at: string | null;
  visible_to_creator: boolean;
  call_requested: boolean;
  call_requested_at: string | null;
  milestone_title?: string;
  creator_milestones?: {
    id: string;
    milestone_id: string;
    status: string;
    review_status: string;
  };
}

interface SubmissionFormProps {
  milestoneRecordId: string;
  milestoneTitle: string;
  previousSubmission?: string;
  previousNotes?: string;
  onSubmit: (value: string, notes: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function SubmissionForm({
  milestoneTitle,
  previousSubmission,
  previousNotes,
  onSubmit,
  onCancel,
  isSubmitting,
}: SubmissionFormProps) {
  const [value, setValue] = useState(previousSubmission || '');
  const [notes, setNotes] = useState(previousNotes || '');

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-[#1e2749]">
          {previousSubmission ? 'Revise & Resubmit' : 'Submit Deliverable'}
        </h4>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-3">{milestoneTitle}</p>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deliverable (link, description, or text)
          </label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste a link to your work, or describe what you've completed..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e2749]/20 focus:border-[#1e2749] resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any context or questions for the review team..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e2749]/20 focus:border-[#1e2749] resize-none"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onSubmit(value, notes)}
            disabled={!value.trim() || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1e2749' }}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedbackCard({
  item,
  onRequestCall,
  isRequestingCall,
}: {
  item: FeedbackItem;
  onRequestCall: (feedbackId: string) => Promise<void>;
  isRequestingCall: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    pending_review: { label: 'Under Review', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
    approved: { label: 'Feedback Ready', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: Check },
    rejected: { label: 'Under Review', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  };

  const status = statusConfig[item.feedback_draft_status as keyof typeof statusConfig] || statusConfig.pending_review;
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-xl border ${status.border} ${status.bg} overflow-hidden transition-all`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusIcon className={`w-4 h-4 ${status.color}`} />
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
              <span className="text-xs text-gray-400">Version {item.submission_version}</span>
            </div>
            {item.feedback_content && item.visible_to_creator && (
              <div className="mt-3 bg-white rounded-lg border border-gray-100 p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Feedback from your team:</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {item.feedback_content}
                </p>
                {item.feedback_approved_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.feedback_approved_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            )}
            {!item.feedback_content && (
              <p className="text-sm text-gray-500 mt-1">Your submission is being reviewed. We&apos;ll have feedback for you soon.</p>
            )}
          </div>
          {item.submitted_value && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {expanded && item.submitted_value && (
          <div className="mt-3 pt-3 border-t border-gray-200/50">
            <p className="text-xs font-medium text-gray-500 mb-1">What you submitted:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.submitted_value}</p>
            {item.submission_notes && (
              <>
                <p className="text-xs font-medium text-gray-500 mt-2 mb-1">Your notes:</p>
                <p className="text-sm text-gray-600 italic">{item.submission_notes}</p>
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        {item.visible_to_creator && item.feedback_content && (
          <div className="mt-3 flex items-center gap-2">
            {!item.call_requested ? (
              <button
                onClick={() => onRequestCall(item.id)}
                disabled={isRequestingCall}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Phone className="w-3.5 h-3.5" />
                {isRequestingCall ? 'Requesting...' : 'Request a Call'}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg">
                <Phone className="w-3.5 h-3.5" />
                Call Requested
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface MilestoneForSubmission {
  progress_id: string;
  id: string;
  title: string;
  status: string;
  review_status?: string;
}

export function FeedbackPortal({
  creatorId,
  milestones,
  onRefresh,
}: {
  creatorId: string;
  milestones: MilestoneForSubmission[];
  onRefresh?: () => void;
}) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingFor, setSubmittingFor] = useState<MilestoneForSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestingCallFor, setRequestingCallFor] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const loadFeedback = useCallback(async () => {
    try {
      const res = await fetch(`/api/creator-portal/my-feedback?creator_id=${creatorId}`);
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedback || []);
      }
    } catch (err) {
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleSubmit = async (value: string, notes: string) => {
    if (!submittingFor) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/creator-portal/submit-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone_record_id: submittingFor.progress_id,
          submitted_value: value,
          submission_notes: notes,
        }),
      });
      if (res.ok) {
        setSubmittingFor(null);
        await loadFeedback();
        onRefresh?.();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit');
      }
    } catch (err) {
      console.error('Error submitting:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCall = async (feedbackId: string) => {
    setRequestingCallFor(feedbackId);
    try {
      const res = await fetch('/api/creator-portal/request-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_id: feedbackId }),
      });
      if (res.ok) {
        await loadFeedback();
      }
    } catch (err) {
      console.error('Error requesting call:', err);
    } finally {
      setRequestingCallFor(null);
    }
  };

  // Get milestones that can be submitted
  const submittable = milestones.filter(
    m => m.status === 'available' || m.status === 'in_progress'
  );

  // Get milestones that are waiting for review
  const waitingReview = milestones.filter(
    m => m.status === 'waiting_approval'
  );

  // Only show if there's feedback or submittable milestones
  const hasContent = feedback.length > 0 || submittable.length > 0 || waitingReview.length > 0;
  if (!hasContent && !loading) return null;

  // Group feedback by milestone
  const feedbackByMilestone: Record<string, FeedbackItem[]> = {};
  for (const f of feedback) {
    const key = f.milestone_record_id;
    if (!feedbackByMilestone[key]) feedbackByMilestone[key] = [];
    feedbackByMilestone[key].push(f);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1e2749' }}>
            <MessageCircle className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1e2749]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Submissions & Feedback
            </h3>
            <p className="text-xs text-gray-500">
              {feedback.length > 0
                ? `${feedback.length} feedback item${feedback.length !== 1 ? 's' : ''}`
                : 'Submit your work for review'}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          {loading ? (
            <div className="p-6 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Active submission form */}
              {submittingFor && (
                <SubmissionForm
                  milestoneRecordId={submittingFor.progress_id}
                  milestoneTitle={submittingFor.title}
                  onSubmit={handleSubmit}
                  onCancel={() => setSubmittingFor(null)}
                  isSubmitting={isSubmitting}
                />
              )}

              {/* Submit buttons for submittable milestones */}
              {!submittingFor && submittable.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ready to Submit</p>
                  {submittable.map(m => (
                    <button
                      key={m.progress_id || m.id}
                      onClick={() => setSubmittingFor(m)}
                      className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 rounded-lg border border-gray-200 hover:border-[#1e2749] hover:bg-white transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-[#1e2749] transition-colors">
                        <Send className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#1e2749] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1e2749] truncate">{m.title}</p>
                        <p className="text-xs text-gray-400">Click to submit your deliverable</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Waiting for review */}
              {waitingReview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Under Review</p>
                  {waitingReview.map(m => {
                    const milestoneFeedback = feedbackByMilestone[m.progress_id] || [];
                    const latestSubmission = milestoneFeedback[0];

                    return (
                      <div key={m.progress_id || m.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">{m.title}</span>
                        </div>
                        <p className="text-xs text-amber-600">Submitted -- your team is reviewing this.</p>
                        {/* Revise button */}
                        {!submittingFor && (
                          <button
                            onClick={() => setSubmittingFor({
                              ...m,
                              // Pass previous submission for pre-fill
                            })}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Revise & Resubmit
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feedback received */}
              {feedback.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Feedback Received</p>
                  {feedback.map(item => (
                    <FeedbackCard
                      key={item.id}
                      item={item}
                      onRequestCall={handleRequestCall}
                      isRequestingCall={requestingCallFor === item.id}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {feedback.length === 0 && submittable.length === 0 && waitingReview.length === 0 && (
                <div className="text-center py-6">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No submissions or feedback yet</p>
                  <p className="text-xs text-gray-400 mt-1">Submit your work on available milestones to get feedback</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
