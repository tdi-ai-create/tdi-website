import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyUnsubscribeToken } from '@/lib/hub-email-optout'

export const dynamic = 'force-dynamic'

/**
 * One click and they are out.
 *
 * No sign in, no confirmation step, no "are you sure". A person who wants to
 * stop hearing from us has already decided, and every extra step is a reason to
 * mark the mail as spam instead, which costs the whole domain.
 *
 * POST exists because mail clients offer one-click unsubscribe through the
 * List-Unsubscribe-Post header and will use it without ever rendering a page.
 */

function page(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title}</title></head>
     <body style="font-family:-apple-system,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:64px 20px;color:#1e2749">
       <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:32px">
         <h1 style="margin:0 0 12px;font-size:21px">${title}</h1>
         <p style="margin:0;color:#4b5563;line-height:1.65;font-size:15px">${body}</p>
       </div>
     </body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

async function optOut(email: string, token: string) {
  if (!email || !token) return page('Something is missing', 'That link is incomplete. Reply to any of our emails and we will take you off by hand.', 400)
  if (!verifyUnsubscribeToken(email, token)) {
    return page('That link did not check out', 'It may have been altered in transit. Reply to any of our emails and we will take you off by hand.', 400)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL!,
    process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const clean = email.trim().toLowerCase()
  const { error } = await supabase
    .from('hub_email_optouts')
    .upsert({ email: clean, email_type: 'all', source: 'link' }, { onConflict: 'email' })

  // Never tell someone they are unsubscribed when the write failed. They would
  // keep receiving mail believing they had left, which is how a complaint turns
  // into a spam report.
  if (error) {
    console.error('[hub-unsubscribe] write failed:', error.message)
    return page('We could not save that', 'Something went wrong on our end. Reply to any of our emails and we will take you off by hand.', 500)
  }

  return page(
    'You are unsubscribed',
    `We will not send <strong>${clean}</strong> any more Hub email. Nothing else changes: your account and everything you have saved stay exactly as they are.`
  )
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  return optOut(p.get('e') ?? '', p.get('t') ?? '')
}

export async function POST(request: NextRequest) {
  const p = request.nextUrl.searchParams
  return optOut(p.get('e') ?? '', p.get('t') ?? '')
}
