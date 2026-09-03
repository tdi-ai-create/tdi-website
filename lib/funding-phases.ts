// ---------------------------------------------------------------------------
// The nine phases a school moves through, written once.
//
// This list lived inside PhaseChain.tsx, a client component, so the API had no
// way to check that a phase id it was handed was real. Two copies of a list is
// how the funding portal ended up with three definitions of "gate open", so
// this one is shared from the start.
// ---------------------------------------------------------------------------

export interface FundingPhase {
  id: string
  label: string
  /** What happens in this phase, in the words a person would use. */
  tip: string
}

export const FUNDING_PHASES: FundingPhase[] = [
  { id: 'intake', label: 'Intake', tip: 'School enrolled, gathering contacts and contracts' },
  { id: 'researching', label: 'Research', tip: 'Finding matching grant opportunities' },
  { id: 'strategy', label: 'Strategy', tip: 'Mapping funding paths and setting priorities' },
  { id: 'writing', label: 'Writing', tip: 'Drafting grant narratives and applications' },
  { id: 'in_review', label: 'Review', tip: 'Narratives under QA and Bella review' },
  { id: 'delivered', label: 'Delivered', tip: 'Materials sent to school for submission' },
  { id: 'submitted', label: 'Submitted', tip: 'Application submitted, awaiting funder decision' },
  { id: 'awaiting_decision', label: 'Awaiting', tip: 'Waiting on funder award decision' },
  { id: 'awarded', label: 'Awarded', tip: 'Grant awarded, ready for allocation' },
]

export const PHASE_IDS = FUNDING_PHASES.map(p => p.id)

export function isPhaseId(v: unknown): v is string {
  return typeof v === 'string' && PHASE_IDS.includes(v)
}
