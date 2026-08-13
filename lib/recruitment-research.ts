import Anthropic from '@anthropic-ai/sdk'
import { extractJsonArray } from './recruitment-quality'

/**
 * The research half of the recruitment loop: given open content gaps, find real
 * educators who could fill them.
 *
 * The prompt lives here rather than in the route so the scheduled job and the
 * dry-run script (scripts/test-recruitment-research.ts) cannot drift apart. If
 * you change the prompt, re-run the dry run before shipping it.
 */

export const WEEKLY_TARGET = 5
export const MAX_GAPS_PER_RUN = 4
// Each pause_turn is another round trip. Search-heavy turns pause often, so
// allow several, but never loop unbounded on a turn that will not settle.
const MAX_CONTINUATIONS = 6

export type OpenGap = {
  id: string
  category: string
  priority: string
  hub_course_count: number | null
  hub_quick_win_count: number | null
  recommended_content_path: string | null
  candidate_count: number
}

export function buildResearchPrompt(
  gaps: OpenGap[],
  needed: number,
  avoidNames: string[] = []
): string {
  const gapLines = gaps
    .map(
      g =>
        `- gap_id: ${g.id}\n  category: ${g.category}\n  priority: ${g.priority}\n  published Hub content: ${g.hub_course_count ?? 0} courses, ${g.hub_quick_win_count ?? 0} quick wins\n  recommended content path: ${g.recommended_content_path || 'undecided'}\n  candidates already in pipeline: ${g.candidate_count}`
    )
    .join('\n')

  const avoid = avoidNames.length
    ? `\n\nAlready in the pipeline, do not suggest these people again:\n${avoidNames.map(n => `- ${n}`).join('\n')}`
    : ''

  return `You are researching potential content creators for Teachers Deserve It, a professional development company for K12 educators. TDI publishes courses and downloadable resources written by practicing educators, on a 50/50 revenue share, with TDI handling production.

Find ${needed} real educators who could create content for these open gaps in the TDI Learning Hub catalog:

${gapLines}${avoid}

## How to search

Use web search. Look for practicing or recently practicing K12 educators who publish about these topics: teachers with a real public presence on Instagram, TikTok, LinkedIn, YouTube, a personal site, a blog, or a published book. Search several different ways per gap rather than taking the first result.

## Absolute requirements

Every person you return must be someone you actually found in search results and can point to.

1. **Never invent a person.** If you cannot find enough good candidates, return fewer. Returning three real people is a success. Returning five with two invented is a failure.
2. **Never invent an email address.** Leave email null unless the address appeared in a search result you actually read. A guessed address means Bella emails a stranger or nobody.
3. **social_url must be a real, working URL you saw in search results.** This is how a human verifies the person exists. Do not construct a plausible looking profile URL.
4. **why_good_fit must cite what you actually saw.** Say what they publish and where, in concrete terms. Do not write generic praise.
5. Prefer educators with demonstrated teaching expertise over follower count. A thoughtful teacher with 2,000 engaged followers is a better creator than a viral account with no classroom depth.
6. Do not suggest anyone who appears to be a full time influencer with no teaching background, a commercial curriculum brand, or a company account.

## The outreach draft

Write the first contact message TDI would send. A human named Bella reviews and sends it, so write it in her voice as a warm, specific note from a real person.

- 3 to 5 sentences.
- Reference their actual work specifically. Generic outreach gets ignored.
- Be honest about the model: 50/50 revenue share, TDI handles production, they bring the expertise.
- Match the ask to the commitment. For someone who has never heard of TDI, invite them to a downloadable resource, not a six month course.
- Sign off as "The TDI Team" on its own line.
- **Never use double hyphens, em dashes, or en dashes.** Use periods and commas. This rule is absolute.
- No placeholder brackets. Write the finished text.

## Output

Return ONLY a JSON array, in a \`\`\`json fenced block, with no prose before or after it. Each element:

{
  "name": "full name as published",
  "email": null,
  "school_org": "school or organization, or null",
  "role": "their role, e.g. 5th Grade Teacher, Instructional Coach",
  "expertise_area": "specific expertise, not the gap name",
  "gap_id": "the exact gap_id from the list above",
  "content_path": "course, download, or blog",
  "source": "social_media",
  "source_detail": "where you found them and what you read, specifically",
  "why_good_fit": "concrete evidence from what you found, at least two sentences",
  "social_url": "the real URL you found",
  "outreach_draft": "the full message"
}

If you found fewer than ${needed} people who genuinely meet the bar, return only the ones who do.`
}

export type ResearchResult = {
  raw: unknown[]
  searches: number
}

export async function researchCandidates(
  gaps: OpenGap[],
  needed: number,
  avoidNames: string[] = []
): Promise<ResearchResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: buildResearchPrompt(gaps, needed, avoidNames) },
  ]

  let searches = 0
  let text = ''
  let settled = false

  for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 16000,
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 24 }],
      messages,
    })

    for (const block of response.content) {
      if (block.type === 'text') text += block.text
      // Counting searches lets a run that found nobody be told apart from a run
      // where search never happened at all.
      if (block.type === 'server_tool_use') searches++
    }

    // A safety decline is an outcome, not a transient error to retry into.
    if (response.stop_reason === 'refusal') {
      throw new Error('Model declined the research request')
    }

    // Server-side search hit its per-turn iteration cap. Append the turn and
    // re-send; the server resumes on its own. Do not add a "continue" message.
    if (response.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: response.content })
      text = ''
      continue
    }

    settled = true
    break
  }

  if (!settled) {
    throw new Error(`Research did not settle after ${MAX_CONTINUATIONS} continuations`)
  }

  const raw = extractJsonArray(text)
  if (!raw) {
    throw new Error('Could not parse a candidate list from the research response')
  }

  return { raw, searches }
}
