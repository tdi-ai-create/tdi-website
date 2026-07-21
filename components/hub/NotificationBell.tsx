'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useHub } from '@/components/hub/HubContext';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

const DOT_COLORS: Record<string, string> = {
  qa_reply: '#2563EB',
  helpful_marked: '#E8B84B',
  post_pinned: '#7C3AED',
  badge_earned: '#059669',
  certificate_ready: '#2A9D8F',
  new_content: '#EA580C',
  streak_milestone: '#E53935',
  profile_quiz: '#0891B2',
  community_highlight: '#6366F1',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function NotificationBell() {
  const { user } = useHub();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/hub/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch { /* silent */ }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  async function markAllRead() {
    if (!user?.id) return;
    setLoading(true);
    try {
      await fetch('/api/hub/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  if (!user?.id) return null;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 transition-colors hover:opacity-80 relative"
        style={{ color: 'rgba(255,255,255,0.45)' }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute flex items-center justify-center"
            style={{
              top: 2, right: 2,
              width: 16, height: 16,
              borderRadius: '50%',
              background: '#E53935',
              color: 'white',
              fontSize: 9,
              fontWeight: 700,
              border: '2px solid #1e2749',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 z-50"
          style={{
            width: 360,
            background: 'white',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <span className="text-sm font-bold" style={{ color: '#1e2749' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="text-xs font-semibold border-none bg-transparent cursor-pointer"
                style={{ color: '#2A9D8F' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Bell size={24} style={{ color: '#94A3B8', margin: '0 auto 8px', display: 'block' }} />
                <p className="text-sm font-semibold" style={{ color: '#374151' }}>No notifications yet</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>When someone replies to your posts or finds them helpful, you will see it here.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const dotColor = DOT_COLORS[n.type] || '#94A3B8';
                const content = (
                  <div
                    key={n.id}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                    style={{
                      borderBottom: '1px solid #F9FAFB',
                      background: n.read ? 'white' : '#F0FDFA',
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: dotColor, flexShrink: 0, marginTop: 6,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-xs font-semibold" style={{ color: '#1e2749', marginBottom: 2 }}>{n.title}</p>
                      {n.body && (
                        <p className="text-xs" style={{
                          color: '#6B7280', lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>{n.body}</p>
                      )}
                      <p className="text-xs" style={{ color: '#94A3B8', marginTop: 4 }}>{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
