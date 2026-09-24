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

  if (error) return <p style={{ color: '#6B7280', fontSize: 14 }}>{error}</p>
  if (schools === null) return <p style={{ color: '#6B7280', fontSize: 14 }}>Loading.</p>

  return (
    <NeedsYouBoard
      schools={schools}
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
  )
}
