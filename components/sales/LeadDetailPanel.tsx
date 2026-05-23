'use client';

import type { Lead, EnrichmentData } from '@/types/leads';

interface LeadDetailPanelProps {
  lead: Lead;
  onClose?: () => void;
}

export default function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
  const enrichment = lead.enrichment_data as EnrichmentData | null;
  const isEnriching = lead.enrichment_status === 'in_progress' || lead.enrichment_status === 'pending';
  const hasFailed = lead.enrichment_status === 'failed';

  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0a0f1e', margin: 0 }}>{lead.name}</h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
            {lead.contact_name && <>{lead.contact_name} &middot; </>}
            {lead.contact_role && <>{lead.contact_role.replace(/_/g, ' ')} &middot; </>}
            {lead.state_code && <>{lead.state_code} &middot; </>}
            Source: {lead.source.replace(/_/g, ' ')}
          </p>
        </div>
        {lead.lead_score !== null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{lead.lead_score}</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>lead score</div>
          </div>
        )}
      </div>

      {/* Enrichment in progress */}
      {isEnriching && (
        <div style={{
          background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8,
          padding: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 16, height: 16, border: '2px solid #2563EB', borderTopColor: 'transparent',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <div style={{ fontSize: 13, color: '#1E3A5F' }}>
            Claude is researching this district. Strategic brief and scoring will appear here in 60-90 seconds.
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Enrichment failed */}
      {hasFailed && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 13, color: '#92400E' }}>
            <strong>Research could not complete.</strong>
            {lead.enrichment_error && <p style={{ marginTop: 4, fontSize: 12 }}>{lead.enrichment_error}</p>}
            <button
              onClick={async () => {
                await fetch('/api/leads/enrich', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lead_id: lead.id }),
                });
              }}
              style={{ marginTop: 8, fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#92400E' }}
            >
              Retry research
            </button>
          </div>
        </div>
      )}

      {/* Strategic brief */}
      {enrichment && lead.ai_strategic_brief && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#047857', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Strategic brief
          </div>
          <p style={{ fontSize: 13, color: '#0a0f1e', lineHeight: 1.6, margin: 0 }}>{lead.ai_strategic_brief}</p>
        </div>
      )}

      {/* Score breakdown */}
      {enrichment && lead.score_breakdown && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Score breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {(['fit', 'pain', 'funding', 'warmth'] as const).map((dim) => {
              const score = enrichment.scoring[`${dim}_score`];
              const rationale = enrichment.scoring.rationale[dim];
              return (
                <div key={dim} style={{ background: '#F9FAFB', borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#6B7280', textTransform: 'capitalize' }}>{dim}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e' }}>{score}/25</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4, lineHeight: 1.4 }}>{rationale}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision maker */}
      {enrichment?.decision_maker && (
        <details style={{ border: '1px solid #E5E7EB', borderRadius: 8 }}>
          <summary style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>
            Decision maker {enrichment.decision_maker.superintendent_name && <>- {enrichment.decision_maker.superintendent_name}</>}
          </summary>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {enrichment.decision_maker.tenure_start && (
              <div><strong>Tenure since:</strong> {enrichment.decision_maker.tenure_start}</div>
            )}
            {enrichment.decision_maker.prior_districts.length > 0 && (
              <div><strong>Prior districts:</strong> {enrichment.decision_maker.prior_districts.join(', ')}</div>
            )}
            {enrichment.decision_maker.public_priorities.length > 0 && (
              <div>
                <strong>Public priorities:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {enrichment.decision_maker.public_priorities.map((p, i) => (
                    <li key={i} style={{ color: '#374151', marginBottom: 2 }}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {enrichment.decision_maker.burnout_or_retention_signals.length > 0 && (
              <div>
                <strong style={{ color: '#047857' }}>Burnout/retention signals:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {enrichment.decision_maker.burnout_or_retention_signals.map((s, i) => (
                    <li key={i} style={{ color: '#374151', marginBottom: 2 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <SourceList urls={enrichment.decision_maker.sources} />
          </div>
        </details>
      )}

      {/* District profile */}
      {enrichment?.district_profile && (
        <details style={{ border: '1px solid #E5E7EB', borderRadius: 8 }}>
          <summary style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>
            District profile
          </summary>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
            <Field label="Enrollment" value={enrichment.district_profile.enrollment} />
            <Field label="Schools" value={enrichment.district_profile.num_schools} />
            <Field label="Teachers (est.)" value={enrichment.district_profile.num_teachers_estimate} />
            <Field label="Title I" value={enrichment.district_profile.title_i_status} />
            <Field label="State rating" value={enrichment.district_profile.state_rating} />
            <Field label="Per-pupil $" value={enrichment.district_profile.per_pupil_spending} />
            <Field label="% FRL" value={enrichment.district_profile.demographics.frl_percent ? `${enrichment.district_profile.demographics.frl_percent}%` : null} />
            <Field label="% EL" value={enrichment.district_profile.demographics.el_percent ? `${enrichment.district_profile.demographics.el_percent}%` : null} />
            <div style={{ gridColumn: '1 / -1' }}>
              <SourceList urls={enrichment.district_profile.sources} />
            </div>
          </div>
        </details>
      )}

      {/* Funding signals */}
      {enrichment?.funding_signals && (
        <details style={{ border: '1px solid #E5E7EB', borderRadius: 8 }}>
          <summary style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>
            Funding signals
          </summary>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Field label="ESSER status" value={enrichment.funding_signals.esser_status} />
            <Field label="Title I estimate" value={enrichment.funding_signals.title_i_estimate} />
            <Field label="Local ed foundation" value={enrichment.funding_signals.local_education_foundation} />
            {enrichment.funding_signals.recent_grants.length > 0 && (
              <div>
                <strong>Recent grants:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {enrichment.funding_signals.recent_grants.map((g, i) => (
                    <li key={i} style={{ color: '#374151', marginBottom: 2 }}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
            <SourceList urls={enrichment.funding_signals.sources} />
          </div>
        </details>
      )}

      {/* Warmth signals */}
      {enrichment?.warmth_signals && (
        <details style={{ border: '1px solid #E5E7EB', borderRadius: 8 }}>
          <summary style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>
            Warmth signals
          </summary>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div><strong>Proximity:</strong> {enrichment.warmth_signals.geographic_proximity_to_tdi_partners}</div>
            {enrichment.warmth_signals.iasa_member !== null && (
              <div><strong>IASA member:</strong> {enrichment.warmth_signals.iasa_member ? 'Yes' : 'No'}</div>
            )}
            {enrichment.warmth_signals.podcast_or_linkedin_connection && (
              <div><strong>Connection:</strong> {enrichment.warmth_signals.podcast_or_linkedin_connection}</div>
            )}
            {enrichment.warmth_signals.notes && (
              <div style={{ color: '#374151' }}>{enrichment.warmth_signals.notes}</div>
            )}
          </div>
        </details>
      )}

      {/* Data quality note */}
      {enrichment?.data_quality_note && (
        <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
          <strong>Note:</strong> {enrichment.data_quality_note}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{label}</div>
      <div style={{ fontSize: 13, color: '#0a0f1e' }}>{value ?? '\u2014'}</div>
    </div>
  );
}

function SourceList({ urls }: { urls: string[] }) {
  if (!urls || urls.length === 0) return null;
  return (
    <div style={{ paddingTop: 8, fontSize: 11, color: '#9CA3AF' }}>
      <strong>Sources:</strong>
      <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none' }}>
        {urls.map((url, i) => (
          <li key={i} style={{ marginBottom: 2 }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563EB', textDecoration: 'none', wordBreak: 'break-all' }}
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
