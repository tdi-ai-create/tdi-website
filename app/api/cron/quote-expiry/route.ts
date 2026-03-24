import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const TDI_STATS = `
  <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
    <p style="font-weight: 600; color: #1a1a1a; margin: 0 0 8px;">Why schools choose TDI:</p>
    <ul style="margin: 0; padding-left: 20px; color: #4a4a4a; font-size: 14px;">
      <li>80% of partner schools find over $35K in funding</li>
      <li>Teachers report measurable reductions in stress and burnout</li>
      <li>Principals see increased staff retention and morale</li>
      <li>One platform. One login. Every resource your team needs.</li>
    </ul>
  </div>
`

async function sendReminderEmail({
  to,
  contactName,
  districtName,
  quoteTitle,
  quoteUrl,
  daysOld,
  type,
}: {
  to: string
  contactName: string
  districtName: string
  quoteTitle: string
  quoteUrl: string
  daysOld: number
  type: '14day' | '21day' | 'expired'
}) {
  const subjects = {
    '14day': `${contactName}, your TDI proposal is waiting`,
    '21day': `Still thinking it over? We're here to help - ${districtName}`,
    'expired': `Your TDI proposal for ${districtName} has expired`,
  }

  const bodies = {
    '14day': `
      <p>Hi ${contactName},</p>
      <p>Just a friendly reminder that your TDI partnership proposal for <strong>${districtName}</strong> is ready and waiting for your review.</p>
      <p>We put a lot of care into building something that fits your school's specific goals - and we'd love to answer any questions you have before moving forward.</p>
      ${TDI_STATS}
      <p>Your proposal will remain active for the next ${30 - daysOld} days.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${quoteUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Review Your Proposal &rarr;
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px;">Questions? Reply to this email or reach out to Rae directly at rae@teachersdeserveit.com</p>
    `,
    '21day': `
      <p>Hi ${contactName},</p>
      <p>We know decisions like this take time - and we genuinely want to make sure this feels right for your school and your team.</p>
      <p>Your proposal for <strong>${districtName}</strong> is still available, and we're happy to jump on a quick call to walk through anything together.</p>
      ${TDI_STATS}
      <p style="color: #d97706; font-weight: 600;">Your proposal expires in ${30 - daysOld} days.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${quoteUrl}" style="background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Review Your Proposal &rarr;
        </a>
      </div>
    `,
    'expired': `
      <p>Hi ${contactName},</p>
      <p>Your TDI partnership proposal for <strong>${districtName}</strong> has expired after 30 days.</p>
      <p>We completely understand that timing isn't always right - and we'd love to reconnect when it is. If you'd like us to reissue a fresh proposal, just reply to this email and we'll take care of it.</p>
      <p>We're rooting for your teachers and your school - whenever you're ready, we'll be here.</p>
      <p style="color: #6b7280; font-size: 13px;">Rae Hughart | Teachers Deserve It | rae@teachersdeserveit.com</p>
    `,
  }

  await getResend().emails.send({
    from: 'Rae Hughart <rae@teachersdeserveit.com>',
    to: [to],
    subject: subjects[type],
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height: 40px; margin-bottom: 24px;" />
        ${bodies[type]}
      </div>
    `,
  })
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date()
  const results = { flagged_at_risk: 0, reminder_14_sent: 0, reminder_21_sent: 0, expired: 0 }

  // Get all active sent quotes
  const { data: activeQuotes } = await supabase
    .from('quotes')
    .select('*')
    .in('status', ['sent', 'viewed'])
    .not('sent_at', 'is', null)

  for (const quote of activeQuotes ?? []) {
    const sentAt = new Date(quote.sent_at)
    const daysOld = Math.floor((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24))
    const quoteUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.teachersdeserveit.com'}/invoice/${quote.id}`

    // Day 30: Expire
    if (daysOld >= 30 && !quote.expiry_notice_sent_at) {
      await supabase.from('quotes').update({
        status: 'expired',
        expiry_notice_sent_at: now.toISOString(),
      }).eq('id', quote.id)

      if (quote.contact_email) {
        await sendReminderEmail({
          to: quote.contact_email,
          contactName: quote.contact_name ?? 'there',
          districtName: quote.title,
          quoteTitle: quote.title,
          quoteUrl,
          daysOld,
          type: 'expired',
        })
      }
      results.expired++
      continue
    }

    // Day 21: Second reminder
    if (daysOld >= 21 && !quote.reminder_21_sent_at) {
      await supabase.from('quotes').update({
        reminder_21_sent_at: now.toISOString(),
      }).eq('id', quote.id)

      if (quote.contact_email) {
        await sendReminderEmail({
          to: quote.contact_email,
          contactName: quote.contact_name ?? 'there',
          districtName: quote.title,
          quoteTitle: quote.title,
          quoteUrl,
          daysOld,
          type: '21day',
        })
      }
      results.reminder_21_sent++
    }

    // Day 14: At-risk flag + first reminder
    if (daysOld >= 14 && !quote.reminder_14_sent_at) {
      await supabase.from('quotes').update({
        at_risk_flagged_at: now.toISOString(),
        reminder_14_sent_at: now.toISOString(),
      }).eq('id', quote.id)

      if (quote.contact_email) {
        await sendReminderEmail({
          to: quote.contact_email,
          contactName: quote.contact_name ?? 'there',
          districtName: quote.title,
          quoteTitle: quote.title,
          quoteUrl,
          daysOld,
          type: '14day',
        })
      }
      results.flagged_at_risk++
      results.reminder_14_sent++
    }
  }

  return NextResponse.json({ success: true, ...results })
}
