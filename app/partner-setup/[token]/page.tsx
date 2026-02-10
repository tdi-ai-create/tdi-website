'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  School,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  contact_name: string;
  contact_email: string;
  contract_phase: string;
  invite_token: string;
  invite_accepted_at: string | null;
  status: string;
}

type PageState = 'loading' | 'invalid' | 'valid' | 'magic_link_sent' | 'creating_account' | 'error';

function PartnerSetupContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>('loading');
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load partnership by token
  useEffect(() => {
    const loadPartnership = async () => {
      try {
        const response = await fetch(`/api/partner-setup/${token}`);
        const data = await response.json();

        if (data.success && data.partnership) {
          setPartnership(data.partnership);
          setPageState('valid');
        } else {
          setPageState('invalid');
        }
      } catch (error) {
        console.error('Error loading partnership:', error);
        setPageState('invalid');
      }
    };

    if (token) {
      loadPartnership();
    }
  }, [token]);

  // Handle magic link callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error) {
        setPageState('error');
        setErrorMessage(errorDescription || 'Authentication failed');
        return;
      }

      // Check for auth params
      const hasAuthParams = window.location.hash.includes('access_token') ||
                           searchParams.get('code') !== null;

      if (!hasAuthParams) return;

      setPageState('creating_account');

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Create partnership user and accept invite
          const response = await fetch(`/api/partner-setup/${token}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: session.user.id,
              email: session.user.email,
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Redirect to intake wizard
            router.push(`/partner-setup/${token}/intake`);
          } else {
            setPageState('error');
            setErrorMessage(data.error || 'Failed to accept invite');
          }
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setPageState('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    };

    handleAuthCallback();
  }, [searchParams, token, router]);

  const handleSendMagicLink = async () => {
    if (!partnership) return;

    setPageState('loading');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: partnership.contact_email,
        options: {
          emailRedirectTo: `${window.location.origin}/partner-setup/${token}`,
        },
      });

      if (error) throw error;

      setPageState('magic_link_sent');
    } catch (error) {
      console.error('Error sending magic link:', error);
      setPageState('error');
      setErrorMessage('Failed to send login link. Please try again.');
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is no longer valid. It may have already been used or has expired.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => setPageState('valid')}
            className="inline-flex items-center gap-2 bg-[#1e2749] text-white px-6 py-3 rounded-lg hover:bg-[#2a3459] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Creating account state
  if (pageState === 'creating_account') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  // Magic link sent state
  if (pageState === 'magic_link_sent') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e2749] mb-2">
              Check your email!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              We sent a magic link to <strong className="text-[#1e2749]">{partnership?.contact_email}</strong>.
              <br />Click the link in your email to continue setup.
            </p>
            <button
              onClick={() => setPageState('valid')}
              className="text-[#80a4ed] hover:text-[#1e2749] text-sm font-medium transition-colors"
            >
              Didn&apos;t receive it? Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Valid token - show welcome screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container-wide py-4">
          <Image
            src="/images/logo.webp"
            alt="Teachers Deserve It"
            width={160}
            height={48}
            className="h-12 w-auto"
          />
        </div>
      </header>

      <main className="container-wide py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#1e2749] px-8 py-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#ffba06]" />
                <span className="text-sm font-medium text-[#ffba06]">Partnership Invitation</span>
              </div>
              <h1 className="text-2xl font-bold">
                Welcome, {partnership?.contact_name}!
              </h1>
              <p className="text-white/80 mt-1">
                You&apos;ve been invited to join the TDI Partner Portal.
              </p>
            </div>

            {/* Card Body */}
            <div className="p-8">
              {/* Partnership Info */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  partnership?.partnership_type === 'district'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {partnership?.partnership_type === 'district' ? (
                    <Building2 className="w-6 h-6" />
                  ) : (
                    <School className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#1e2749] capitalize">
                    {partnership?.partnership_type} Partnership
                  </p>
                  <p className="text-sm text-gray-600">
                    Contract Phase: <span className="font-medium">{partnership?.contract_phase}</span>
                  </p>
                </div>
              </div>

              {/* What to Expect */}
              <div className="mb-8">
                <h3 className="font-semibold text-[#1e2749] mb-3">What happens next?</h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#80a4ed] text-white text-sm flex items-center justify-center flex-shrink-0">1</span>
                    <span className="text-gray-600">Verify your email with a magic link</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center flex-shrink-0">2</span>
                    <span className="text-gray-600">Complete your organization profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center flex-shrink-0">3</span>
                    <span className="text-gray-600">Upload your staff roster</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm flex items-center justify-center flex-shrink-0">4</span>
                    <span className="text-gray-600">Access your partnership dashboard</span>
                  </li>
                </ol>
              </div>

              {/* CTA */}
              <button
                onClick={handleSendMagicLink}
                className="w-full bg-[#1e2749] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#2a3459] transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Get Started - Send Magic Link
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                We&apos;ll send a login link to <strong>{partnership?.contact_email}</strong>
              </p>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Questions? Contact us at{' '}
            <a href="mailto:hello@teachersdeserveit.com" className="text-[#80a4ed] hover:text-[#1e2749]">
              hello@teachersdeserveit.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed] mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function PartnerSetupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PartnerSetupContent />
    </Suspense>
  );
}
