'use client';

import { useState, useEffect } from 'react';
import { X, Star, Send } from 'lucide-react';
import { useHub } from './HubContext';
import { useMomentMode } from './MomentModeContext';
import {
  FeedbackType,
  canShowFeedbackPrompt,
  getNextFeedbackType,
  recordPromptShown,
  submitFeedback,
  incrementSessionCount,
} from '@/lib/hub/feedback';

interface FeedbackPromptProps {
  // Optional: trigger course feedback after completing a lesson
  lessonContext?: {
    lessonId: string;
    courseId: string;
    lessonTitle?: string;
  };
}

export default function FeedbackPrompt({ lessonContext }: FeedbackPromptProps) {
  const { user } = useHub();
  const { isMomentModeActive } = useMomentMode();

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackContext, setFeedbackContext] = useState<{ lessonId?: string; courseId?: string } | undefined>();

  // Course feedback state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // General satisfaction state
  const [satisfaction, setSatisfaction] = useState<'great' | 'ok' | 'needs_work' | null>(null);

  // Comment state
  const [comment, setComment] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Increment session count on mount
  useEffect(() => {
    incrementSessionCount();
  }, []);

  // Check if we should show feedback
  useEffect(() => {
    // Don't show if already visible or no user
    if (isVisible || !user?.id) return;

    // Check if we can show feedback
    if (!canShowFeedbackPrompt(isMomentModeActive)) return;

    // Determine feedback type
    const next = getNextFeedbackType(
      lessonContext
        ? { justCompletedLesson: true, lessonId: lessonContext.lessonId, courseId: lessonContext.courseId }
        : undefined
    );

    if (!next) return;

    // Small delay before showing
    const timer = setTimeout(() => {
      setFeedbackType(next.type);
      setFeedbackContext(next.context);
      setIsVisible(true);
      recordPromptShown(next.type);
    }, lessonContext ? 2000 : 5000); // Show faster after lesson completion

    return () => clearTimeout(timer);
  }, [user?.id, isMomentModeActive, lessonContext, isVisible]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!user?.id || !feedbackType) return;

    setIsSubmitting(true);

    const success = await submitFeedback(user.id, {
      type: feedbackType,
      rating: feedbackType === 'course_feedback' ? rating : undefined,
      satisfaction: feedbackType === 'general_satisfaction' ? satisfaction || undefined : undefined,
      comment: comment.trim() || undefined,
      lessonId: feedbackContext?.lessonId,
      courseId: feedbackContext?.courseId,
    });

    setIsSubmitting(false);

    if (success) {
      setIsSubmitted(true);
      setTimeout(handleDismiss, 1500);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 w-[320px] bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isAnimatingOut ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{
        borderTop: '3px solid #E8B84B',
        animation: isAnimatingOut ? 'none' : 'slideUp 300ms ease-out',
      }}
    >
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close feedback"
      >
        <X size={16} />
      </button>

      <div className="p-4">
        {isSubmitted ? (
          // Thank you state
          <div className="text-center py-2">
            <p
              className="font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
            >
              Thank you for your feedback!
            </p>
          </div>
        ) : feedbackType === 'course_feedback' ? (
          // Course feedback UI
          <>
            <p
              className="font-medium mb-3 pr-6"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#2B3A67' }}
            >
              How was that lesson?
            </p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    fill={(hoverRating || rating) >= star ? '#E8B84B' : 'none'}
                    stroke={(hoverRating || rating) >= star ? '#E8B84B' : '#D1D5DB'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any thoughts? (optional)"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#E8B84B]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              maxLength={300}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-400 hover:text-gray-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: rating > 0 ? '#E8B84B' : '#E5E5E5',
                  color: rating > 0 ? '#2B3A67' : '#9CA3AF',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isSubmitting ? 'Sending...' : <><Send size={14} /> Send</>}
              </button>
            </div>
          </>
        ) : feedbackType === 'general_satisfaction' ? (
          // General satisfaction UI
          <>
            <p
              className="font-medium mb-4 pr-6"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#2B3A67' }}
            >
              How is your Hub experience so far?
            </p>
            <div className="flex justify-center gap-4 mb-4">
              {[
                { value: 'great' as const, emoji: '😊', label: 'Great' },
                { value: 'ok' as const, emoji: '😐', label: 'OK' },
                { value: 'needs_work' as const, emoji: '😕', label: 'Needs work' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSatisfaction(option.value)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    satisfaction === option.value
                      ? 'border-[#E8B84B] bg-[#FFF8E7]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1">{option.emoji}</span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B7280' }}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
            {satisfaction && (
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more (optional)"
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#E8B84B] mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                maxLength={300}
              />
            )}
            <div className="flex items-center justify-between">
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-400 hover:text-gray-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Not now
              </button>
              {satisfaction && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {isSubmitting ? 'Sending...' : <><Send size={14} /> Send</>}
                </button>
              )}
            </div>
          </>
        ) : feedbackType === 'feature_request' ? (
          // Feature request UI
          <>
            <p
              className="font-medium mb-3 pr-6"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#2B3A67' }}
            >
              What would make the Hub better for you?
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your ideas..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#E8B84B]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-400 hover:text-gray-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Maybe later
              </button>
              <button
                onClick={handleSubmit}
                disabled={!comment.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: comment.trim() ? '#E8B84B' : '#E5E5E5',
                  color: comment.trim() ? '#2B3A67' : '#9CA3AF',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isSubmitting ? 'Sending...' : <><Send size={14} /> Submit</>}
              </button>
            </div>
          </>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
