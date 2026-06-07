'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, Users, TrendingUp, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';

function PartnerLoginContent() {
  const router = useRouter();

  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [partnershipError, setPartnershipError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  const showPage = animationComplete && timerDone;

  const logActivity = async (userId: string) => {
    await fetch('/api/partners/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, action: 'login' }),
    });
  };

  const lookupAndRedirect = async () => {
    const response = await fetch('/api/partners/me');
    const data = await response.json();
    if (data.redirect) {
      router.push(data.redirect);
    } else {
      setPartnershipError(
        data.error ||
          "Welcome! We don't have a partnership linked to this email yet. If you received an invite from TDI, please use the invite link first to set up your account. Questions? Contact Rae@TeachersDeserveIt.com",
      );
    }
  };

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        lookupAndRedirect();
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Google OAuth callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await logActivity(session.user.id);
        lookupAndRedirect();
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSuccess = async (
    trigger: 'google' | 'emailPassword' | 'magicLink' | 'signUp' | 'forgotPassword',
    _email: string,
    userId?: string,
  ): Promise<string | void> => {
    if (trigger === 'emailPassword' && userId) {
      await logActivity(userId);
      await lookupAndRedirect();
      return;
    }
    if (trigger === 'magicLink') {
      return "Check your email for a magic link. You'll be redirected to your dashboard after clicking it.";
    }
  };

  return (
    <>
      {!animationComplete && (
        <TDIPortalLoader portal="leadership" onComplete={() => setAnimationComplete(true)} />
      )}

      {!showPage && animationComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'linear-gradient(135deg, #1e3a5f, #2c5a8f)',
          transition: 'opacity 500ms ease-out',
          opacity: timerDone ? 0 : 1,
        }} />
      )}

      <style>{`
        .partner-login-left {
          display: none;
        }
        .partner-login-right {
          width: 100%;
        }
        .partner-login-mobile-link {
          display: block;
          text-align: center;
          margin-top: 1.5rem;
          padding-bottom: 2rem;
        }
        @media (min-width: 1024px) {
          .partner-login-left {
            display: flex;
            width: 50%;
          }
          .partner-login-right {
            width: 50%;
          }
          .partner-login-mobile-link {
            display: none;
          }
        }
      `}</style>

      <div
        style={{
          visibility: showPage ? 'visible' : 'hidden',
          opacity: showPage ? 1 : 0,
          transition: 'opacity 300ms ease-in',
        }}
        className="min-h-screen flex flex-col"
      >
        {/* Partnership error banner (shown when no partnership is linked) */}
        {partnershipError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-sm text-red-700 text-center">
            {partnershipError}
          </div>
        )}

        {/* Portal banner */}
        <div style={{ backgroundColor: '#8BA7D6', padding: '8px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e2749', letterSpacing: 0.5 }}>Sign in to Leadership Dashboard</span>
        </div>

        <div className="flex flex-1" style={{ minHeight: 0 }}>
          {/* Left panel - value props */}
          <div
            className="partner-login-left flex-col justify-center px-12 py-16"
            style={{ backgroundColor: '#1e2749' }}
          >
            <div className="max-w-lg mx-auto">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#ffffff' }}
              >
                TDI Leadership Dashboard
              </span>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight" style={{ color: '#ffffff' }}>
                Your School&apos;s PD Command Center
              </h1>

              <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
                Track educator engagement, measure implementation, and prove your PD investment is working.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  { icon: BarChart3, text: 'Real-time educator engagement data from the Learning Hub' },
                  { icon: Users, text: 'Staff roster management with automatic Hub provisioning' },
                  { icon: TrendingUp, text: 'KPI tracking with measurable implementation goals' },
                  { icon: FileText, text: 'Exportable reports for board presentations and grants' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#ffffff' }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl p-5 mb-8"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderLeft: '3px solid #1e2749' }}
              >
                <p className="text-sm italic leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  &ldquo;I used to guess whether PD was working. Now I can show my board exactly what our teachers are doing and how it&apos;s impacting our school.&rdquo;
                </p>
                <p className="text-xs font-medium" style={{ color: '#ffffff' }}>
                  -- Elementary principal, Year 2
                </p>
              </div>

              <a
                href="/how-we-partner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
                style={{ color: '#ffffff' }}
              >
                Learn how TDI partners with schools &rarr;
              </a>
            </div>
          </div>

          {/* Right panel - sign in form */}
          <div
            className="partner-login-right flex flex-col items-center justify-center px-6 py-12 lg:px-12"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Partner Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">Log in to your partner account</p>
              </div>

              <PortalSignIn
                portalTitle="Partner Dashboard"
                portalSubtitle="Log in to your partner account"
                compact
                methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
                onSuccess={handleSuccess}
                magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/partners/login` : '/partners/login'}
                googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/partners/login` : '/partners/login'}
                forgotPasswordRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/partners/reset-password` : '/partners/reset-password'}
                backHref={null}
              />

              <div className="partner-login-mobile-link">
                <a
                  href="/how-we-partner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#2A9D8F' }}
                >
                  Learn how TDI partners with schools &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A4A] to-[#38618C] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
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
