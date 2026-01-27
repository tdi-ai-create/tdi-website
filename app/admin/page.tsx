'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to creator portal after a brief delay
    const timer = setTimeout(() => {
      router.push('/creator-portal');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-[#1e2749] mb-2">Admin Access</h1>
        <p className="text-gray-600 mb-4">
          Admins log in through the Creator Portal.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you now...
        </p>
      </div>
    </div>
  );
}
