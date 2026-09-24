# Browser pass

## What this change touches

The calendar popups on `/tdi-admin/funding`.

"Open this grant" opened a portal page. It now opens the packet document, which
is the thing anyone wants to open, and says so plainly when there is no
document rather than offering a button that goes somewhere unhelpful.

Approving a narrative already wrote the email to the school into the Outreach
Queue. There was no way to read it, change it or send it without walking over
to the board. It is now in the popup: the recipient, the packet link to check,
an editable subject and body, and a send.

## What I did

Run locally against the live database. Signed in as Review Admin.

- Opened: http://localhost:3000/tdi-admin/funding
- Pressed: the 26 September cell in the calendar grid.
- Saw: the card "Send the E.J. and Marjory B. Ours..." for St. Peter Chanel,
  and under it "READY TO SEND TO PAULA POCHE", "To: ppoche@stpchanel.org", the
  subject "Your E.J. and Marjory B. Ourso Family Foundation application is
  ready. Here is your timeline." in an editable field, and the full email body
  in an editable box beginning "Hi Paula,". This is the real queued draft, not
  a recomposition: it is `funding_email_log` row `1e0eb670`.
- Saw: the card's own description used to end "The email is drafted and waiting
  in the Outreach Queue at the top of the Funding board. Approving it there
  sends it." It now reads "The email is drafted and waiting on this item in the
  funding calendar. Read it, change it if it needs changing, check the packet
  link, and send it there." Three action items in the database carried the old
  sentence and were corrected in place.

### The packet link, and what checking it found

- Saw: in place of a packet link, an amber line. The Ourso grant has no
  `narrative_url`.
- Saw, in the email body itself: "Here is your application package:" followed
  by a blank line. The package link is missing from the message that promises
  it.
- Ran the route's own dry run from the signed-in page, with an edited subject
  and body, to exercise the approve path without mailing anybody:

  `POST /api/funding/outreach-queue?dryRun=1` with `action: 'approve'` returned
  `"action": "would send"`, `"to": "ppoche@stpchanel.org"`, and echoed my
  edited subject and body back, so the edited wording is what would go, and
  `wouldUpdateOpportunity` is the Ourso grant.

  It also returned the send gate's verdict:

  > `[hard, blocked] E.J. and Marjory B. Ourso Family Foundation has no
  > application document. The email would say "here is your application
  > package" above a blank line. An approval cannot stand in for a document
  > that was never written.`

  with `"wouldBlockOnGate": true` and **`"gateEnforcementOn": false`**.

  So the gate already knows this email is broken and would have let it through.

- Changed as a result: an application email with no packet document cannot be
  sent from this screen. Send is disabled and says why.
- Pressed: the 26 September cell again after the change, then scrolled to the
  bottom of that card.
- Saw: "Send it" is dimmed, and where the packet link would be it reads
  "No packet document on this grant yet".
- Pressed: nothing further on that card. Send is the control this change exists
  to govern, and pressing it emails a real school.

## What I did not press

Send. Pressing it would email Paula Poche a real application package. The
approve path was exercised through the route's own `?dryRun=1`, which is
documented in that route as the only way to exercise it without mailing a
school.

## Cleaned up

The sandbox draft to `contact@example.invalid` that yesterday's approve test
left in the queue was marked rejected with its reason, so it does not sit in
the Outreach Queue looking like real work. One draft remains, the real Ourso
one.

## What I could not verify

That a send actually delivers from this screen. The dry run proves the branch,
the recipient and that the edited wording is what would be sent. It does not
prove Resend accepts it. The same approve path is what the board's queue has
been using, so this is not a new door, but I did not open it.

Production rendering, because this is not merged.

## Claim tiers

- Measured: everything above, including the gate verdict, read from the dry run
  against the real draft.
- Unverified: actual delivery, and production.
