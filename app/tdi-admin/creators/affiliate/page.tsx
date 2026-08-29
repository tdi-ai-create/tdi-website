'use client';

/**
 * Creator affiliate earnings and payouts.
 *
 * Clicks, conversions, the leaderboard and the payout batches.
 *
 * Lifted out of app/tdi-admin/creators/page.tsx unchanged. It was already a
 * standalone function taking no props, so this is a relocation and not a
 * rewrite.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Loader2, ArrowLeft, DollarSign, TrendingUp, MousePointerClick, Trophy, Copy, Check,
  ExternalLink, Download as DownloadIcon, Zap, X, UserCheck, Calendar,
} from 'lucide-react';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { copyToClipboard } from '@/lib/tdi-admin/clipboard';
import {
  TYPE_PAGE_TITLE, TYPE_SECTION_HEADER, TYPE_STAT_VALUE, TYPE_STAT_LABEL,
  TYPE_TABLE_HEADER, TYPE_CARD_TITLE, TYPE_WIDGET_LABEL,
} from '@/components/tdi-admin/ui/design-tokens';

const theme = PORTAL_THEMES.creators;

interface AffiliateMetrics {
  period: string;
  clicks: number;
  conversions: number;
  creatorPayoutCents: number;
  tdiRevenueCents: number;
}

interface LeaderboardCreator {
  id: string;
  name: string;
  email: string;
  slug: string;
  clicks: number;
  signups: number;
  conversions: number;
  earnedCents: number;
  lifetimeEarnedCents: number;
  lastActivity: string | null;
}

interface PayoutBatch {
  period: string;
  totalPayoutCents: number;
  totalConversions: number;
  status: string;
  generatedAt: string;
  generatedBy: string | null;
  payoutIds: string[];
  creators: Array<{ name: string; email: string; payoutCents: number; conversions: number }>;
}

interface CreatorDrillDown {
  clicks: Array<{ id: string; clicked_at: string; referrer_url: string | null; landing_page: string | null }>;
  signups: Array<{ id: string; signed_up_at: string; user_email: string | null }>;
  conversions: Array<{ id: string; converted_at: string; user_email: string | null; gross_amount_cents: number; net_revenue_cents: number; creator_payout_cents: number; refunded: boolean; payout_id: string | null; paid_to_creator_at: string | null }>;
  payouts: Array<{ id: string; period: string; payout_amount_cents: number; status: string; paid_at: string | null; paid_method: string | null }>;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getPreviousPeriod(): string {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[month - 1]} ${year}`;
}

function getPeriodOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value: val, label: formatPeriodLabel(val) });
  }
  return options;
}

// ---------------------------------------------------------------------------
// Re-engagement tab
//
// The whole ladder in one screen. Built after an audit found the sequence had
// been emailing the wrong people for a month with no way to notice from the
// admin: the only view was a per-creator card on the detail page, so nobody
// ever saw the shape of the pipeline.
// ---------------------------------------------------------------------------

function AffiliateTab() {
  const [period, setPeriod] = useState(getCurrentPeriod());
  const [metrics, setMetrics] = useState<AffiliateMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardCreator[]>([]);
  const [batches, setBatches] = useState<PayoutBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Mark paid modal
  const [markPaidBatch, setMarkPaidBatch] = useState<PayoutBatch | null>(null);
  const [paidMethod, setPaidMethod] = useState('');
  const [paidReference, setPaidReference] = useState('');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Creator drill-down
  const [drillDownCreator, setDrillDownCreator] = useState<LeaderboardCreator | null>(null);
  const [drillDownData, setDrillDownData] = useState<CreatorDrillDown | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  // Link copied toast
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, leaderboardRes, batchesRes] = await Promise.all([
        fetch(`/api/admin/affiliate/metrics?period=${period}`).then(r => r.json()),
        fetch(`/api/admin/affiliate/leaderboard?period=${period}`).then(r => r.json()),
        fetch('/api/admin/affiliate/payouts').then(r => r.json()),
      ]);
      setMetrics(metricsRes);
      setLeaderboard(leaderboardRes.creators || []);
      setBatches(batchesRes.batches || []);
    } catch (err) {
      console.error('Failed to load affiliate data:', err);
    }
    setLoading(false);
  }, [period]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = async () => {
    const generatePeriod = getPreviousPeriod();
    if (!confirm(`Generate payout batch for ${formatPeriodLabel(generatePeriod)}?`)) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/affiliate/payouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: generatePeriod }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.payoutsCreated} payout(s) from ${data.totalConversions} conversion(s).`);
        await loadData();
      } else {
        alert(data.error || 'Failed to generate payouts');
      }
    } catch {
      alert('Error generating payouts');
    }
    setGenerating(false);
  };

  const handleMarkPaid = async () => {
    if (!markPaidBatch || !paidMethod) return;
    setMarkingPaid(true);
    try {
      const res = await fetch('/api/admin/affiliate/payouts/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutIds: markPaidBatch.payoutIds,
          paidMethod,
          paidReference,
          paidAt: new Date(paidDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMarkPaidBatch(null);
        setPaidMethod('');
        setPaidReference('');
        await loadData();
      } else {
        alert(data.error || 'Failed to mark as paid');
      }
    } catch {
      alert('Error marking paid');
    }
    setMarkingPaid(false);
  };

  const openDrillDown = async (creator: LeaderboardCreator) => {
    setDrillDownCreator(creator);
    setDrillDownLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliate/creator?id=${creator.id}`);
      const data = await res.json();
      setDrillDownData(data);
    } catch {
      setDrillDownData(null);
    }
    setDrillDownLoading(false);
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://teachersdeserveit.com/r/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const periodOptions = getPeriodOptions();

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-slate-300 focus:border-transparent"
        >
          {periodOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>

      {/* Section 1: Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Clicks', value: metrics?.clicks || 0, format: (v: number) => v.toLocaleString() },
          { label: 'Conversions', value: metrics?.conversions || 0, format: (v: number) => v.toLocaleString() },
          { label: 'Creator Payouts', value: metrics?.creatorPayoutCents || 0, format: formatCents },
          { label: 'TDI Revenue', value: metrics?.tdiRevenueCents || 0, format: formatCents },
        ].map(card => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 border border-gray-100"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div className="mb-2" style={TYPE_WIDGET_LABEL}>{card.label}</div>
            <div style={{ ...TYPE_STAT_VALUE, color: '#111827' }}>
              {card.format(card.value)}
            </div>
            <div className="text-xs text-gray-400 mt-1">{formatPeriodLabel(period)}</div>
          </div>
        ))}
      </div>

      {/* Section 2: Monthly Payouts */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h3 style={TYPE_CARD_TITLE}>
            Monthly Payouts
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={`/api/admin/affiliate/payouts/export?period=${getPreviousPeriod()}`}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              <DownloadIcon className="w-3 h-3 inline mr-1" />
              Export CSV
            </a>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50 flex items-center gap-1"
              style={{ backgroundColor: theme.accent }}
            >
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              Generate {formatPeriodLabel(getPreviousPeriod())}
            </button>
          </div>
        </div>

        {batches.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No payout batches generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Period</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Payout</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Conv.</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Generated</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{formatPeriodLabel(batch.period)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold" style={{ color: '#2B3A67' }}>
                      {formatCents(batch.totalPayoutCents)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{batch.totalConversions}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        batch.status === 'paid'
                          ? 'bg-green-50 text-yellow-700'
                          : 'bg-amber-50 text-gray-700'
                      }`}>
                        {batch.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-xs">
                      {new Date(batch.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/admin/affiliate/payouts/export?period=${batch.period}`}
                          className="text-xs text-gray-500 hover:text-gray-900"
                        >
                          CSV
                        </a>
                        {batch.status === 'pending' && (
                          <button
                            onClick={() => {
                              setMarkPaidBatch(batch);
                              setPaidMethod('');
                              setPaidReference('');
                              setPaidDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="text-xs font-medium px-2 py-1 rounded bg-green-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Creator Leaderboard */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Creator Leaderboard
        </h3>

        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No creators with affiliate slugs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Creator</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Slug</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Clicks</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Signups</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Conv.</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Earned</th>
                  <th className="text-right py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Lifetime</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openDrillDown(c)}
                        className="font-medium hover:underline text-left"
                        style={{ color: '#2B3A67' }}
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <code className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">{c.slug}</code>
                        <button
                          onClick={() => handleCopyLink(c.slug)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy affiliate link"
                        >
                          {copiedSlug === c.slug ? <Check className="w-3 h-3 text-yellow-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{c.clicks}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600 hidden md:table-cell">{c.signups}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">{c.conversions}</td>
                    <td className="py-2.5 px-3 text-right font-semibold" style={{ color: c.earnedCents > 0 ? '#059669' : '#9CA3AF' }}>
                      {c.earnedCents > 0 ? formatCents(c.earnedCents) : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 hidden lg:table-cell">
                      {c.lifetimeEarnedCents > 0 ? formatCents(c.lifetimeEarnedCents) : '--'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-xs hidden lg:table-cell">
                      {c.lastActivity
                        ? new Date(c.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      {markPaidBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 style={TYPE_CARD_TITLE}>Mark Batch as Paid</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatPeriodLabel(markPaidBatch.period)} &middot; {formatCents(markPaidBatch.totalPayoutCents)} to {markPaidBatch.creators.length} creator(s)
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
                <select
                  value={paidMethod}
                  onChange={e => setPaidMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                >
                  <option value="">Select method...</option>
                  <option value="check">Check</option>
                  <option value="ach">ACH</option>
                  <option value="paypal">PayPal</option>
                  <option value="venmo">Venmo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference number (optional)</label>
                <input
                  type="text"
                  value={paidReference}
                  onChange={e => setPaidReference(e.target.value)}
                  placeholder="e.g. check #1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid date</label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={e => setPaidDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setMarkPaidBatch(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                disabled={!paidMethod || markingPaid}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#059669' }}
              >
                {markingPaid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Drill-Down Modal */}
      {drillDownCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 style={TYPE_CARD_TITLE}>{drillDownCreator.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  <code className="bg-gray-50 px-1.5 py-0.5 rounded text-xs">{drillDownCreator.slug}</code>
                  <span className="mx-2">&middot;</span>
                  {drillDownCreator.email}
                </p>
              </div>
              <button onClick={() => { setDrillDownCreator(null); setDrillDownData(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drillDownLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : drillDownData ? (
                <>
                  {/* Click history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5" /> Recent Clicks ({drillDownData.clicks.length})
                    </h4>
                    {drillDownData.clicks.length === 0 ? (
                      <p className="text-xs text-gray-400">No clicks recorded.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <tbody>
                            {drillDownData.clicks.slice(0, 20).map(c => (
                              <tr key={c.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 text-gray-500">
                                  {new Date(c.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                </td>
                                <td className="py-1.5 px-3 text-gray-400 truncate max-w-[200px]">{c.referrer_url || '--'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Signup history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Signups ({drillDownData.signups.length})
                    </h4>
                    {drillDownData.signups.length === 0 ? (
                      <p className="text-xs text-gray-400">No signups recorded.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <tbody>
                            {drillDownData.signups.map(s => (
                              <tr key={s.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 text-gray-500">
                                  {new Date(s.signed_up_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="py-1.5 px-3 text-gray-600">{s.user_email || '--'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Conversion history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Conversions ({drillDownData.conversions.length})
                    </h4>
                    {drillDownData.conversions.length === 0 ? (
                      <p className="text-xs text-gray-400">No conversions recorded.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="py-1.5 px-3 text-left font-medium text-gray-500">Date</th>
                              <th className="py-1.5 px-3 text-right font-medium text-gray-500">Gross</th>
                              <th className="py-1.5 px-3 text-right font-medium text-gray-500">Payout</th>
                              <th className="py-1.5 px-3 text-left font-medium text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drillDownData.conversions.map(c => (
                              <tr key={c.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 text-gray-500">
                                  {new Date(c.converted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="py-1.5 px-3 text-right text-gray-600">{formatCents(c.gross_amount_cents)}</td>
                                <td className="py-1.5 px-3 text-right font-medium text-yellow-700">{formatCents(c.creator_payout_cents)}</td>
                                <td className="py-1.5 px-3">
                                  {c.refunded ? (
                                    <span className="text-gray-700">Refunded</span>
                                  ) : c.paid_to_creator_at ? (
                                    <span className="text-yellow-600">Paid</span>
                                  ) : c.payout_id ? (
                                    <span className="text-gray-700">Batched</span>
                                  ) : (
                                    <span className="text-gray-400">Pending</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Payout history */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Payout History ({drillDownData.payouts.length})
                    </h4>
                    {drillDownData.payouts.length === 0 ? (
                      <p className="text-xs text-gray-400">No payouts yet.</p>
                    ) : (
                      <div className="border border-gray-100 rounded-lg">
                        <table className="w-full text-xs">
                          <tbody>
                            {drillDownData.payouts.map(p => (
                              <tr key={p.id} className="border-b border-gray-50">
                                <td className="py-1.5 px-3 font-medium text-gray-700">{formatPeriodLabel(p.period)}</td>
                                <td className="py-1.5 px-3 text-right font-semibold text-yellow-700">{formatCents(p.payout_amount_cents)}</td>
                                <td className="py-1.5 px-3">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    p.status === 'paid' ? 'bg-green-50 text-yellow-700' : 'bg-amber-50 text-gray-700'
                                  }`}>
                                    {p.status === 'paid' ? 'Paid' : 'Pending'}
                                  </span>
                                </td>
                                <td className="py-1.5 px-3 text-gray-400">
                                  {p.paid_at ? `Paid ${new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                                  {p.paid_method ? ` via ${p.paid_method}` : ''}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Failed to load creator details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AffiliatePage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <Link
        href="/tdi-admin/creators"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Creator Studio
      </Link>
      <h1 style={TYPE_PAGE_TITLE} className="mb-4">Affiliate</h1>
      <AffiliateTab />
    </div>
  );
}
