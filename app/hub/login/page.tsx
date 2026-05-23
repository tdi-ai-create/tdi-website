'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/hub-auth';
import TDIPortalLoader from '@/components/TDIPortalLoader';
import PortalSignIn from '@/components/auth/PortalSignIn';
import { attributePartnership } from '@/lib/hub/partnerships';

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
        }}
      >
        <PortalSignIn
          portalTitle="TDI Learning Hub"
          portalSubtitle="Professional development that fits your life"
          methods={{ google: true, emailPassword: true, magicLink: true, signUp: true }}
          onSuccess={handleSuccess}
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
    </>
  );
}
