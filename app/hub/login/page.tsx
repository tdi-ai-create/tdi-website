'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/hub-auth';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function HubLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/hub';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        router.push(decodeURIComponent(returnUrl));
      }
    }
    checkAuth();
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/hub/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setIsSent(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      {/* Header */}
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft size={20} />
          Back to site
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              className="font-bold mb-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '28px',
                color: '#2B3A67',
              }}
            >
              TDI Learning Hub
            </h1>
            <p
              className="text-gray-600"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Professional development that fits your life
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            {!isSent ? (
              <>
                <h2
                  className="font-semibold mb-6 text-center"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '18px',
                    color: '#2B3A67',
                  }}
                >
                  Sign in to your Hub
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@school.edu"
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full hub-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send magic link'}
                  </button>
                </form>

                <p
                  className="mt-6 text-center text-sm text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  We will send you a secure link to sign in.
                  <br />
                  No password needed.
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: '#FFF8E7' }}
                >
                  <CheckCircle size={32} style={{ color: '#E8B84B' }} />
                </div>

                <h2
                  className="font-semibold mb-4"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '18px',
                    color: '#2B3A67',
                  }}
                >
                  Check your email
                </h2>

                <p
                  className="text-gray-600 mb-6"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  We sent a magic link to
                  <br />
                  <strong>{email}</strong>
                </p>

                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Click the link in your email to sign in.
                  <br />
                  The link will expire in 1 hour.
                </p>

                <button
                  onClick={() => {
                    setIsSent(false);
                    setEmail('');
                  }}
                  className="mt-6 text-sm hover:underline"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Use a different email
                </button>
              </div>
            )}
          </div>

          {/* Footer text */}
          <p
            className="mt-8 text-center text-sm text-gray-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
