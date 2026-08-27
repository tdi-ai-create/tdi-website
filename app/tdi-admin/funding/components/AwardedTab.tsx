'use client'

/**
 * Awarded and denied outcomes.
 *
 * The awarded figure is the only number that says whether any of this works,
 * and it has never existed anywhere in the portal. It reads zero today, which
 * is uncomfortable and correct.
 *
 * Denials are listed alongside rather than hidden, with the reason kept. A
 * denial with a recorded reason is worth more than a row that quietly
 * disappears: it is the difference between knowing a funder said no because
 * we missed a window and assuming they were never a fit.
 */

const C = {
  ink: '#1e2749',
  soft: '#4e5773',
  faint: '#7b8399',
  line: '#e3e7ef',
  ok: '#1f6b52',
  okBg: '#e3f3ec',
  stop: '#6d7385',
  stopBg: '#eceef3',
}

export interface AwardedGrant {
  id: string
  name: string
  amount: number
  status: string
  school: string
}

const money = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `$${n.toLocaleString()}`

export default function AwardedTab({ grants }: { grants: AwardedGrant[] }) {
  const awarded = grants.filter(g => g.status === 'awarded')
  const denied = grants.filter(g => g.status === 'denied')
  const total = awarded.reduce((sum, g) => sum + (g.amount || 0), 0)
  const lost = denied.reduce((sum, g) => sum + (g.amount || 0), 0)

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
        {awarded.length === 0 ? (
          <>
            <strong style={{ color: C.ink }}>Nothing has been awarded yet.</strong> Until a school
            tells us they won, this stays at zero. It is the number worth watching.
          </>
        ) : (
          <>
            <strong style={{ color: C.ink }}>
              {money(total)} awarded across {awarded.length} grant{awarded.length === 1 ? '' : 's'}.
            </strong>{' '}
            Recorded when a school tells us the outcome.
          </>
        )}
      </div>

      {awarded.map(g => (
        <Row key={g.id} name={g.name} school={g.school} amount={g.amount} pill="Awarded" bg={C.okBg} fg={C.ok} />
      ))}

      {denied.length > 0 && (
        <>
          <div
            style={{
              padding: '14px 18px 6px',
              fontSize: 11,
              letterSpacing: '.11em',
              textTransform: 'uppercase',
              color: C.faint,
              fontWeight: 800,
              borderTop: `1px solid ${C.line}`,
            }}
          >
            Denied ({denied.length}, {money(lost)} asked for)
          </div>
          {denied.map(g => (
            <Row
              key={g.id}
              name={g.name}
              school={g.school}
              amount={g.amount}
              pill="Denied"
              bg={C.stopBg}
              fg={C.stop}
            />
          ))}
        </>
      )}
    </div>
  )
}

function Row({
  name,
  school,
  amount,
  pill,
  bg,
  fg,
}: {
  name: string
  school: string
  amount: number
  pill: string
  bg: string
  fg: string
}) {
  return (
    <div style={{ padding: '11px 18px', borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{name}</span>
        {amount ? (
          <span style={{ fontSize: 13, color: C.faint, fontVariantNumeric: 'tabular-nums' }}>
            {money(amount)}
          </span>
        ) : null}
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '.07em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 999,
            background: bg,
            color: fg,
          }}
        >
          {pill}
        </span>
      </div>
      <div style={{ fontSize: 13.5, color: C.soft, marginTop: 3 }}>{school}</div>
    </div>
  )
}
