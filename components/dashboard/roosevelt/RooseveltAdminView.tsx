"use client";

import { useState } from "react";

// Roosevelt admin sees a simplified, scoped view of their staff only
// No PII beyond what Roosevelt admin already has access to

interface AdminSummaryStats {
  totalStaff: number;
  activeLastWeek: number;
  atRiskCount: number;
  inactiveCount: number;
  overallCompletionPct: number;
}

interface StaffRow {
  id: string;
  name: string;
  role: string;
  status: "active" | "at_risk" | "inactive";
  modulesComplete: number;
  totalModules: number;
  lastLogin: string | null;
}

const SEED_STATS: AdminSummaryStats = {
  totalStaff: 24,
  activeLastWeek: 18,
  atRiskCount: 4,
  inactiveCount: 2,
  overallCompletionPct: 42,
};

const SEED_STAFF: StaffRow[] = [
  {
    id: "1",
    name: "Jamie Rivera",
    role: "3rd Grade Teacher",
    status: "active",
    modulesComplete: 3,
    totalModules: 9,
    lastLogin: "2026-03-30",
  },
  {
    id: "2",
    name: "Marcus Lee",
    role: "5th Grade Teacher",
    status: "active",
    modulesComplete: 6,
    totalModules: 9,
    lastLogin: "2026-03-28",
  },
  {
    id: "3",
    name: "Priya Nair",
    role: "Special Ed Teacher",
    status: "at_risk",
    modulesComplete: 1,
    totalModules: 9,
    lastLogin: "2026-03-14",
  },
  {
    id: "4",
    name: "Derek Thomas",
    role: "PE Teacher",
    status: "inactive",
    modulesComplete: 0,
    totalModules: 9,
    lastLogin: null,
  },
  {
    id: "5",
    name: "Sofia Chen",
    role: "2nd Grade Teacher",
    status: "active",
    modulesComplete: 3,
    totalModules: 9,
    lastLogin: "2026-03-29",
  },
];

function statusBadge(status: StaffRow["status"]) {
  const map = {
    active: "bg-green-100 text-green-700",
    at_risk: "bg-yellow-100 text-yellow-700",
    inactive: "bg-red-100 text-red-700",
  };
  const labels = { active: "Active", at_risk: "At Risk", inactive: "Inactive" };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function RooseveltAdminView({ schoolId }: { schoolId?: string }) {
  const [staff] = useState<StaffRow[]>(SEED_STAFF);
  const stats = SEED_STATS;

  const handleExport = () => {
    const headers = ["Name", "Role", "Modules Complete", "Last Login", "Status"];
    const rows = staff.map((s) => [
      s.name,
      s.role,
      `${s.modulesComplete}/${s.totalModules}`,
      s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : "Never",
      s.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roosevelt-staff-engagement.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Roosevelt Staff Overview
          </h2>
          <p className="text-sm text-gray-500">April – June 2026 Pilot</p>
        </div>
        <button
          onClick={handleExport}
          className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
        >
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">Total Staff</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalStaff}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">Active This Week</div>
          <div className="text-2xl font-bold text-green-700">{stats.activeLastWeek}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">At Risk</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.atRiskCount}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-500 mb-1">Overall Progress</div>
          <div className="text-2xl font-bold text-gray-900">{stats.overallCompletionPct}%</div>
        </div>
      </div>

      {/* Staff table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Staff Member</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Modules</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Last Active</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.role}</td>
                <td className="px-4 py-3 text-gray-600">
                  {s.modulesComplete}/{s.totalModules}
                  <div className="w-16 bg-gray-100 rounded-full h-1 mt-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{
                        width: `${(s.modulesComplete / s.totalModules) * 100}%`,
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {s.lastLogin
                    ? new Date(s.lastLogin).toLocaleDateString()
                    : <span className="text-gray-400 italic">Never</span>}
                </td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        This view shows Roosevelt staff only. Contact TDI for full pilot reporting.
      </p>
    </div>
  );
}

