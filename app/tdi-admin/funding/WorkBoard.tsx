'use client'

/**
 * The grant pipeline, lifted off the board.
 *
 * The calendar answers "what has to happen and when". It cannot answer "what is
 * in flight", because it is built on dates and most grant paths do not have
 * one: 6 of 21 live paths carried a confirmed deadline when this was written.
 * The other 15 appear nowhere on a calendar. This is where they are.
 *
 * Loading lives here rather than in the page so the page stays readable. It is
 * the board's own loader, unchanged in what it asks for.
 */

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import NeedsYouBoard, { type BoardSchool } from './components/NeedsYouBoard'

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function WorkBoard() {
  const router = useRouter()
  const [schools, setSchools] = useState<BoardSchool[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [markingDoneId, setMarkingDoneId] = useState<string | null>(null)
  const [closeNote, setCloseNote] = useState<string | null>(null)

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/funding/dashboard').then(r => r.json()),
      fetch('/api/funding/queue').then(r => r.json()).catch(() => ({ items: [] })),
    ])
      .then(async ([d, q]) => {
        if (d?.error) { setError(String(d.error)); return }
        const pursuits = (d.pursuits || []).filter((p: any) => !p.archived)

        const stepsByPursuit = new Map<string, any[]>()
        for (const item of (q.items || []) as any[]) {
          const list = stepsByPursuit.get(item.pursuitId) ?? []
          list.push(item)
          stepsByPursuit.set(item.pursuitId, list)
        }

        const data: BoardSchool[] = await Promise.all(
          pursuits.map((p: any) =>
            fetch(`/api/funding/opportunities?pursuitId=${p.id}`)
              .then(r => r.json())
              .then((od: any) => ({
                id: p.id,
                name: p.pursuit_name || p.district_name,
                contact: p.client_contact_name || 'No contact',
                pipeline: p.total_amount || 0,
                nextSteps: stepsByPursuit.get(p.id) ?? [],
                grants: (od.opportunities || []).map((o: any) => ({
                  id: o.id,
                  name: o.name,
                  amount: o.amount || 0,
                  awardedAmount: o.awarded_amount ?? null,
                  status: o.status,
                  narrativeStatus: o.narrative_status,
                  forwardingStatus: o.forwarding_email_status,
                })),
              }))
          )
        )

        // Anything needing a person first, then by what the school is worth.
        data.sort((a, b) => {
          const aOpen = a.nextSteps.filter(s => !s.inProgress).length
          const bOpen = b.nextSteps.filter(s => !s.inProgress).length
          if (aOpen > 0 && bOpen === 0) return -1
          if (bOpen > 0 && aOpen === 0) return 1
          return b.pipeline - a.pipeline
        })
        setSchools(data)
      })
      .catch(() => setError('The pipeline could not be read.'))
  }, [])

  useEffect(() => { load() }, [load])

  // Close a card for work that happened outside the portal.
  //
  // Bella sent an application to a school by hand on a Friday and the board
  // went on asking her to send it, because the only way to close an item was
  // inside the school panel. She read that as a queue that would not clear.
  //
  // This is the same markDone path that panel uses, so the question guard
  // still applies: an item that is a question cannot close here without an
  // answer, and the route says so. That answer belongs on the item, not in a
  // board card, so those are sent to the panel rather than closed from here.
  const markDone = useCallback(async (item: { pursuitId: string; actionItemId?: string | null; label: string }) => {
    if (!item.actionItemId) return
    setMarkingDoneId(item.actionItemId)
    setCloseNote(null)
    try {
      const res = await fetch(`/api/funding/pursuits/${item.pursuitId}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: item.actionItemId, markDone: true }),
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok || out.error) {
        // The guard refused, and it is right to. Say what it wants and where.
        setCloseNote(
          typeof out.error === 'string'
            ? `${out.error} Open it to record that.`
            : 'That did not close.'
        )
        return
      }
      load()
    } catch {
      setCloseNote('That did not close.')
    } finally {
      setMarkingDoneId(null)
    }
  }, [load])

  if (error) return <p style={{ color: '#6B7280', fontSize: 14 }}>{error}</p>
  if (schools === null) return <p style={{ color: '#6B7280', fontSize: 14 }}>Loading.</p>

  return (
    <>
      {closeNote && (
        <div
          role="alert"
          style={{
            background: '#FDF4E3', border: '1px solid #EBD7A8', color: '#7A4A12',
            borderRadius: 8, padding: '10px 14px', fontSize: 13.5, marginBottom: 12,
          }}
        >
          {closeNote}
        </div>
      )}
    <NeedsYouBoard
      schools={schools}
      onMarkDone={markDone}
      markingDoneId={markingDoneId}
      onWriteToSchool={item =>
        router.push(
          `/tdi-admin/funding/${item.pursuitId}?open=actions&action=${item.actionItemId}&write=1`
        )
      }
      onOpenItem={item => {
        const base = `/tdi-admin/funding/${item.pursuitId}`
        if (item.actionItemId) { router.push(`${base}?open=actions&action=${item.actionItemId}`); return }
        if (item.opportunityId) { router.push(`${base}?open=paths&opp=${item.opportunityId}`); return }
        router.push(base)
      }}
    />
    </>
  )
}
