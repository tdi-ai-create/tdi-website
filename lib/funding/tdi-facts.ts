/**
 * What we know about ourselves.
 *
 * school_facts answers "what do we know about this district". Nothing answered
 * "what do we know about TDI", so every question about our own standing was
 * asked from scratch, attached to whichever grant raised it, and lost when that
 * grant closed.
 *
 * Saunemin's Title I Section 1003 path is the worked example. Of the three
 * blockers QA found, two were about the school and one was about us: whether
 * TDI holds the executed ISBE contract required to deliver Section 1003 funded
 * services. The writer declined to invent an answer across three attempts,
 * which was correct. The question was raised as a gate on that single grant on
 * 19 August, escalated, and never answered. When the path closed on 14
 * September the question was auto-cancelled as "no longer blocking anything".
 *
 * The answer was never found. The next grant needing it starts from nothing.
 *
 * A fact about us is true across every school at once, so answering it once
 * should answer it everywhere. That is the whole point of this file.
 *
 * Credibility rules are not redefined here. isStale, isCiteable and
 * blockedReason in ./facts govern both tables, because how well a fact is known
 * does not depend on whose fact it is.
 */

import {
  FACT_STATUSES,
  type FactStatus,
  type FactCredibility,
  isCiteable,
  blockedReason,
} from './facts';

export { FACT_STATUSES };

/**
 * Where a fact about us came from.
 *
 * 'contract' and 'researched' mean what they mean for a school fact.
 * 'school_stated' cannot apply to us, and in its place 'agency_confirmed' is
 * the origin that matters most: a state agency or funder told us directly.
 * On whether we may deliver under their programme, they are the only authority.
 */
export const TDI_FACT_ORIGINS = ['contract', 'researched', 'agency_confirmed'] as const;
export type TdiFactOrigin = (typeof TDI_FACT_ORIGINS)[number];

export type TdiFact = {
  key: string;
  /** Null means true everywhere. A state code scopes it to that state. */
  scope: string | null;
  status: FactStatus;
  value: string | null;
  origin: TdiFactOrigin | null;
  source: string | null;
  verifiedOn: string | null;
  verifiedBy: string | null;
};

/** TdiFact satisfies the shared credibility shape without any casting. */
function credibility(fact: TdiFact): FactCredibility {
  return {
    key: fact.key,
    status: fact.status,
    value: fact.value,
    source: fact.source,
    verifiedOn: fact.verifiedOn,
  };
}

export interface CredentialSpec {
  key: string;
  /** What a person would call it. */
  label: string;
  /** True everywhere, or established per state. */
  scoped: 'global' | 'per_state';
  /**
   * Why a grant might stop without it. This is the sentence that appears when
   * the pipeline explains a blocked path, so it is written for a reader rather
   * than as a field name.
   */
  whyItBlocks: string;
}

/**
 * The credentials a grant pipeline actually asks about.
 *
 * Every entry here exists because something in the record asked for it and got
 * no answer, not because it seemed tidy to collect. The registry entries are
 * the 19 August finding, still open and now a procurement blocker on other
 * districts. The vendor entries are the Saunemin 1003 question.
 */
export const CREDENTIALS: CredentialSpec[] = [
  {
    key: 'ein',
    label: 'EIN',
    scoped: 'global',
    whyItBlocks: 'Nearly every application asks for it, and a school credentials block is incomplete without it.',
  },
  {
    key: 'entity_structure',
    label: 'Entity structure',
    scoped: 'global',
    whyItBlocks:
      'Decides whether an application goes in as TDI or as the nonprofit, and some funders will only fund one of the two.',
  },
  {
    key: 'w9_on_file',
    label: 'W-9 ready to send',
    scoped: 'global',
    whyItBlocks: 'Asked for at award time. Missing it delays money already won.',
  },
  {
    key: 'insurance_certificate',
    label: 'Certificate of insurance',
    scoped: 'global',
    whyItBlocks: 'Districts commonly require it before a contract is executed.',
  },
  {
    key: 'privacy_agreement_standing',
    label: 'Data privacy agreement standing',
    scoped: 'global',
    whyItBlocks:
      'Districts increasingly require a signed agreement on a shared registry before purchase. Being unlisted blocks procurement regardless of the grant.',
  },
  {
    key: 'state_vendor_status',
    label: 'State vendor registration',
    scoped: 'per_state',
    whyItBlocks: 'Some state administered funds can only pay a registered vendor.',
  },
  {
    key: 'approved_provider_status',
    label: 'Approved provider status',
    scoped: 'per_state',
    whyItBlocks:
      'Federal formula programmes routed through a state agency can require the provider to hold an executed agreement with that agency. This is the Saunemin Section 1003 question.',
  },
];

