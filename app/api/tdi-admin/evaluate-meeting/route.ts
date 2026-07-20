import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

const DIMENSION_KEYS = [
  'relationship',
  'value_demonstration',
  'next_steps',
  'stakeholder_engagement',
  'objection_handling',
  'expansion_signals',
  'risk_indicators',
] as const

type DimensionKey = (typeof DIMENSION_KEYS)[number]

interface DimensionScore {
  score: number
  feedback: string
  quotes: string[]
}

interface EvaluationRequest {
  meetingId?: string
  districtId: string
  transcript: string
  scores: Record<DimensionKey, DimensionScore>
  key_wins: string[]
  areas_for_improvement: string[]
  action_items: Array<{ task: string; owner: string; deadline?: string }>
}

function validateScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 10
}

function computeRenewalLikelihood(overallScore: number): string {
  if (overallScore > 7) return 'high'
  if (overallScore > 5) return 'medium'
  if (overallScore > 3) return 'low'
  return 'at_risk'
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth()
    if (auth instanceof NextResponse) return auth

    const body: EvaluationRequest = await request.json()
    const { meetingId, districtId, transcript, scores, key_wins, areas_for_improvement, action_items } = body

    if (!districtId) {
      return NextResponse.json(
        { error: 'districtId is required' },
        { status: 400 }
      )
    }

    if (!scores || typeof scores !== 'object') {
      return NextResponse.json(
        { error: 'scores object is required' },
        { status: 400 }
      )
    }

    // Validate all 7 dimension scores exist and are between 1-10
    for (const key of DIMENSION_KEYS) {
      const dimension = scores[key]
      if (!dimension) {
        return NextResponse.json(
          { error: `Missing score for dimension: ${key}` },
          { status: 400 }
        )
      }
      if (!validateScore(dimension.score)) {
        return NextResponse.json(
          { error: `Score for ${key} must be a number between 1 and 10` },
          { status: 400 }
        )
      }
      if (typeof dimension.feedback !== 'string') {
        return NextResponse.json(
          { error: `Feedback for ${key} must be a string` },
          { status: 400 }
        )
      }
      if (!Array.isArray(dimension.quotes)) {
        return NextResponse.json(
          { error: `Quotes for ${key} must be an array` },
          { status: 400 }
        )
      }
    }

    // Calculate overall score as the average of all 7 dimensions
    const totalScore = DIMENSION_KEYS.reduce((sum, key) => sum + scores[key].score, 0)
    const overallScore = Math.round((totalScore / DIMENSION_KEYS.length) * 10) / 10

    const renewalLikelihood = computeRenewalLikelihood(overallScore)

    const wordCount = transcript ? transcript.trim().split(/\s+/).length : 0

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server config error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const evaluationRecord = {
      meeting_id: meetingId || null,
      district_id: districtId,
      overall_score: overallScore,
      renewal_likelihood: renewalLikelihood,
      executive_summary: `Manual evaluation with overall score ${overallScore}/10. Renewal likelihood: ${renewalLikelihood}.`,

      relationship_score: scores.relationship.score,
      relationship_feedback: scores.relationship.feedback,
      relationship_quotes: scores.relationship.quotes,

      value_demonstration_score: scores.value_demonstration.score,
      value_demonstration_feedback: scores.value_demonstration.feedback,
      value_demonstration_quotes: scores.value_demonstration.quotes,

      next_steps_score: scores.next_steps.score,
      next_steps_feedback: scores.next_steps.feedback,
      next_steps_quotes: scores.next_steps.quotes,

      stakeholder_engagement_score: scores.stakeholder_engagement.score,
      stakeholder_engagement_feedback: scores.stakeholder_engagement.feedback,
      stakeholder_engagement_quotes: scores.stakeholder_engagement.quotes,

      objection_handling_score: scores.objection_handling.score,
      objection_handling_feedback: scores.objection_handling.feedback,
      objection_handling_quotes: scores.objection_handling.quotes,

      expansion_signals_score: scores.expansion_signals.score,
      expansion_signals_feedback: scores.expansion_signals.feedback,
      expansion_signals_quotes: scores.expansion_signals.quotes,

      risk_indicators_score: scores.risk_indicators.score,
      risk_indicators_feedback: scores.risk_indicators.feedback,
      risk_indicators_quotes: scores.risk_indicators.quotes,

      key_wins: key_wins || [],
      areas_for_improvement: areas_for_improvement || [],
      action_items: action_items || [],

      transcript_word_count: wordCount,
      model_used: 'manual_rubric',
    }

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
      { error: 'Failed to save meeting evaluation' },
      { status: 500 }
    )
  }
}
