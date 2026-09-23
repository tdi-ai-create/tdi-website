# Browser pass

## What this change touches

Two things on `/tdi-admin/funding`.

The calendar popups can now complete a decision instead of only linking away:
answering a QA escalation, and approving or sending back a narrative that has
passed QA. Both call the routes the board already uses, so there is one answer
to what approving means.

The board at `/tdi-admin/funding/board` gains the chrome bar. It had none, so
clicking Board left no way back to the calendar or the schools.

An escalated narrative also now appears on the calendar at all. It was the only
state waiting on a person with nothing drawn for it.

## What I did

Run locally against the live database. Signed in as Review Admin.

Everything that writes was pressed against **ZZ Review Grant** in **ZZ Review
District**, the archived sandbox pursuit whose contact is
`contact@example.invalid`. It was un-archived for the test and put back
afterwards. No real grant was touched. `npm run check:sendpause` exits 0 and
reports all six funding send sites paused, so un-archiving could not email
anybody.

- Opened: http://localhost:3000/tdi-admin/funding/board
- Saw: the chrome bar now sits above the board reading "TDI Funding / admin"
  with Calendar, Schools and Board, Board marked current. Before this change
  the board had no header at all. The board itself is unchanged: "Needs you 25"
  and the five columns.
- Pressed: "Calendar" in that bar
- Saw: it returns to Funding Home on the calendar.

### The control appears only where it means something

- Opened: the 24 September popup
- Saw, before the fix: four cards offered "Approve and release", including
  "Ask BRAF for the Ourso form fields". That card is an action item about
  asking a funder a question. It offered to approve a narrative purely because
  that grant's narrative happened to sit at approval. A different decision, one
  click away, on the wrong card.
- Saw, after the fix: the Ask BRAF card carries only "Open this grant" and
  "Open St. Peter Chanel School". The two real approval entries, "E.J. and
  Marjory B. O... approval due" and "Illinois Prairie Comm... approval due",
  keep the control and read "THIS HAS PASSED QA AND IS WAITING ON YOU".

### Approve and release

- Pressed: "Approve and release" on the ZZ Review Grant card.
- Confirmed in the database, not from the screen: `narrative_status` went
  `approval` to `ready`, and `narrative_status_changed_at` was stamped
  `2026-09-23 22:19:58`.

### Answering an escalation

- Saw: with the grant set to escalated, a new calendar entry appeared,
  "ZZ Review Grant needs your decision", reading "QA could not get this through
  and stopped on 2026-09-23. 2 days is the allowance before it reads as stuck.
  Nothing moves until somebody chooses."
- Saw: the two real escalated grants, Entergy Louisiana Foundation and IEA
  Foundation SCORE Grant, appeared on 23 September for the same reason. Neither
  had any calendar presence before this change.
- Saw: the popup carries the QA summary, the root cause, a dropdown defaulted
  to "Approve it as written (recommended)", what that option does, and the
  required reason field.
- Pressed: "Record this decision" with the reason empty.
- Saw: nothing happened, and the database was unchanged, still `escalated`. The
  guard held, but the button looked identical to an enabled one. A disabled
  button that looks pressable reads as a broken page, so `.btn:disabled` now
  dims and takes a not-allowed cursor.
- Pressed: the reason field, typed "Sandbox record, verifying the escalation
  control writes through.", then "Record this decision".
- Confirmed in the database: `narrative_status` `escalated` to `approval`,
  `qa_passed` true, `qa_escalation.resolved_option` `approve_anyway`,
  `resolved_reason` the exact sentence typed, `resolved_by`
  `review.admin@example.invalid`.

### An opaque error, fixed

One attempt failed showing only "That did not go through." The dev server had
died mid-edit, so the request never left the browser, but the screen could not
say that. The handler now prints the status and the body it actually got.

## Restored afterwards

ZZ Review Grant is back to `narrative_status = 'approval'`,
`narrative_status_changed_at` null, `qa_attempt_count` 0, `qa_escalation` null,
`qa_passed` null, and ZZ Review District is archived again. Read back and
confirmed.

## What I did not press

Anything that sends. Nothing on this screen emails a school: drafting and
sending stay on the board behind their existing review step. I did not press
these controls on any real grant.

## What I could not verify

Production rendering, because this is not merged.

The other four escalation options. Only `approve_anyway` was exercised. The
route validates the option against the same list the screen renders, and the
required-detail refusal was proved above, but `redraft_with_guidance`,
`reassign`, `request_info` and `stop_pursuing` each take a different branch in
the route and none of those branches was run from this screen.

"Send back with your direction" was not pressed. It sets `narrative_status` to
`requested`, which trips the eligibility stop rule in the opportunities route,
and I did not want to prove that against the sandbox and claim it holds for a
real grant.

## Claim tiers

- Measured: every "Saw" above, and the two state changes read from the database.
- Unverified: production, the four unexercised escalation options, and send back.
