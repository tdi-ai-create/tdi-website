import Anthropic from '@anthropic-ai/sdk';
import type { EnrichmentData, CreateLeadInput } from '@/types/leads';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const TDI_PARTNERS_CONTEXT = `
TDI's existing partner districts (for geographic proximity scoring):
- Allenwood Elementary (NJ) - Dr. Sharon H. Porter
- ASD4 / Addison School District 4 (IL) - Katie Purse, Janet Diaz
- WEGO District 94 (IL) - Juan Suarez, Megan Payleitner
- Saunemin CCSD #438 (IL) - Gary Doughan
- Glen Ellyn D41 (IL) - Dee Neukirch
- TCCS / Tidioute Community Charter School (PA) - Melissa Mahaney
- St. Peter Chanel - Paula Poche
- Roosevelt School (pilot) - Jack Lipari
Plus 21+ other states with partner activity.
`;

export const RESEARCH_PROMPT = (input: CreateLeadInput) => `
You are a sales intelligence researcher for Teachers Deserve It (TDI),
an educator sustainability and professional development organization.
TDI partners with school districts to reduce educator burnout, improve
retention, and provide personalized PD - especially for paraprofessionals
and special education staff. TDI's signature service is "Love Notes" -
same-day personalized feedback emails sent to staff after observation visits.

A new lead has been added to TDI's pipeline:
- District/School: ${input.district_name}
- State: ${input.state_code || 'unknown'}
- Contact: ${input.contact_name || 'unknown'}, ${input.contact_role || 'unknown role'}
- Source: ${input.source}
- Notes from sales rep: ${input.notes || 'none'}

Research this district using web search and produce a strategic
intelligence brief.

${TDI_PARTNERS_CONTEXT}

CRITICAL RULES:
1. Never fabricate data. If you cannot find information through web search,
   return null for that field. Honest gaps are more valuable than invented data.
2. Every factual claim must have a source URL in the relevant sources array.
3. The strategic_brief must be suggestive not directive - use "Consider
   opening with..." not "Pitch them on...".
4. Score honestly. A low score that's accurate is more valuable than an
   inflated one. Components sum to 100.
5. If the district name is ambiguous (multiple districts match), note this
   in data_quality_note and research the most likely match given state context.

Return ONLY a valid JSON object matching this exact structure (no markdown,
no commentary, no code fences):

{
  "district_profile": {
    "enrollment": number_or_null,
    "num_schools": number_or_null,
    "num_teachers_estimate": number_or_null,
    "demographics": {
      "frl_percent": number_or_null,
      "el_percent": number_or_null,
      "sped_percent": number_or_null
    },
    "title_i_status": "string_or_null",
    "state_rating": "string_or_null",
    "per_pupil_spending": "string_or_null",
    "sources": ["url1", "url2"]
  },
  "decision_maker": {
    "superintendent_name": "string_or_null",
    "tenure_start": "year_or_null",
    "prior_districts": ["district1"],
    "public_priorities": ["priority statement 1", "priority statement 2"],
    "burnout_or_retention_signals": ["signal 1"],
    "sources": ["url1"]
  },
  "funding_signals": {
    "esser_status": "string_or_null",
    "title_i_estimate": "string_or_null",
    "recent_grants": ["grant 1"],
    "local_education_foundation": "string_or_null",
    "sources": ["url1"]
  },
  "warmth_signals": {
    "geographic_proximity_to_tdi_partners": "Description of proximity",
    "iasa_member": true_false_or_null,
    "podcast_or_linkedin_connection": "string_or_null",
    "notes": "Any additional warmth context"
  },
  "scoring": {
    "fit_score": 0_to_25,
    "pain_score": 0_to_25,
    "funding_score": 0_to_25,
    "warmth_score": 0_to_25,
    "rationale": {
      "fit": "one sentence",
      "pain": "one sentence",
      "funding": "one sentence",
      "warmth": "one sentence"
    }
  },
  "strategic_brief": "3-4 sentences. What this lead matters for TDI, what to lead with in first conversation, who to call first, and the warmest opening.",
  "data_quality_note": "If significant info was unavailable, note it here."
}
`;

export async function enrichLead(input: CreateLeadInput): Promise<{
  success: boolean;
  data?: EnrichmentData;
  error?: string;
  rawResponse?: any;
}> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        } as any,
      ],
      messages: [
        {
          role: 'user',
          content: RESEARCH_PROMPT(input),
        },
      ],
    });

    // Extract the final text block (after web search results)
    const textBlocks = response.content.filter(
      (block: any) => block.type === 'text'
    ) as any[];

    if (textBlocks.length === 0) {
      return {
        success: false,
        error: 'No text response from Claude',
        rawResponse: response,
      };
    }

    // The final text block should contain the JSON
    const finalText = textBlocks[textBlocks.length - 1].text;

    // Strip any markdown fences if present
    const cleaned = finalText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: EnrichmentData;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return {
        success: false,
        error: `JSON parse failed: ${(parseErr as Error).message}`,
        rawResponse: { textReceived: cleaned, fullResponse: response },
      };
    }

    // Validate critical fields exist
    if (!parsed.scoring || !parsed.strategic_brief) {
      return {
        success: false,
        error: 'Missing required fields (scoring or strategic_brief)',
        rawResponse: parsed,
      };
    }

    return {
      success: true,
      data: parsed,
      rawResponse: response,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
      rawResponse: null,
    };
  }
}

export function calculateTotalScore(breakdown: {
  fit_score: number;
  pain_score: number;
  funding_score: number;
  warmth_score: number;
}): number {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        breakdown.fit_score +
          breakdown.pain_score +
          breakdown.funding_score +
          breakdown.warmth_score
      )
    )
  );
}
