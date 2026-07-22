'use client'
// v2 - fit sliders + quick log buttons
import { useState, useCallback } from 'react'
import type { FullOpportunity } from '../OpportunityDetailPanel'
import { getBudgetTimingScore } from '@/lib/budgetCycleScoring'

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  T1: { label: 'Tier 1', color: '#065F46', bg: '#D1FAE5', dot: '#10B981' },
  T2: { label: 'Tier 2', color: '#854D0E', bg: '#FEF3C7', dot: '#F59E0B' },
  T3: { label: 'Tier 3', color: '#374151', bg: '#F3F4F6', dot: '#9CA3AF' },
}

function computeTier(score: unknown): string | null {
  const n = typeof score === 'number' ? score : typeof score === 'string' ? parseInt(score) : null
  if (n == null || isNaN(n)) return null
  if (n >= 70) return 'T1'
  if (n >= 40) return 'T2'
  return 'T3'
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 11, color: '#4B5563', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{title}</h4>
      <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12 }}>
        {children}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: any }) {
  if (value == null || value === '') return null
  // Safely convert objects/arrays to string for display
  const display = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#111827', fontWeight: 500, maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{display}</span>
    </div>
  )
}

function FitSlider({ label, description, value, onChange }: { label: string; description: string; value: number; onChange: (v: number) => void }) {
  const color = value >= 8 ? '#10B981' : value >= 5 ? '#F59E0B' : value >= 1 ? '#EF4444' : '#D1D5DB'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 20, textAlign: 'right' }}>{value || '--'}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ width: '100%', height: 4, accentColor: color, cursor: 'pointer' }}
      />
      <p style={{ fontSize: 10, color: '#9CA3AF', margin: '1px 0 0' }}>{description}</p>
    </div>
  )
}

