/**
 * Gate gaps — the specific things a school has to do before any agent can
 * draft for them.
 *
 * Why this exists: find_work (app/api/funding/sync/route.ts) will not hand an
 * agent a drafting task unless the pursuit's gate is open. When the gate is
 * shut, requested drafts are invisible to every agent and simply never happen.
 * St. Peter Chanel sat that way for 23 days, and nobody had told the school it
 * was the blocker.
 *
 * So the gaps become real client action items in the portal. Bella sees them,
 * the school gets told, and it happens every time rather than when somebody
 * notices. Pure functions here; the writes live in funding-gate-sync.ts.
 */

export interface GateGap {
  /** Stable identifier — also the action item title, used to dedupe */
  key: string
  /** What Bella sees internally */
  title: string
  /** What the school sees. Plain language, no internal vocabulary. */
  clientLabel: string
  /** Why it is needed, in terms the school cares about */
  description: string
}

const GAP_TITLES = {
  submitter: 'Gate: name the person who will submit applications',
  backup: 'Gate: name a backup contact',
  sponsor: 'Gate: name an administrator to sponsor applications',
  contract1: 'Gate: first agreement not signed',
  contract2: 'Gate: second agreement not signed',
} as const

/** Every action item this module manages, so the sync can find its own rows */
export const ALL_GATE_TITLES: string[] = Object.values(GAP_TITLES)

export function computeGateGaps(gate: Record<string, any> | null | undefined): GateGap[] {
  const gaps: GateGap[] = []
  if (!gate) {
    // No gate row at all means nothing has been collected yet.
    return [
      {
        key: 'submitter',
        title: GAP_TITLES.submitter,
        clientLabel: 'Tell us who will submit the grant applications',
        description: 'We need one person named as the submitter. Most grants require a named individual at the school, and we cannot submit on your behalf.',
      },
    ]
  }

  if (!gate.submitter_name || !gate.submitter_email) {
    gaps.push({
      key: 'submitter',
      title: GAP_TITLES.submitter,
      clientLabel: 'Tell us who will submit the grant applications',
      description: 'We need one person named as the submitter, with an email address. Most grants require a named individual at the school, and we cannot submit on your behalf.',
    })
  }

  if (!gate.backup_name || !gate.backup_email) {
    gaps.push({
      key: 'backup',
      title: GAP_TITLES.backup,
      clientLabel: 'Give us a backup contact',
      description: 'One more name and email, so a deadline is never missed because one person is out or has left the district.',
    })
  }

  if (!gate.admin_sponsor_name || !gate.admin_sponsor_email) {
    gaps.push({
      key: 'sponsor',
      title: GAP_TITLES.sponsor,
      clientLabel: 'Name an administrator who supports the applications',
      description: 'Most funders want to see an administrator behind the request. This is usually a principal or a district leader, and it rarely takes more than their name and email.',
    })
  }

  if (gate.contract1_signed !== true) {
    gaps.push({
      key: 'contract1',
      title: GAP_TITLES.contract1,
      clientLabel: 'Sign the first of two agreements',
      description: 'We cannot write applications on your behalf until this is signed.',
    })
  }

  if (gate.contract2_signed !== true) {
    gaps.push({
      key: 'contract2',
      title: GAP_TITLES.contract2,
      clientLabel: 'Sign the second of two agreements',
      description: 'The second agreement completes the paperwork so we can begin.',
    })
  }

  return gaps
}

/**
 * Mirrors computeGateOpen in the gate route. The gate is open only when there
 * is nothing left to collect.
 */
export function isGateOpen(gate: Record<string, any> | null | undefined): boolean {
  return computeGateGaps(gate).length === 0
}
