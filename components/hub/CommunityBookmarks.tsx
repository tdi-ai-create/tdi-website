'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'

interface BookmarkItem {
  id: string
  content_type: string
  content_id: string
  title: string | null
  context_label: string | null
  created_at: string
}

export default function CommunityBookmarks({ userId, tUI }: { userId?: string | null; tUI: (s: string) => string }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])

  useEffect(() => {
    if (!userId) return
    async function load() {
      try {
        const res = await fetch(`/api/hub/community/bookmark?user_id=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setBookmarks(data.bookmarks || [])
        }
      } catch { /* silent */ }
    }
    load()
  }, [userId])

  if (bookmarks.length === 0) return null

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
      <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.08em' }}>
        {tUI('Bookmarked posts')}
      </div>
      <div className="space-y-2">
        {bookmarks.slice(0, 3).map(bm => (
          <div key={bm.id} className="flex items-start gap-2.5 py-1.5">
            <Bookmark size={12} style={{ color: '#E8B84B', fill: '#E8B84B', flexShrink: 0, marginTop: 2 }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#1B2A4A' }}>
                {bm.title || 'Community post'}
              </p>
              {bm.context_label && (
                <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{bm.context_label}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {bookmarks.length > 3 && (
        <p className="text-xs font-semibold mt-2" style={{ color: '#38618C' }}>
          +{bookmarks.length - 3} {tUI('more saved')}
        </p>
      )}
    </div>
  )
}
