'use client'

import { usePathname } from 'next/navigation'
import Desi from './Desi'

export default function DesiWrapper() {
  const pathname = usePathname()

  // Exclude from admin portals, partner dashboards, and creator portal
  if (
    pathname?.startsWith('/tdi-admin') ||
    pathname?.startsWith('/partners') ||
    pathname?.startsWith('/creator-portal') ||
    pathname?.startsWith('/hub/admin') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/invoice')
  ) {
    return null
  }

  return <Desi />
}
