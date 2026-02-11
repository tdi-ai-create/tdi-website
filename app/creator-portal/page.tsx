'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TDIPortalLoader from '@/components/TDIPortalLoader';

// Server-side API call to check email (bypasses RLS)
async function checkEmailExists(email: string): Promise<{ exists: boolean; type: 'creator' | 'admin' | null }> {
  try {
    const response = await fetch('/api/creator-portal/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return { exists: data.exists, type: data.type };
  } catch {
    return { exists: false, type: null };
  }
}

type LoginState = 'idle' | 'loading' | 'sent' | 'error' | 'not_found';

interface CreatorPortalLoginContentProps {
  onPendingRedirect: (url: string) => void;
}

function CreatorPortalLoginContent({ onPendingRedirect }: CreatorPortalLoginContentProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is already logged in and valid - queue redirect instead of navigating
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { type: userType } = await checkEmailExists(session.user.email);
        if (userType === 'admin') {
          onPendingRedirect('/admin/creators');
        } else if (userType === 'creator') {
          onPendingRedirect('/creator-portal/dashboard');
        } else {
          // User has a session but isn't in our system - sign them out silently
          await supabase.auth.signOut();
        }
      }
    };
    checkSession();
  }, [onPendingRedirect]);

  // Handle magic link callback - only process if coming from a magic link redirect
  useEffect(() => {
    const handleAuthCallback = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setLoginState('error');
        setErrorMessage(errorDescription || 'Authentication failed');
        return;
      }

      // Only check session if there's a hash in the URL (magic link redirect)
      // This prevents showing "Account Not Found" on normal page loads
      const hasAuthParams = window.location.hash.includes('access_token') ||
                           searchParams.get('code') !== null;

      if (!hasAuthParams) {
        return;
      }

      // Check for session after magic link redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { type: userType } = await checkEmailExists(session.user.email);
        if (userType === 'admin') {
          onPendingRedirect('/admin/creators');
        } else if (userType === 'creator') {
          onPendingRedirect('/creator-portal/dashboard');
        } else {
          // User authenticated but not in our system - sign them out
          await supabase.auth.signOut();
          setLoginState('not_found');
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, onPendingRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState('loading');
    setErrorMessage('');

    try {
      // Check if this email exists in creators or admin_users table (server-side to bypass RLS)
      const { exists } = await checkEmailExists(email);

      if (!exists) {
        setLoginState('not_found');
        return;
      }

      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/creator-portal`,
        },
      });

      if (error) {
        throw error;
      }

      setLoginState('sent');
    } catch (err) {
      console.error('Login error:', err);
      setLoginState('error');
      setErrorMessage('Failed to send login link. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-[#ffba06]">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">TDI Creator Studio</span>
            </div>
          </div>

          {/* Success State - Email Sent */}
          {loginState === 'sent' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-[#1e2749] mb-2">
                Check your email!
              </h2>
              <p className="text-gray-600 text-sm">
                We sent a magic link to <strong className="text-[#1e2749]">{email}</strong>.
                <br />Click the link in your email to sign in.
              </p>
              <button
                onClick={() => setLoginState('idle')}
                className="mt-6 text-[#80a4ed] hover:text-[#1e2749] text-sm font-medium transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* Not Found State */}
          {loginState === 'not_found' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold text-[#1e2749] mb-2">
                Account Not Found
              </h2>
              <p className="text-gray-600 text-sm">
                We couldn&apos;t find a creator account with that email.
                <br />
                If you&apos;re interested in creating content with TDI,{' '}
                <a
                  href="/create-with-us"
                  className="text-[#80a4ed] hover:text-[#1e2749] font-medium transition-colors"
                >
                  apply here
                </a>.
              </p>
              <button
                onClick={() => {
                  setLoginState('idle');
                  setEmail('');
                }}
                className="mt-6 text-[#80a4ed] hover:text-[#1e2749] text-sm font-medium transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}

          {/* Login Form */}
          {loginState !== 'sent' && loginState !== 'not_found' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loginState === 'loading'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ffba06] focus:border-[#ffba06] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-[#1e2749] outline-none"
                />
              </div>

              {/* Error Message */}
              {loginState === 'error' && errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginState === 'loading' || !email}
                className="w-full bg-[#1e2749] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loginState === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Magic Link
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Looking to partner with TDI?{' '}
          <a
            href="/create-with-us"
            className="text-[#80a4ed] hover:text-[#1e2749] font-medium transition-colors"
          >
            Apply to create content
          </a>
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ffba06] mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function CreatorPortalPage() {
  const router = useRouter();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const hasRedirectedRef = useRef(false);

  // Hard minimum timer as backup
  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  const showPage = animationComplete && timerDone;

  // Execute pending redirect ONLY after animation gates open
  useEffect(() => {
    if (showPage && pendingRedirect && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push(pendingRedirect);
    }
  }, [showPage, pendingRedirect, router]);

  // Callback for child component to queue a redirect
  const handlePendingRedirect = (url: string) => {
    setPendingRedirect(url);
  };

  return (
    <>
      {/* LOADER: shows until animation calls onComplete */}
      {!animationComplete && (
        <TDIPortalLoader
          portal="creators"
          onComplete={() => setAnimationComplete(true)}
        />
      )}

      {/* BACKUP: plain gold screen if animation ends early but timer hasn't */}
      {!showPage && animationComplete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'linear-gradient(135deg, #ffba06, #e5a800)',
          transition: 'opacity 500ms ease-out',
          opacity: timerDone ? 0 : 1,
          pointerEvents: 'none',
        }} />
      )}

      {/* PAGE: hidden until both gates pass */}
      <div style={{
        visibility: showPage ? 'visible' : 'hidden',
        opacity: showPage ? 1 : 0,
        transition: 'opacity 300ms ease-in',
      }}>
        <Suspense fallback={<LoadingFallback />}>
          <CreatorPortalLoginContent onPendingRedirect={handlePendingRedirect} />
        </Suspense>
      </div>
    </>
  );
}
