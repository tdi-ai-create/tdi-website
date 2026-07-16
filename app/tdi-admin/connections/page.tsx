'use client';

import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import { ArrowRight, ArrowDown, Zap } from 'lucide-react';

const theme = PORTAL_THEMES.hub;

interface Connection {
  from: string;
  to: string;
  data: string;
  impact: string;
  status: 'live' | 'building' | 'planned';
}

const CONNECTIONS: Connection[] = [
  // Hub -> Leadership
  { from: 'Learning Hub', to: 'Leadership Dashboard', data: 'Educator activity, tools explored, PD hours, vibe check averages per building', impact: 'Principals see their team engagement in real-time', status: 'live' },
  { from: 'Learning Hub', to: 'Leadership Dashboard', data: 'Certificate completion rates, completions, active rate per school', impact: 'Contract delivery evidence for renewals', status: 'live' },

  // Hub -> Sales
  { from: 'Learning Hub', to: 'Sales', data: 'Free user signups by school email domain', impact: 'Warm leads from schools already exploring TDI', status: 'live' },
  { from: 'Learning Hub', to: 'Sales', data: 'District adoption metrics (paid vs free users per district)', impact: 'Renewal evidence: "Your 15 educators saved 50+ hours"', status: 'live' },

  // Hub -> CMO
  { from: 'Learning Hub', to: 'CMO Dashboard', data: 'Hub signup sources, membership source breakdown, Substack perks', impact: 'Know which marketing channels drive real engagement', status: 'live' },
  { from: 'Learning Hub', to: 'CMO Dashboard', data: 'Top content by views, signup trends (30d), community engagement', impact: 'Feed content strategy with real usage data', status: 'live' },

  // Hub -> Creator Studio
  { from: 'Learning Hub', to: 'Creator Studio', data: 'Views per tool, Q&A engagement, community response counts', impact: 'Creator impact scores and performance ranking', status: 'live' },
  { from: 'Learning Hub', to: 'Creator Studio', data: 'Content requests from educators, category performance', impact: '"Educators are asking for X" -- direct content pipeline', status: 'live' },

  // Hub -> Funding
  { from: 'Learning Hub', to: 'Funding', data: 'Total educators, states reached, PD hours delivered, certificates earned', impact: 'Auto-generated impact metrics for grant applications', status: 'live' },

  // Funding -> Agents (Paperclip)
  { from: 'Funding', to: 'Agents', data: 'Draft narrative requests, research assignments via find_work API', impact: 'Agents pick up work from portal, draft grant narratives, push results back', status: 'live' },

  // Funding -> Google Drive
  { from: 'Funding', to: 'Google Drive', data: 'Grant narratives saved as Google Docs via save-to-drive API', impact: 'Bella and Julie review narratives directly in Google Docs', status: 'live' },

  // Sales -> Funding
  { from: 'Sales', to: 'Funding', data: 'Signed deal creates funding pursuit with contract line items', impact: 'Funding pipeline auto-populates when a deal closes', status: 'live' },

  // Funding -> Operations
  { from: 'Funding', to: 'Operations', data: 'Award amounts, grant allocation to contract line items', impact: 'Ops dashboard shows pipeline health, invoicing knows which services are grant-funded', status: 'live' },

  // Hub -> Operations/Intelligence
  { from: 'Learning Hub', to: 'Operations', data: 'Contract fulfillment: Hub access vs actual usage per partner district', impact: 'Identify underutilized partnerships before renewal conversations', status: 'live' },

  // Sales -> Hub
  { from: 'Sales', to: 'Learning Hub', data: 'Deal signed -- "Provision Hub Access" button creates all_access account', impact: 'One-click provisioning when a deal closes', status: 'live' },

  // Leadership -> Hub
  { from: 'Leadership Dashboard', to: 'Learning Hub', data: 'Principals recommend Quick Wins and courses to their team', impact: 'Leaders can push specific tools to their educators', status: 'live' },

  // Substack -> Hub
  { from: 'Substack', to: 'Learning Hub', data: 'New subscriber auto-creates free Hub account', impact: 'Every Substack subscriber has a Hub account ready', status: 'building' },

  // Hub -> Substack
  { from: 'Learning Hub', to: 'Substack', data: 'Hub paid members get Substack paid access', impact: 'Two-way perks between platforms (requires manual Substack grant -- no API available)', status: 'planned' },
];

