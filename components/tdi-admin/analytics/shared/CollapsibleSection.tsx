'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ADMIN_SHADOWS, ADMIN_TRANSITIONS } from '../../ui/design-tokens';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';

const theme = PORTAL_THEMES.hub;

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  children,
  defaultOpen = true,
  badge,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: ADMIN_SHADOWS.card }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 flex items-center justify-between ${ADMIN_TRANSITIONS.default} hover:bg-gray-50`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                {title}
              </h2>
              {badge && (
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${theme.primary}15`,
                    color: theme.primary,
                  }}
                >
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p
                className="text-sm text-gray-500 mt-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${theme.primary}10` }}
        >
          {isOpen ? (
            <ChevronUp size={18} style={{ color: theme.primary }} />
          ) : (
            <ChevronDown size={18} style={{ color: theme.primary }} />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
