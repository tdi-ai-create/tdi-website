'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/hub-auth';
import { checkTeamAccess } from '@/lib/tdi-admin/permissions';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = getSupabase();

  // Auth states
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Access denied state (when logged in but no team access)
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedEmail, setDeniedEmail] = useState('');

  // Check if already logged in and has access
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Check if user has admin access
          const teamMember = await checkTeamAccess(user.id, user.email || '');
          if (teamMember) {
            // Has access, redirect to portal
            router.push('/tdi-admin');
            return;
          } else {
            // Logged in but no access
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/tdi-admin',
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      // Check if user has admin access
      if (data.user) {
        const teamMember = await checkTeamAccess(data.user.id, data.user.email || '');
        if (teamMember) {
          router.push('/tdi-admin');
        } else {
          setAccessDenied(true);
          setDeniedEmail(data.user.email || '');
          setIsLoading(false);
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAccessDenied(false);
    setDeniedEmail('');
    setEmail('');
    setPassword('');
    setError('');
  };

  // Google logo SVG
  const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F8F9FA' }}
      >
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Checking authentication...
        </p>
      </div>
    );
  }

  // Access Denied View
  if (accessDenied) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: '#F8F9FA' }}
      >
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo.webp"
                alt="Teachers Deserve It"
                width={120}
                height={36}
                className="h-8 w-auto"
              />
            </div>

            {/* Error Icon */}
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              className="font-bold mb-3 text-center"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '20px',
                color: '#2B3A67',
              }}
            >
              Access Not Granted
            </h1>

            <p
              className="text-center mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#6B7280',
              }}
            >
              Your account does not have admin access. Contact Rae if you believe this is an error.
            </p>

            <div
              className="py-3 px-4 rounded-lg mb-6 text-center"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#6B7280',
                }}
              >
                Signed in as: <strong style={{ color: '#374151' }}>{deniedEmail}</strong>
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full font-semibold rounded-lg transition-colors hover:brightness-105"
              style={{
                height: '44px',
                backgroundColor: '#2B3A67',
                color: 'white',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sign Out
            </button>

            <Link
              href="/hub"
              className="block mt-4 text-center hover:underline"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#6B7280',
              }}
            >
              Go to Learning Hub instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Login Form
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F8F9FA' }}
    >
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={120}
              height={36}
              className="h-8 w-auto"
            />
          </div>

          {/* Header */}
          <h1
            className="font-bold mb-2 text-center"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            TDI Admin Portal
          </h1>
          <p
            className="text-center mb-8"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            Sign in to manage Teachers Deserve It
          </p>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 rounded-lg border transition-colors disabled:opacity-50"
            style={{
              height: '48px',
              backgroundColor: 'white',
              borderColor: '#E5E7EB',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            <GoogleLogo />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                color: '#374151',
              }}
            >
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }} />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3"
                style={{
                  backgroundColor: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#9CA3AF',
                }}
              >
                or
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSignIn}>
            {/* Email Field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#374151',
                }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@teachersdeserveit.com"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: '#E5E7EB',
                }}
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#374151',
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: '#E5E7EB',
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p
                className="mb-4"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#DC2626',
                }}
              >
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105"
              style={{
                height: '48px',
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Note */}
          <p
            className="mt-6 text-center"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: '#9CA3AF',
            }}
          >
            Team members are added by the portal owner.
            <br />
            Contact Rae to request access.
          </p>
        </div>
      </div>
    </div>
  );
}
