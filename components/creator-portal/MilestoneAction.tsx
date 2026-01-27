'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, FileText, Upload, CheckCircle, ExternalLink, Send, Loader2 } from 'lucide-react';

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
}

export function MilestoneAction({ milestone, creatorId, onComplete }: MilestoneActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
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

  // Render based on action type
  switch (actionType) {
    case 'calendly':
      return (
        <a
          href={config.url || 'https://calendly.com/rae-teachersdeserveit/creator-chat'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors"
        >
          <Calendar className="w-4 h-4" />
          {config.label || 'Book a Call'}
          <ExternalLink className="w-3 h-3" />
        </a>
      );

    case 'submit_link':
      return (
        <>
          <button
            onClick={() => setIsOpen(true)}
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
        </>
      );

    case 'confirm':
      return (
        <div className="flex flex-col items-start gap-2">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
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
      );

    case 'review':
      return (
        <div className="flex flex-col items-start gap-2">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
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
      );

    case 'sign_agreement':
      return (
        <Link
          href="/creator-portal/agreement"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors"
        >
          <FileText className="w-4 h-4" />
          {config.label || 'Review & Sign Agreement'}
        </Link>
      );

    case 'team_action':
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm">
          <span>⏳</span>
          Waiting on TDI Team
        </div>
      );

    default:
      // Default to a simple confirm button
      return (
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isSubmitting ? 'Completing...' : 'Mark Complete'}
        </button>
      );
  }
}
