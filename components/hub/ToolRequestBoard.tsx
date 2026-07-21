'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHub } from '@/components/hub/HubContext';
import { ChevronUp, Plus, MessageCircle, X } from 'lucide-react';

interface ToolRequest {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: string;
  upvote_count: number;
  created_at: string;
  author_name: string;
  user_upvoted: boolean;
  user_id: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: 'Submitted', color: '#6B7280', bg: '#F3F4F6' },
  under_review: { label: 'Under Review', color: '#2563EB', bg: '#EFF6FF' },
  approved: { label: 'Approved', color: '#059669', bg: '#ECFDF5' },
  in_progress: { label: 'In Progress', color: '#EA580C', bg: '#FFF7ED' },
  published: { label: 'Published', color: '#2A9D8F', bg: '#F0FDFA' },
};

const CATEGORIES = [
  'Instructional Strategies',
  'Lesson Planning',
  'Assessment',
  'Classroom Setup',
  'Classroom Management',
  'Communication',
  'Time Savers',
  'Leadership',
  'Self-Care',
  'Stress Relief',
  'Games',
  'Vocational',
];

export default function ToolRequestBoard() {
  const { user } = useHub();
  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (user?.id) params.set('userId', user.id);
      const res = await fetch(`/api/hub/community/request?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleSubmit() {
    if (!user?.id || !title.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/hub/community/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          userId: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category: category || null,
        }),
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setCategory('');
        setShowForm(false);
        fetchRequests();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpvote(requestId: string) {
    if (!user?.id) return;

    // Optimistic update
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        user_upvoted: !r.user_upvoted,
        upvote_count: r.user_upvoted ? r.upvote_count - 1 : r.upvote_count + 1,
      };
    }));

    try {
      await fetch('/api/hub/community/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', userId: user.id, requestId }),
      });
    } catch {
      // Revert on error
      fetchRequests();
    }
  }

  if (!user?.id) return null;

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      padding: 24,
      marginTop: 32,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={18} style={{ color: '#2A9D8F' }} />
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e2749' }}>
              Request a Tool
            </h3>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
            Tell us what you need. The most upvoted requests get built first.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: showForm ? '#F3F4F6' : '#1e2749',
            color: showForm ? '#374151' : 'white',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
          }}
        >
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Request</>}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <div style={{
          background: '#F8FAFC',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          border: '1px solid #E5E7EB',
        }}>
          <input
            type="text"
            placeholder="What tool or resource do you need? (e.g., 'Timer display for student transitions')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #E5E7EB', fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", color: '#1e2749',
              marginBottom: 10,
            }}
          />
          <textarea
            placeholder="Optional: describe what it should include or how you would use it"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #E5E7EB', fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", color: '#1e2749',
              resize: 'vertical', marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '8px 12px', borderRadius: 8,
                border: '1px solid #E5E7EB', fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", color: category ? '#1e2749' : '#94A3B8',
                background: 'white',
              }}
            >
              <option value="">Category (optional)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ flex: 1 }} />
            {error && <p style={{ margin: 0, fontSize: 12, color: '#DC2626' }}>{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || title.trim().length < 5}
              style={{
                padding: '8px 20px', borderRadius: 8,
                background: (!title.trim() || title.trim().length < 5) ? '#D1D5DB' : '#2A9D8F',
                color: 'white', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Request list */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '20px 0' }}>Loading requests...</p>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>No requests yet. Be the first to suggest a tool!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requests.map(r => {
            const statusInfo = STATUS_LABELS[r.status] || STATUS_LABELS.submitted;
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px', borderRadius: 10,
                  border: '1px solid #F3F4F6',
                  background: r.status === 'published' ? '#F0FDFA' : 'white',
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Upvote button */}
                <button
                  onClick={() => handleUpvote(r.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 2, padding: '6px 8px', borderRadius: 8,
                    border: r.user_upvoted ? '1px solid #2A9D8F' : '1px solid #E5E7EB',
                    background: r.user_upvoted ? '#F0FDFA' : 'white',
                    cursor: 'pointer', minWidth: 44,
                  }}
                >
                  <ChevronUp size={14} style={{ color: r.user_upvoted ? '#2A9D8F' : '#94A3B8' }} />
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: r.user_upvoted ? '#2A9D8F' : '#374151',
                  }}>
                    {r.upvote_count}
                  </span>
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e2749' }}>
                      {r.title}
                    </p>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 99, background: statusInfo.bg, color: statusInfo.color,
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  {r.description && (
                    <p style={{
                      margin: '4px 0 0', fontSize: 12, color: '#6B7280',
                      lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {r.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                    {r.category && (
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{r.category}</span>
                    )}
                    <span style={{ fontSize: 11, color: '#D1D5DB' }}>by {r.author_name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
