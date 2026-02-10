'use client';

import { usePathname } from 'next/navigation';

export function AnnouncementBar() {
  const pathname = usePathname();

  // Hide on create-with-us page (has its own Creator Portal banner)
  // Hide on creator-portal/dashboard (focused studio experience)
  // Hide on admin pages
  // Hide on partner setup and login pages (focused onboarding experience)
  if (
    pathname === '/create-with-us' ||
    pathname?.startsWith('/creator-portal/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/partner-setup') ||
    pathname?.startsWith('/partners')
  ) {
    return null;
  }

  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-center"
      style={{ backgroundColor: '#1e2749' }}
    >
      <p className="text-sm text-center" style={{ color: '#ffffff' }}>
        Already a member?{' '}
        <a
          href="https://tdi.thinkific.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#ffba06' }}
        >
          Go to Learning Hub →
        </a>
      </p>
    </div>
  );
}
