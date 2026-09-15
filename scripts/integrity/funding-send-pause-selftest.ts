// Runtime proof that the funding pause actually stops a send.
//
//   npx tsx scripts/integrity/funding-send-pause-selftest.ts
//
// check:sendpause proves every send site calls the pause. check:guards proves
// the pause refuses the right addresses. Neither one watches the wire. This
// does: it replaces global fetch with a tripwire that fails the test if
// anything tries to reach Resend, then calls the real shared sender with a real
// school address.
//
// RESEND_API_KEY is deliberately set to a fake value below, so even a total
// guard failure cannot deliver mail from this script.

process.env.RESEND_API_KEY = 'fake-key-selftest-must-never-send'

import { sendFollowUpEmail, type GeneratedEmail } from '../../lib/funding-followup-email'
import {
  fundingClientSendBlockReason,
  canSendToFundingClient,
  isFundingClientSendPaused,
} from '../../lib/funding-client-send-pause'

const attempted: string[] = []
const realFetch = globalThis.fetch
globalThis.fetch = (async (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  attempted.push(url)
  throw new Error(`TRIPWIRE: outbound request to ${url}`)
}) as typeof fetch

function email(to: string, tone: 'client' | 'internal'): GeneratedEmail {
  return {
    to,
    from: 'Bella at Teachers Deserve It <noreply@teachersdeserveit.com>',
    replyTo: tone === 'client' ? 'hello@teachersdeserveit.com' : undefined,
    subject: 'selftest',
    html: '<p>selftest</p>',
    text: 'selftest',
    tone,
  }
}

const results: { name: string; ok: boolean; detail: string }[] = []
function check(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail })
}

async function main() {
  check('the pause is on', isFundingClientSendPaused(), String(isFundingClientSendPaused()))

  // A school on the send allowlist. The strongest case: this address was
  // explicitly permitted before the pause, so if anything still sends, it sends
  // to a real principal.
  const school = 'ppoche@stpchanel.org'
  const before = attempted.length
  const res = await sendFollowUpEmail(email(school, 'client'))
  const triedToSend = attempted.length > before

  check('the shared sender refuses a school', res.ok === false, `ok=${res.ok}`)
  check('nothing touched the wire', !triedToSend, triedToSend ? attempted.join(', ') : 'no outbound request')
  check(
    'the refusal names the queue',
    (res.error ?? '').includes('Outreach Queue'),
    res.error ?? '(no error text)'
  )

  // Internal escalation must still work, so the pause cannot hide itself.
  const rae = 'rae@teachersdeserveit.com'
  const beforeInternal = attempted.length
  // The tripwire throws rather than returning, so an internal send that gets
  // all the way to the wire surfaces here as an exception. That exception IS
  // the pass condition for this case.
  let internal: { ok: boolean; error?: string } = { ok: false, error: '(never ran)' }
  try {
    internal = await sendFollowUpEmail(email(rae, 'internal'))
  } catch (e) {
    internal = { ok: false, error: String((e as Error).message ?? e) }
  }
  const triedInternal = attempted.length > beforeInternal

  check('an internal address is not paused', canSendToFundingClient(rae), 'allowed')
  check(
    'the internal send got as far as the wire',
    triedInternal,
    triedInternal ? attempted[attempted.length - 1] : 'never attempted'
  )
  check(
    'the internal send failed only at the tripwire, not at the pause',
    internal.ok === false && !(internal.error ?? '').includes('Outreach Queue'),
    internal.error ?? '(no error text)'
  )

  check(
    'every allowlisted school address is refused',
    [
      'teri.gordonhernandez@pgcps.org',
      'sharonh.porter@pgcps.org',
      'ppoche@stpchanel.org',
      'jsuarez@d94.org',
      'zwemke@ogschool.com',
      'dneukirch@d41.org',
      'mandy.johnson@gcafbcd.org',
      'doughang@saunemin.org',
    ].every(a => fundingClientSendBlockReason(a) !== null),
    '8 of 8 refused'
  )

  globalThis.fetch = realFetch

  let failed = 0
  for (const r of results) {
    console.log(`  ${r.ok ? 'ok  ' : 'FAIL'}  ${r.name}\n          ${r.detail}`)
    if (!r.ok) failed += 1
  }
  console.log(
    `\n${results.length - failed}/${results.length} held. ` +
      `Requests that reached the wire: ${attempted.length} (${attempted.filter(u => u.includes('resend')).length} to Resend, all from the internal case).`
  )
  process.exit(failed > 0 ? 1 : 0)
}

main()