const NODES = [
  { id: 'hub', label: 'Learning Hub', color: '#E8B84B', desc: 'Educator platform: tools, courses, community, PD tracking', row: 0, col: 1 },
  { id: 'leadership', label: 'Leadership', color: '#2A9D8F', desc: 'Partner school dashboards and engagement tracking', row: 1, col: 0 },
  { id: 'sales', label: 'Sales', color: '#7C3AED', desc: 'Pipeline, opportunities, and deal management', row: 1, col: 1 },
  { id: 'cmo', label: 'CMO Dashboard', color: '#DC2626', desc: 'Marketing funnel, Substack, and campaign tracking', row: 1, col: 2 },
  { id: 'creators', label: 'Creator Studio', color: '#0891B2', desc: 'Content creators, topics, and production pipeline', row: 2, col: 0 },
  { id: 'funding', label: 'Funding', color: '#D97706', desc: 'Grant pursuits, narratives, follow-up engine, agent drafting', row: 2, col: 1 },
  { id: 'operations', label: 'Operations', color: '#1B2A4A', desc: 'Contracts, districts, renewals, and billing', row: 2, col: 2 },
  { id: 'agents', label: 'Agents', color: '#7C3AED', desc: 'Paperclip AI agents: Vanessa (grants), Amara (research), Nora (ops)', row: 3, col: 0 },
  { id: 'gdrive', label: 'Google Drive', color: '#0F766E', desc: 'Grant narratives, reports, and shared documents', row: 3, col: 1 },
];

export default function PortalConnectionsPage() {
  const { isOwner } = useTDIAdmin();

  const liveCount = CONNECTIONS.filter(c => c.status === 'live').length;
  const buildingCount = CONNECTIONS.filter(c => c.status === 'building').length;
  const plannedCount = CONNECTIONS.filter(c => c.status === 'planned').length;

  return (
    <div className="px-6 py-6">
      <div className="mb-6">
        <h1 className="font-extrabold" style={{ fontSize: 28, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Portal Connections
        </h1>
        <p className="text-sm text-gray-500 mt-1">How data flows between systems to create intelligence</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-2xl font-bold" style={{ color: '#2A9D8F' }}>{liveCount}</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>Live</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-2xl font-bold" style={{ color: '#E8B84B' }}>{buildingCount}</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>Building</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <p className="text-2xl font-bold" style={{ color: '#9CA3AF' }}>{plannedCount}</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>Planned</p>
        </div>
      </div>

      {/* Visual node map */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 mb-8" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: '#9CA3AF' }}>System Map</h2>

        {/* Hub at center top */}
        <div className="flex justify-center mb-4">
          <div className="rounded-2xl px-8 py-4 text-center" style={{ background: '#E8B84B', boxShadow: '0 4px 16px rgba(232,184,75,0.3)' }}>
            <p className="font-bold text-lg" style={{ color: '#1B2A4A' }}>Learning Hub</p>
            <p className="text-xs" style={{ color: 'rgba(27,42,74,0.6)' }}>Central data source</p>
          </div>
        </div>

        {/* Arrows down */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2" style={{ color: '#D1D5DB' }}>
            <ArrowDown size={20} />
            <span className="text-xs font-medium">Data flows to all systems</span>
            <ArrowDown size={20} />
          </div>
        </div>

        {/* Connected systems */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {NODES.filter(n => n.id !== 'hub').map((node) => (
            <div
              key={node.id}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: node.color + '10', border: `1px solid ${node.color}30` }}
            >
              <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: node.color }}>
                <Zap size={14} style={{ color: 'white' }} />
              </div>
              <p className="text-xs font-bold mb-1" style={{ color: node.color }}>{node.label}</p>
              <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{node.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Connection details */}
      <h2 className="font-bold mb-4" style={{ fontSize: 18, color: '#2B3A67', fontFamily: "'Source Serif 4', Georgia, serif" }}>All Connections</h2>

      <div className="space-y-3">
        {CONNECTIONS.map((conn, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 border border-gray-100 flex items-start gap-4"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)', opacity: conn.status === 'planned' ? 0.7 : 1 }}
          >
            {/* Status indicator */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
              style={{
                backgroundColor: conn.status === 'live' ? '#2A9D8F' : conn.status === 'building' ? '#E8B84B' : '#D1D5DB',
              }}
            />

            {/* Flow */}
            <div className="flex items-center gap-2 flex-shrink-0" style={{ minWidth: 200 }}>
              <span className="text-xs font-bold" style={{ color: '#1B2A4A' }}>{conn.from}</span>
              <ArrowRight size={14} style={{ color: '#E8B84B' }} />
              <span className="text-xs font-bold" style={{ color: '#1B2A4A' }}>{conn.to}</span>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: '#374151' }}>{conn.data}</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{conn.impact}</p>
            </div>

            {/* Status badge */}
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: conn.status === 'live' ? '#D1FAE5' : conn.status === 'building' ? '#FEF3C7' : '#F3F4F6',
                color: conn.status === 'live' ? '#065F46' : conn.status === 'building' ? '#92400E' : '#6B7280',
              }}
            >
              {conn.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
