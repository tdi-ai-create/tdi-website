'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
  if (type === 'admin') return '/admin/creators';
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

  return (
    <PortalSignIn
      portalTitle="TDI Creator Studio"
      portalSubtitle="Sign in to your creator account"
      methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
      onEmailPreCheck={handleEmailPreCheck}
      onSuccess={handleSuccess}
      magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/creator-portal` : '/creator-portal'}
      googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/creator-portal/auth/callback` : '/creator-portal/auth/callback'}
      backHref="/"
    />
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
