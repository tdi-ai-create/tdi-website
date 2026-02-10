'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';
import {
  Send,
  CheckCircle,
  ArrowLeft,
  Lightbulb,
  Zap,
  BookOpen,
  HelpCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Request types
const REQUEST_TYPES = [
  { value: 'course_idea', label: 'Course idea', icon: BookOpen },
  { value: 'quick_win_idea', label: 'Quick Win idea', icon: Zap },
  { value: 'topic_request', label: 'Topic request', icon: Lightbulb },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

// Priority levels
const PRIORITY_LEVELS = [
  { value: 'low', label: 'Nice to have', description: 'Would be helpful eventually' },
  { value: 'medium', label: 'Important', description: 'Would improve my experience' },
  { value: 'high', label: 'Urgent', description: 'I really need this' },
];

interface PreviousRequest {
  id: string;
  metadata: {
    request_type: string;
    title: string;
    description: string;
    priority?: string;
    anonymous?: boolean;
  };
  created_at: string;
}

export default function RequestCenterPage() {
  const { user } = useHub();
  const [requestType, setRequestType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previousRequests, setPreviousRequests] = useState<PreviousRequest[]>([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(true);

  // Load previous requests
  useEffect(() => {
    async function loadPreviousRequests() {
      if (!user?.id) {
        setIsLoadingPrevious(false);
        return;
      }

      const supabase = getSupabase();
      setIsLoadingPrevious(true);

      try {
        const { data } = await supabase
          .from('hub_activity_log')
          .select('id, metadata, created_at')
          .eq('user_id', user.id)
          .eq('action', 'pd_request')
          .order('created_at', { ascending: false })
          .limit(10);

        if (data) {
          setPreviousRequests(data as PreviousRequest[]);
        }
      } catch (error) {
        console.error('Error loading previous requests:', error);
      } finally {
        setIsLoadingPrevious(false);
      }
    }

    loadPreviousRequests();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !requestType || !title || !description) return;

    setIsSubmitting(true);
    const supabase = getSupabase();

    try {
      const requestData = {
        user_id: user.id,
        action: 'pd_request',
        metadata: {
          request_type: requestType,
          title,
          description,
          priority: priority || null,
          anonymous: isAnonymous,
        },
      };

      const { data, error } = await supabase
        .from('hub_activity_log')
        .insert(requestData)
        .select()
        .single();

      if (!error && data) {
        setIsSubmitted(true);
        // Add to previous requests list
        setPreviousRequests((prev) => [data as PreviousRequest, ...prev]);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestType('');
    setTitle('');
    setDescription('');
    setPriority('');
    setIsAnonymous(false);
    setIsSubmitted(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRequestTypeLabel = (value: string): string => {
    return REQUEST_TYPES.find((t) => t.value === value)?.label || value;
  };

  const getPriorityLabel = (value: string): string => {
    return PRIORITY_LEVELS.find((p) => p.value === value)?.label || value;
  };

  const isFormValid = requestType && title.trim() && description.trim();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-[24px] md:text-[28px] font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Request Center
        </h1>
        <p
          className="text-gray-500 text-[15px] max-w-[560px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Suggest courses, Quick Wins, or topics you would like us to create.
        </p>
      </div>

      {/* Success State */}
      {isSubmitted ? (
        <div
          className="hub-card py-12 text-center"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2
            className="text-[18px] font-semibold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            Request submitted!
          </h2>
          <p
            className="text-gray-600 mb-6"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Thank you for helping us build better PD. We review every suggestion.
          </p>
          <button
            onClick={resetForm}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Submit another request
          </button>
        </div>
      ) : (
        /* Request Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div className="hub-card">
            <label
              className="block text-[14px] font-medium mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#374151',
              }}
            >
              What type of request is this? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {REQUEST_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = requestType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setRequestType(type.value)}
                    className="p-4 rounded-lg border-2 text-left transition-all"
                    style={{
                      borderColor: isSelected ? '#E8B84B' : '#E5E5E5',
                      backgroundColor: isSelected ? '#FFF8E7' : 'white',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={20}
                        style={{ color: isSelected ? '#E8B84B' : '#9CA3AF' }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2B3A67',
                        }}
                      >
                        {type.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="hub-card">
            <label
              htmlFor="title"
              className="block text-[14px] font-medium mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#374151',
              }}
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your request a short title"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              maxLength={100}
            />
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="hub-card">
            <label
              htmlFor="description"
              className="block text-[14px] font-medium mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#374151',
              }}
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about what you're looking for and why it would be helpful..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors resize-none"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              maxLength={1000}
            />
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {description.length}/1000 characters
            </p>
          </div>

          {/* Priority (Optional) */}
          <div className="hub-card">
            <label
              className="block text-[14px] font-medium mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#374151',
              }}
            >
              Priority <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="space-y-2">
              {PRIORITY_LEVELS.map((level) => {
                const isSelected = priority === level.value;
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setPriority(isSelected ? '' : level.value)}
                    className="w-full p-3 rounded-lg border-2 text-left transition-all"
                    style={{
                      borderColor: isSelected ? '#E8B84B' : '#E5E5E5',
                      backgroundColor: isSelected ? '#FFF8E7' : 'white',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="text-sm font-medium"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#2B3A67',
                          }}
                        >
                          {level.label}
                        </span>
                        <p
                          className="text-xs text-gray-500 mt-0.5"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {level.description}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-[#E8B84B] bg-[#E8B84B]' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="hub-card">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#E8B84B] focus:ring-[#E8B84B]"
              />
              <div>
                <span
                  className="text-sm font-medium"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Submit anonymously
                </span>
                <p
                  className="text-xs text-gray-500 mt-0.5"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Your name will not be attached to this request
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isFormValid ? '#E8B84B' : '#E5E5E5',
                color: isFormValid ? '#2B3A67' : '#9CA3AF',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Previous Requests */}
      {!isLoadingPrevious && previousRequests.length > 0 && (
        <div className="mt-12">
          <h2
            className="text-[18px] font-semibold mb-4"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#2B3A67',
            }}
          >
            Your Previous Requests
          </h2>
          <div className="space-y-3">
            {previousRequests.map((request) => (
              <div
                key={request.id}
                className="hub-card py-4"
                style={{ backgroundColor: '#FAFAF8' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: '#E8B84B20',
                          color: '#B8860B',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {getRequestTypeLabel(request.metadata.request_type)}
                      </span>
                      {request.metadata.priority && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: '#E5E5E5',
                            color: '#6B7280',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {getPriorityLabel(request.metadata.priority)}
                        </span>
                      )}
                      {request.metadata.anonymous && (
                        <span
                          className="text-xs text-gray-400"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          (anonymous)
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-medium truncate"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      {request.metadata.title}
                    </h3>
                    <p
                      className="text-sm text-gray-500 line-clamp-2 mt-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {request.metadata.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                    <Clock size={14} />
                    <span
                      className="text-xs"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {formatDate(request.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state for previous requests */}
      {isLoadingPrevious && (
        <div className="mt-12">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="hub-card py-4 animate-pulse">
                <div className="flex gap-2 mb-2">
                  <div className="h-5 bg-gray-100 rounded w-24" />
                  <div className="h-5 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info note */}
      <div
        className="mt-8 p-4 rounded-lg flex items-start gap-3"
        style={{ backgroundColor: '#FFF8E7' }}
      >
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#E8B84B' }} />
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          We read every request and use your feedback to prioritize what we build next.
          While we cannot respond to each one individually, know that your voice matters.
        </p>
      </div>
    </div>
  );
}
