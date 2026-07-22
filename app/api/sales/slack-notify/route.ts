import { NextRequest, NextResponse } from 'next/server'
import { quoteDrafted, quoteSent } from '@/lib/sales-slack'

export async function POST(request: NextRequest) {
  try {
    const { event, org, title, amount, contactName, quoteNumber } = await request.json()

    if (event === 'drafted') {
      await quoteDrafted(quoteNumber || 'NEW', org || '', title || '', Number(amount) || 0)
    } else if (event === 'sent') {
      await quoteSent(quoteNumber || '', org || '', contactName || '', Number(amount) || 0)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[sales-slack-notify]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
