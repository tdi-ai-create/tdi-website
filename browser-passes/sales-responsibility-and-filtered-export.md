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

## The production pass, done 24 September 2026 after the deploy

Signed in as Rae, on a throwaway lead named "ZZ Sandbox Pass 637" that was
deleted afterwards along with its notes.

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: the bar reads "Call list: 20" and the button "Export call list". Searched
  the whole page for "Jim's list" and "Export Jim's List" and both return no
  match, so the rename is complete rather than partial.
- Saw: "167 active  74 not valued in pipeline" in the bar and "Not valued on the
  board &middot; 96" in the chip row. The same two words no longer produce two
  numbers.
- Saw: with no filter the export button reads "Export all 213 shown".
- Pressed: the "Heavy &middot; 22" chip.
- Saw: the button became "Export these 22" and "Clear filters" appeared. The
  board narrowed to the heavy leads.
- Typed "ZZ Sandbox Pass" into the search box.
- Saw: the button became "Export these 1". So the export follows the search as
  well as the chips.
- Opened the lead. Read the stage dropdown out of the DOM: nine options,
  unassigned through paid, and **no "lost"**.
- Saw: a School year select carrying 2025-26, 2026-27 and 2027-28, and a
  checkbox reading "This is a person, not a deal". Neither existed before.
- Pressed: "+ Give this to someone", chose Bella, a date of 22 September which
  is in the past, and saved with "Assign and write to notes".
- Saw: the banner read "**Bella is on this** call, by Sep 22" with PAST DUE as a
  small badge, and "Set by Rae on Sep 24" under it. The person leads and the
  date trails, which is the change.
- Saw: the card behind it carried the pill "BELLA &middot; CALL &middot; PAST
  DUE SEP 22", name first.
- Pressed: the "This is a person, not a deal" checkbox.
- Saw: the card left the board immediately and the export button dropped to
  "Export these 0", with "No opportunities" in every column.
- Reverted that, reloaded, reopened the lead, and changed School year from
  2026-27 to 2025-26.
- Saw: the export button dropped to "Export these 0" again, so the lead left the
  board. Queried the row afterwards: `school_year` is `2025-26`, so the write
  landed rather than only the screen changing.

Both deferrals on these screens are now complete.

## What was pressed (original list)

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
