'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';
import {
  Send,
  CheckCircle,
  ArrowLeft,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
} from 'lucide-react';

// Request types
const REQUEST_TYPES = [
  { value: 'course', label: 'Course' },
  { value: 'quick_win', label: 'Quick Win' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'resource', label: 'Resource/Download' },
  { value: 'other', label: 'Other' },
];

// Priority levels
const PRIORITY_LEVELS = [
  { value: 'low', label: 'Nice to have' },
  { value: 'medium', label: 'Would really help' },
  { value: 'high', label: 'Urgent need' },
];

// Status styling
const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: '#F3F4F6', text: '#6B7280', label: 'New' },
  reviewed: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Reviewed' },
  planned: { bg: '#FFF8E7', text: '#D97706', label: 'Planned' },
  completed: { bg: '#D1FAE5', text: '#059669', label: 'Completed' },
};

interface PreviousRequest {
  id: string;
  metadata: {
    request_type: string;
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    completed_link?: string;
  };
  created_at: string;
}

interface PopularRequest {
  title: string;
  count: number;
}

export default function RequestCenterPage() {
  const { user } = useHub();
  const [requestType, setRequestType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previousRequests, setPreviousRequests] = useState<PreviousRequest[]>([]);
  const [popularRequests, setPopularRequests] = useState<PopularRequest[]>([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(true);
  const [weeklyRequestCount, setWeeklyRequestCount] = useState(0);
  const [showThrottleMessage, setShowThrottleMessage] = useState(false);

  // Load previous requests and weekly count
  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setIsLoadingPrevious(false);
        return;
      }

      const supabase = getSupabase();
      setIsLoadingPrevious(true);

      try {
        // Get user's requests
        const { data: userRequests } = await supabase
          .from('hub_activity_log')
          .select('id, metadata, created_at')
          .eq('user_id', user.id)
          .eq('action', 'pd_request')
          .order('created_at', { ascending: false })
          .limit(10);

        if (userRequests) {
          setPreviousRequests(userRequests as PreviousRequest[]);
        }

        // Count requests this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count } = await supabase
          .from('hub_activity_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('action', 'pd_request')
          .gte('created_at', oneWeekAgo.toISOString());

        setWeeklyRequestCount(count || 0);

        // Get popular requests (aggregate)
        const { data: allRequests } = await supabase
          .from('hub_activity_log')
          .select('metadata')
          .eq('action', 'pd_request')
          .limit(500);

        if (allRequests) {
          // Count similar titles
          const titleCounts: Record<string, number> = {};
          allRequests.forEach((req) => {
            const reqTitle = (req.metadata as { title?: string })?.title?.toLowerCase().trim();
            if (reqTitle) {
              // Normalize title for grouping
              const normalizedTitle = reqTitle.slice(0, 50);
              titleCounts[normalizedTitle] = (titleCounts[normalizedTitle] || 0) + 1;
            }
          });

          // Get top 5 with count > 1
          const popular = Object.entries(titleCounts)
            .filter(([, count]) => count > 1)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([title, count]) => ({ title, count }));

          setPopularRequests(popular);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingPrevious(false);
      }
    }

    loadData();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !requestType || !title) return;

    // Check throttle
    if (weeklyRequestCount >= 3) {
      setShowThrottleMessage(true);
      return;
    }

    setIsSubmitting(true);
    const supabase = getSupabase();

    try {
      const requestData = {
        user_id: user.id,
        action: 'pd_request',
        metadata: {
          request_type: requestType,
          title: title.trim(),
          description: description.trim() || null,
          priority: priority || 'low',
          status: 'new',
        },
      };

      const { data, error } = await supabase
        .from('hub_activity_log')
        .insert(requestData)
        .select()
        .single();

      if (!error && data) {
        setIsSubmitted(true);
        setPreviousRequests((prev) => [data as PreviousRequest, ...prev]);
        setWeeklyRequestCount((prev) => prev + 1);
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
    setIsSubmitted(false);
    setShowThrottleMessage(false);
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

  const getStatusStyle = (status?: string) => {
    return STATUS_STYLES[status || 'new'] || STATUS_STYLES.new;
  };

  const isFormValid = requestType && title.trim();
  const isThrottled = weeklyRequestCount >= 3;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '28px',
            color: '#2B3A67',
          }}
        >
          Request Center
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
        >
          Tell us what professional development you need. We listen.
        </p>
      </div>

      {/* Submit a Request Section */}
      <div className="hub-card mb-8">
        <h2
          className="font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '18px',
            color: '#2B3A67',
          }}
        >
          Submit a Request
        </h2>

        {/* Throttle Message */}
        {showThrottleMessage && (
          <div
            className="p-4 rounded-lg mb-4 flex items-start gap-3"
            style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />
            <p
              className="text-sm text-amber-800"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              You have submitted 3 requests this week. You can submit more next week.
            </p>
          </div>
        )}

        {/* Success State */}
        {isSubmitted ? (
          <div
            className="py-8 text-center rounded-lg"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: '#DCFCE7' }}
            >
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <p
              className="font-medium mb-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                color: '#2B3A67',
              }}
            >
              Request submitted!
            </p>
            <p
              className="text-sm text-gray-600 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              We review every request.
            </p>
            <button
              onClick={resetForm}
              className="text-sm font-medium hover:underline"
              style={{ color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
              >
                What PD topic do you need? <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Classroom management for large groups"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
                maxLength={100}
                disabled={isThrottled}
              />
            </div>

            {/* Type Dropdown */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
              >
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors bg-white"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
                disabled={isThrottled}
              >
                <option value="">Select type...</option>
                {REQUEST_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors bg-white"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
                disabled={isThrottled}
              >
                <option value="">Select priority...</option>
                {PRIORITY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1.5"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
              >
                Tell us more <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Any additional details about what you need..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors resize-none"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
                maxLength={500}
                disabled={isThrottled}
              />
              <p
                className="text-xs text-gray-400 mt-1 text-right"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {description.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting || isThrottled}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
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
          </form>
        )}
      </div>

      {/* Your Requests Section */}
      <div className="mb-8">
        <h2
          className="font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '18px',
            color: '#2B3A67',
          }}
        >
          Your Requests
        </h2>

        {isLoadingPrevious ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="hub-card py-4 animate-pulse">
                <div className="flex gap-2 mb-2">
                  <div className="h-5 bg-gray-100 rounded w-24" />
                  <div className="h-5 bg-gray-100 rounded w-16" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : previousRequests.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: '#FAFAF8' }}
          >
            <p
              className="text-gray-500"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
            >
              No requests yet. Tell us what you need!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {previousRequests.map((request) => {
              const statusStyle = getStatusStyle(request.metadata.status);
              return (
                <div
                  key={request.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: '#FAFAF8', border: '1px solid #E5E7EB' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold truncate"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '16px',
                          color: '#2B3A67',
                        }}
                      >
                        {request.metadata.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: '#FFF8E7',
                            color: '#D97706',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {getRequestTypeLabel(request.metadata.request_type)}
                        </span>
                        {request.metadata.priority && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#6B7280',
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {getPriorityLabel(request.metadata.priority)}
                          </span>
                        )}
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                      <p
                        className="text-gray-500 mt-2 flex items-center gap-1"
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                      >
                        <Clock size={12} />
                        {formatDate(request.created_at)}
                      </p>
                      {request.metadata.status === 'completed' && request.metadata.completed_link && (
                        <p
                          className="text-sm mt-2"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          This became:{' '}
                          <Link
                            href={request.metadata.completed_link}
                            className="text-[#E8B84B] hover:underline font-medium"
                          >
                            View resource →
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popular Requests Section */}
      {popularRequests.length > 0 && (
        <div className="mb-8">
          <h2
            className="font-semibold mb-4 flex items-center gap-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '18px',
              color: '#2B3A67',
            }}
          >
            <TrendingUp size={20} style={{ color: '#E8B84B' }} />
            Popular Requests
          </h2>
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: '#FAFAF8', border: '1px solid #E5E7EB' }}
          >
            <div className="space-y-3">
              {popularRequests.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span
                    className="text-sm capitalize"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                  >
                    {req.title}
                  </span>
                  <span
                    className="text-xs flex items-center gap-1"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#6B7280' }}
                  >
                    <Users size={12} />
                    {req.count} teachers requested
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Back Link */}
      <div className="flex justify-start">
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Info note */}
      <div
        className="mt-6 p-4 rounded-lg flex items-start gap-3"
        style={{ backgroundColor: '#FFF8E7' }}
      >
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#E8B84B' }} />
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          We read every request and use your feedback to prioritize what we build next.
        </p>
      </div>
    </div>
  );
}
