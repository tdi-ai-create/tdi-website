'use client'

interface Highlight {
  section_key:    string
  highlight_type: 'callout' | 'new_badge' | 'pinned'
  callout_text?:  string
  callout_style?: 'info' | 'success' | 'celebration' | 'action'
}

interface SectionHighlightProps {
  sectionKey:  string
  highlights:  Highlight[]
  children:    React.ReactNode
  isAdminView?: boolean
  onEdit?:     (sectionKey: string) => void
}

const CALLOUT_STYLES = {
  info: {
    bg:     '#EFF6FF',
    border: '#BFDBFE',
    text:   '#1E40AF',
    icon:   'i',
  },
  success: {
    bg:     '#F0FDF4',
    border: '#BBF7D0',
    text:   '#166534',
    icon:   '✓',
  },
  celebration: {
    bg:     '#FFF7ED',
    border: '#FED7AA',
    text:   '#9A3412',
    icon:   '!',
  },
  action: {
    bg:     '#FFF1F2',
    border: '#FECDD3',
    text:   '#9F1239',
    icon:   '!',
  },
}

export function SectionHighlight({
  sectionKey, highlights, children, isAdminView = false, onEdit
}: SectionHighlightProps) {
  const sectionHighlights = highlights.filter(h => h.section_key === sectionKey && h.highlight_type !== undefined)

  const callout   = sectionHighlights.find(h => h.highlight_type === 'callout')
  const newBadge  = sectionHighlights.find(h => h.highlight_type === 'new_badge')
  const isPinned  = sectionHighlights.some(h => h.highlight_type === 'pinned')

  const style = callout?.callout_style
    ? CALLOUT_STYLES[callout.callout_style]
    : CALLOUT_STYLES.info

  return (
    <div
      className="relative mb-4 rounded-xl transition-all"
      style={{
        outline: isPinned ? '2px solid #8B5CF6' : 'none',
        outlineOffset: isPinned ? '2px' : '0',
        boxShadow: isPinned ? '0 0 0 4px #8B5CF620' : 'none',
      }}
    >
      {/* New badge */}
      {newBadge && (
        <div
          className="absolute -top-2 -right-2 z-10 px-2 py-0.5 rounded-full text-xs font-bold text-white"
          style={{ background: '#8B5CF6', boxShadow: '0 2px 8px #8B5CF650' }}
        >
          NEW
        </div>
      )}

      {/* Pinned indicator */}
      {isPinned && (
        <div
          className="absolute -top-2 left-4 z-10 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: '#F5F3FF', color: '#5B21B6', border: '1px solid #8B5CF6' }}
        >
          * Featured
        </div>
      )}

      {/* Admin edit button */}
      {isAdminView && onEdit && (
        <button
          onClick={() => onEdit(sectionKey)}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all opacity-60 hover:opacity-100"
          style={{ background: '#F5F3FF', color: '#8B5CF6', border: '1px solid #8B5CF6' }}
          title="Add highlight to this section"
        >
          *
        </button>
      )}

      {/* Callout banner */}
      {callout && callout.callout_text && (
        <div
          className="rounded-t-xl px-4 py-3 flex items-start gap-2 text-sm font-medium"
          style={{
            background: style.bg,
            border: `1px solid ${style.border}`,
            borderBottom: 'none',
            color: style.text,
          }}
        >
          <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: style.border }}>
            {style.icon}
          </span>
          <span>{callout.callout_text}</span>
        </div>
      )}

      {/* Content */}
      <div
        className="group"
        style={{
          borderRadius: callout && callout.callout_text ? '0 0 12px 12px' : '12px',
          border: callout && callout.callout_text ? `1px solid ${style.border}` : 'none',
          borderTop: 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
