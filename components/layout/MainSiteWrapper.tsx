'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface MainSiteWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that hides main site chrome (header, footer, popups)
 * when user is on routes with their own navigation (Hub, Admin Portal, Login, Partner Dashboards).
 */
export function MainSiteWrapper({ children }: MainSiteWrapperProps) {
  const pathname = usePathname();
  const isHubRoute = pathname?.startsWith('/hub');
  const isTDIAdminRoute = pathname?.startsWith('/tdi-admin');
  const isLoginPage = pathname === '/login';
  const isDashboardRoute = pathname?.toLowerCase().includes('-dashboard');
  // Partner portal dashboard routes (exclude login/reset-password which have their own layouts)
  const isPartnerDashboard = pathname?.startsWith('/partners/') &&
    !pathname?.startsWith('/partners/login') &&
    !pathname?.startsWith('/partners/reset-password');
  // Client-facing quote signing pages
  const isInvoiceRoute = pathname?.startsWith('/invoice');

  // Don't render main site chrome on Hub, TDI Admin, Login, Partner Dashboard, or Invoice routes
  if (isHubRoute || isTDIAdminRoute || isLoginPage || isDashboardRoute || isPartnerDashboard || isInvoiceRoute) {
    return null;
  }

  return <>{children}</>;
}
