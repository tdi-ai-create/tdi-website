'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/hub-auth';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import TDIPortalLoader from '@/components/TDIPortalLoader';

type AuthView = 'main' | 'signup' | 'forgot';
type LoginMethod = 'email' | 'magic';

export default function HubLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/hub';

  // Animation gate states
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasRedirectedRef = useRef(false);

  // Form states
  const [view, setView] = useState<AuthView>('main');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  // Hard timer backup (4.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Check if already logged in - redirect WITHOUT animation if authenticated
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        // Redirect immediately without waiting for animation
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.push(decodeURIComponent(returnUrl));
        }
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, [router, returnUrl]);

  // Gate: show page only when animation complete AND timer done AND not authenticated
  const showPage = animationComplete && timerDone && authChecked && !isAuthenticated;

  // Don't show animation if user is authenticated (they'll be redirected)
  const showAnimation = !animationComplete && authChecked && !isAuthenticated;

  const clearErrors = () => {
    setError('');
    setFieldErrors({});
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    clearErrors();
    setSuccessMessage('');
    setLoginMethod('email');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearErrors();

    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/hub',
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();

    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push(decodeURIComponent(returnUrl));
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();

    // Validate passwords match
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords don't match" });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/hub',
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setFieldErrors({ email: 'Email already registered' });
        } else {
          setError(authError.message);
        }
        return;
      }

      setSuccessMessage('Check your email to confirm your account.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();

    try {
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/hub/settings/profile',
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccessMessage('Check your email for a reset link.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();

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

      setSuccessMessage('Check your email for a magic link.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (newView: AuthView) => {
    resetForm();
    setView(newView);
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

  return (
    <>
      {/* TDI Portal Loader - only show for unauthenticated users */}
      {showAnimation && (
        <TDIPortalLoader
          portal="hub"
          onComplete={() => setAnimationComplete(true)}
        />
      )}

      {/* Backup colored div to cover any gap during transition */}
      {!showPage && animationComplete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'linear-gradient(135deg, #2a9d8f, #1f7a6e)',
            transition: 'opacity 500ms ease-out',
            opacity: timerDone ? 0 : 1,
          }}
        />
      )}

      {/* Main page content - hidden until animation complete */}
      <div
        style={{
          visibility: showPage ? 'visible' : 'hidden',
          opacity: showPage ? 1 : 0,
          transition: 'opacity 300ms ease-in',
        }}
      >
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
            <div className="w-full max-w-[420px]">
              {/* Header */}
              <div className="text-center mb-8">
                <h1
                  className="font-bold mb-2"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '24px',
                    color: '#2B3A67',
                  }}
                >
                  TDI Learning Hub
                </h1>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    color: '#6B7280',
                  }}
                >
                  Professional development that fits your life
                </p>
              </div>

              {/* Card */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                {successMessage ? (
                  /* Success State */
                  <div className="text-center py-4">
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{ backgroundColor: '#D1FAE5' }}
                    >
                      <CheckCircle size={32} className="text-green-600" />
                    </div>

                    <p
                      className="text-gray-700 mb-6"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {successMessage}
                    </p>

                    <button
                      onClick={() => switchView('main')}
                      className="text-sm hover:underline"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#2B3A67',
                      }}
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : view === 'main' || view === 'signup' ? (
                  /* Main Sign In / Sign Up View */
                  <>
                    {/* Google Sign In */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 rounded-lg border transition-colors disabled:opacity-50"
                      style={{
                        height: '48px',
                        borderRadius: '8px',
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

                    {/* Two Login Method Buttons */}
                    <div className="flex gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('email')}
                        className="flex-1 font-medium transition-all"
                        style={{
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: '#2B3A67',
                          color: 'white',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '14px',
                          borderBottom: loginMethod === 'email' ? '2px solid #E8B84B' : '2px solid transparent',
                        }}
                      >
                        Sign in with Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('magic')}
                        className="flex-1 font-medium transition-all"
                        style={{
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: '#E8B84B',
                          color: '#2B3A67',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '14px',
                          borderBottom: loginMethod === 'magic' ? '2px solid #E8B84B' : '2px solid transparent',
                        }}
                      >
                        Send me a Magic Link
                      </button>
                    </div>

                    {/* Form Area - changes based on selected method */}
                    {loginMethod === 'email' ? (
                      /* Email/Password Form */
                      <form onSubmit={view === 'signup' ? handleSignUp : handleSignIn}>
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
                            placeholder="you@school.edu"
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              borderColor: fieldErrors.email ? '#DC2626' : '#E5E7EB',
                            }}
                          />
                          {fieldErrors.email && (
                            <p
                              className="mt-1"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '13px',
                                color: '#DC2626',
                              }}
                            >
                              {fieldErrors.email}
                            </p>
                          )}
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
                              borderColor: fieldErrors.password ? '#DC2626' : '#E5E7EB',
                            }}
                          />
                          {fieldErrors.password && (
                            <p
                              className="mt-1"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '13px',
                                color: '#DC2626',
                              }}
                            >
                              {fieldErrors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password (Sign Up only) */}
                        {view === 'signup' && (
                          <div className="mb-4">
                            <label
                              htmlFor="confirmPassword"
                              className="block text-sm font-medium mb-1.5"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: '#374151',
                              }}
                            >
                              Confirm password
                            </label>
                            <input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm your password"
                              required
                              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                borderColor: fieldErrors.confirmPassword ? '#DC2626' : '#E5E7EB',
                              }}
                            />
                            {fieldErrors.confirmPassword && (
                              <p
                                className="mt-1"
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: '13px',
                                  color: '#DC2626',
                                }}
                              >
                                {fieldErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        )}

                        {/* General Error */}
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
                          disabled={isLoading || !email || !password || (view === 'signup' && !confirmPassword)}
                          className="w-full font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105"
                          style={{
                            height: '48px',
                            backgroundColor: '#E8B84B',
                            color: '#2B3A67',
                            fontFamily: "'DM Sans', sans-serif",
                            borderRadius: '8px',
                          }}
                        >
                          {isLoading ? 'Please wait...' : view === 'signup' ? 'Create account' : 'Sign in'}
                        </button>

                        {/* Links */}
                        <div className="flex justify-between mt-4">
                          <button
                            type="button"
                            onClick={() => switchView(view === 'signup' ? 'main' : 'signup')}
                            className="text-left hover:text-[#2B3A67] transition-colors"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '13px',
                              color: '#6B7280',
                            }}
                          >
                            {view === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                          </button>
                          {view === 'main' && (
                            <button
                              type="button"
                              onClick={() => switchView('forgot')}
                              className="hover:text-[#2B3A67] transition-colors"
                              style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '13px',
                                color: '#6B7280',
                              }}
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      /* Magic Link Form */
                      <form onSubmit={handleMagicLink}>
                        <div className="mb-4">
                          <label
                            htmlFor="magicEmail"
                            className="block text-sm font-medium mb-1.5"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              color: '#374151',
                            }}
                          >
                            Email address
                          </label>
                          <input
                            id="magicEmail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@school.edu"
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          />
                        </div>

                        <p
                          className="mb-4 text-center"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            color: '#6B7280',
                          }}
                        >
                          We&apos;ll email you a secure link to sign in — no password needed.
                        </p>

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

                        <button
                          type="submit"
                          disabled={isLoading || !email}
                          className="w-full font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105"
                          style={{
                            height: '48px',
                            backgroundColor: '#E8B84B',
                            color: '#2B3A67',
                            fontFamily: "'DM Sans', sans-serif",
                            borderRadius: '8px',
                          }}
                        >
                          {isLoading ? 'Sending...' : 'Send magic link'}
                        </button>
                      </form>
                    )}
                  </>
                ) : view === 'forgot' ? (
                  /* Forgot Password View */
                  <>
                    <h2
                      className="font-semibold mb-2 text-center"
                      style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontSize: '18px',
                        color: '#2B3A67',
                      }}
                    >
                      Reset your password
                    </h2>
                    <p
                      className="text-center mb-6"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '14px',
                        color: '#6B7280',
                      }}
                    >
                      Enter your email and we'll send you a reset link.
                    </p>

                    <form onSubmit={handleForgotPassword}>
                      <div className="mb-4">
                        <label
                          htmlFor="resetEmail"
                          className="block text-sm font-medium mb-1.5"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#374151',
                          }}
                        >
                          Email address
                        </label>
                        <input
                          id="resetEmail"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@school.edu"
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
                      </div>

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

                      <button
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105"
                        style={{
                          height: '48px',
                          backgroundColor: '#E8B84B',
                          color: '#2B3A67',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {isLoading ? 'Sending...' : 'Send reset link'}
                      </button>
                    </form>

                    <button
                      onClick={() => switchView('main')}
                      className="w-full mt-4 text-center hover:underline"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        color: '#6B7280',
                      }}
                    >
                      Back to sign in
                    </button>
                  </>
                ) : null}
              </div>

              {/* Terms Footer */}
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
      </div>
    </>
  );
}
