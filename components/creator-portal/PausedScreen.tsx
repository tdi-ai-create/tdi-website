'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface PausedScreenProps {
  creatorId: string
  creatorEmail: string
  firstName: string
  pauseType: string | null
  onUnpaused: () => void
}

export default function PausedScreen({ creatorId, creatorEmail, firstName, pauseType, onUnpaused }: PausedScreenProps) {
  const [showUnpauseModal, setShowUnpauseModal] = useState(false)
  const [step, setStep] = useState(1)
  const [choice, setChoice] = useState<'resume' | 'fresh' | null>(null)
  const [contentPath, setContentPath] = useState<'download' | 'course'>('course')
  const [projectedDate, setProjectedDate] = useState('')
  const [saving, setSaving] = useState(false)

  const isMidProject = pauseType === 'pause_mid_project'

  async function handleUnpause() {
    setSaving(true)
    const body: any = { creatorId, email: creatorEmail }

    if (choice === 'resume' || (isMidProject && step === 1 && !choice)) {
      body.resume_or_fresh = 'resume'
    } else {
      body.resume_or_fresh = 'fresh'
      body.content_path = contentPath
      if (projectedDate) body.projected_completion_date = projectedDate
    }

    try {
      const res = await fetch('/api/creator/unpause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) onUnpaused()
    } catch {}
    setSaving(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F0', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 520, width: '100%', padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', marginBottom: 12, fontFamily: "'Source Serif 4', Georgia, serif" }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ color: '#6B7280', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Your account is paused. Take all the time you need &mdash; your affiliate link keeps earning while you rest.
        </p>

        {/* Affiliate stats link */}
        <Link
          href="/creator-portal/affiliate"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            color: '#1e2749',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          View your affiliate stats &rarr;
        </Link>

        <div>
          <button
            onClick={() => setShowUnpauseModal(true)}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 28px',
              background: '#1e2749',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 16,
            }}
          >
            I&apos;m ready &mdash; let&apos;s unpause
          </button>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>
            Questions or need anything?{' '}
            <a href="mailto:rae@teachersdeserveit.com" style={{ color: '#80a4ed' }}>Email rae@teachersdeserveit.com</a>
          </p>
        </div>
      </div>

      {/* Unpause walkthrough modal */}
      {showUnpauseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e2749] to-[#2a3459] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-lg">Welcome back!</h2>
                <button onClick={() => { setShowUnpauseModal(false); setStep(1); setChoice(null) }} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Mid-project: choose resume or fresh */}
              {isMidProject && step === 1 && (
                <>
                  <p className="text-sm text-gray-600 mb-5">You have a project in progress. What would you like to do?</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setChoice('resume'); handleUnpause() }}
                      disabled={saving}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-[#80a4ed] transition-colors disabled:opacity-50"
                    >
                      <div className="font-semibold text-[#1e2749]">Resume my project</div>
                      <div className="text-sm text-gray-500">Pick up right where you left off</div>
                    </button>
                    <button
                      onClick={() => { setChoice('fresh'); setStep(2) }}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-[#80a4ed] transition-colors"
                    >
                      <div className="font-semibold text-[#1e2749]">Start fresh &mdash; new content</div>
                      <div className="text-sm text-gray-500">Begin a new project from scratch</div>
                    </button>
                  </div>
                </>
              )}

              {/* Between projects or chose fresh: pick path + date */}
              {((!isMidProject && step === 1) || step === 2) && !saving && (
                <>
                  <p className="text-sm text-gray-600 mb-5">What would you like to create this time?</p>
                  <div className="flex gap-3 mb-5">
                    {(['download', 'course'] as const).map(path => (
                      <button
                        key={path}
                        onClick={() => setContentPath(path)}
                        className={`flex-1 p-4 border-2 rounded-xl text-center transition-colors ${
                          contentPath === path ? 'border-[#80a4ed] bg-[#80a4ed]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-[#1e2749] capitalize">{path}</div>
                      </button>
                    ))}
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projected completion date</label>
                  <input
                    type="date"
                    value={projectedDate}
                    min={today}
                    onChange={(e) => setProjectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[#1e2749] focus:outline-none focus:ring-2 focus:ring-[#80a4ed]/50 mb-5"
                  />
                  <button
                    onClick={() => { setChoice('fresh'); handleUnpause() }}
                    disabled={saving || !projectedDate}
                    className="w-full px-4 py-3 bg-[#1e2749] text-white rounded-xl font-medium hover:bg-[#2a3459] disabled:opacity-50"
                  >
                    {saving ? 'Setting up...' : "Let's go!"}
                  </button>
                </>
              )}

              {saving && (
                <div className="text-center py-8">
                  <p className="text-gray-600">Setting things up for you...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
