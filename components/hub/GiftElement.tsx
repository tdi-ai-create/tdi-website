'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHub } from '@/components/hub/HubContext';
import { useMembership } from '@/lib/hub/use-membership';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { GIFT_COPY } from '@/lib/gift-element-copy';
import { Mail, MailOpen, Check } from 'lucide-react';

type GiftState = 'eligible' | 'urgent' | 'active' | 'claimed' | 'hidden';

interface GiftData {
  state: GiftState;
  daysLeft?: number;
  hoursLeft?: number;
  claimedDate?: string;
}

/** Launch-window deadline: Aug 31, 2026 */
const LAUNCH_DEADLINE = new Date('2026-08-31T23:59:59');

/** 24-hour trial duration in ms */
const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000;

/** Urgency threshold: 7 days before deadline */
const URGENCY_DAYS = 7;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function GiftElement() {
  const { user } = useHub();
  const { effectiveTier, isLoading: membershipLoading } = useMembership();
  const { tUI } = useTranslation();
  const [giftData, setGiftData] = useState<GiftData>({ state: 'hidden' });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadGiftState = useCallback(async () => {
    if (!user?.id) return;

    const supabase = getSupabase();

    // Check if user already claimed
    const { data: claimedData } = await supabase
      .from('hub_activity_log')
      .select('metadata, created_at')
      .eq('user_id', user.id)
      .eq('action', 'gift_claimed')
      .limit(1)
      .maybeSingle();

    if (claimedData) {
      // Check if trial is still active
      const { data: trialData } = await supabase
        .from('hub_activity_log')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('action', 'gift_trial_active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (trialData) {
        const trialStart = new Date(trialData.created_at).getTime();
        const now = Date.now();
        const elapsed = now - trialStart;

        if (elapsed < TRIAL_DURATION_MS) {
          const hoursLeft = Math.max(1, Math.ceil((TRIAL_DURATION_MS - elapsed) / (1000 * 60 * 60)));
          setGiftData({ state: 'active', hoursLeft });
          setIsLoading(false);
          return;
        }
      }

      // Trial expired or no trial record
      setGiftData({
        state: 'claimed',
        claimedDate: formatDate(claimedData.created_at),
      });
      setIsLoading(false);
      return;
    }

    // Not claimed -- determine deadline
    const now = new Date();
    let deadline: Date;

    if (now < LAUNCH_DEADLINE) {
      deadline = LAUNCH_DEADLINE;
    } else {
      // Post-launch: deadline is 3 days from user's first login
      const { data: firstLog } = await supabase
        .from('hub_activity_log')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstLog) {
        const firstDate = new Date(firstLog.created_at);
        deadline = new Date(firstDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      } else {
        // No activity yet; set deadline 3 days from now
        deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      }
    }

    const daysLeft = daysBetween(now, deadline);

    if (daysLeft <= 0) {
      // Past deadline, gift expired -- hide
      setGiftData({ state: 'hidden' });
    } else if (daysLeft <= URGENCY_DAYS) {
      setGiftData({ state: 'urgent', daysLeft });
    } else {
      setGiftData({ state: 'eligible' });
    }

    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (membershipLoading) return;

    // If user is all_access, don't render
    if (effectiveTier === 'all_access') {
      setGiftData({ state: 'hidden' });
      setIsLoading(false);
      return;
    }

    loadGiftState();
  }, [effectiveTier, membershipLoading, loadGiftState]);

  const handleClaim = async () => {
    if (!user?.id || isClaiming) return;
    setIsClaiming(true);

    try {
      const supabase = getSupabase();
      const now = new Date().toISOString();
      const windowType = new Date() < LAUNCH_DEADLINE ? 'launch' : 'signup';

      // Write gift_claimed
      await supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action: 'gift_claimed',
        metadata: { claimed_at: now, window_type: windowType },
      });

      // Write gift_trial_active
      await supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action: 'gift_trial_active',
        metadata: { activated_at: now },
      });

      setGiftData({ state: 'active', hoursLeft: 24 });
      setIsExpanded(false);
    } catch (error) {
      console.error('Error claiming gift:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading || giftData.state === 'hidden') return null;

  // State 4: Claimed
  if (giftData.state === 'claimed') {
    return (
      <div
        data-tour="gift-element"
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: '#F9FAFB', border: '0.5px solid rgba(0,0,0,0.06)' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#E8F5E9' }}
        >
          <Check size={16} style={{ color: '#619B8A' }} />
        </div>
        <span className="text-xs" style={{ color: '#9CA3AF' }}>
          {tUI(GIFT_COPY.claimed.label(giftData.claimedDate ?? ''))}
        </span>
      </div>
    );
  }

  // State 3: Trial active
  if (giftData.state === 'active') {
    return (
      <div
        data-tour="gift-element"
        className="rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg, #619B8A 0%, #4a8272 100%)', border: 'none' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <MailOpen size={16} style={{ color: 'white' }} />
          </div>
          <span className="text-sm font-semibold text-white">
            {tUI(GIFT_COPY.active.label(giftData.hoursLeft ?? 24))}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {tUI(GIFT_COPY.active.description)}
        </p>
      </div>
    );
  }

  // State 1 & 2: Eligible / Urgent
  const isUrgent = giftData.state === 'urgent';
  const copy = isUrgent ? GIFT_COPY.urgent : GIFT_COPY.eligible;
  const labelText = isUrgent
    ? GIFT_COPY.urgent.label(giftData.daysLeft ?? 0)
    : GIFT_COPY.eligible.label;

  return (
    <div data-tour="gift-element">
      {/* Collapsed state */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 transition-all"
        style={{
          background: '#FAFAF8',
          border: '0.5px solid rgba(0,0,0,0.06)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isUrgent ? 'tdi-gift-pulse' : ''}`}
          style={{ background: '#E8F0ED' }}
        >
          <Mail size={16} style={{ color: '#619B8A' }} />
        </div>
        <span
          className="text-sm font-medium"
          style={{ color: isUrgent ? '#619B8A' : '#6B7280' }}
        >
          {tUI(labelText)}
        </span>
        <svg
          className="ml-auto flex-shrink-0 transition-transform"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded state */}
      {isExpanded && (
        <div
          className="mt-2 rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e2749 0%, #2d3a5c 100%)',
            animation: 'tdi-slide-down 0.2s ease-out',
          }}
        >
          <h3
            className="text-base font-bold text-white mb-2"
            style={{ fontFamily: "'Source Serif 4', serif" }}
          >
            {tUI(copy.expandedTitle)}
          </h3>
          <p
            className="text-xs leading-relaxed mb-4"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {tUI(copy.expandedDescription)}
          </p>
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: isClaiming ? '#d4a005' : '#ffba06',
              color: '#1e2749',
              border: 'none',
              cursor: isClaiming ? 'wait' : 'pointer',
            }}
          >
            {isClaiming ? tUI('Opening...') : tUI(copy.claimButton)}
          </button>
        </div>
      )}

      {/* Inject pulse animation + slide-down */}
      <style jsx global>{`
        @keyframes tdi-gift-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .tdi-gift-pulse {
          animation: tdi-gift-pulse 3s ease-in-out infinite;
        }
        @keyframes tdi-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
