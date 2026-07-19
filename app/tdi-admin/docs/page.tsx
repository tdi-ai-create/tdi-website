'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { Search, Download, Printer, ExternalLink } from 'lucide-react';

type DocId = 'admin-guide' | 'data-flow' | 'workflow' | 'service-invoicing' | 'funding' | 'funding-launch' | 'hub-engagement' | 'engagement-workflow' | 'creator-feedback-sop' | 'creator-recruitment-sop' | 'communication-map';

interface Doc {
  id: DocId;
  label: string;
  desc: string;
  tags: string[]; // searchable keywords
  relatedSections?: { label: string; href: string }[];
}

interface DocGroup {
  name: string;
  color: string;
  docs: Doc[];
}

const DOC_GROUPS: DocGroup[] = [
  {
    name: 'Getting Started',
    color: '#1e2749',
    docs: [
      {
        id: 'admin-guide',
        label: 'Admin Guide',
        desc: 'How the portal works -- start here',
        tags: ['admin', 'portal', 'overview', 'getting started', 'team', 'roles', 'who does what'],
        relatedSections: [
          { label: 'Open Admin Portal', href: '/tdi-admin' },
        ],
      },
      {
        id: 'data-flow',
        label: 'Data Flow Map',
        desc: 'How data moves between all systems',
        tags: ['data flow', 'connections', 'hub', 'leadership', 'sales', 'cmo', 'funding', 'operations', 'system map', 'integration'],
        relatedSections: [
          { label: 'Leadership Dashboard', href: '/tdi-admin/leadership' },
          { label: 'Sales', href: '/tdi-admin/sales' },
        ],
      },
    ],
  },
  {
    name: 'Partnerships',
    color: '#059669',
    docs: [
      {
        id: 'workflow',
        label: 'Partnership Workflow',
        desc: 'Full lifecycle: sales to onboarding to renewal',
        tags: ['partnership', 'workflow', 'sales', 'onboarding', 'renewal', 'principal', 'dashboard', 'deal', 'contract', 'KPI'],
        relatedSections: [
          { label: 'Leadership Dashboard', href: '/tdi-admin/leadership' },
          { label: 'Sales Pipeline', href: '/tdi-admin/sales' },
        ],
      },
      {
        id: 'communication-map',
        label: 'Communication Map',
        desc: 'Every automated email: who gets it, when, and why',
        tags: ['email', 'communication', 'cron', 'weekly digest', 'newsletter', 'automated', 'resend', 'principal', 'educator', 'welcome', 'reminder'],
        relatedSections: [
          { label: 'Leadership Dashboard', href: '/tdi-admin/leadership' },
        ],
      },
      {
        id: 'service-invoicing',
        label: 'Service Delivery + Invoicing',
        desc: 'Contract to delivery to invoice workflow',
        tags: ['service', 'invoicing', 'delivery', 'contract', 'observation', 'virtual session', 'billing', 'invoice'],
        relatedSections: [
          { label: 'Leadership Dashboard', href: '/tdi-admin/leadership' },
        ],
      },
    ],
  },
  {
    name: 'Funding',
    color: '#7C3AED',
    docs: [
      {
        id: 'funding',
        label: 'Funding System',
        desc: 'Grant pursuits, agent drafting, follow-up engine',
        tags: ['funding', 'grants', 'grant writing', 'pursuit', 'narrative', 'foundation', 'walmart', 'title'],
        relatedSections: [
          { label: 'Funding Portal', href: '/tdi-admin/funding' },
        ],
      },
      {
        id: 'funding-launch',
        label: 'Funding Launch Plan',
        desc: 'Bella + Rae action guide with deadlines',
        tags: ['funding', 'launch', 'bella', 'deadlines', 'action plan', 'grants'],
        relatedSections: [
          { label: 'Funding Portal', href: '/tdi-admin/funding' },
        ],
      },
    ],
  },
  {
    name: 'Hub & Content',
    color: '#2563EB',
    docs: [
      {
        id: 'hub-engagement',
        label: 'Hub Engagement',
        desc: 'Inline checks, implementation tracking, streaks, Field Notes',
        tags: ['hub', 'engagement', 'checks', 'implementation', 'streaks', 'field notes', 'recognition', 'duolingo', 'quick wins'],
        relatedSections: [
          { label: 'Learning Hub', href: '/hub' },
          { label: 'Hub Admin', href: '/tdi-admin/hub' },
        ],
      },
      {
        id: 'engagement-workflow',
        label: 'Engagement Workflow',
        desc: 'End-to-end pipeline, agent setup, API reference',
        tags: ['engagement', 'pipeline', 'agent', 'jasmine', 'julie lynn', 'API', 'sync', 'density'],
        relatedSections: [
          { label: 'Hub Admin', href: '/tdi-admin/hub' },
        ],
      },
    ],
  },
  {
    name: 'Creator Studio',
    color: '#EA580C',
    docs: [
      {
        id: 'creator-feedback-sop',
        label: 'Creator Feedback SOP',
        desc: 'Submit > review > approve > feedback loop',
        tags: ['creator', 'feedback', 'SOP', 'submit', 'review', 'approve', 'bella', 'anne marie', 'milestone'],
        relatedSections: [
          { label: 'Creator Studio', href: '/tdi-admin/creators' },
        ],
      },
      {
        id: 'creator-recruitment-sop',
        label: 'Creator Recruitment',
        desc: 'Gap analysis > research > outreach > convert',
        tags: ['creator', 'recruitment', 'outreach', 'gap analysis', 'research', 'convert', 'pipeline'],
        relatedSections: [
          { label: 'Creator Studio', href: '/tdi-admin/creators' },
        ],
      },
    ],
  },
];

