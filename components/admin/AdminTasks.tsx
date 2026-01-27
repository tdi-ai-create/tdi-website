'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, X, ExternalLink, Check } from 'lucide-react';

export interface AdminNotification {
  id: string;
  creator_id: string;
  milestone_id: string | null;
  notification_type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  read_by: string | null;
  // Joined data
  creator_name?: string;
  creator_email?: string;
}

interface AdminTasksProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function AdminTasks({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: AdminTasksProps) {
  const [dismissing, setDismissing] = useState<string | null>(null);

  const handleDismiss = async (id: string) => {
    setDismissing(id);
    await onMarkAsRead(id);
    setDismissing(null);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Action Needed
          <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </h2>
        {notifications.length > 1 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Mark all as done
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-lg p-4 flex items-start justify-between gap-4 border border-amber-100"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1e2749]">{notification.title}</p>
              {notification.message && (
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-gray-400">
                  {timeAgo(notification.created_at)}
                </span>
                {notification.creator_name && (
                  <span className="text-xs text-gray-500">
                    {notification.creator_name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href={`/admin/creators/${notification.creator_id}`}
                className="inline-flex items-center gap-1 text-sm text-[#80a4ed] hover:text-[#1e2749] font-medium"
              >
                View
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                onClick={() => handleDismiss(notification.id)}
                disabled={dismissing === notification.id}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                title="Mark as done"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
