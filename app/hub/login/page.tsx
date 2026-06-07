'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/hub-auth';
import { getHubSupabase } from '@/lib/supabase-hub';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';
import { attributePartnership } from '@/lib/hub/partnerships';
import { Check, BookOpen, Award, Users, MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/hub/useTranslation';

export default function HubLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/hub';
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasRedirectedRef = useRef(false);
  const { tUI } = useTranslation();

  useEffect(() => { const t = setTimeout(() => setTimerDone(true), 4500); return () => clearTimeout(t); }, []);
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) { setIsAuthenticated(true); if (!hasRedirectedRef.current) { hasRedirectedRef.current = true; router.push(decodeURIComponent(returnUrl)); } }
      setAuthChecked(true);
    }
    checkAuth();
  }, [router, returnUrl]);

  const showPage = animationComplete && timerDone && authChecked && !isAuthenticated;
  const showAnimation = !animationComplete && authChecked && !isAuthenticated;

  const handleSuccess = async (trigger: 'google' | 'emailPassword' | 'magicLink' | 'signUp' | 'forgotPassword', _email: string, userId?: string): Promise<string | void> => {
    if (trigger === 'emailPassword') { router.push(decodeURIComponent(returnUrl)); return; }
    if (trigger === 'google') { router.push(decodeURIComponent(returnUrl)); return; }
    if (trigger === 'signUp' && userId) { await attributePartnership(userId); return tUI('Check your email to confirm your account.'); }
  };

  const VALUE_PROPS = [
    { icon: BookOpen, text: 'Ready-to-use classroom tools -- not theory, not fluff' },
    { icon: Award, text: 'PD certificates that count toward your hours' },
    { icon: Users, text: 'A community of 100,000+ educators who get it' },
    { icon: MessageCircle, text: 'AI coaching that knows your classroom context' },
  ];

  return (
    <>
      {showAnimation && <TDIPortalLoader portal="hub" onComplete={() => setAnimationComplete(true)} />}
      {!showPage && animationComplete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'linear-gradient(135deg, #2a9d8f, #1f7a6e)', transition: 'opacity 500ms ease-out', opacity: timerDone ? 0 : 1 }} />
      )}

      <div style={{ visibility: showPage ? 'visible' : 'hidden', opacity: showPage ? 1 : 0, transition: 'opacity 300ms ease-in' }}>

        {/* ═══ SPLIT LAYOUT: pitch left, sign-in right ═══ */}
        <div style={{ display: 'flex', minHeight: '100vh' }}>

          {/* LEFT: Navy pitch panel */}
          <div style={{
            flex: '1 1 50%', backgroundColor: '#1e2749', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
            // Hide on mobile, show sign-in only
          }} className="hub-login-left">
            <div style={{ maxWidth: 480 }}>
              <span style={{ display: 'inline-block', padding: '5px 12px', background: 'rgba(255,186,6,0.15)', color: '#ffba06', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
                {tUI('The TDI Learning Hub')}
              </span>

              <h1 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: 'white', margin: '0 0 12px 0', lineHeight: 1.15 }}>
                {tUI('Professional Development That Actually Works')}
              </h1>

              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0 0 32px 0' }}>
                {tUI('Tools you can use Monday morning. A community that gets it. PD credit you can prove.')}
              </p>

              {/* Value props */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
                {VALUE_PROPS.map((vp, i) => {
                  const Icon = vp.icon;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(42,157,143,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 18, height: 18, color: '#2A9D8F' }} />
                      </div>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>{tUI(vp.text)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Testimonial */}
              <div style={{ borderLeft: '3px solid #E8B84B', paddingLeft: 16, marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 8px 0' }}>
                  &ldquo;{tUI('The Quick Wins are the first PD resource I have actually used more than once. Practical, fast, and built for people who do not have time for a 3-hour webinar.')}&rdquo;
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>-- {tUI('Instructional coach, K-5')}</p>
              </div>

              <a href="/learning" style={{ fontSize: 13, color: '#2A9D8F', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {tUI('See everything the Hub offers')} <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* RIGHT: Sign-in panel */}
          <div style={{
            flex: '1 1 50%', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px',
          }} className="hub-login-right">
            <div style={{ width: '100%', maxWidth: 420 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e2749', margin: '0 0 4px', fontFamily: "'Source Serif 4', Georgia, serif" }}>{tUI('Sign in to the Hub')}</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{tUI('Free account. No credit card required.')}</p>
              </div>
              <PortalSignIn
                portalTitle="Sign in to the Hub"
                portalSubtitle="Free account. No credit card required."
                backHref={null}
                compact
                methods={{ google: true, emailPassword: true, magicLink: true, signUp: true }}
                onSuccess={handleSuccess}
                getSupabaseClient={getHubSupabase}
                magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/hub/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}` : '/hub/auth/callback'}
                googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/hub/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}` : '/hub/auth/callback'}
                forgotPasswordRedirectTo={typeof window !== 'undefined' ? window.location.origin + '/hub/settings/profile' : '/hub/settings/profile'}
              />
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 16, textAlign: 'center' }}>
                {tUI('100,000+ educators across all 50 states')}
              </p>
              {/* Mobile-only: show learn link (desktop has it on left panel) */}
              <p className="hub-login-mobile-link" style={{ textAlign: 'center', marginTop: 8 }}>
                <a href="/learning" style={{ fontSize: 12, color: '#2A9D8F', fontWeight: 500, textDecoration: 'none' }}>
                  {tUI('New here? Learn what the Hub is')} &rarr;
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Responsive styles */}
        <style>{`
          @media (min-width: 769px) {
            .hub-login-left { display: flex !important; }
            .hub-login-mobile-link { display: none !important; }
          }
          @media (max-width: 768px) {
            .hub-login-left { display: none !important; }
            .hub-login-right { min-height: 100vh; }
            .hub-login-mobile-link { display: block !important; }
          }
        `}</style>
      </div>
    </>
  );
}
