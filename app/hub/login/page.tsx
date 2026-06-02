'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/hub-auth';
import { getHubSupabase } from '@/lib/supabase-hub';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';
import { attributePartnership } from '@/lib/hub/partnerships';
import { BookOpen, MessageCircle, Award, Sparkles } from 'lucide-react';

export default function HubLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/hub';

  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimerDone(true), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.push(decodeURIComponent(returnUrl));
        }
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, [router, returnUrl]);

  const showPage = animationComplete && timerDone && authChecked && !isAuthenticated;
  const showAnimation = !animationComplete && authChecked && !isAuthenticated;

  const handleSuccess = async (
    trigger: 'google' | 'emailPassword' | 'magicLink' | 'signUp' | 'forgotPassword',
    _email: string,
    userId?: string,
  ): Promise<string | void> => {
    if (trigger === 'emailPassword') {
      router.push(decodeURIComponent(returnUrl));
      return;
    }
    if (trigger === 'signUp' && userId) {
      await attributePartnership(userId);
      return 'Check your email to confirm your account.';
    }
  };

  return (
    <>
      {showAnimation && (
        <TDIPortalLoader portal="hub" onComplete={() => setAnimationComplete(true)} />
      )}

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

      <div
        style={{
          visibility: showPage ? 'visible' : 'hidden',
          opacity: showPage ? 1 : 0,
          transition: 'opacity 300ms ease-in',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #1B2A4A 0%, #1B2A4A 45%, #F0EEE9 45%)',
        }}
      >
        {/* Hero on navy */}
        <div style={{ textAlign: 'center', padding: '48px 24px 0' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#E8B84B',
              marginBottom: 14,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            The TDI Learning Hub
          </p>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.25,
              fontFamily: "'Source Serif 4', Georgia, serif",
              maxWidth: 520,
              margin: '0 auto 12px',
            }}
          >
            Professional development that actually shows up in your classroom
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 440,
              margin: '0 auto 32px',
              lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Free account. No credit card. Tools you can use Monday morning.
          </p>

          {/* Benefit pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
            {[
              { icon: <BookOpen size={14} />, label: 'Quick Wins', color: '#E8B84B' },
              { icon: <MessageCircle size={14} />, label: 'Community Q&A', color: '#2A9D8F' },
              { icon: <Award size={14} />, label: 'PD Credit -- All 50 States', color: '#7C3AED' },
              { icon: <Sparkles size={14} />, label: 'AI Insights', color: '#0891B2' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)',
                  color: item.color,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Sign-in form card */}
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 16px' }}>
          <PortalSignIn
            portalTitle=""
            portalSubtitle=""
            methods={{ google: true, emailPassword: true, magicLink: true, signUp: true }}
            onSuccess={handleSuccess}
            getSupabaseClient={getHubSupabase}
            magicLinkRedirectTo={
              typeof window !== 'undefined'
                ? `${window.location.origin}/hub/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`
                : '/hub/auth/callback'
            }
            googleRedirectTo={typeof window !== 'undefined' ? window.location.origin + '/hub' : '/hub'}
            forgotPasswordRedirectTo={
              typeof window !== 'undefined' ? window.location.origin + '/hub/settings/profile' : '/hub/settings/profile'
            }
          />
        </div>

        {/* Social proof */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: '#9CA3AF',
            margin: '24px 0 0',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Join 100,000+ educators across all 50 states
        </p>

        {/* Testimonial */}
        <div style={{ maxWidth: 480, margin: '24px auto 48px', padding: '0 16px' }}>
          <div
            style={{
              background: 'white',
              borderRadius: 14,
              padding: 20,
              borderLeft: '3px solid #E8B84B',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic' }}>
              &ldquo;The Quick Wins are the first PD resource I have actually used more than once. Practical, fast, and built for people who do not have time for a 3-hour webinar.&rdquo;
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
              Instructional coach, K-5
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
