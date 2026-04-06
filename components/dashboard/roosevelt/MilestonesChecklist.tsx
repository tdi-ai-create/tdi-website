"use client";

import { useEffect, useState } from "react";

interface TimelineEvent {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "upcoming";
  eventType: "milestone" | "observation" | "virtual_session";
  sortOrder: number;
}

function EventIcon({ eventType }: { eventType: TimelineEvent["eventType"] }) {
  const classes = "w-5 h-5";
  if (eventType === "observation") return <span className={classes} title="Observation Day">👁</span>;
  if (eventType === "virtual_session") return <span className={classes} title="Virtual Session">💻</span>;
  return <span className={classes} title="Milestone">🎯</span>;
}

function StatusBadge({ status }: { status: TimelineEvent["status"] }) {
  const map = {
    completed: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    upcoming: "bg-gray-100 text-gray-500",
  };
  const labels = {
    completed: "Done",
    in_progress: "In Progress",
    upcoming: "Upcoming",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function MilestonesChecklist() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/roosevelt/timeline")
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[MilestonesChecklist] fetch error:", err);
        setError("Could not load timeline data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <span className="text-sm">Loading milestones…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  const completed = events.filter((e) => e.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        <span className="text-sm text-gray-600">
          <strong className="text-gray-900">{completed}</strong> of{" "}
          <strong className="text-gray-900">{events.length}</strong> milestones completed
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: events.length ? `${(completed / events.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No timeline events yet.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                event.status === "completed"
                  ? "bg-green-50 border-green-200"
                  : event.status === "in_progress"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                <EventIcon eventType={event.eventType} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  event.status === "completed" ? "text-green-800" : "text-gray-900"
                }`}>
                  {event.title}
                </p>
                <p className="text-xs text-gray-400 capitalize">{event.eventType.replace("_", " ")}</p>
              </div>
              <StatusBadge status={event.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
