'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTDIAdmin } from '@/lib/tdi-admin/context';

// ── Workflow Data ──────────────────────────────────────────────────────────────

interface WorkflowStage {
  name: string;
  owner: string;
  isQAGate?: boolean;
}

interface Workflow {
  id: string;
  project: string;
  keywords: string[];
  stages: WorkflowStage[];
  qaGateName?: string;
  qaChecks: string[];
  shipAction: string;
  notes?: string;
}

const WORKFLOWS: Workflow[] = [
  {
    id: 'learning-hub',
    project: 'Learning Hub',
    keywords: ['courses', 'lessons', 'content', 'hub', 'education', 'publish'],
    stages: [
      { name: 'Content Creation', owner: 'Dr. Jasmine Cole / Anne Marie / Rodrigo' },
      { name: 'Content Review', owner: 'Rae' },
      { name: 'Hub Content Upload Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Publish', owner: 'Chris / Platform' },
    ],
    qaGateName: 'Hub Content Upload Gate',
    qaChecks: [
      'Course metadata complete',
      'All lessons have content (50+ words)',
      'Videos play',
      'PDFs download',
      'Certificate renders',
      'ES translations present',
      'Thumbnail at correct dimensions',
      'access_tier is set (not NULL) -- must be free, essentials, professional, or all_access',
    ],
    shipAction: 'Publish to Hub',
  },
  {
    id: 'quick-wins',
    project: 'Quick Wins / Quick Tools',
    keywords: ['quick wins', 'quick tools', 'downloads', 'PDFs', 'resources'],
    stages: [
      { name: 'Content Creation', owner: 'Creator / Anne Marie' },
      { name: 'Content Review', owner: 'Rae' },
      { name: 'Quick Win Upload Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Publish', owner: 'Platform' },
    ],
    qaGateName: 'Quick Win Upload Gate',
    qaChecks: [
      'Title and description filled in',
      'PDF downloads correctly',
      'Thumbnail uploaded at correct dimensions',
      'access_tier is set -- free, essentials, professional, or all_access (REQUIRED, cannot be NULL)',
      'is_free_rotating flag set correctly (true only for rotating free content)',
      'Category/tags assigned',
      'ES translation present if user-facing text',
    ],
    shipAction: 'Publish Quick Win',
    notes: 'access_tier defaults to essentials if not set. Free accounts should only see items marked free or is_free_rotating=true.',
  },
  {
    id: 'funding-grants',
    project: 'Funding & Grants',
    keywords: ['grants', 'funding', 'schools', 'brief', 'eligibility', 'research'],
    stages: [
      { name: 'Research', owner: 'Sandra Reyes' },
      { name: 'Draft Brief', owner: 'Amara Obi / Sandra' },
      { name: 'Elena Review', owner: 'Elena' },
      { name: 'Funding Packet Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Deliver to School', owner: 'Elena' },
    ],
    qaGateName: 'Funding Packet Gate',
    qaChecks: [
      'Correct school name throughout',
      'Grant name / deadline / amount verified',
      'Eligibility specific to school',
      'No fabricated stats',
      'Contact info current',
      'Formal tone',
      'All attachments exist',
    ],
    shipAction: 'Deliver brief to school',
  },
  {
    id: 'marketing-social',
    project: 'Marketing / Social Media',
    keywords: ['social', 'marketing', 'buffer', 'post', 'instagram', 'linkedin', 'twitter', 'content'],
    stages: [
      { name: 'Draft', owner: 'Zara / Izzy' },
      { name: 'CMO Review', owner: 'Izzy' },
      { name: 'Approve', owner: 'Kristin' },
      { name: 'Social Content Batch Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Schedule Buffer', owner: 'Zara' },
      { name: 'Post', owner: 'Rae' },
    ],
    qaGateName: 'Social Content Batch Gate',
    qaChecks: [
      'Handles exist',
      'Character limits met',
      'Links resolve',
      'Brand voice correct',
      'No duplicates',
      'Correct CT timezone',
    ],
    shipAction: 'Post to social',
  },
  {
    id: 'creator-studio',
    project: 'Creator Studio',
    keywords: ['creator', 'studio', 'content', 'publish'],
    stages: [
      { name: 'Content Creation', owner: 'Anne Marie / Rodrigo' },
      { name: 'Hub Content Upload Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Publish', owner: 'Chris / Platform' },
    ],
    qaGateName: 'Hub Content Upload Gate',
    qaChecks: [
      'Course metadata complete',
      'All lessons have content (50+ words)',
      'Videos play',
      'PDFs download',
      'Certificate renders',
      'ES translations present',
      'Thumbnail at correct dimensions',
    ],
    shipAction: 'Publish to Creator Studio',
  },
  {
    id: 'website-build',
    project: 'Website Build',
    keywords: ['website', 'deploy', 'code', 'vercel', 'production', 'staging', 'PR'],
    stages: [
      { name: 'Code', owner: 'Chris' },
      { name: 'PR + Vercel Preview', owner: 'Chris' },
      { name: 'Staging', owner: 'Chris' },
      { name: 'Deploy QA Checklist', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Production', owner: 'Chris' },
    ],
    qaGateName: 'Deploy QA Checklist',
    qaChecks: [
      'Homepage loads',
      '/admin authenticates',
      'Course page renders',
      'API health 200',
      'No new console errors',
      'EN/ES works',
      'PDF downloads work',
    ],
    shipAction: 'Deploy to production',
  },
  {
    id: 'substack-blog',
    project: 'Substack & Blog',
    keywords: ['substack', 'blog', 'newsletter', 'article', 'writing', 'CTA'],
    stages: [
      { name: 'Draft', owner: 'Zara / Izzy' },
      { name: 'Pre-Screen', owner: 'Izzy' },
      { name: 'Approve', owner: 'Kristin' },
      { name: 'QA Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Publish', owner: 'Rae' },
    ],
    qaGateName: 'QA Gate',
    qaChecks: [
      'Links resolve',
      'CTA present and correct',
      'No placeholders',
      'Brand voice',
    ],
    shipAction: 'Rae publishes Substack exclusively',
  },
  {
    id: 'operations',
    project: 'Operations',
    keywords: ['ops', 'operations', 'internal', 'nora', 'tasks'],
    stages: [
      { name: 'Identify', owner: 'Nora' },
      { name: 'Plan', owner: 'Nora' },
      { name: 'Execute', owner: 'Nora' },
      { name: 'Done', owner: '' },
    ],
    qaChecks: [],
    shipAction: 'Internal -- no external ship',
    notes: 'Internal workflow. No QA gate for most tasks. Ops tasks producing external materials must route through QA.',
  },
  {
    id: 'podcast',
    project: 'Podcast Production',
    keywords: ['podcast', 'audio', 'transcript', 'episode', 'guest', 'double-drop'],
    stages: [
      { name: 'Record', owner: 'Rae' },
      { name: 'Transcript Receipt', owner: 'Izzy' },
      { name: 'Approve', owner: 'Kristin' },
      { name: 'Production', owner: 'Zara / Jasmine / Lily' },
      { name: 'QA Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Publish', owner: 'Rae' },
    ],
    qaGateName: 'QA Gate',
    qaChecks: [
      'All links resolve',
      'No placeholder episode details',
      'Correct guest / topic info',
    ],
    shipAction: 'Publish double-drop',
  },
  {
    id: 'sales',
    project: 'Sales',
    keywords: ['sales', 'outreach', 'lead', 'email', 'pipeline', 'prospect'],
    stages: [
      { name: 'Lead ID', owner: 'Elena / Jim' },
      { name: 'Outreach Prep', owner: 'Sophia / Elena' },
      { name: 'Outreach Email Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Approve', owner: 'Rae' },
      { name: 'Send', owner: 'Jim' },
    ],
    qaGateName: 'Outreach Email Gate',
    qaChecks: [
      'Recipient correct',
      'Tone professional',
      'Links work',
      'TDI signature present',
      'Attachments exist',
      'Reply-to correct',
    ],
    shipAction: 'Send outreach',
  },
  {
    id: 'seed-funding',
    project: 'Seed Funding',
    keywords: ['seed', 'funding', 'investor', 'pitch', 'funder', 'due diligence'],
    stages: [
      { name: 'Opportunity ID', owner: 'Elena' },
      { name: 'Due Diligence', owner: 'Elena' },
      { name: 'Materials Prep', owner: 'Elena' },
      { name: 'QA Gate', owner: 'Julie Lynn', isQAGate: true },
      { name: 'Rae Review', owner: 'Rae' },
      { name: 'Pitch', owner: 'Rae' },
    ],
    qaGateName: 'QA Gate',
    qaChecks: [
      'No fabricated stats',
      'Correct amounts / deadlines',
      'Verified claims',
    ],
    shipAction: 'Submit to funder',
  },
  {
    id: 'leadership-dashboard',
    project: 'Leadership Dashboard',
    keywords: ['leadership', 'dashboard', 'data', 'analysis', 'reports', 'KPI'],
    stages: [
      { name: 'Data Collection', owner: 'Olivia' },
      { name: 'Analysis', owner: 'Olivia' },
      { name: 'Brief', owner: 'Olivia' },
      { name: 'Archive', owner: '' },
    ],
    qaChecks: [],
    shipAction: 'Internal -- no external ship',
    notes: 'Internal workflow. No QA gate. External-facing leadership reports must route through QA.',
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const { teamMember } = useTDIAdmin();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return WORKFLOWS;
    const q = search.toLowerCase();
    return WORKFLOWS.filter(w =>
      w.project.toLowerCase().includes(q) ||
      w.keywords.some(k => k.includes(q)) ||
      w.stages.some(s => s.owner.toLowerCase().includes(q))
    );
  }, [search]);

  if (!teamMember) {
    return (
      <div style={{ padding: '40px 32px', textAlign: 'center', color: '#6B7280' }}>
        Loading...
      </div>
    );
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TDI Workflows</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; padding: 32px; color: #1e2749; }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #6B7280; margin-bottom: 24px; }
  .card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 16px; page-break-inside: avoid; }
  .card h2 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
  .pipeline { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
  .stage { font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid #E5E7EB; background: #F9FAFB; }
  .stage.qa { border-color: #dc2626; background: #FEF2F2; color: #dc2626; font-weight: 600; }
  .arrow { color: #9CA3AF; font-size: 12px; }
  .owner { font-size: 10px; color: #6B7280; }
  .section-title { font-size: 12px; font-weight: 600; color: #374151; margin: 8px 0 4px; }
  .check { font-size: 11px; color: #374151; padding: 2px 0; padding-left: 12px; position: relative; }
  .check::before { content: ''; position: absolute; left: 0; top: 8px; width: 6px; height: 6px; border-radius: 50%; background: #dc2626; }
  .ship { font-size: 12px; color: #1e2749; font-weight: 500; margin-top: 6px; }
  .note { font-size: 11px; color: #6B7280; font-style: italic; margin-top: 4px; }
  @media print { body { padding: 16px; } .card { break-inside: avoid; } }
</style></head><body>
<h1>TDI Project Workflows</h1>
<p class="subtitle">Printed ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
${WORKFLOWS.map(w => `
<div class="card">
  <h2>${w.project}</h2>
  <div class="pipeline">${w.stages.map((s, i) => `${i > 0 ? '<span class="arrow">&rarr;</span>' : ''}<div class="stage${s.isQAGate ? ' qa' : ''}"><div>${s.name}</div><div class="owner">${s.owner || '--'}</div></div>`).join('')}</div>
  <div class="ship"><strong>Ship:</strong> ${w.shipAction}</div>
  ${w.qaChecks.length ? `<div class="section-title">QA Checks${w.qaGateName ? ' (' + w.qaGateName + ')' : ''}</div>${w.qaChecks.map(c => `<div class="check">${c}</div>`).join('')}` : ''}
  ${w.notes ? `<div class="note">${w.notes}</div>` : ''}
</div>`).join('')}
</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  return (
    <div ref={printRef} style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => router.push('/tdi-admin/docs')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280',
                fontSize: 14, padding: '4px 0', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              &larr; Team Docs
            </button>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e2749', margin: '8px 0 0' }}>Project Workflows</h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Every project's pipeline from draft to ship. {WORKFLOWS.length} workflows.
          </p>
        </div>
        <button
          onClick={handlePrint}
          style={{
            fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8,
            border: 'none', background: '#1e2749', color: 'white', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", marginTop: 8,
          }}
        >
          Print All
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by project, keyword, or person..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 480, padding: '10px 14px', fontSize: 14,
            borderRadius: 10, border: '1px solid #E5E7EB', outline: 'none',
            fontFamily: "'DM Sans', sans-serif", color: '#1e2749',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#1e2749'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
        />
        {search && (
          <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 12 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 12, color: '#6B7280' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#F9FAFB', border: '1px solid #D1D5DB' }} />
          Stage
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#FEF2F2', border: '1.5px solid #dc2626' }} />
          QA Gate (mandatory)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />
          QA check item
        </span>
      </div>

      {/* Workflow Cards */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#6B7280', fontSize: 14 }}>
          No workflows match "{search}"
        </div>
      )}

      {filtered.map(w => {
        const isExpanded = expandedId === w.id;
        return (
          <div
            key={w.id}
            style={{
              background: 'white', borderRadius: 12, border: '1px solid #E5E7EB',
              marginBottom: 12, overflow: 'hidden', transition: 'box-shadow 0.15s',
              boxShadow: isExpanded ? '0 2px 12px rgba(30,39,73,0.08)' : 'none',
            }}
          >
            {/* Card Header -- always visible */}
            <div
              onClick={() => setExpandedId(isExpanded ? null : w.id)}
              style={{
                padding: '16px 20px', cursor: 'pointer', display: 'flex',
                justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1e2749' }}>{w.project}</span>
                  {w.qaChecks.length === 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                      background: '#F3F4F6', color: '#6B7280',
                    }}>
                      INTERNAL
                    </span>
                  )}
                </div>

                {/* Pipeline */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  {w.stages.map((stage, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {i > 0 && (
                        <span style={{ color: '#9CA3AF', fontSize: 11, lineHeight: 1 }}>&rarr;</span>
                      )}
                      <span style={{
                        fontSize: 11, padding: '3px 8px', borderRadius: 6,
                        background: stage.isQAGate ? '#FEF2F2' : '#F9FAFB',
                        border: `1.5px solid ${stage.isQAGate ? '#dc2626' : '#E5E7EB'}`,
                        color: stage.isQAGate ? '#dc2626' : '#374151',
                        fontWeight: stage.isQAGate ? 600 : 400,
                        whiteSpace: 'nowrap',
                      }}>
                        {stage.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Expand indicator */}
              <span style={{
                fontSize: 14, color: '#9CA3AF', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s', marginTop: 4, flexShrink: 0,
              }}>
                &#9660;
              </span>
            </div>

            {/* Expanded Detail */}
            {isExpanded && (
              <div style={{
                padding: '0 20px 20px', borderTop: '1px solid #F3F4F6',
                paddingTop: 16,
              }}>
                {/* Stage owners */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Stage Owners
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {w.stages.map((stage, i) => (
                      <div key={i} style={{
                        padding: '8px 12px', borderRadius: 8,
                        background: stage.isQAGate ? '#FEF2F2' : '#F9FAFB',
                        border: `1px solid ${stage.isQAGate ? '#FECACA' : '#E5E7EB'}`,
                      }}>
                        <div style={{
                          fontSize: 12, fontWeight: 600,
                          color: stage.isQAGate ? '#dc2626' : '#1e2749',
                        }}>
                          {stage.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                          {stage.owner || '--'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ship action */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                    Ship Action
                  </div>
                  <div style={{ fontSize: 13, color: '#1e2749' }}>{w.shipAction}</div>
                </div>

                {/* QA checks */}
                {w.qaChecks.length > 0 && (
                  <div style={{ marginBottom: w.notes ? 16 : 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                      QA Checks{w.qaGateName ? ` (${w.qaGateName})` : ''}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 4 }}>
                      {w.qaChecks.map((check, i) => (
                        <div key={i} style={{
                          fontSize: 12, color: '#374151', paddingLeft: 14, position: 'relative',
                          lineHeight: '22px',
                        }}>
                          <span style={{
                            position: 'absolute', left: 0, top: 8,
                            width: 6, height: 6, borderRadius: '50%', background: '#dc2626',
                          }} />
                          {check}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {w.notes && (
                  <div style={{
                    fontSize: 12, color: '#6B7280', fontStyle: 'italic',
                    padding: '8px 12px', background: '#FFFBEB', borderRadius: 8,
                    border: '1px solid #FDE68A',
                  }}>
                    {w.notes}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
