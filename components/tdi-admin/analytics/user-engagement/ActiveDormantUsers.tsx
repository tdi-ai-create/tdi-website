'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard, EmptyChart } from '../shared';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { Copy, Check, Users } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

const ACTIVITY_COLORS = {
  active: '#10B981',    // green
  slowing: '#FBBF24',   // yellow
  atRisk: '#F97316',    // orange
  dormant: '#EF4444',   // red
};

interface ActivityBreakdown {
  active: { count: number; percentage: number };
  slowing: { count: number; percentage: number };
  atRisk: { count: number; percentage: number };
  dormant: { count: number; percentage: number };
}

interface DormantUser {
  userId: string;
  name: string;
  school: string;
  lastActive: string | null;
  lastCourse?: string;
  email: string | null;
}

interface ActiveDormantUsersProps {
  activityData: ActivityBreakdown;
  dormantUsers: DormantUser[];
  isLoading?: boolean;
}

export function ActiveDormantUsers({
  activityData,
  dormantUsers,
  isLoading = false,
}: ActiveDormantUsersProps) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <ChartCard title="Active vs Dormant Users" subtitle="Loading...">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: theme.primary }} />
        </div>
      </ChartCard>
    );
  }

  if (!activityData) {
    return (
      <ChartCard title="Active vs Dormant Users" subtitle="User activity breakdown">
        <EmptyChart
          title="No activity data"
          description="User activity data will appear once users start using the platform."
          icon="data"
        />
      </ChartCard>
    );
  }

  const chartData = [
    { name: 'Active (7d)', value: activityData.active.count, color: ACTIVITY_COLORS.active },
    { name: 'Slowing (8-14d)', value: activityData.slowing.count, color: ACTIVITY_COLORS.slowing },
    { name: 'At Risk (15-30d)', value: activityData.atRisk.count, color: ACTIVITY_COLORS.atRisk },
    { name: 'Dormant (30d+)', value: activityData.dormant.count, color: ACTIVITY_COLORS.dormant },
  ];

  const totalUsers = chartData.reduce((sum, d) => sum + d.value, 0);

  const copyEmails = () => {
    const emails = dormantUsers
      .map(u => u.email)
      .filter((e): e is string => !!e)
      .join(', ');
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ChartCard
      title="Active vs Dormant Users"
      subtitle="Based on last activity timestamp"
      minHeight="min-h-[450px]"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="relative">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} users (${totalUsers > 0 ? Math.round((value / totalUsers) * 100) : 0}%)`,
                    name,
                  ]}
                  contentStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">
                  {item.name}: <span className="font-medium">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dormant Users List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users size={14} style={{ color: ACTIVITY_COLORS.dormant }} />
              Dormant Users ({activityData.dormant.count})
            </h4>
            {dormantUsers.length > 0 && (
              <button
                onClick={copyEmails}
                className="flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all hover:bg-gray-100"
                style={{ color: theme.primary }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Emails'}
              </button>
            )}
          </div>

          <div className="max-h-[280px] overflow-y-auto border border-gray-100 rounded-lg">
            {dormantUsers.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No dormant users - great job!
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">School</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {dormantUsers.slice(0, 50).map(user => (
                    <tr key={user.userId} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">{user.name}</td>
                      <td className="py-2 px-3 text-gray-500 truncate max-w-[120px]">{user.school}</td>
                      <td className="py-2 px-3 text-gray-500">{formatDate(user.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

export default ActiveDormantUsers;
