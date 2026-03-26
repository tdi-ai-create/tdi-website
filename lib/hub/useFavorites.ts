'use client'
import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useHub } from '@/components/hub/HubContext'

export function useFavorites() {
  const { user } = useHub()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    loadFavorites()
  }, [user?.id])

  async function loadFavorites() {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('hub_favorites')
      .select('content_id')
      .eq('user_id', user!.id)

    setFavorites(new Set((data || []).map(f => f.content_id)))
    setLoading(false)
  }

  const toggleFavorite = useCallback(async (
    contentId: string,
    contentType: 'course' | 'quick_win'
  ) => {
    if (!user?.id) return
    const supabase = getSupabase()
    const isFav = favorites.has(contentId)

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev)
      isFav ? next.delete(contentId) : next.add(contentId)
      return next
    })

    if (isFav) {
      await supabase
        .from('hub_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId)
    } else {
      await supabase
        .from('hub_favorites')
        .insert({ user_id: user.id, content_type: contentType, content_id: contentId })
    }
  }, [user?.id, favorites])

  return { favorites, loading, toggleFavorite, isFavorite: (id: string) => favorites.has(id) }
}
