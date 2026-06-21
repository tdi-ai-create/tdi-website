'use client';

import { useState, useEffect } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { AdminStatCard } from '@/components/tdi-admin/ui/AdminStatCard';
import {
  Users, AlertTriangle, DollarSign, BookOpen,
  Sparkles, ArrowRight, Clock, CheckCircle2,
  Bot, ExternalLink, ChevronDown, ChevronUp,
  UserPlus, FileText, Phone, Mail,
} from 'lucide-react';

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
  hub: { totalEnrollments: number };
  funding: { activePursuits: number; totalPipeline: number };
  timestamp: string;
}

const PAPERCLIP_AGENTS = {
  creators: {
    name: 'Anne Marie Schmitt',
    role: 'Creator Studio Manager',
    capabilities: 'Ask her: who to recruit, what topics are missing, creator pipeline status, content gap analysis',
    link: 'https://paperclip.teachersdeserveit.com/TEA/issues?q=anne-marie',
  },
  grants: {
    name: 'Amara Obi + Marcus Lee + Vanessa Thornton',
    role: 'Grant Research & Writing Team',
    capabilities: 'Ask them: available grants by state, application drafts, compliance tracking, deadline alerts',
    link: 'https://paperclip.teachersdeserveit.com/TEA/issues?q=grant',
  },
  invoices: {
    name: 'Elena Vasquez',
    role: 'Revenue Strategy & Customer Success',
    capabilities: 'Ask her: client health scores, renewal risk flags, revenue pipeline analysis',
    link: 'https://paperclip.teachersdeserveit.com/TEA/issues?q=elena',
  },
  operations: {
    name: 'James Washington',
    role: 'Operations Management',
    capabilities: 'Ask him: daily operations status, analytics, executive communications',
    link: 'https://paperclip.teachersdeserveit.com/TEA/issues?q=james',
  },
};

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

