'use client'

import { useState, useRef, useEffect } from 'react'

// ─────────────────────────────────────────────
// Shared save logic
// ─────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

async function patchField(oppId: string, field: string, newValue: any): Promise<{ success: boolean; old_value?: any; error?: string }> {
  try {
    const res = await fetch(`/api/sales/${oppId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, new_value: newValue }),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error || 'Save failed' }
    return { success: true, old_value: data.old_value }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

function flashStyle(status: SaveStatus): React.CSSProperties {
  if (status === 'success') return { backgroundColor: 'rgba(16, 185, 129, 0.12)', transition: 'background-color 0.4s' }
  if (status === 'error') return { backgroundColor: 'rgba(239, 68, 68, 0.12)', transition: 'background-color 0.4s' }
  return { transition: 'background-color 0.4s' }
}

// ─────────────────────────────────────────────
// InlineText: click to edit text or number
// ─────────────────────────────────────────────

export function InlineText({
  oppId,
  field,
  value,
  onSaved,
  format = 'text',
  placeholder = '-',
  style = {},
}: {
  oppId: string
  field: string
  value: string | number | null
  onSaved: (field: string, newValue: any) => void
  format?: 'text' | 'currency' | 'number'
  placeholder?: string
  style?: React.CSSProperties
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  function displayValue(): string {
    if (value === null || value === undefined || value === '') return placeholder
    if (format === 'currency') return `$${Number(value).toLocaleString()}`
    return String(value)
  }

  function startEdit() {
    const raw = format === 'currency' ? String(value || 0) : String(value || '')
    setDraft(raw)
    setEditing(true)
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  async function save() {
    setEditing(false)
    const newVal = format === 'currency' || format === 'number' ? (draft === '' ? null : Number(draft)) : draft
    if (newVal === value) return

    setStatus('saving')
    const result = await patchField(oppId, field, newVal)
    if (result.success) {
      setStatus('success')
      onSaved(field, newVal)
      setTimeout(() => setStatus('idle'), 500)
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 1500)
    }
  }

  function cancel() {
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={format === 'currency' || format === 'number' ? 'number' : 'text'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') cancel()
        }}
        onBlur={save}
        style={{
          ...style,
          padding: '2px 6px',
          border: '1.5px solid #10B981',
          borderRadius: 4,
          outline: 'none',
          width: format === 'currency' || format === 'number' ? 90 : '100%',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          fontFamily: 'inherit',
          color: 'inherit',
          background: 'white',
        }}
      />
    )
  }

  return (
    <span
      onClick={startEdit}
      style={{
        ...style,
        cursor: 'pointer',
        borderBottom: '1px dashed transparent',
        borderRadius: 2,
        padding: '0 2px',
        ...flashStyle(status),
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = '#9CA3AF' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}
      title="Click to edit"
    >
      {displayValue()}
    </span>
  )
}

// ─────────────────────────────────────────────
// InlineSelect: click to open dropdown
// ─────────────────────────────────────────────

export function InlineSelect({
  oppId,
  field,
  value,
  options,
  onSaved,
  renderValue,
  style = {},
}: {
  oppId: string
  field: string
  value: string | null
  options: { value: string; label: string }[]
  onSaved: (field: string, newValue: any) => void
  renderValue?: (val: string | null) => React.ReactNode
  style?: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  async function select(newVal: string) {
    setOpen(false)
    if (newVal === value) return

    setStatus('saving')
    const result = await patchField(oppId, field, newVal)
    if (result.success) {
      setStatus('success')
      onSaved(field, newVal)
      setTimeout(() => setStatus('idle'), 500)
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 1500)
    }
  }

  const display = renderValue ? renderValue(value) : (options.find(o => o.value === value)?.label || value || '-')

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onClick={() => setOpen(!open)}
        style={{
          ...style,
          cursor: 'pointer',
          borderRadius: 4,
          padding: '1px 4px',
          ...flashStyle(status),
        }}
        title="Click to change"
      >
        {display}
        <span style={{ fontSize: 8, marginLeft: 3, color: '#9CA3AF', opacity: open ? 1 : 0, transition: 'opacity 0.15s' }}>&#9660;</span>
      </span>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 100,
          minWidth: 160,
          maxHeight: 240,
          overflowY: 'auto',
          padding: 4,
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: opt.value === value ? 600 : 400,
                color: opt.value === value ? '#10B981' : '#374151',
                background: opt.value === value ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
              onMouseLeave={(e) => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {opt.label}
              {opt.value === value && <span style={{ float: 'right', color: '#10B981' }}>&#10003;</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// InlineNotes: click to expand textarea
// ─────────────────────────────────────────────

export function InlineNotes({
  oppId,
  value,
  onSaved,
}: {
  oppId: string
  value: string | null
  onSaved: (field: string, newValue: any) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function startEdit() {
    setDraft(value || '')
    setEditing(true)
  }

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [editing])

  async function save() {
    setEditing(false)
    if (draft === (value || '')) return

    setStatus('saving')
    const result = await patchField(oppId, 'notes', draft)
    if (result.success) {
      setStatus('success')
      onSaved('notes', draft)
      setTimeout(() => setStatus('idle'), 500)
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 1500)
    }
  }

  if (editing) {
    return (
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setEditing(false) }
        }}
        rows={4}
        style={{
          width: '100%',
          padding: 8,
          border: '1.5px solid #10B981',
          borderRadius: 6,
          fontSize: 12,
          fontFamily: "'DM Sans', sans-serif",
          color: '#374151',
          outline: 'none',
          resize: 'vertical',
        }}
      />
    )
  }

  const preview = value ? (value.length > 80 ? value.slice(0, 77) + '...' : value) : 'Click to add notes'

  return (
    <p
      onClick={startEdit}
      style={{
        margin: 0,
        fontSize: 11,
        color: value ? '#6B7280' : '#9CA3AF',
        lineHeight: 1.4,
        cursor: 'pointer',
        borderBottom: '1px dashed transparent',
        padding: '2px 0',
        borderRadius: 2,
        ...flashStyle(status),
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = '#9CA3AF' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent' }}
      title="Click to edit notes"
    >
      {preview}
    </p>
  )
}
