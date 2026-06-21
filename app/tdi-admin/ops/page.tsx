'use client';

import { useState, useEffect } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { AdminStatCard } from '@/components/tdi-admin/ui/AdminStatCard';
import {
  Users, AlertTriangle, DollarSign, BookOpen,
  Sparkles, ArrowRight, Phone, Mail,
  Clock, CheckCircle2, Bot, ExternalLink,
} from 'lucide-react';

const ACCENT = '#F97316'; // Orange -- matches Operations theme
const ACCENT_LIGHT = '#FFF7ED';

interface OpsData {
  creators: {
    total: number;
    stalled: number;
    stalledList: Array<{
      id: string;
      name: string;
      phase: string;
      content_path: string;
      course_title: string;
      last_activity: string;
    }>;
    launched: number;
    inProgress: number;
  };
  invoices: {
    totalOutstanding: number;
    totalOverdue: number;
    overdueCount: number;
    overdueList: Array<{
      id: string;
      invoice_number: string;
      amount: number;
      due_date: string;
      district_name: string;
    }>;
  };
  hub: {
    totalEnrollments: number;
  };
  funding: {
    activePursuits: number;
    totalPipeline: number;
  };
  timestamp: string;
}

// Paperclip agents that support each area
const PAPERCLIP_AGENTS = {
  creators: {
    name: 'Anne Marie Schmitt',
    role: 'Creator Studio Manager',
    capabilities: 'Ask her: who to recruit, what topics are missing, creator pipeline status, content gap analysis',
  },
  grants: {
    name: 'Amara Obi + Marcus Lee + Vanessa Thornton',
    role: 'Grant Research & Writing Team',
    capabilities: 'Ask them: available grants by state, application drafts, compliance tracking, deadline alerts',
  },
  invoices: {
    name: 'Elena Vasquez',
    role: 'Revenue Strategy & Customer Success',
    capabilities: 'Ask her: client health scores, renewal risk flags, revenue pipeline analysis',
  },
  operations: {
    name: 'James Washington',
    role: 'Operations Management',
    capabilities: 'Ask him: daily operations status, analytics, executive communications',
  },
};

function daysSince(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function PaperclipTip({ area }: { area: keyof typeof PAPERCLIP_AGENTS }) {
  const agent = PAPERCLIP_AGENTS[area];
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 mt-3">
      <Bot className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-gray-600">{agent.name} <span className="font-normal text-gray-400">-- {agent.role}</span></p>
        <p className="text-xs text-gray-500 mt-0.5">{agent.capabilities}</p>
      </div>
    </div>
  );
}

