/**
 * Test client-tone emails with real client_label from the database.
 * Sends 3 client-tone emails using Allenwood ATSI item (2f8abbe3).
 * ALL to rae@teachersdeserveit.com only.
 *
 * Usage: node scripts/test-send-followup.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvFile(path) {
  let content
  try { content = readFileSync(path, 'utf-8') } catch { return }
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    let val = trimmed.slice(eqIdx + 1)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile(resolve(__dirname, '..', '.env.local'))
loadEnvFile(resolve(__dirname, '..', '.env.vercel'))

// ── Client task label (uses client_label if set, else strips internal verbs) ──

function clientTaskLabel(rawTitle, clientLabel) {
  if (clientLabel) return clientLabel
  const stripped = rawTitle
    .replace(/^(Get\s+\S+\s+to\s+)/i, '')
    .replace(/^(Confirm:\s*)/i, '')
    .replace(/^(Follow\s+up\s+(on|with)\s+\S+[:/]?\s*)/i, '')
    .replace(/^(Track\s+)/i, '')
    .trim()
  return stripped.length > 5 ? stripped : 'this funding step'
}

// ── Send function — mirrors route.ts ──

async function sendFollowUpEmail({
  to, itemTitle, dueDate, bizDaysOverdue, rungLabel, type, tone,
  contactName = 'there', schoolName = 'your school', clientLabel,
  subjectPrefix = '',
}) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error('RESEND_API_KEY not set')
    return { ok: false, error: 'No API key' }
  }

  const friendlyTask = clientTaskLabel(itemTitle, clientLabel)

  const subject = subjectPrefix + (
    type === 'reminder'
      ? `Heads up on ${friendlyTask} for ${schoolName}`
      : type === 'nudge'
        ? `Following up: ${friendlyTask}`
        : `Can you help with ${friendlyTask} for ${schoolName}?`
  )

  const badgeColor =
    type === 'escalation' ? '#D4A843' : type === 'nudge' ? '#5B8FA8' : '#1B365D'
  const badgeText =
    type === 'escalation' ? 'Quick favor' : type === 'nudge' ? 'Checking in' : 'Friendly reminder'

  let bodyParagraphs
  if (type === 'reminder') {
    bodyParagraphs = `
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Hi ${contactName},</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Just a friendly heads-up — <strong>${friendlyTask}</strong> is coming up around <strong>${dueDate}</strong>. No rush at all, I just want to make sure you have everything you need from us to get it out the door.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Everything's prepared on our end — if anything's unclear or you'd like me to hop on a quick call to walk through it, I'm here.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Rooting for you and ${schoolName},</p>
      <p style="color: #1e2749; font-size: 15px; font-weight: 600; margin-bottom: 0;">Bella</p>
      <p style="color: #6B7280; font-size: 13px; margin-top: 2px;">Teachers Deserve It</p>`
  } else if (type === 'nudge') {
    bodyParagraphs = `
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Hi ${contactName},</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">I wanted to follow up on <strong>${friendlyTask}</strong> — it was on the calendar for <strong>${dueDate}</strong>, and I know how full your plate is this time of year.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Is there anything holding it up that I can help with? A question, a quick call, or me sitting on Zoom while you send it — just say the word.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">We really want to land this funding for your teachers, and you're not doing it alone.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Here for you,</p>
      <p style="color: #1e2749; font-size: 15px; font-weight: 600; margin-bottom: 0;">Bella</p>
      <p style="color: #6B7280; font-size: 13px; margin-top: 2px;">Teachers Deserve It</p>`
  } else {
    bodyParagraphs = `
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Hi ${contactName},</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">I'm reaching out because <strong>${friendlyTask}</strong> is a key piece of the funding we're working to secure for <strong>${schoolName}</strong>, and we want to make sure it doesn't slip through the cracks during a busy stretch.</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Everything's prepared and ready — it just needs a few minutes from your side. Could you help us get it across the line, or point me to the best person to work with?</p>
      <p style="color: #374151; font-size: 15px; line-height: 1.7;">Thank you for championing this for your teachers,</p>
      <p style="color: #1e2749; font-size: 15px; font-weight: 600; margin-bottom: 0;">Bella</p>
      <p style="color: #6B7280; font-size: 13px; margin-top: 2px;">Teachers Deserve It</p>`
  }

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
    <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="TDI" style="height: 36px; margin-bottom: 20px;" />
    <div style="background: ${badgeColor}; color: white; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px;">
      ${badgeText}
    </div>
    ${bodyParagraphs}
  </div>`

  const payload = {
    from: 'Bella — Teachers Deserve It <noreply@teachersdeserveit.com>',
    reply_to: 'hello@teachersdeserveit.com',
    to: [to],
    subject,
    html,
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const body = await res.json()
  return { ok: res.ok, status: res.status, body }
}

// ── 3 client-tone tests using real client_label from DB ──

const TEST_TO = 'rae@teachersdeserveit.com'

// Real data from item 2f8abbe3
const INTERNAL_TITLE = 'Get Dr. Porter to send ATSI email to Dr. Gloster'
const CLIENT_LABEL = 'the ATSI funding email to Dr. Gloster'

const testCases = [
  {
    label: 'CLIENT REMINDER — submitter (Teri), with client_label',
    type: 'reminder',
    contactName: 'Teri',
    schoolName: 'Allenwood Elementary',
    dueDate: '2026-07-14',
    bizDaysOverdue: 0,
  },
  {
    label: 'CLIENT NUDGE — submitter (Teri), with client_label',
    type: 'nudge',
    contactName: 'Teri',
    schoolName: 'Allenwood Elementary',
    dueDate: '2026-07-01',
    bizDaysOverdue: 6,
  },
  {
    label: 'CLIENT ESCALATION — backup (Dr. Porter), with client_label',
    type: 'escalation',
    contactName: 'Dr. Porter',
    schoolName: 'Allenwood Elementary',
    dueDate: '2026-07-01',
    bizDaysOverdue: 6,
  },
]

async function main() {
  console.log('\n=== Client Label Email Test (3 emails) ===')
  console.log(`All emails to: ${TEST_TO}`)
  console.log(`Internal title: "${INTERNAL_TITLE}"`)
  console.log(`Client label:   "${CLIENT_LABEL}"`)
  console.log(`(Client emails should show the label, not the internal title)\n`)

  for (const tc of testCases) {
    console.log(`--- ${tc.label} ---`)

    const result = await sendFollowUpEmail({
      to: TEST_TO,
      itemTitle: INTERNAL_TITLE,
      clientLabel: CLIENT_LABEL,
      dueDate: tc.dueDate,
      bizDaysOverdue: tc.bizDaysOverdue,
      rungLabel: tc.type === 'escalation' ? 'backup' : 'submitter',
      type: tc.type,
      tone: 'client',
      contactName: tc.contactName,
      schoolName: tc.schoolName,
      subjectPrefix: '[TEST] ',
    })

    if (result.ok) {
      console.log(`  SENT (${result.status}) — Resend ID: ${result.body?.id ?? 'n/a'}`)
    } else {
      console.log(`  FAILED (${result.status}):`, JSON.stringify(result.body))
    }
    console.log()
  }

  console.log('=== Done — check inbox for 3 emails ===\n')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
