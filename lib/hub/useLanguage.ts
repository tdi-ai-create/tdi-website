'use client'
import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useHub } from '@/components/hub/HubContext'

export type Language = 'en' | 'es'

// Module-level shared state ensures all hook instances stay in sync when language changes.
// Without this, each component that calls useLanguage() gets its own independent React state,
// so switching language in LanguageToggle would not propagate to MomentMode, CheckInSlideUp, etc.
let sharedLanguage: Language = 'en'
const languageListeners: Set<() => void> = new Set()

function notifyLanguageListeners() {
  languageListeners.forEach(listener => listener())
}

export function useLanguage() {
  const { user, profile } = useHub()
  const [language, setLanguageLocal] = useState<Language>(sharedLanguage)
  const [pendingTranslations, setPendingTranslations] = useState<Set<string>>(new Set())

  // Register listener so this instance updates when any other instance changes language
  useEffect(() => {
    const listener = () => setLanguageLocal(sharedLanguage)
    languageListeners.add(listener)
    return () => {
      languageListeners.delete(listener)
    }
  }, [])

  // Sync language from user profile preference on mount / profile load
  useEffect(() => {
    if (profile?.preferred_language) {
      const lang = profile.preferred_language as Language
      if (lang !== sharedLanguage) {
        sharedLanguage = lang
        setLanguageLocal(lang)
        notifyLanguageListeners()
      }
    }
  }, [profile?.preferred_language])

  const setLanguage = useCallback(async (lang: Language) => {
    // Update shared state and notify all component instances immediately
    sharedLanguage = lang
    setLanguageLocal(lang)
    notifyLanguageListeners()

    if (!user?.id) return

    const supabase = getSupabase()
    await supabase
      .from('hub_profiles')
      .update({ preferred_language: lang })
      .eq('id', user.id)
  }, [user?.id])

  // Helper: get localized text with English fallback
  function t(enText: string | null | undefined, esText: string | null | undefined): string {
    if (language === 'es' && esText) return esText
    return enText || ''
  }

  // Helper: check if Spanish translation exists
  function hasSpanish(esText: string | null | undefined): boolean {
    return !!esText
  }

  // Helper: trigger translation if Spanish content is missing
  async function translateIfNeeded(
    contentType: 'course' | 'quick_win',
    contentId: string,
    enText: string,
    esText: string | null | undefined
  ): Promise<string> {
    // If Spanish content already exists, return it
    if (esText) return esText

    // If not Spanish mode, return English
    if (language !== 'es') return enText

    // Avoid duplicate translation requests
    const key = `${contentType}-${contentId}`
    if (pendingTranslations.has(key)) return enText

    setPendingTranslations(prev => new Set(prev).add(key))

    try {
      const res = await fetch('/api/hub/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentId, lang: 'es' }),
      })

      if (res.ok) {
        const data = await res.json()
        // Return the translated title - component should re-render with updated data
        return data.title_es || enText
      }
    } catch (err) {
      console.error('Translation request failed:', err)
    } finally {
      setPendingTranslations(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }

    return enText
  }

  return { language, setLanguage, t, hasSpanish, translateIfNeeded }
}