export default function OpsPage() {
  const { teamMember } = useTDIAdmin();
  const [data, setData] = useState<OpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tdi-admin/ops/dashboard')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-sm">Loading ops dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          Failed to load dashboard: {error || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "'Source Serif 4', serif" }}
        >
          Ops Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Your daily priorities at a glance. Updated {new Date(data.timestamp).toLocaleTimeString()}.
        </p>
      </div>

      {/* Top-level stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard
          icon={AlertTriangle}
          label="Stalled Creators"
          value={data.creators.stalled}
          subtitle={`of ${data.creators.total} active`}
          accentColor={data.creators.stalled > 0 ? '#EF4444' : '#10B981'}
        />
        <AdminStatCard
          icon={DollarSign}
          label="Overdue Invoices"
          value={formatCurrency(data.invoices.totalOverdue)}
          subtitle={`${data.invoices.overdueCount} invoice${data.invoices.overdueCount !== 1 ? 's' : ''}`}
          accentColor={data.invoices.totalOverdue > 0 ? '#EF4444' : '#10B981'}
        />
        <AdminStatCard
          icon={Users}
          label="Hub Enrollments"
          value={data.hub.totalEnrollments}
          accentColor="#EAB308"
        />
        <AdminStatCard
          icon={Sparkles}
          label="Grant Pursuits"
          value={data.funding.activePursuits}
          subtitle={data.funding.totalPipeline > 0 ? formatCurrency(data.funding.totalPipeline) + ' pipeline' : 'None yet'}
          accentColor="#8B5CF6"
        />
      </div>

      {/* Action sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Creator Studio */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#EC4899' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Creator Studio
              </h2>
              <a
                href="/tdi-admin/creators"
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                Open full view <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#EC4899' }}>{data.creators.inProgress}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: data.creators.stalled > 0 ? '#EF4444' : '#10B981' }}>{data.creators.stalled}</p>
                <p className="text-xs text-gray-500">Stalled</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#10B981' }}>{data.creators.launched}</p>
                <p className="text-xs text-gray-500">Launched</p>
              </div>
            </div>

            {data.creators.stalledList.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Needs Follow-up</p>
                <div className="space-y-2">
                  {data.creators.stalledList.slice(0, 5).map(c => (
                    <a
                      key={c.id}
                      href={`/admin/creators/${c.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-pink-600">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.course_title || c.content_path || 'No title'} -- {c.phase}</p>
                      </div>
                      <span className="text-xs text-red-400 font-medium">{daysSince(c.last_activity)}d inactive</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <PaperclipTip area="creators" />
          </div>
        </div>

        {/* Invoice Collection */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#EF4444' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Invoice Collection
              </h2>
              <a
                href="/tdi-admin/intelligence"
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                Open full view <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-red-500">{formatCurrency(data.invoices.totalOverdue)}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-orange-500">{formatCurrency(data.invoices.totalOutstanding)}</p>
                <p className="text-xs text-gray-500">Total Outstanding</p>
              </div>
            </div>

            {data.invoices.overdueList.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Overdue Invoices</p>
                <div className="space-y-2">
                  {data.invoices.overdueList.map(inv => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inv.district_name}</p>
                        <p className="text-xs text-gray-500">Invoice #{inv.invoice_number} -- due {new Date(inv.due_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{formatCurrency(inv.amount)}</p>
                        <p className="text-xs text-red-400">{daysSince(inv.due_date)}d overdue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm text-green-700">No overdue invoices</p>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Phone className="w-3 h-3" /> Call AP contacts
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Mail className="w-3 h-3" /> Send follow-up
              </div>
            </div>

            <PaperclipTip area="invoices" />
          </div>
        </div>

        {/* Learning Hub Migration */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#EAB308' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Learning Hub Migration
              </h2>
              <a
                href="/tdi-admin/hub/production"
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                Open Hub Production <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#EAB308' }}>~30</p>
                <p className="text-xs text-gray-500">Videos to Migrate</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#EAB308' }}>{data.hub.totalEnrollments}</p>
                <p className="text-xs text-gray-500">Current Enrollments</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Migration checklist</p>
                  <ol className="text-xs text-gray-500 mt-1 space-y-1 list-decimal list-inside">
                    <li>Create Thinkific inventory spreadsheet</li>
                    <li>Download videos from Thinkific</li>
                    <li>Upload to Hub via TDI Admin {'>'} Hub {'>'} Production</li>
                    <li>QA each video in the new Hub</li>
                    <li>Mark as migrated, flag Thinkific for archival</li>
                  </ol>
                </div>
              </div>
            </div>

            <PaperclipTip area="operations" />
          </div>
        </div>

        {/* Grant Funding */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#8B5CF6' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>
                Grant Funding
              </h2>
              <a
                href="/tdi-admin/funding"
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                Open Funding Portal <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#8B5CF6' }}>{data.funding.activePursuits}</p>
                <p className="text-xs text-gray-500">Active Pursuits</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#8B5CF6' }}>{data.funding.totalPipeline > 0 ? formatCurrency(data.funding.totalPipeline) : '$0'}</p>
                <p className="text-xs text-gray-500">Pipeline Value</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <BookOpen className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Getting started</p>
                  <ol className="text-xs text-gray-500 mt-1 space-y-1 list-decimal list-inside">
                    <li>Get active client list from Leadership dashboard</li>
                    <li>Research grants in each client's state/district</li>
                    <li>Pull impact data from Funding {'>'} Impact Evidence</li>
                    <li>Draft outreach email, send to Rae for approval</li>
                    <li>Log pursuit in Funding dashboard</li>
                  </ol>
                </div>
              </div>
            </div>

            <PaperclipTip area="grants" />
          </div>
        </div>
      </div>

      {/* Paperclip quick access */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="h-0.5 w-full" style={{ background: ACCENT }} />
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Bot className="w-5 h-5" style={{ color: ACCENT }} />
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>
              Paperclip -- Your AI Team
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            These agents work for TDI and can help you with research, drafts, and analysis. Check their work in Paperclip daily.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(PAPERCLIP_AGENTS).map(([key, agent]) => (
              <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT}15` }}>
                  <Bot className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{agent.name}</p>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{agent.capabilities}</p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="https://paperclip.teachersdeserveit.com/TEA/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: ACCENT }}
          >
            Open Paperclip <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
