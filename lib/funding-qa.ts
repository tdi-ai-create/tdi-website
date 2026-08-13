/**
 * Narrative QA: verdicts, the escalation bound, and what Bella can do about it.
 *
 * The rule that shapes this file: Bella is not a grant expert, so nothing gets
 * handed to her as an open problem. When a narrative fails QA twice it arrives
 * as a diagnosis plus a short list of concrete things she can do, with one of
 * them recommended. She picks. She is never asked to work out what to do.
 */

/** Julie gets two attempts to get a narrative through before a person steps in. */
export const MAX_QA_ATTEMPTS = 2

export type EscalationOptionKey =
  | 'approve_anyway'
  | 'redraft_with_guidance'
  | 'reassign'
  | 'request_info'
  | 'stop_pursuing'

export interface EscalationOption {
  key: EscalationOptionKey
  /** The button Bella clicks */
  label: string
  /** Exactly what will happen if she clicks it, in plain language */
  whatHappens: string
  /** When this is the right call */
  useWhen: string
  /** Free text Bella must supply, or null if the option needs nothing */
  requires: { field: string; label: string; placeholder: string } | null
}

/**
 * The full set. Fixed and system-defined — Julie recommends from this list but
 * cannot invent an action, so Bella never sees a choice the portal cannot carry
 * out.
 */
export const ESCALATION_OPTIONS: EscalationOption[] = [
  {
    key: 'approve_anyway',
    label: 'Approve it as written',
    whatHappens: 'Moves to your approval step. QA\'s objections stay on the record, marked as reviewed and overridden.',
    useWhen: 'You have read it and QA is being stricter than this grant needs.',
    requires: {
      field: 'reason',
      label: 'Why this is fine to send',
      placeholder: 'The reviewer flagged a missing budget detail, but this funder does not ask for one.',
    },
  },
  {
    key: 'redraft_with_guidance',
    label: 'Send back with your direction',
    whatHappens: 'Returns to the writer with your notes attached and the attempt count reset. QA reviews the new version fresh.',
    useWhen: 'You can see what the draft is missing and can say so in a sentence or two.',
    requires: {
      field: 'guidance',
      label: 'What should change',
      placeholder: 'Lead with the reading intervention results from last spring. The draft buries them in paragraph four.',
    },
  },
  {
    key: 'reassign',
    label: 'Try a different writer',
    whatHappens: 'Returns to drafting with a different agent assigned and the attempt count reset. The previous attempts stay on file.',
    useWhen: 'Two attempts have failed for different reasons and a fresh approach is likelier than more notes.',
    requires: {
      field: 'agent',
      label: 'Assign to',
      placeholder: 'vanessa',
    },
  },
  {
    key: 'request_info',
    label: 'Ask the school for what is missing',
    whatHappens: 'Creates an action item for the school and drafts an email you can review and send. The narrative waits until they reply.',
    useWhen: 'The drafts keep failing because we do not have something only the school can give us.',
    requires: {
      field: 'ask',
      label: 'What we need from them',
      placeholder: 'Their most recent enrollment numbers and the percentage of students on free or reduced lunch.',
    },
  },
  {
    key: 'stop_pursuing',
    label: 'Stop pursuing this grant',
    whatHappens: 'Closes this opportunity. It leaves the pipeline and stops appearing in your queue and the school\'s.',
    useWhen: 'The fit is wrong and further attempts are not worth the time.',
    requires: {
      field: 'reason',
      label: 'Why we are stopping',
      placeholder: 'The funder only supports schools in their own county, which we did not catch at intake.',
    },
  },
]

export function getEscalationOption(key: string): EscalationOption | undefined {
  return ESCALATION_OPTIONS.find(o => o.key === key)
}

/** One issue Julie found, specific enough to act on. */
export interface QaIssue {
  /** Which part of the quality gate this belongs to */
  criterion: string
  /** What is wrong */
  problem: string
  /** What would fix it */
  fix: string
  severity: 'blocking' | 'significant' | 'minor'
}

/** What Julie sends when a narrative fails for the second time. */
export interface QaEscalation {
  /** Plain language, for someone who is not a grant expert */
  summary: string
  /** Why it keeps failing rather than what failed this time */
  root_cause: string
  recommended_option: EscalationOptionKey
  recommendation_reason: string
  /** Pre-filled text for the recommended option's required field, if any */
  detail?: string
  escalated_at: string
}

/**
 * Validates an escalation payload before it is stored. An escalation without a
 * usable recommendation is exactly the "here, you deal with it" hand-off this
 * whole design exists to prevent, so it is rejected rather than saved.
 */
export function validateEscalation(input: any): { ok: true; value: QaEscalation } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'escalation object required' }
  }
  const { summary, root_cause, recommended_option, recommendation_reason, detail } = input

  if (!summary || typeof summary !== 'string' || summary.trim().length < 20) {
    return { ok: false, error: 'escalation.summary required, and it has to actually explain the problem' }
  }
  if (!root_cause || typeof root_cause !== 'string' || root_cause.trim().length < 20) {
    return { ok: false, error: 'escalation.root_cause required — why it keeps failing, not what failed this time' }
  }
  if (!getEscalationOption(recommended_option)) {
    return {
      ok: false,
      error: `escalation.recommended_option must be one of: ${ESCALATION_OPTIONS.map(o => o.key).join(', ')}`,
    }
  }
  if (!recommendation_reason || typeof recommendation_reason !== 'string' || recommendation_reason.trim().length < 15) {
    return { ok: false, error: 'escalation.recommendation_reason required — say why this is the right call' }
  }

  return {
    ok: true,
    value: {
      summary: summary.trim(),
      root_cause: root_cause.trim(),
      recommended_option,
      recommendation_reason: recommendation_reason.trim(),
      detail: typeof detail === 'string' && detail.trim() ? detail.trim() : undefined,
      escalated_at: new Date().toISOString(),
    },
  }
}
