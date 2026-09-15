// Can any funding code path still email a school without an approval.
//
//   npm run check:sendpause
//
// Static, no network, no database, runs in CI.
//
// The pause it verifies was added 15 September 2026, after an audit found six
// code paths that could put an email in front of a school and only one of them
// ran the checks. The specific thing that made a route-by-route fix untrustworthy
// is that nobody knew how many routes there were. So this does not check the
// routes we fixed. It enumerates every send site in the funding surface and
// fails on one that is not accounted for, which is the only version of this
// check that keeps working after the next route is written.
//
// Exits non-zero when a send site is unaccounted for or has lost its guard.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SEND_CALL = 'api.resend.com';
const PAUSE_FN = 'fundingClientSendBlockReason';

// Where funding email can be sent from. Anything under these paths is scanned.
const SCAN = [
  'app/api/funding',
  'app/api/cron/funding-followup',
  'app/api/cron/funding-reminders',
  'app/api/cron/funding-eligibility-audit',
  'lib/funding-followup-email.ts',
];

// Every known send site, and why it is allowed to exist.
//
//   'approval'  the Outreach Queue. This IS Bella's approval button and is the
//               one intended way out. Deliberately not gated by the pause.
//   'paused'    must call the pause before it sends. Fails if the call is
//               missing, or appears after the send.
//   'internal'  sends only to a hardcoded teachersdeserveit.com address. Fails
//               if that address stops being hardcoded next to the send.
//   'drafts'    automation that writes a draft for review instead of sending to
//               a school. Fails if the drafting branch disappears.
const EXPECTED = {
  'app/api/funding/outreach-queue/route.ts': ['approval'],
  'app/api/funding/nudge/route.ts': ['paused'],
  'app/api/funding/send-email/route.ts': ['paused'],
  'app/api/funding/pursuits/[id]/emails/route.ts': ['paused'],
  'lib/funding-followup-email.ts': ['paused'],
  'app/api/cron/funding-reminders/route.ts': ['internal'],
  'app/api/cron/funding-followup/route.ts': ['drafts', 'internal'],
};

// The drafting branch in the follow-up cron. If this line changes, the rule
// that automation never emails a school changed with it, and that is worth
// stopping a build over.
const DRAFT_BRANCH = 'if (!isTdiAddress(to)) {';

function walk(p) {
  const abs = join(ROOT, p);
  let st;
  try {
    st = statSync(abs);
  } catch {
    return [];
  }
  if (st.isFile()) return [p];
  return readdirSync(abs).flatMap((entry) => walk(join(p, entry)));
}

const files = SCAN.flatMap(walk).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

const problems = [];
const accounted = [];

for (const file of files) {
  const src = readFileSync(join(ROOT, file), 'utf8');
  if (!src.includes(SEND_CALL)) continue;

  const expected = EXPECTED[file];
  const sendCount = src.split(SEND_CALL).length - 1;

  if (!expected) {
    problems.push(
      `${file}\n` +
        `    ${sendCount} send site(s) here and this file is not in EXPECTED.\n` +
        `    A new way to email a school was added and nothing reviewed whether it\n` +
        `    can reach one. Gate it with ${PAUSE_FN}, then add it to EXPECTED with\n` +
        `    the reason.`
    );
    continue;
  }

  if (sendCount !== expected.length) {
    problems.push(
      `${file}\n` +
        `    ${sendCount} send site(s), but EXPECTED accounts for ${expected.length}.\n` +
        `    Classify the new one and add it, or remove the stale entry.`
    );
    continue;
  }

  const firstSend = src.indexOf(SEND_CALL);

  if (expected.includes('paused')) {
    const firstPause = src.indexOf(PAUSE_FN + '(');
    if (firstPause === -1) {
      problems.push(
        `${file}\n    calls ${SEND_CALL} but never calls ${PAUSE_FN}. The pause is gone.`
      );
      continue;
    }
    if (firstPause > firstSend) {
      problems.push(
        `${file}\n    calls ${PAUSE_FN} only AFTER it sends. The email has already left.`
      );
      continue;
    }
  }

  if (expected.includes('drafts') && !src.includes(DRAFT_BRANCH)) {
    problems.push(
      `${file}\n` +
        `    the drafting branch "${DRAFT_BRANCH}" is gone, so this cron may now\n` +
        `    email a school directly instead of queueing a draft for review.`
    );
    continue;
  }

  if (expected.includes('internal')) {
    // Every send site in this file that is not otherwise accounted for must name
    // a teachersdeserveit.com recipient within the payload that follows it.
    const internalSites = expected.filter((e) => e === 'internal').length;
    let cursor = 0;
    let proven = 0;
    for (let i = 0; i < sendCount; i += 1) {
      const at = src.indexOf(SEND_CALL, cursor);
      const payload = src.slice(at, at + 1200);
      if (/to:\s*\[?\s*['"`][^'"`]*@teachersdeserveit\.com/.test(payload)) proven += 1;
      cursor = at + SEND_CALL.length;
    }
    if (proven < internalSites) {
      problems.push(
        `${file}\n` +
          `    ${internalSites} send site(s) are marked internal but only ${proven} still\n` +
          `    hardcode a teachersdeserveit.com recipient. An internal digest that\n` +
          `    learned to take a variable recipient is a client send.`
      );
      continue;
    }
  }

  accounted.push(`  ok    ${file}  (${sendCount} site${sendCount > 1 ? 's' : ''}: ${expected.join(', ')})`);
}

// A file listed in EXPECTED that no longer sends is not a failure, but a stale
// entry hides the next real one behind a passing check.
for (const file of Object.keys(EXPECTED)) {
  if (!files.includes(file)) {
    problems.push(`${file}\n    listed in EXPECTED but no longer exists. Remove the entry.`);
  }
}

console.log(accounted.join('\n'));

if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s):\n`);
  for (const p of problems) console.log(`  FAIL  ${p}\n`);
  console.log(
    'Funding email reaches a school only through the Outreach Queue approval\n' +
      'button. Every other send site must call fundingClientSendBlockReason first.\n' +
      'See lib/funding-client-send-pause.ts.\n'
  );
  process.exit(1);
}

console.log(
  `\n${accounted.length} funding send site file(s) accounted for. ` +
    `One way out: the Outreach Queue approval.`
);
process.exit(0);
