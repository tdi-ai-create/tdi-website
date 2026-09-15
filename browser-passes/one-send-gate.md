# Browser pass

## What this change touches

The Ready to send panel on the funding board. Pressing "Approve and send" now
runs the send gate first, and refuses when the package has no application
document behind it.

## What I did

Ran the branch locally on `http://localhost:3111` against the production
database, with `FUNDING_SEND_GATE=true` in the local env so the gate enforces,
and with **no `RESEND_API_KEY` present at all**, so no email could leave the
machine under any outcome. Signed in as Review Admin.

Created one probe draft, addressed to `rae@teachersdeserveit.com` because the
send allowlist correctly refuses anything else, subject "GATE PROBE do not
send". Pointed it at two real grants in turn to test both directions.

### The blocking case: a grant with no document

- Opened: http://localhost:3111/tdi-admin/funding
- Saw: "Ready to send (1)" with the card reading "Saunemin CCSD #438 / Illinois
  Prairie Community Foundation - $10,000" and "drafted just now"
- Pressed: "Approve and send"
- Saw: a red banner above the card reading **"Illinois Prairie Community
  Foundation has no application document. The email would say "here is your
  application package" above a blank line. An approval cannot stand in for a
  document that was never written. No document to open."**
- Saw: the card still present with its buttons, so the draft was not consumed
- Server log: `POST /api/funding/outreach-queue 400 in 1063ms`
- Confirmed in the database, not from the screen: `status` still `draft`,
  `sent_at` null, `resend_id` null. The gate refused before any write.

### The passing case: the same draft pointed at a grant that has a document

- Repointed the probe to "IDEA/CEIS (Special Ed PD)", which has a narrative URL
- Pressed: "Approve and send"
- Saw: **no gate message**. Instead the banner read "Email service not
  configured (RESEND_API_KEY missing)", which is the next step in the route
- Server log: `POST /api/funding/outreach-queue 500 in 2.2s`
- So the gate let it through and the send stopped only because this machine has
  no mail key. That is the check proving it can pass as well as fail.

### First attempt did not count

My first click on the passing case produced no POST at all. The page had been
reloaded and the click landed before React hydrated, so the button was painted
but not wired. Caught it by grepping the dev log for POST count, which read 1
when it should have read 2. Re-ran it by element reference after waiting, and
got the second POST.

## What I did not press

Nothing was sent. There was no mail key in the environment, the only allowlisted
address I used was Rae's own, and the gate refused the first attempt before the
send step was reached. I did not press Approve on any real draft: there were
zero real drafts in the queue, and the probe was deleted afterwards with its
absence confirmed by query, along with a check that nothing was sent to Rae
today.

I did not enable `FUNDING_SEND_GATE` in production. That is a separate decision
and it belongs to Rae.

## What I could not verify

Whether the document-opens check behaves correctly against a real Google Doc
that is private. Every one of the eight live documents opens to an
unauthenticated fetch, so there is no private document in the data to try it
on. That branch is covered by a unit probe with a stub, not by the browser.

I also did not exercise the soft checks through the screen. A missing closing
date and a missing review are reported rather than blocking, so there is nothing
visible to press on, and their wording was read from the dry run output instead.
