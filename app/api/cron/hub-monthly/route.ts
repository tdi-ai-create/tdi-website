import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { guardCron } from '@/lib/cron-guard'
import { optedOutEmails, unsubscribeUrl } from '@/lib/hub-email-optout'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * The monthly Hub issue, for members who are not creators.
 *
 * The Creator Studio issue is built around a person's next step. A Hub member
 * has no next step, so sending them the same email would be sending them the
 * empty half of it. This one does a different job: one thing genuinely worth
 * their time, one idea, and an invitation to make something themselves.
 *
 * The invitation is the point. Creator recruitment works here and not in a cold
 * campaign, because the reader has just been handed something an educator made
 * and can see for themselves that it was worth making.
 *
 * NOT SCHEDULED. There is no vercel.json entry for this route on purpose. It
 * runs only when somebody calls it, and it is expected to be dry run against
 * production first. Adding the schedule is a deliberate, separate act.
 *
 *   ?dryRun=1                     what would go, to whom, and the rendered email
 *   ?dryRun=1&previewAs=<email>   that person's copy
 */

const EMAIL_TYPE = 'hub_monthly'
const ACTIVE_WINDOW_DAYS = 30

/** A month index picks the idea, so the same reader is not told the same thing twice. */
const IDEAS = [
  { title: 'Set a tiny deadline', body: 'Don\'t set a deadline to "finish the unit." Set one to "write the first three bullet points for lesson one." Small deadlines create momentum.' },
  { title: 'Name the one thing', body: 'Before you leave the room, write down the single thing that has to happen tomorrow. Not the list. The one thing. The list will still be there.' },
  { title: 'Borrow before you build', body: 'The lesson you are about to make from scratch almost certainly exists. Ten minutes looking is worth two hours building.' },
  { title: 'Protect the first ten minutes', body: 'Whatever you do in the first ten minutes of your planning period sets the tone for the whole thing. Do not open email in them.' },
  { title: 'Say the quiet part to a colleague', body: 'The thing you think only you are struggling with is almost never only you. Naming it out loud to one person changes the size of it.' },
  { title: 'Keep a done list', body: 'A to-do list is a record of everything you have not finished. A done list is a record of what you actually carried. Keep both in September.' },
]

