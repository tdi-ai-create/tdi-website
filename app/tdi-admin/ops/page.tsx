'use client';

import { useState, useEffect } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { AdminStatCard } from '@/components/tdi-admin/ui/AdminStatCard';
import {
  Users, AlertTriangle, DollarSign, BookOpen,
  Sparkles, ArrowRight, Clock, CheckCircle2,
  Bot, ExternalLink, ChevronDown, ChevronUp,
  FileText, Mail, Building2, Calendar,
} from 'lucide-react';
import { InvoiceQueue } from '@/components/tdi-admin/ops/InvoiceQueue';

const ACCENT = '#F97316';

interface OpsData {
  creators: {
    total: number;
    stalled: number;
    stalledList: Array<{
      id: string;
      name: string;
      email: string;
      phase: string;
      content_path: string;
      course_title: string;
      last_activity: string;
      target_date: string;
    }>;
    launched: number;
    inProgress: number;
  };
  invoices: {
    count: number;
    totalAmount: number;
    tbdCount: number;
    list: Array<{
      id: string;
      district: string;
      amount: number;
      contract_year: string;
      notes: string;
      needs_action: boolean;
      blocked_reason: string | null;
      contact_changed: boolean;
    }>;
  };
  hub: { totalEnrollments: number; paidMembers: number; courseCount: number; newThisWeek: number; activeLogins30d: number };
  funding: { activePursuits: number; totalPipeline: number };
  timestamp: string;
}