function RenewalRisk({ oppId }: { oppId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  async function fetchRisk() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sales/opportunities/${oppId}/renewal-risk`)
      const d = await res.json()
      setData(d)
    } catch {
      setData({ error: 'Failed to load' })
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }

  if (!fetched) {
    return (
      <InfoSection title="Renewal Risk (Hub Engagement)">
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <button
            onClick={fetchRisk}
            disabled={loading}
            style={{
              fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 6,
              background: loading ? '#D1D5DB' : '#EEF2FF', color: loading ? '#6B7280' : '#4F46E5',
              border: '1px solid #C7D2FE', cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Checking...' : 'Check Hub Engagement Risk'}
          </button>
        </div>
      </InfoSection>
    )
  }

  if (!data?.matched) {
    return (
      <InfoSection title="Renewal Risk (Hub Engagement)">
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{data?.reason || 'No matching partnership found'}</p>
      </InfoSection>
    )
  }

  const riskColor = data.risk === 'high' ? '#EF4444' : data.risk === 'medium' ? '#F59E0B' : '#10B981'
  const riskBg = data.risk === 'high' ? '#FEF2F2' : data.risk === 'medium' ? '#FFFBEB' : '#F0FDF4'
  const f = data.factors || {}

  return (
    <InfoSection title="Renewal Risk (Hub Engagement)">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
          background: riskBg, color: riskColor, textTransform: 'uppercase',
        }}>
          {data.risk} risk
        </div>
        <span style={{ fontSize: 12, color: '#6B7280' }}>Score: {data.riskScore}/100</span>
      </div>
      {data.partnershipName && (
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: '0 0 8px' }}>Matched to: {data.partnershipName}</p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ background: '#F9FAFB', borderRadius: 6, padding: '6px 8px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{f.memberCount ?? '--'}</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>Hub members</div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 6, padding: '6px 8px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{f.loginRate ?? '--'}%</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>30d login rate</div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 6, padding: '6px 8px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{f.activeUsers7d ?? '--'}</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>Active (7d)</div>
        </div>
        <div style={{ background: '#F9FAFB', borderRadius: 6, padding: '6px 8px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{f.avgProgress ?? '--'}%</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>Avg course progress</div>
        </div>
      </div>
      {f.completedEnrollments > 0 && (
        <p style={{ fontSize: 11, color: '#10B981', margin: '6px 0 0', fontWeight: 500 }}>
          {f.completedEnrollments} course completion{f.completedEnrollments !== 1 ? 's' : ''}
        </p>
      )}
    </InfoSection>
  )
}

export function IntelligenceTab({ opp, onRefresh }: { opp: FullOpportunity; onRefresh: () => void }) {
  const [enriching, setEnriching] = useState(false)

  const leadScore = opp.lead_score as number | null
  const scoreBreakdown = opp.score_breakdown as Record<string, any> | null
  const enrichmentData = opp.enrichment_data as Record<string, any> | null
  const strategicBrief = opp.ai_strategic_brief as string | null
  const enrichmentStatus = opp.enrichment_status as string | null
  const enrichedAt = opp.enriched_at as string | null

  // Manual fit scoring state
  const [fitScores, setFitScores] = useState({
    fit_district_size: (opp.fit_district_size as number) || 0,
    fit_turnover_signal: (opp.fit_turnover_signal as number) || 0,
    fit_pd_investment: (opp.fit_pd_investment as number) || 0,
    fit_budget_timing: (opp.fit_budget_timing as number) || (() => {
      const state = opp.state as string | null
      return state ? getBudgetTimingScore(state).score : 0
    })(),
    fit_leadership_stability: (opp.fit_leadership_stability as number) || 0,
    fit_tdi_alignment: (opp.fit_tdi_alignment as number) || 0,
  })
  const [savingFit, setSavingFit] = useState(false)

  const fitComposite = Object.values(fitScores).reduce((sum, v) => sum + v, 0)
  const fitTier = fitComposite >= 45 ? 'T1' : fitComposite >= 25 ? 'T2' : 'T3'
  const fitTierConfig = TIER_CONFIG[fitTier]

  const budgetRationale = opp.state ? getBudgetTimingScore(opp.state as string).rationale : null

  const saveFitScore = useCallback(async (field: string, value: number) => {
    setFitScores(prev => ({ ...prev, [field]: value }))
    setSavingFit(true)
    try {
      await fetch(`/api/sales/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
    } finally {
      setSavingFit(false)
    }
  }, [opp.id])

  const tier = computeTier(leadScore)
  const tierConfig = tier ? TIER_CONFIG[tier] : null

  const district = enrichmentData?.district_profile
  const decisionMaker = enrichmentData?.decision_maker
  const funding = enrichmentData?.funding_signals
  const warmth = enrichmentData?.warmth_signals

  const [logType, setLogType] = useState<string | null>(null)
  const [logText, setLogText] = useState('')
  const [loggingSaving, setLoggingSaving] = useState(false)

  async function saveQuickLog() {
    if (!logText.trim() || !logType) return
    setLoggingSaving(true)
    try {
      await fetch(`/api/sales/opportunities/${opp.id}/log-outreach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: logType, summary: logText, agent_name: 'rae_manual' }),
      })
      setLogText('')
      setLogType(null)
      onRefresh()
    } finally {
      setLoggingSaving(false)
    }
  }

  const [enrichError, setEnrichError] = useState<string | null>(null)

  async function runEnrichment() {
    setEnriching(true)
    setEnrichError(null)
    try {
      const res = await fetch('/api/leads/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: opp.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEnrichError(data.error || `Failed (${res.status})`)
        setEnriching(false)
        return
      }
      if (data.error) {
        setEnrichError(data.details || data.error)
        setEnriching(false)
        return
      }
      // Give it a moment to process, then refresh
      setTimeout(() => {
        onRefresh()
        setEnriching(false)
      }, 5000)
    } catch (e: any) {
      setEnrichError(e.message || 'Network error')
      setEnriching(false)
    }
  }

  const hasEnrichmentData = !!(leadScore || enrichmentData)

  return (
    <div style={{ padding: 16 }}>
      {/* Quick Log Activity */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {['call', 'email', 'meeting', 'note'].map(t => (
            <button
              key={t}
              onClick={() => setLogType(logType === t ? null : t)}
              style={{
                fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 12, cursor: 'pointer',
                border: `1px solid ${logType === t ? '#4F46E5' : '#D1D5DB'}`,
                background: logType === t ? '#EEF2FF' : 'white',
                color: logType === t ? '#4F46E5' : '#6B7280',
                textTransform: 'capitalize',
              }}
            >
              Log {t}
            </button>
          ))}
        </div>
        {logType && (
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={logText}
              onChange={e => setLogText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveQuickLog()}
              placeholder={`What happened? (${logType})`}
              style={{ flex: 1, fontSize: 12, padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, outline: 'none' }}
              autoFocus
            />
            <button
              onClick={saveQuickLog}
              disabled={loggingSaving || !logText.trim()}
              style={{
                fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                background: '#4F46E5', color: 'white', border: 'none', opacity: loggingSaving || !logText.trim() ? 0.5 : 1,
              }}
            >
              {loggingSaving ? '...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Manual Fit Assessment */}
      <InfoSection title={`Fit Assessment ${fitComposite > 0 ? `(${fitComposite}/60)` : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {fitComposite > 0 && fitTierConfig && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: fitTierConfig.bg, color: fitTierConfig.color,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: fitTierConfig.dot }} />
              {fitTier === 'T1' ? 'Tier 1' : fitTier === 'T2' ? 'Tier 2' : 'Tier 3'}
            </span>
          )}
          {savingFit && <span style={{ fontSize: 10, color: '#9CA3AF' }}>Saving...</span>}
        </div>
        <FitSlider label="District Size" description="1 = small (<500 students), 10 = large (10K+)" value={fitScores.fit_district_size} onChange={(v) => saveFitScore('fit_district_size', v)} />
        <FitSlider label="Turnover Signal" description="1 = stable staff, 10 = high turnover (need for support)" value={fitScores.fit_turnover_signal} onChange={(v) => saveFitScore('fit_turnover_signal', v)} />
        <FitSlider label="PD Investment" description="1 = no PD budget, 10 = strong PD culture & spending" value={fitScores.fit_pd_investment} onChange={(v) => saveFitScore('fit_pd_investment', v)} />
        <FitSlider label="Budget Timing" description={budgetRationale || '1 = just started FY, 10 = peak purchasing window'} value={fitScores.fit_budget_timing} onChange={(v) => saveFitScore('fit_budget_timing', v)} />
        <FitSlider label="Leadership Stability" description="1 = new/unstable leadership, 10 = stable, long-tenure" value={fitScores.fit_leadership_stability} onChange={(v) => saveFitScore('fit_leadership_stability', v)} />
        <FitSlider label="TDI Alignment" description="1 = no alignment, 10 = SEL/wellness focus, perfect fit" value={fitScores.fit_tdi_alignment} onChange={(v) => saveFitScore('fit_tdi_alignment', v)} />
      </InfoSection>

      {/* AI Research -- CTA or results */}
      {!hasEnrichmentData && (
        <InfoSection title="AI Research">
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px', lineHeight: 1.4 }}>
              AI will research this district, score fit, identify decision makers, and surface funding signals.
            </p>
            <button
              onClick={runEnrichment}
              disabled={enriching}
              style={{
                padding: '6px 16px', borderRadius: 6, border: 'none', cursor: enriching ? 'wait' : 'pointer',
                background: enriching ? '#9CA3AF' : '#4F46E5', color: 'white', fontSize: 12, fontWeight: 600,
              }}
            >
              {enriching ? 'Researching...' : 'Run Lead Intelligence'}
            </button>
            {enrichError && (
              <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6 }}>Error: {enrichError}</p>
            )}
          </div>
        </InfoSection>
      )}

      {/* AI Score Overview -- only show if enrichment data exists */}
      {hasEnrichmentData && (
      <InfoSection title="Lead Score">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{leadScore ?? '--'}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>/100</div>
          {tierConfig && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: tierConfig.bg, color: tierConfig.color,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: tierConfig.dot }} />
              {tierConfig.label}
            </span>
          )}
        </div>
        {scoreBreakdown && (
          <>
            <ScoreBar label="Fit" value={scoreBreakdown.fit_score ?? scoreBreakdown.fit ?? 0} max={25} color="#10B981" />
            <ScoreBar label="Pain Signals" value={scoreBreakdown.pain_score ?? scoreBreakdown.pain ?? 0} max={25} color="#EF4444" />
            <ScoreBar label="Funding" value={scoreBreakdown.funding_score ?? scoreBreakdown.funding ?? 0} max={25} color="#3B82F6" />
            <ScoreBar label="Warmth" value={scoreBreakdown.warmth_score ?? scoreBreakdown.warmth ?? 0} max={25} color="#F59E0B" />
          </>
        )}
        {enrichedAt && (
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Last researched: {new Date(enrichedAt).toLocaleDateString()}</span>
            <button
              onClick={runEnrichment}
              disabled={enriching}
              style={{ fontSize: 10, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {enriching ? 'Running...' : 'Re-run'}
            </button>
          </div>
        )}
      </InfoSection>
      )}

      {/* Renewal Risk -- show for renewal/signed/paid type opps, or any with existing partnership */}
      {(opp.type === 'renewal' || opp.stage === 'signed' || opp.stage === 'paid' || opp.stage === 'proposal_sent') && (
        <RenewalRisk oppId={opp.id} />
      )}

      {/* Strategic Brief */}
      {strategicBrief && (
        <InfoSection title="Strategic Brief">
          <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{strategicBrief}</p>
        </InfoSection>
      )}

      {/* District Profile */}
      {district && (
        <InfoSection title="District Profile">
          <InfoRow label="Enrollment" value={district.enrollment?.toLocaleString()} />
          <InfoRow label="Schools" value={district.num_schools} />
          <InfoRow label="Teachers" value={district.num_teachers?.toLocaleString()} />
          <InfoRow label="State" value={district.state} />
          <InfoRow label="Type" value={district.district_type} />
          {district.demographics && typeof district.demographics === 'string' && (
            <InfoRow label="Demographics" value={district.demographics} />
          )}
        </InfoSection>
      )}

      {/* Decision Maker */}
      {decisionMaker && (
        <InfoSection title="Decision Maker">
          <InfoRow label="Name" value={decisionMaker.name} />
          <InfoRow label="Title" value={decisionMaker.title} />
          <InfoRow label="Tenure" value={decisionMaker.tenure} />
          {decisionMaker.priorities && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Priorities:</span>
              <p style={{ fontSize: 12, color: '#374151', margin: '2px 0 0', lineHeight: 1.4 }}>
                {Array.isArray(decisionMaker.priorities) ? decisionMaker.priorities.join(', ') : decisionMaker.priorities}
              </p>
            </div>
          )}
          {decisionMaker.burnout_signals && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Burnout signals:</span>
              <p style={{ fontSize: 12, color: '#991B1B', margin: '2px 0 0', lineHeight: 1.4 }}>
                {Array.isArray(decisionMaker.burnout_signals) ? decisionMaker.burnout_signals.join(', ') : decisionMaker.burnout_signals}
              </p>
            </div>
          )}
        </InfoSection>
      )}

      {/* Funding Signals */}
      {funding && (
        <InfoSection title="Funding Signals">
          <InfoRow label="ESSER Status" value={funding.esser_status} />
          <InfoRow label="Title I" value={funding.title_i ? 'Yes' : funding.title_i === false ? 'No' : null} />
          <InfoRow label="Title II" value={funding.title_ii ? 'Yes' : funding.title_ii === false ? 'No' : null} />
          {funding.recent_grants && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Recent grants:</span>
              <p style={{ fontSize: 12, color: '#374151', margin: '2px 0 0', lineHeight: 1.4 }}>
                {Array.isArray(funding.recent_grants) ? funding.recent_grants.join(', ') : funding.recent_grants}
              </p>
            </div>
          )}
          <InfoRow label="PD Budget" value={funding.pd_budget} />
        </InfoSection>
      )}

      {/* Warmth Signals */}
      {warmth && (
        <InfoSection title="Warmth Signals">
          <InfoRow label="Geographic proximity" value={warmth.proximity} />
          {warmth.connections && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 11, color: '#6B7280' }}>Connections:</span>
              <p style={{ fontSize: 12, color: '#374151', margin: '2px 0 0', lineHeight: 1.4 }}>
                {Array.isArray(warmth.connections) ? warmth.connections.join(', ') : warmth.connections}
              </p>
            </div>
          )}
          <InfoRow label="Referral source" value={warmth.referral_source} />
        </InfoSection>
      )}

      {/* ── Grant Fit Scoring (four-factor, additive to sales scoring) ── */}
      <GrantFitScoring opp={opp} onRefresh={onRefresh} />

      {/* ── Start Funding Pursuit (lead → pursuit conversion) ── */}
      <StartPursuitAction opp={opp} />
    </div>
  )
}

