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
      await db().from('funding_pursuit_timeline').insert({
        pursuit_id: event.pursuitId,
        event_date: new Date().toISOString().split('T')[0],
        event_title: event.timelineTitle,
        event_detail: event.timelineDetail || event.message,
        status: 'complete',
      })
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
    'qa_review→ready': `${oppName} narrative approved → ready for submission`,
  }
  const key = `${fromStatus}→${toStatus}`
  const message = labels[key] || `${oppName} narrative: ${fromStatus} → ${toStatus}`

  const isHandoff = ['drafting→review', 'review→qa_review', 'qa_review→ready'].includes(key)
  const owner = toStatus === 'qa_review' ? null : toStatus === 'ready' ? null : isHandoff ? 'bella' : null

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
