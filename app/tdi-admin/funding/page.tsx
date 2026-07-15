'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FundingPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/tdi-admin/funding/queue')
  }, [router])

  return (
    <div style={{ padding: '32px 48px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading your work queue...</div>
    </div>
  )
}
