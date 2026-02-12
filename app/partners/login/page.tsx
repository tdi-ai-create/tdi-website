'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TDIPortalLoader from '@/components/TDIPortalLoader';

type PageState = 'idle' | 'loading' | 'error' | 'forgot_password' | 'reset_sent';

function PartnerLoginContent() {
  const router = useRouter();

  // TDI Loading screen state
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  const [pageState, setPageState] = useState<PageState>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Hard timer for loading screen (runs once on mount, never resets)
  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Gate: both must be true before showing page
  const showPage = animationComplete && timerDone;

  // Helper to look up partnership and redirect
  const lookupAndRedirect = async (userId: string) => {
    const response = await fetch('/api/partners/get-dashboard', {
      headers: {
        'x-user-id': userId,
      },
    });
    const data = await response.json();
    if (data.success && data.slug) {
      router.push(`/partners/${data.slug}-dashboard`);
    } else {
      // No partnership found for this user
      setPageState('error');
      setErrorMessage('Welcome! We don\'t have a partnership linked to this email yet. If you received an invite from TDI, please use the invite link first to set up your account. Questions? Contact Rae@TeachersDeserveIt.com');
    }
  };

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        lookupAndRedirect(session.user.id);
      }
    };
    checkSession();
  }, [router]);

  // Listen for auth state changes (handles Google OAuth callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Log activity
        await fetch('/api/partners/log-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: session.user.id,
            action: 'login',
          }),
        });
        lookupAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Google Sign-In handler
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/partners/login`,
        queryParams: {
          prompt: 'select_account', // Always show account picker
        },
      },
    });

    if (error) {
      setErrorMessage('Google sign-in is not available right now. Please use email and password.');
      setPageState('error');
      setIsGoogleLoading(false);
    }
    // If successful, Supabase redirects to Google, then back to redirectTo URL
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageState('loading');
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setFailedAttempts(prev => prev + 1);
        setPageState('error');
        setErrorMessage('Invalid email or password. Please try again.');
        return;
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      // Log activity
      await fetch('/api/partners/log-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: data.user.id,
          action: 'login',
        }),
      });

      // Look up user's partnership to get dashboard slug
      const response = await fetch('/api/partners/get-dashboard', {
        headers: {
          'x-user-id': data.user.id,
        },
      });
      const partnerData = await response.json();

      if (partnerData.success && partnerData.slug) {
        router.push(`/partners/${partnerData.slug}-dashboard`);
      } else {
        // User doesn't have a partnership yet - this shouldn't happen normally
        setPageState('error');
        setErrorMessage('No partnership found for this account. Please contact support.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setPageState('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageState('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/partners/reset-password`,
      });

      if (error) throw error;

      setPageState('reset_sent');
    } catch (error) {
      console.error('Reset password error:', error);
      setPageState('error');
      setErrorMessage('Failed to send reset email. Please try again.');
    }
  };

  return (
    <>
      {/* LOADER — shows until animation completes */}
      {!animationComplete && (
        <TDIPortalLoader
          portal="leadership"
          onComplete={() => setAnimationComplete(true)}
        />
      )}

      {/* BACKUP — covers gap if animation unmounts but timer isn't done */}
      {!showPage && animationComplete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'linear-gradient(135deg, #1e3a5f, #2c5a8f)',
          transition: 'opacity 500ms ease-out',
          opacity: timerDone ? 0 : 1,
        }} />
      )}

      {/* PAGE CONTENT — hidden until gate opens */}
      <div style={{
        visibility: showPage ? 'visible' : 'hidden',
        opacity: showPage ? 1 : 0,
        transition: 'opacity 300ms ease-in',
      }}
      className="min-h-screen flex flex-col"
      >
        {/* Reset sent confirmation */}
        {pageState === 'reset_sent' ? (
          <div className="flex-1 bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-[#1e2749] mb-2">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                If an account exists with <strong>{email}</strong>, you&apos;ll receive a password reset link.
              </p>
              <button
                onClick={() => {
                  setPageState('idle');
                  setEmail('');
                }}
                className="text-[#80a4ed] hover:text-[#1e2749] font-medium"
              >
                Back to login
              </button>
            </div>
          </div>
        ) : pageState === 'forgot_password' ? (
          /* Forgot password form */
          <div className="flex-1 bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Logo */}
              <div className="pt-8 px-8">
                <Image
                  src="/images/logo.webp"
                  alt="Teachers Deserve It"
                  width={160}
                  height={48}
                  className="h-12 w-auto mx-auto"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-[#1e2749]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-[#1e2749]" />
                  </div>
                  <h1 className="text-xl font-bold text-[#1e2749] mb-1">
                    Reset Password
                  </h1>
                  <p className="text-sm text-gray-600">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!email}
                    className="w-full bg-[#1e2749] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-[#2a3459] transition-colors disabled:opacity-50"
                  >
                    Send Reset Link
                  </button>
                </form>

                <button
                  onClick={() => setPageState('idle')}
                  className="w-full text-center text-sm text-gray-500 hover:text-[#1e2749] mt-4"
                >
                  &larr; Back to login
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main login form */
          <div className="flex-1 bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Logo */}
              <div className="pt-8 px-8">
                <Image
                  src="/images/logo.webp"
                  alt="Teachers Deserve It"
                  width={160}
                  height={48}
                  className="h-12 w-auto mx-auto"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-[#1e2749] mb-1">
                    Welcome Back
                  </h1>
                  <p className="text-sm text-gray-600">
                    Log in to your TDI Partnership Dashboard
                  </p>
                </div>

                {/* Error message */}
                {pageState === 'error' && errorMessage && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-700">{errorMessage}</p>
                      {failedAttempts >= 3 && (
                        <p className="text-sm text-red-600 mt-1">
                          Having trouble? Contact{' '}
                          <a href="mailto:Rae@TeachersDeserveIt.com" className="underline">
                            Rae@TeachersDeserveIt.com
                          </a>{' '}
                          or use &quot;Forgot Password&quot; below.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Google Sign-In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading || pageState === 'loading'}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 text-gray-700 font-medium disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or sign in with email</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setPageState('forgot_password')}
                      className="text-sm text-[#80a4ed] hover:text-[#1e2749] font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={pageState === 'loading' || !email || !password}
                    className="w-full bg-[#1e2749] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {pageState === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Log In
                      </>
                    )}
                  </button>
                </form>

                {/* Help text */}
                <p className="text-center text-sm text-gray-500 mt-6">
                  Don&apos;t have an account? Contact{' '}
                  <a
                    href="mailto:Rae@TeachersDeserveIt.com"
                    className="text-[#80a4ed] hover:text-[#1e2749] font-medium"
                  >
                    Rae@TeachersDeserveIt.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-[#1e2749] text-gray-300">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Teachers Deserve It</h3>
                <p className="text-sm opacity-70">PD that respects your time, strategies that actually work, and a community that gets it.</p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://www.teachersdeserveit.com" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="https://www.teachersdeserveit.com/for-schools" className="hover:text-white transition-colors">For Schools</a></li>
                  <li><a href="https://www.teachersdeserveit.com/how-we-partner" className="hover:text-white transition-colors">How We Partner</a></li>
                  <li><a href="https://www.teachersdeserveit.com/about" className="hover:text-white transition-colors">About</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-white font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://www.teachersdeserveit.com/funding" className="hover:text-white transition-colors">Funding Options</a></li>
                  <li><a href="https://www.teachersdeserveit.com/free-pd-plan" className="hover:text-white transition-colors">Free PD Plan</a></li>
                  <li><a href="https://raehughart.substack.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="https://www.teachersdeserveit.com/contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-semibold mb-3">Your TDI Partner</h4>
                <p className="text-sm">Rae Hughart</p>
                <p className="text-sm">Rae@TeachersDeserveIt.com</p>
              </div>
            </div>

            <div className="border-t border-gray-600 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
              <p className="opacity-50">© 2026 Teachers Deserve It. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="https://www.teachersdeserveit.com/privacy" className="hover:text-white transition-colors opacity-50 hover:opacity-100">Privacy Policy</a>
                <a href="https://www.teachersdeserveit.com/terms" className="hover:text-white transition-colors opacity-50 hover:opacity-100">Terms of Service</a>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">TDI is committed to accessibility. We strive to ensure our website is usable by all educators, including those using assistive technologies.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-white/80">Loading...</p>
      </div>
    </div>
  );
}

export default function PartnerLoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PartnerLoginContent />
    </Suspense>
  );
}
