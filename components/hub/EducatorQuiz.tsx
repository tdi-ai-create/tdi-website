'use client'

import { useState } from 'react'
import { ChevronRight, Share2, RotateCcw } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────

type EducatorType = 'architect' | 'connector' | 'innovator' | 'anchor' | 'spark' | 'strategist'

interface QuizAnswer {
  text: string
  types: EducatorType[]
}

interface QuizQuestion {
  question: string
  answers: QuizAnswer[]
}

interface EducatorResult {
  type: EducatorType
  title: string
  subtitle: string
  description: string
  color: string
  bg: string
}

// ── Data ───────────────────────────────────────────────────────

const RESULTS: Record<EducatorType, EducatorResult> = {
  architect: {
    type: 'architect',
    title: 'The Architect',
    subtitle: 'You build systems that work.',
    description: 'Your classroom runs like a machine and your colleagues want your templates. You see the structure behind the chaos and you cannot help but organize it. The world needs more builders like you.',
    color: '#1B2A4A',
    bg: '#E8EDF4',
  },
  connector: {
    type: 'connector',
    title: 'The Connector',
    subtitle: 'Relationships first, always.',
    description: 'You know every kid by name, their dog by name, and what they had for breakfast. You build trust before you build lessons. Students remember you long after they forget the content -- and that is the point.',
    color: '#2A9D8F',
    bg: '#D1FAE5',
  },
  innovator: {
    type: 'innovator',
    title: 'The Innovator',
    subtitle: 'You tried it before anyone else.',
    description: 'Half your ideas are brilliant. The other half make great stories. You are the one who brings the new thing to the team meeting and somehow makes everyone want to try it. Education needs your restless creativity.',
    color: '#7C3AED',
    bg: '#F3E8FF',
  },
  anchor: {
    type: 'anchor',
    title: 'The Anchor',
    subtitle: 'The one everyone leans on.',
    description: 'Steady, reliable, the person who holds it together when everything is chaos. Your students feel safe because you are safe. Your team functions because you show up. Do not underestimate how rare that is.',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  spark: {
    type: 'spark',
    title: 'The Spark',
    subtitle: 'Energy. You bring it every day.',
    description: 'Your students do not know how you do it and honestly neither do you. You make hard things feel possible and boring things feel interesting. The room changes when you walk in -- and everyone knows it.',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  strategist: {
    type: 'strategist',
    title: 'The Strategist',
    subtitle: 'You see the big picture.',
    description: 'While everyone else is putting out fires, you are redesigning the system so fires stop starting. You think in frameworks, plan three steps ahead, and your team does not always realize how much you are carrying. They will.',
    color: '#0891B2',
    bg: '#E0F4FF',
  },
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: 'It is Monday morning. What is the first thing you do?',
    answers: [
      { text: 'Check my to-do list and prep materials for the week', types: ['architect', 'strategist'] },
      { text: 'Greet students at the door and check in on the ones I am worried about', types: ['connector', 'anchor'] },
      { text: 'Try out the new idea I thought of over the weekend', types: ['innovator', 'spark'] },
      { text: 'Rally my team with a quick huddle or a funny meme in the group chat', types: ['spark', 'connector'] },
    ],
  },
  {
    question: 'A new initiative drops from admin. Your reaction?',
    answers: [
      { text: 'Build a system to integrate it into what I already do', types: ['architect', 'strategist'] },
      { text: 'Think about how it will affect my students and talk to them about it', types: ['connector', 'anchor'] },
      { text: 'Get excited -- this could be interesting if I put my spin on it', types: ['innovator', 'spark'] },
      { text: 'Figure out the real goal behind it and find the most efficient path', types: ['strategist', 'architect'] },
    ],
  },
  {
    question: 'A student is struggling. Your instinct?',
    answers: [
      { text: 'Create a structured plan with checkpoints to get them back on track', types: ['architect'] },
      { text: 'Sit with them and ask what is going on outside of school', types: ['connector'] },
      { text: 'Try a completely different approach -- maybe what worked before is not working now', types: ['innovator'] },
      { text: 'Be the calm in their storm -- show up consistently so they know someone is in their corner', types: ['anchor'] },
    ],
  },
  {
    question: 'You have one free hour. You spend it on...',
    answers: [
      { text: 'Organizing my files, templates, or lesson plans', types: ['architect'] },
      { text: 'Writing a note to a student, parent, or colleague', types: ['connector'] },
      { text: 'Browsing ideas, podcasts, or something totally unrelated that might inspire a lesson', types: ['innovator', 'spark'] },
      { text: 'Planning ahead so next week is smoother than this one', types: ['strategist'] },
    ],
  },
  {
    question: 'Your colleagues describe you as...',
    answers: [
      { text: 'The most organized person in the building', types: ['architect'] },
      { text: 'The one who actually cares about every kid', types: ['connector', 'anchor'] },
      { text: 'The one with the wildest ideas that somehow work', types: ['innovator', 'spark'] },
      { text: 'The one who sees what needs to happen before anyone else does', types: ['strategist'] },
    ],
  },
]

// ── Component ──────────────────────────────────────────────────

interface EducatorQuizProps {
  onComplete?: (result: EducatorType) => void
}

export default function EducatorQuiz({ onComplete }: EducatorQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<EducatorType, number>>({
    architect: 0, connector: 0, innovator: 0, anchor: 0, spark: 0, strategist: 0,
  })
  const [result, setResult] = useState<EducatorResult | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  const handleAnswer = (answer: QuizAnswer, answerIdx: number) => {
    if (transitioning) return
    setSelectedAnswer(answerIdx)
    setTransitioning(true)

    const newScores = { ...scores }
    answer.types.forEach(t => { newScores[t] += 1 })
    setScores(newScores)

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setTransitioning(false)
      } else {
        // Find winner
        const winner = (Object.entries(newScores) as [EducatorType, number][])
          .sort((a, b) => b[1] - a[1])[0][0]
        setResult(RESULTS[winner])
        onComplete?.(winner)
      }
    }, 600)
  }

  const restart = () => {
    setCurrentQuestion(0)
    setScores({ architect: 0, connector: 0, innovator: 0, anchor: 0, spark: 0, strategist: 0 })
    setResult(null)
    setSelectedAnswer(null)
    setTransitioning(false)
  }

  // ── Result Screen ──
  if (result) {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 4px 16px rgba(27,42,74,0.08)' }}
      >
        <div className="p-8 text-center" style={{ background: result.bg }}>
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: result.color }}
          >
            <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {result.title.charAt(4)}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: result.color, fontFamily: "'DM Sans', sans-serif" }}>
            You are
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: result.color, fontFamily: "'Source Serif 4', serif" }}>
            {result.title}
          </h2>
          <p className="text-sm font-medium mb-4" style={{ color: result.color, opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}>
            {result.subtitle}
          </p>
        </div>
        <div className="bg-white p-6">
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
            {result.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const text = `I just took the TDI Educator Quiz and I am "${result.title}" -- ${result.subtitle} What kind of educator are you? teachersdeserveit.com/hub`
                navigator.clipboard.writeText(text).catch(() => {})
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: result.color, color: 'white', fontFamily: "'DM Sans', sans-serif" }}
            >
              <Share2 size={14} />
              Share My Result
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
            >
              <RotateCcw size={14} />
              Take It Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Question Screen ──
  const q = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion) / QUESTIONS.length) * 100

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 4px 16px rgba(27,42,74,0.08)' }}
    >
      {/* Progress bar */}
      <div style={{ height: 4, backgroundColor: '#F3F4F6' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#E8B84B',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      <div className="bg-white p-6">
        {/* Question counter */}
        <p className="text-xs font-medium mb-4" style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif" }}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </p>

        {/* Question */}
        <h3
          className="text-lg font-bold mb-6"
          style={{ color: '#1B2A4A', fontFamily: "'Source Serif 4', serif", lineHeight: 1.3 }}
        >
          {q.question}
        </h3>

        {/* Answers */}
        <div className="space-y-3">
          {q.answers.map((answer, idx) => {
            const isSelected = selectedAnswer === idx
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(answer, idx)}
                disabled={transitioning}
                className="w-full text-left p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: isSelected ? '#1B2A4A' : '#FAFAF8',
                  border: isSelected ? '1px solid #1B2A4A' : '1px solid #F3F4F6',
                  color: isSelected ? 'white' : '#374151',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  cursor: transitioning ? 'default' : 'pointer',
                  transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span>{answer.text}</span>
                  {isSelected && <ChevronRight size={16} style={{ color: '#E8B84B' }} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
