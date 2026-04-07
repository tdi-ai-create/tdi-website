"use client";

import { useState, useEffect } from "react";

interface Educator {
  id: string;
  name: string;
  email: string;
  roleGroup: string;
  hubEnrolled: boolean;
  status: "active" | "inactive" | "pending";
  // Phase tracking — populated from module_completions once users log in
  lastLogin: string | null;
  igniteComplete: boolean;
  accelerateComplete: boolean;
  sustainComplete: boolean;
  totalHours: number;
  surveyResponded: boolean;
}

function statusBadge(status: Educator["status"]) {
  const map = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };
  const labels = {
    active: "Active",
    inactive: "Not Enrolled",
    pending: "Pending",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function moduleProgress(educator: Educator) {
  const phases = [
    { label: "Ignite", done: educator.igniteComplete },
    { label: "Accel", done: educator.accelerateComplete },
    { label: "Sustain", done: educator.sustainComplete },
  ];
  return (
    <div className="flex gap-1">
      {phases.map((p) => (
        <span
          key={p.label}
          title={p.label}
          className={`text-xs px-1.5 py-0.5 rounded ${
            p.done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
          }`}
        >
          {p.label[0]}
        </span>
      ))}
    </div>
  );
}

type SortKey = "name" | "roleGroup" | "status" | "totalHours";

export default function EducatorEngagementTable({
  schoolId,
}: {
  schoolId?: string;
}) {
  const [educators, setEducators] = useState<Educator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);

  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const url = schoolId === "admin"
      ? "/api/dashboard/roosevelt/educators?scope=admin"
      : "/api/dashboard/roosevelt/educators";
    
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        // Map API response to component Educator interface
        // Module completion fields default to false — populated once
        // Learning Hub tracks user_events and module_completions.
        const mapped: Educator[] = (data.educators ?? []).map((e: {
          id: string;
          name: string;
          email: string;
          roleGroup: string;
          hubEnrolled: boolean;
          status: "active" | "inactive" | "pending";
        }) => ({
          id: e.id,
          name: e.name,
          email: e.email,
          roleGroup: e.roleGroup,
          hubEnrolled: e.hubEnrolled,
          status: e.status,
          lastLogin: null,
          igniteComplete: false,
          accelerateComplete: false,
          sustainComplete: false,
          totalHours: 0,
          surveyResponded: false,
        }));
        setEducators(mapped);
        setTotal(data.total ?? mapped.length);
        setEnrolledCount(data.enrolled ?? 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[EducatorEngagementTable] fetch error:", err);
        setError("Could not load educator data.");
        setLoading(false);
      });
  }, [schoolId]);

  const filtered = educators
    .filter((e) => filterStatus === "all" || e.status === filterStatus)
    .filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.roleGroup.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "roleGroup") return a.roleGroup.localeCompare(b.roleGroup);
      if (sortKey === "totalHours") return b.totalHours - a.totalHours;
      // status: inactive first to highlight who needs onboarding
      const rank = { inactive: 0, pending: 1, active: 2 };
      return (rank[a.status] ?? 1) - (rank[b.status] ?? 1);
    });

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Role Group", "Hub Enrolled", "Status", "Ignite", "Accelerate", "Sustain"];
    const rows = filtered.map((e) => [
      e.name,
      e.email,
      e.roleGroup,
      e.hubEnrolled ? "Yes" : "No",
      e.status,
      e.igniteComplete ? "Yes" : "No",
      e.accelerateComplete ? "Yes" : "No",
      e.sustainComplete ? "Yes" : "No",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <span className="text-sm">Loading educators…</span>
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

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span><strong>{total}</strong> total educators</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-green-600">{enrolledCount}</strong> Hub-enrolled</span>
        <span className="text-gray-300">|</span>
        <span><strong className="text-red-500">{total - enrolledCount}</strong> not yet enrolled</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm w-56"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Not Enrolled</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="status">Sort: Status</option>
          <option value="name">Sort: Name</option>
          <option value="roleGroup">Sort: Role Group</option>
        </select>
        <button
          onClick={handleExportCSV}
          className="ml-auto text-xs px-3 py-1.5 border rounded-lg hover:bg-gray-50"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Role Group</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Hub Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Modules</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8 text-sm">
                  No educators match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-gray-600">{e.roleGroup}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{e.email}</td>
                  <td className="px-4 py-3">{statusBadge(e.status)}</td>
                  <td className="px-4 py-3">{moduleProgress(e)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">
        Module progress will populate once educators log in to the Learning Hub.
      </p>
    </div>
  );
}
