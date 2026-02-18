'use client';

import { useState } from 'react';
import { ChevronLeft, Menu } from 'lucide-react';
import { ADMIN_TRANSITIONS } from './design-tokens';

interface SidebarTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface AdminSidebarProps {
  tabs: SidebarTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  title: string;
  titleIcon: React.ElementType;
  accentColor: string;
  children?: React.ReactNode;
}

/**
 * Left sidebar navigation component matching Creator Studio pattern.
 * Collapsible on mobile with overlay.
 */
export function AdminSidebar({
  tabs,
  activeTab,
  onTabChange,
  title,
  titleIcon: TitleIcon,
  accentColor,
  children,
}: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform ${ADMIN_TRANSITIONS.default} ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ boxShadow: '1px 0 3px rgba(0,0,0,0.03)' }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: accentColor }}
              >
                <TitleIcon className="w-4 h-4 text-white" />
              </div>
              <span
                className="font-semibold text-gray-900"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {title}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {tabs.map((tab) => (
              <SidebarNavItem
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setSidebarOpen(false);
                }}
                icon={tab.icon}
                accentColor={accentColor}
              >
                {tab.label}
              </SidebarNavItem>
            ))}
          </nav>

          {/* Optional footer content */}
          {children}
        </div>
      </aside>

      {/* Mobile toggle button - rendered separately, use AdminSidebarToggle in your layout */}
    </>
  );
}

interface SidebarNavItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  accentColor: string;
  children: React.ReactNode;
}

/**
 * Individual sidebar navigation item
 */
export function SidebarNavItem({
  active,
  onClick,
  icon: Icon,
  accentColor,
  children,
}: SidebarNavItemProps) {
  const activeStyles = {
    backgroundColor: `${accentColor}10`,
    color: accentColor,
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${ADMIN_TRANSITIONS.default} text-left ${
        active ? '' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
      style={active ? activeStyles : undefined}
    >
      <Icon
        size={20}
        className={active ? '' : 'text-gray-400'}
        style={active ? { color: accentColor } : undefined}
      />
      <span className={active ? 'font-semibold' : ''}>{children}</span>
    </button>
  );
}

interface AdminSidebarToggleProps {
  onClick: () => void;
}

/**
 * Mobile toggle button for opening the sidebar
 */
export function AdminSidebarToggle({ onClick }: AdminSidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <Menu className="w-5 h-5 text-gray-600" />
    </button>
  );
}

interface AdminSidebarLayoutProps {
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Layout wrapper for sidebar + main content pattern
 */
export function AdminSidebarLayout({
  sidebar,
  header,
  children,
}: AdminSidebarLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#FAFBFC]">
      {sidebar}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {header && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="px-6 py-4">{header}</div>
          </header>
        )}

        <div className="px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

export default AdminSidebar;
