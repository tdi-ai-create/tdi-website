import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { isOnAllowlist, ALLOWLIST_ENABLED } from '@/lib/funding-followup-email'

/**
 * POST /api/funding/send-email
 *
 * Send a custom email from the funding portal. Used for intro emails,
 * follow-ups, and other ad-hoc outreach that Bella drafts in the portal.
 *
 * Body: { to, toName, subject, body, schoolName }
 * Body is plain text — converted to styled HTML before sending.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { to, toName, subject, body, schoolName, pursuitId } = await request.json()

  if (!to || !subject || !body) {
    return NextResponse.json({ error: 'Missing required fields: to, subject, body' }, { status: 400 })
  }

  // Allowlist check
  if (ALLOWLIST_ENABLED && !isOnAllowlist(to)) {
    return NextResponse.json({
      error: `Recipient ${to} is not on the send allowlist. Contact Rae to add them.`,
      sent: false,
    })
  }

  // Convert plain text body to styled HTML
  const htmlBody = buildEmailHtml(body, toName || to.split('@')[0])

  // Send via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ error: 'Email service not configured (RESEND_API_KEY missing)' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bella — Teachers Deserve It <noreply@teachersdeserveit.com>',
        reply_to: 'hello@teachersdeserveit.com',
        to: [to],
        subject,
        html: htmlBody,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Email send failed: ${err}`, sent: false })
    }

    // Mark intro_sent_at on the pursuit if pursuitId provided
    if (pursuitId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      await supabase
        .from('funding_pursuits')
        .update({ intro_sent_at: new Date().toISOString() })
        .eq('id', pursuitId)
    }

    return NextResponse.json({ sent: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, sent: false })
  }
}

function buildEmailHtml(plainText: string, recipientName: string): string {
  // Convert plain text to paragraphs
  const paragraphs = plainText
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => `<p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #F9FAFB; margin: 0; padding: 0;">
  <div style="max-width: 580px; margin: 0 auto; padding: 32px 24px;">
    <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E5E7EB;">
      <div style="margin-bottom: 24px;">
        <img src="https://www.teachersdeserveit.com/tdi-logo.png" alt="Teachers Deserve It" style="height: 40px;" />
      </div>
      ${paragraphs}
    </div>
    <div style="text-align: center; padding: 16px; color: #9CA3AF; font-size: 11px;">
      Teachers Deserve It | hello@teachersdeserveit.com
    </div>
  </div>
</body>
</html>`
}
