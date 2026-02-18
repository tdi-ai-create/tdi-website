'use client';

import { ADMIN_TRANSITIONS } from './design-tokens';

interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: number | string;
  disabled?: boolean;
}

interface AdminTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accentColor: string;
  className?: string;
}

/**
 * Horizontal tab navigation component
 */
export function AdminTabs({
  tabs,
  activeTab,
  onTabChange,
  accentColor,
  className = '',
}: AdminTabsProps) {
  return (
    <div className={`flex flex-wrap gap-2 border-b border-gray-200 pb-1 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium ${ADMIN_TRANSITIONS.default} relative ${
              tab.disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              backgroundColor: isActive ? 'white' : 'transparent',
              color: isActive ? accentColor : '#6B7280',
              borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {Icon && <Icon size={18} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface AdminPillTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  accentColor: string;
  lightColor: string;
  className?: string;
}

/**
 * Pill-style tabs for inline tab switching
 */
export function AdminPillTabs({
  tabs,
  activeTab,
  onTabChange,
  accentColor,
  lightColor,
  className = '',
}: AdminPillTabsProps) {
  return (
    <div className={`flex gap-2 bg-gray-100 rounded-lg p-1 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${ADMIN_TRANSITIONS.fast} ${
              tab.disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              backgroundColor: isActive ? 'white' : 'transparent',
              color: isActive ? accentColor : '#6B7280',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default AdminTabs;
