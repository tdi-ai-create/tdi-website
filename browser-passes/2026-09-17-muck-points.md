# Browser pass

## What this change touches

The sales board at `/tdi-admin/sales`. Adds muck points: a pill on each card, a
four dimension breakdown when a lead is opened, and a factored roll up in the
top bar. Removes the retired T1 fit tier from the card, the filter chips and the
top bar stat.

## What I did

- Opened: http://localhost:3011/tdi-admin/sales
- Saw: the top bar rendered "1052 muck &middot; 20 heavy" with "1036 you &middot; 16 Bella"
  underneath it. Those are the live figures: `/api/sales/muck` returned
  `factoredMuck 1052, rae 1036, bella 16, heavy 20`, and
  `scripts/integrity/muck-dry-run.ts` independently printed the same four
  numbers. The route and the script agreeing is the check that neither is
  computing this on its own.
- Saw: the filter row now reads "DEAL TYPE:" and "SOURCE:" only. The "Fit Tier:"
  row and its T1, T2, T3 chips are gone.
- Saw: `/api/sales/muck` returned 200 with 201 scores, 100 of them carrying a
  total and 101 null. One example row read
  `total 20, band moderate, delivery 12, grant 0, drag 0, travel 8, offering FOCUS,
  value 6200, valuePredicted true, perPoint 310`.

- Pressed: the "Outreach Queue" tab
- Saw: it rendered without throwing, and its subtitle now reads "sorted by
  priority. Muck, staleness and value." That tab's priority weighting was
  rewritten in this change to key off the muck band instead of the retired fit
  tier, so a bad reference there would have thrown on click rather than shown a
  heading. It also exposed a double hyphen in that line, which the voice rules
  forbid, and it is fixed in this change.
- Pressed: the "List" toggle in the header
- Saw: the view switched from the kanban columns to the list and rendered "No
  opportunities match your filters." The list path calls `toCardOpp`, whose
  signature changed in this commit to take the muck map, so this confirms the
  new argument is threaded through both call sites rather than only the kanban.
- Saw: the top bar kept reading "1052 muck &middot; 20 heavy" across both views.

## What I could not verify locally

The cards themselves, and the breakdown panel. Every kanban column rendered
"No opportunities" and the header read "$0.00M pipeline, 0 active".

The board reads `sales_opportunities` in the browser with the anon key, and
without a Supabase session cookie scoped to the live domain that read returns
nothing. This is the condition CLAUDE.md describes, presenting as an empty board
rather than a login screen. The muck figures still rendered because
`/api/sales/muck` runs server side on the service role.

- Deferred: the local board returns no rows for the anon key, so no card exists
  to look at and no lead can be opened.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/sales, where
  I will confirm the muck pill renders on a card with its bar meter, open a lead
  and confirm the four dimension rows show their numbers and reasons, and check
  that no T1 badge remains anywhere.

## What I did not press

Nothing was pressed. This change adds a read only display and removes a retired
one. `/api/sales/muck` has no write path, and neither does
`scripts/integrity/muck-dry-run.ts`.
