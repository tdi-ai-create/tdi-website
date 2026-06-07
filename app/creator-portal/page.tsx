'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Palette, DollarSign, BarChart3, Headphones, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';

async function checkEmailExists(email: string): Promise<{ exists: boolean; type: 'creator' | 'admin' | null }> {
  try {
    const response = await fetch('/api/creator-portal/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    return { exists: data.exists, type: data.type };
  } catch {
    return { exists: false, type: null };
  }
}

function redirectUrlForType(type: 'creator' | 'admin' | null): string | null {
  if (type === 'admin') return '/tdi-admin/creators';
  if (type === 'creator') return '/creator-portal/dashboard';
  return null;
}

interface CreatorPortalLoginContentProps {
  onPendingRedirect: (url: string) => void;
}

function CreatorPortalLoginContent({ onPendingRedirect }: CreatorPortalLoginContentProps) {
  const searchParams = useSearchParams();

  // Check if user is already logged in and valid
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { type } = await checkEmailExists(session.user.email);
        const url = redirectUrlForType(type);
        if (url) {
          onPendingRedirect(url);
        } else {
          await supabase.auth.signOut();
        }
      }
    };
    checkSession();
  }, [onPendingRedirect]);

  // Handle magic link / Google OAuth callback errors and session
  useEffect(() => {
    const handleAuthCallback = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        console.error('Auth callback error:', error, errorDescription);
        return;
      }

      const hasAuthParams =
        window.location.hash.includes('access_token') || searchParams.get('code') !== null;

      if (!hasAuthParams) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { type } = await checkEmailExists(session.user.email);
        const url = redirectUrlForType(type);
        if (url) {
          onPendingRedirect(url);
        } else {
          await supabase.auth.signOut();
        }
      }
    };
    handleAuthCallback();
  }, [searchParams, onPendingRedirect]);

  const handleEmailPreCheck = async (email: string): Promise<{ allowed: boolean; error?: string }> => {
    const { exists } = await checkEmailExists(email);
    if (!exists) {
      return {
        allowed: false,
        error: "We couldn't find a creator account with that email. If you're interested in creating content with TDI, apply at /create-with-us.",
      };
    }
    return { allowed: true };
  };

  const handleSuccess = async (
    trigger: 'google' | 'emailPassword' | 'magicLink' | 'signUp' | 'forgotPassword',
    email: string,
  ): Promise<string | void> => {
    if (trigger === 'emailPassword') {
      const { type } = await checkEmailExists(email);
      const url = redirectUrlForType(type);
      if (url) {
        onPendingRedirect(url);
      } else {
        // Should not happen since pre-check passed, but handle gracefully
        await supabase.auth.signOut();
        return "Account not found. Please contact TDI.";
      }
      return;
    }
    if (trigger === 'magicLink') {
      return `We sent a magic link to ${email}. Click the link in your email to sign in.`;
    }
  };

  const VALUE_PROPS = [
    { icon: Palette, text: 'Full creative control with professional production support' },
    { icon: DollarSign, text: 'Earn revenue through our affiliate program' },
    { icon: BarChart3, text: 'Real-time analytics on educator engagement' },
    { icon: Headphones, text: 'Dedicated support from concept to launch' },
  ];

  return (
    <>
      {/* Split layout: pitch left, sign-in right */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* LEFT: Navy pitch panel */}
        <div style={{
          flex: '1 1 50%', backgroundColor: '#1e2749', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }} className="creator-login-left">
          <div style={{ maxWidth: 480 }}>
            <span style={{ display: 'inline-block', padding: '5px 12px', background: 'rgba(255,186,6,0.15)', color: '#ffba06', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              TDI Creator Studio
            </span>

            <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: 'white', margin: '0 0 12px 0', lineHeight: 1.15 }}>
              Build PD That Changes Classrooms
            </h1>

            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0 0 32px 0' }}>
              Create content that reaches 100,000+ educators. We handle production, distribution, and support.
            </p>

            {/* Value props */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
              {VALUE_PROPS.map((vp, i) => {
                const Icon = vp.icon;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,186,6,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: 18, height: 18, color: '#ffba06' }} />
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>{vp.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Testimonial */}
            <div style={{ borderLeft: '3px solid #ffba06', paddingLeft: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 8px 0' }}>
                &ldquo;TDI made it easy to turn my classroom strategies into something thousands of teachers could use. The process was seamless.&rdquo;
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>-- Content creator, Year 3</p>
            </div>

            <a href="/create-with-us" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#ffba06', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Learn about creating with us <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* RIGHT: Sign-in panel */}
        <div style={{
          flex: '1 1 50%', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px',
        }} className="creator-login-right">
          <div style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e2749', margin: '0 0 4px', fontFamily: "'Source Serif 4', Georgia, serif" }}>Sign in to Creator Studio</h2>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Access your creator dashboard</p>
            </div>
            <PortalSignIn
              portalTitle="Sign in to Creator Studio"
              portalSubtitle="Access your creator dashboard"
              compact
              methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
              onEmailPreCheck={handleEmailPreCheck}
              onSuccess={handleSuccess}
              magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/creator-portal` : '/creator-portal'}
              googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/creator-portal/auth/callback` : '/creator-portal/auth/callback'}
              backHref={null}
            />
            {/* Mobile-only: show learn link (desktop has it on left panel) */}
            <p className="creator-login-mobile-link" style={{ textAlign: 'center', marginTop: 12 }}>
              <a href="/create-with-us" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#ffba06', fontWeight: 500, textDecoration: 'none' }}>
                Learn about creating with us &rarr;
              </a>
            </p>
          </div>
        </div>

      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 769px) {
          .creator-login-left { display: flex !important; }
          .creator-login-mobile-link { display: none !important; }
        }
        @media (max-width: 768px) {
          .creator-login-left { display: none !important; }
          .creator-login-right { min-height: 100vh; }
          .creator-login-mobile-link { display: block !important; }
        }
      `}</style>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
      <Loader2 className="w-8 h-8 animate-spin text-[#E8B84B]" />
    </div>
  );
}

export default function CreatorPortalPage() {
  const router = useRouter();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  const showPage = animationComplete && timerDone;

  useEffect(() => {
    if (showPage && pendingRedirect && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push(pendingRedirect);
    }
  }, [showPage, pendingRedirect, router]);

  return (
    <>
      {!animationComplete && (
        <TDIPortalLoader portal="creators" onComplete={() => setAnimationComplete(true)} />
      )}

      {!showPage && animationComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'linear-gradient(135deg, #ffba06, #e5a800)',
          transition: 'opacity 500ms ease-out',
          opacity: timerDone ? 0 : 1,
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        visibility: showPage ? 'visible' : 'hidden',
        opacity: showPage ? 1 : 0,
        transition: 'opacity 300ms ease-in',
      }}>
        <Suspense fallback={<LoadingFallback />}>
          <CreatorPortalLoginContent onPendingRedirect={setPendingRedirect} />
        </Suspense>
      </div>
    </>
  );
}
