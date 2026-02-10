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

type PageState = 'idle' | 'loading' | 'error' | 'forgot_password' | 'reset_sent';

function PartnerLoginContent() {
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Look up user's partnership
        const response = await fetch('/api/partners/get-dashboard', {
          headers: {
            'x-user-id': session.user.id,
          },
        });
        const data = await response.json();
        if (data.success && data.slug) {
          router.push(`/partners/${data.slug}-dashboard`);
        }
      }
    };
    checkSession();
  }, [router]);

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

  // Reset sent confirmation
  if (pageState === 'reset_sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4">
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
    );
  }

  // Forgot password form
  if (pageState === 'forgot_password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4 py-8">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4 py-8">
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
                    <a href="mailto:hello@teachersdeserveit.com" className="underline">
                      hello@teachersdeserveit.com
                    </a>{' '}
                    or use &quot;Forgot Password&quot; above.
                  </p>
                )}
              </div>
            </div>
          )}

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
              href="mailto:hello@teachersdeserveit.com"
              className="text-[#80a4ed] hover:text-[#1e2749] font-medium"
            >
              hello@teachersdeserveit.com
            </a>
          </p>
        </div>
      </div>
    </div>
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