const ALL_DOCS = DOC_GROUPS.flatMap(g => g.docs.map(d => ({ ...d, groupName: g.name, groupColor: g.color })));

export default function DocsPage() {
  const { teamMember } = useTDIAdmin();
  const router = useRouter();
  const [activeDoc, setActiveDoc] = useState<DocId>('admin-guide');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const activeDocData = ALL_DOCS.find(d => d.id === activeDoc);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return ALL_DOCS.filter(d =>
      d.label.toLowerCase().includes(q) ||
      d.desc.toLowerCase().includes(q) ||
      d.tags.some(t => t.includes(q))
    );
  }, [searchQuery]);

  if (!teamMember) {
    return (
      <div style={{ padding: '40px 32px', textAlign: 'center', color: '#6B7280' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: 0 }}>Team Documentation</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Internal guides and specs. Not visible to partners.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: showSearch ? '#F3F4F6' : 'white', color: '#374151', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Search size={14} /> Search
          </button>
          <button
            onClick={() => {
              const frame = document.getElementById('doc-frame') as HTMLIFrameElement;
              if (frame?.src) {
                const a = document.createElement('a');
                a.href = frame.src;
                a.download = `TDI-${activeDoc}-${new Date().toISOString().split('T')[0]}.html`;
                a.target = '_blank';
                a.click();
              }
            }}
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Download size={14} /> Download
          </button>
          <button
            onClick={() => {
              const frame = document.getElementById('doc-frame') as HTMLIFrameElement;
              if (frame?.contentWindow) frame.contentWindow.print();
            }}
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: 'none', background: '#1e2749', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search docs... (e.g. 'email', 'funding', 'creator', 'partnership')"
            autoFocus
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              border: '1px solid #E5E7EB', fontSize: 14, color: '#1e2749',
              fontFamily: "'DM Sans', sans-serif", outline: 'none',
            }}
          />
          {searchResults && searchResults.length > 0 && (
            <div style={{
              marginTop: 8, background: 'white', borderRadius: 10,
              border: '1px solid #E5E7EB', overflow: 'hidden',
            }}>
              {searchResults.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => { setActiveDoc(doc.id); setSearchQuery(''); setShowSearch(false); }}
                  style={{
                    width: '100%', padding: '12px 16px', border: 'none', background: 'none',
                    cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: doc.groupColor, flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1e2749', margin: 0 }}>{doc.label}</p>
                    <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{doc.groupName} -- {doc.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {searchResults && searchResults.length === 0 && searchQuery.trim() && (
            <p style={{ marginTop: 8, fontSize: 13, color: '#9CA3AF' }}>No docs match "{searchQuery}"</p>
          )}
        </div>
      )}

      {/* Two-column layout: sidebar nav + doc viewer */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Sidebar: grouped doc list */}
        <div style={{ width: 260, flexShrink: 0 }}>
          {DOC_GROUPS.map(group => (
            <div key={group.name} style={{ marginBottom: 20 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: group.color, margin: '0 0 6px 4px',
              }}>
                {group.name}
              </p>
              {group.docs.map(doc => {
                const isActive = activeDoc === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoc(doc.id)}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
                      background: isActive ? '#1e2749' : 'transparent',
                      color: isActive ? 'white' : '#374151',
                      cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                      transition: 'all 0.15s',
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{doc.label}</p>
                    <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.6 }}>{doc.desc}</p>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Workflows link */}
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.5px', color: '#6B7280', margin: '0 0 6px 4px',
            }}>
              Workflows
            </p>
            <button
              onClick={() => router.push('/tdi-admin/docs/workflows')}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, border: 'none',
                background: 'transparent', color: '#374151',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Project Pipelines</p>
              <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.6 }}>Draft to ship workflows</p>
            </button>
          </div>
        </div>

        {/* Doc viewer */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Related section links */}
          {activeDocData?.relatedSections && activeDocData.relatedSections.length > 0 && (
            <div style={{
              display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap',
            }}>
              {activeDocData.relatedSections.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6,
                    background: '#F3F4F6', color: '#374151', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#E5E7EB')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#F3F4F6')}
                >
                  <ExternalLink size={11} /> {s.label}
                </a>
              ))}
            </div>
          )}

          {/* iframe */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <iframe
              id="doc-frame"
              src={`/api/tdi-admin/docs/${activeDoc}`}
              style={{ width: '100%', height: 'calc(100vh - 200px)', border: 'none' }}
              title={activeDoc}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
