'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface MainSiteWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that hides main site chrome (header, footer, popups)
 * when user is on routes with their own navigation (Hub, Admin Portal, Login).
 */
export function MainSiteWrapper({ children }: MainSiteWrapperProps) {
  const pathname = usePathname();
  const isHubRoute = pathname?.startsWith('/hub');
  const isTDIAdminRoute = pathname?.startsWith('/tdi-admin');
  const isLoginPage = pathname === '/login';

  // Don't render main site chrome on Hub, TDI Admin, or Login routes
  if (isHubRoute || isTDIAdminRoute || isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
