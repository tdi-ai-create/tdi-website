/**
 * Slack narration for the funding system.
 * Posts events to Slack when enabled; logs what would post when disabled (dry-run).
 * Also writes to funding_pursuit_timeline for the durable record.
 */

import { createClient } from '@supabase/supabase-js'

const LOG = '[funding-slack]'

// ── Settings ──

interface SlackSettings {
  slack_enabled: boolean
  slack_webhook_url: string | null
  slack_channel: string | null
  verbosity: 'verbose' | 'handoffs' | 'critical'
  bella_slack_handle: string | null
  rae_slack_handle: string | null
}

let cachedSettings: SlackSettings | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function loadSettings(): Promise<SlackSettings> {
  if (cachedSettings && Date.now() - cacheTime < CACHE_TTL) return cachedSettings
  const { data } = await db()
    .from('funding_notification_settings')
    .select('*')
    .limit(1)
    .single()
  cachedSettings = data || {
    slack_enabled: false, slack_webhook_url: null, slack_channel: null,
    verbosity: 'verbose', bella_slack_handle: null, rae_slack_handle: null,
  }
  cacheTime = Date.now()
  return cachedSettings!
}

// ── Verbosity filter ──

export type EventLevel = 'verbose' | 'handoffs' | 'critical'

function passesFilter(eventLevel: EventLevel, settingsVerbosity: string): boolean {
  if (settingsVerbosity === 'verbose') return true
  if (settingsVerbosity === 'handoffs') return eventLevel === 'handoffs' || eventLevel === 'critical'
  if (settingsVerbosity === 'critical') return eventLevel === 'critical'
  return true
}

// ── Daily digest ──

export type DigestAlert = {
  /** Which school, so a line is actionable without opening anything. */
  pursuitName?: string | null
  message: string
}

/**
 * The daily funding digest, posted to the grant channel.
 *
 * It used to email rae@teachersdeserveit.com and nobody else. Bella does the
 * work and lives in Slack, so the person who needed it never saw it, and the
 * person who saw it was not the one acting on it.
 *
 * Deliberately one post rather than one per alert. A digest that arrives as
 * fourteen separate messages is a notification storm people mute, and a muted
 * channel is worse than no channel.
 */
export async function postFundingDigest(
  critical: DigestAlert[],
  warnings: DigestAlert[],
): Promise<boolean> {
  const settings = await loadSettings()
  if (!settings.slack_enabled || !settings.slack_webhook_url) return false
  if (critical.length === 0 && warnings.length === 0) return false

  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'

  const line = (a: DigestAlert) =>
    a.pursuitName ? `• *${a.pursuitName}* — ${a.message}` : `• ${a.message}`

  const parts: string[] = []
  const headline =
    critical.length > 0
      ? `${critical.length} need${critical.length === 1 ? 's' : ''} attention today`
      : `${warnings.length} thing${warnings.length === 1 ? '' : 's'} to keep an eye on`
  parts.push(`*Funding digest* — ${headline}`)

  if (critical.length > 0) {
    parts.push('', '*Critical*', ...critical.map(line))
  }
  if (warnings.length > 0) {
    // Capped. A digest nobody finishes reading is a digest nobody reads.
    const shown = warnings.slice(0, 8)
    parts.push('', '*Worth watching*', ...shown.map(line))
    if (warnings.length > shown.length) {
      parts.push(`_and ${warnings.length - shown.length} more_`)
    }
  }

  // Bella is mentioned because she acts on it. Rae sees it in the channel
  // rather than in an inbox, which is what she asked for.
  if (settings.bella_slack_handle) {
    parts.push('', `<@${settings.bella_slack_handle}>`)
  }
  parts.push(`<${portalUrl}/tdi-admin/funding|Open the funding portal>`)

  try {
    const res = await fetch(settings.slack_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: parts.join('\n'),
        ...(settings.slack_channel ? { channel: settings.slack_channel } : {}),
      }),
    })
    if (!res.ok) {
      console.error('[funding-slack] digest post failed:', res.status, await res.text())
      return false
    }
    return true
  } catch (err) {
    console.error('[funding-slack] digest post threw:', err)
    return false
  }
}

// ── Event posting ──

export interface SlackEvent {
  pursuitId: string
  pursuitName: string
  message: string        // the narration line (markdown)
  level: EventLevel
  owner?: 'bella' | 'rae' | null  // who to @mention
  timelineTitle?: string  // for the timeline record
  timelineDetail?: string
}

