import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const TDI_EVALUATION_PROMPT = `You are an expert sales and customer success analyst for Teachers Deserve It (TDI), an education wellness company. Your role is to evaluate meeting transcripts to help TDI improve district relationships and increase renewal rates.

TDI's offerings include:
- ACCELERATE program: Teacher wellness and professional development
- The Hub: Online platform for educator resources
- Executive Impact Sessions: Leadership coaching for administrators
- Observation Days: In-person school visits and coaching
- Virtual Sessions: Remote professional development
- Love Notes: Appreciation and recognition programs

EVALUATION FRAMEWORK:

Score each dimension from 1-10 where:
- 1-3: Poor/Missing - Significant improvement needed
- 4-5: Below Average - Notable gaps
- 6-7: Average - Meeting basic expectations
- 8-9: Strong - Exceeding expectations
- 10: Exceptional - Best practice example

THE 7 DIMENSIONS:

1. RELATIONSHIP STRENGTH
   - Warmth and rapport in conversation
   - Personal connections referenced
   - Trust indicators (candor, vulnerability)
   - History/continuity acknowledged

2. VALUE DEMONSTRATION
   - Specific impact mentioned (data, stories, outcomes)
   - TDI services/programs referenced positively
   - ROI or benefits articulated
   - Comparison to alternatives

3. NEXT STEPS CLARITY
   - Clear action items identified
   - Ownership assigned
   - Timelines established
   - Follow-up scheduled

4. STAKEHOLDER ENGAGEMENT
   - Decision makers present/referenced
   - Multiple department buy-in
   - Champion identification
   - Influence mapping clues

5. OBJECTION HANDLING
   - Concerns raised and addressed
   - Budget discussions navigated
   - Timing/priority objections handled
   - Competition addressed

6. EXPANSION SIGNALS
   - Interest in additional services
   - Referral potential mentioned
   - Multi-year discussion
   - Scope expansion cues

7. RISK INDICATORS (inverse scoring - lower risk = higher score)
   - Budget concerns or constraints
   - Leadership changes mentioned
   - Dissatisfaction signals
   - Competing priorities
   - Non-renewal hints

OUTPUT FORMAT (respond in valid JSON only):

{
  "overall_score": <1-10>,
  "renewal_likelihood": "<high|medium|low|at_risk>",
  "executive_summary": "<2-3 sentence summary>",

  "dimensions": {
    "relationship": {
      "score": <1-10>,
      "feedback": "<1-2 sentences explaining score>",
      "quotes": ["<relevant quote 1>", "<relevant quote 2>"]
    },
    "value_demonstration": {
      "score": <1-10>,
      "feedback": "<1-2 sentences explaining score>",
      "quotes": ["<relevant quote 1>", "<relevant quote 2>"]
    },
    "next_steps": {
      "score": <1-10>,
      "feedback": "<1-2 sentences explaining score>",
      "quotes": ["<relevant quote 1>", "<relevant quote 2>"]
    },
    "stakeholder_engagement": {
      "score": <1-10>,
      "feedback": "<1-2 sentences explaining score>",
      "quotes": ["<relevant quote 1>", "<relevant quote 2>"]
    },
    "objection_handling": {
      "score": <1-10>,
      "feedback": "<1-2 sentences explaining score>",
      "quotes": ["<relevant quote 1>", "<relevant quote 2>"]
    },
    "expansion_signals": {
      "score": <1-10>,
      "feedback": "<1-2 sentences explaining score>",
      "quotes": ["<relevant quote 1>", "<relevant quote 2>"]
    },
    "risk_indicators": {
      "score": <1-10>,
      "feedback": "<1-2 sentences explaining score>",
      "quotes": ["<relevant quote 1>", "<relevant quote 2>"]
    }
  },

  "key_wins": ["<win 1>", "<win 2>", "<win 3>"],
  "areas_for_improvement": ["<area 1>", "<area 2>"],
  "action_items": [
    {"task": "<action>", "owner": "<who>", "deadline": "<when if mentioned>"}
  ]
}

IMPORTANT:
- Only include quotes that actually appear in the transcript
- If a dimension has insufficient evidence, give a lower score and note "insufficient evidence"
- Be constructive in feedback - focus on actionable improvements
- Flag any urgent risks that need immediate attention`

