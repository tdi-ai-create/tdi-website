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

interface Row {
  id: string;
  orgName: string;
  slug: string | null;
  phase: string | null;
  seatsContracted: number;
  seatsProvisioned: number;
  activeEducators: number;
  steps: Step[];
  completed: number;
  applicable: number;
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
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="h-0.5 w-full" style={{ background: '#2563EB' }} />
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
              {stepLabels.map((label, i) => (
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
                {row.steps.map((step) => {
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
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500">
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
      </div>
    </div>
  );
}
