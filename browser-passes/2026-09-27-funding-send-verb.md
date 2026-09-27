# Browser pass

## What this change touches

The grant action popup on Funding Home, `app/tdi-admin/funding/page.tsx`. The
five controls in `GrantAction` now pass their HTTP verb explicitly instead of
inferring it from the URL, which is what made "Send it" answer 405.

## What I did

Signed in as Rae, 27 September 2026, on the live site. The fix is not deployed
yet, so this pass exercises the server path the fixed button will call, plus the
live state of every control it touches.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding
- Saw: the Calendar tab on September 2026, reading "6 of 22 live grant paths
  have a confirmed deadline" and a button "16 paths have no date. Show them".
- Pressed: the entry "Send the E.J. and Ma..." on Saturday 26 September
- Saw: a popup headed "2026-09-26" with a card marked "DECISION DUE" for
  "St. Peter Chanel School", titled "Send the E.J. and Marjory B. Ours...",
  addressed "READY TO SEND TO PAULA POCHE" and "To: ppoche@stpchanel.org".
- Saw: an orange block above the subject reading "This grant has no packet
  document, and this email promises one. It would reach the school saying
  "here is your application package" above a blank line, so it cannot be sent
  until the document exists."
- Saw: that the warning is literally true of the drafted body. It reads "Here is
  your application package:" followed by an empty line, then "Here is your
  timeline:" and "SEPTEMBER 30: The window closes. We need to submit before this
  date." It signs off "Best, Bella, Teachers Deserve It".
- Saw: the "Send it" button rendered greyed out and not pressable, with "No
  packet document on this grant yet" beneath it, beside a working button
  "Open St. Peter Chanel School".
- Saw: the next card down, "DECISION DUE" for "Saunemin CCSD #438", titled
  "Send the Illinois Prairie Communi...", carrying only "Open the packet" and
  "Open Saunemin CCSD #438". No subject field, no body, no "Send it". Its
  description still claims "The email is drafted and waiting on this item in the
  funding calendar", but no draft exists for it any more, so `DraftToSend` does
  not render.

Then the server path, called from the signed in page so it carried the real
session, using the same route, body and verb the fixed button uses:

- Ran: `GET /api/funding/outreach-queue`
- Saw: 200, exactly one draft, id `1e0eb670-5415-4cf4-896c-88dc8f0b74a2`, to
  ppoche@stpchanel.org, emailType `submission_instructions`, blockedReason null.
- Ran: `POST /api/funding/outreach-queue?dryRun=1` with
  `{ id: "1e0eb670...", action: "approve" }`
- Saw: **400**, not 405, with a real body: `gateBlocking` listing
  `document_exists` and `document_opens`, and the reason "E.J. and Marjory B.
  Ourso Family Foundation has no application document ... An approval cannot
  stand in for a document that was never written."

That 400 is the point of this pass. The request authenticated, parsed, loaded
the draft, and ran the full send gate. Before this change the same button sent
PATCH and got 405 with an empty body, which is the "The server answered 405. No
detail." in TEA-6.

## What I did not press

**Send it.** It is disabled on the only draft that exists, and pressing it if it
were enabled would email Paula Poche a real application that has no application
attached to it. The dry run above is the substitute, and it returns before
`claimDraftForSending` and before Resend is called, so it wrote nothing and sent
nothing.

**Approve and release**, **Send back with your direction**, and the two
escalation controls. All four were changed by this PR, all four carry a real
write, and no grant on the board today is in a state that offers them without
manufacturing one. Their verbs were checked against the route exports instead:
`/api/funding/opportunities` exports PATCH, `/api/funding/escalation` exports
POST, and both now receive what they export.

## What I could not verify

**The success path of "Send it".** There is no sendable draft on the board
today: the one draft is held by the missing packet guard, and the grant that
does have a packet no longer has a draft. So I could not watch a send return 200
and flip the card to "Sent, and the grant is marked as gone to the school." That
remains unproven and is the first thing to check once a grant has both a
document and a queued draft.

**Whether the fix behaves in the browser.** The change is not deployed. This
pass shows the server answering correctly to the verb the fixed code sends, not
the fixed code sending it. Verify after deploy at
https://www.teachersdeserveit.com/tdi-admin/funding by opening any grant with a
queued draft and pressing "Send it".

## Worth raising separately

TEA-6 reported this as the Google Doc not attaching to the draft, and that
reading is correct and still live. St. Peter Chanel's Ourso email is queued to a
real superintendent with an empty line where the package belongs. The 405 and the
missing document are two different faults that happened to surface together, and
only the 405 is fixed here.
