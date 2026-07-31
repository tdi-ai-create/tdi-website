/**
 * Send a notification to a TDI Slack channel via webhook.
 * Fire-and-forget. Never blocks the response.
 */

type SlackChannel = 'sales' | 'grants' | 'rae' | 'kristin' | 'bella' | 'financials'

const WEBHOOKS: Record<SlackChannel, string | undefined> = {
  sales: process.env.SLACK_WEBHOOK_SALES,
  grants: process.env.SLACK_WEBHOOK_GRANTS,
  rae: process.env.SLACK_WEBHOOK_RAE,
  kristin: process.env.SLACK_WEBHOOK_KRISTIN,
  bella: process.env.SLACK_WEBHOOK_BELLA,
  financials: process.env.SLACK_WEBHOOK_FINANCIALS,
}

export function slackNotify(channel: SlackChannel, text: string) {
  const url = WEBHOOKS[channel]
  if (!url) return

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).catch(() => {})
}