export async function POST(request: NextRequest) {
  try {
    const { meetingId, districtId, transcript } = await request.json()

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: 'Transcript is too short or missing' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server config error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: 'Server config error - missing Anthropic API key' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const anthropic = new Anthropic({ apiKey: anthropicApiKey })

    const wordCount = transcript.trim().split(/\s+/).length

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${TDI_EVALUATION_PROMPT}\n\n---\n\nMEETING TRANSCRIPT:\n\n${transcript}`,
        },
      ],
    })

    // Extract text response
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    // Parse JSON from response
    let evaluation
    try {
      // Handle potential markdown code blocks
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : responseText
      evaluation = JSON.parse(jsonStr.trim())
    } catch {
      console.error('[evaluate-meeting] Failed to parse Claude response:', responseText)
      return NextResponse.json(
        { error: 'Failed to parse AI evaluation response' },
        { status: 500 }
      )
    }

    // Map evaluation to database columns
    const evaluationRecord = {
      meeting_id: meetingId || null,
      district_id: districtId,
      overall_score: evaluation.overall_score,
      renewal_likelihood: evaluation.renewal_likelihood,
      executive_summary: evaluation.executive_summary,

      relationship_score: evaluation.dimensions?.relationship?.score,
      relationship_feedback: evaluation.dimensions?.relationship?.feedback,
      relationship_quotes: evaluation.dimensions?.relationship?.quotes || [],

      value_demonstration_score: evaluation.dimensions?.value_demonstration?.score,
      value_demonstration_feedback: evaluation.dimensions?.value_demonstration?.feedback,
      value_demonstration_quotes: evaluation.dimensions?.value_demonstration?.quotes || [],

      next_steps_score: evaluation.dimensions?.next_steps?.score,
      next_steps_feedback: evaluation.dimensions?.next_steps?.feedback,
      next_steps_quotes: evaluation.dimensions?.next_steps?.quotes || [],

      stakeholder_engagement_score: evaluation.dimensions?.stakeholder_engagement?.score,
      stakeholder_engagement_feedback: evaluation.dimensions?.stakeholder_engagement?.feedback,
      stakeholder_engagement_quotes: evaluation.dimensions?.stakeholder_engagement?.quotes || [],

      objection_handling_score: evaluation.dimensions?.objection_handling?.score,
      objection_handling_feedback: evaluation.dimensions?.objection_handling?.feedback,
      objection_handling_quotes: evaluation.dimensions?.objection_handling?.quotes || [],

      expansion_signals_score: evaluation.dimensions?.expansion_signals?.score,
      expansion_signals_feedback: evaluation.dimensions?.expansion_signals?.feedback,
      expansion_signals_quotes: evaluation.dimensions?.expansion_signals?.quotes || [],

      risk_indicators_score: evaluation.dimensions?.risk_indicators?.score,
      risk_indicators_feedback: evaluation.dimensions?.risk_indicators?.feedback,
      risk_indicators_quotes: evaluation.dimensions?.risk_indicators?.quotes || [],

      key_wins: evaluation.key_wins || [],
      areas_for_improvement: evaluation.areas_for_improvement || [],
      action_items: evaluation.action_items || [],

      transcript_word_count: wordCount,
      model_used: 'claude-sonnet-4-20250514',
    }

    // Insert into database
    const { data: savedEvaluation, error: insertError } = await supabase
      .from('meeting_evaluations')
      .insert(evaluationRecord)
      .select()
      .single()

    if (insertError) {
      console.error('[evaluate-meeting] Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save evaluation', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      evaluation: savedEvaluation,
    })
  } catch (error) {
    console.error('[evaluate-meeting] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate meeting transcript' },
      { status: 500 }
    )
  }
}
