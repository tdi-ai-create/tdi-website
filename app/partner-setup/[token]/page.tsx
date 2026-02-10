'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  Building2,
  School,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  contact_name: string;
  contact_email: string;
  contract_phase: string;
  invite_token: string;
  invite_accepted_at: string | null;
  status: string;
}

type PageState = 'loading' | 'invalid' | 'welcome' | 'create_account' | 'creating' | 'error';

function PartnerSetupContent() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>('loading');
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load partnership by token
  useEffect(() => {
    const loadPartnership = async () => {
      try {
        const response = await fetch(`/api/partner-setup/${token}`);
        const data = await response.json();

        if (data.success && data.partnership) {
          setPartnership(data.partnership);
          setEmail(data.partnership.contact_email);
          setPageState('welcome');
        } else {
          setPageState('invalid');
        }
      } catch (error) {
        console.error('Error loading partnership:', error);
        setPageState('invalid');
      }
    };

    if (token) {
      loadPartnership();
    }
  }, [token]);

  // Password validation
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    // Validate
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = 'Email is required';
    }

    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPageState('creating');

    try {
      // Sign up with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            partnership_token: token,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setFieldErrors({
            email: 'This email already has an account. Try logging in instead.',
          });
          setPageState('create_account');
          return;
        }
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Failed to create account');
      }

      // Sign in immediately after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // Accept the invite via API
      const response = await fetch(`/api/partner-setup/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: signUpData.user.id,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to intake wizard
        router.push(`/partner-setup/${token}/intake`);
      } else {
        setPageState('error');
        setErrorMessage(data.error || 'Failed to complete setup');
      }
    } catch (error: unknown) {
      console.error('Error creating account:', error);
      setPageState('error');
      const errorMsg = error instanceof Error ? error.message : 'Something went wrong. Please try again or contact hello@teachersdeserveit.com';
      setErrorMessage(errorMsg);
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is no longer valid. It may have already been used or has expired.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-xl hover:bg-[#2a3459] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => setPageState('create_account')}
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-xl hover:bg-[#2a3459] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Creating account state
  if (pageState === 'creating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80">Creating your account...</p>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (pageState === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
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
              <div className="inline-flex items-center gap-2 text-[#ffba06] mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Partnership Invitation</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1e2749] mb-2">
                Welcome to Your TDI Partnership!
              </h1>
              <p className="text-gray-600">
                You just made one of the best decisions for your team. We&apos;re excited to walk alongside you - let&apos;s get your partnership space set up so your educators can start exploring right away.
              </p>
            </div>

            {/* Partnership Info */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                partnership?.partnership_type === 'district'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {partnership?.partnership_type === 'district' ? (
                  <Building2 className="w-6 h-6" />
                ) : (
                  <School className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="font-medium text-[#1e2749]">
                  {partnership?.contact_name}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {partnership?.partnership_type} Partnership - {partnership?.contract_phase}
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setPageState('create_account')}
              className="w-full bg-[#1e2749] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-[#2a3459] transition-colors flex items-center justify-center gap-2"
            >
              Let&apos;s Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create account screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
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

        {/* Progress */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Step 1 of 4</span>
            <span className="text-sm text-gray-500">25%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-[#4ecdc4] rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#1e2749]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-[#1e2749]" />
            </div>
            <h1 className="text-xl font-bold text-[#1e2749] mb-1">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-600">
              Set up your login credentials to access your dashboard
            </p>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none transition-colors ${
                  fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  {fieldErrors.email}
                  {fieldErrors.email.includes('logging in') && (
                    <Link href="/partners/login" className="underline font-medium">
                      Log in here
                    </Link>
                  )}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none transition-colors ${
                    fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
              ) : (
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
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent outline-none transition-colors ${
                    fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword ? (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
              ) : confirmPassword.length > 0 && (
                <p className={`text-sm mt-1 flex items-center gap-1 ${
                  doPasswordsMatch ? 'text-green-600' : 'text-red-500'
                }`}>
                  {doPasswordsMatch ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Info note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                This will be your login for your Partnership Dashboard - and eventually your Learning Hub access too.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isPasswordValid || !doPasswordsMatch}
              className="w-full bg-[#1e2749] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
            </button>
          </form>

          {/* Back link */}
          <button
            onClick={() => setPageState('welcome')}
            className="w-full text-center text-sm text-gray-500 hover:text-[#1e2749] mt-4"
          >
            &larr; Back
          </button>
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

export default function PartnerSetupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PartnerSetupContent />
    </Suspense>
  );
}
