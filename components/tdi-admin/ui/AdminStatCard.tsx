'use client';

import { ADMIN_SHADOWS, ADMIN_TRANSITIONS } from './design-tokens';

interface AdminStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtitle?: string;
  accentColor: string;
  lightColor: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Unified stat card component with tinted background, left border accent,
 * and hover lift effect. Used across all admin sections.
 */
export function AdminStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  accentColor,
  lightColor,
  isActive = false,
  onClick,
  className = '',
}: AdminStatCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`group bg-white rounded-xl p-5 text-left ${ADMIN_TRANSITIONS.default} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        backgroundColor: lightColor,
        borderLeft: `3px solid ${accentColor}`,
        boxShadow: isActive ? ADMIN_SHADOWS.statActive(accentColor) : ADMIN_SHADOWS.card,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-[28px] font-bold mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: accentColor,
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p
            className="text-sm text-gray-500 font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {label}
          </p>
          {subtitle && (
            <p
              className="text-xs text-gray-400 mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: accentColor }} />
        </div>
      </div>
    </Component>
  );
}

/**
 * Compact variant of the stat card for tighter layouts
 */
export function AdminStatCardCompact({
  icon: Icon,
  label,
  value,
  accentColor,
  lightColor,
}: Omit<AdminStatCardProps, 'isActive' | 'onClick' | 'subtitle' | 'className'>) {
  return (
    <div
      className="bg-white rounded-xl p-4 border border-gray-100"
      style={{ boxShadow: ADMIN_SHADOWS.card }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: lightColor }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
      </div>
      <p
        className="font-bold text-2xl mb-1"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: accentColor,
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p
        className="text-sm text-gray-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </p>
    </div>
  );
}

export default AdminStatCard;
