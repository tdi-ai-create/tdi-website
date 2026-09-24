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
