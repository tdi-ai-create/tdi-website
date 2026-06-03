'use client'

import { useState, useRef } from 'react'
import { Share2, Download, X } from 'lucide-react'
import { useTranslation } from '@/lib/hub/useTranslation'
import { useHub } from '@/components/hub/HubContext'
import UniversalShareModal from './UniversalShareModal'
import { ALL_QUIZZES } from '@/lib/hub/quizConfigs'
import type { QuizConfig } from '@/lib/hub/quizConfigs'

interface ShareableProfileCardProps {
  quizResults: Record<string, string>
  displayName: string
}

export default function ShareableProfileCard({ quizResults, displayName }: ShareableProfileCardProps) {
  const { tUI } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const completedQuizzes = ALL_QUIZZES.filter(q => quizResults[q.id])
  if (completedQuizzes.length < 2) return null

  const shareMessage = `Here is my TDI Educator Profile:\n${completedQuizzes.map(q => {
    const result = q.results[quizResults[q.id]]
    return result ? `${q.shortTitle}: ${result.title}` : null
  }).filter(Boolean).join('\n')}\n\nDiscover yours at teachersdeserveit.com/hub`

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      // Use html2canvas if available, otherwise fallback to text share
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `tdi-educator-profile-${displayName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // Fallback: open share modal with text
      setShareOpen(true)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: '#1B2A4A', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
      >
        <Share2 size={14} />
        {tUI('Share My Profile')}
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#1e2749' }}>
              <p className="text-sm font-semibold text-white">{tUI('Your Educator Profile')}</p>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* The card (designed to look good as screenshot) */}
            <div ref={cardRef} className="p-6" style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 50%, #38618C 100%)' }}>
              {/* Name + branding */}
              <div className="text-center mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#E8B84B' }}>
                  TDI Learning Hub
                </p>
                <p className="text-lg font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  {displayName}
                </p>
              </div>

              {/* Quiz results grid */}
              <div className="space-y-2.5">
                {completedQuizzes.map(quiz => {
                  const result = quiz.results[quizResults[quiz.id]]
                  if (!result) return null
                  return (
                    <div
                      key={quiz.id}
                      className="rounded-xl p-3 flex items-center gap-3"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: result.color }}
                      >
                        <span className="text-sm font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
                          {result.icon}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {quiz.shortTitle}
                        </p>
                        <p className="text-sm font-bold text-white truncate" style={{ fontFamily: "'Source Serif 4', serif" }}>
                          {result.title}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  teachersdeserveit.com/hub
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2 bg-white">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#E8B84B', color: '#1B2A4A', fontFamily: "'DM Sans', sans-serif" }}
              >
                <Download size={14} />
                {tUI('Save Image')}
              </button>
              <button
                onClick={() => { setShowModal(false); setShareOpen(true); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#1B2A4A', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
              >
                <Share2 size={14} />
                {tUI('Share')}
              </button>
            </div>
          </div>
        </div>
      )}

      {shareOpen && (
        <UniversalShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          title="Share your Educator Profile"
          subtitle="Let other educators discover theirs"
          message={shareMessage}
        />
      )}
    </>
  )
}
