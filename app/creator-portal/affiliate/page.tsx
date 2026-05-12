'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LogOut,
  Copy,
  Check,
  Share2,
  QrCode,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
  UserPlus,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';

// ==========================================
// Types
// ==========================================

interface AffiliateLink {
  affiliateSlug: string | null;
  fullUrl: string | null;
  linkUrl: string | null;
}

interface PeriodStats {
  label?: string;
  clicks: number;
  signups: number;
  conversions: number;
  earnedCents: number;
  payoutStatus?: string | null;
  paidAt?: string | null;
}

interface AffiliateStats {
  thisMonth: PeriodStats;
  lastMonth: PeriodStats;
  lifetime: PeriodStats;
}

interface Payout {
  id: string;
  periodStart: string;
  periodEnd: string;
  amountCents: number;
  conversionCount: number;
  status: 'pending' | 'approved' | 'paid';
  paidAt: string | null;
  notes: string | null;
}

// ==========================================
// Helpers
// ==========================================

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function PayoutStatusBadge({ status, paidAt }: { status: string | null; paidAt?: string | null }) {
  if (!status) return null;

  if (status === 'paid') {
    const dateStr = paidAt
      ? new Date(paidAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : '';
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        Paid{dateStr ? ` ${dateStr}` : ''}
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
      Pending
    </span>
  );
}

// ==========================================
// FAQ Data
// ==========================================

const FAQ_ITEMS = [
  {
    q: 'When do I get paid?',
    a: 'By the 15th of the month after the conversion happens. So a sale in May = paid by June 15.',
  },
  {
    q: 'How is the 50% calculated?',
    a: "On net revenue after processing fees, taxes, and any refunds \u2014 never on gross. You see the full breakdown on every payout statement.",
  },
  {
    q: "What if someone clicks my link but doesn't sign up for weeks?",
    a: "You're still credited. The cookie lasts 90 days, so as long as they sign up within that window, you earn.",
  },
  {
    q: "Can I see who's been clicking?",
    a: "We show you click counts but not individual identities (to protect visitor privacy). For paid conversions, we show the email so you can recognize who signed up if they shared with you.",
  },
  {
    q: 'Does the cookie work if they switch devices?',
    a: "Once they sign up, their account is linked to your referral \u2014 so they could click on their phone and convert on their laptop, and you'd still earn.",
  },
  {
    q: 'What if they get a refund?',
    a: "If a customer refunds within 30 days, we deduct that from your earnings. We never deduct beyond your current balance \u2014 if a refund hits after we've paid you, we just deduct from the next payout.",
  },
  {
    q: 'Can I have multiple affiliate links?',
    a: 'Each creator gets one unique link. But you can add UTM parameters to track where it\'s performing best (e.g., ?utm_source=instagram).',
  },
  {
    q: 'Who can I ask for help?',
    a: 'Email rae@teachersdeserveit.com anytime.',
  },
];

// ==========================================
// Tip Cards Data
// ==========================================

const TIPS = [
  { icon: '\uD83C\uDFA4', title: 'Add it to your podcast bio', desc: '"Listen until the end for my TDI link"' },
  { icon: '\u2709\uFE0F', title: 'Put it in your email signature', desc: 'Passive promotion that compounds' },
  { icon: '\uD83D\uDCF8', title: 'Pin it on Instagram', desc: 'Link in bio + a story highlight' },
  { icon: '\uD83C\uDF99\uFE0F', title: 'Mention it in talks', desc: 'Keynote, PD sessions, workshops' },
  { icon: '\uD83D\uDCF0', title: 'Drop it in your newsletter', desc: 'A single line, every issue' },
  { icon: '\uD83D\uDCAC', title: 'Share it in teacher communities', desc: 'Facebook groups, Reddit, school staff meetings' },
];

// ==========================================
// Main Page Component
// ==========================================

export default function AffiliatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [linkData, setLinkData] = useState<AffiliateLink | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/creator-portal');
  };

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        router.push('/creator-portal');
        return;
      }

      const [linkRes, statsRes, payoutsRes] = await Promise.all([
        fetch('/api/creator/affiliate/link'),
        fetch('/api/creator/affiliate/stats'),
        fetch('/api/creator/affiliate/payouts'),
      ]);

      const [linkJson, statsJson, payoutsJson] = await Promise.all([
        linkRes.json(),
        statsRes.json(),
        payoutsRes.json(),
      ]);

      if (linkJson.success) setLinkData(linkJson);
      if (statsJson.success) setStats(statsJson);
      if (payoutsJson.success) setPayouts(payoutsJson.payouts || []);
    } catch (error) {
      console.error('[affiliate] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = async () => {
    if (!linkData?.linkUrl) return;
    try {
      await navigator.clipboard.writeText(linkData.linkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = linkData.linkUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!linkData?.linkUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Teachers Deserve It',
          text: 'Check out Teachers Deserve It!',
          url: linkData.linkUrl,
        });
      } catch {
        // User cancelled or share failed — fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // ==========================================
  // Render
  // ==========================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#80a4ed]" />
          <p className="text-gray-500 text-sm">Loading your affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-wide py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={120}
              height={36}
              className="h-9 w-auto"
            />
            <div className="hidden sm:flex items-center">
              <span className="text-gray-300 mx-2">|</span>
              <span className="text-[#ffba06] font-semibold text-sm uppercase tracking-wide">
                Creator Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/creator-portal/dashboard"
              className="flex items-center gap-1.5 text-sm text-[#80a4ed] hover:text-[#1e2749] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e2749] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container-wide py-8 space-y-8">
        {/* ==========================================
            SECTION 1: Hero — Your Affiliate Link
            ========================================== */}
        <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] rounded-2xl p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Your unique affiliate link
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-6">
            Earn 50% on every paid conversion through this link &mdash; paid monthly.
          </p>

          {linkData?.fullUrl ? (
            <>
              {/* Link display */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-5">
                <p
                  className="text-lg md:text-xl font-mono text-white select-all break-all"
                  title="Click to select"
                >
                  {linkData.fullUrl}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-[#1e2749] hover:bg-white/90'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>

                <button
                  onClick={() => setShowQR(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/15 text-white hover:bg-white/25 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  Show QR Code
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/15 text-white hover:bg-white/25 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-sm">
                Your affiliate link is being set up. Check back soon or email{' '}
                <a href="mailto:rae@teachersdeserveit.com" className="underline text-white">
                  rae@teachersdeserveit.com
                </a>{' '}
                if you have questions.
              </p>
            </div>
          )}
        </div>

        {/* ==========================================
            SECTION 2: Your Earnings (3 stat cards)
            ========================================== */}
        <div>
          <h2 className="text-xl font-semibold text-[#1e2749] mb-4">Your Earnings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* This Month */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {stats?.thisMonth.label || 'This Month'}
                </h3>
                <div className="w-8 h-8 rounded-lg bg-[#80a4ed]/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#80a4ed]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1e2749] mb-3">
                {formatCents(stats?.thisMonth.earnedCents || 0)}
              </p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.thisMonth.clicks || 0} clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.thisMonth.signups || 0} signups</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.thisMonth.conversions || 0} conversions</span>
                </div>
              </div>
            </div>

            {/* Last Month */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {stats?.lastMonth.label || 'Last Month'}
                </h3>
                {stats?.lastMonth.payoutStatus && (
                  <PayoutStatusBadge
                    status={stats.lastMonth.payoutStatus}
                    paidAt={stats.lastMonth.paidAt ?? undefined}
                  />
                )}
              </div>
              <p className="text-3xl font-bold text-[#1e2749] mb-3">
                {formatCents(stats?.lastMonth.earnedCents || 0)}
              </p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.lastMonth.clicks || 0} clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.lastMonth.signups || 0} signups</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.lastMonth.conversions || 0} conversions</span>
                </div>
              </div>
            </div>

            {/* Lifetime */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lifetime</h3>
                <div className="w-8 h-8 rounded-lg bg-[#ffba06]/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-[#ffba06]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#1e2749] mb-3">
                {formatCents(stats?.lifetime.earnedCents || 0)}
              </p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.lifetime.clicks || 0} clicks</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.lifetime.signups || 0} signups</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <span>{stats?.lifetime.conversions || 0} conversions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payout History */}
          {payouts.length > 0 && (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Payout History
              </h3>
              <div className="divide-y divide-gray-100">
                {payouts.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749]">
                        {new Date(p.periodStart).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.conversionCount} conversion{p.conversionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#1e2749]">
                        {formatCents(p.amountCents)}
                      </span>
                      <PayoutStatusBadge status={p.status} paidAt={p.paidAt ?? undefined} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            SECTION 3: How It Works
            ========================================== */}
        <div className="bg-gradient-to-r from-[#ffba06]/10 to-[#80a4ed]/10 rounded-2xl p-6 md:p-8 border border-[#ffba06]/20">
          <h2 className="text-xl font-semibold text-[#1e2749] mb-6">
            How your affiliate link works
          </h2>

          <div className="space-y-5">
            {[
              {
                step: 1,
                title: 'Share your link.',
                desc: 'Drop it anywhere \u2014 your website, email signature, social media, your podcast bio, even hand-written on a sticky note at a conference. Anywhere a teacher might see it.',
              },
              {
                step: 2,
                title: 'Someone clicks it.',
                desc: 'When a teacher clicks your link, we set a cookie that remembers you sent them. This cookie lasts 90 days \u2014 so even if they don\'t sign up right away, you\'re still credited.',
              },
              {
                step: 3,
                title: 'They sign up to TDI.',
                desc: "Maybe to access your content, maybe someone else's \u2014 doesn't matter. You earn either way.",
              },
              {
                step: 4,
                title: 'They make a paid purchase.',
                desc: 'When they convert (subscription, course, download, etc.), you earn 50% of the net revenue.',
              },
              {
                step: 5,
                title: 'We pay you monthly.',
                desc: "By the 15th of every month, you'll get paid for the prior month's conversions. Always with a transparent breakdown.",
              },
            ].map(item => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e2749] text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-[#1e2749]">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            SECTION 4: Tips to Promote Your Link
            ========================================== */}
        <div>
          <h2 className="text-xl font-semibold text-[#1e2749] mb-4">Tips to Promote Your Link</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-2">{tip.icon}</div>
                <p className="font-semibold text-[#1e2749] text-sm">{tip.title}</p>
                <p className="text-xs text-gray-500 mt-1">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            SECTION 5: FAQ
            ========================================== */}
        <div>
          <h2 className="text-xl font-semibold text-[#1e2749] mb-4">Frequently Asked Questions</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-[#1e2749] text-sm pr-4">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="container-wide text-center text-sm text-gray-500">
          <p>
            Questions? Email{' '}
            <a
              href="mailto:rae@teachersdeserveit.com"
              className="text-[#80a4ed] hover:text-[#1e2749]"
            >
              rae@teachersdeserveit.com
            </a>
          </p>
        </div>
      </footer>

      {/* QR Code Modal */}
      {showQR && linkData?.linkUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your QR Code</h2>
                <button
                  onClick={() => setShowQR(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/70 text-sm mt-1">
                Save or screenshot this to share at events
              </p>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <QRCodeSVG
                  value={linkData.linkUrl}
                  size={200}
                  level="M"
                  includeMargin={false}
                  fgColor="#1e2749"
                />
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center font-mono select-all">
                {linkData.fullUrl}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
