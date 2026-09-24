# Browser pass

## What this change touches

The sales board, against Rae's three tests on 24 September 2026: easy to edit,
easy to export based on filters, easy to read. Plus her correction that a
follow-up is "less about date and more about this is your responsibility to
follow up with", and that the call list should not be named after one person.

## What I did

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server sends every `/tdi-admin` page to
  the login screen. Confirmed again in Playwright on this branch.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/sales

The previous deferral on these screens was completed in full before this one was
opened, so this is sequencing rather than a habit.

## Measured before changing anything

- 20 leads carry `on_jims_call_sheet`. 18 are assigned to Jim, 2 are not. It is
  one shared flag, not a personal list, which is why it is now "Call list".
- `handleExport` read `activeOpps`, the whole board, not `filtered`. So
  narrowing to the 21 heavy leads and pressing the button handed over all 166
  and nothing on screen said so.
- `school_year` and `contract_year` were not in the PATCH whitelist and had no
  control on any screen. The board and the scorer both filter on `school_year`,
  so a wrong year means the lead is invisible and unfixable from the app.
- `is_contact_only` was in the whitelist with no control anywhere.
- The stage dropdown offered "Lost", which the pipeline rules forbid and which
  "Not this year" was built to replace.
- The bar read "74 not valued" and the chip below read "Not valued 96". Both are
  right: the chip counts the whole board, the bar excludes Targeting.

## What to press after the deploy

1. Filter to Heavy, read the export button, and confirm it says "Export these
   21" rather than "Export All". Download it and count the rows.
2. Clear the filters and confirm it reads "Export all 166".
3. Open a lead, set a follow-up, and confirm the banner leads with the person
   ("Bella is on this") rather than the date, and that an unassigned one reads
   "Nobody has taken this on".
4. Change a lead's school year to 2025-26 and confirm it leaves the board.
   Change it back.
5. Tick "This is a person, not a deal" and confirm the lead leaves the board and
   every total.
6. Open the stage dropdown and confirm "Lost" is gone.
