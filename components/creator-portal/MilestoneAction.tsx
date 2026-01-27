'use client';

import { useState } from 'react';
import { Calendar, FileText, Upload, CheckCircle, ExternalLink, Send, Loader2, Eye, Mail, MessageSquare, PartyPopper, Copy, Check, AlertCircle } from 'lucide-react';

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
  teamNotes?: string;
  creatorName?: string;
  creator?: {
    google_doc_link?: string | null;
    drive_folder_link?: string | null;
    marketing_doc_link?: string | null;
    course_url?: string | null;
    discount_code?: string | null;
    wants_video_editing?: boolean;
    wants_download_design?: boolean;
  };
}

export function MilestoneAction({ milestone, creatorId, onComplete, isAdminPreview = false, teamNotes, creatorName, creator }: MilestoneActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changeRequest, setChangeRequest] = useState('');
  const [copied, setCopied] = useState(false);
  // Preferences form state
  const [wantsVideoEditing, setWantsVideoEditing] = useState(creator?.wants_video_editing ?? false);
  const [wantsDownloadDesign, setWantsDownloadDesign] = useState(creator?.wants_download_design ?? false);

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

  const handleRequestChanges = async () => {
    if (!changeRequest.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator-portal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          milestoneId: milestone.id,
          submissionType: 'change_request',
          content: { request: changeRequest },
          notifyTeam: true
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowChangesModal(false);
        setChangeRequest('');
        onComplete();
      } else {
        setError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Change request error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPreferences = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/creator-portal/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          milestoneId: milestone.id,
          submissionType: 'preferences',
          content: {
            wants_video_editing: wantsVideoEditing,
            wants_download_design: wantsDownloadDesign
          }
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onComplete();
      } else {
        setError(data.error || 'Failed to save preferences. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Preferences error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

    case 'review_notes':
      return (
        <AdminPreviewWrapper actionLabel={config.label || "I've Reviewed the Notes"}>
          <div className="space-y-4">
            {teamNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Notes from the TDI Team:</p>
                <p className="text-sm text-blue-700 whitespace-pre-wrap">{teamNotes}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
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
                {isSubmitting ? 'Confirming...' : (config.label || "I've Reviewed the Notes")}
              </button>
              <a
                href={`mailto:rachel@teachersdeserveit.com?subject=${encodeURIComponent(`Question about my intake notes - ${creatorName || 'Creator'}`)}`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Rachel
              </a>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </AdminPreviewWrapper>
      );

    case 'preferences_form':
      return (
        <AdminPreviewWrapper actionLabel={config.label || "I've Reviewed & Set My Preferences"}>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div>
                <p className="font-medium text-[#1e2749] mb-3">VIDEO EDITING</p>
                <p className="text-sm text-gray-600 mb-3">Do you want TDI to edit your videos?</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="video_editing"
                      checked={!wantsVideoEditing}
                      onChange={() => setWantsVideoEditing(false)}
                      disabled={isAdminPreview}
                      className="mt-1"
                    />
                    <span className="text-sm">I&apos;ll edit my own videos</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="video_editing"
                      checked={wantsVideoEditing}
                      onChange={() => setWantsVideoEditing(true)}
                      disabled={isAdminPreview}
                      className="mt-1"
                    />
                    <span className="text-sm">I&apos;d like TDI to edit (I&apos;ll provide a script or transcript with edit marks)</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium text-[#1e2749] mb-3">DOWNLOADS</p>
                <p className="text-sm text-gray-600 mb-3">Do you want TDI to design your downloads?</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="download_design"
                      checked={!wantsDownloadDesign}
                      onChange={() => setWantsDownloadDesign(false)}
                      disabled={isAdminPreview}
                      className="mt-1"
                    />
                    <span className="text-sm">I&apos;ll design my own downloads</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="download_design"
                      checked={wantsDownloadDesign}
                      onChange={() => setWantsDownloadDesign(true)}
                      disabled={isAdminPreview}
                      className="mt-1"
                    />
                    <span className="text-sm">I&apos;d like TDI to design them (I&apos;ll draft content in a Google Doc)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800 mb-2">REMINDERS:</p>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Videos should be 1-5 minutes each</li>
                <li>• Total course length: 20-50 minutes</li>
                {wantsVideoEditing && (
                  <li>• Since you want TDI editing, you&apos;ll need to provide a script or transcript with edit marks</li>
                )}
              </ul>
            </div>

            <button
              onClick={() => !isAdminPreview && handleSubmitPreferences()}
              disabled={isSubmitting || isAdminPreview}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isSubmitting ? 'Saving...' : (config.label || "I've Reviewed & Set My Preferences")}
            </button>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </AdminPreviewWrapper>
      );

    case 'review_with_changes': {
      const showLinkField = config.show_link_field as string | undefined;
      const savedLink = showLinkField && creator ? (creator as Record<string, string | null | boolean>)[showLinkField] as string | null : null;

      return (
        <AdminPreviewWrapper actionLabel={config.label || 'Approve'}>
          <div className="space-y-4">
            {savedLink && (
              <a
                href={savedLink as string}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#80a4ed] hover:text-[#1e2749] text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View Your Materials
              </a>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => !isAdminPreview && handleConfirm()}
                disabled={isSubmitting || isAdminPreview}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isSubmitting ? 'Approving...' : (config.label || 'I Approve')}
              </button>
              <button
                onClick={() => !isAdminPreview && setShowChangesModal(true)}
                disabled={isAdminPreview}
                className="inline-flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Request Changes
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}

            {showChangesModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                  <h3 className="text-lg font-semibold text-[#1e2749] mb-2">
                    Request Changes
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    What changes would you like? Our team will review and update.
                  </p>

                  <textarea
                    value={changeRequest}
                    onChange={(e) => setChangeRequest(e.target.value)}
                    placeholder="Describe the changes you'd like..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent resize-none mb-4"
                  />

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowChangesModal(false);
                        setError(null);
                        setChangeRequest('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestChanges}
                      disabled={!changeRequest.trim() || isSubmitting}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AdminPreviewWrapper>
      );
    }

    case 'launch_celebration':
      return (
        <AdminPreviewWrapper actionLabel="Course Launched!">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 space-y-6">
            <div className="text-center">
              <PartyPopper className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-800">Your Course is Live!</h3>
            </div>

            {creator?.course_url && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">View Your Course:</p>
                <a
                  href={creator.course_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#80a4ed] hover:text-[#1e2749] font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Learning Hub
                </a>
              </div>
            )}

            {creator?.discount_code && (
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Discount Code:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1 rounded text-lg font-mono font-bold text-[#1e2749]">
                    {creator.discount_code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(creator.discount_code || '')}
                    className="p-2 text-gray-500 hover:text-[#1e2749] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-green-200 pt-4">
              <p className="font-medium text-green-800 mb-2">What&apos;s Next?</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Share your course with your network</li>
                <li>• Track your impact as educators take your course</li>
                <li>• Have another idea? We&apos;d love to work with you again - reach out anytime!</li>
              </ul>
            </div>

            <p className="text-center text-green-700 font-medium">
              Thank you for creating with TDI. You&apos;re officially part of the Learning Hub family!
            </p>
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
