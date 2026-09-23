# Browser pass

## What this change touches

The Ready to invoice screen and the Contracts screen at /tdi-admin/billing.
Both now offer a workbook export, and the forecast rules changed: grant lines no
longer read a funding decision date, and Hub memberships and book sets become
ready to invoice on the contract start date.

## What I did

- Opened: http://localhost:3005/tdi-admin/billing/forecast, signed in as Review Admin
- Saw: the header now reads "DATED $21,850" where it read $20,250 before, and
  "UNDATED LINES 34 of 41" where it read 36. The difference is exactly the
  $1,600 Oak Grove membership plus Saunemin's complimentary book set, which are
  the two milestone lines the new rule places.
- Saw: a new "August 2026" card reading "Client $1,600" and "Grant $0",
  containing "1 Aug, Learning Hub Membership x20 (legacy pricing), Oak Grove
  School District 68 - service 1 Aug, Client funded, $1,600.00". That membership
  has been billable since 1 August and had never been invoiced, which is the
  kind of thing this screen exists to surface.
- Saw: a "July 2026" card reading "Client $0, Grant $0, 1 complimentary day"
  holding "1 Jul, TDI Book x23 (complimentary), Saunemin CCSD #438 - service
  1 Jul". A complimentary milestone is placed as a day and never as money.
- Saw: every grant row now reads "Waiting on the grant to be awarded. Work
  cannot be scheduled until it is." No decision date appears anywhere, which was
  the point: billing no longer reads the funding side at all.
- Pressed: "Export this as a spreadsheet" at the foot of the screen.
- Saw: no file arrived in Downloads. So I fetched the same route from inside the
  signed-in page instead, and it answered status 200, content type
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 39,996
  bytes, beginning with the bytes "PK", which is a valid workbook. The route
  serves the file correctly; what failed is the automated click, which Chrome
  does not let an extension turn into a download.
- Opened: the real workbook, built from live data by
  scripts/integrity/verify-billing-export.mjs and read back off disk.
- Saw: four sheets, "Read me | Client money | Grant money | Complimentary".
  Client money holds 11 rows beginning "2026-08-01, 2026-08, Oak Grove School
  District 68, Learning Hub Membership x20 (legacy pricing), hub_membership,
  1600". Grant money holds 22 rows, every one with an empty ready date and the
  reason "Waiting on the grant to be awarded". Complimentary holds 8 rows at 0.
- Saw: the amounts read back as JSON numbers, 1600 and 4500 and 22425, not as
  strings. Excel will add these up rather than treating them as text.

## The check that can fail

npm run check:billingexport exits 0 on the real data. To prove it is not a check
that cannot fail, I broke it twice on purpose and put it back:

- Appending the grant rows to the Client money sheet: exits 1, reporting
  "Client money totals $152,447.00, database says $54,920.00". That $152,447 is
  precisely the misleading number this separation exists to prevent.
- Writing amounts as "$1600.00" strings: exits 1, reporting "11 amount cell(s)
  are text, not numbers. Excel will not add them up."

Restored, exits 0 again.

## What I did not press

The Contracts screen's "Export all lines" button, because the same automated
click cannot produce a download either and the route and workbook are the same
code path, verified above. Its sheets are built by the same helper and are
covered by the same check.

## What I could not verify

That a download lands when a human presses the button. The route serves a valid
workbook to an authenticated request and the workbook contents are verified, but
Chrome will not let this automation complete a download, so the final hop from
button to file on disk is unproven. Rae pressing it once settles it.

Signed in as Review Admin rather than Rae, so anything gated on a specific
person's permissions is not proven by this.

## Claim tiers

- Measured: every quoted figure and string above, the response headers and byte
  count, the workbook contents read back off disk, and both deliberate breaks.
- Unverified: the button to file on disk hop in a real person's browser.
