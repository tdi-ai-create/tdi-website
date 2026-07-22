'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import type { FullOpportunity } from '../OpportunityDetailPanel'

interface QuotePackage {
  package_name: string
  total_amount: number
  line_items: { label: string; quantity: number; unit_price: number; total: number; is_complimentary: boolean }[] | null
}

interface Quote {
  id: string
  quote_number: string
  title: string
  status: string
  sent_at: string | null
  expires_at: string | null
  created_at: string
  po_number: string | null
  quote_packages: QuotePackage[]
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Draft' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent' },
  viewed: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Viewed' },
  signed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Signed' },
  expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
}

interface Props {
  opp: FullOpportunity
}

export function ContractsTab({ opp }: Props) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const contactEmail = (opp as any).contact_email as string | null | undefined

  useEffect(() => {
    if (!contactEmail) {
      setQuotes([])
      setLoading(false)
      return
    }
    loadQuotes(contactEmail)
  }, [contactEmail])

  async function loadQuotes(email: string) {
    setLoading(true)
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('quotes')
        .select('id, quote_number, title, status, sent_at, expires_at, created_at, po_number, quote_packages(package_name, total_amount, line_items)')
        .ilike('contact_email', email)
        .order('created_at', { ascending: false })
      setQuotes((data as Quote[]) || [])
    } catch {
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  function copyLink(quoteId: string) {
    const url = `${window.location.origin}/quotes/${quoteId}`
    navigator.clipboard.writeText(url)
    setCopiedId(quoteId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function totalAmount(q: Quote): number {
    return q.quote_packages?.reduce((sum, pkg) => sum + (pkg.total_amount || 0), 0) ?? 0
  }

  function formatDate(d: string | null): string {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-lg" />
        <div className="h-24 bg-gray-100 rounded-lg" />
      </div>
    )
  }

  if (!contactEmail) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-400">No contact email set. Add a contact email to see linked contracts.</p>
      </div>
    )
  }

  if (quotes.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500 font-medium">No contracts yet</p>
        <p className="text-xs text-gray-400 mt-1">Contracts sent to {contactEmail} will appear here.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {quotes.map(q => {
        const status = STATUS_STYLES[q.status] || STATUS_STYLES.draft
        const isExpired = q.expires_at && new Date(q.expires_at) < new Date() && q.status !== 'signed'
        const displayStatus = isExpired ? STATUS_STYLES.expired : status
        const total = totalAmount(q)

        return (
          <div key={q.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{q.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{q.quote_number}</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${displayStatus.bg} ${displayStatus.text}`}>
                {displayStatus.label}
              </span>
            </div>

            {/* Amount */}
            {total > 0 && (
              <p className="text-lg font-bold text-gray-900 mt-2">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}

            {/* Dates */}
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              {q.sent_at && <span>Sent {formatDate(q.sent_at)}</span>}
              {q.expires_at && (
                <span className={isExpired ? 'text-red-500' : ''}>
                  {isExpired ? 'Expired' : 'Expires'} {formatDate(q.expires_at)}
                </span>
              )}
              {!q.sent_at && <span>Created {formatDate(q.created_at)}</span>}
            </div>

            {/* PO Number inline edit */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-gray-400 shrink-0">PO #</span>
              <input
                defaultValue={q.po_number || ''}
                placeholder="None"
                onBlur={async (e) => {
                  const val = e.target.value.trim() || null
                  if (val === (q.po_number || null)) return
                  const supabase = getSupabase()
                  await supabase.from('quotes').update({ po_number: val, updated_at: new Date().toISOString() }).eq('id', q.id)
                  setQuotes(prev => prev.map(qq => qq.id === q.id ? { ...qq, po_number: val } : qq))
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1 w-36 text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Packages / line items */}
            {q.quote_packages && q.quote_packages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                {q.quote_packages.map((pkg, i) => (
                  <div key={i}>
                    <p className="text-xs font-medium text-gray-700">{pkg.package_name}</p>
                    {pkg.line_items && Array.isArray(pkg.line_items) && pkg.line_items.map((li, j) => (
                      li.label && (
                        <div key={j} className="flex justify-between text-xs text-gray-500 ml-3 mt-0.5">
                          <span>{li.label} {li.quantity > 1 ? `x${li.quantity}` : ''}</span>
                          <span>${li.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => copyLink(q.id)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                {copiedId === q.id ? 'Copied!' : 'Copy Link'}
              </button>
              <a
                href={`/quotes/${q.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1.5 rounded-md border border-gray-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
              >
                Preview
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}
