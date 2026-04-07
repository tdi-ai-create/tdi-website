"use client";

interface PhaseStats {
  phase: string;
  month: string;
  target: number;
  actual: number;
  description: string;
  keyActions: string[];
  behindPaceCount: number;
  total: number;
}

const PHASES: PhaseStats[] = [
  {
    phase: "Phase 1 — Ignite",
    month: "April 2026",
    target: 80,
    actual: 67,
    description: "Enrollment, orientation, and first module completion",
    keyActions: [
      "All educators onboarded and logged in by Apr 7",
      "Orientation module complete",
      "First Ignite module started",
    ],
    behindPaceCount: 8,
    total: 24,
  },
  {
    phase: "Phase 2 — Accelerate",
    month: "May 2026",
    target: 75,
    actual: 18,
    description: "Core module completions and mid-pilot check-in survey",
    keyActions: [
      "Core Accelerate modules complete",
      "Mid-pilot survey collected by May 12",
      "Completion target: 75%+ by May 26",
    ],
    behindPaceCount: 20,
    total: 24,
  },
  {
    phase: "Phase 3 — Sustain",
    month: "June 2026",
    target: 70,
    actual: 0,
    description: "Final module, capstone survey, and outcome reporting",
    keyActions: [
      "Final survey deployed Jun 9",
      "Outcome report ready Jun 23",
      "Pilot close and full report Jun 30",
    ],
    behindPaceCount: 24,
    total: 24,
  },
];

function PhaseCard({ phase }: { phase: PhaseStats }) {
  const pct = phase.actual;
  const onTrack = pct >= phase.target * 0.8;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{phase.phase}</h3>
          <div className="text-xs text-gray-500">{phase.month}</div>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            pct === 0
              ? "bg-gray-100 text-gray-400"
              : onTrack
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {pct === 0 ? "Not started" : onTrack ? "On track" : "Behind pace"}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{phase.description}</p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1.5">
          <span>Completion</span>
          <span className="font-medium">
            {phase.actual}% / {phase.target}% target
          </span>
        </div>
        <div className="relative w-full bg-gray-100 rounded-full h-3">
          {/* Target marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400 rounded"
            style={{ left: `${phase.target}%` }}
          />
          {/* Actual progress */}
          <div
            className={`h-3 rounded-full transition-all ${
              pct === 0
                ? ""
                : onTrack
                ? "bg-green-500"
                : "bg-yellow-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          ▲ target at {phase.target}%
        </div>
      </div>

      {/* Behind pace count */}
      {phase.behindPaceCount > 0 && phase.actual > 0 && (
        <div className="text-sm text-yellow-700 bg-yellow-50 rounded px-3 py-2 mb-4">
          {phase.behindPaceCount} of {phase.total} educators behind pace in
          this phase
        </div>
      )}

      {/* Key actions */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
          Key actions
        </div>
        <ul className="space-y-1">
          {phase.keyActions.map((action) => (
            <li key={action} className="flex gap-2 text-sm text-gray-600">
              <span className="text-gray-300 mt-0.5">—</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function BlueprintPhaseTracker() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Blueprint Phase Tracker
        </h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
          Seed data
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PHASES.map((phase) => (
          <PhaseCard key={phase.phase} phase={phase} />
        ))}
      </div>
    </div>
  );
}

