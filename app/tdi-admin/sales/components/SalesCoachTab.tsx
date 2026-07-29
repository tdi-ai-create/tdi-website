'use client'

import { useState } from 'react'
import { useTDIAdmin } from '@/lib/tdi-admin/context'
import {
  TYPE_SECTION_HEADER,
  TYPE_STAT_VALUE,
  TYPE_CARD_TITLE,
} from '@/components/tdi-admin/ui/design-tokens'

interface DimensionScore {
  score: number
  max: number
  evidence: string
}

interface MissedMoment {
  timestamp: string
  what_occurred: string
  why_it_mattered: string
  stronger_question: string
}

interface Strength {
  title: string
  detail: string
  timestamp?: string
}

interface Limitation {
  title: string
  detail: string
}

interface Evaluation {
  scores: Record<string, DimensionScore>
  total_score: number
  grade: string
  opportunity_readiness: number
  missing_a_gates: string[]
  executive_summary: string
  strengths: Strength[]
  limitations: Limitation[]
  missed_moments: MissedMoment[]
  five_questions_to_standardize: string[]
  coaching_focus: string
}

const DIMENSION_LABELS: Record<string, string> = {
  call_framing: 'Call Framing & Leadership',
  trust: 'Trust & Psychological Safety',
  listening: 'Listening & Follow-up',
  current_state: 'Current-State Discovery',
  root_cause: 'Root-Cause Exploration',
  impact_urgency: 'Impact, Cost & Urgency',
  future_state: 'Future State & Success',
  executive_diagnosis: 'Executive Diagnosis',
  decision_qualification: 'Decision Qualification',
  synthesis_next_step: 'Synthesis & Next Step',
}

function getGradeColor(grade: string): string {
  if (grade === 'A') return '#10B981'
  if (grade === 'B') return '#3B82F6'
  if (grade === 'C') return '#F59E0B'
  if (grade === 'D') return '#EF4444'
  return '#DC2626'
}

function getScoreColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.8) return '#10B981'
  if (pct >= 0.6) return '#3B82F6'
  if (pct >= 0.4) return '#F59E0B'
  return '#EF4444'
}

