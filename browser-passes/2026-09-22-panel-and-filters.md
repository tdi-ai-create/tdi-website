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
