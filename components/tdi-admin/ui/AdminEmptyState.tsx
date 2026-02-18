'use client';

import { Loader2 } from 'lucide-react';

interface AdminEmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  accentColor?: string;
  lightColor?: string;
}

/**
 * Empty state component with icon, message, and optional action
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  accentColor = '#6B5CE7',
  lightColor = '#F3EDF8',
}: AdminEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div
        className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ backgroundColor: lightColor }}
      >
        <Icon size={32} style={{ color: accentColor }} />
      </div>
      <h3
        className="font-semibold text-lg mb-2"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#2B3A67',
        }}
      >
        {title}
      </h3>
      <p
        className="text-gray-500 mb-6 max-w-md mx-auto"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {description}
      </p>
      {action}
    </div>
  );
}

interface AdminLoadingStateProps {
  message?: string;
  accentColor?: string;
}

/**
 * Loading state with spinner
 */
export function AdminLoadingState({
  message = 'Loading...',
  accentColor = '#6B5CE7',
}: AdminLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2
        className="w-8 h-8 animate-spin mb-4"
        style={{ color: accentColor }}
      />
      <p
        className="text-gray-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {message}
      </p>
    </div>
  );
}

interface AdminAccessDeniedProps {
  icon: React.ElementType;
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  accentColor?: string;
}

/**
 * Access denied state
 */
export function AdminAccessDenied({
  icon: Icon,
  title = 'Access Restricted',
  message = "You don't have permission to access this section. Contact your administrator to request access.",
  actionLabel = 'Go to Dashboard',
  actionHref = '/tdi-admin/hub',
  accentColor = '#DC2626',
}: AdminAccessDeniedProps) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <Icon size={32} style={{ color: accentColor }} />
        </div>
        <h1
          className="font-bold mb-3"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '24px',
            color: '#2B3A67',
          }}
        >
          {title}
        </h1>
        <p
          className="mb-6 max-w-md mx-auto"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            color: '#6B7280',
          }}
        >
          {message}
        </p>
        <a
          href={actionHref}
          className="inline-block px-6 py-3 rounded-lg font-medium transition-colors bg-[#E8B84B] hover:bg-[#D4A63A]"
          style={{
            color: '#2B3A67',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
}

interface AdminSkeletonProps {
  className?: string;
}

/**
 * Skeleton loading placeholder
 */
export function AdminSkeleton({ className = '' }: AdminSkeletonProps) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
  );
}

/**
 * Skeleton stat card for loading states
 */
export function AdminStatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <AdminSkeleton className="h-8 w-16 mb-2" />
          <AdminSkeleton className="h-4 w-24" />
        </div>
        <AdminSkeleton className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton table row for loading states
 */
export function AdminTableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <AdminSkeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default AdminEmptyState;
