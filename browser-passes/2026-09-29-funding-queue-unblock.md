# Browser pass

## What this change touches

The Outreach Queue and the Funding Home send panel, plus the needs-you cards.
A packet can now be attached from either screen, the queue returns `docUrl` and
`missingPacket` so the two surfaces stop disagreeing, and the queue's send
button refuses a packet-less application email the way Funding Home already did.

## Why this pass is the before and not the after

The change is not deployed. The admin portal authenticates against a Supabase
session cookie scoped to the live domain, so a preview build answers every
`/tdi-admin` page with a login screen. That is the case CLAUDE.md names, and the
same deferral as `2026-09-22-funding-stopped-needs-you.md`.

So this records the fault reproducing on production, in detail, and names what to
check once it ships.

## What I did

Signed in as Rae on the live site, 29 September 2026.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding?view=queue
- Saw: "Ready to send (1)" with a red chip reading "1 waiting over 48 hours".
- Saw: one card, "St. Peter Chanel School", "E.J. and Marjory B. Ourso Family
  Foundation - $15,750", marked "drafted 5 days ago", addressed
  "To: Paula Poche - ppoche@stpchanel.org".
- Saw: the body reads "Here is your application package:" followed by an empty
  line, then "Here is your timeline:". The promise and the blank underneath it,
  exactly as described.
- Saw: the same body carries "SEPTEMBER 30: The window closes. We need to submit
  before this date." That is tomorrow.
- Saw: **no packet link anywhere on the card.** No "open the packet", no warning,
  nothing where the document would be. This is the `narrative_url` the queue
  never selected.
- Saw: the controls are "Approve and send" rendered active in green, "Edit
  first", and "Reject". **Nothing on this screen tells the reviewer the packet is
  missing, and nothing stops them pressing send.**
- Pressed: "Queue" in the top nav, from the Calendar tab, to confirm the card
  above is what the queue actually serves rather than a deep link artefact. Same
  card, same active green "Approve and send", same absent packet link.

Then the same draft on the other surface, for the comparison that matters:

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding on the Calendar tab
- Pressed: the 26 September entry "Send the E.J. and Ma..."
- Saw: a popup headed "2026-09-26" with a "DECISION DUE" card for St. Peter
  Chanel School
- Saw: an orange block reading "This grant has no packet document, and this email
  promises one. It would reach the school saying "here is your application
  package" above a blank line, so it cannot be sent until the document exists."
- Saw: "Send it" rendered greyed out and not pressable, with "No packet document
  on this grant yet" beneath it.

**Two screens, one draft, opposite answers.** Funding Home refuses it and
explains why. The queue offers a green send button and says nothing. That is the
defect this PR closes, and it is live right now.

## What is actually holding the line today

The server, not the screen. `POST /api/funding/outreach-queue?dryRun=1` with
`{id: "1e0eb670-5415-4cf4-896c-88dc8f0b74a2", action: "approve"}`, run from the
signed-in page earlier today, returned **400** with `gateBlocking` listing
`document_exists` and `document_opens`.

So pressing "Approve and send" on the queue would produce an error rather than
mail Paula a broken application. Worth stating plainly: the enabled button is a
UI defect and a reviewer's wasted trip, not an email hazard.

## What I did not press

**Approve and send.** It would not have sent, per the gate above, but pressing
send on a real superintendent's live draft to prove a point about a button state
is not a trade worth making.

**Attach a packet.** The control this PR adds does not exist on production yet,
so there was nothing to press.

## What I could not verify

**Everything this PR changes.** Not deployed. Verify after deploy at
https://www.teachersdeserveit.com/tdi-admin/funding?view=queue:

1. The Ourso card shows a packet field, and pasting a document URL saves to the
   grant. The PR says `set_packet` honours `?dryRun=1`, so dry run it first.
2. With no packet attached, "Approve and send" on the queue is refused, matching
   Funding Home.
3. With a packet attached, both screens show the link and agree.
4. "Already done" on a needs-you card closes an item without opening the pursuit
   panel.

**The five opportunities reading `sent` with no `narrative_url`.** Reported in
the PR body, not repaired by it, and not checked here.
