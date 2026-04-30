'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/hub-auth';
import { checkTeamAccess } from '@/lib/tdi-admin/permissions';
import { getSupabase } from '@/lib/supabase';
import PortalSignIn from '@/components/auth/PortalSignIn';

export default function TDIAdminLoginPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedEmail, setDeniedEmail] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const teamMember = await checkTeamAccess(user.id, user.email || '');
          if (teamMember) {
            router.push('/tdi-admin');
            return;
          } else {
            setAccessDenied(true);
            setDeniedEmail(user.email || '');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setAccessDenied(false);
    setDeniedEmail('');
  };

  const handleSuccess = async (
    trigger: 'google' | 'emailPassword' | 'magicLink' | 'signUp' | 'forgotPassword',
    email: string,
    userId?: string,
  ): Promise<string | void> => {
    if (trigger === 'emailPassword' && userId) {
      const teamMember = await checkTeamAccess(userId, email);
      if (teamMember) {
        router.push('/tdi-admin');
      } else {
        setAccessDenied(true);
        setDeniedEmail(email);
      }
      return;
    }
    if (trigger === 'magicLink') {
      return 'Check your email for a magic link. You\'ll be redirected after clicking it.';
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Checking authentication...
        </p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
              <Image src="/images/logo.webp" alt="Teachers Deserve It" width={120} height={36} className="h-8 w-auto" />
            </div>

            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="font-bold mb-3 text-center" style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '20px', color: '#2B3A67' }}>
              Access Not Granted
            </h1>
            <p className="text-center mb-4" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#6B7280' }}>
              Your account does not have admin access. Contact Rae if you believe this is an error.
            </p>

            <div className="py-3 px-4 rounded-lg mb-6 text-center" style={{ backgroundColor: '#F3F4F6' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6B7280' }}>
                Signed in as: <strong style={{ color: '#374151' }}>{deniedEmail}</strong>
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full font-semibold rounded-lg transition-colors hover:brightness-105"
              style={{ height: '44px', backgroundColor: '#2B3A67', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign Out
            </button>

            <Link
              href="/hub"
              className="block mt-4 text-center hover:underline"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6B7280' }}
            >
              Go to Learning Hub instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortalSignIn
      portalTitle="TDI Admin Portal"
      portalSubtitle="Sign in to manage Teachers Deserve It"
      methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
      onSuccess={handleSuccess}
      magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/tdi-admin/login` : '/tdi-admin/login'}
      googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/tdi-admin` : '/tdi-admin'}
      forgotPasswordRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/tdi-admin/login` : '/tdi-admin/login'}
      backHref="/"
    />
  );
}
