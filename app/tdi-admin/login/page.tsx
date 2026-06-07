'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Users, BarChart3, Settings } from 'lucide-react';
import { checkTeamAccess } from '@/lib/tdi-admin/permissions';
import { getSupabase } from '@/lib/supabase';
import PortalSignIn from '@/components/auth/PortalSignIn';

export default function TDIAdminLoginPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedEmail, setDeniedEmail] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        // Use Creator Portal Supabase — admin users auth against Creator Portal, NOT the Hub
        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const teamMember = await checkTeamAccess(user.id, user.email || '');
          if (teamMember) {
            router.push('/tdi-admin');
            return;
          } else {
            setAccessDenied(true);
            setDeniedEmail(user.email || '');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      }
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setAccessDenied(false);
    setDeniedEmail('');
  };

  const handleSuccess = async (
    trigger: 'google' | 'emailPassword' | 'magicLink' | 'signUp' | 'forgotPassword',
    email: string,
    userId?: string,
  ): Promise<string | void> => {
    if (trigger === 'emailPassword' && userId) {
      const teamMember = await checkTeamAccess(userId, email);
      if (teamMember) {
        router.push('/tdi-admin');
      } else {
        setAccessDenied(true);
        setDeniedEmail(email);
      }
      return;
    }
    if (trigger === 'magicLink') {
      return 'Check your email for a magic link. You\'ll be redirected after clicking it.';
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <p className="text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Checking authentication...
        </p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
              <Image src="/images/logo.webp" alt="Teachers Deserve It" width={120} height={36} className="h-8 w-auto" />
            </div>

            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="font-bold mb-3 text-center" style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '20px', color: '#2B3A67' }}>
              Access Not Granted
            </h1>
            <p className="text-center mb-4" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#6B7280' }}>
              Your account does not have admin access. Contact Rae if you believe this is an error.
            </p>

            <div className="py-3 px-4 rounded-lg mb-6 text-center" style={{ backgroundColor: '#F3F4F6' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6B7280' }}>
                Signed in as: <strong style={{ color: '#374151' }}>{deniedEmail}</strong>
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full font-semibold rounded-lg transition-colors hover:brightness-105"
              style={{ height: '44px', backgroundColor: '#2B3A67', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign Out
            </button>

            <Link
              href="/hub"
              className="block mt-4 text-center hover:underline"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6B7280' }}
            >
              Go to Learning Hub instead
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const valueProps = [
    { icon: LayoutDashboard, text: 'Creator Studio management with milestone tracking' },
    { icon: Users, text: 'Partnership lifecycle from sales through renewal' },
    { icon: BarChart3, text: 'Live Hub analytics and educator engagement data' },
    { icon: Settings, text: 'Automated workflows, notifications, and reports' },
  ];

  return (
    <>
      <style>{`
        .admin-login-left {
          display: flex;
          width: 50%;
          min-height: 100vh;
          flex-direction: column;
          justify-content: center;
          padding: 3rem;
          background-color: #1e2749;
          color: #ffffff;
        }
        .admin-login-right {
          display: flex;
          width: 50%;
          min-height: 100vh;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-color: #F9FAFB;
        }
        @media (max-width: 768px) {
          .admin-login-left {
            display: none;
          }
          .admin-login-right {
            width: 100%;
          }
        }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Left Panel */}
        <div className="admin-login-left">
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: '#ffba06',
                color: '#1e2749',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: '24px',
              }}
            >
              TDI ADMIN PORTAL
            </span>

            <h1
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '36px',
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '16px',
                color: '#ffffff',
              }}
            >
              Manage Everything in One Place
            </h1>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '40px',
              }}
            >
              Creators, partnerships, Hub analytics, sales pipeline, and funding -- all from your admin dashboard.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {valueProps.map((prop, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255,186,6,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <prop.icon size={20} color="#ffba06" />
                  </div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      color: 'rgba(255,255,255,0.85)',
                      lineHeight: 1.5,
                      paddingTop: '8px',
                    }}
                  >
                    {prop.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="admin-login-right">
          <div style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#1e2749',
                  marginBottom: '8px',
                }}
              >
                TDI Admin Portal
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#6B7280',
                }}
              >
                Sign in to manage Teachers Deserve It
              </p>
            </div>

            <PortalSignIn
              compact
              portalTitle="TDI Admin Portal"
              portalSubtitle="Sign in to manage Teachers Deserve It"
              methods={{ google: true, emailPassword: true, magicLink: true, signUp: false }}
              onSuccess={handleSuccess}
              magicLinkRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/tdi-admin/login` : '/tdi-admin/login'}
              googleRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/tdi-admin` : '/tdi-admin'}
              forgotPasswordRedirectTo={typeof window !== 'undefined' ? `${window.location.origin}/tdi-admin/login` : '/tdi-admin/login'}
              backHref={null}
            />
          </div>
        </div>
      </div>
    </>
  );
}