// Expandable section component
function ExpandableItem({
  title,
  subtitle,
  badge,
  badgeColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${badgeColor}15`, color: badgeColor }}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}

function NavButton({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
      style={{ background: `${ACCENT}15`, color: ACCENT }}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </a>
  );
}

function PaperclipTip({ area }: { area: keyof typeof PAPERCLIP_AGENTS }) {
  const agent = PAPERCLIP_AGENTS[area];
  return (
    <a
      href={agent.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 mt-3 hover:bg-gray-100 transition-colors"
    >
      <Bot className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-gray-600">{agent.name} <span className="font-normal text-gray-400">-- {agent.role}</span></p>
        <p className="text-xs text-gray-500 mt-0.5">{agent.capabilities}</p>
      </div>
    </a>
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

  const invoiceDisplay = data.invoices.totalAmount > 0
    ? formatCurrency(data.invoices.totalAmount) + (data.invoices.tbdCount > 0 ? ` + ${data.invoices.tbdCount} TBD` : '')
    : data.invoices.count > 0 ? `${data.invoices.count} TBD` : '$0';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>
          Ops Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Your daily priorities at a glance. Updated {new Date(data.timestamp).toLocaleTimeString()}.
        </p>
      </div>

      {/* Guides & Docs */}
      <div className="flex flex-wrap gap-3">
        <a
          href="https://docs.google.com/document/d/1V9Bbmopev_qPC05zmN8QTY3bdw4u3ArSHEbuG8Uobjc/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-colors"
        >
          <FileText className="w-4 h-4" style={{ color: ACCENT }} />
          Ops Playbook
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
        <a
          href="https://docs.google.com/document/d/1Ri_GRXTSjsMyVb-Uqr_eqT9UDzLUJnMoFC4J9Z5Yvno/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
        >
          <BookOpen className="w-4 h-4" style={{ color: '#EAB308' }} />
          Hub Migration Guide
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
        <a
          href="https://paperclip.teachersdeserveit.com/TEA/inbox"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-colors"
        >
          <Bot className="w-4 h-4" style={{ color: ACCENT }} />
          Paperclip Inbox
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
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
          label="Invoices Owed"
          value={invoiceDisplay}
          subtitle={`${data.invoices.count} account${data.invoices.count !== 1 ? 's' : ''}`}
          accentColor={data.invoices.count > 0 ? '#EF4444' : '#10B981'}
        />
        <AdminStatCard
          icon={Users}
          label="Hub Enrollments"
          value={data.hub.totalEnrollments || '--'}
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

        {/* ===== CREATOR STUDIO ===== */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#EC4899' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>Creator Studio</h2>
              <NavButton href="/tdi-admin/creators" label="Open Creator Studio" icon={ArrowRight} />
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
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Needs Follow-up</p>
                {data.creators.stalledList.map(c => (
                  <ExpandableItem
                    key={c.id}
                    title={c.name}
                    subtitle={c.course_title || c.content_path || 'No title set'}
                    badge={`${daysSince(c.last_activity)}d inactive`}
                    badgeColor="#EF4444"
                  >
                    <div className="pt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400">Phase:</span> <span className="text-gray-700 font-medium">{c.phase || 'Not set'}</span></div>
                        <div><span className="text-gray-400">Path:</span> <span className="text-gray-700 font-medium">{c.content_path || 'Not selected'}</span></div>
                        <div><span className="text-gray-400">Email:</span> <span className="text-gray-700">{c.email}</span></div>
                        {c.target_date && <div><span className="text-gray-400">Target:</span> <span className="text-gray-700">{new Date(c.target_date).toLocaleDateString()}</span></div>}
                      </div>
                      <div className="bg-pink-50 border border-pink-100 rounded-lg p-2 text-xs text-pink-700">
                        <p className="font-medium">What to do:</p>
                        <p className="mt-1">Send a check-in email asking if anything is blocking them. If no response in 7 days, follow up by phone. Log the contact in their notes.</p>
                      </div>
                      <div className="flex gap-2">
                        <NavButton href={`/admin/creators/${c.id}`} label="Open Creator Profile" icon={FileText} />
                        {c.email && (
                          <a href={`mailto:${c.email}?subject=Checking in on your TDI course`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            <Mail className="w-3.5 h-3.5" /> Email Creator
                          </a>
                        )}
                      </div>
                    </div>
                  </ExpandableItem>
                ))}
              </div>
            )}

            {/* Recruitment section */}
            <ExpandableItem title="Creator Recruitment" subtitle="Grow the pipeline with new creators" badge="Ongoing" badgeColor="#EC4899">
              <div className="pt-3 space-y-2">
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-2 text-xs text-pink-700">
                  <p className="font-medium">How to recruit:</p>
                  <ol className="mt-1 space-y-1 list-decimal list-inside">
                    <li>Check intake submissions in Creator Studio for new applications</li>
                    <li>Ask Anne Marie (Paperclip) for topic gaps and ideal creator profiles</li>
                    <li>Reach out to 10 potential creators per week (educators, speakers, experts)</li>
                    <li>For qualified leads: schedule an intro call, then get Rae&apos;s approval</li>
                    <li>Add approved creators via &quot;Add Creator&quot; button in Creator Studio</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <NavButton href="/tdi-admin/creators" label="Creator Studio" icon={UserPlus} />
                  <NavButton href="/create-with-us" label="View Intake Form" icon={ExternalLink} />
                </div>
              </div>
            </ExpandableItem>

            <PaperclipTip area="creators" />
          </div>
        </div>

        {/* ===== INVOICE COLLECTION ===== */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#EF4444' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>Invoice Collection</h2>
              <NavButton href="/tdi-admin/intelligence" label="Open Operations" icon={ArrowRight} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-red-500">{data.invoices.count}</p>
                <p className="text-xs text-gray-500">Invoices Owed</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold text-orange-500">{data.invoices.totalAmount > 0 ? formatCurrency(data.invoices.totalAmount) : 'TBD'}</p>
                <p className="text-xs text-gray-500">Confirmed Amount</p>
              </div>
            </div>

            {data.invoices.list.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accounts Needing Action</p>
                {data.invoices.list.map(inv => (
                  <ExpandableItem
                    key={inv.id}
                    title={inv.district}
                    subtitle={`${inv.contract_year} contract`}
                    badge={inv.contact_changed ? 'Contact Changed' : inv.amount > 0 ? formatCurrency(inv.amount) : 'TBD'}
                    badgeColor={inv.contact_changed ? '#EF4444' : '#F97316'}
                    defaultOpen={inv.needs_action}
                  >
                    <div className="pt-3 space-y-2">
                      {inv.blocked_reason && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-700">
                          <p className="font-medium">Blocked:</p>
                          <p className="mt-0.5">{inv.blocked_reason}</p>
                        </div>
                      )}
                      <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 text-xs text-orange-700">
                        <p className="font-medium">What to do:</p>
                        {inv.contact_changed ? (
                          <ol className="mt-1 space-y-1 list-decimal list-inside">
                            <li>Find the new AP contact at the district (call the school office)</li>
                            <li>Update the contact in the system</li>
                            <li>Send the invoice to the new contact</li>
                            <li>Follow up every 3 business days until paid</li>
                          </ol>
                        ) : (
                          <ol className="mt-1 space-y-1 list-decimal list-inside">
                            <li>Send formal invoice email to district AP contact</li>
                            <li>Follow up by phone 2 days after email</li>
                            <li>Continue follow-up every 3 business days</li>
                            <li>Log all contact attempts in invoice notes</li>
                            <li>If no response after 3 rounds: escalate to Rae</li>
                          </ol>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <NavButton href={`/tdi-admin/sales`} label="View in Sales" icon={DollarSign} />
                      </div>
                    </div>
                  </ExpandableItem>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm text-green-700">No outstanding invoices</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <NavButton href="/tdi-admin/intelligence" label="View all invoices" icon={DollarSign} />
              <NavButton href="/tdi-admin/intelligence/renewals" label="Renewals" icon={Clock} />
              <NavButton href="/tdi-admin/intelligence/districts" label="Districts" icon={Users} />
            </div>

            <PaperclipTip area="invoices" />
          </div>
        </div>

        {/* ===== LEARNING HUB MIGRATION ===== */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#EAB308' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>Learning Hub Migration</h2>
              <NavButton href="/tdi-admin/hub/production" label="Open Hub Production" icon={ArrowRight} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#EAB308' }}>~30</p>
                <p className="text-xs text-gray-500">Videos to Migrate</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl font-bold" style={{ color: '#EAB308' }}>{data.hub.totalEnrollments || '--'}</p>
                <p className="text-xs text-gray-500">Current Enrollments</p>
              </div>
            </div>

            <ExpandableItem title="How to Migrate a Video" subtitle="Full process from Thinkific to Hub" badge="Step-by-step" badgeColor="#EAB308" defaultOpen>
              <div className="pt-3 space-y-2">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-xs text-yellow-800">
                  <p className="font-medium">1. Download from Thinkific:</p>
                  <ol className="mt-1 space-y-0.5 list-decimal list-inside">
                    <li>Log into Thinkific {'>'} Products {'>'} Video Library</li>
                    <li>Click the three-dot menu (...) next to the video</li>
                    <li>Click Download and save the file</li>
                    <li>Name it: <code>[Course] - [Lesson #] - [Title].mp4</code></li>
                  </ol>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-xs text-yellow-800">
                  <p className="font-medium">2. Create course in Hub (if it doesn&apos;t exist yet):</p>
                  <ol className="mt-1 space-y-0.5 list-decimal list-inside">
                    <li>Go to Hub Production {'>'} Create Course</li>
                    <li>Match the Thinkific title, description, and category</li>
                    <li>Add modules (sections) to match Thinkific structure</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-xs text-yellow-800">
                  <p className="font-medium">3. Upload video to the right lesson:</p>
                  <ol className="mt-1 space-y-0.5 list-decimal list-inside">
                    <li>Open the course {'>'} click the module {'>'} Add Lesson {'>'} Video</li>
                    <li>Click on the lesson {'>'} click &quot;Upload video&quot;</li>
                    <li>Select the downloaded file {'>'} wait for upload + processing</li>
                    <li>Duration auto-fills {'>'} click Save Lesson</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-xs text-yellow-800">
                  <p className="font-medium">4. QA + Publish:</p>
                  <ol className="mt-1 space-y-0.5 list-decimal list-inside">
                    <li>Go to the public Hub and play each video to verify</li>
                    <li>Update your migration tracker spreadsheet</li>
                    <li>When all lessons are done, click Publish</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-xs text-yellow-800">
                  <p className="font-medium">Timeline:</p>
                  <ul className="mt-1 space-y-0.5">
                    <li>Inventory complete by end of first week</li>
                    <li>50% migrated (~15 videos) by July 4</li>
                    <li>100% migrated (~30 videos) by July 18</li>
                    <li>All QA&apos;d, Thinkific ready to sunset by July 25</li>
                  </ul>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <NavButton href="/tdi-admin/hub/production" label="Hub Production" icon={BookOpen} />
                  <NavButton href="/hub" label="Public Hub (QA)" icon={Users} />
                  <a
                    href="https://docs.google.com/document/d/1Ri_GRXTSjsMyVb-Uqr_eqT9UDzLUJnMoFC4J9Z5Yvno/edit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Full Migration Guide
                  </a>
                </div>
              </div>
            </ExpandableItem>

            <PaperclipTip area="operations" />
          </div>
        </div>

        {/* ===== GRANT FUNDING ===== */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="h-0.5 w-full" style={{ background: '#8B5CF6' }} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Source Serif 4', serif" }}>Grant Funding</h2>
              <NavButton href="/tdi-admin/funding" label="Open Funding Portal" icon={ArrowRight} />
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

            <ExpandableItem title="Getting Started with Grants" subtitle="Help current clients pursue funding" badge="New" badgeColor="#8B5CF6" defaultOpen>
              <div className="pt-3 space-y-2">
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-2 text-xs text-purple-700">
                  <p className="font-medium">How to start:</p>
                  <ol className="mt-1 space-y-1 list-decimal list-inside">
                    <li><strong>Get client list</strong> from Lead Dashboard -- focus on active partnerships</li>
                    <li><strong>Research grants</strong> in each client&apos;s state/district (federal, state, foundation)</li>
                    <li><strong>Ask Paperclip</strong> -- Amara, Marcus, and Vanessa can research grants by state</li>
                    <li><strong>Pull impact data</strong> from Funding {'>'} Impact Evidence (educators served, PD hours, certificates)</li>
                    <li><strong>Draft outreach email</strong> to client about the opportunity</li>
                    <li><strong>Send to Rae for approval</strong> before sending anything external</li>
                    <li><strong>Log pursuit</strong> in the Funding dashboard</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <NavButton href="/tdi-admin/funding" label="Funding Portal" icon={Sparkles} />
                  <NavButton href="/tdi-admin/leadership" label="Lead Dashboard" icon={Users} />
                </div>
              </div>
            </ExpandableItem>

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
              <a
                key={key}
                href={agent.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT}15` }}>
                  <Bot className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{agent.name}</p>
                  <p className="text-xs text-gray-400">{agent.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{agent.capabilities}</p>
                </div>
              </a>
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
