'use client';

import { useHub } from '@/components/hub/HubContext';
import HubAdminNavBar from '@/components/hub/HubAdminNavBar';
import HubFooter from '@/components/hub/HubFooter';

export default function HubAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, user } = useHub();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      <HubAdminNavBar profile={profile} userEmail={user?.email} />
      <main className="flex-1 pt-[60px]">
        {children}
      </main>
      <HubFooter />
    </div>
  );
}
