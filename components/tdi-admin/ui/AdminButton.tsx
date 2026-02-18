'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ADMIN_TRANSITIONS } from './design-tokens';

interface AdminButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  accentColor?: string;
  type?: 'button' | 'submit';
}

/**
 * Unified button component for admin sections
 */
export function AdminButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  accentColor = '#6B5CE7',
  type = 'button',
}: AdminButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: accentColor,
          color: 'white',
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          color: accentColor,
          border: `1.5px solid ${accentColor}`,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#374151',
          border: '1px solid #E5E7EB',
        };
      case 'danger':
        return {
          backgroundColor: '#DC2626',
          color: 'white',
          border: 'none',
        };
      default:
        return {};
    }
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-lg font-medium ${ADMIN_TRANSITIONS.default} ${sizeClasses[size]} ${className}`;
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90';

  const styles = getVariantStyles();

  const content = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${disabledClasses}`}
        style={{
          ...styles,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${disabledClasses}`}
      style={{
        ...styles,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {content}
    </button>
  );
}

interface AdminIconButtonProps {
  onClick?: () => void;
  icon: React.ReactNode;
  title?: string;
  variant?: 'default' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Icon-only button for actions
 */
export function AdminIconButton({
  onClick,
  icon,
  title,
  variant = 'default',
  size = 'sm',
  className = '',
}: AdminIconButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  const variantClasses = {
    default: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    danger: 'text-red-500 hover:bg-red-50',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded ${ADMIN_TRANSITIONS.fast} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {icon}
    </button>
  );
}

interface AdminQuickActionProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor: string;
  lightColor: string;
}

/**
 * Quick action link button
 */
export function AdminQuickAction({
  href,
  icon,
  children,
  accentColor,
  lightColor,
}: AdminQuickActionProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${ADMIN_TRANSITIONS.default}`}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: accentColor,
        border: `1.5px solid ${accentColor}`,
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = lightColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

export default AdminButton;
