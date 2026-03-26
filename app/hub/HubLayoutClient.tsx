'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import HubAuthGuard from '@/components/hub/HubAuthGuard';
import HubNavBar from '@/components/hub/HubNavBar';
import HubFooter from '@/components/hub/HubFooter';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';

const CheckInSlideUp = dynamic(() => import('@/components/hub/CheckInSlideUp'), { ssr: false });

// Routes that should NOT show the Hub nav bar
const NO_NAV_ROUTES = ['/hub/login', '/hub/verify', '/hub/onboarding'];

function HubLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, user } = useHub();
  const [showCheckIn, setShowCheckIn] = useState(false);

  const showNav = !NO_NAV_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (!user?.id) return;

    // Only show on hub pages (not login, onboarding, admin)
    const path = window.location.pathname;
    const isHubPage = path.startsWith('/hub') &&
      !path.includes('/login') &&
      !path.includes('/onboarding') &&
      !path.includes('/admin') &&
      !path.includes('/verify');

    if (!isHubPage) return;

    // Check if teacher already answered today
    const checkTodayCheckIn = async () => {
      const supabase = getSupabase();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('hub_assessments')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'daily_check_in')
        .gte('created_at', today.toISOString())
        .limit(1);

      // Show slide-up if no check-in today
      // Small delay so the page loads first
      if (!data || data.length === 0) {
        setTimeout(() => setShowCheckIn(true), 1200);
      }
    };

    checkTodayCheckIn();
  }, [user?.id]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F0EEE9' }}
    >
      {showNav && (
        <HubNavBar profile={profile} userEmail={user?.email} userId={user?.id} />
      )}
      <main className={`flex-1 ${showNav ? 'pt-[60px]' : ''}`}>
        {children}
      </main>
      {showNav && <HubFooter />}
      {showCheckIn && (
        <CheckInSlideUp onDismiss={() => setShowCheckIn(false)} />
      )}
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
      <div className="min-h-screen" style={{ backgroundColor: '#F0EEE9' }}>
        {children}
      </div>
    );
  }

  // For verify page (public), render without auth guard but check in HubAuthGuard
  if (pathname.startsWith('/hub/verify')) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F0EEE9' }}>
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

  // For admin pages, go through auth guard but let admin layout handle nav/footer
  if (pathname.startsWith('/hub/admin')) {
    return (
      <HubAuthGuard>
        {children}
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
