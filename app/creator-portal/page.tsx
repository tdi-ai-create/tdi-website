'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { creatorExists, getCreatorByEmail } from '@/lib/creator-portal-data';

type LoginState = 'idle' | 'loading' | 'sent' | 'error' | 'not_found';

export default function CreatorPortalLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        // Check if they're a creator
        const creator = await getCreatorByEmail(session.user.email);
        if (creator) {
          router.push('/creator-portal/dashboard');
        }
      }
    };
    checkSession();
  }, [router]);

  // Handle magic link callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setLoginState('error');
        setErrorMessage(errorDescription || 'Authentication failed');
        return;
      }

      // Check for session after redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const creator = await getCreatorByEmail(session.user.email);
        if (creator) {
          router.push('/creator-portal/dashboard');
        } else {
          setLoginState('not_found');
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState('loading');
    setErrorMessage('');

    try {
      // First check if this email exists in our creators table
      const exists = await creatorExists(email);

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
    <div className="min-h-screen bg-gradient-to-b from-[#f5f5f5] to-white flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="container-wide">
          <Image
            src="/images/logo.webp"
            alt="Teachers Deserve It"
            width={160}
            height={48}
            className="h-12 w-auto"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-[#ffba06] mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Creator Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1e2749]">
                Welcome Back, Creator!
              </h1>
              <p className="text-gray-600 mt-2">
                Sign in to track your course progress and connect with the TDI team.
              </p>
            </div>

            {loginState === 'sent' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#1e2749] mb-2">
                  Check your email!
                </h2>
                <p className="text-gray-600">
                  We sent a magic link to <strong>{email}</strong>. Click the link in
                  your email to sign in.
                </p>
                <button
                  onClick={() => setLoginState('idle')}
                  className="mt-6 text-[#80a4ed] hover:text-[#1e2749] text-sm font-medium"
                >
                  Use a different email
                </button>
              </div>
            ) : loginState === 'not_found' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-[#1e2749] mb-2">
                  Not Found
                </h2>
                <p className="text-gray-600">
                  We couldn&apos;t find a creator account with that email. If you&apos;re
                  interested in creating content with TDI, please{' '}
                  <a
                    href="/create-with-us"
                    className="text-[#80a4ed] hover:text-[#1e2749] font-medium"
                  >
                    apply here
                  </a>
                  .
                </p>
                <button
                  onClick={() => {
                    setLoginState('idle');
                    setEmail('');
                  }}
                  className="mt-6 text-[#80a4ed] hover:text-[#1e2749] text-sm font-medium"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={loginState === 'loading'}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {loginState === 'error' && errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMessage}
                  </div>
                )}

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

          <p className="text-center text-sm text-gray-500 mt-6">
            Looking to partner with TDI?{' '}
            <a
              href="/create-with-us"
              className="text-[#80a4ed] hover:text-[#1e2749] font-medium"
            >
              Apply to create content
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
