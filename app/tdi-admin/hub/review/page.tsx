'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

type Row = {
  id: string; channel: string; content_type: string | null; title: string | null
  status: string; owner: string | null; audience_tag: string | null
  scheduled_for: string | null; updated_at: string
}
type Detail = Row & {
  body: string | null
  artifact_refs: Array<{ index?: number; url?: string }> | null
  feedback_log: Array<Record<string, unknown>>
  created_at: string
}

const CHANNEL: Record<string, { label: string; dot: string }> = {
  hub: { label: 'Hub', dot: '#2F6FB5' },
  substack: { label: 'Substack', dot: '#B75B2A' },
  instagram: { label: 'Instagram', dot: '#A83A68' },
  video_script: { label: 'Video', dot: '#22766A' },
  email: { label: 'Email', dot: '#63549C' },
}
const chan = (c: string) => CHANNEL[c] ?? { label: c, dot: '#8A94A2' }

const WAITING: Record<string, string> = {
  pending_qa: 'with Julie', pending_creative: 'with Lily', pending_editorial: 'with Olivia',
  pending_approval: 'waiting on you', approved: 'approved, not published yet',
  changes_requested: 'sent back to the writer',
}

export default function ReviewQueue() {
  const [rows, setRows] = useState<Row[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/tdi-admin/content-queue')
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Could not load the queue')
      setRows(j.items ?? [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load the queue') }
  }, [])

  const loadDetail = useCallback(async (id: string) => {
    setDetail(null); setError(null)
    try {
      const res = await fetch(`/api/tdi-admin/content-queue?id=${encodeURIComponent(id)}`)
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Could not open that piece')
      setDetail(j.item)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open that piece') }
  }, [])

  useEffect(() => { loadList() }, [loadList])
  useEffect(() => { if (openId) loadDetail(openId) }, [openId, loadDetail])

  const mine = rows.filter(r => r.status === 'pending_approval')
  const elsewhere = rows.filter(r => r.status !== 'pending_approval')

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-[#1e2749]">Waiting on you</h1>
        <Link href="/tdi-admin/hub/schedule" className="text-sm text-[#5B6B8C] hover:underline">
          The calendar
        </Link>
      </div>
      <p className="text-sm text-[#6B7684] mb-5 max-w-[70ch]">
        Content that has cleared QA, creative and editorial. Read the draft here, where a carousel
        actually renders and a post reads at full length. Approving happens on the Paperclip board,
        where you are already asked for everything else and where answering wakes the agent that
        raised it.
      </p>

      <div className="mb-4 p-3 rounded border border-[#D8DDE3] bg-[#F4F6F8] text-sm text-[#1e2749]">
        This page does not approve anything. It is here to read. The decision is a board approval in
        Paperclip, which carries the summary and the risks and wakes the agent waiting on it.
      </div>
      {error && <div className="mb-4 p-3 rounded border border-[#9E3B3B] bg-[#F8E7E6] text-sm">{error}</div>}

      <h2 className="!text-sm !font-semibold !m-0 mb-2 text-[#1e2749]">
        Needs approving ({mine.length})
      </h2>
      {mine.length === 0 && (
        <p className="text-sm text-[#6B7684] mb-6">Nothing is waiting on a person right now.</p>
      )}
      <div className="flex flex-col gap-2 mb-8">
        {mine.map(r => (
          <button key={r.id} onClick={() => setOpenId(openId === r.id ? null : r.id)}
            className="text-left border border-[#D8DDE3] rounded bg-white px-3 py-2 hover:bg-[#F8FAFC]">
            <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2" style={{ background: chan(r.channel).dot }} />
            <span className="font-semibold text-[#1e2749]">{r.title || '(untitled)'}</span>
            <span className="text-xs text-[#6B7684] ml-2">{chan(r.channel).label}</span>
          </button>
        ))}
      </div>

      {detail && (
        <div className="border border-[#D8DDE3] rounded-lg bg-white p-5 mb-8">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
            <h3 className="!text-lg !font-semibold !m-0 text-[#1e2749]">{detail.title || '(untitled)'}</h3>
            <span className="text-xs text-[#6B7684]">
              {chan(detail.channel).label} · for {detail.audience_tag || 'everyone'}
            </span>
          </div>

          {detail.channel === 'instagram' && (
            <Link href={`/tdi-admin/hub/carousel?id=${detail.id}`}
              className="text-sm text-[#2F5C9E] hover:underline block mb-3">
              See the slides as they will post
            </Link>
          )}

          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#1e2749] border-l-2 border-[#E3E7EC] pl-4 mb-5 max-w-[68ch]">
            {detail.body || '(no draft on this piece)'}
          </div>

          <div className="text-[11px] text-[#6B7684] mb-4">
            {(detail.feedback_log ?? []).slice(-5).map((e, i) => (
              <div key={i}>
                {String(e.at ?? '').slice(0, 16)} {String(e.action ?? '')} by {String(e.actor ?? '')}
                {e.note ? ` — ${String(e.note).slice(0, 90)}` : ''}
              </div>
            ))}
          </div>

          <a href="https://paperclip-railway-template-production.up.railway.app/TEA/dashboard"
            target="_blank" rel="noreferrer"
            className="inline-block px-4 py-2 text-sm rounded bg-[#1e2749] text-white">
            Decide this on the board
          </a>
        </div>
      )}

      <h2 className="!text-sm !font-semibold !m-0 mb-2 text-[#1e2749]">
        Everything else in flight ({elsewhere.length})
      </h2>
      <div className="flex flex-col gap-1">
        {elsewhere.map(r => (
          <div key={r.id} className="text-sm text-[#6B7684] flex gap-2 items-baseline">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ background: chan(r.channel).dot }} />
            <span className="text-[#1e2749]">{r.title || '(untitled)'}</span>
            <span className="text-xs">{WAITING[r.status] ?? r.status}</span>
          </div>
        ))}
        {elsewhere.length === 0 && <p className="text-sm text-[#6B7684]">Nothing else in flight.</p>}
      </div>
    </div>
  )
}