// ── Four-factor grant qualification scoring ──

const GRANT_TIER_CONFIG: Record<string, { label: string; description: string; color: string; bg: string }> = {
  tier1: { label: 'Fast lane', description: 'Move fast, standard path', color: '#065F46', bg: '#D1FAE5' },
  tier2: { label: 'Standard', description: 'Work in normal sequence', color: '#854D0E', bg: '#FEF3C7' },
  tier3: { label: 'Nurture / creative funding', description: 'Still served — trigger a creative funding hunt', color: '#374151', bg: '#F3F4F6' },
}

const GRANT_FACTORS = [
  { key: 'score_fit', label: 'Fit', description: 'How well the school matches TDI\'s model' },
  { key: 'score_pain', label: 'Pain', description: 'Retention, culture, SpEd gaps — how acute their need' },
  { key: 'score_warmth', label: 'Warmth', description: 'Engagement / relationship signal strength' },
  { key: 'score_funding', label: 'Funding', description: 'Realistic path to money (low = creative hunt, not rejection)' },
]

function GrantFitScoring({ opp, onRefresh }: { opp: FullOpportunity; onRefresh: () => void }) {
  const [scores, setScores] = useState({
    score_fit: (opp.score_fit as number) || 0,
    score_pain: (opp.score_pain as number) || 0,
    score_warmth: (opp.score_warmth as number) || 0,
    score_funding: (opp.score_funding as number) || 0,
  })
  const [saving, setSaving] = useState(false)

  const total = scores.score_fit + scores.score_pain + scores.score_warmth + scores.score_funding
  const tier = total >= 70 ? 'tier1' : total >= 45 ? 'tier2' : 'tier3'
  const tierConfig = GRANT_TIER_CONFIG[tier]

  const saveScore = async (field: string, value: number) => {
    const updated = { ...scores, [field]: value }
    setScores(updated)
    const newTotal = updated.score_fit + updated.score_pain + updated.score_warmth + updated.score_funding
    const newTier = newTotal >= 70 ? 'tier1' : newTotal >= 45 ? 'tier2' : 'tier3'
    setSaving(true)
    try {
      await fetch(`/api/sales/opportunities/${opp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value, score_total: newTotal, score_tier: newTier }),
      })
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <InfoSection title="Grant Fit Scoring">
      {/* Tier badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
          background: tierConfig.bg, color: tierConfig.color,
        }}>
          {tierConfig.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0f1e' }}>{total}/100</span>
        <span style={{ fontSize: 10, color: '#6B7280' }}>{tierConfig.description}</span>
        {saving && <span style={{ fontSize: 9, color: '#9CA3AF' }}>saving...</span>}
      </div>

      {/* Four sliders */}
      {GRANT_FACTORS.map(f => {
        const val = scores[f.key as keyof typeof scores]
        const pct = (val / 25) * 100
        const color = val >= 18 ? '#10B981' : val >= 10 ? '#F59E0B' : val >= 1 ? '#EF4444' : '#D1D5DB'
        return (
          <div key={f.key} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: '#374151', fontWeight: 600 }}>{f.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32, textAlign: 'right' }}>{val}/25</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={val}
              onChange={e => saveScore(f.key, parseInt(e.target.value))}
              style={{ width: '100%', height: 4, accentColor: color, cursor: 'pointer' }}
            />
            <p style={{ fontSize: 10, color: '#9CA3AF', margin: '1px 0 0' }}>{f.description}</p>
          </div>
        )
      })}

      {/* Low funding note */}
      {scores.score_funding < 10 && scores.score_funding > 0 && (
        <div style={{
          padding: '6px 10px', background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: 6, fontSize: 10, color: '#92400E', marginTop: 4,
        }}>
          Low funding score triggers a creative funding hunt (local/community sources, braided funding, phased delivery) — every interested school gets served.
        </div>
      )}
    </InfoSection>
  )
}

// ── Start Funding Pursuit (lead → pursuit bridge) ──

function StartPursuitAction({ opp }: { opp: FullOpportunity }) {
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<{ id: string } | null>(null)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/funding/pursuits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtName: opp.name || 'Unknown',
          totalAmount: opp.value || 0,
          clientContactName: opp.contact_name as string || null,
          clientContactEmail: opp.contact_email as string || null,
          clientContactRole: opp.contact_title as string || null,
        }),
      })
      const result = await res.json()
      if (result.error) {
        setError(result.error)
      } else {
        setCreated({ id: result.pursuit?.id || result.id })
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <InfoSection title="Funding Pipeline">
      {created ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>
            {'\u2713'} Funding pursuit created
          </div>
          <a
            href={`/tdi-admin/funding`}
            style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'underline' }}
          >
            Open funding dashboard
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>
            Create a funding pursuit to start the grant funding workflow for this school (path mapping, narrative drafting, submission tracking).
          </p>
          {error && <div style={{ fontSize: 11, color: '#DC2626' }}>{error}</div>}
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 6,
              border: 'none', background: creating ? '#9CA3AF' : '#8B5CF6',
              color: 'white', cursor: creating ? 'default' : 'pointer',
              alignSelf: 'flex-start',
            }}
          >
            {creating ? 'Creating...' : 'Start funding pursuit'}
          </button>
        </div>
      )}
    </InfoSection>
  )
}
