/**
 * The funder catalogue.
 *
 * A funder is researched once and every school is compared against it. Before
 * this, the same programme existed once per school: 38 opportunity rows for 21
 * distinct names, and the same grant carried different names on different
 * schools. "Title II-A Federal" on one, "Title II-A (Teacher Quality)" on
 * another. Nothing could be counted across the portfolio, and an hour spent
 * understanding a funder for one school taught us nothing about the next.
 *
 * Three tiers, which scale very differently:
 *
 *   federal  one record covering every school in the country
 *   state    a finite list, researched once per state, reused forever
 *   local    cannot be pre-built, and is exactly what monthly discovery is for
 */

export const FUNDER_TIERS = ['federal', 'state', 'local'] as const;
export type FunderTier = (typeof FUNDER_TIERS)[number];

/**
 * Rules live with the funder rather than as regexes matching its name.
 *
 * They used to be three regular expressions in lib/funding-eligibility.ts:
 *
 *   ACCOUNTABILITY_DEPENDENT = /(Title I Section 1003|School Improvement|Community Schools)/i
 *   NEEDS_NAMED_APPLICANT    = /(NEA Learning)/i
 *   NEEDS_TDI_AUTHORIZATION  = /(Title I Section 1003)/i
 *
 * Which meant adding a rule required a code change, a newly discovered funder
 * matched nothing, and renaming a grant silently stopped its rule applying.
 * That last one is not hypothetical: the same programme is spelled two ways in
 * this database.
 */
export type EligibilityRules = {
  /** Only open to schools identified under state accountability (CSI/TSI/ATSI). */
  requires_accountability_identification?: boolean;
  /** Needs a named individual who holds a qualifying membership. */
  requires_named_member?: boolean;
  /** TDI must hold a state vendor authorisation to deliver against it. */
  requires_tdi_state_authorization?: boolean;
};

export type Funder = {
  id: string;
  name: string;
  tier: FunderTier | null;
  stateCode: string | null;
  geography: string | null;
  focus: string | null;
  idealApplicant: string | null;
  pastAwards: string | null;
  exclusions: string | null;
  applyUrl: string | null;
  applicationFormat: string | null;
  wordLimits: string | null;
  attachments: string | null;
  writingSamples: string | null;
  typicalAward: number | null;
  allowableUses: string | null;
  windowOpensPattern: string | null;
  windowClosesPattern: string | null;
  decisionPattern: string | null;
  fundsReleasedPattern: string | null;
  eligibilityRules: EligibilityRules;
  notPublishedFields: string[];
  lastResearchedOn: string | null;
  lastResearchedBy: string | null;
  sourceUrl: string | null;
};

/** The fields research is expected to fill in, in the order Rae listed them. */
export const RESEARCH_FIELDS = [
  'geography',
  'focus',
  'idealApplicant',
  'pastAwards',
  'exclusions',
  'applyUrl',
  'applicationFormat',
  'wordLimits',
  'attachments',
  'writingSamples',
  'typicalAward',
  'allowableUses',
  'windowOpensPattern',
  'windowClosesPattern',
  'decisionPattern',
  'fundsReleasedPattern',
] as const;

export type ResearchField = (typeof RESEARCH_FIELDS)[number];

/**
 * How well understood a funder is.
 *
 * A field that is genuinely not published counts as answered, because someone
 * looked. Only an untouched field counts as missing. Otherwise a well
 * researched funder whose deadlines simply are not public would look neglected
 * forever, and somebody would keep re-checking it.
 */
export function researchCompleteness(funder: Funder): {
  answered: number;
  total: number;
  missing: ResearchField[];
} {
  const notPublished = new Set(funder.notPublishedFields);
  const missing: ResearchField[] = [];

  for (const field of RESEARCH_FIELDS) {
    if (notPublished.has(field)) continue;
    const value = funder[field as keyof Funder];
    if (value === null || value === undefined || value === '') missing.push(field);
  }

  return { answered: RESEARCH_FIELDS.length - missing.length, total: RESEARCH_FIELDS.length, missing };
}

/** Is this funder understood well enough to write an application against it? */
export function isReadyToDraftAgainst(funder: Funder): boolean {
  // Deliberately narrow. You do not need every field to write a good
  // application, but you cannot write one without knowing what they fund,
  // where to send it, and when it is due.
  return Boolean(funder.focus && funder.applyUrl && funder.windowClosesPattern);
}
