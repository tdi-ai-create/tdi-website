'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { TDIAdminProvider, useTDIAdmin } from '@/lib/tdi-admin/context';
import { BookOpen, Palette, Building2, Users, LogOut, ShieldAlert } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

// Navigation tabs configuration
const PORTAL_TABS = [
  { id: 'hub', label: 'Learning Hub', icon: BookOpen, href: '/tdi-admin/hub', section: 'learning_hub', accent: '#5BBEC4' },
  { id: 'creators', label: 'Creator Studio', icon: Palette, href: '/tdi-admin/creators', section: 'creator_studio', accent: '#9B7CB8' },
  { id: 'leadership', label: 'Lead Dashboard', icon: Building2, href: '/tdi-admin/leadership', section: 'leadership', accent: '#E8927C' },
];

function AdminNavbar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabase();
  const { teamMember, canManageTeam, accessibleSections, isOwner } = useTDIAdmin();

  const activeTab = pathname.startsWith('/tdi-admin/hub')
    ? 'hub'
    : pathname.startsWith('/tdi-admin/creators')
      ? 'creators'
      : pathname.startsWith('/tdi-admin/leadership')
        ? 'leadership'
        : 'hub';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/tdi-admin/login');
  };

  // Get accent color for current portal section
  const getActiveAccent = () => {
    const activeTabConfig = PORTAL_TABS.find(t => t.id === activeTab);
    return activeTabConfig?.accent || '#5BBEC4';
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Label */}
          <div className="flex items-center gap-3">
            <Link href="/tdi-admin" className="flex items-center gap-2">
              <img
                src="/images/tdi-logo-mark.png"
                alt="TDI"
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
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

          {/* Center: Portal Tabs - only show tabs user has access to */}
          <nav className="hidden md:flex items-center gap-2">
            {PORTAL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasAccess = isOwner || accessibleSections.includes(tab.section as 'learning_hub' | 'creator_studio' | 'leadership');

              // Only show tabs user has access to (owners see all)
              if (!hasAccess) return null;

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-[20px] font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? `${tab.accent}26` : 'transparent', // 15% opacity
                    color: isActive ? tab.accent : 'white',
                    border: isActive ? `1px solid ${tab.accent}4D` : '1px solid transparent', // 30% opacity
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    height: '36px',
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Team, View Hub, User Menu */}
          <div className="flex items-center gap-3">
            {/* Team & Access button (owner only) */}
            {canManageTeam && (
              <Link
                href="/tdi-admin/team"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{
                  color: pathname === '/tdi-admin/team' ? '#E8B84B' : 'white',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                }}
              >
                <Users size={16} />
                <span className="hidden lg:inline">Team</span>
              </Link>
            )}

            {/* User info */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/20">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: getActiveAccent(), color: '#1a1a2e' }}
              >
                {teamMember?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span
                className="hidden lg:block text-white text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {teamMember?.display_name || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-white/60 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div
        className="md:hidden border-t border-white/10 px-2 py-2 overflow-x-auto"
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <div className="flex gap-2">
          {PORTAL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasAccess = isOwner || accessibleSections.includes(tab.section as 'learning_hub' | 'creator_studio' | 'leadership');

            if (!hasAccess) return null;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? `${tab.accent}26` : 'transparent',
                  color: isActive ? tab.accent : 'white',
                  border: isActive ? `1px solid ${tab.accent}4D` : '1px solid transparent',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function MinimalAdminHeader() {
  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center h-16">
          <Link href="/tdi-admin" className="flex items-center gap-2">
            <img
              src="/images/tdi-logo-mark.png"
              alt="TDI"
              className="h-8 w-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
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

          {/* User info section */}
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
  const { isLoading: adminLoading, hasAccess } = useTDIAdmin();

  // Show loading state while checking admin access
  if (adminLoading) {
    return <LoadingState />;
  }

  // No access to admin portal
  if (!hasAccess) {
    return <AccessDenied userEmail={user?.email} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <AdminNavbar user={user} />
      <main className="pb-16">
        {children}
      </main>
      {/* Footer */}
      <footer
        className="border-t py-6 text-center"
        style={{
          backgroundColor: '#1a1a2e',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <p
          className="text-sm"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          TDI Admin Portal &copy; {new Date().getFullYear()} Teachers Deserve It
        </p>
      </footer>
    </div>
  );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabase();

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Skip auth check for login page
  const isLoginPage = pathname === '/tdi-admin/login';

  useEffect(() => {
    // Don't check auth on login page
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        // Get session first to ensure it's loaded
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('[TDI Admin Layout] Session check:', { session: session ? 'exists' : 'null', sessionError });

        // Then get user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
        console.log('[TDI Admin Layout] User check:', {
          user: currentUser ? { id: currentUser.id, email: currentUser.email } : 'null',
          userError
        });

        if (!currentUser) {
          console.log('[TDI Admin Layout] No user found, redirecting to login');
          router.push('/tdi-admin/login');
          return;
        }

        console.log('[TDI Admin Layout] Setting user:', { id: currentUser.id, email: currentUser.email });
        setUser(currentUser);
      } catch (err) {
        console.error('[TDI Admin Layout] Auth check error:', err);
        router.push('/tdi-admin/login');
      }
      setIsLoading(false);
    }

    checkAuth();
  }, [isLoginPage, router, supabase.auth]);

  // Login page renders without layout wrapper
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingState />;
  }

  // No user (will redirect)
  if (!user) {
    return <LoadingState />;
  }

  // Render with TDIAdminProvider (which checks team membership)
  return (
    <TDIAdminProvider userId={user.id} userEmail={user.email || ''}>
      <AdminLayoutContent user={user}>{children}</AdminLayoutContent>
    </TDIAdminProvider>
  );
}
