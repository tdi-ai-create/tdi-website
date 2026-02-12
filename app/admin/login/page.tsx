'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  Lock,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PageState = 'idle' | 'loading' | 'error' | 'wrong_account';

export default function AdminLoginPage() {
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if email is TDI admin
  const isTDIEmail = (email: string) => {
    return email.toLowerCase().endsWith('@teachersdeserveit.com');
  };

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        if (isTDIEmail(session.user.email)) {
          // Already logged in with TDI email - redirect to admin
          router.push('/admin/partnerships');
          return;
        } else {
          // Logged in with wrong email
          setCurrentUserEmail(session.user.email);
          setPageState('wrong_account');
        }
      }
      setIsCheckingAuth(false);
    };

    checkSession();
  }, [router]);

  // Listen for auth state changes (handles Google OAuth callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        if (isTDIEmail(session.user.email)) {
          router.push('/admin/partnerships');
        } else {
          // Signed in with non-TDI email
          setCurrentUserEmail(session.user.email);
          setPageState('wrong_account');
          setIsGoogleLoading(false);
        }
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
        redirectTo: `${window.location.origin}/admin/login`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      setErrorMessage('Google sign-in is not available right now. Please use email and password.');
      setPageState('error');
      setIsGoogleLoading(false);
    }
  };

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageState('loading');
    setErrorMessage('');

    // Check if email is TDI domain before attempting login
    if (!isTDIEmail(email)) {
      setPageState('error');
      setErrorMessage('This admin panel is only accessible to @teachersdeserveit.com accounts.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setPageState('error');
        setErrorMessage('Invalid email or password. Please try again.');
        return;
      }

      if (data.session) {
        router.push('/admin/partnerships');
      }
    } catch {
      setPageState('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  // Sign out and show login form
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
    setPageState('idle');
  };

  // Switch account (sign out and trigger Google login)
  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    setCurrentUserEmail(null);
    setPageState('idle');
    // Small delay to ensure sign out completes
    setTimeout(() => {
      handleGoogleLogin();
    }, 100);
  };

  // Loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Wrong account state (logged in with non-TDI email)
  if (pageState === 'wrong_account') {
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
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1e2749]">
              Return to main site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#1e2749] text-white py-4 px-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Image
            src="/images/logo.webp"
            alt="Teachers Deserve It"
            width={120}
            height={36}
            className="h-8 w-auto brightness-0 invert"
          />
          <span className="text-sm bg-white/20 px-2 py-0.5 rounded">Admin</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1e2749] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-[#1e2749] mb-1">TDI Admin</h1>
            <p className="text-gray-600 text-sm">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Error message */}
          {pageState === 'error' && errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
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
                placeholder="you@teachersdeserveit.com"
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
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={pageState === 'loading' || !email || !password}
              className="w-full bg-[#1e2749] text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-[#2a3459] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {pageState === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer text */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Access restricted to @teachersdeserveit.com accounts
          </p>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1e2749]">
              Return to main site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
