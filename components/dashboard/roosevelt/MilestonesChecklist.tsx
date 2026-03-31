"use client";

interface Milestone {
  date: string;
  label: string;
  description: string;
  status: "done" | "upcoming" | "overdue";
}

const MILESTONES: Milestone[] = [
  {
    date: "2026-04-07",
    label: "All educators onboarded",
    description: "All Roosevelt educators logged in for the first time",
    status: "upcoming",
  },
  {
    date: "2026-04-21",
    label: "Ignite completion target",
    description: "80%+ of cohort completes Ignite module",
    status: "upcoming",
  },
  {
    date: "2026-05-12",
    label: "Mid-pilot survey",
    description: "Mid-pilot survey sent and collected from all educators",
    status: "upcoming",
  },
  {
    date: "2026-05-26",
    label: "Accelerate completion target",
    description: "75%+ of cohort completes Accelerate module",
    status: "upcoming",
  },
  {
    date: "2026-06-09",
    label: "Final survey deployment",
    description: "End-of-pilot survey sent to all educators",
    status: "upcoming",
  },
  {
    date: "2026-06-23",
    label: "Outcome report ready",
    description: "Summary report prepared for Roosevelt admin",
    status: "upcoming",
  },
  {
    date: "2026-06-30",
    label: "Pilot close",
    description: "Full outcome report delivered to TDI leadership and Roosevelt admin",
    status: "upcoming",
  },
];

function resolveStatus(dateStr: string): Milestone["status"] {
  const now = new Date();
  const d = new Date(dateStr);
  if (d < now) return "overdue";
  return "upcoming";
}

export default function MilestonesChecklist() {
  const milestones = MILESTONES.map((m) => ({
    ...m,
    status: resolveStatus(m.date),
  }));

  const today = new Date();
  const pilotEnd = new Date("2026-06-30");
  const pilotStart = new Date("2026-04-01");
  const totalDays =
    (pilotEnd.getTime() - pilotStart.getTime()) / 86400000;
  const elapsed = Math.max(
    0,
    (today.getTime() - pilotStart.getTime()) / 86400000
  );
  const progressPct = Math.min(100, (elapsed / totalDays) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Pilot Milestones
        </h2>
        <span className="text-sm text-gray-500">
          April 1 – June 30, 2026
        </span>
      </div>

      {/* Timeline progress bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Pilot start (Apr 1)</span>
          <span className="font-medium">{Math.round(progressPct)}% through pilot</span>
          <span>Pilot end (Jun 30)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-3">
        {milestones.map((m, i) => {
          const isPast = m.status === "done" || m.status === "overdue";
          return (
            <div
              key={i}
              className={`flex gap-4 bg-white border rounded-lg p-4 ${
                m.status === "overdue"
                  ? "border-red-200 bg-red-50/30"
                  : m.status === "done"
                  ? "border-green-200 bg-green-50/30"
                  : "border-gray-200"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {m.status === "done" ? (
                  <span className="text-green-500 text-lg">✓</span>
                ) : m.status === "overdue" ? (
                  <span className="text-red-500 text-lg">!</span>
                ) : (
                  <span className="text-gray-300 text-lg">○</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-gray-900">{m.label}</div>
                  <div
                    className={`text-xs flex-shrink-0 ${
                      m.status === "overdue" ? "text-red-500 font-medium" : "text-gray-400"
                    }`}
                  >
                    {new Date(m.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-0.5">{m.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

