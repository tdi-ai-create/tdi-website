'use client'

/**
 * The funder catalogue.
 *
 * This tab exists to answer one question honestly: what do we actually know
 * about the places money could come from. Right now the answer is "very
 * little", because all 18 rows were seeded directly before the sync endpoint
 * started requiring a source URL and a research date.
 *
 * So the unresearched state is shown as a first-class thing rather than a
 * blank cell. A catalogue that looks full but has never been checked is worse
 * than one that admits what it is.
 */

import { useEffect, useState } from 'react'

interface Funder {
  id: string
  name: string
  tier: string | null
  state_code: string | null
  geography: string | null
  focus: string | null
  typical_award: string | null
  apply_url: string | null
  source_url: string | null
  last_researched_on: string | null
  eligibility_rules: Record<string, unknown> | null
}

/**
 * The rules, in the words a person would use. These three are the blockers we
 * keep running into, so naming them plainly on the row is the whole value of
 * this tab today.
 */
const RULE_LABELS: Record<string, string> = {
  requires_named_member: 'Needs a named member',
  requires_accountability_identification: 'Needs state accountability ID',
  requires_tdi_state_authorization: 'Needs TDI vendor approval',
}

const C = {
  ink: '#1e2749',
  soft: '#4e5773',
  faint: '#7b8399',
  line: '#e3e7ef',
  warn: '#8a5a00',
  warnBg: '#fff3d6',
  ok: '#1f6b52',
  okBg: '#e3f3ec',
}

export default function FundersTab() {
  const [funders, setFunders] = useState<Funder[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch('/api/funding/funders')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(d => setFunders(d.funders ?? []))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{ padding: '20px 18px', fontSize: 14, color: C.faint }}>Loading funders...</div>
  }

  if (failed) {
    return (
      <div style={{ padding: '20px 18px', fontSize: 14, color: C.soft }}>
        The funder list could not be loaded. That is a failure to read, not an empty catalogue.
      </div>
    )
  }

  const researched = funders.filter(f => f.last_researched_on)

  return (
    <div>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${C.line}`,
          fontSize: 13.5,
          color: C.soft,
        }}
      >
        <strong style={{ color: C.ink }}>
          {funders.length} funder{funders.length === 1 ? '' : 's'}
          {researched.length === 0 ? ', none researched.' : `, ${researched.length} researched.`}
        </strong>{' '}
        {researched.length === 0
          ? 'We hold names and a few eligibility rules. Geography, award size, deadlines and application links are empty on every row, so a badge below means something rather than nothing.'
          : 'Research goes stale, so an old date is a prompt to look again.'}
      </div>

      {funders.length === 0 && (
        <div style={{ padding: '20px 18px', fontSize: 14, color: C.faint }}>
          No funders catalogued yet.
        </div>
      )}

      {funders.map(f => (
        <div
          key={f.id}
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            padding: '11px 18px',
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{f.name}</span>
              {f.tier && <Chip text={f.tier} bg={C.okBg} fg={C.ok} />}
              {Object.keys(f.eligibility_rules ?? {}).map(k => (
                <Chip key={k} text={RULE_LABELS[k] ?? k.replace(/_/g, ' ')} bg={C.warnBg} fg={C.warn} />
              ))}
              {f.last_researched_on && (
                <Chip text={`Checked ${f.last_researched_on}`} bg={C.okBg} fg={C.ok} />
              )}
            </div>
            {/* No detail line when there is no detail. Eighteen identical
                "nothing recorded" sentences is noise pretending to be data. */}
            {(f.geography || f.state_code || f.focus) && (
              <div style={{ fontSize: 13.5, color: C.soft, marginTop: 3 }}>
                {[f.geography || f.state_code, f.focus].filter(Boolean).join('. ')}
              </div>
            )}
          </div>
          {f.apply_url && (
            <a
              href={f.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flexShrink: 0,
                fontSize: 12.5,
                fontWeight: 700,
                padding: '7px 13px',
                borderRadius: 7,
                background: 'transparent',
                color: C.soft,
                border: `1px solid ${C.line}`,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                alignSelf: 'center',
              }}
            >
              Funder site
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

function Chip({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '.07em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        background: bg,
        color: fg,
      }}
    >
      {text}
    </span>
  )
}
