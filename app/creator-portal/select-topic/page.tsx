'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Globe, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, Home as HomeIcon, Laptop, Scale, Check, ArrowRight,
} from 'lucide-react'
import { TOPIC_MAP, TOPIC_GROUPS, getTopicsByGroup, getTopicConfig } from '@/lib/data/creator-topics'

const ICONS: Record<string, any> = {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Globe, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, HomeIcon, Laptop, Scale,
}

export default function SelectTopicPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState<string>('')
  const [primaryTopic, setPrimaryTopic] = useState<string | null>(null)
  const [secondaryTopics, setSecondaryTopics] = useState<string[]>([])
  const [step, setStep] = useState<'primary' | 'secondary'>('primary')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const topicsByGroup = getTopicsByGroup()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        router.push('/creator-portal')
        return
      }
      setUserEmail(session.user.email)

      const { data: creator } = await supabase
        .from('creators')
        .select('id, name, topic, secondary_topics, topic_chosen_by_creator')
        .eq('email', session.user.email)
        .maybeSingle()

      if (!creator) {
        router.push('/creator-portal')
        return
      }

      if (creator.topic_chosen_by_creator) {
        router.push('/creator-portal/dashboard')
        return
      }

      setCreatorId(creator.id)
      setCreatorName(creator.name || '')
      if (creator.topic) setPrimaryTopic(creator.topic)
      if (creator.secondary_topics) setSecondaryTopics(creator.secondary_topics)
      setLoading(false)
    }
    load()
  }, [supabase, router])

  function toggleSecondary(topic: string) {
    if (topic === primaryTopic) return
    if (secondaryTopics.includes(topic)) {
      setSecondaryTopics(secondaryTopics.filter(t => t !== topic))
    } else if (secondaryTopics.length < 2) {
      setSecondaryTopics([...secondaryTopics, topic])
    }
  }

  async function saveAndContinue() {
    if (!primaryTopic || !creatorId) return
    setSaving(true)
    const { error } = await supabase
      .from('creators')
      .update({
        topic: primaryTopic,
        secondary_topics: secondaryTopics,
        topic_chosen_by_creator: true,
      })
      .eq('id', creatorId)

    if (error) {
      alert('Error saving: ' + error.message)
      setSaving(false)
      return
    }
    router.push('/creator-portal/dashboard?topic=saved')
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <p style={{ color: '#6B7280' }}>Loading...</p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#2A9D8F', marginBottom: 8 }}>
            Welcome, {creatorName || 'Creator'}
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1e2749', margin: '0 0 12px 0' }}>
            {step === 'primary' ? 'What do you teach?' : 'Anything else you teach?'}
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            {step === 'primary'
              ? 'Choose your primary topic. This becomes your icon on the TDI website and your visible identity in our community.'
              : 'Optionally pick up to 2 secondary topics. These won\'t be your icon, but they help educators find you when they\'re browsing for related content.'}
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: '#2A9D8F' }} />
          <div style={{ width: 32, height: 4, borderRadius: 2, background: step === 'secondary' ? '#2A9D8F' : '#E5E7EB' }} />
        </div>

        {/* Topic groups */}
        {TOPIC_GROUPS.map(group => (
          <div key={group} style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#6B7280', margin: '0 0 12px 0' }}>
              {group}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {topicsByGroup[group]?.map(topic => {
                const config = getTopicConfig(topic)
                const Icon = ICONS[config.icon] || Sparkles
                const isPrimary = primaryTopic === topic
                const isSecondary = secondaryTopics.includes(topic)
                const isDisabled = step === 'secondary' && topic === primaryTopic
                const isMaxedOut = step === 'secondary' && !isSecondary && secondaryTopics.length >= 2 && topic !== primaryTopic
                const isSelected = step === 'primary' ? isPrimary : (isSecondary || isPrimary)

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      if (isDisabled || isMaxedOut) return
                      if (step === 'primary') {
                        setPrimaryTopic(topic)
                      } else {
                        toggleSecondary(topic)
                      }
                    }}
                    disabled={isDisabled || isMaxedOut}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: 14,
                      borderRadius: 12,
                      border: isSelected ? `2px solid ${config.iconColor}` : '1px solid #E5E7EB',
                      background: isSelected ? config.background : 'white',
                      cursor: (isDisabled || isMaxedOut) ? 'not-allowed' : 'pointer',
                      opacity: (isDisabled || isMaxedOut) ? 0.4 : 1,
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: config.background, border: `1.5px solid ${config.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon style={{ width: 20, height: 20, color: config.iconColor }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#1e2749', lineHeight: 1.3 }}>
                      {topic}
                    </span>
                    {isPrimary && step === 'secondary' && (
                      <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: config.iconColor }}>
                        Primary
                      </span>
                    )}
                    {(isPrimary && step === 'primary') || isSecondary ? (
                      <Check style={{ width: 18, height: 18, color: config.iconColor, marginLeft: 'auto', flexShrink: 0 }} />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Footer actions */}
        <div style={{ position: 'sticky', bottom: 16, marginTop: 32, background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '0.5px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              {step === 'primary' ? (
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                  {primaryTopic ? <><strong style={{ color: '#1e2749' }}>{primaryTopic}</strong> selected as your primary topic</> : 'Pick your primary topic to continue'}
                </p>
              ) : (
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                  {secondaryTopics.length === 0 ? 'Add up to 2 secondary topics (optional)' : `${secondaryTopics.length} of 2 secondary topics selected`}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {step === 'secondary' && (
                <button
                  type="button"
                  onClick={() => setStep('primary')}
                  style={{ padding: '12px 20px', background: 'white', color: '#1e2749', border: '1px solid #E5E7EB', borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
                >
                  Back
                </button>
              )}
              {step === 'primary' ? (
                <button
                  type="button"
                  disabled={!primaryTopic}
                  onClick={() => setStep('secondary')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px',
                    background: primaryTopic ? '#1e2749' : '#E5E7EB',
                    color: primaryTopic ? 'white' : '#9CA3AF',
                    border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
                    cursor: primaryTopic ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continue <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveAndContinue}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px',
                    background: '#2A9D8F', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14,
                    cursor: saving ? 'wait' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Save & Continue'}
                  {!saving && <ArrowRight style={{ width: 16, height: 16 }} />}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
