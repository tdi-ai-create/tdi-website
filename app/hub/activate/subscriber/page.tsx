'use client';

import { useEffect, useState } from 'react';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';

/**
 * Substack Paid Subscriber Activation Page
 *
 * When a paid Substack subscriber clicks the link in their welcome email,
 * this page upgrades their Hub account to Essentials tier automatically.
 *
 * Flow:
 * 1. User pays for Substack ($5/month or $50/year)
 * 2. Substack welcome email includes link to this page
 * 3. User clicks link, logs into Hub (or creates account)
 * 4. This page grants them Essentials tier via comped_access_grants
 * 5. They get immediate access to all Essentials content
 */

export default function SubscriberActivatePage() {
  const [status, setStatus] = useState<'loading' | 'not_logged_in' | 'activating' | 'success' | 'already_active' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function activate() {
      const supabase = getSupabase();

      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus('not_logged_in');
        return;
      }

      setStatus('activating');

      try {
        // Check if they already have an active grant
        const { data: existing } = await supabase
          .from('comped_access_grants')
          .select('id, tier_granted, expires_at')
          .eq('user_id', user.id)
          .eq('reason', 'substack_paid_subscriber')
          .gte('expires_at', new Date().toISOString().slice(0, 10))
          .limit(1);

        if (existing && existing.length > 0) {
          setStatus('already_active');
          return;
        }

        // Grant Essentials tier for 35 days (covers monthly renewal with buffer)
        const grantedAt = new Date().toISOString().slice(0, 10);
        const expiresAt = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        const { error } = await supabase
          .from('comped_access_grants')
          .insert({
            user_id: user.id,
            tier_granted: 'Essentials',
            granted_at: grantedAt,
            expires_at: expiresAt,
            reason: 'substack_paid_subscriber',
          });

        if (error) {
          console.error('[Subscriber Activate] Error:', error);
          setErrorMsg(error.message);
          setStatus('error');
          return;
        }

        setStatus('success');
      } catch (err) {
        setErrorMsg(String(err));
        setStatus('error');
      }
    }

    activate();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAFAF5',
      fontFamily: "'DM Sans', sans-serif",
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '48px 36px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {status === 'loading' && (
          <>
            <h1 style={{ fontSize: '24px', color: '#1B2A4A', marginBottom: '12px' }}>Activating your access...</h1>
            <p style={{ color: '#6B7280' }}>Hang tight, we're setting up your Learning Hub.</p>
          </>
        )}

        {status === 'not_logged_in' && (
          <>
            <h1 style={{ fontSize: '24px', color: '#1B2A4A', marginBottom: '12px' }}>Welcome, Subscriber!</h1>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              Thank you for being a paid subscriber. To activate your Learning Hub access,
              please log in or create your Hub account first.
            </p>
            <a
              href="/hub/login?redirect=/hub/activate/subscriber"
              style={{
                display: 'inline-block',
                backgroundColor: '#D4A843',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              Log in to activate
            </a>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '16px' }}>
              Don't have a Hub account yet? You'll be able to create one.
            </p>
          </>
        )}

        {status === 'activating' && (
          <>
            <h1 style={{ fontSize: '24px', color: '#1B2A4A', marginBottom: '12px' }}>Setting up your access...</h1>
            <p style={{ color: '#6B7280' }}>Upgrading your account to Essentials tier.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
            <h1 style={{ fontSize: '24px', color: '#1B2A4A', marginBottom: '12px' }}>You're all set!</h1>
            <p style={{ color: '#6B7280', marginBottom: '8px' }}>
              Your Learning Hub has been upgraded to <strong>Essentials</strong> tier.
            </p>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              You now have access to more Quick Wins than your tote bag can hold, downloadable PDFs, and priority support.
            </p>
            <a
              href="/hub"
              style={{
                display: 'inline-block',
                backgroundColor: '#D4A843',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              Go to your Hub
            </a>
          </>
        )}

        {status === 'already_active' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
            <h1 style={{ fontSize: '24px', color: '#1B2A4A', marginBottom: '12px' }}>Already activated!</h1>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              Your Essentials access is already active. Enjoy the Hub!
            </p>
            <a
              href="/hub"
              style={{
                display: 'inline-block',
                backgroundColor: '#D4A843',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              Go to your Hub
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 style={{ fontSize: '24px', color: '#1B2A4A', marginBottom: '12px' }}>Something went wrong</h1>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>
              We couldn't activate your access. Please try again or contact us at hello@teachersdeserveit.com.
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}
