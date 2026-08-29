'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Minus, X, CircleDot, Loader2, AlertCircle } from 'lucide-react';
import { TYPE_TABLE_HEADER } from '@/components/tdi-admin/ui/design-tokens';

/**
 * Where every active partnership stands, on one screen.
 *
 * This replaces the Onboarding Pipeline tab, the Onboarding Checklist and the
 * Activation Readiness Score. All three answered the same question differently
 * and none of the three could answer it correctly.
 *
 * Fed by api/tdi-admin/leadership/onboarding-matrix, which is the one
 * definition. If this and the partner's own dashboard ever disagree, that route
 * is the thing to fix, not this component.
 */

interface Step {
  key: string;
  label: string;
  state: 'done' | 'partial' | 'gap' | 'na';
  evidence: string;
}

interface Engagement {
  quickWinsViewed: number;
  lessonsViewed: number;
  coursesCompleted: number;
  checkIns: number;
  questionsAsked: number;
  recognitions: number;
}

interface Row {
  id: string;
  orgName: string;
  slug: string | null;
  phase: string | null;
  seatsContracted: number;
  seatsProvisioned: number;
  activeEducators: number;
  engagement: Engagement;
  steps: Step[];
  completed: number;
  applicable: number;
}

interface EngagementColumn {
  key: string;
  label: string;
}

interface Unattributed {
  domain: string;
  seats: number;
  signedIn: number;
}

type View = 'onboarding' | 'engagement';

/**
 * Seats and Signed in live on the row itself, everything else on row.engagement.
 * Reading both through one function keeps the column order the route publishes.
 */
function engagementValue(row: Row, key: string): number {
  if (key === 'seatsProvisioned') return row.seatsProvisioned;
  if (key === 'activeEducators') return row.activeEducators;
  return (row.engagement?.[key as keyof Engagement] as number) ?? 0;
}

const MARK: Record<Step['state'], { bg: string; fg: string; Icon: typeof Check }> = {
  done: { bg: '#E3F3EB', fg: '#0F7B52', Icon: Check },
  partial: { bg: '#FCF2DC', fg: '#9A6608', Icon: CircleDot },
  gap: { bg: '#FAE9E6', fg: '#B03325', Icon: X },
  na: { bg: '#F1F3F8', fg: '#9AA3B5', Icon: Minus },
};

