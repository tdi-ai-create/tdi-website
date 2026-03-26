'use client'
import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useHub } from '@/components/hub/HubContext'

export type Language = 'en' | 'es'

export function useLanguage() {
  const { user, profile } = useHub()
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguageState(profile.preferred_language as Language)
    }
  }, [profile?.preferred_language])

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang) // Optimistic update

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

  return { language, setLanguage, t, hasSpanish }
}
