'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface MainSiteWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that hides main site chrome (header, footer, popups)
 * when user is on /hub routes. The Hub has its own navigation.
 */
export function MainSiteWrapper({ children }: MainSiteWrapperProps) {
  const pathname = usePathname();
  const isHubRoute = pathname?.startsWith('/hub');

  // Don't render main site chrome on Hub routes
  if (isHubRoute) {
    return null;
  }

  return <>{children}</>;
}
