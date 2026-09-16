# Browser pass

## What this change touches

The Ready to send panel on the funding board. Approving a draft now refuses
when the same recipient already has another draft waiting, and a draft is
claimed before Resend is called so two clicks cannot both send it.

## What I did

Ran the branch locally on `http://localhost:3113` against the production
database. There is no `RESEND_API_KEY` in the environment at all, so nothing
could leave the machine under any outcome. Signed in as Review Admin.

Created two probe drafts, both addressed to `rae@teachersdeserveit.com` because
the send allowlist refuses anything else, both pointed at IDEA/CEIS so the
missing-document gate would not fire first and mask this check.

- Opened: http://localhost:3113/tdi-admin/funding
- Saw: "Ready to send (2)", two cards both reading "Saunemin CCSD #438 /
  IDEA/CEIS (Special Ed PD)", both "To: One Email Probe .
  rae@teachersdeserveit.com", titled "ONEEMAIL PROBE A do not send" and
  "ONEEMAIL PROBE B do not send"
- Pressed: "Approve and send" on probe A
- Saw: a red banner above the cards reading **"rae@teachersdeserveit.com
  already has another email waiting: "ONEEMAIL PROBE B do not send". One person
  receives one email. Merge this ask into that draft and send once."**
- Saw: both cards still present with their buttons, so neither draft was
  consumed
- Confirmed in the database rather than from the screen: both rows still
  `status = draft`, `sent_at` null, `resend_id` null.

The message names the other draft by subject, which is the part that makes it
actionable. A reviewer is told which thread to merge into rather than just being
told no.

## What I did not press

Approve on the second probe with the first deleted, which is the path where the
send would actually proceed. That would have exercised the claim-before-send
change, and the only allowlisted address available is Rae's own, so the cost of
being wrong was an email to her. The claim behaviour is proven instead by a
concurrency probe against the production database, recorded in the commit: two
simultaneous claims, one won, the loser was told already_taken, a third attempt
also refused.

I did not press anything on a real school's draft. There were zero real drafts
in the queue, and both probes were deleted afterwards with their absence
confirmed by query.

## What I could not verify

The `send-email` compose route, which has the same guard added. It sits behind
the client-send pause and returns 423 before reaching the guard, so there is no
way to see it from the screen. Verified by reading the route order only.

Whether the failure path returns a claimed row to `failed` correctly. That needs
Resend to reject a send, which cannot happen with no key configured.
