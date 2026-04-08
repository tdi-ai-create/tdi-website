"use client";

import { useEffect, useState } from "react";

interface ScorecardData {
  totalEnrolled: number;
  activeLastWeek: number;
  activeLastMonth: number;
  blueprintCompletionRate: number;
  igniteCompletionRate: number;
  accelerateCompletionRate: number;
  avgNpsScore: number | null;
  daysRemaining: number;
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "yellow" | "red" | "blue";
}) {
  const colors = {
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };
  const base = "rounded-lg border p-5";
  const cls = accent ? `${base} ${colors[accent]}` : `${base} bg-white border-gray-200`;

  return (
    <div className={cls}>
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color = "bg-blue-500" }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5">
      <div
        className={`${color} h-2.5 rounded-full transition-all`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// Seed data — replace with API call once data sources are confirmed
const SEED: ScorecardData = {
  totalEnrolled: 24,
  activeLastWeek: 18,
  activeLastMonth: 22,
  blueprintCompletionRate: 42,
  igniteCompletionRate: 67,
  accelerateCompletionRate: 18,
  avgNpsScore: null, // survey tool not yet connected
  daysRemaining: Math.ceil(
    (new Date("2026-06-30").getTime() - Date.now()) / 86400000
  ),
};

export default function PilotScorecard() {
  const [data, setData] = useState<ScorecardData>(SEED);
  const [loading, setLoading] = useState(false);

  // TODO: replace with real fetch once API endpoint is available
  // useEffect(() => {
  //   fetch("/api/dashboard/roosevelt/scorecard")
  //     .then(r => r.json())
  //     .then(setData)
  //     .finally(() => setLoading(false));
  // }, []);

  if (loading) return <div className="animate-pulse text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Pilot Overview</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Seed data — live data pending
        </span>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Educators Enrolled"
          value={data.totalEnrolled}
          sub="Roosevelt cohort"
        />
        <StatCard
          label="Active (last 7 days)"
          value={data.activeLastWeek}
          sub={`${Math.round((data.activeLastWeek / data.totalEnrolled) * 100)}% of cohort`}
          accent={data.activeLastWeek / data.totalEnrolled >= 0.7 ? "green" : "yellow"}
        />
        <StatCard
          label="Active (last 30 days)"
          value={data.activeLastMonth}
          sub={`${Math.round((data.activeLastMonth / data.totalEnrolled) * 100)}% of cohort`}
        />
        <StatCard
          label="Days Remaining"
          value={data.daysRemaining}
          sub="Until June 30 close"
          accent={data.daysRemaining < 14 ? "red" : "blue"}
        />
      </div>

      {/* Blueprint completion */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Blueprint Completion</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Phase 1 — Ignite</span>
              <span className="font-medium">{data.igniteCompletionRate}%</span>
            </div>
            <ProgressBar
              pct={data.igniteCompletionRate}
              color={data.igniteCompletionRate >= 80 ? "bg-green-500" : "bg-blue-500"}
            />
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Phase 2 — Accelerate</span>
              <span className="font-medium">{data.accelerateCompletionRate}%</span>
            </div>
            <ProgressBar pct={data.accelerateCompletionRate} />
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Blueprint Rate</span>
              <span className="font-medium">{data.blueprintCompletionRate}%</span>
            </div>
            <ProgressBar pct={data.blueprintCompletionRate} color="bg-purple-500" />
          </div>
        </div>
      </div>

      {/* NPS */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="font-semibold text-gray-800 mb-2">
          Satisfaction / NPS
        </h3>
        {data.avgNpsScore !== null ? (
          <div className="text-3xl font-bold text-green-600">
            {data.avgNpsScore}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Survey tool not yet connected. Once Rae/Marcus confirms the tool and
            API key, this will populate automatically.
          </div>
        )}
      </div>
    </div>
  );
}

