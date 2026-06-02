'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/hub-auth';
import { getHubSupabase } from '@/lib/supabase-hub';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';
import { attributePartnership } from '@/lib/hub/partnerships';
import { BookOpen, MessageCircle, Award, Sparkles, Download, Heart, BarChart3, Check, ArrowRight } from 'lucide-react';

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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'linear-gradient(135deg, #2a9d8f, #1f7a6e)', transition: 'opacity 500ms ease-out', opacity: timerDone ? 0 : 1 }} />
      )}

      <div style={{ visibility: showPage ? 'visible' : 'hidden', opacity: showPage ? 1 : 0, transition: 'opacity 300ms ease-in' }}>

        {/* ═══ HERO + SIGN IN ═══ */}
        <section style={{ background: '#1e2749', padding: '64px 16px 80px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(232,184,75,0.12)', color: '#E8B84B', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
              The TDI Learning Hub
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: 'white', lineHeight: 1.2, margin: '0 0 14px', fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Professional development that actually shows up in your classroom
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 460, fontFamily: "'DM Sans', sans-serif" }}>
              Free account. No credit card. Tools you can use Monday morning.
            </p>

            {/* Benefit pills */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
              {[
                { icon: <BookOpen size={13} />, label: 'Quick Wins', color: '#E8B84B' },
                { icon: <MessageCircle size={13} />, label: 'Community', color: '#2A9D8F' },
                { icon: <Award size={13} />, label: 'PD Credit', color: '#7C3AED' },
                { icon: <Sparkles size={13} />, label: 'AI Insights', color: '#0891B2' },
              ].map((item) => (
                <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', color: item.color, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                  {item.icon} {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Sign-in form */}
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <PortalSignIn
              portalTitle=""
              portalSubtitle=""
              methods={{ google: true, emailPassword: true, magicLink: true, signUp: true }}
              onSuccess={handleSuccess}
              getSupabaseClient={getHubSupabase}
              magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/hub/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}` : '/hub/auth/callback'}
              googleRedirectTo={typeof window !== 'undefined' ? window.location.origin + '/hub' : '/hub'}
              forgotPasswordRedirectTo={typeof window !== 'undefined' ? window.location.origin + '/hub/settings/profile' : '/hub/settings/profile'}
            />
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 16, fontFamily: "'DM Sans', sans-serif" }}>
            100,000+ educators across all 50 states
          </p>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section style={{ background: '#F9FAFB', padding: '64px 16px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}>What you get</span>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', margin: '8px 0 32px', fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Everything you need. Nothing you do not.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              {[
                { icon: <Download size={22} />, title: 'Quick Wins', desc: 'Downloadable tools you can use Monday morning. 7 free every week, no paywall.', color: '#E8B84B' },
                { icon: <MessageCircle size={22} />, title: 'Community Q&A', desc: 'Ask questions, share what is working, learn from educators who actually get it.', color: '#2A9D8F' },
                { icon: <Award size={22} />, title: 'PD Certificates', desc: 'Earn certificates for every course. Recognized in all 50 states. Your admin will love it.', color: '#7C3AED' },
                { icon: <Sparkles size={22} />, title: 'AI Growth Insights', desc: 'Personalized reflections on your teaching journey powered by AI. No two are the same.', color: '#0891B2' },
                { icon: <BarChart3 size={22} />, title: 'Track Your Growth', desc: 'See your tools explored, hours saved, and achievements earned. Evidence that builds itself.', color: '#1e2749' },
                { icon: <Heart size={22} />, title: 'Vibe Checks', desc: 'Quick private check-ins on how you are really doing. Your data, your eyes only.', color: '#DC2626' },
              ].map((item) => (
                <div key={item.title} style={{ background: 'white', borderRadius: 14, padding: 24, textAlign: 'left', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: item.color + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: item.color }}>{item.icon}</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#1e2749', marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{item.title}</p>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ NUMBERS ═══ */}
        <section style={{ background: '#1e2749', padding: '48px 16px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: 42, fontWeight: 700, color: '#E8B84B', fontFamily: "'Source Serif 4', serif" }}>90+</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>Quick Wins available</p>
            </div>
            <div>
              <p style={{ fontSize: 42, fontWeight: 700, color: 'white', fontFamily: "'Source Serif 4', serif" }}>50</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>States recognized for PD</p>
            </div>
            <div>
              <p style={{ fontSize: 42, fontWeight: 700, color: '#2A9D8F', fontFamily: "'Source Serif 4', serif" }}>100K+</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>Educators in the community</p>
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section style={{ background: '#F9FAFB', padding: '64px 16px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}>From the community</span>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', margin: '8px 0 0', fontFamily: "'Source Serif 4', Georgia, serif" }}>What educators are saying</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {[
                { quote: 'I used the Calm Response Scripts on a Monday and by Wednesday my transitions were cutting wasted time in half. My admin noticed before I even said anything.', role: 'Middle school teacher, Year 8' },
                { quote: 'The Quick Wins are the first PD resource I have actually used more than once. Practical, fast, and built for people who do not have time for a 3-hour webinar.', role: 'Instructional coach, K-5' },
                { quote: 'I printed my certificate, added it to my portfolio, and used the email template to send it to my principal. She was impressed and I did not even have to explain what TDI was.', role: 'Paraprofessional, 2nd year' },
              ].map((t, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 14, padding: 24, borderLeft: '3px solid #E8B84B', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.65, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>&ldquo;{t.quote}&rdquo;</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>-- {t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section style={{ background: 'white', padding: '64px 16px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#E8B84B', fontFamily: "'DM Sans', sans-serif" }}>Simple pricing</span>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', margin: '8px 0 0', fontFamily: "'Source Serif 4', Georgia, serif" }}>Start free. Upgrade when you are ready.</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {[
                { tier: 'Free', price: '$0', features: ['7 rotating Quick Wins weekly', 'Community Q&A access', 'Personal dashboard', 'Vibe Checks'], highlight: false },
                { tier: 'Essentials', price: '$5/mo', features: ['Full Quick Wins library', 'All downloadable tools', 'Expanded community', 'Everything in Free'], highlight: false },
                { tier: 'Professional', price: '$10/mo', features: ['Full course library', 'PD certificates', 'Priority features', 'Everything in Essentials'], highlight: true },
                { tier: 'All-Access', price: '$25/mo', features: ['Everything in the Hub', 'All courses and tools', 'Exclusive resources', 'No limits'], highlight: false },
              ].map((t) => (
                <div key={t.tier} style={{ background: t.highlight ? '#1e2749' : '#F9FAFB', borderRadius: 14, padding: 24, border: t.highlight ? 'none' : '1px solid #E5E7EB', boxShadow: t.highlight ? '0 4px 24px rgba(30,39,73,0.15)' : 'none' }}>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: t.highlight ? 'white' : '#1e2749', fontFamily: "'DM Sans', sans-serif" }}>{t.tier}</span>
                    <span style={{ fontSize: 15, color: '#E8B84B', fontWeight: 600, marginLeft: 8 }}>{t.price}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {t.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Check size={14} style={{ color: t.highlight ? '#E8B84B' : '#2A9D8F', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: t.highlight ? 'rgba(255,255,255,0.8)' : '#6B7280', fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM CTA ═══ */}
        <section style={{ background: '#1e2749', padding: '48px 16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8, fontFamily: "'Source Serif 4', Georgia, serif" }}>Ready to explore?</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Scroll up to sign in. It takes 30 seconds.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 28px', background: '#E8B84B', color: '#1e2749', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          >
            Sign in now <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </>
  );
}
