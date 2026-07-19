'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTDIAdmin } from '@/lib/tdi-admin/context';

export default function DocsPage() {
  const { teamMember } = useTDIAdmin();
  const router = useRouter();
  const [activeDoc, setActiveDoc] = useState<'admin-guide' | 'workflow' | 'service-invoicing' | 'funding' | 'funding-launch' | 'hub-engagement' | 'engagement-workflow' | 'creator-feedback-sop' | 'creator-recruitment-sop'>('admin-guide');

  if (!teamMember) {
    return (
      <div style={{ padding: '40px 32px', textAlign: 'center', color: '#6B7280' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: 0 }}>Team Documentation</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Internal guides and specs. Not visible to partners.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              const content = document.getElementById('doc-frame')?.getAttribute('srcdoc') || '';
              const blob = new Blob([content], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `TDI-${activeDoc}-${new Date().toISOString().split('T')[0]}.html`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer',
            }}
          >
            Download HTML
          </button>
          <button
            onClick={() => {
              const frame = document.getElementById('doc-frame') as HTMLIFrameElement;
              if (frame?.contentWindow) frame.contentWindow.print();
            }}
            style={{
              fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
              border: 'none', background: '#1e2749', color: 'white', cursor: 'pointer',
            }}
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Doc selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'admin-guide' as const, label: 'Admin Guide', desc: 'How the portal works (start here)' },
          { id: 'workflow' as const, label: 'Technical Workflow', desc: 'Full system spec (APIs, tables, crons)' },
          { id: 'service-invoicing' as const, label: 'Service Delivery + Invoicing', desc: 'Contract to delivery to invoice workflow' },
          { id: 'funding' as const, label: 'Funding System', desc: 'Grant pursuits, agent drafting, follow-up engine' },
          { id: 'funding-launch' as const, label: 'Funding Launch Plan', desc: 'Bella + Rae action guide with deadlines' },
          { id: 'hub-engagement' as const, label: 'Hub Engagement', desc: 'Interleaved checks, implementation tracking, streaks' },
          { id: 'engagement-workflow' as const, label: 'Engagement Workflow', desc: 'End-to-end pipeline, agent setup, API reference' },
          { id: 'creator-feedback-sop' as const, label: 'Creator Feedback SOP', desc: 'Submit > review > approve > feedback loop' },
          { id: 'creator-recruitment-sop' as const, label: 'Creator Recruitment', desc: 'Gap analysis > research > outreach > convert' },
        ].map(doc => (
          <button
            key={doc.id}
            onClick={() => setActiveDoc(doc.id)}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10, border: '1px solid',
              borderColor: activeDoc === doc.id ? '#1e2749' : '#E5E7EB',
              background: activeDoc === doc.id ? '#1e2749' : 'white',
              color: activeDoc === doc.id ? 'white' : '#1e2749',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{doc.label}</p>
            <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.7 }}>{doc.desc}</p>
          </button>
        ))}
        <button
          onClick={() => router.push('/tdi-admin/docs/workflows')}
          style={{
            flex: 1, padding: '14px 16px', borderRadius: 10, border: '1px solid #E5E7EB',
            background: 'white', color: '#1e2749', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Workflows</p>
          <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.7 }}>Project pipelines from draft to ship</p>
        </button>
      </div>

      {/* Doc iframe */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <iframe
          id="doc-frame"
          src={`/api/tdi-admin/docs/${activeDoc}`}
          style={{ width: '100%', height: 'calc(100vh - 220px)', border: 'none' }}
          title={activeDoc}
        />
      </div>
    </div>
  );
}
