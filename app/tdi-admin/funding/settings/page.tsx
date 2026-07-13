'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TYPE_PAGE_TITLE, TYPE_PAGE_SUBTITLE } from '@/components/tdi-admin/ui/design-tokens'

const VERBOSITY_OPTIONS = [
  { value: 'verbose', label: 'Verbose', description: 'Every event (drafts, research, nudges, completions, window changes)' },
  { value: 'handoffs', label: 'Handoffs', description: 'Only when the ball changes hands (drafted → QA, submitted, awarded, escalations)' },
  { value: 'critical', label: 'Critical only', description: 'Urgent/blocking only (escalation to Rae, overdue, awards, denials)' },
]

export default function FundingSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/funding/settings')
      .then(r => r.json())
      .then(d => { setSettings(d.settings); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async (fields: Record<string, unknown>) => {
    setSaving(true)
    setSettings((prev: any) => ({ ...prev, ...fields }))
    await fetch('/api/funding/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    setSaving(false)
  }

  if (loading) return <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>

  return (
    <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 700 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/tdi-admin/funding" style={{ fontSize: 13, color: '#8B5CF6', textDecoration: 'none' }}>
          &larr; Back to Funding
        </Link>
      </div>

      <h1 style={{ ...TYPE_PAGE_TITLE, margin: '0 0 4px' }}>Notification Settings</h1>
      <p style={{ ...TYPE_PAGE_SUBTITLE, marginBottom: 28 }}>Slack narration for the funding system</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Enable toggle */}
        <div style={{ padding: '16px 20px', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings?.slack_enabled || false}
              onChange={e => save({ slack_enabled: e.target.checked })}
              style={{ accentColor: '#8B5CF6', width: 18, height: 18 }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0a0f1e' }}>Slack notifications</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                {settings?.slack_enabled ? 'Enabled — events post to Slack' : 'Disabled — events are logged but not posted'}
              </div>
            </div>
          </label>
        </div>

        {/* Webhook URL */}
        <Field label="Webhook URL" description="Slack incoming webhook URL">
          <input
            value={settings?.slack_webhook_url || ''}
            onChange={e => setSettings((s: any) => ({ ...s, slack_webhook_url: e.target.value }))}
            onBlur={e => save({ slack_webhook_url: e.target.value })}
            placeholder="https://hooks.slack.com/services/..."
            style={inputStyle}
          />
        </Field>

        {/* Channel */}
        <Field label="Channel" description="Override channel (optional — uses webhook default if empty)">
          <input
            value={settings?.slack_channel || ''}
            onChange={e => setSettings((s: any) => ({ ...s, slack_channel: e.target.value }))}
            onBlur={e => save({ slack_channel: e.target.value })}
            placeholder="#funding-updates"
            style={inputStyle}
          />
        </Field>

        {/* Verbosity */}
        <Field label="Verbosity" description="How much to narrate">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {VERBOSITY_OPTIONS.map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', padding: '8px 12px', background: settings?.verbosity === opt.value ? '#F5F3FF' : '#F9FAFB', borderRadius: 8, border: `1px solid ${settings?.verbosity === opt.value ? '#8B5CF6' : '#E5E7EB'}` }}>
                <input
                  type="radio"
                  name="verbosity"
                  value={opt.value}
                  checked={settings?.verbosity === opt.value}
                  onChange={() => save({ verbosity: opt.value })}
                  style={{ accentColor: '#8B5CF6', marginTop: 2 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0f1e' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{opt.description}</div>
                </div>
              </label>
            ))}
          </div>
        </Field>

        {/* Slack handles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Bella's Slack handle" description="For @mentions on Bella items">
            <input
              value={settings?.bella_slack_handle || ''}
              onChange={e => setSettings((s: any) => ({ ...s, bella_slack_handle: e.target.value }))}
              onBlur={e => save({ bella_slack_handle: e.target.value })}
              placeholder="U01234ABCDE"
              style={inputStyle}
            />
          </Field>
          <Field label="Rae's Slack handle" description="For @mentions on Rae items">
            <input
              value={settings?.rae_slack_handle || ''}
              onChange={e => setSettings((s: any) => ({ ...s, rae_slack_handle: e.target.value }))}
              onBlur={e => save({ rae_slack_handle: e.target.value })}
              placeholder="U01234ABCDE"
              style={inputStyle}
            />
          </Field>
        </div>

        {saving && <div style={{ fontSize: 11, color: '#8B5CF6' }}>Saving...</div>}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontSize: 13, padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 6,
  width: '100%', boxSizing: 'border-box',
}

function Field({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 20px', background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0f1e', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>{description}</div>
      {children}
    </div>
  )
}
