'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { getNextQuestion, scoreResponse, type CheckInQuestion } from '@/lib/hub/checkInQuestions'
import { useHub } from '@/components/hub/HubContext'
import { useTranslation } from '@/lib/hub/useTranslation'

interface CheckInSlideUpProps {
  onDismiss: () => void
}

export default function CheckInSlideUp({ onDismiss }: CheckInSlideUpProps) {
  const { user } = useHub()
  const { tUI } = useTranslation()
  const [question, setQuestion] = useState<CheckInQuestion | null>(null)
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>([])
  const [blankValue, setBlankValue] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    loadQuestion()
  }, [user?.id])

  async function loadQuestion() {
    const supabase = getSupabase()

    // Find the last question this user answered
    const { data } = await supabase
      .from('hub_assessments')
      .select('question_id')
      .eq('user_id', user!.id)
      .eq('type', 'daily_check_in')
      .order('created_at', { ascending: false })
      .limit(1)

    const lastQuestionId = data?.[0]?.question_id ?? null
    setQuestion(getNextQuestion(lastQuestionId))
  }

  function handleSelect(value: string | number) {
    if (!question) return

    if (question.responseType === 'word_cloud') {
      const max = question.maxSelect ?? 3
      setSelectedValues(prev => {
        if (prev.includes(value)) return prev.filter(v => v !== value)
        if (prev.length >= max) return prev
        return [...prev, value]
      })
      return
    }

    if (question.responseType === 'two_choice' && question.options && question.options.length > 2) {
      setSelectedValues([value])
      return
    }

    // For two_choice with 2 options, emoji_tap, number_scale - single select
    setSelectedValues([value])
  }

  function handleBlankSelect(value: string) {
    setBlankValue(value)
    setSelectedValues([value])
  }

  async function handleSubmit() {
    if (!question || !user?.id || isSubmitting) return
    if (selectedValues.length === 0) return

    setIsSubmitting(true)

    const primaryValue = selectedValues[0]
    const score = scoreResponse(question, primaryValue)

    const supabase = getSupabase()
    await supabase.from('hub_assessments').insert({
      user_id: user.id,
      type: 'daily_check_in',
      question_id: question.id,
      question_category: question.category,
      response_type: question.responseType,
      stress_score: score,
      response_text: typeof primaryValue === 'string' ? primaryValue : String(primaryValue),
      response_words: question.responseType === 'word_cloud'
        ? selectedValues.map(String)
        : null,
      responses: {
        question_id: question.id,
        selected: selectedValues,
      },
    })

    setIsDone(true)
    setTimeout(onDismiss, 1800)
  }

  // Color scale submits immediately on tap
  async function handleColorTap(value: number) {
    if (!question || !user?.id || isSubmitting) return
    setIsSubmitting(true)
    setSelectedValues([value])

    const supabase = getSupabase()
    await supabase.from('hub_assessments').insert({
      user_id: user.id,
      type: 'daily_check_in',
      question_id: question.id,
      question_category: question.category,
      response_type: question.responseType,
      stress_score: value,
      response_text: String(value),
      responses: { question_id: question.id, selected: [value] },
    })

    setIsDone(true)
    setTimeout(onDismiss, 1800)
  }

  const canSubmit = selectedValues.length > 0 && !isSubmitting

  if (!question) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(15,20,35,0.5)' }}
        onClick={onDismiss}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
        style={{ padding: '0 0 0 0' }}
      >
        <div
          className="w-full bg-white"
          style={{
            borderRadius: '24px 24px 0 0',
            maxWidth: '520px',
            padding: '20px 28px 40px',
            position: 'relative',
          }}
        >
          {/* Handle */}
          <div
            className="mx-auto mb-6"
            style={{ width: '36px', height: '4px', background: '#E5E7EB', borderRadius: '2px' }}
          />

          {/* Skip button */}
          <button
            onClick={onDismiss}
            className="absolute top-5 right-6 text-xs font-medium"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
          >
            {tUI('Skip for today')}
          </button>

          {isDone ? (
            /* Completion state */
            <div className="text-center py-8">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#DCFCE7' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div className="text-lg font-bold mb-1" style={{ color: '#1B2A4A' }}>
                {tUI('Thanks for checking in.')}
              </div>
              <div className="text-sm" style={{ color: '#9CA3AF' }}>{tUI('Have a great session.')}</div>
            </div>
          ) : (
            <>
              {/* Question label */}
              <div
                className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: '#9CA3AF', letterSpacing: '0.1em' }}
              >
                {tUI('Daily check-in')}
              </div>

              {/* Question text */}
              <div
                className="font-bold mb-6 leading-snug"
                style={{ fontSize: '18px', color: '#1B2A4A' }}
              >
                {question.question}
              </div>

              {/* RESPONSE: Color scale - submit on tap */}
              {question.responseType === 'color_scale' && (
                <div className="flex gap-2">
                  {question.options?.map(opt => (
                    <button
                      key={String(opt.value)}
                      onClick={() => handleColorTap(opt.value as number)}
                      disabled={isSubmitting}
                      className="flex-1 font-semibold transition-all disabled:opacity-50"
                      style={{
                        height: '52px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        background: opt.color,
                        color: opt.textColor,
                        letterSpacing: '0.02em',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* RESPONSE: Emoji tap */}
              {question.responseType === 'emoji_tap' && (
                <>
                  <div className="flex gap-2 mb-5">
                    {question.options?.map(opt => (
                      <button
                        key={String(opt.value)}
                        onClick={() => handleSelect(opt.value)}
                        className="flex-1 transition-all"
                        style={{
                          padding: '12px 4px 10px',
                          borderRadius: '12px',
                          border: selectedValues.includes(opt.value)
                            ? '2px solid #1B2A4A'
                            : '1.5px solid #E9E7E2',
                          cursor: 'pointer',
                          background: selectedValues.includes(opt.value) ? '#1B2A4A' : '#FAFAF8',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        onMouseEnter={e => { if (!selectedValues.includes(opt.value)) e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <span style={{ fontSize: '22px', lineHeight: 1 }}>{opt.emoji}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: selectedValues.includes(opt.value) ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                          letterSpacing: '0.02em',
                        }}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full font-bold transition-all"
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '14px',
                      color: '#fff',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      background: '#1B2A4A',
                      opacity: canSubmit ? 1 : 0.4,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {tUI('Done')}
                  </button>
                </>
              )}

              {/* RESPONSE: Word cloud */}
              {question.responseType === 'word_cloud' && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.options?.map(opt => (
                      <button
                        key={String(opt.value)}
                        onClick={() => handleSelect(opt.value)}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '20px',
                          border: selectedValues.includes(opt.value)
                            ? '1.5px solid #1B2A4A'
                            : '1.5px solid #E9E7E2',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          background: selectedValues.includes(opt.value) ? '#1B2A4A' : '#FAFAF8',
                          color: selectedValues.includes(opt.value) ? '#fff' : '#374151',
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {question.hint && (
                    <div className="text-xs mb-4" style={{ color: '#9CA3AF' }}>{question.hint}</div>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full font-bold"
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '14px',
                      color: '#fff',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      background: '#1B2A4A',
                      opacity: canSubmit ? 1 : 0.4,
                    }}
                  >
                    {tUI('Done')}
                  </button>
                </>
              )}

              {/* RESPONSE: Fill in blank */}
              {question.responseType === 'fill_blank' && (
                <>
                  <div
                    className="mb-4 font-medium leading-relaxed"
                    style={{ fontSize: '16px', color: '#1B2A4A', lineHeight: '2' }}
                  >
                    {question.blankPrefix}{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '130px',
                        borderBottom: '2.5px solid #1B2A4A',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: blankValue ? '#1B2A4A' : '#9CA3AF',
                        padding: '0 6px',
                        fontSize: '16px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {blankValue ?? '___________'}
                    </span>
                    {question.blankSuffix}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {question.options?.map(opt => (
                      <button
                        key={String(opt.value)}
                        onClick={() => handleBlankSelect(opt.value as string)}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '20px',
                          border: selectedValues.includes(opt.value)
                            ? '1.5px solid #4ecdc4'
                            : '1.5px solid #E9E7E2',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          background: selectedValues.includes(opt.value) ? '#4ecdc4' : '#FAFAF8',
                          color: selectedValues.includes(opt.value) ? '#fff' : '#374151',
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full font-bold"
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '14px',
                      color: '#fff',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      background: '#1B2A4A',
                      opacity: canSubmit ? 1 : 0.4,
                    }}
                  >
                    {tUI('Done')}
                  </button>
                </>
              )}

              {/* RESPONSE: Two choice (2 or 4 options) */}
              {question.responseType === 'two_choice' && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: question.options && question.options.length > 2 ? '1fr 1fr' : '1fr 1fr',
                      gap: '10px',
                      marginBottom: '20px',
                    }}
                  >
                    {question.options?.map(opt => (
                      <button
                        key={String(opt.value)}
                        onClick={() => handleSelect(opt.value)}
                        style={{
                          padding: '16px 12px',
                          borderRadius: '14px',
                          border: selectedValues.includes(opt.value)
                            ? '2px solid #1B2A4A'
                            : '1.5px solid #E9E7E2',
                          cursor: 'pointer',
                          textAlign: 'center',
                          background: selectedValues.includes(opt.value) ? '#1B2A4A' : '#FAFAF8',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!selectedValues.includes(opt.value)) e.currentTarget.style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        {opt.emoji && (
                          <div style={{ fontSize: '26px', marginBottom: '6px', lineHeight: 1 }}>{opt.emoji}</div>
                        )}
                        <div style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: selectedValues.includes(opt.value) ? '#fff' : '#374151',
                          lineHeight: 1.3,
                        }}>
                          {opt.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full font-bold"
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '14px',
                      color: '#fff',
                      cursor: canSubmit ? 'pointer' : 'not-allowed',
                      background: '#1B2A4A',
                      opacity: canSubmit ? 1 : 0.4,
                    }}
                  >
                    {tUI('Done')}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
