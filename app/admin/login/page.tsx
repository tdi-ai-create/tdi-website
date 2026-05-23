'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PortalSignIn from '@/components/auth/PortalSignIn';

const isTDIEmail = (email: string) => email.toLowerCase().endsWith('@teachersdeserveit.com');

export default function AdminLoginPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [wrongAccount, setWrongAccount] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        if (isTDIEmail(session.user.email)) {
          router.push('/admin/partnerships');
          return;
        } else {
          setCurrentUserEmail(session.user.email);
          setWrongAccount(true);
        }
      }
      setIsCheckingAuth(false);
    };
    checkSession();
  }, [router]);

  // Handle Google OAuth callback — check domain after sign-in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        if (isTDIEmail(session.user.email)) {
          router.push('/admin/partnerships');
        } else {
          setCurrentUserEmail(session.user.email);
          setWrongAccount(true);
          setIsGoogleLoading(false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
    setWrongAccount(false);
  };

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
    setWrongAccount(false);
    setTimeout(() => {
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/login`,
          queryParams: { prompt: 'select_account' },
        },
      });
    }, 100);
  };

  const handleEmailPreCheck = async (email: string): Promise<{ allowed: boolean; error?: string }> => {
    if (!isTDIEmail(email)) {
      return { allowed: false, error: 'This admin panel is only accessible to @teachersdeserveit.com accounts.' };
    }
    return { allowed: true };
  };

  const handleSuccess = async (
    trigger: 'google' | 'emailPassword' | 'magicLink' | 'signUp' | 'forgotPassword',
    email: string,
  ): Promise<string | void> => {
    if (trigger === 'emailPassword') {
      // Domain already validated by onEmailPreCheck; Supabase onAuthStateChange handles redirect
      router.push('/admin/partnerships');
      return;
    }
    if (trigger === 'magicLink') {
      return 'Check your email for a magic link. You\'ll be redirected after clicking it.';
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <p className="text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>Checking authentication...</p>
      </div>
    );
  }

  if (wrongAccount) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-xl font-semibold text-[#1e2749] mb-2">Wrong Account</h1>
            <p className="text-gray-600 text-sm mb-4">
              You&apos;re signed in as <strong className="text-[#1e2749]">{currentUserEmail}</strong>
            </p>
            <p className="text-gray-500 text-sm">
              This area requires a <strong>@teachersdeserveit.com</strong> account.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleSwitchAccount}
              className="w-full flex items-center justify-center gap-2 bg-[#1e2749] text-white px-4 py-3 rounded-lg hover:bg-[#2a3459] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Switch Account
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1e2749]">Return to main site</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortalSignIn
      portalTitle="TDI Admin"
      portalSubtitle="Sign in to access the admin dashboard"
      methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
      onEmailPreCheck={handleEmailPreCheck}
      onSuccess={handleSuccess}
      magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login'}
      googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login'}
      forgotPasswordRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login'}
      backHref="/"
    />
  );
}
