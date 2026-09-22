'use client'

// Marks a post as written by a TDI account rather than a member.
// Sits directly after the author name in a byline, next to EducatorBadge.
// Renders nothing for members, so every existing byline is unchanged.

interface TdiVoiceChipProps {
  isTdiVoice?: boolean | null
}

export default function TdiVoiceChip({ isTdiVoice }: TdiVoiceChipProps) {
  if (!isTdiVoice) return null

  return (
    <span
      className="inline-flex items-center ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
      style={{ backgroundColor: '#2B3A67', color: '#FFFFFF' }}
      title="Posted by the Teachers Deserve It team"
    >
      TDI
    </span>
  )
}
