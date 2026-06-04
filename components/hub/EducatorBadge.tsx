'use client'

import { educatorTypeQuiz } from '@/lib/hub/quizConfigs'

// Compact inline badge showing educator type with correct color
// Used in community comments, Q&A, conversations

interface EducatorBadgeProps {
  educatorType: string
}

export default function EducatorBadge({ educatorType }: EducatorBadgeProps) {
  const result = educatorTypeQuiz.results[educatorType]
  if (!result) return null

  return (
    <span
      className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{ backgroundColor: result.bg, color: result.color }}
    >
      <span
        className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: result.color }}
      >
        <span className="text-[7px] font-bold text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>
          {result.icon}
        </span>
      </span>
      {result.title}
    </span>
  )
}
