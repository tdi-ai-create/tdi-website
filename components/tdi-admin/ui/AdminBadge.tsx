'use client';

import { STATUS_COLORS, PRIORITY_COLORS } from './design-tokens';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Status badge with consistent styling
 */
export function AdminBadge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  icon,
}: AdminBadgeProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: STATUS_COLORS.success,
    warning: STATUS_COLORS.warning,
    error: STATUS_COLORS.error,
    info: STATUS_COLORS.info,
    neutral: STATUS_COLORS.neutral,
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {icon}
      {children}
    </span>
  );
}

interface AdminPriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

/**
 * Priority badge with color-coded styling
 */
export function AdminPriorityBadge({
  priority,
  className = '',
}: AdminPriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[priority]} ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {priority}
    </span>
  );
}

interface AdminPhaseBadgeProps {
  phase: string;
  className?: string;
}

/**
 * Phase badge for contract phases (IGNITE, ACCELERATE, SUSTAIN)
 */
export function AdminPhaseBadge({ phase, className = '' }: AdminPhaseBadgeProps) {
  const phaseColors: Record<string, string> = {
    IGNITE: 'bg-amber-100 text-amber-700',
    ACCELERATE: 'bg-teal-100 text-teal-700',
    SUSTAIN: 'bg-green-100 text-green-700',
    // Creator phases
    onboarding: 'bg-purple-100 text-purple-700',
    agreement: 'bg-blue-100 text-blue-700',
    course_design: 'bg-indigo-100 text-indigo-700',
    production: 'bg-amber-100 text-amber-700',
    launch: 'bg-green-100 text-green-700',
  };

  const displayName: Record<string, string> = {
    onboarding: 'Onboarding',
    agreement: 'Agreement',
    course_design: 'Prep & Resources',
    test_prep: 'Production',
    production: 'Production',
    launch: 'Launch',
    IGNITE: 'IGNITE',
    ACCELERATE: 'ACCELERATE',
    SUSTAIN: 'SUSTAIN',
  };

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
        phaseColors[phase] || 'bg-gray-100 text-gray-700'
      } ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {displayName[phase] || phase}
    </span>
  );
}

interface AdminStatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Generic status badge
 */
export function AdminStatusBadge({ status, className = '' }: AdminStatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    invited: 'bg-gray-100 text-gray-600 border-gray-200',
    setup_in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
    paused: 'bg-orange-100 text-orange-700 border-orange-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    published: 'bg-green-100 text-green-700 border-green-200',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
    archived: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  const displayLabels: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    invited: 'Invited',
    setup_in_progress: 'Setup In Progress',
    paused: 'Paused',
    completed: 'Completed',
    published: 'Published',
    draft: 'Draft',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    archived: 'Archived',
  };

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${
        statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
      } ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {displayLabels[status] || status.replace(/_/g, ' ')}
    </span>
  );
}

export default AdminBadge;
