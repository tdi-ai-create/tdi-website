'use client'

/**
 * The funding chrome bar.
 *
 * Shared so the board is not a dead end. Funding Home switches Calendar and
 * Schools in place, so there it hands in `onView` and they are buttons. The
 * board is its own route and cannot switch a view it does not have, so there
 * they are links back to Funding Home, and `?view=schools` tells it which one
 * to open.
 */

import Link from 'next/link'
import './funding-home.css'

export type FundingView = 'cal' | 'schools' | 'queue' | 'funders' | 'awarded' | 'board'

const VIEWS: { key: Exclude<FundingView, 'board'>; label: string }[] = [
  { key: 'cal', label: 'Calendar' },
  { key: 'schools', label: 'Schools' },
  { key: 'queue', label: 'Queue' },
  { key: 'funders', label: 'Funders' },
  { key: 'awarded', label: 'Awarded' },
]

export default function FundingChrome({ active, onView }: {
  active: FundingView
  onView?: (v: Exclude<FundingView, 'board'>) => void
}) {
  return (
    <div className="fh">
      <header className="top">
        <div className="brand">TDI Funding <span>/ admin</span></div>
        <nav>
          {onView
            ? VIEWS.map(v => (
                <button key={v.key} aria-current={active === v.key} onClick={() => onView(v.key)}>
                  {v.label}
                </button>
              ))
            : VIEWS.map(v => (
                <Link
                  key={v.key}
                  className="navlink"
                  href={v.key === 'cal' ? '/tdi-admin/funding' : `/tdi-admin/funding?view=${v.key}`}
                >
                  {v.label}
                </Link>
              ))}
          {active === 'board' ? (
            <button aria-current="true" style={{ cursor: 'default' }}>Board</button>
          ) : (
            <Link className="navlink" href="/tdi-admin/funding/board">Board</Link>
          )}
        </nav>
      </header>
    </div>
  )
}
