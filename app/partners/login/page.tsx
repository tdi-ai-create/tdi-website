'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FooterSymbol from '@/components/FooterSymbol';
import { Loader2 } from 'lucide-react';
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

        <div className="flex-1">
          <PortalSignIn
            portalTitle="TDI Partnership Dashboard"
            portalSubtitle="Log in to your partner account"
            methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
            onSuccess={handleSuccess}
            magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/partners/login` : '/partners/login'}
            googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/partners/login` : '/partners/login'}
            forgotPasswordRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/partners/reset-password` : '/partners/reset-password'}
            backHref="/"
          />
        </div>

        {/* Footer */}
        <footer style={{ backgroundColor: '#1e2749' }}>
          <div className="px-4 md:px-8 lg:px-16 py-12 md:py-16">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                <div className="sm:col-span-2 lg:col-span-1">
                  <h3 className="text-xl font-bold mb-4 whitespace-nowrap" style={{ color: '#ffffff' }}>
                    Teachers Deserve It
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'white', opacity: 0.7 }}>
                    PD that respects your time, strategies that actually work, and a community that gets it.
                  </p>
                  <Link href="/about#our-symbol" className="inline-block mt-2" aria-label="The story behind the TDI symbol">
                    <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px]">
                      <FooterSymbol />
                    </div>
                  </Link>
                </div>

                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'white' }}>Quick Links</h4>
                  <ul className="space-y-2">
                    {[
                      { href: '/join', label: 'Join the Movement' },
                      { href: '/for-schools', label: 'For Schools' },
                      { href: '/how-we-partner', label: 'How We Partner' },
                      { href: 'https://tdi.thinkific.com', label: 'Learning Hub', external: true },
                      { href: '/about', label: 'About' },
                      { href: '/contact', label: 'Contact' },
                      { href: 'https://raehughart.substack.com', label: 'Blog', external: true },
                      { href: '/faq', label: 'FAQ' },
                    ].map(({ href, label, external }) =>
                      external ? (
                        <li key={label}>
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                            {label}
                          </a>
                        </li>
                      ) : (
                        <li key={label}>
                          <Link href={href} className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                            {label}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4" style={{ color: 'white' }}>Resources</h4>
                  <ul className="space-y-2">
                    {[
                      { href: '/funding', label: 'Funding Options' },
                      { href: '/pd-diagnostic', label: 'PD Diagnostic' },
                      { href: '/calculator', label: 'Impact Calculator' },
                      { href: '/get-started', label: 'Free PD Plan' },
                      { href: 'https://www.facebook.com/groups/tdimovement', label: 'Free FB Community', external: true },
                      { href: '/create-with-us', label: 'Become a Creator' },
                    ].map(({ href, label, external }) =>
                      external ? (
                        <li key={label}>
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                            {label}
                          </a>
                        </li>
                      ) : (
                        <li key={label}>
                          <Link href={href} className="text-sm hover:underline" style={{ color: 'white', opacity: 0.7 }}>
                            {label}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-2" style={{ color: '#ffffff' }}>Stay Connected</h4>
                  <p className="text-sm mb-4" style={{ color: '#ffba06' }}>
                    Join 87,000+ educators who decided<br />they deserved better.
                  </p>
                  <form action="https://formsubmit.co/Olivia@teachersdeserveit.com" method="POST" className="space-y-3">
                    <input type="hidden" name="_subject" value="New Email Signup from TDI Website" />
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_template" value="table" />
                    <input type="hidden" name="_next" value="https://teachersdeserveit.vercel.app/?signup=success" />
                    <input type="email" name="email" placeholder="Your email" required className="w-full px-4 py-3 rounded-lg text-gray-900" style={{ backgroundColor: '#ffffff' }} />
                    <button type="submit" className="w-full px-4 py-3 rounded-lg font-bold transition-all" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                      Join the Movement
                    </button>
                  </form>
                  <p className="text-sm mt-4" style={{ color: '#ffffff', opacity: 0.6 }}>
                    Questions? <a href="mailto:hello@teachersdeserveit.com" className="underline hover:opacity-80">Email us</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="px-4 md:px-8 lg:px-16 py-4 md:py-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <p className="text-sm" style={{ color: 'white', opacity: 0.5 }}>
                  © 2026 Teachers Deserve It. All rights reserved.
                </p>
                <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
                  <Link href="/privacy" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.5 }}>Privacy Policy</Link>
                  <Link href="/terms" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.5 }}>Terms of Service</Link>
                  <Link href="/security" className="text-sm hover:underline" style={{ color: 'white', opacity: 0.5 }}>Security</Link>
                </div>
              </div>
              <p className="text-sm mt-4 text-center" style={{ color: '#ffffff', opacity: 0.7 }}>
                TDI is committed to accessibility. We strive to ensure our website is usable by all educators, including those using assistive technologies.
              </p>
            </div>
          </div>
        </footer>
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
