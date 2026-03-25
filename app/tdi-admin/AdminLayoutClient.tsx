'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { TDIAdminProvider, useTDIAdmin } from '@/lib/tdi-admin/context';
import { ShieldAlert, LogOut, Settings } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

// Portal accent colors - Approved color system v1.0
const PORTAL_COLORS = {
  hub: { accent: '#00B5AD', light: '#E0F7F6', bg15: 'rgba(0, 181, 173, 0.15)', border30: 'rgba(0, 181, 173, 0.3)' },
  creators: { accent: '#8B5CF6', light: '#EDE9FE', bg15: 'rgba(139, 92, 246, 0.15)', border30: 'rgba(139, 92, 246, 0.3)' },
  leadership: { accent: '#16A34A', light: '#DCFCE7', bg15: 'rgba(22, 163, 74, 0.15)', border30: 'rgba(22, 163, 74, 0.3)' },
  intelligence: { accent: '#F59E0B', light: '#FEF3C7', bg15: 'rgba(245, 158, 11, 0.15)', border30: 'rgba(245, 158, 11, 0.3)' },
  sales: { accent: '#6366F1', light: '#EEF2FF', bg15: 'rgba(99, 102, 241, 0.15)', border30: 'rgba(99, 102, 241, 0.3)' },
  funding: { accent: '#10B981', light: '#D1FAE5', bg15: 'rgba(16, 185, 129, 0.15)', border30: 'rgba(16, 185, 129, 0.3)' },
  team: { accent: '#6B7280', light: '#F3F4F6', bg15: 'rgba(107, 114, 128, 0.15)', border30: 'rgba(107, 114, 128, 0.3)' },
};

