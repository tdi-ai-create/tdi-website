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

export type FundingView = 'cal' | 'schools' | 'board'

export default function FundingChrome({ active, onView }: {
  active: FundingView
  onView?: (v: 'cal' | 'schools') => void
}) {
  return (
    <div className="fh">
      <header className="top">
        <div className="brand">TDI Funding <span>/ admin</span></div>
        <nav>
          {onView ? (
            <>
              <button aria-current={active === 'cal'} onClick={() => onView('cal')}>Calendar</button>
              <button aria-current={active === 'schools'} onClick={() => onView('schools')}>Schools</button>
            </>
          ) : (
            <>
              <Link className="navlink" href="/tdi-admin/funding">Calendar</Link>
              <Link className="navlink" href="/tdi-admin/funding?view=schools">Schools</Link>
            </>
          )}
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
