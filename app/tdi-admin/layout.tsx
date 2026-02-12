'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import HubAuthGuard from '@/components/hub/HubAuthGuard';
import { TDIAdminProvider, useTDIAdmin } from '@/lib/tdi-admin/context';
import { signOut } from '@/lib/hub-auth';
import { BookOpen, Palette, Building2, Users, ExternalLink, LogOut, ShieldAlert } from 'lucide-react';

// Navigation tabs configuration
const PORTAL_TABS = [
  { id: 'hub', label: 'Learning Hub', icon: BookOpen, href: '/tdi-admin/hub' },
  { id: 'creators', label: 'Creator Studio', icon: Palette, href: '/tdi-admin/creators' },
  { id: 'leadership', label: 'Leadership', icon: Building2, href: '/tdi-admin/leadership' },
];

function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useHub();
  const { teamMember, canManageTeam, accessibleSections } = useTDIAdmin();

  const activeTab = pathname.startsWith('/tdi-admin/hub')
    ? 'hub'
    : pathname.startsWith('/tdi-admin/creators')
      ? 'creators'
      : pathname.startsWith('/tdi-admin/leadership')
        ? 'leadership'
        : 'hub';

  const handleSignOut = async () => {
    await signOut();
    router.push('/hub/login');
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: '#2B3A67' }}
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

          {/* Center: Portal Tabs */}
          <nav className="hidden md:flex items-center gap-2">
            {PORTAL_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasAccess = accessibleSections.includes(tab.id as 'learning_hub' | 'creator_studio' | 'leadership') ||
                (tab.id === 'hub' && accessibleSections.includes('learning_hub')) ||
                (tab.id === 'creators' && accessibleSections.includes('creator_studio'));

              // Don't render tabs user doesn't have access to
              // For now, show all tabs but disable if no access
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-[20px] font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? '#E8B84B' : 'transparent',
                    color: isActive ? '#2B3A67' : 'white',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    height: '36px',
                    opacity: hasAccess || teamMember?.role === 'owner' ? 1 : 0.5,
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

            {/* View as Teacher link */}
            <Link
              href="/hub"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
              }}
            >
              <ExternalLink size={14} />
              <span className="hidden lg:inline">View as Teacher</span>
            </Link>

            {/* User info */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/20">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: '#E8B84B', color: '#2B3A67' }}
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
        style={{ backgroundColor: '#2B3A67' }}
      >
        <div className="flex gap-2">
          {PORTAL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? '#E8B84B' : 'transparent',
                  color: isActive ? '#2B3A67' : 'white',
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
      style={{ backgroundColor: '#2B3A67' }}
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/hub/login');
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
            You don&apos;t have access to the TDI Admin Portal. Contact your TDI administrator if you believe this is an error.
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
                href="/hub/login?redirect=/tdi-admin"
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
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"
          style={{ backgroundColor: '#E8B84B' }}
        />
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

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading: hubLoading } = useHub();
  const { isLoading: adminLoading, hasAccess, teamMember } = useTDIAdmin();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!hubLoading && !user) {
      router.push('/hub/login?redirect=/tdi-admin');
    }
  }, [hubLoading, user, router]);

  // Show loading state
  if (hubLoading || adminLoading) {
    return <LoadingState />;
  }

  // Not logged in
  if (!user) {
    return <LoadingState />;
  }

  // No access
  if (!hasAccess) {
    return <AccessDenied userEmail={user?.email} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <AdminNavbar />
      <main className="pb-16">
        {children}
      </main>
      {/* Footer */}
      <footer
        className="border-t py-6 text-center"
        style={{
          backgroundColor: '#2B3A67',
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

export default function TDIAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <HubAuthGuard>
      <TDIAdminProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </TDIAdminProvider>
    </HubAuthGuard>
  );
}
