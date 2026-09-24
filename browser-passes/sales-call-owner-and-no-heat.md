# Browser pass

## What this change touches

The sales board. The phone button on every card becomes a coloured picker for
who is making the call, a filter row is added for the same thing, and hot, warm
and cold are removed from every screen.

## What I did

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server sends every `/tdi-admin` page to
  the login screen.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/sales

The previous deferral on these screens was completed in full first, on
production, and is recorded in `sales-followup-alerts.md`.

## Measured before changing anything

- 20 leads carried `on_jims_call_sheet`. 18 were assigned to Jim and 2 to Rae,
  so the backfill from `assigned_to_email` is exact rather than a guess. After
  the migration, zero leads carry the flag without a named caller.
- Heat is read in exactly one place in the model: `chaseOrder` uses it as a
  tiebreak that only applies after value per muck point, which almost never
  ties. So removing it from the UI does not silently change the queue order,
  and `lib/sales/muck.ts` is not touched while it is frozen.

## What was done to heat

Removed from the card, the panel header, the right-click menu, the top bar
count, the kanban grouping and the spreadsheet export. The column stays in the
database, so the twelve dated heat decisions recorded on 21 September survive.
This is the same treatment the retired T1 fit score got.

The kanban columns are now one flat list per stage ordered by value per muck
point, instead of four collapsible HOT / WARM / COLD / PARKED bands.

## The production pass, done 24 September 2026 after the deploy

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: a new filter row headed "WHO IS CALLING" with coloured chips reading
  "Rae &middot; 2", "Bella &middot; 0", "Kristin &middot; 0", "Jim &middot; 18"
  and "Nobody yet &middot; 190". The counts sum to 210 against 212 drawn, the
  difference being two leads outside the chip set, and the 18 plus 2 matches the
  20 leads that carried the old boolean exactly.
- Saw: no card, column, panel or bar anywhere says hot, warm or cold. The top
  bar block that held "51 hot" now carries only "2 invoices, owed to us". The
  kanban columns are one flat list per stage with no HOT / WARM / COLD headers.
- Saw: the export button reads "Export all 212 shown".
- Saw: the phone position on each card is now a circle. Rae used it herself
  during this session and set Bella on Addison SD4; that card came back showing
  a yellow circle with a B in it.
- Pressed: the circle on a card in the Qualified column.
- Saw: **a defect.** The menu opened but was cut off down its right edge by the
  scrolling kanban column, so the options read "Nobody... the call", "Rae is c",
  "Bella is", "Kristin i", "Jim is c". Unusable. Reported by Rae as "overlap
  issue" with a screenshot.
- The cause is that the menu was absolutely positioned inside a column with
  `overflow-y: auto`, which clips anything escaping it. Fixed in the next change
  by drawing the menu into document.body through a portal.

## What to press after the deploy

1. On any card, click the circle where the phone icon was. Confirm the menu
   lists Rae, Bella, Kristin, Jim and "Nobody, take it off the call list".
2. Pick Bella. Confirm the circle turns yellow with a B in it, and that the
   "Call list" count in the bar goes up by one.
3. In the "Who is calling" filter row, click Bella and confirm the board narrows
   to her calls and the export button says how many.
4. Set the same card back to Nobody and confirm the circle goes grey, the count
   drops, and it leaves the Bella filter.
5. Confirm no card, panel, menu or bar anywhere says hot, warm or cold.
6. Export the full board and confirm the spreadsheet has a "Who is calling"
   column and no "Heat" column.
