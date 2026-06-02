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
          background: '#F0EEE9',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 40%, #38618C 100%)',
            padding: '48px 24px 56px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#E8B84B',
              marginBottom: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            The TDI Learning Hub
          </p>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: 'white',
              marginBottom: 12,
              lineHeight: 1.2,
              fontFamily: "'Source Serif 4', Georgia, serif",
              maxWidth: 600,
              margin: '0 auto 12px',
            }}
          >
            Professional development that actually shows up in your classroom
          </h1>
          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.6,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Tools you can use Monday morning. A community that gets it. PD credit you can prove.
          </p>
        </div>

        {/* Benefits Row */}
        <div
          style={{
            maxWidth: 800,
            margin: '-32px auto 0',
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          {[
            { icon: <BookOpen size={20} />, label: 'Quick Wins', desc: 'Downloadable tools. Free.', color: '#E8B84B' },
            { icon: <MessageCircle size={20} />, label: 'Community', desc: 'Real educators sharing.', color: '#2A9D8F' },
            { icon: <Award size={20} />, label: 'PD Credit', desc: 'All 50 states.', color: '#7C3AED' },
            { icon: <Sparkles size={20} />, label: 'AI Insights', desc: 'Personalized to you.', color: '#0891B2' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: item.color + '15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1B2A4A', marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>
                {item.label}
              </p>
              <p style={{ fontSize: 11, color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: '#9CA3AF',
            margin: '24px 0 8px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Join 100,000+ educators across all 50 states
        </p>

        {/* Sign In Form */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 48px' }}>
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
      </div>
    </>
  );
}
