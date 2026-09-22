# Browser pass

## What this change touches

The sales board at `/tdi-admin/sales`: the filter row, the sticky top bar, and
the lead detail panel including the button that used to close a deal.

## Status: deferred, and deliberately so

This record carries no observations, because there was nothing to observe. I
could not reach this board in any environment that renders it with rows:

Localhost, with the dev server running against the live database, showed
"Loading admin portal..." and then redirected. The board reads
`sales_opportunities` with the anon key and there is no live-domain session on
localhost. This is the same condition the 17 and 21 September records hit.

The preview build for this branch did the same thing, sitting on "Loading admin
portal..." for five seconds before landing on `/tdi-admin/login`. The admin
session does not carry to a preview domain, and signing in is not something I
do.

Production is the only environment with rows, and this change is not there.

What I did instead was check every number the new filter row will show against
the live database, so the chips are measured rather than guessed: the four deal
type chips it replaces (Expansion 0, Pilot 0, New Business 202 of 213, Renewal
9), and the 34 distinct `source` values across 213 leads of which only 8 were
reachable, with the largest category split five ways. `npx tsc --noEmit`
returns 0 errors across the repo.

Rae is reviewing this on the preview, signed in as herself, before it merges.
That is the substitute for the pass, and it is the reason this is not being
merged on the strength of a typecheck the way a smaller change would be.

- Deferred: localhost and the preview both sit behind the admin login, and the
  only environment with rows is production.
- Verify after deploy: on https://www.teachersdeserveit.com/tdi-admin/sales:
  1. The filter row reads "How heavy:" with Light, Moderate, Heavy and Not
     valued, then "Where it stands:" with Needs outreach and Renewal. No Deal
     Type row and no Source row. Not valued should read 74.
  2. Two chips together narrow rather than widen, and "Clear filters" appears
     and works.
  3. A chip whose count is 0 is greyed and unclickable rather than live.
  4. The top bar no longer reads "N you / N Bella". It reads "TDI admin load,
     factored by stage" under the muck total.
  5. Opening a lead shows the muck block collapsed to its summary line, with
     "What makes this score" expanding four dimensions that now read "20 / 40"
     rather than a bare number.
  6. A lead with no state recorded shows Travel as "not known", not 0.
  7. The footer reads "Not this year" where it read "Mark as Lost". It offers a
     reason and a date defaulting four months out. Saving moves the lead to
     Engaged, sets `revisit_on`, and writes a note. Check the note appears in
     the history and the stage is engaged, not lost.

## What I did not press

Nothing, on any environment. That is the point of the deferral above rather
than something to paper over.

### Deferral closed after deploy, 21 September 2026

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: the filter row reads "HOW HEAVY: Light · 54, Moderate · 32, Heavy · 21,
  Not valued · 96" and "WHERE IT STANDS: Needs outreach · 163, Renewal · 7".
  No Deal Type row and no Source row. The search placeholder now ends
  "city, source...".
- Saw: the top bar reads "1164 muck · 21 heavy" over "TDI admin load, factored
  by stage". The line that read "1148 you · 16 Bella" is gone.
- Pressed: the "Addison SD4" card in Likely Yes, the lead from Rae's
  screenshot.
- Saw: the panel opens with the score collapsed to one line, "65 HEAVY / Top
  fifth of the board" on the left and "$154 per muck point" over "$10,000
  PREDICTED" on the right. No "Yours 40 / Bella's 25". The note box and the
  first two history entries are visible without scrolling, where before the
  four dimension bars filled that space.
- Pressed: "What makes this score".
- Saw: the four dimensions expand reading "20 / 40", "25 / 25", "20 / 20" and,
  for Travel, "not known" against the reason "No state recorded, so distance
  is unknown". The link becomes "Hide what makes this score".
- Pressed: "Not this year" in the panel footer, where "Mark as Lost" used to
  be.
- Saw: a dialog headed "Not this year" saying "They stay in Engaged. Nothing is
  closed, and they keep getting the educator emails.", a "Why not now" select
  defaulting to "Budget year, not this one", and a "Reach back out on" date
  prefilled 01/22/2027, which is four months out.
- Pressed: "Cancel".
- Saw: the dialog close. Confirmed in the database that nothing was written:
  Addison SD4 is still stage `likely_yes` with `revisit_on` null and
  `updated_at` unchanged at 2026-09-14, so the cancel path does not touch the
  record.

## Known wrinkle, not a defect

"Not valued · 96" in the filter row and "74 not valued" in the top bar count
different populations. The top bar excludes Targeting, as it always has for the
pipeline figure; the filter counts the whole board. 74 + 22 unscored Targeting
leads = 96. Both numbers are right and they are labelled the same, which will
read as a contradiction to anyone who has not been told. Worth reconciling.

## What I did not press

"Save and pause", because exercising it means changing a live record, and
Addison is not a lead anyone has decided to pause. That path is still
unexercised end to end: the cancel path is verified, the write path is not.
