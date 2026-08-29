'use client';

/**
 * Creator re-engagement pipeline.
 *
 * Who has gone quiet, which sequence they are in, and what was sent last.
 *
 * Lifted out of app/tdi-admin/creators/page.tsx unchanged. It was already a
 * standalone function taking no props, so this is a relocation and not a
 * rewrite.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { TYPE_PAGE_TITLE, TYPE_SECTION_HEADER, TYPE_STAT_VALUE, TYPE_STAT_LABEL } from '@/components/tdi-admin/ui/design-tokens';

const theme = PORTAL_THEMES.creators;

interface PipelineCreator {
  id: string;
  name: string | null;
  email: string | null;
  startedAt?: string;
  lastEmailAt?: string;
  nextEmailDue?: string;
  daysSinceActivity: number | null;
  why: string | null;
}

interface ReengagementPipelineData {
  config: {
    sendsEnabled: boolean;
    stallThresholdDays: number;
    agreementGraceDays: number;
    stepIntervalDays: number;
    finalStep: number;
  };
  ladder: { step: number; label: string; creators: PipelineCreator[] }[];
  unsignedWorking: { id: string; name: string | null; reason: string }[];
  closingSoon: { id: string; name: string | null; reason: string }[];
  wouldEnrol: { id: string; name: string | null; email: string | null; daysSinceActivity: number; why: string }[];
  wouldAdvance: { id: string; name: string | null; currentStep: number; nextStep: number; wouldPause: boolean }[];
  recentSends: {
    creator_id: string | null;
    creator_name: string | null;
    subject: string;
    step: number | null;
    sent_at: string;
    dry_run: boolean;
  }[];
  paused: { id: string; name: string | null; pausedAt: string | null; pausedBy: string | null; daysPaused: number | null }[];
  totals: {
    inSequence: number;
    wouldEnrol: number;
    wouldAdvance: number;
    facingPause: number;
    paused: number;
    unsignedWorking: number;
    closingSoon: number;
  };
}

function shortDate(iso: string | null | undefined): string {
  if (!iso) return '--';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ReengagementTab() {
  const [data, setData] = useState<ReengagementPipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/reengagement/pipeline')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json);
        else setError(json.error || 'Could not load the pipeline');
      })
      .catch(() => setError('Could not load the pipeline'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500">{error || 'No pipeline data'}</p>
      </div>
    );
  }

  const { config, ladder, wouldEnrol, wouldAdvance, recentSends, paused, totals, unsignedWorking, closingSoon } = data;

  return (
    <div className="space-y-6">
      {/* Sends paused banner. Without this the freeze becomes its own mystery. */}
      {!config.sendsEnabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-semibold text-amber-900">Re-engagement email is paused</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              The daily scan is still running and everything below is live, but no email is
              reaching creators and no sequence is advancing. Nobody is being auto-paused.
              Use the queue below to check the system is picking the right people, then turn
              sends back on in <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">lib/reengagement-config.ts</code>.
            </p>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'In a sequence', value: totals.inSequence, alarm: false },
          { label: 'Would start today', value: totals.wouldEnrol, alarm: false },
          { label: 'Due a next email', value: totals.wouldAdvance, alarm: false },
          { label: 'Facing pause', value: totals.facingPause, alarm: totals.facingPause > 0 },
          { label: 'Currently paused', value: totals.paused, alarm: false },
          { label: 'Need an agreement', value: totals.unsignedWorking, alarm: totals.unsignedWorking > 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className={`text-2xl font-semibold ${stat.alarm ? 'text-red-600' : 'text-slate-800'}`}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* The ladder */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Where everyone sits</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            One step every {config.stepIntervalDays} days. Step {config.finalStep} sends the pause
            notice and pauses the account.
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {ladder.map((rung) => (
            <div key={rung.step} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="sm:w-44 flex-shrink-0 flex items-center gap-2">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                    rung.step >= config.finalStep
                      ? 'bg-red-50 text-red-700'
                      : rung.step >= config.finalStep - 1
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Step {rung.step}
                </span>
                <span className="text-sm text-gray-600">{rung.label}</span>
              </div>
              <div className="flex-1 min-w-0">
                {rung.creators.length === 0 ? (
                  <p className="text-sm text-gray-300">Nobody</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {rung.creators.map((c) => (
                      <Link
                        key={c.id}
                        href={`/tdi-admin/creators/${c.id}`}
                        className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1 transition-colors"
                        title={c.why || undefined}
                      >
                        {c.name}
                        {c.nextEmailDue && (
                          <span className="text-gray-400 ml-1.5">next {shortDate(c.nextEmailDue)}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What the next run would do */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800">Would start a sequence</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              No milestone and no sign-in for {config.stallThresholdDays}+ days.
            </p>
          </div>
          {wouldEnrol.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">Nobody new.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {wouldEnrol.map((c) => (
                <Link
                  key={c.id}
                  href={`/tdi-admin/creators/${c.id}`}
                  className="px-5 py-3 flex items-baseline justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.why}</p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 tabular-nums">
                    {c.daysSinceActivity}d
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-slate-800">Due their next email</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Already in a sequence, {config.stepIntervalDays}+ days since the last one.
            </p>
          </div>
          {wouldAdvance.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">Nobody is due.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {wouldAdvance.map((c) => (
                <Link
                  key={c.id}
                  href={`/tdi-admin/creators/${c.id}`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${
                      c.wouldPause ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c.wouldPause ? 'Would pause' : `Step ${c.currentStep} to ${c.nextStep}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The only thing on this page that asks Bella to act */}
      {unsignedWorking.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/60">
            <h3 className="font-semibold text-slate-800">Working without an agreement</h3>
            <p className="text-xs text-amber-800 mt-0.5">
              Building content for us with nothing signed. They are never closed automatically.
              Get an agreement in front of them.
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {unsignedWorking.map((c) => (
              <Link
                key={c.id}
                href={`/tdi-admin/creators/${c.id}`}
                className="px-5 py-3 flex items-baseline justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                <span className="text-xs text-gray-400 truncate flex-shrink-0">{c.reason}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Closing automatically. Shown so it is never a surprise. */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Closing on the next run</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            No agreement after {config.agreementGraceDays} days and no work behind it.
            Each gets a warm note from Bella saying they can restart any time by replying.
          </p>
        </div>
        {closingSoon.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">Nobody is closing.</p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {closingSoon.map((c) => (
              <Link
                key={c.id}
                href={`/tdi-admin/creators/${c.id}`}
                className="px-5 py-3 flex items-baseline justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                <span className="text-xs text-gray-400 truncate flex-shrink-0">{c.reason}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Paused creators, easy to forget entirely */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Paused creators</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            They hear from Bella every 90 days. Their work is saved and their affiliate link keeps earning.
          </p>
        </div>
        {paused.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">Nobody is paused.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {paused.map((c) => (
              <Link
                key={c.id}
                href={`/tdi-admin/creators/${c.id}`}
                className="px-5 py-3 flex items-baseline justify-between gap-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    paused {shortDate(c.pausedAt)} by {c.pausedBy || 'unknown'}
                  </p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 tabular-nums">
                  {c.daysPaused !== null ? `${c.daysPaused}d` : '--'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Send history */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-slate-800">Recent re-engagement email</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Newest first. Suppressed rows were worked out by the scan but never delivered.
          </p>
        </div>
        {recentSends.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">Nothing yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recentSends.map((s, i) => (
              <div key={`${s.creator_id}-${s.sent_at}-${i}`} className="px-5 py-3 flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 truncate">
                    {s.creator_name}
                    {s.step !== null && <span className="text-gray-400 ml-2">step {s.step}</span>}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{s.subject}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.dry_run && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide bg-gray-100 text-gray-500">
                      Suppressed
                    </span>
                  )}
                  <span className="text-xs text-gray-500 tabular-nums">{shortDate(s.sent_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReengagementPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <Link
        href="/tdi-admin/creators"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Creator Studio
      </Link>
      <h1 style={TYPE_PAGE_TITLE} className="mb-4">Re-engagement</h1>
      <ReengagementTab />
    </div>
  );
}
