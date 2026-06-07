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
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginPage = pathname === '/login';
  const isDashboardRoute = pathname?.toLowerCase().includes('-dashboard');
  const isCreatorPortal = pathname?.startsWith('/creator-portal');
  // All partner routes have their own layouts
  const isPartnerRoute = pathname?.startsWith('/partners/');
  // Client-facing quote signing pages
  const isInvoiceRoute = pathname?.startsWith('/invoice');

  // Don't render main site chrome on portal routes
  if (isHubRoute || isTDIAdminRoute || isAdminRoute || isLoginPage || isDashboardRoute || isCreatorPortal || isPartnerRoute || isInvoiceRoute) {
    return null;
  }

  return <>{children}</>;
}
