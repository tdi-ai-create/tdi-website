"use client";

import { useState } from "react";
import PilotScorecard from "./PilotScorecard";
import EducatorEngagementTable from "./EducatorEngagementTable";
import BlueprintPhaseTracker from "./BlueprintPhaseTracker";
import RooseveltAdminView from "./RooseveltAdminView";
import MilestonesChecklist from "./MilestonesChecklist";

type View = "scorecard" | "educators" | "blueprint" | "admin" | "milestones";

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: "scorecard", label: "Pilot Scorecard" },
  { id: "educators", label: "Educator Engagement" },
  { id: "blueprint", label: "Blueprint Phases" },
  { id: "admin", label: "Admin View" },
  { id: "milestones", label: "Milestones" },
];

interface RooseveltDashboardProps {
  // "tdi" | "admin" controls which views are shown
  role: "tdi" | "admin";
  schoolId?: string;
}

export default function RooseveltDashboard({
  role = "tdi",
  schoolId,
}: RooseveltDashboardProps) {
  const [activeView, setActiveView] = useState<View>("scorecard");

  // Admin users only see a subset of views
  const visibleNavItems =
    role === "admin"
      ? NAV_ITEMS.filter((n) => n.id === "admin" || n.id === "milestones")
      : NAV_ITEMS;

  // Force admin view when role is admin
  const resolvedView: View = role === "admin" ? "admin" : activeView;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Roosevelt Pilot Dashboard
            </h1>
            <p className="text-sm text-gray-500">April – June 2026</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="font-medium text-gray-700">
              {role === "tdi" ? "TDI Team" : "Roosevelt Admin"}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {role === "tdi" && (
        <nav className="bg-white border-b border-gray-200 px-6">
          <div className="max-w-7xl mx-auto flex gap-0">
            {visibleNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeView === item.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {resolvedView === "scorecard" && <PilotScorecard />}
        {resolvedView === "educators" && (
          <EducatorEngagementTable schoolId={schoolId} />
        )}
        {resolvedView === "blueprint" && <BlueprintPhaseTracker />}
        {resolvedView === "admin" && (
          <RooseveltAdminView schoolId={schoolId} />
        )}
        {resolvedView === "milestones" && <MilestonesChecklist />}
      </main>
    </div>
  );
}

