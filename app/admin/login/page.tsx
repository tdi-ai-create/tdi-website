'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LogOut, Users, FileText, BarChart3 } from 'lucide-react';
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
    <>
      <style>{`
        .oldadmin-login-left {
          display: flex;
        }
        .oldadmin-login-right {
          display: flex;
        }
        @media (max-width: 768px) {
          .oldadmin-login-left {
            display: none !important;
          }
          .oldadmin-login-right {
            width: 100% !important;
            min-width: 100% !important;
          }
        }
      `}</style>
      <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Left Panel */}
        <div
          className="oldadmin-login-left w-1/2 flex-col justify-center px-16 py-12 relative overflow-hidden"
          style={{ backgroundColor: '#1e2749' }}
        >
          {/* Subtle accent circles */}
          <div
            className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full opacity-10"
            style={{ backgroundColor: '#3b82f6' }}
          />
          <div
            className="absolute bottom-[-60px] right-[-60px] w-48 h-48 rounded-full opacity-5"
            style={{ backgroundColor: '#60a5fa' }}
          />

          <div className="relative z-10 max-w-md">
            <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-full bg-white/10 text-gray-300 mb-8">
              TDI Admin
            </span>

            <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
              Creator &amp; Partnership Admin
            </h1>
            <p className="text-gray-400 text-base mb-10">
              Manage creator pipelines, partnership data, and survey responses.
            </p>

            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-300" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed pt-2">
                  Creator pipeline management and milestone tracking
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-300" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed pt-2">
                  Partnership survey administration
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-300" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed pt-2">
                  Content publishing and analytics
                </p>
              </div>
            </div>

            <p className="text-gray-500 text-xs">
              Requires a @teachersdeserveit.com account
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div
          className="oldadmin-login-right w-1/2 flex-col items-center justify-center px-8 py-12"
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1e2749] mb-1">TDI Admin</h2>
              <p className="text-gray-500 text-sm">Sign in to access the admin dashboard</p>
            </div>
            <PortalSignIn
              portalTitle="TDI Admin"
              portalSubtitle="Sign in to access the admin dashboard"
              compact
              methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
              onEmailPreCheck={handleEmailPreCheck}
              onSuccess={handleSuccess}
              magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login'}
              googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login'}
              forgotPasswordRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '/admin/login'}
              backHref={null}
            />
          </div>
        </div>
      </div>
    </>
  );
}
