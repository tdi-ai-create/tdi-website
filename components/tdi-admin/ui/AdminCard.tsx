'use client';

import { ADMIN_SHADOWS, ADMIN_TRANSITIONS } from './design-tokens';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Base admin card component with consistent styling
 */
export function AdminCard({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: AdminCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 ${paddingClasses[padding]} ${
        hover ? `${ADMIN_TRANSITIONS.default} hover:shadow-md hover:border-gray-200` : ''
      } ${className}`}
      style={{ boxShadow: ADMIN_SHADOWS.card }}
    >
      {children}
    </div>
  );
}

interface AdminSectionCardProps {
  title: string;
  description: string;
  features: string[];
  href: string;
  icon: React.ElementType;
  accentColor: string;
  lightColor: string;
}

/**
 * Section navigation card with icon, description, and feature list
 */
export function AdminSectionCard({
  title,
  description,
  features,
  href,
  icon: Icon,
  accentColor,
  lightColor,
}: AdminSectionCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
      style={{
        boxShadow: ADMIN_SHADOWS.card,
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: lightColor }}
        >
          <Icon size={24} style={{ color: accentColor }} />
        </div>
        <ChevronRight
          size={20}
          className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all"
        />
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
        className="text-sm text-gray-500 mb-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {description}
      </p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-gray-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {feature}
          </li>
        ))}
      </ul>
    </Link>
  );
}

interface AdminCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * Card header with title, optional subtitle, and action
 */
export function AdminCardHeader({ title, subtitle, action }: AdminCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3
          className="text-lg font-semibold"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="text-sm text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default AdminCard;
