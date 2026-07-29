import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isTDIAdmin } from '@/lib/tdi-admin/auth-check'

export const maxDuration = 120 // AI evaluation can take time

const RUBRIC = `You are the TDI Executive Discovery Coach. You evaluate sales discovery call transcripts using a strict diagnostic rubric.

## SCORING DIMENSIONS (100 points total)

1. CALL FRAMING AND LEADERSHIP (5 points)
   - Did the advisor set an agenda, desired outcome, and time boundary?
   - Was there a collaborative opening that established the meeting purpose?
   - 5: Clear agenda, outcome, time boundary, and buyer agreement
   - 3: Partial framing (missing agenda or time boundary)
   - 1: No framing, jumped directly into questions or product

2. TRUST AND PSYCHOLOGICAL SAFETY (8 points)
   - Did the buyer disclose real complexity, constraints, prior failures, or uncertainty?
   - Did the advisor create space for candid sharing without becoming defensive?
   - 8: Buyer disclosed multiple layers of organizational reality
   - 5: Buyer shared some constraints but advisor didn't explore depth
   - 2: Surface-level exchange, no real disclosure

3. LISTENING AND FOLLOW-UP QUALITY (8 points)
   - Did the advisor ask follow-up questions based on what the buyer said?
   - Or did they shift to product positioning after hearing relevant keywords?
   - 8: Consistent follow-up that deepened understanding
   - 5: Some follow-up but frequently shifted to positioning
   - 2: Mostly product-focused responses to buyer statements

4. CURRENT-STATE DISCOVERY (10 points)
   - Did the advisor establish concrete examples of what is happening?
   - Frequency, scope, who is affected, what has been tried?
   - 10: Detailed current state with specific examples and scope
   - 6: General understanding but missing frequency or concrete examples
   - 3: Surface-level current state, no specifics

5. ROOT-CAUSE EXPLORATION (12 points)
   - Did the advisor investigate WHY prior approaches haven't worked?
   - Did they explore whether the constraint is knowledge, leadership, reinforcement, time, staffing, or something else?
   - 12: Clear exploration of why existing efforts have failed
   - 6: Acknowledged prior efforts but didn't investigate failure causes
   - 2: Skipped root-cause entirely, moved to solution

6. IMPACT, COST, AND URGENCY (12 points)
   - Did the advisor help the buyer articulate consequences of inaction?
   - Impact on: instructional time, teacher confidence, leadership time, student learning, staff retention, safety, family trust, implementation fatigue, opportunity cost
   - 12: Buyer articulated specific costs and consequences
   - 6: Impact discussed generally but not quantified or specified
   - 2: No impact or urgency established

7. DESIRED FUTURE STATE AND SUCCESS MEASURES (10 points)
   - Did the advisor establish what success looks like in measurable terms?
   - Baseline, observable indicators, ownership of measurement, review timing
   - 10: Measurable outcomes, timeline, and success criteria defined
   - 5: Broad goals mentioned but no measurable threshold
   - 2: No future state explored

8. EXECUTIVE DIAGNOSIS AND CAPABILITY (15 points)
   - Did the advisor state a coherent organizational-constraint hypothesis?
   - Did they test it with the buyer before prescribing?
   - 15: Clear hypothesis stated and tested with buyer validation
   - 8: Implied diagnosis but never stated or tested
   - 3: No diagnosis, moved directly to solution presentation

9. DECISION AND COMMERCIAL QUALIFICATION (10 points)
   - Did the advisor establish: who evaluates, what they evaluate, who approves, funding path, blockers, timeline, next steps?
   - 10: Clear decision path with authority, criteria, funding, timing
   - 5: Some qualification but missing key elements (authority, timing)
   - 2: No qualification beyond interest expressed

10. SYNTHESIS, RECOMMENDATION, AND NEXT STEP (10 points)
    - Did the advisor synthesize the diagnosis in buyer language?
    - Was there a specific, mutually owned next step with a date?
    - 10: Clear synthesis with diagnosis-to-recommendation logic and scheduled follow-up
    - 5: Next step agreed but no synthesis or recommendation logic
    - 2: Vague next steps ("let's keep in touch")

## A-GRADE GATES (all must be present for an A)
- Meaningful root-cause exploration
- Buyer-articulated impact or cost of inaction
- Buyer-validated diagnosis
- Defined future state or success condition
- Adequate decision-process exploration
- Specific, mutually owned next step with timing

## OPPORTUNITY READINESS SCORE (separate from execution)
Rate 0-100 how ready this opportunity is based on buyer engagement, problem severity, budget signals, and decision-maker presence.

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "scores": {
    "call_framing": { "score": 0, "max": 5, "evidence": "..." },
    "trust": { "score": 0, "max": 8, "evidence": "..." },
    "listening": { "score": 0, "max": 8, "evidence": "..." },
    "current_state": { "score": 0, "max": 10, "evidence": "..." },
    "root_cause": { "score": 0, "max": 12, "evidence": "..." },
    "impact_urgency": { "score": 0, "max": 12, "evidence": "..." },
    "future_state": { "score": 0, "max": 10, "evidence": "..." },
    "executive_diagnosis": { "score": 0, "max": 15, "evidence": "..." },
    "decision_qualification": { "score": 0, "max": 10, "evidence": "..." },
    "synthesis_next_step": { "score": 0, "max": 10, "evidence": "..." }
  },
  "total_score": 0,
  "grade": "A/B/C/D/F",
  "opportunity_readiness": 0,
  "missing_a_gates": ["..."],
  "executive_summary": "2-3 paragraph summary of the call",
  "strengths": [
    { "title": "...", "detail": "...", "timestamp": "..." }
  ],
  "limitations": [
    { "title": "...", "detail": "..." }
  ],
  "missed_moments": [
    { "timestamp": "...", "what_occurred": "...", "why_it_mattered": "...", "stronger_question": "..." }
  ],
  "five_questions_to_standardize": ["..."],
  "coaching_focus": "One sentence primary coaching priority"
}`

export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { transcript, prospectName, districtName } = await request.json()

    if (!transcript || transcript.trim().length < 200) {
      return NextResponse.json({ error: 'Transcript must be at least 200 characters' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: RUBRIC,
      messages: [{
        role: 'user',
        content: `Evaluate this discovery call transcript. Score it against every dimension of the rubric. Be a hard grader. Do not give confirmation bias.

Prospect: ${prospectName || 'Unknown'}
District: ${districtName || 'Not established'}

TRANSCRIPT:
${transcript.substring(0, 50000)}

Return ONLY the JSON object as specified in the rubric. No markdown fences, no commentary outside the JSON.`
      }],
    })

    const responseText = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')

    let evaluation
    try {
      const cleaned = responseText.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      evaluation = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON. Try again.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      evaluation,
      evaluatedAt: new Date().toISOString(),
      prospectName,
      districtName,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[sales-coach] Evaluation error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
