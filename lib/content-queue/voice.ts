/**
 * The voice spec, enforced rather than suggested.
 *
 * Rae, 13 September: all content must follow the spec specifically. Until now
 * the spec lived in Kristin's brand-voice skill and in Zara's outlet rules, and
 * every gate was trusted to remember it. Three of eight pieces in the queue did
 * not follow it, and all three cleared QA, creative and editorial.
 *
 * Only the rules the spec states as absolutes are enforced here. The rest stays
 * a judgement, because a rule that fires on taste produces refusals nobody
 * believes and everybody learns to route around.
 */

export type Outlet = {
  key: string
  label: string
  /** The spec's own words on first person singular. */
  firstPersonSingular: 'never' | 'for personal story only' | 'expected'
  source: string
}

/**
 * One LinkedIn channel, two outlets with opposite rules. They are told apart by
 * audience_tag, which is why that field is not decoration.
 */
export function outletFor(channel: string, audienceTag: string | null): Outlet | null {
  const a = (audienceTag ?? '').trim().toLowerCase()
  if (channel === 'linkedin' && a === 'decision_maker') {
    return {
      key: 'linkedin_team',
      label: 'Team LinkedIn',
      firstPersonSingular: 'never',
      source: 'Zara\'s outlet rules, Outlet 2: Voice "We/our team", never "I"',
    }
  }
  if (channel === 'linkedin' && a === 'founder_network') {
    return {
      key: 'linkedin_rae',
      label: "Rae's personal LinkedIn",
      firstPersonSingular: 'for personal story only',
      source: 'Zara\'s outlet rules, Outlet 3: first-person founder voice',
    }
  }
  if (channel === 'facebook') {
    return {
      key: 'facebook_community',
      label: 'Team Facebook',
      firstPersonSingular: 'expected',
      source: 'Zara\'s outlet rules, Outlet 1: "I\'ll go first" vulnerability format',
    }
  }
  if (channel === 'substack') {
    return {
      key: 'substack',
      label: 'Substack',
      firstPersonSingular: 'for personal story only',
      source: 'brand-voice: Rae talking to educators like a colleague',
    }
  }
  return null
}

const FIRST_PERSON = /\b(I|I'm|I've|I'd|I'll|my|mine|me)\b/g

export function firstPersonHits(body: string): string[] {
  return body.match(FIRST_PERSON) ?? []
}

/**
 * What breaks the spec, in the spec's own terms.
 *
 * Returns reasons rather than a boolean so a refusal can quote the rule it came
 * from. An agent told only "no" learns nothing and tries the same thing again.
 */
export function voiceProblems(
  body: string | null,
  channel: string,
  audienceTag: string | null,
): string[] {
  const text = (body ?? '').trim()
  if (!text) return []
  const outlet = outletFor(channel, audienceTag)
  if (!outlet) return []

  const out: string[] = []

  if (outlet.firstPersonSingular === 'never') {
    const hits = firstPersonHits(text)
    if (hits.length > 0) {
      const unique = [...new Set(hits.map(h => h.toLowerCase()))].slice(0, 6).join(', ')
      out.push(
        `${outlet.label} is written as "we" and "our team", never "I". This uses first person ${hits.length} time${hits.length === 1 ? '' : 's'} (${unique}). ${outlet.source}.`,
      )
    }
  }

  // brand-voice editorial non-negotiables, the ones that are absolutes.
  if (/\byou guys\b/i.test(text)) out.push('brand-voice: no "you guys".')
  if (/\b(ROI|stakeholders?|conversion rate|synerg\w+|leverage(?:d|s|ing)?|utilise|utilize)\b/i.test(text)) {
    out.push('brand-voice editorial non-negotiables: no business jargon (ROI, stakeholders, conversion rate and similar).')
  }

  return out
}
