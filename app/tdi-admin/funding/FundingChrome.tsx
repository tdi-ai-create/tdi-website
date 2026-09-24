'use client'

/**
 * The funding chrome bar.
 *
 * Funding Home switches views in place, so it hands in `onView` and these are
 * buttons. Without it they are links carrying `?view=`, which is how anything
 * outside this screen points at one of its views.
 */

import Link from 'next/link'
import './funding-home.css'

export type FundingView = 'work' | 'cal' | 'schools' | 'queue' | 'funders' | 'awarded'

const VIEWS: { key: FundingView; label: string }[] = [
  { key: 'work', label: 'Work' },
  { key: 'cal', label: 'Calendar' },
  { key: 'schools', label: 'Schools' },
  { key: 'queue', label: 'Queue' },
  { key: 'funders', label: 'Funders' },
  { key: 'awarded', label: 'Awarded' },
]

export default function FundingChrome({ active, onView }: {
  active: FundingView
  onView?: (v: FundingView) => void
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
        </nav>
      </header>
    </div>
  )
}
