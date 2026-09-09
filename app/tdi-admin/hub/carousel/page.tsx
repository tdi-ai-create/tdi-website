'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type SlideRef = { index: number; kind: string; chars: number; url: string }
type Payload = {
  id: string
  title: string | null
  slide_count: number
  problems: string[]
  renderable: boolean
  slides: SlideRef[]
}

export default function CarouselPreview() {
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const [data, setData] = useState<Payload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/tdi-admin/carousel-preview?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(j => { if (j.error) setError(j.error); else setData(j) })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-[#1e2749]">Carousel preview</h1>
        <Link href="/tdi-admin/hub/schedule" className="text-sm text-[#5B6B8C] hover:underline">
          Back to the calendar
        </Link>
      </div>
      <p className="text-sm text-[#6B7684] mb-5 max-w-[70ch]">
        The slides as they will actually post, built from the draft rather than described. Slides are
        separated by a blank line in the draft: the first is the hook, the last is the ask.
      </p>

      {!id && (
        <p className="text-sm text-[#6B7684]">
          Open this from a carousel on the calendar, or add <span className="font-mono">?id=</span> to the address.
        </p>
      )}
      {loading && <p className="text-sm text-[#6B7684]">Loading…</p>}
      {error && (
        <div className="mb-4 p-3 rounded border border-[#9E3B3B] bg-[#F8E7E6] text-sm">{error}</div>
      )}

      {data && (
        <>
          <div className="mb-4">
            <div className="font-semibold text-[#1e2749]">{data.title || '(untitled)'}</div>
            <div className="text-sm text-[#6B7684]">{data.slide_count} slides</div>
          </div>

          {data.problems.length > 0 && (
            <div className="mb-5 p-3 rounded border border-[#96631A] bg-[#F8F0DF] text-sm text-[#1e2749]">
              <strong>This cannot be built yet.</strong>
              <ul className="mt-2 list-disc pl-5">
                {data.problems.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {data.renderable && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {data.slides.map(s => (
                <figure key={s.index} className="shrink-0 w-[240px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/tdi-admin/carousel-preview?id=${encodeURIComponent(data.id)}&slide=${s.index}`}
                    alt={`Slide ${s.index} of ${data.slide_count}`}
                    width={240} height={300}
                    className="w-[240px] h-auto rounded border border-[#D8DDE3] bg-white"
                  />
                  <figcaption className="text-[11px] text-[#6B7684] mt-1.5">
                    {s.index}. {s.kind} · {s.chars} characters
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
