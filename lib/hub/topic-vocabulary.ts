/**
 * The approved topic tag vocabulary, and the check that keeps it approved.
 *
 * The tagging spec has said "at least one tag from the approved list" since it
 * was written. The published library carries roughly 300 distinct values
 * against an approved 22, with near duplicates splitting the same idea:
 * `team-building` and `team building`, `staff-meeting` and `staff meetings`,
 * `formative-assessment` and `formative assessment`.
 *
 * The mechanical cause was found on 27 September 2026. Three agents were told
 * to tag from a list at `quick-win-tagging/SKILL.md`, and that file does not
 * exist anywhere on the Paperclip volume. The agent writing tags and the agent
 * gating them had both been instructed to follow a list neither could read. The
 * list now lives inside their instructions, and this is the other half: the
 * place a wrong tag is actually refused rather than merely discouraged.
 *
 * It matters beyond tidiness because tags are now load bearing. The Working
 * Together shelf is a tag, and Hub search expands through a vocabulary keyed on
 * tags. A mis-tag surfaces a Self-Care tool on a search for ESL, which is live
 * today.
 *
 * ## Scope, deliberately narrow
 *
 * This gates NEW publishes only. The existing ~300 values are untouched, which
 * was Rae's call on 27 September: cleaning the whole vocabulary is a much
 * larger job with no reader waiting on it, and mixing the two is how this
 * stalls. Stop the number growing first.
 *
 * `backfill_published` does not run this check, so the repair path for live
 * items stays open.
 */

/**
 * The 22 approved tags, plus `staff-collaboration`, which was added on
 * 27 September to drive the Working Together shelf.
 *
 * This list is duplicated into the Dr. Jasmine Cole and Julie Lynn instructions
 * on the Railway volume, because an agent cannot read this file. Changing it
 * here means changing it there. Merging the skills repo deploys nothing.
 */
export const APPROVED_TOPIC_TAGS = [
  'back-to-school',
  'classroom-management',
  'coaching',
  'communication',
  'wellness',
  'leadership',
  'lesson-planning',
  'assessment',
  'feedback',
  'observation',
  'relationships',
  'behavior',
  'de-escalation',
  'special-education',
  'inclusion',
  'differentiation',
  'para',
  'new-teacher',
  'student-engagement',
  'stress-management',
  'burnout-prevention',
  'time-management',
  'staff-collaboration',
] as const

const APPROVED = new Set<string>(APPROVED_TOPIC_TAGS)

export function isApprovedTopicTag(tag: string): boolean {
  return APPROVED.has(tag.trim().toLowerCase())
}

/**
 * Tags on an item that are not in the vocabulary.
 *
 * Returns them rather than a boolean, because a gate that says "invalid" and
 * not which value is a gate people route around.
 */
export function unapprovedTopicTags(tags: string[] | null | undefined): string[] {
  if (!Array.isArray(tags)) return []
  return tags.filter(t => typeof t === 'string' && t.trim() !== '' && !isApprovedTopicTag(t))
}

/**
 * The near duplicates that already exist in the library, mapped to the approved
 * spelling, so the error can suggest rather than only refuse.
 *
 * Only unambiguous cases belong here. Where a tag means something the
 * vocabulary has no word for, the right answer is to ask Rae for a new tag, not
 * to bend it into a neighbouring one.
 */
const SUGGESTIONS: Record<string, string> = {
  'team building': 'staff-collaboration',
  'team-building': 'staff-collaboration',
  collaboration: 'staff-collaboration',
  partnerships: 'staff-collaboration',
  'staff-culture': 'staff-collaboration',
  'staff meetings': 'staff-collaboration',
  'staff-meetings': 'staff-collaboration',
  'staff-meeting': 'staff-collaboration',
  'role-clarity': 'staff-collaboration',
  plc: 'staff-collaboration',
  mentoring: 'coaching',
  'instructional coaching': 'coaching',
  'coaching cycle': 'coaching',
  paras: 'para',
  'para-support': 'para',
  sped: 'special-education',
  'iep-504': 'special-education',
  accommodations: 'special-education',
  ell: 'differentiation',
  'language-support': 'differentiation',
  'formative assessment': 'assessment',
  'formative-assessment': 'assessment',
  'self-assessment': 'assessment',
  'behavior-management': 'behavior',
  'behavior-support': 'behavior',
  'classroom-routines': 'classroom-management',
  routines: 'classroom-management',
  'classroom-environment': 'classroom-management',
  'self-care': 'wellness',
  burnout: 'burnout-prevention',
  'family-communication': 'communication',
  'parent-communication': 'communication',
  'difficult-conversations': 'communication',
  'school-leadership': 'leadership',
  'new-teacher-support': 'new-teacher',
  'new teacher': 'new-teacher',
  planning: 'lesson-planning',
  organization: 'time-management',
  productivity: 'time-management',
}

/** A one line explanation naming the offending tags and any obvious fix. */
export function describeUnapprovedTags(bad: string[]): string {
  const parts = bad.map(t => {
    const suggestion = SUGGESTIONS[t.trim().toLowerCase()]
    return suggestion ? `"${t}" (use "${suggestion}")` : `"${t}"`
  })
  return (
    `topic_tags must come from the approved vocabulary. Not approved: ${parts.join(', ')}. ` +
    `Approved tags: ${APPROVED_TOPIC_TAGS.join(', ')}. ` +
    `If none of them fits, ask Rae for a new tag rather than inventing one.`
  )
}