export async function postFundingEvent(event: SlackEvent): Promise<void> {
  const settings = await loadSettings()

  // Build the full Slack message
  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'
  const pursuitLink = `<${portalUrl}/tdi-admin/funding/${event.pursuitId}|View pursuit>`

  let mention = ''
  if (event.owner === 'bella' && settings.bella_slack_handle) {
    mention = ` <@${settings.bella_slack_handle}>`
  } else if (event.owner === 'rae' && settings.rae_slack_handle) {
    mention = ` <@${settings.rae_slack_handle}>`
  }

  const slackText = `*${event.pursuitName}* — ${event.message}${mention}\n${pursuitLink}`

  // Check verbosity filter
  if (!passesFilter(event.level, settings.verbosity)) {
    return
  }

  // Post or dry-run
  if (settings.slack_enabled && settings.slack_webhook_url) {
    try {
      await fetch(settings.slack_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: slackText,
          ...(settings.slack_channel ? { channel: settings.slack_channel } : {}),
        }),
      })
    } catch (err) {
      console.error(LOG, 'Slack post failed:', err)
    }
  } else {
    console.log(LOG, '[DRY RUN] Would post to Slack:', slackText)
  }

  // Write to timeline (durable record)
  if (event.timelineTitle) {
    try {
      // The error is destructured, not left to the catch below. Supabase
      // returns database errors rather than throwing them, so this try/catch
      // never fired for a failed insert and the timeline entry vanished while
      // the code looked careful. That is the shape that silently broke five
      // features in two days.
      const { error: timelineErr } = await db().from('funding_pursuit_timeline').insert({
        pursuit_id: event.pursuitId,
        event_date: new Date().toISOString().split('T')[0],
        event_title: event.timelineTitle,
        event_detail: event.timelineDetail || event.message,
        status: 'complete',
      })
      if (timelineErr) {
        console.error(LOG, 'Timeline write failed:', timelineErr.message)
      }
    } catch (err) {
      console.error(LOG, 'Timeline write failed:', err)
    }
  }
}

// ── Pre-built event helpers ──

export function narrativeEvent(pursuitId: string, pursuitName: string, oppName: string, fromStatus: string, toStatus: string, agent?: string): SlackEvent {
  const labels: Record<string, string> = {
    'not_started→requested': `Narrative draft requested for ${oppName}${agent ? ` → assigned to ${agent}` : ''}`,
    'requested→drafting': `${agent || 'Agent'} started drafting ${oppName} narrative`,
    'drafting→review': `${oppName} narrative drafted by ${agent || 'agent'} → now needs QA`,
    'review→qa_review': `${oppName} narrative sent to QA`,
    'qa_review→approval': `${oppName} passed QA${agent ? ` (${agent})` : ''} → needs your approval before it can go to the school`,
    'qa_review→escalated': `${oppName} failed QA twice${agent ? ` (${agent})` : ''} → needs a decision from you, with a recommendation attached`,
    'qa_review→ready': `${oppName} narrative approved → ready for submission`,
  }
  const key = `${fromStatus}→${toStatus}`
  const message = labels[key] || `${oppName} narrative: ${fromStatus} → ${toStatus}`

  // Which transitions hand work to a named person, and to whom.
  //
  // Being in this map at all makes the event a handoff rather than chatter, so
  // it survives a verbosity setting of 'handoffs'. The value is who gets an
  // @mention. null means the transition is a real handoff but there is nobody
  // waiting on it.
  //
  // The two that matter most were missing entirely. A narrative that passes QA
  // and one that exhausts its QA attempts both stop dead until Bella acts, and
  // both were posting as untagged chatter, so nothing told her. Two finished
  // applications sat unapproved for a day because of it.
  const HANDOFF_OWNER: Record<string, 'bella' | null> = {
    'drafting→review': 'bella',     // a draft exists and needs moving to QA
    'review→qa_review': null,       // now Julie's; nobody to chase
    'qa_review→approval': 'bella',  // passed, waiting on her approval
    'qa_review→escalated': 'bella', // QA is out of attempts, she decides
    'qa_review→ready': null,        // already approved; nothing owed
  }
  const isHandoff = key in HANDOFF_OWNER
  const owner = HANDOFF_OWNER[key] ?? null

  return {
    pursuitId, pursuitName, message,
    level: isHandoff ? 'handoffs' : 'verbose',
    owner: owner as any,
    timelineTitle: message,
  }
}

export function windowEvent(pursuitId: string, pursuitName: string, oppName: string, newStatus: string): SlackEvent {
  const closed = newStatus !== 'open' && newStatus !== 'unknown'
  const message = newStatus === 'open'
    ? `${oppName} window confirmed OPEN → ready for drafting/action`
    : `${oppName} window set to ${newStatus}${closed ? ' → pivot to alternatives' : ''}`

  return {
    pursuitId, pursuitName, message,
    level: closed ? 'critical' : 'handoffs',
    owner: 'bella',
    timelineTitle: `Window status: ${oppName} → ${newStatus}`,
  }
}

export function gateEvent(pursuitId: string, pursuitName: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: 'Alignment gate satisfied → all 5 conditions met, submission work can proceed',
    level: 'handoffs',
    owner: 'bella',
    timelineTitle: 'Gate satisfied',
    timelineDetail: 'Submitter, backup, admin sponsor named; both contracts signed',
  }
}

