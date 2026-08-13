/**
 * Quality contract for recruitment candidates.
 *
 * Nothing reaches Bella unless it passes here. The point is structural: she
 * should never open a candidate and find a name with no way to contact them and
 * no draft to send. Validation runs on every write path, including the agent's,
 * because "the model was told to include it" is not a guarantee.
 */

export type CandidateDraft = {
  name?: unknown
  email?: unknown
  school_org?: unknown
  role?: unknown
  expertise_area?: unknown
  gap_id?: unknown
  content_path?: unknown
  source?: unknown
  source_detail?: unknown
  why_good_fit?: unknown
  social_url?: unknown
  outreach_draft?: unknown
}

export type ValidCandidate = {
  name: string
  email: string | null
  school_org: string | null
  role: string | null
  expertise_area: string
  gap_id: string
  content_path: string | null
  source: string
  source_detail: string
  why_good_fit: string
  social_url: string
  outreach_draft: string
}

export type ValidationResult =
  | { ok: true; candidate: ValidCandidate }
  | { ok: false; reasons: string[] }

const CONTENT_PATHS = ['course', 'download', 'blog']
const MIN_FIT = 80
const MIN_DRAFT = 120
const MAX_DRAFT = 1200

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** A public profile we can actually open. Any http(s) URL that parses. */
function validUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Unfilled template slots: "[Name]", "{{school}}", "<their topic>". */
const PLACEHOLDER = /\[[^\]]{2,40}\]|\{\{[^}]{2,40}\}\}|<[a-z][^>]{2,40}>/i

/**
 * Rae's house style: no double hyphens and no em or en dashes anywhere in
 * anything a person will read. It is the clearest AI tell she has.
 */
const BANNED_DASHES = /--|[–—]/

export function validateCandidate(
  draft: CandidateDraft,
  knownGapIds: Set<string>
): ValidationResult {
  const reasons: string[] = []

  const name = str(draft.name)
  if (name.length < 2) reasons.push('name missing')
  if (name.length > 120) reasons.push('name implausibly long')

  const gapId = str(draft.gap_id)
  if (!gapId) {
    reasons.push('not linked to a content gap')
  } else if (!knownGapIds.has(gapId)) {
    reasons.push('gap_id does not match an open gap')
  }

  // The verifiable artifact. A candidate we cannot look up is a candidate we
  // invented, so this is required even though email is not.
  const socialUrl = str(draft.social_url)
  if (!socialUrl) {
    reasons.push('no public profile URL to verify the person exists')
  } else if (!validUrl(socialUrl)) {
    reasons.push('social_url is not a usable http(s) URL')
  }

  // Email stays optional on purpose. Requiring one invites a guessed address,
  // and a bounced first contact is worse than Bella looking it up herself.
  const rawEmail = str(draft.email)
  let email: string | null = null
  if (rawEmail) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawEmail)) {
      email = rawEmail.toLowerCase()
    } else {
      reasons.push('email is present but malformed')
    }
  }

  const expertise = str(draft.expertise_area)
  if (!expertise) reasons.push('expertise_area missing')

  const whyGoodFit = str(draft.why_good_fit)
  if (whyGoodFit.length < MIN_FIT) {
    reasons.push(`why_good_fit too thin (needs ${MIN_FIT}+ characters of specific evidence)`)
  }

  const sourceDetail = str(draft.source_detail)
  if (!sourceDetail) reasons.push('source_detail missing (say where this person was found)')

  const draftText = str(draft.outreach_draft)
  if (draftText.length < MIN_DRAFT) {
    reasons.push('outreach_draft missing or too short to send')
  } else if (draftText.length > MAX_DRAFT) {
    reasons.push('outreach_draft too long for a first contact')
  } else {
    if (PLACEHOLDER.test(draftText)) reasons.push('outreach_draft still contains template placeholders')
    if (BANNED_DASHES.test(draftText)) reasons.push('outreach_draft contains dashes (house style)')
  }
  if (BANNED_DASHES.test(whyGoodFit)) reasons.push('why_good_fit contains dashes (house style)')

  const contentPath = str(draft.content_path)
  if (contentPath && !CONTENT_PATHS.includes(contentPath)) {
    reasons.push('content_path is not one of course, download, blog')
  }

  if (reasons.length > 0) return { ok: false, reasons }

  return {
    ok: true,
    candidate: {
      name,
      email,
      school_org: str(draft.school_org) || null,
      role: str(draft.role) || null,
      expertise_area: expertise,
      gap_id: gapId,
      content_path: contentPath || null,
      source: str(draft.source) || 'social_media',
      source_detail: sourceDetail,
      why_good_fit: whyGoodFit,
      social_url: socialUrl,
      outreach_draft: draftText,
    },
  }
}

/**
 * Pull the first JSON array out of a model response. The response also carries
 * prose and search citations, so a bare JSON.parse of the whole thing fails.
 */
export function extractJsonArray(text: string): unknown[] | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidates = [fenced?.[1], text]

  for (const chunk of candidates) {
    if (!chunk) continue
    const start = chunk.indexOf('[')
    const end = chunk.lastIndexOf(']')
    if (start === -1 || end <= start) continue
    try {
      const parsed = JSON.parse(chunk.slice(start, end + 1))
      if (Array.isArray(parsed)) return parsed
    } catch {
      // try the next candidate
    }
  }
  return null
}
