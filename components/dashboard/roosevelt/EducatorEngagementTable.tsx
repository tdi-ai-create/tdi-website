"use client";

import { useState } from "react";

interface Educator {
  id: string;
  name: string;
  lastLogin: string | null;
  igniteComplete: boolean;
  accelerateComplete: boolean;
  sustainComplete: boolean;
  totalHours: number;
  surveyResponded: boolean;
  status: "active" | "at_risk" | "inactive";
}

function statusBadge(status: Educator["status"]) {
  const map = {
    active: "bg-green-100 text-green-700",
    at_risk: "bg-yellow-100 text-yellow-700",
    inactive: "bg-red-100 text-red-700",
  };
  const labels = {
    active: "Active",
    at_risk: "At Risk",
    inactive: "Inactive",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function moduleProgress(educator: Educator) {
  const phases = [
    { label: "Ignite", done: educator.igniteComplete },
    { label: "Accelerate", done: educator.accelerateComplete },
    { label: "Sustain", done: educator.sustainComplete },
  ];
  return (
    <div className="flex gap-1">
      {phases.map((p) => (
        <span
          key={p.label}
          title={p.label}
          className={`text-xs px-1.5 py-0.5 rounded ${
            p.done
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {p.label[0]}
        </span>
      ))}
    </div>
  );
}

// Seed data
const SEED_EDUCATORS: Educator[] = [
  {
    id: "1",
    name: "Jamie Rivera",
    lastLogin: "2026-03-30",
    igniteComplete: true,
    accelerateComplete: false,
    sustainComplete: false,
    totalHours: 8.5,
    surveyResponded: false,
    status: "active",
  },
  {
    id: "2",
    name: "Marcus Lee",
    lastLogin: "2026-03-28",
    igniteComplete: true,
    accelerateComplete: true,
    sustainComplete: false,
    totalHours: 14.2,
    surveyResponded: true,
    status: "active",
  },
  {
    id: "3",
    name: "Priya Nair",
    lastLogin: "2026-03-14",
    igniteComplete: false,
    accelerateComplete: false,
    sustainComplete: false,
    totalHours: 1.0,
    surveyResponded: false,
    status: "at_risk",
  },
  {
    id: "4",
    name: "Derek Thomas",
    lastLogin: null,
    igniteComplete: false,
    accelerateComplete: false,
    sustainComplete: false,
    totalHours: 0,
    surveyResponded: false,
    status: "inactive",
  },
  {
    id: "5",
    name: "Sofia Chen",
    lastLogin: "2026-03-29",
    igniteComplete: true,
    accelerateComplete: false,
    sustainComplete: false,
    totalHours: 6.0,
    surveyResponded: true,
    status: "active",
  },
];

type SortKey = "name" | "lastLogin" | "totalHours" | "status";

export default function EducatorEngagementTable({
  schoolId,
}: {
  schoolId?: string;
}) {
  const [educators] = useState<Educator[]>(SEED_EDUCATORS);
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = educators
    .filter((e) => filterStatus === "all" || e.status === filterStatus)
    .filter(
      (e) => !search || e.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "lastLogin") {
        return (b.lastLogin || "").localeCompare(a.lastLogin || "");
      }
      if (sortKey === "totalHours") return b.totalHours - a.totalHours;
      // status: at_risk first, then inactive, then active
      const rank = { at_risk: 0, inactive: 1, active: 2 };
      return rank[a.status] - rank[b.status];
    });

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Last Login",
      "Ignite",
      "Accelerate",
      "Sustain",
      "Hours",
      "Survey",
      "Status",
    ];
    const rows = filtered.map((e) => [
      e.name,
      e.lastLogin || "Never",
      e.igniteComplete ? "Yes" : "No",
      e.accelerateComplete ? "Yes" : "No",
      e.sustainComplete ? "Yes" : "No",
      e.totalHours.toFixed(1),
      e.surveyResponded ? "Yes" : "No",
      e.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "roosevelt-educators.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Educator Engagement
        </h2>
        <button
          onClick={handleExportCSV}
          className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search educators..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="at_risk">At Risk</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none"
        >
          <option value="status">Sort: Status</option>
          <option value="name">Sort: Name</option>
          <option value="lastLogin">Sort: Last Login</option>
          <option value="totalHours">Sort: Hours</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Last Login
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Modules
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Hours
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Survey
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((educator, i) => (
              <tr
                key={educator.id}
                className={`border-b border-gray-100 ${
                  i % 2 === 0 ? "" : "bg-gray-50/30"
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {educator.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {educator.lastLogin
                    ? new Date(educator.lastLogin).toLocaleDateString()
                    : <span className="text-gray-400 italic">Never</span>}
                </td>
                <td className="px-4 py-3">{moduleProgress(educator)}</td>
                <td className="px-4 py-3 text-gray-600">
                  {educator.totalHours.toFixed(1)}h
                </td>
                <td className="px-4 py-3">
                  {educator.surveyResponded ? (
                    <span className="text-green-600 text-xs">Responded</span>
                  ) : (
                    <span className="text-gray-400 text-xs">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3">{statusBadge(educator.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        At Risk = no login in 14+ days OR &lt;25% module completion at phase
        midpoint
      </p>
    </div>
  );
}

