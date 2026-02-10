'use client';

import { usePathname } from 'next/navigation';
import HubAuthGuard from '@/components/hub/HubAuthGuard';
import HubNavBar from '@/components/hub/HubNavBar';
import HubFooter from '@/components/hub/HubFooter';
import { useHub } from '@/components/hub/HubContext';

// Routes that should NOT show the Hub nav bar
const NO_NAV_ROUTES = ['/hub/login', '/hub/verify', '/hub/onboarding'];

function HubLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, user } = useHub();

  const showNav = !NO_NAV_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      {showNav && (
        <HubNavBar profile={profile} userEmail={user?.email} />
      )}
      <main className={`flex-1 ${showNav ? 'pt-[60px]' : ''}`}>
        {children}
      </main>
      {showNav && <HubFooter />}
    </div>
  );
}

export default function HubLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // For login page, render without auth guard
  if (pathname === '/hub/login' || pathname.startsWith('/hub/auth')) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
        {children}
      </div>
    );
  }

  // For verify page (public), render without auth guard but check in HubAuthGuard
  if (pathname.startsWith('/hub/verify')) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
        {children}
      </div>
    );
  }

  // For onboarding page, go through auth guard but skip the inner layout (no nav)
  if (pathname.startsWith('/hub/onboarding')) {
    return (
      <HubAuthGuard>
        <div className="min-h-screen">
          {children}
        </div>
      </HubAuthGuard>
    );
  }

  // All other routes go through auth guard
  return (
    <HubAuthGuard>
      <HubLayoutInner>{children}</HubLayoutInner>
    </HubAuthGuard>
  );
}
