# Browser pass

## What this change touches

The partnership table on `/tdi-admin/leadership` and the dark header card on
`/tdi-admin/leadership/[id]`. Any partnership with no `contract_start` now
carries an Unsigned badge, so a prospect record cannot be mistaken for a client
without opening the database.

## How this pass was made possible

Both partnerships that would have shown the badge were deleted on 22 September,
so there was nothing to render it on and the first version of this record said
the badge was unverified.

Rae approved creating one throwaway partnership to prove it, on the condition it
be deleted straight after. `ZZZ Sandbox (delete me)`,
id `30e35833-5aea-4f92-a549-759718e31043`, `contract_start` null,
`status = 'active'` so it tested the `unsigned` exclusion rather than the status
one, and `contact_email` pointed at a TDI address rather than any school. It
existed for roughly six minutes and only dry runs were pointed at it, so no
send was ever attempted. It is deleted. Verified after: 9 partnerships,
0 with a null `contract_start`, 0 matching "sandbox".

## What I did

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership
- Pressed: nothing, read the table first
- Saw: ten rows. Nine real schools carry no badge. The tenth reads
  "ZZZ Sandbox (delete me)" with an amber "UNSIGNED" chip beside the name and
  "IGNITE / 0 of 0 seats" beneath it. Tidioute Community Charter School
  directly above it shows "IGNITE / 2 of 2 seats" and no chip, so the badge is
  not leaking onto signed rows.
- Hovered: the UNSIGNED chip
- Saw: the title text "No contract start date. This is a prospect record, not a
  signed partnership, and it is excluded from client email."
- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/30e35833-5aea-4f92-a549-759718e31043
- Saw: the dark header reads "ZZZ Sandbox (delete me)" with "UNSIGNED" placed
  immediately before "IGNITE", which is the intended order. The phase is
  meaningless until somebody has signed, so the unsigned state reads first.

## The email gate, checked at the same time

The same record proved the gate in #563, which the earlier dry runs could not,
because `skipped` came back `[]` when no unsigned partnership existed.

- Ran: `?dryRun=1` against `monthly-principal-email`, `seasonal-partner-email`
  and `partner-onboarding-reminders` on production
- Saw: all three returned
  `skipped: [{"name": "ZZZ Sandbox (delete me)", "reason": "unsigned"}]` and the
  sandbox address absent from `recipients`. The first two still reported
  `wouldSend: 9`, the nine real clients, unchanged.
- Confirmed: zero rows written to `activity_log` in the surrounding 30 minutes.

That record was in the same state Morenci was in on 1 September. Under the old
code it was mailed. It is now skipped.

## What I did not press

Any of these crons without `dryRun=1`. That would send real mail to nine
schools. Also did not press Edit or Delete on the sandbox detail page; the row
was removed with SQL so the deletion was exact and verifiable.

## What I could not verify

Whether the badge behaves correctly on a partnership that has a `contract_start`
in the future rather than null. That state does not exist in the data today and
the code tests only for null, so a future-dated contract would read as signed.
That is probably right, but it is untested.