const BY_KEY = new Map(CREDENTIALS.map(c => [c.key, c]));

export function credentialSpec(key: string): CredentialSpec | undefined {
  return BY_KEY.get(key);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/** Every live fact about us. Superseded rows are history and excluded. */
export async function readTdiFacts(
  supabase: DbClient,
): Promise<{ facts: TdiFact[]; error?: string }> {
  const { data, error } = await supabase
    .from('tdi_facts')
    .select('key, scope, status, value, origin, source, verified_on, verified_by')
    .is('superseded_at', null)
    .order('key');

  // Never swallowed. An empty list and a failed read mean opposite things: one
  // says we know nothing, the other says we do not know what we know, and
  // treating the second as the first is how a question gets asked again.
  if (error) return { facts: [], error: error.message };

  return {
    facts: (data ?? []).map((r: Record<string, unknown>) => ({
      key: String(r.key),
      scope: (r.scope as string) ?? null,
      status: r.status as FactStatus,
      value: (r.value as string) ?? null,
      origin: (r.origin as TdiFactOrigin) ?? null,
      source: (r.source as string) ?? null,
      verifiedOn: (r.verified_on as string) ?? null,
      verifiedBy: (r.verified_by as string) ?? null,
    })),
  };
}

/**
 * Do we already have a usable answer to this question about ourselves?
 *
 * A state scoped key falls back to the global fact when no state specific one
 * exists, so an answer recorded once for everywhere still counts. The reverse
 * is not true: an Illinois answer says nothing about New Jersey.
 */
export function answeredCredential(
  facts: TdiFact[],
  key: string,
  scope?: string | null,
  asOf: Date = new Date(),
): TdiFact | null {
  const scoped = scope
    ? facts.find(f => f.key === key && f.scope === scope)
    : undefined;
  const global = facts.find(f => f.key === key && !f.scope);
  const found = scoped ?? global;

  if (!found) return null;
  return isCiteable(credibility(found), asOf) ? found : null;
}

/**
 * The question we should be asking ourselves, or null when it is settled.
 *
 * This is the call site that matters: before the pipeline raises a gate about
 * TDI on some school's grant, it asks here. A settled credential means the
 * question is not raised at all, on any school, ever again until it goes stale.
 */
export function outstandingCredential(
  facts: TdiFact[],
  key: string,
  scope?: string | null,
  asOf: Date = new Date(),
): { key: string; scope: string | null; why: string; because: string } | null {
  if (answeredCredential(facts, key, scope, asOf)) return null;

  const spec = credentialSpec(key);
  const existing =
    (scope ? facts.find(f => f.key === key && f.scope === scope) : undefined) ??
    facts.find(f => f.key === key && !f.scope);

  return {
    key,
    scope: scope ?? null,
    why: spec?.whyItBlocks ?? 'A grant path is waiting on this.',
    because: existing
      ? blockedReason(credibility(existing), asOf) ?? 'Not usable as recorded.'
      : 'Nobody has established this yet.',
  };
}

/**
 * Everything about ourselves that is still unanswered, for the states we work in.
 *
 * Reported as a list rather than a count so it can be worked. A count tells
 * somebody there is a problem; a list tells them what to go and find out.
 */
export function missingCredentials(
  facts: TdiFact[],
  states: string[],
  asOf: Date = new Date(),
): { key: string; scope: string | null; why: string; because: string }[] {
  const out: ReturnType<typeof outstandingCredential>[] = [];

  for (const spec of CREDENTIALS) {
    if (spec.scoped === 'global') {
      out.push(outstandingCredential(facts, spec.key, null, asOf));
      continue;
    }
    for (const state of states) {
      out.push(outstandingCredential(facts, spec.key, state, asOf));
    }
  }

  return out.filter((x): x is NonNullable<typeof x> => x !== null);
}
