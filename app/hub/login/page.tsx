'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/hub-auth';
import { getHubSupabase } from '@/lib/supabase-hub';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';
import { attributePartnership } from '@/lib/hub/partnerships';
import { Check, Crown, Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function HubLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/hub';
  const [animationComplete, setAnimationComplete] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasRedirectedRef = useRef(false);

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
    if (trigger === 'signUp' && userId) { await attributePartnership(userId); return 'Check your email to confirm your account.'; }
  };

  const TIERS = [
    { name: 'Free', price: '$0', period: '', accent: '#6B7280', desc: 'Access rotating free content each week.', features: ['Rotating free content weekly', 'Save favorites for later', 'Track your PD hours', 'Community Q&A access'], highlight: false, icon: Sparkles },
    { name: 'Essentials', price: '$5', period: '/mo', accent: '#185FA5', desc: 'Download individual quick wins and resources.', features: ['Everything in Free', 'All individual quick wins', 'Download PDFs & templates', 'Priority email support'], highlight: false, icon: Zap },
    { name: 'Professional', price: '$10', period: '/mo', accent: '#2A9D8F', desc: 'Comprehensive resource packs for your classroom.', features: ['Everything in Essentials', 'Full course library', 'PD certificates', 'Community discussion access'], highlight: true, icon: Crown },
    { name: 'All-Access', price: '$25', period: '/mo', accent: '#1e2749', desc: 'Unlock everything, including the full course library.', features: ['Everything in Professional', 'Full course library access', 'Earn PD certificates', 'Exclusive workshops'], highlight: false, icon: Crown },
  ];

  return (
    <>
      {showAnimation && <TDIPortalLoader portal="hub" onComplete={() => setAnimationComplete(true)} />}
      {!showPage && animationComplete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'linear-gradient(135deg, #2a9d8f, #1f7a6e)', transition: 'opacity 500ms ease-out', opacity: timerDone ? 0 : 1 }} />
      )}

      <div style={{ visibility: showPage ? 'visible' : 'hidden', opacity: showPage ? 1 : 0, transition: 'opacity 300ms ease-in', backgroundColor: '#ffffff' }}>

        {/* ═══ HERO ═══ */}
        <section style={{ backgroundColor: '#1e2749', padding: '56px 16px 48px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,186,6,0.15)', color: '#ffba06', borderRadius: 999, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              The TDI Learning Hub
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: 'white', margin: '0 0 16px 0', lineHeight: 1.15 }}>
              Professional Development That Actually Works
            </h1>
            <p style={{ fontSize: 18, color: 'white', opacity: 0.85, maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
              Tools you can use Monday morning. A community that gets it. PD credit you can prove.
            </p>
          </div>
        </section>

        {/* ═══ SIGN IN ═══ */}
        <section style={{ padding: '40px 16px 48px', backgroundColor: '#F9FAFB' }}>
          <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', margin: '0 0 4px' }}>Sign in to the Hub</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Free account. No credit card required.</p>
            <PortalSignIn
              portalTitle=""
              portalSubtitle=""
              backHref={null}
              compact
              methods={{ google: true, emailPassword: true, magicLink: true, signUp: true }}
              onSuccess={handleSuccess}
              getSupabaseClient={getHubSupabase}
              magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/hub/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}` : '/hub/auth/callback'}
              googleRedirectTo={typeof window !== 'undefined' ? window.location.origin + '/hub' : '/hub'}
              forgotPasswordRedirectTo={typeof window !== 'undefined' ? window.location.origin + '/hub/settings/profile' : '/hub/settings/profile'}
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>100,000+ educators across all 50 states</p>
          </div>
        </section>

        {/* ═══ PRICING ═══ */}
        <section style={{ padding: '60px 16px', backgroundColor: '#F9FAFB' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#1e2749', margin: '0 0 8px' }}>Membership Plans</h2>
              <p style={{ fontSize: 16, color: '#6B7280' }}>Choose the plan that fits your needs. Upgrade anytime.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
              {TIERS.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div key={tier.name} style={{ background: 'white', borderRadius: 16, padding: 28, border: tier.highlight ? `2px solid ${tier.accent}` : '0.5px solid #E5E7EB', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {tier.highlight && (
                      <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: tier.accent, color: 'white', padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Most Popular
                      </span>
                    )}
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${tier.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon style={{ width: 24, height: 24, color: tier.accent }} />
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1e2749', margin: '0 0 4px 0' }}>{tier.name}</h3>
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 36, fontWeight: 700, color: '#1e2749' }}>{tier.price}</span>
                      {tier.period && <span style={{ fontSize: 14, color: '#6B7280', marginLeft: 4 }}>{tier.period}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px 0', lineHeight: 1.5 }}>{tier.desc}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flexGrow: 1 }}>
                      {tier.features.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#1e2749', marginBottom: 10, lineHeight: 1.4 }}>
                          <Check style={{ width: 16, height: 16, color: tier.accent, flexShrink: 0, marginTop: 2 }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      style={{ width: '100%', padding: 12, background: tier.highlight ? tier.accent : 'white', color: tier.highlight ? 'white' : tier.accent, border: tier.highlight ? 'none' : `1px solid ${tier.accent}`, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', textAlign: 'center' }}
                    >
                      {tier.name === 'Free' ? 'Get Started' : `Choose ${tier.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280' }}>
              Bulk pricing available for schools and districts.{' '}
              <a href="/for-schools" style={{ color: '#2A9D8F', fontWeight: 600, textDecoration: 'none' }}>See partnership options <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></a>
            </p>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section style={{ padding: '60px 16px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', textAlign: 'center', marginBottom: 32 }}>What educators are saying</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {[
                { quote: 'I used the Calm Response Scripts on a Monday and by Wednesday my transitions were cutting wasted time in half. My admin noticed before I even said anything.', role: 'Middle school teacher, Year 8' },
                { quote: 'The Quick Wins are the first PD resource I have actually used more than once. Practical, fast, and built for people who do not have time for a 3-hour webinar.', role: 'Instructional coach, K-5' },
                { quote: 'I printed my certificate, added it to my portfolio, and used the email template to send it to my principal. She was impressed.', role: 'Paraprofessional, 2nd year' },
              ].map((t, i) => (
                <div key={i} style={{ background: '#F9FAFB', borderRadius: 16, padding: 24, borderLeft: '3px solid #E8B84B' }}>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.65, marginBottom: 12 }}>&ldquo;{t.quote}&rdquo;</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>-- {t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BOTTOM CTA ═══ */}
        <section style={{ backgroundColor: '#1e2749', padding: '48px 16px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>Ready to explore?</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Create your free account in 30 seconds.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', background: '#E8B84B', color: '#1e2749', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Sign in now <ArrowRight size={18} />
          </button>
        </section>
      </div>

    </>
  );
}
