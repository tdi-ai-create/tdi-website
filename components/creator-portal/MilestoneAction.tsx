'use client';

import { useState } from 'react';
import { Calendar, FileText, Upload, CheckCircle, ExternalLink, Send, Loader2, Eye } from 'lucide-react';

interface MilestoneActionProps {
  milestone: {
    id: string;
    title?: string;
    name?: string;
    action_type?: string;
    action_config?: Record<string, unknown>;
    status: string;
  };
  creatorId: string;
  onComplete: () => void;
  isAdminPreview?: boolean;
}

export function MilestoneAction({ milestone, creatorId, onComplete, isAdminPreview = false }: MilestoneActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config = (milestone.action_config || {}) as any;
  const actionType = milestone.action_type || 'confirm';

  const handleSubmitLink = async () => {
    if (!link) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator-portal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          milestoneId: milestone.id,
          submissionType: 'link',
          content: { link, notes },
          notifyTeam: config.notify_team
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsOpen(false);
        setLink('');
        setNotes('');
        onComplete();
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator-portal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          milestoneId: milestone.id,
          submissionType: 'confirmation',
          content: { confirmed: true }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onComplete();
      } else {
        setError(data.error || 'Failed to confirm. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Confirm error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMeeting = async () => {
    if (!scheduledDate || !scheduledTime) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator-portal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          milestoneId: milestone.id,
          submissionType: 'meeting_scheduled',
          content: {
            scheduled_date: scheduledDate,
            scheduled_time: scheduledTime,
            notes
          },
          notifyTeam: true
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowDatePicker(false);
        setScheduledDate('');
        setScheduledTime('');
        setNotes('');
        onComplete();
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Submit meeting error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin preview wrapper - shows what creator sees with a label
  const AdminPreviewWrapper = ({ children, actionLabel }: { children: React.ReactNode; actionLabel: string }) => {
    if (!isAdminPreview) return <>{children}</>;

    return (
      <div className="relative">
        <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
          <Eye className="w-3 h-3" />
          <span>Creator sees: <span className="font-medium">{actionLabel}</span></span>
        </div>
        <div className="opacity-90 pointer-events-none">
          {children}
        </div>
      </div>
    );
  };

  // Render based on action type
  switch (actionType) {
    case 'calendly':
      return (
        <AdminPreviewWrapper actionLabel={config.label || 'Book a Call'}>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={config.url || 'https://calendly.com/rae-teachersdeserveit/creator-chat'}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors ${isAdminPreview ? 'pointer-events-auto' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              {config.label || 'Book a Call'}
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => !isAdminPreview && setShowDatePicker(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[#1e2749] text-[#1e2749] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              I&apos;ve Booked It
            </button>
          </div>

          {showDatePicker && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-lg font-semibold text-[#1e2749] mb-2">
                  When is your meeting scheduled?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the date and time you booked so your TDI team can prepare.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything you want to discuss or questions you have?"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitMeeting}
                    disabled={!scheduledDate || !scheduledTime || isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Confirm Meeting
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </AdminPreviewWrapper>
      );

    case 'submit_link':
      return (
        <AdminPreviewWrapper actionLabel={config.label || 'Submit'}>
          <button
            onClick={() => !isAdminPreview && setIsOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors"
          >
            <Upload className="w-4 h-4" />
            {config.label || 'Submit'}
          </button>

          {isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-lg font-semibold text-[#1e2749] mb-4">
                  {config.label || 'Submit Your Work'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {config.link_type === 'google_doc' ? 'Google Doc Link' :
                       config.link_type === 'video' ? 'Video Link (Loom or Google Drive)' :
                       config.link_type === 'google_drive' ? 'Google Drive Folder Link' : 'Link'}
                    </label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder={config.placeholder || 'Paste your link here'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes for the TDI Team (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any questions or things you'd like feedback on?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitLink}
                    disabled={!link || isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </AdminPreviewWrapper>
      );

    case 'confirm':
      return (
        <AdminPreviewWrapper actionLabel={config.label || 'Mark Complete'}>
          <div className="flex flex-col items-start gap-2">
            <button
              onClick={() => !isAdminPreview && handleConfirm()}
              disabled={isSubmitting || isAdminPreview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isSubmitting ? 'Confirming...' : (config.label || 'Mark Complete')}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </AdminPreviewWrapper>
      );

    case 'review':
      return (
        <AdminPreviewWrapper actionLabel={config.label || "I've reviewed this"}>
          <div className="flex flex-col items-start gap-2">
            <button
              onClick={() => !isAdminPreview && handleConfirm()}
              disabled={isSubmitting || isAdminPreview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isSubmitting ? 'Confirming...' : (config.label || "I've reviewed this")}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </AdminPreviewWrapper>
      );

    case 'sign_agreement':
      return (
        <AdminPreviewWrapper actionLabel={config.label || 'Review & Sign Agreement'}>
          <a
            href="/creator-portal/agreement"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors ${isAdminPreview ? 'pointer-events-auto' : ''}`}
          >
            <FileText className="w-4 h-4" />
            {config.label || 'Review & Sign Agreement'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </AdminPreviewWrapper>
      );

    case 'team_action':
      return (
        <AdminPreviewWrapper actionLabel="Waiting on TDI Team">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm">
            <span>⏳</span>
            Waiting on TDI Team
          </div>
        </AdminPreviewWrapper>
      );

    default:
      // Default to a simple confirm button
      return (
        <AdminPreviewWrapper actionLabel="Mark Complete">
          <button
            onClick={() => !isAdminPreview && handleConfirm()}
            disabled={isSubmitting || isAdminPreview}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isSubmitting ? 'Completing...' : 'Mark Complete'}
          </button>
        </AdminPreviewWrapper>
      );
  }
}