export default function SalesCoachTab() {
  const { teamMember } = useTDIAdmin()
  const [transcript, setTranscript] = useState('')
  const [prospectName, setProspectName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [error, setError] = useState('')

  const handleEvaluate = async () => {
    if (!transcript.trim() || transcript.trim().length < 200) {
      setError('Paste a full transcript (at least 200 characters)')
      return
    }
    setIsEvaluating(true)
    setError('')
    setEvaluation(null)

    try {
      const res = await fetch('/api/tdi-admin/sales-coach/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': teamMember?.email || '',
        },
        body: JSON.stringify({ transcript, prospectName, districtName }),
      })

      const data = await res.json()
      if (data.success) {
        setEvaluation(data.evaluation)
      } else {
        setError(data.error || 'Evaluation failed')
      }
    } catch (err) {
      setError('Network error. Try again.')
    } finally {
      setIsEvaluating(false)
    }
  }

  // Pre-call checklist (Omar's 5 questions)
  const PRE_CALL_QUESTIONS = [
    "You already have several supports in place. Where does implementation actually break down?",
    "Can you give me a recent example of the problem and what it caused for staff, students, or leadership?",
    "Why do you think the approaches you have already tried have not produced consistent results?",
    "Let me test a hypothesis: is the constraint less about access to resources and more about consistent expectations, application, and feedback? What am I missing?",
    "Six months from now, what would people be doing differently if this worked?",
  ]

  const EVIDENCE_GATES = [
    "One concrete current-state example",
    "One explanation for why prior efforts have not worked",
    "One explicit consequence of the current condition",
    "One observable future-state success indicator",
  ]

  return (
    <div>
      {/* Pre-Call Section */}
      <div className="mb-8">
        <h3 style={TYPE_SECTION_HEADER} className="mb-4">Pre-Call Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="font-bold text-sm text-amber-900 mb-3">5 Diagnostic Questions</h4>
            <ol className="space-y-2">
              {PRE_CALL_QUESTIONS.map((q, i) => (
                <li key={i} className="text-sm text-amber-800 flex gap-2">
                  <span className="font-bold text-amber-600 flex-shrink-0">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="font-bold text-sm text-blue-900 mb-3">4 Evidence Gates (before prescribing TDI)</h4>
            <p className="text-xs text-blue-700 mb-3">Do NOT explain, show, or recommend TDI until the buyer has provided:</p>
            <ol className="space-y-2">
              {EVIDENCE_GATES.map((g, i) => (
                <li key={i} className="text-sm text-blue-800 flex gap-2">
                  <span className="font-bold text-blue-600 flex-shrink-0">{i + 1}.</span>
                  <span>{g}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs text-blue-600 mt-3 font-medium">Then state one organizational-constraint hypothesis and ask the buyer to correct it.</p>
          </div>
        </div>
      </div>

      {/* Evaluate Section */}
      <div className="mb-8">
        <h3 style={TYPE_SECTION_HEADER} className="mb-4">Evaluate a Call</h3>
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prospect Name</label>
              <input
                type="text"
                value={prospectName}
                onChange={e => setProspectName(e.target.value)}
                placeholder="e.g., Heather Rockwell"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">District / Organization</label>
              <input
                type="text"
                value={districtName}
                onChange={e => setDistrictName(e.target.value)}
                placeholder="e.g., Morenci USD"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Paste Read AI Transcript</label>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Paste the full meeting transcript here..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              style={{ resize: 'vertical' }}
            />
            <p className="text-xs text-gray-400 mt-1">{transcript.length.toLocaleString()} characters</p>
          </div>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="px-6 py-3 rounded-lg text-sm font-bold"
            style={{
              background: isEvaluating ? '#9CA3AF' : '#0a0f1e',
              color: 'white',
              border: 'none',
              cursor: isEvaluating ? 'not-allowed' : 'pointer',
            }}
          >
            {isEvaluating ? 'Evaluating... (30-60 seconds)' : 'Evaluate Call'}
          </button>
        </div>
      </div>

      {/* Results */}
      {evaluation && (
        <div className="space-y-6">
          {/* Top-level scores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p className="text-5xl font-bold" style={{ color: getGradeColor(evaluation.grade) }}>{evaluation.total_score}</p>
              <p className="text-sm text-gray-500 mt-1">Advisor Execution</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p className="text-5xl font-bold" style={{ color: getGradeColor(evaluation.grade) }}>{evaluation.grade}</p>
              <p className="text-sm text-gray-500 mt-1">Grade</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p className="text-5xl font-bold" style={{ color: '#3B82F6' }}>{evaluation.opportunity_readiness}</p>
              <p className="text-sm text-gray-500 mt-1">Opportunity Readiness</p>
            </div>
          </div>

          {/* Coaching Focus */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm font-bold text-amber-900 mb-1">Primary Coaching Focus</p>
            <p className="text-sm text-amber-800">{evaluation.coaching_focus}</p>
          </div>

          {/* Executive Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h4 style={TYPE_CARD_TITLE} className="mb-3">Executive Summary</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{evaluation.executive_summary}</p>
          </div>

          {/* Scorecard */}
          <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h4 style={TYPE_CARD_TITLE} className="mb-4">Scorecard</h4>
            <div className="space-y-3">
              {Object.entries(evaluation.scores).map(([key, dim]) => (
                <div key={key} className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-48 flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{DIMENSION_LABELS[key] || key}</p>
                    <p className="text-xs font-bold mt-1" style={{ color: getScoreColor(dim.score, dim.max) }}>
                      {dim.score}/{dim.max}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(dim.score / dim.max) * 100}%`,
                          background: getScoreColor(dim.score, dim.max),
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">{dim.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing A-Grade Gates */}
          {evaluation.missing_a_gates && evaluation.missing_a_gates.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <h4 className="text-sm font-bold text-red-900 mb-2">Missing A-Grade Gates</h4>
              <ul className="space-y-1">
                {evaluation.missing_a_gates.map((gate, i) => (
                  <li key={i} className="text-sm text-red-700 flex gap-2">
                    <span className="text-red-400">x</span>
                    <span>{gate}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {evaluation.strengths && evaluation.strengths.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h4 style={TYPE_CARD_TITLE} className="mb-3">What the Advisor Did Well</h4>
              <div className="space-y-4">
                {evaluation.strengths.map((s, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-green-800">{s.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{s.detail}</p>
                    {s.timestamp && <p className="text-xs text-gray-400 mt-1">At {s.timestamp}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations */}
          {evaluation.limitations && evaluation.limitations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h4 style={TYPE_CARD_TITLE} className="mb-3">What Limited the Call</h4>
              <div className="space-y-4">
                {evaluation.limitations.map((l, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold text-red-800">{l.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{l.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missed Moments */}
          {evaluation.missed_moments && evaluation.missed_moments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h4 style={TYPE_CARD_TITLE} className="mb-3">High-Leverage Missed Moments</h4>
              <div className="space-y-5">
                {evaluation.missed_moments.map((m, i) => (
                  <div key={i} className="border-l-2 border-amber-400 pl-4">
                    {m.timestamp && <p className="text-xs font-bold text-amber-600 mb-1">{m.timestamp}</p>}
                    <p className="text-sm text-gray-800 mb-1"><strong>What occurred:</strong> {m.what_occurred}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Why it mattered:</strong> {m.why_it_mattered}</p>
                    <p className="text-sm text-green-700"><strong>Stronger question:</strong> "{m.stronger_question}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standardized Questions */}
          {evaluation.five_questions_to_standardize && evaluation.five_questions_to_standardize.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h4 className="text-sm font-bold text-blue-900 mb-3">Stronger Questions for This Call</h4>
              <ol className="space-y-2">
                {evaluation.five_questions_to_standardize.map((q, i) => (
                  <li key={i} className="text-sm text-blue-800 flex gap-2">
                    <span className="font-bold text-blue-600 flex-shrink-0">{i + 1}.</span>
                    <span>"{q}"</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
