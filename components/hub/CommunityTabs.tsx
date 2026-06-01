'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import LessonConversation from './LessonConversation'
import LessonQA from './LessonQA'

interface CommunityTabsProps {
  contentId: string
  userId?: string | null
  isAdmin?: boolean
  conversationApiPath: string
  qaApiPath: string
}

export default function CommunityTabs({ contentId, userId, isAdmin, conversationApiPath, qaApiPath }: CommunityTabsProps) {
  const [activeTab, setActiveTab] = useState<'conversation' | 'qa'>('conversation')

  return (
    <div>
      <div className="flex gap-0 border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('conversation')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: activeTab === 'conversation' ? '#1B2A4A' : '#9CA3AF',
            borderBottom: activeTab === 'conversation' ? '2px solid #E8B84B' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <MessageCircle size={16} />
          Conversation
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: activeTab === 'qa' ? '#1B2A4A' : '#9CA3AF',
            borderBottom: activeTab === 'qa' ? '2px solid #E8B84B' : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          <MessageCircle size={16} />
          Q&A
        </button>
      </div>

      {activeTab === 'conversation' && (
        <LessonConversation
          lessonId={contentId}
          courseId={contentId}
          userId={userId || null}
          isAdmin={isAdmin}
          apiBasePath={conversationApiPath}
        />
      )}

      {activeTab === 'qa' && (
        <LessonQA
          contentId={contentId}
          userId={userId || null}
          isAdmin={isAdmin}
          apiBasePath={qaApiPath}
        />
      )}
    </div>
  )
}