export default function OnboardingMatrix({ userEmail }: { userEmail: string | null }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [stepLabels, setStepLabels] = useState<string[]>([]);
  const [engagementLabels, setEngagementLabels] = useState<EngagementColumn[]>([]);
  const [unattributed, setUnattributed] = useState<Unattributed[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Onboarding answers where a school is stuck. Engagement answers whether
  // anyone is using what they were given. Same nine rows either way, which is
  // why this is a toggle and not a second screen.
  const [view, setView] = useState<View>('onboarding');

  useEffect(() => {
    if (!userEmail) return;
    let cancelled = false;

    fetch('/api/tdi-admin/leadership/onboarding-matrix', {
      headers: { 'x-user-email': userEmail },
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error || `Request failed with ${res.status}`);
        return body;
      })
      .then((body) => {
        if (cancelled) return;
        setRows(body.partnerships ?? []);
        setStepLabels(body.stepLabels ?? []);
        setEngagementLabels(body.engagementLabels ?? []);
        setUnattributed(body.unattributed ?? []);
      })
      .catch((err) => {
        // Say what went wrong rather than rendering an empty grid, which is
        // indistinguishable from every partnership being behind.
        if (!cancelled) setError(err.message || 'Could not load onboarding status');
      });

    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Onboarding status is unavailable</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 flex items-center justify-center gap-3 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading onboarding status</span>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-sm text-gray-400">
        No active partnerships.
      </div>
    );
  }

  const orphanSeats = unattributed.reduce((n, u) => n + u.seats, 0);
  const orphanSignedIn = unattributed.reduce((n, u) => n + u.signedIn, 0);

  return (
    <>
      {orphanSeats > 0 && (
        // These educators hold live all-access seats and appear on no row of
        // the table below, because the partnership they belong to was deleted
        // or was never linked. Shown above the matrix rather than inside it:
        // the point is that the matrix cannot see them.
        <div
          className="bg-white rounded-xl border overflow-hidden mb-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderColor: '#FCA5A5' }}
        >
          <div className="h-0.5 w-full" style={{ background: '#DC2626' }} />
          <div className="px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#DC2626' }} />
              <div className="min-w-0">
                <p className="text-[13px] font-bold" style={{ color: '#2B3A67' }}>
                  {orphanSeats} paid Hub {orphanSeats === 1 ? 'seat is' : 'seats are'} not attached to any
                  partnership
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {orphanSignedIn > 0
                    ? `${orphanSignedIn} of them have signed in and are using the Hub. None of this appears anywhere below.`
                    : 'None of this appears anywhere below.'}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
                  {unattributed.map((u) => (
                    <span key={u.domain} className="text-[12px]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      <span className="font-mono text-[11px] text-gray-500">{u.domain}</span>
                      <span className="font-bold" style={{ color: '#2B3A67' }}>
                        {' '}
                        {u.seats}
                      </span>
                      <span className="text-gray-400"> {u.seats === 1 ? 'seat' : 'seats'}</span>
                      {u.signedIn > 0 && <span className="text-gray-400">, {u.signedIn} signed in</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="h-0.5 w-full" style={{ background: '#2563EB' }} />

      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
        <p className="text-[12px] text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {view === 'onboarding'
            ? 'Where each partnership is stuck.'
            : 'What their educators have actually done in the Hub.'}
        </p>
        <div className="inline-flex bg-gray-100 rounded-lg p-0.5 shrink-0">
          {(
            [
              ['onboarding', 'Onboarding'],
              ['engagement', 'Engagement'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              aria-pressed={view === id}
              className="px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors"
              style={{
                background: view === id ? '#FFFFFF' : 'transparent',
                color: view === id ? '#1e2749' : '#6B7280',
                boxShadow: view === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: 900, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                className="text-left px-5 py-3 border-b border-gray-200 sticky left-0 bg-white"
                style={{ ...TYPE_TABLE_HEADER, minWidth: 220 }}
              >
                Partnership
              </th>
              {view === 'onboarding'
                ? stepLabels.map((label, i) => (
                    <th
                      key={label}
                      className="px-2 py-3 border-b border-gray-200 align-bottom"
                      style={{ ...TYPE_TABLE_HEADER, textAlign: 'center', lineHeight: 1.35 }}
                    >
                      <span className="block text-[9px] mb-1" style={{ color: '#2563EB', letterSpacing: '0.1em' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {label}
                    </th>
                  ))
                : engagementLabels.map((col) => (
                    <th
                      key={col.key}
                      className="px-2 py-3 border-b border-gray-200 align-bottom"
                      style={{ ...TYPE_TABLE_HEADER, textAlign: 'center', lineHeight: 1.35 }}
                    >
                      {col.label}
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 border-b border-gray-100 sticky left-0 bg-white group-hover:bg-gray-50 transition-colors">
                  <Link href={`/tdi-admin/leadership/${row.id}`} className="block">
                    <span className="block text-[13px] font-bold text-[#2B3A67] group-hover:text-[#2563EB] transition-colors">
                      {row.orgName}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                      {row.phase ?? 'no phase'} / {row.seatsProvisioned} of {row.seatsContracted} seats
                    </span>
                  </Link>
                </td>
                {view === 'onboarding'
                  ? row.steps.map((step) => {
                      const { bg, fg, Icon } = MARK[step.state];
                      return (
                        <td key={step.key} className="px-2 py-3 border-b border-gray-100 text-center">
                          <span
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                            style={{ background: bg, color: fg }}
                            title={`${step.label}: ${step.evidence}`}
                          >
                            <Icon className="w-3.5 h-3.5" strokeWidth={3} />
                          </span>
                        </td>
                      );
                    })
                  : engagementLabels.map((col) => {
                      const value = engagementValue(row, col.key);
                      return (
                        <td
                          key={col.key}
                          className="px-2 py-3 border-b border-gray-100 text-center text-[12px]"
                          style={{
                            fontVariantNumeric: 'tabular-nums',
                            color: value === 0 ? '#C4C9D4' : '#2B3A67',
                            fontWeight: value === 0 ? 400 : 600,
                          }}
                        >
                          {value}
                        </td>
                      );
                    })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
        {view === 'onboarding' ? (
          <>
            {(
              [
                ['done', 'Complete'],
                ['partial', 'Partial'],
                ['gap', 'Not started'],
                ['na', 'Not in this contract'],
              ] as const
            ).map(([state, label]) => (
              <span key={state} className="inline-flex items-center gap-2">
                <i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: MARK[state].fg }} />
                {label}
              </span>
            ))}
            <span className="text-gray-400">Hover a mark for the evidence. Click a school to open it.</span>
          </>
        ) : (
          <span className="text-gray-400">
            Counted over the seats that belong to each partnership, excluding anything TDI wrote on their
            behalf. Click a school for the person by person view.
          </span>
        )}
      </div>
    </div>
    </>
  );
}
