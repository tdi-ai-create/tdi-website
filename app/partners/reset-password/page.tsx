'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  Lock,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PageState = 'loading' | 'ready' | 'updating' | 'success' | 'error';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password validation
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Check for auth callback on mount
  useEffect(() => {
    const checkSession = async () => {
      // Check for error in URL
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setPageState('error');
        setErrorMessage(errorDescription || 'Invalid or expired reset link');
        return;
      }

      // Check if user has a valid session from the reset link
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setPageState('ready');
      } else {
        // No session - might still be processing the token
        // Wait a moment and check again
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession?.user) {
            setPageState('ready');
          } else {
            setPageState('error');
            setErrorMessage('Invalid or expired reset link. Please request a new one.');
          }
        }, 1000);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    if (!doPasswordsMatch) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setPageState('updating');

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setPageState('success');

      // Redirect after a moment
      setTimeout(() => {
        router.push('/partners/login');
      }, 3000);
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      setPageState('error');
      const errorMsg = error instanceof Error ? error.message : 'Failed to update password. Please try again.';
      setErrorMessage(errorMsg);
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-[#1e2749] mb-2">Password Updated!</h1>
          <p className="text-gray-600 mb-4">
            Your password has been successfully updated.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === 'error' && !password) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-[#1e2749] mb-2">Link Expired</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/partners/login"
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-xl hover:bg-[#2a3459] transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Ready state - show form
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
              <Lock className="w-6 h-6 text-[#1e2749]" />
            </div>
            <h1 className="text-xl font-bold text-[#1e2749] mb-1">
              Set New Password
            </h1>
            <p className="text-sm text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <p className={`text-sm mt-1 flex items-center gap-1 ${
                password.length > 0
                  ? isPasswordValid ? 'text-green-600' : 'text-red-500'
                  : 'text-gray-500'
              }`}>
                {password.length > 0 && (
                  isPasswordValid
                    ? <Check className="w-4 h-4" />
                    : <X className="w-4 h-4" />
                )}
                At least 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p className={`text-sm mt-1 flex items-center gap-1 ${
                  doPasswordsMatch ? 'text-green-600' : 'text-red-500'
                }`}>
                  {doPasswordsMatch ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pageState === 'updating' || !isPasswordValid || !doPasswordsMatch}
              className="w-full bg-[#1e2749] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pageState === 'updating' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
