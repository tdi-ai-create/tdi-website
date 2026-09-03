'use client'

import { STATE_RULES, isNarrativeState, type Owner } from '@/lib/funding-rules'

/**
 * Who owes the next move, and what that move is.
 *
 * This used to render "Waiting on TDI" and stop there. Bella asked, reasonably,
 * what the grant system actually needed from her, because the badge named a
 * company rather than an action. The system already knew: STATE_RULES carries
 * an owner and a plain sentence for every narrative state, and it was being
 * used on the server and nowhere a person could see it.
 *
 * So the badge now reads the narrative state and says the next move. It falls
 * back to the old wording when there is no state to read, which is honest:
 * "waiting on TDI" with nothing behind it is genuinely all we know.
 */

const CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  client: { bg: '#FFF7ED', text: '#C2410C', label: 'Waiting on Client' },
  tdi: { bg: '#F5F3FF', text: '#6D28D9', label: 'Waiting on TDI' },
  funder: { bg: '#EFF6FF', text: '#1D4ED8', label: 'Waiting on Funder' },
}

/** The move each narrative state is waiting for, in the words a person uses. */
const NEXT_MOVE: Record<string, string> = {
  not_started: 'Ask for a draft',
  requested: 'Writer is drafting',
  qa_review: 'With Julie for QA',
  approval: 'Yours to approve',
  escalated: 'Yours to decide',
  ready: 'Approved. Submit it',
}

/** Whose move it is, said plainly. */
const OWNER_WORD: Record<string, string> = {
  writer: 'Writer',
  qa: 'Julie',
  bella: 'You',
  team: 'TDI',
  school: 'School',
}

export function WaitingOnBadge({
  waitingOn,
  narrativeStatus,
  status,
}: {
  waitingOn: 'tdi' | 'client' | 'funder' | 'none'
  narrativeStatus?: string | null
  /** Opportunity status. A finished grant is nobody's next move. */
  status?: string | null
}) {
  // A closed, denied or awarded grant owes nothing, whatever waiting_on says.
  // The write path clears it now, but rows written before that fix still carry
  // the stale value, and a dead grant claiming your attention is the exact
  // thing this was reported for.
  if (status && ['closed', 'denied', 'awarded'].includes(status)) return null

  if (waitingOn === 'none') return null
  const c = CONFIG[waitingOn]
  if (!c) return null

  const rule = isNarrativeState(narrativeStatus) ? STATE_RULES[narrativeStatus] : null
  const move = rule ? NEXT_MOVE[rule.state] : null
  const owner: Owner | null = rule ? rule.owner : null

  // Highlight when the move is actually Bella's, so hers stand out from the
  // ones she is only watching.
  const isYours = owner === 'bella'
  const bg = isYours ? '#FEF3C7' : c.bg
  const text = isYours ? '#92400E' : c.text

  return (
    <span
      title={rule ? rule.meaning : `${c.label}. No narrative state recorded yet.`}
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        background: bg,
        color: text,
        whiteSpace: 'nowrap',
      }}
    >
      {move ? `${OWNER_WORD[owner || 'team'] || 'TDI'}: ${move}` : c.label}
    </span>
  )
}