interface Partnership {
  id: string;
  slug: string;
  contact_name: string;
  contact_email: string;
  contract_phase: string;
  status: string;
  staff_enrolled: number;
  observation_days_total: number;
  observation_days_used: number;
  virtual_sessions_total: number;
  virtual_sessions_used: number;
  executive_sessions_total: number;
  executive_sessions_used: number;
  has_grant_support: boolean;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

function CollapsibleSection({
  title, icon: Icon, accentColor, count, children, defaultOpen = true,
}: {
  title: string; icon: React.ElementType; accentColor: string; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="h-0.5 w-full" style={{ background: accentColor }} />
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>{title}</h2>
          {count !== undefined && count > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${accentColor}15`, color: accentColor }}>{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 -mt-2">{children}</div>}
    </div>
  );
}

function NavButton({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  return (
    <a href={href} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors" style={{ background: `${ACCENT}15`, color: ACCENT }}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </a>
  );
}

export default function OpsPage() {
  const { teamMember } = useTDIAdmin();
  const [data, setData] = useState<OpsData | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamMember?.email) return;
    const userEmail = teamMember.email;
    Promise.all([
      fetch('/api/tdi-admin/ops/dashboard').then(r => r.json()),
      fetch('/api/admin/partnerships', { headers: { 'x-user-email': userEmail } }).then(r => r.json()).catch(() => ({ partnerships: [] })),
    ])
      .then(([opsData, partData]) => {
        if (opsData.error) throw new Error(opsData.error);
        setData(opsData);
        const pList = partData?.partnerships || (Array.isArray(partData) ? partData : []);
        setPartnerships(pList.filter((p: Partnership) => p.status === 'active' && p.slug !== 'demo-elementary'));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [teamMember?.email]);

  if (loading) return <div className="p-8 flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Loading...</div></div>;
  if (error || !data) return <div className="p-8"><div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">Failed to load: {error}</div></div>;

  const invoiceDisplay = data.invoices.totalAmount > 0
    ? formatCurrency(data.invoices.totalAmount) + (data.invoices.tbdCount > 0 ? ` + ${data.invoices.tbdCount} TBD` : '')
    : data.invoices.count > 0 ? `${data.invoices.count} TBD` : '$0';

  const totalServices = partnerships.reduce((s, p) => s + p.observation_days_total + p.virtual_sessions_total + p.executive_sessions_total, 0);
  const usedServices = partnerships.reduce((s, p) => s + p.observation_days_used + p.virtual_sessions_used + p.executive_sessions_used, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>Operations</h1>
          <p className="text-sm text-gray-500 mt-1">Company command center. Updated {new Date(data.timestamp).toLocaleTimeString()}.</p>
        </div>
        <div className="flex gap-2">
          <a href="/tdi-admin/docs" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"><FileText className="w-3.5 h-3.5" /> Team Docs</a>
          <a href="https://paperclip.teachersdeserveit.com/TEA/inbox" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"><Bot className="w-3.5 h-3.5" /> Paperclip</a>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <AdminStatCard icon={Building2} label="Active Clients" value={partnerships.length} subtitle={`${partnerships.filter(p => p.has_grant_support).length} with grants`} accentColor="#10B981" />
        <AdminStatCard icon={Calendar} label="Services Delivered" value={`${usedServices}/${totalServices}`} subtitle="observations + sessions" accentColor="#3B82F6" />
        <AdminStatCard icon={DollarSign} label="Outstanding AR" value={invoiceDisplay} subtitle={`${data.invoices.count} account${data.invoices.count !== 1 ? 's' : ''}`} accentColor={data.invoices.count > 0 ? '#EF4444' : '#10B981'} />
        <AdminStatCard icon={AlertTriangle} label="Stalled Creators" value={data.creators.stalled} subtitle={`of ${data.creators.total} active`} accentColor={data.creators.stalled > 0 ? '#EF4444' : '#10B981'} />
        <AdminStatCard icon={Sparkles} label="Grant Pursuits" value={data.funding.activePursuits || partnerships.filter(p => p.has_grant_support).length} subtitle={data.funding.totalPipeline > 0 ? formatCurrency(data.funding.totalPipeline) + ' pipeline' : `${partnerships.filter(p => p.has_grant_support).length} clients`} accentColor="#8B5CF6" />
      </div>

      {/* ===== SECTION 1: INVOICE QUEUE (top priority action) ===== */}
      <InvoiceQueue userEmail={teamMember?.email || ''} />

      {/* ===== SECTION 2: ACTIVE PARTNERSHIPS ===== */}
      <CollapsibleSection title="Active Partnerships" icon={Building2} accentColor="#10B981" count={partnerships.length}>
        <div className="flex justify-end mb-3">
          <NavButton href="/tdi-admin/leadership" label="Open Leadership Dashboard" icon={ArrowRight} />
        </div>
        {partnerships.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">No active partnerships yet.</p>
        ) : (
          <div className="space-y-2">
            {partnerships.map(p => {
              const totalSvc = p.observation_days_total + p.virtual_sessions_total + p.executive_sessions_total;
              const usedSvc = p.observation_days_used + p.virtual_sessions_used + p.executive_sessions_used;
              const pct = totalSvc > 0 ? Math.round((usedSvc / totalSvc) * 100) : 0;
              return (
                <a key={p.id} href={`/tdi-admin/leadership/${p.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                        {p.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                        background: p.contract_phase === 'ACCELERATE' ? '#CCFBF1' : p.contract_phase === 'SUSTAIN' ? '#D1FAE5' : '#FEF3C7',
                        color: p.contract_phase === 'ACCELERATE' ? '#0D9488' : p.contract_phase === 'SUSTAIN' ? '#065F46' : '#854D0E',
                      }}>{p.contract_phase}</span>
                      {p.has_grant_support && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Grant</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {p.contact_name} | {p.staff_enrolled} staff | Obs: {p.observation_days_used}/{p.observation_days_total} | Virtual: {p.virtual_sessions_used}/{p.virtual_sessions_total} | Exec: {p.executive_sessions_used}/{p.executive_sessions_total}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 75 ? '#10B981' : pct > 25 ? '#3B82F6' : '#E5E7EB' }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-8 text-right">{pct}%</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      {/* ===== SECTION 3: OUTSTANDING AR (legacy invoices) ===== */}
      {data.invoices.list.length > 0 && (
        <CollapsibleSection title="Outstanding AR" icon={DollarSign} accentColor="#EF4444" count={data.invoices.count} defaultOpen={false}>
          <div className="flex justify-end mb-3">
            <NavButton href="/tdi-admin/intelligence" label="Open Operations" icon={ArrowRight} />
          </div>
          <div className="space-y-2">
            {data.invoices.list.map(inv => (
              <div key={inv.id} className="p-3 rounded-lg border border-gray-100" style={{ borderLeft: '3px solid #EF4444' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{inv.district}</span>
                    <span className="text-xs text-gray-400 ml-2">{inv.contract_year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.contact_changed && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Contact Changed</span>}
                    <span className="text-sm font-bold text-gray-900">{inv.amount > 0 ? formatCurrency(inv.amount) : 'TBD'}</span>
                  </div>
                </div>
                {inv.blocked_reason && <p className="text-xs text-red-600 mt-1">{inv.blocked_reason}</p>}
                <div className="flex gap-2 mt-2">
                  <a href="/tdi-admin/sales" className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">View in Sales</a>
                  <button
                    onClick={async () => {
                      if (!confirm(`Mark ${inv.district} as paid?`)) return;
                      await fetch(`/api/sales/${inv.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'x-user-email': teamMember?.email || '' },
                        body: JSON.stringify({ payment_received: true, payment_received_at: new Date().toISOString() }),
                      });
                      setData(prev => prev ? { ...prev, invoices: { ...prev.invoices, count: prev.invoices.count - 1, list: prev.invoices.list.filter(i => i.id !== inv.id) } } : prev);
                    }}
                    className="text-xs font-medium px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >Mark Paid</button>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ===== SECTION 4: CREATOR STUDIO ===== */}
      <CollapsibleSection title="Creator Studio" icon={BookOpen} accentColor="#EC4899" count={data.creators.stalled > 0 ? data.creators.stalled : undefined} defaultOpen={false}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#EC4899' }}>{data.creators.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: data.creators.stalled > 0 ? '#EF4444' : '#10B981' }}>{data.creators.stalled}</p>
              <p className="text-xs text-gray-500">Stalled</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#10B981' }}>{data.creators.launched}</p>
              <p className="text-xs text-gray-500">Launched</p>
            </div>
          </div>
          <NavButton href="/tdi-admin/creators" label="Open Creator Studio" icon={ArrowRight} />
        </div>
        {data.creators.stalledList.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Needs Follow-up</p>
            {data.creators.stalledList.slice(0, 5).map(c => (
              <a key={c.id} href={`/admin/creators/${c.id}`} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{c.course_title || c.content_path || 'No title'}</span>
                </div>
                <span className="text-xs font-medium text-red-500">{daysSince(c.last_activity)}d inactive</span>
              </a>
            ))}
            {data.creators.stalledList.length > 5 && (
              <p className="text-xs text-gray-400 text-center pt-1">+ {data.creators.stalledList.length - 5} more</p>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* ===== SECTION 5: GRANT FUNDING ===== */}
      <CollapsibleSection title="Grant Funding" icon={Sparkles} accentColor="#8B5CF6" defaultOpen={false}>
        <div className="flex justify-end mb-3">
          <NavButton href="/tdi-admin/funding" label="Open Funding Portal" icon={ArrowRight} />
        </div>
        <div className="space-y-2">
          {partnerships.filter(p => p.has_grant_support).map(p => (
            <a key={p.id} href={`/tdi-admin/leadership/${p.id}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors" style={{ borderLeft: '3px solid #8B5CF6' }}>
              <div>
                <span className="text-sm font-semibold text-gray-900">{p.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                <p className="text-xs text-gray-400 mt-0.5">{p.contact_name} | {p.staff_enrolled} staff</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Grant Active</span>
            </a>
          ))}
          {partnerships.filter(p => p.has_grant_support).length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">No grant-supported partnerships.</p>
          )}
        </div>
      </CollapsibleSection>

      {/* ===== SECTION 6: LEARNING HUB ===== */}
      <CollapsibleSection title="Learning Hub" icon={BookOpen} accentColor="#EAB308" defaultOpen={false}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#EAB308' }}>{data.hub.totalEnrollments || '--'}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#10B981' }}>{data.hub.paidMembers || 0}</p>
              <p className="text-xs text-gray-500">Paid Members</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#3B82F6' }}>{data.hub.activeLogins30d || 0}</p>
              <p className="text-xs text-gray-500">Active (30d)</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#8B5CF6' }}>{data.hub.newThisWeek || 0}</p>
              <p className="text-xs text-gray-500">New This Week</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: '#6B7280' }}>{data.hub.courseCount || '--'}</p>
              <p className="text-xs text-gray-500">Courses</p>
            </div>
          </div>
          <div className="flex gap-2">
            <NavButton href="/tdi-admin/hub" label="Hub Admin" icon={ArrowRight} />
            <NavButton href="/tdi-admin/hub/production" label="Production" icon={BookOpen} />
          </div>
        </div>
        {data.hub.paidMembers > 0 && data.hub.totalEnrollments > 0 && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Free to Paid Conversion</span>
                <span className="font-medium">{Math.round((data.hub.paidMembers / data.hub.totalEnrollments) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min((data.hub.paidMembers / data.hub.totalEnrollments) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