export function contactVerifiedEvent(pursuitId: string, pursuitName: string, contactName: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `${contactName} verified still employed`,
    level: 'verbose',
    timelineTitle: `Contact verified: ${contactName}`,
  }
}

export function actionCompletedEvent(pursuitId: string, pursuitName: string, actionTitle: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `Action completed: ${actionTitle}`,
    level: 'verbose',
    timelineTitle: `Completed: ${actionTitle}`,
  }
}

export function actionCancelledEvent(pursuitId: string, pursuitName: string, actionTitle: string, reason: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `Action cancelled: ${actionTitle} (${reason})`,
    level: 'verbose',
    timelineTitle: `Cancelled: ${actionTitle}`,
    timelineDetail: reason,
  }
}

export function nudgeSentEvent(pursuitId: string, pursuitName: string, actionTitle: string, recipientEmail: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `Nudge sent to ${recipientEmail} for "${actionTitle}"`,
    level: 'verbose',
    timelineTitle: `Nudge sent: ${actionTitle}`,
    timelineDetail: `To: ${recipientEmail}`,
  }
}

export function escalationEvent(pursuitId: string, pursuitName: string, actionTitle: string, fromRung: string, toRung: string, toEmail: string): SlackEvent {
  const isRae = toRung === 'rae'
  return {
    pursuitId, pursuitName,
    message: `"${actionTitle}" escalated ${fromRung} → ${toRung} (${toEmail})${isRae ? ' — final rung' : ''}`,
    level: isRae ? 'critical' : 'handoffs',
    owner: isRae ? 'rae' : 'bella',
    timelineTitle: `Escalated to ${toRung}: ${actionTitle}`,
    timelineDetail: `From ${fromRung} to ${toRung} (${toEmail})`,
  }
}

export function submittedEvent(pursuitId: string, pursuitName: string, oppName: string, proof?: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `${oppName} marked SUBMITTED${proof ? ` (${proof})` : ''}`,
    level: 'handoffs',
    owner: 'bella',
    timelineTitle: `Submitted: ${oppName}`,
    timelineDetail: proof,
  }
}

export function awardEvent(pursuitId: string, pursuitName: string, oppName: string, amount: number): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `${oppName} AWARDED $${amount.toLocaleString()} → needs allocation to line items`,
    level: 'critical',
    owner: 'rae',
    timelineTitle: `Awarded: ${oppName} — $${amount.toLocaleString()}`,
  }
}

export function denialEvent(pursuitId: string, pursuitName: string, oppName: string, reason?: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `${oppName} DENIED${reason ? ` — ${reason}` : ''}`,
    level: 'critical',
    timelineTitle: `Denied: ${oppName}`,
    timelineDetail: reason,
  }
}

export function allocationEvent(pursuitId: string, pursuitName: string, lineItem: string, amount: number, action: 'allocated' | 'delivered' | 'invoiced'): SlackEvent {
  const labels = { allocated: 'Allocated', delivered: 'Handed to trainer', invoiced: 'Handed to finance' }
  return {
    pursuitId, pursuitName,
    message: `${labels[action]}: $${amount.toLocaleString()} → ${lineItem}`,
    level: action === 'allocated' ? 'handoffs' : 'verbose',
    timelineTitle: `${labels[action]}: ${lineItem}`,
    timelineDetail: `$${amount.toLocaleString()}`,
  }
}

export function renewalEvent(pursuitId: string, pursuitName: string, newPursuitName: string): SlackEvent {
  return {
    pursuitId, pursuitName,
    message: `Renewal pursuit created: ${newPursuitName}`,
    level: 'handoffs',
    owner: 'bella',
    timelineTitle: `Renewal started: ${newPursuitName}`,
  }
}

export function contractLinkedEvent(pursuitId: string, pursuitName: string, contractType: 'minimum' | 'grant_funded', quoteTitle: string): SlackEvent {
  const label = contractType === 'minimum' ? 'Contract 1 (Minimum)' : 'Contract 2 (Grant Funded)'
  return {
    pursuitId, pursuitName,
    message: `${label} linked: "${quoteTitle}"`,
    level: 'handoffs',
    owner: 'bella',
    timelineTitle: `${label} linked`,
    timelineDetail: quoteTitle,
  }
}

export function researchEvent(pursuitId: string, pursuitName: string, oppName: string, status: string, agent?: string): SlackEvent {
  const message = status === 'requested'
    ? `Funder research requested for ${oppName}${agent ? ` → assigned to ${agent}` : ''}`
    : status === 'found'
      ? `${agent || 'Agent'} found new funding sources for ${oppName}`
      : `${oppName} research: ${status}`

  return {
    pursuitId, pursuitName, message,
    level: 'verbose',
    timelineTitle: message,
  }
}
