'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/hub-auth';
import { getHubSupabase } from '@/lib/supabase-hub';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';
import { attributePartnership } from '@/lib/hub/partnerships';
import { BookOpen, MessageCircle, Award, Sparkles, Download, Users, BarChart3, Heart } from 'lucide-react';

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
          display: 'flex',
        }}
      >
        {/* ═══ LEFT SIDE: Sticky Sign-In (2/5) ═══ */}
        <div
          style={{
            width: '40%',
            minWidth: 380,
            maxWidth: 480,
            position: 'sticky',
            top: 0,
            height: '100vh',
            background: 'linear-gradient(180deg, #1B2A4A 0%, #2d3a5c 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px 32px',
            overflowY: 'auto',
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <p
              style={{
                fontSize: 11,
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
                fontSize: 26,
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.25,
                fontFamily: "'Source Serif 4', Georgia, serif",
                marginBottom: 10,
              }}
            >
              Built by educators. For educators.
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Free account. No credit card. Just tools that respect your time.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 4,
            }}
          >
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

          <p
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              marginTop: 16,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Join 100,000+ educators across all 50 states
          </p>
        </div>

        {/* ═══ RIGHT SIDE: Scrollable Showcase (3/5) ═══ */}
        <div
          style={{
            flex: 1,
            background: '#F0EEE9',
            overflowY: 'auto',
            padding: '48px 40px',
          }}
        >
          {/* What You Get */}
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1B2A4A',
                marginBottom: 24,
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              What is waiting for you inside
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 }}>
              {[
                { icon: <Download size={22} />, title: 'Quick Wins', desc: 'Downloadable tools you can use Monday morning. 7 free every week, no paywall.', color: '#E8B84B' },
                { icon: <MessageCircle size={22} />, title: 'Community Q&A', desc: 'Ask questions, share what is working, learn from educators who get it.', color: '#2A9D8F' },
                { icon: <Award size={22} />, title: 'PD Credit', desc: 'Certificates for every course. Recognized in all 50 states. Your admin will love it.', color: '#7C3AED' },
                { icon: <Sparkles size={22} />, title: 'AI Growth Insights', desc: 'Personalized reflections on your teaching journey. No two are the same.', color: '#0891B2' },
                { icon: <BarChart3 size={22} />, title: 'Track Your Growth', desc: 'See your tools explored, hours saved, and achievements earned over time.', color: '#1B2A4A' },
                { icon: <Heart size={22} />, title: 'Vibe Checks', desc: 'Quick private check-ins on how you are really doing. Your data, your eyes only.', color: '#DC2626' },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: 20,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: item.color + '12',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1B2A4A', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Data Points */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 32,
                marginBottom: 48,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
                textAlign: 'center',
              }}
            >
              <div>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#E8B84B', fontFamily: "'Source Serif 4', serif" }}>90+</p>
                <p style={{ fontSize: 12, color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>Quick Wins available</p>
              </div>
              <div>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#1B2A4A', fontFamily: "'Source Serif 4', serif" }}>50</p>
                <p style={{ fontSize: 12, color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>States recognized for PD</p>
              </div>
              <div>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#2A9D8F', fontFamily: "'Source Serif 4', serif" }}>100K+</p>
                <p style={{ fontSize: 12, color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>Educators in the community</p>
              </div>
            </div>

            {/* Testimonials */}
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1B2A4A',
                marginBottom: 16,
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              What educators are saying
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
              {[
                { quote: 'I used the Calm Response Scripts on a Monday and by Wednesday my transitions were cutting wasted time in half. My admin noticed before I even said anything.', role: 'Middle school teacher, Year 8' },
                { quote: 'The Quick Wins are the first PD resource I have actually used more than once. Practical, fast, and built for people who do not have time for a 3-hour webinar.', role: 'Instructional coach, K-5' },
                { quote: 'I printed my certificate, added it to my portfolio, and used the email template to send it to my principal. She was impressed and I did not even have to explain what TDI was.', role: 'Para, 2nd year' },
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: 20,
                    borderLeft: '3px solid #E8B84B',
                  }}
                >
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 8, fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                    {t.role}
                  </p>
                </div>
              ))}
            </div>

            {/* Membership Tiers */}
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1B2A4A',
                marginBottom: 16,
                fontFamily: "'Source Serif 4', Georgia, serif",
              }}
            >
              Start free. Upgrade when you are ready.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 48 }}>
              {[
                { tier: 'Free', price: '$0', desc: '7 rotating Quick Wins every week, community Q&A, your personal dashboard, and Vibe Checks.' },
                { tier: 'Essentials', price: '$5/mo', desc: 'Full Quick Wins library, all downloadable tools, and expanded community features.' },
                { tier: 'Professional', price: '$10/mo', desc: 'Everything in Essentials plus the full course library and PD certificates.' },
                { tier: 'All-Access', price: '$25/mo', desc: 'Everything in the Hub. All courses, all tools, all resources. No limits.' },
              ].map((t) => (
                <div
                  key={t.tier}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}>{t.tier}</span>
                    <span style={{ fontSize: 13, color: '#E8B84B', fontWeight: 600 }}>{t.price}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
                borderTop: '1px solid #E5E7EB',
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1B2A4A', marginBottom: 4, fontFamily: "'Source Serif 4', serif" }}>
                Ready to explore?
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
                Sign in on the left to get started. It takes 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stack layout */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="width: 40%"] {
            width: 100% !important;
            min-width: unset !important;
            max-width: unset !important;
            position: relative !important;
            height: auto !important;
          }
          div[style*="flex: 1"] {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
