'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTDIAdmin } from '@/lib/tdi-admin/context';

export default function TDIAdminPage() {
  const router = useRouter();
  const { accessibleSections, isLoading, hasAccess } = useTDIAdmin();

  useEffect(() => {
    if (isLoading) return;

    if (!hasAccess) {
      // AccessDenied will be shown by layout
      return;
    }

    // Redirect to first accessible section
    if (accessibleSections.includes('learning_hub')) {
      router.replace('/tdi-admin/hub');
    } else if (accessibleSections.includes('creator_studio')) {
      router.replace('/tdi-admin/creators');
    } else if (accessibleSections.includes('leadership')) {
      router.replace('/tdi-admin/leadership');
    } else {
      // Default to hub if owner or has any access
      router.replace('/tdi-admin/hub');
    }
  }, [accessibleSections, isLoading, hasAccess, router]);

  // Loading/redirect state
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div
          className="w-10 h-10 rounded-full mx-auto mb-4 animate-pulse"
          style={{ backgroundColor: '#E8B84B' }}
        />
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Redirecting...
        </p>
      </div>
    </div>
  );
}