export async function GET(request: NextRequest) {
  const guard = guardCron(request)
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status })
  const { dryRun } = guard

  const hubUrl = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!hubUrl || !hubKey) {
    return NextResponse.json({ error: 'Learning Hub credentials are not configured' }, { status: 500 })
  }
  const hub = createClient(hubUrl, hubKey, { auth: { autoRefreshToken: false, persistSession: false } })

  const now = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const windowStart = new Date(now.getTime() - ACTIVE_WINDOW_DAYS * 86400000).toISOString()

  // Who actually uses the Hub.
  //
  // Not hub_memberships.status. 102,079 rows carry 'active' because that is the
  // default the Substack import wrote, while only 705 people have ever done a
  // single thing. Mailing on that flag would be mailing a hundred thousand
  // strangers from the domain we also send invoices from.
  const { data: recentActivity, error: activityError } = await hub
    .from('hub_activity_log')
    .select('user_id')
    .gte('created_at', windowStart)
  if (activityError) {
    return NextResponse.json({ error: `Could not read activity: ${activityError.message}` }, { status: 500 })
  }

  const activeIds = [...new Set((recentActivity ?? []).map((r) => r.user_id).filter(Boolean))]
  if (activeIds.length === 0) {
    return NextResponse.json({ success: true, sent: 0, message: 'Nobody has been active in the window' })
  }

  const { data: profiles, error: profileError } = await hub
    .from('hub_profiles')
    .select('id, email, first_name, display_name, is_test_account')
    .in('id', activeIds)
  if (profileError) {
    return NextResponse.json({ error: `Could not read profiles: ${profileError.message}` }, { status: 500 })
  }

  // Already had this month's issue. The Creator newsletter shipped without this
  // and mailed 27 people the same thing three times, twice within 40 seconds.
  const { data: alreadySent, error: sentError } = await hub
    .from('hub_email_sent_log')
    .select('user_id')
    .eq('email_type', EMAIL_TYPE)
    .gte('created_at', monthStart)
  if (sentError) {
    return NextResponse.json({ error: `Could not read the send log: ${sentError.message}` }, { status: 500 })
  }
  const had = new Set((alreadySent ?? []).map((r) => r.user_id))

  const optedOut = await optedOutEmails(hub, EMAIL_TYPE)
  if (optedOut === null) {
    // Stop rather than guess. Mailing someone who left is worse than not sending.
    return NextResponse.json({ error: 'Could not read opt outs, refusing to send' }, { status: 500 })
  }

  const recipients = (profiles ?? []).filter(
    (p) =>
      p.email &&
      !p.is_test_account &&
      !had.has(p.id) &&
      !optedOut.has(String(p.email).trim().toLowerCase())
  )

  // Something real to open, chosen from what is published rather than invented.
  const { data: picks } = await hub
    .from('hub_quick_wins')
    .select('title, slug, description, category')
    .eq('is_published', true)
    .not('description', 'is', null)
    .order('created_at', { ascending: false })
    .limit(40)

  const featured = (picks ?? []).find((q) => (q.description ?? '').length > 60) ?? (picks ?? [])[0] ?? null
  const idea = IDEAS[now.getMonth() % IDEAS.length]
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'

  const buildHtml = (person: { email: string; first_name?: string | null; display_name?: string | null }) => {
    const first =
      (person.first_name ?? '').trim() ||
      (person.display_name ?? '').trim().split(/\s+/)[0] ||
      'there'
    return `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <div style="background: #1e2749; color: white; padding: 24px 28px; border-radius: 12px 12px 0 0;">
          <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8;">TDI Learning Hub</p>
          <h1 style="margin: 6px 0 0; font-size: 22px; font-weight: 700;">This Month in the Hub</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">${monthName}</p>
        </div>
        <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 15px; line-height: 1.7;">Hi ${first},</p>
          <p style="font-size: 15px; line-height: 1.7;">One thing worth your time this month, and one thing worth thinking about.</p>
          ${featured ? `
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; margin: 0 0 8px; font-weight: 600;">Picked for this month</p>
            <p style="font-size: 17px; font-weight: 700; color: #1e2749; margin: 0 0 6px;">${featured.title}</p>
            <p style="color: #1e3a5f; margin: 0 0 14px; line-height: 1.6;">${featured.description}</p>
            <a href="${site}/hub/quick-wins/${featured.slug}" style="display: inline-block; background: #1e2749; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Open it in the Hub</a>
          </div>` : ''}
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 8px; font-weight: 600;">From an educator</p>
            <p style="font-size: 16px; font-weight: 700; color: #1e2749; margin: 0 0 6px;">${idea.title}</p>
            <p style="color: #475569; margin: 0; line-height: 1.6; font-size: 14px;">${idea.body}</p>
          </div>
          <div style="border-top: 1px solid #e5e7eb; margin: 26px 0 0; padding-top: 22px;">
            <p style="font-size: 16px; font-weight: 700; color: #1e2749; margin: 0 0 8px;">You already know something worth sharing</p>
            <p style="color: #475569; margin: 0 0 14px; line-height: 1.65; font-size: 14.5px;">
              Every tool in the Hub was made by a teacher who assumed their idea was too obvious to bother writing down.
              If you have a skill, a reminder or a trick that works in your room, we will help you turn it into something
              other educators can use. Tell us the idea and we take it from there.
            </p>
            <a href="${site}/create-with-us" style="display: inline-block; background: #ffba06; color: #1e2749; padding: 11px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700;">Share what works for you</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin: 26px 0 0; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
            Teachers Deserve It &middot; Learning Hub<br>
            You are getting this because you have used the Hub recently.
            <a href="${unsubscribeUrl(person.email, site)}" style="color: #9ca3af;">Unsubscribe</a>.
          </p>
        </div>
      </div>`
  }

  const previewAs = request.nextUrl.searchParams.get('previewAs')?.toLowerCase() ?? null
  const subject = featured
    ? `${featured.title}, and one idea worth stealing`
    : `This month in the Hub, ${monthName}`

  if (dryRun) {
    const subjectPerson =
      (previewAs ? recipients.find((p) => String(p.email).toLowerCase() === previewAs) : null) ??
      recipients[0] ??
      null
    return NextResponse.json({
      success: true,
      dryRun: true,
      subject,
      activeInWindow: activeIds.length,
      wouldSend: recipients.length,
      skippedAlreadyThisMonth: (profiles ?? []).filter((p) => had.has(p.id)).length,
      skippedOptedOut: (profiles ?? []).filter((p) => optedOut.has(String(p.email ?? '').trim().toLowerCase())).length,
      featured: featured ? { title: featured.title, slug: featured.slug } : null,
      previewFor: subjectPerson?.email ?? null,
      html: subjectPerson ? buildHtml(subjectPerson as any) : null,
    })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return NextResponse.json({ error: 'Resend is not configured' }, { status: 500 })

  let sent = 0
  const failures: string[] = []
  for (const person of recipients) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'TDI Learning Hub <hub@teachersdeserveit.com>',
          to: [person.email],
          subject,
          html: buildHtml(person as any),
          reply_to: 'hello@teachersdeserveit.com',
          // Mail clients render their own unsubscribe control from these, which
          // is where most people will click. Without them a reader who wants out
          // reaches for the spam button instead, and that costs the whole domain.
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl(person.email, site)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }),
      })
      if (!res.ok) {
        failures.push(`${person.email}: ${res.status}`)
        continue
      }
      // Logged only after Resend accepted it, so a failure is retried next run
      // rather than recorded as delivered.
      const { error: logError } = await hub
        .from('hub_email_sent_log')
        .insert({ user_id: person.id, email_type: EMAIL_TYPE })
      if (logError) console.error('[hub-monthly] send log write failed:', logError.message)
      sent++
    } catch (err) {
      failures.push(`${person.email}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  console.log(`[hub-monthly] Sent ${sent}/${recipients.length}, ${failures.length} failed`)
  return NextResponse.json({ success: true, sent, attempted: recipients.length, failures: failures.slice(0, 20) })
}
