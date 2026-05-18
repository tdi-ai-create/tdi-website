import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getGmailAccessToken, listRecentMessages, getMessageMeta } from '@/lib/gmail'

const RAE_EMAIL = 'rae@teachersdeserveit.com'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const accessToken = await getGmailAccessToken(supabaseUrl, serviceKey)

    const { data: lastRow } = await supabase
      .from('email_log')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const afterEpoch = lastRow
      ? Math.floor(new Date(lastRow.date).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 86400

    const messages = await listRecentMessages(accessToken, afterEpoch)

    if (messages.length === 0) {
      return NextResponse.json({ synced: 0, matched: 0 })
    }

    const { data: existingIds } = await supabase
      .from('email_log')
      .select('gmail_message_id')
      .in('gmail_message_id', messages.map(m => m.id))

    const existing = new Set((existingIds ?? []).map(r => r.gmail_message_id))
    const newMessages = messages.filter(m => !existing.has(m.id))

    if (newMessages.length === 0) {
      return NextResponse.json({ synced: 0, matched: 0, reason: 'all_known' })
    }

    const { data: opportunities } = await supabase
      .from('sales_opportunities')
      .select('id, contact_email')
      .not('contact_email', 'is', null)

    const emailToOpp = new Map<string, string>()
    for (const opp of opportunities ?? []) {
      if (opp.contact_email) {
        emailToOpp.set(opp.contact_email.toLowerCase(), opp.id)
      }
    }

    const { data: matchedThreads } = await supabase
      .from('email_log')
      .select('gmail_thread_id, opportunity_id')
      .not('opportunity_id', 'is', null)
      .in('gmail_thread_id', newMessages.map(m => m.threadId))

    const threadToOpp = new Map<string, string>()
    for (const t of matchedThreads ?? []) {
      threadToOpp.set(t.gmail_thread_id, t.opportunity_id)
    }

    let synced = 0
    let matched = 0

    for (const msg of newMessages) {
      try {
        const meta = await getMessageMeta(accessToken, msg.id)
        const allAddresses = [meta.from, ...meta.to, ...meta.cc]
        const isFromRae = meta.from === RAE_EMAIL
        const direction = isFromRae ? 'outbound' : 'inbound'

        let opportunityId: string | null = null
        let matchedOn: string | null = null

        for (const addr of allAddresses) {
          if (addr === RAE_EMAIL) continue
          const oppId = emailToOpp.get(addr)
          if (oppId) {
            opportunityId = oppId
            matchedOn = 'exact_email'
            break
          }
        }

        if (!opportunityId && threadToOpp.has(meta.threadId)) {
          opportunityId = threadToOpp.get(meta.threadId)!
          matchedOn = 'thread_id'
        }

        let parsedDate: string
        try {
          parsedDate = new Date(meta.date).toISOString()
        } catch {
          parsedDate = new Date().toISOString()
        }

        const { error: insertErr } = await supabase.from('email_log').insert({
          gmail_message_id: meta.id,
          gmail_thread_id: meta.threadId,
          from_email: meta.from,
          to_emails: meta.to,
          cc_emails: meta.cc,
          subject: meta.subject,
          date: parsedDate,
          snippet: meta.snippet,
          body_plain: null,
          direction,
          opportunity_id: opportunityId,
          matched_on: matchedOn,
        })

        if (insertErr) {
          console.error(`[email-sync] Insert failed for ${meta.id}:`, insertErr.message)
          continue
        }

        synced++

        if (opportunityId) {
          matched++
          threadToOpp.set(meta.threadId, opportunityId)

          await supabase
            .from('sales_opportunities')
            .update({ last_activity_at: parsedDate })
            .eq('id', opportunityId)

          await supabase.from('opportunity_activity').insert({
            opportunity_id: opportunityId,
            actor_email: meta.from,
            activity_type: 'email_synced',
            description: `${direction === 'outbound' ? 'Sent' : 'Received'}: ${meta.subject || '(no subject)'}`,
          })
        }
      } catch (msgErr) {
        console.error(`[email-sync] Error processing message ${msg.id}:`, msgErr)
      }
    }

    console.log(`[email-sync] Done: ${synced} synced, ${matched} matched to opportunities`)
    return NextResponse.json({ synced, matched })
  } catch (err) {
    console.error('[email-sync] Cron error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Email sync failed' },
      { status: 500 },
    )
  }
}