// Navigation items - order: Sales, Learning Hub, Lead Dashboard, Creator Studio, Operations, Funding
const NAV_ITEMS = [
  {
    id: 'sales',
    label: 'Sales',
    href: '/tdi-admin/sales',
    section: 'sales',
    accent: PORTAL_COLORS.sales.accent,
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    id: 'hub',
    label: 'Learning Hub',
    href: '/tdi-admin/hub',
    section: 'learning_hub',
    accent: PORTAL_COLORS.hub.accent,
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    id: 'leadership',
    label: 'Lead Dashboard',
    href: '/tdi-admin/leadership',
    section: 'leadership',
    accent: PORTAL_COLORS.leadership.accent,
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    id: 'creators',
    label: 'Creator Studio',
    href: '/tdi-admin/creators',
    section: 'creator_studio',
    accent: PORTAL_COLORS.creators.accent,
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    id: 'intelligence',
    label: 'Operations',
    href: '/tdi-admin/intelligence',
    section: 'intelligence',
    accent: PORTAL_COLORS.intelligence.accent,
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
  },
  {
    id: 'funding',
    label: 'Funding',
    href: '/tdi-admin/funding',
    section: 'funding',
    accent: PORTAL_COLORS.funding.accent,
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
];

function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabase();
  const { teamMember, canManageTeam, accessibleSections, isOwner } = useTDIAdmin();

  // Collapsed state with localStorage persistence
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tdi-sidebar-collapsed') === 'true';
    }
    return false;
  });

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tdi-sidebar-collapsed', String(next));
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/tdi-admin/login');
  };

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  function getActiveItem() {
    return NAV_ITEMS.find(item => pathname.startsWith(item.href));
  }

  const activeItem = getActiveItem();
  const activeAccent = activeItem?.accent ?? PORTAL_COLORS.intelligence.accent;
  const isTeamActive = pathname.startsWith('/tdi-admin/team');

  return (
    <>
      {/* LEFT SIDEBAR */}
      <aside className={`${collapsed ? 'w-16' : 'w-16 lg:w-56'} flex-shrink-0 bg-[#0f172a] flex flex-col h-full transition-all duration-200 ease-in-out`}>
        {/* Logo / Wordmark */}
        <div className={`px-3 ${collapsed ? '' : 'lg:px-4'} py-5 border-b border-white/10 flex items-center`}>
          <Link href="/tdi-admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            {!collapsed && (
              <div className="hidden lg:block">
                <p className="text-white font-bold text-sm leading-tight">Admin Portal</p>
                <p className="text-gray-400 text-xs">Teachers Deserve It</p>
              </div>
            )}
          </Link>
          <button
            onClick={toggleCollapsed}
            className="ml-auto text-gray-500 hover:text-white transition-colors p-1 rounded"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href);
            // Check access - owners see all, others need section access
            const hasAccess = isOwner || accessibleSections.includes(item.section as 'learning_hub' | 'creator_studio' | 'leadership');

            if (!hasAccess) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-2 ${collapsed ? '' : 'lg:px-3'} py-2.5 rounded-lg transition-all group ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={active ? { borderLeft: `3px solid ${item.accent}`, paddingLeft: '9px' } : {}}
                title={item.label}
              >
                <span
                  style={{ color: active ? item.accent : undefined }}
                  className={`flex-shrink-0 transition-colors ${!active ? 'group-hover:text-white' : ''}`}
                >
                  {item.icon(active)}
                </span>
                {!collapsed && <span className="hidden lg:block text-sm font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom - Settings + User */}
        <div className="px-2 py-4 border-t border-white/10 space-y-1">
          {/* Settings gear (only for team managers) */}
          {canManageTeam && (
            <Link
              href="/tdi-admin/team"
              className={`flex items-center gap-3 px-2 ${collapsed ? '' : 'lg:px-3'} py-2.5 rounded-lg transition-all group ${
                isTeamActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Settings & Team Access"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="hidden lg:block text-sm font-medium">Settings</span>}
            </Link>
          )}

          {/* User + logout */}
          <div className={`flex items-center gap-3 px-2 ${collapsed ? '' : 'lg:px-3'} py-2.5`}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
              style={{ backgroundColor: activeAccent }}
            >
              {teamMember?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="hidden lg:flex flex-1 items-center justify-between min-w-0">
                <p className="text-gray-300 text-xs truncate">
                  {teamMember?.display_name || user?.email?.split('@')[0]}
                </p>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-white transition-colors ml-2 flex-shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </aside>

      {/* Accent bar storage for main content */}
      <style jsx global>{`
        :root {
          --admin-active-accent: ${activeAccent};
        }
      `}</style>
    </>
  );
}

function MinimalAdminHeader() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: '#0f172a' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center h-16">
          <Link href="/tdi-admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span
              className="font-bold text-lg"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#E8B84B',
              }}
            >
              ADMIN PORTAL
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function AccessDenied({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const supabase = getSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/tdi-admin/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <MinimalAdminHeader />
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <ShieldAlert size={32} style={{ color: '#DC2626' }} />
          </div>
          <h1
            className="font-bold mb-3"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            Access Denied
          </h1>
          <p
            className="mb-4"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#6B7280',
            }}
          >
            You don&apos;t have access to the TDI Admin Portal. Contact Rae if you believe this is an error.
          </p>

          {userEmail ? (
            <div
              className="mb-6 py-3 px-4 rounded-lg"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#6B7280',
                }}
              >
                You are signed in as: <strong style={{ color: '#374151' }}>{userEmail}</strong>
              </p>
              <button
                onClick={handleSignOut}
                className="mt-2 text-sm underline hover:no-underline"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2B3A67',
                }}
              >
                Sign in with a different account
              </button>
            </div>
          ) : (
            <div
              className="mb-6 py-3 px-4 rounded-lg"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#6B7280',
                }}
              >
                You are not signed in.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!userEmail && (
              <Link
                href="/tdi-admin/login"
                className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Sign In
              </Link>
            )}
            <Link
              href="/hub"
              className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: userEmail ? '#E8B84B' : '#F3F4F6',
                color: userEmail ? '#2B3A67' : '#374151',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Go to Learning Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <div className="text-center">
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Loading admin portal...
        </p>
      </div>
    </div>
  );
}

function AdminLayoutContent({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const { isLoading: adminLoading, hasAccess } = useTDIAdmin();

  // Determine active accent color for the top bar
  const activeItem = NAV_ITEMS.find(item => pathname.startsWith(item.href));
  const isTeamPage = pathname.startsWith('/tdi-admin/team');
  const activeAccent = isTeamPage
    ? PORTAL_COLORS.team.accent
    : activeItem?.accent ?? PORTAL_COLORS.intelligence.accent;

  if (adminLoading) {
    return <LoadingState />;
  }

  if (!hasAccess) {
    return <AccessDenied userEmail={user?.email} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar user={user} />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* Thin accent bar at top matching active section color */}
        <div className="h-0.5 w-full" style={{ backgroundColor: activeAccent }} />
        <div className="pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabase();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const isLoginPage = pathname === '/tdi-admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        router.replace('/tdi-admin/login');
      }
    }, 3000);

    async function checkAuth() {
      try {
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));

        const result = await Promise.race([userPromise, timeoutPromise]);

        if (!isMounted) return;

        if (!result || 'error' in result === false) {
          router.replace('/tdi-admin/login');
          return;
        }

        const { data: { user: currentUser }, error: userError } = result;

        if (!currentUser || userError) {
          router.replace('/tdi-admin/login');
          return;
        }

        setUser(currentUser);
        setIsLoading(false);
      } catch (err) {
        console.error('[TDI Admin] Auth check error:', err);
        if (isMounted) {
          router.replace('/tdi-admin/login');
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isLoginPage, router, supabase.auth, isLoading]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <LoadingState />;
  }

  return (
    <TDIAdminProvider userId={user.id} userEmail={user.email || ''}>
      <AdminLayoutContent user={user}>{children}</AdminLayoutContent>
    </TDIAdminProvider>
  );
}
