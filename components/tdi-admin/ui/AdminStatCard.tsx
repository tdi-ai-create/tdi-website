'use client';

import { ADMIN_SHADOWS, ADMIN_TRANSITIONS, PORTAL_TOKENS } from './design-tokens';

interface AdminStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtitle?: string;
  accentColor: string;
  lightColor?: string; // Deprecated - kept for backwards compat, not used
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Unified stat card component with white background, accent top bar,
 * and hover lift effect. Used across all admin sections.
 *
 * Design system: White bg, gray-100 border, accent top bar
 */
export function AdminStatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  accentColor,
  isActive = false,
  onClick,
  className = '',
}: AdminStatCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`group bg-white rounded-xl text-left border border-gray-100 relative overflow-hidden ${ADMIN_TRANSITIONS.default} ${
        onClick ? 'cursor-pointer hover:border-gray-200' : ''
      } ${className}`}
      style={{
        boxShadow: isActive ? ADMIN_SHADOWS.statActive(accentColor) : PORTAL_TOKENS.cardShadow,
      }}
      onMouseEnter={onClick ? (e) => {
        e.currentTarget.style.boxShadow = PORTAL_TOKENS.cardShadowHover;
        e.currentTarget.style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={onClick ? (e) => {
        e.currentTarget.style.boxShadow = isActive ? ADMIN_SHADOWS.statActive(accentColor) : PORTAL_TOKENS.cardShadow;
        e.currentTarget.style.transform = 'translateY(0)';
      } : undefined}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: accentColor }} />

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-2xl font-bold mb-1 transition-transform duration-200 group-hover:-translate-y-0.5"
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
      </div>
    </Component>
  );
}

/**
 * Compact variant of the stat card for tighter layouts
 * White bg with accent top bar
 */
export function AdminStatCardCompact({
  icon: Icon,
  label,
  value,
  accentColor,
}: Omit<AdminStatCardProps, 'isActive' | 'onClick' | 'subtitle' | 'className' | 'lightColor'>) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 relative overflow-hidden"
      style={{ boxShadow: PORTAL_TOKENS.cardShadow }}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: accentColor }} />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
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
    </div>
  );
}

export default AdminStatCard;
