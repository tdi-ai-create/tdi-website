# Browser pass

## What this change touches

Two new screens in the admin portal, `/tdi-admin/funding/schools` and
`/tdi-admin/funding/schools/[id]`, plus the two API routes behind them. Nothing
existing is modified. No control on any current page changes.

## What I did

- Opened: http://localhost:3000/tdi-admin/funding/schools
- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers every `/tdi-admin` page
  with a login screen.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/funding/schools

## The flag makes this deferral different from the usual one

`funding_config.new_pages` is **off**, applied to production on 23 September and
confirmed by query. Both API routes return 404 while it is off, so these screens
are unreachable even after deploy.

That means this cannot be verified simply by shipping it. The sequence is: merge,
deploy, turn the flag on, look, then decide whether it stays on. The flag going
on is itself the thing to be careful about, and it is one UPDATE in each
direction with no deploy.

## The prediction

Written before looking, from the live data.

**The list** shows three schools in alphabetical order.

Allenwood Elementary, goal $56,373, no grants won, so it reads "nothing awarded
yet" with an empty progress bar and "6 live paths".

Saunemin CCSD #438, goal $15,552, and this is the interesting one: it has two
grants marked awarded and neither carries an amount, so it must read
**"2 won, amount not recorded"** in amber rather than "$0". A zero would state
that nothing has ever been won, which is false.

St. Peter Chanel School, goal $15,750, "nothing awarded yet", 9 live paths.

**The school page** for Saunemin opens on the Log tab showing entries newest
first, the most recent being the Illinois Prairie narrative passing QA on
22 September. The Profile tab is labelled with a count of unsourced facts and
shows educator count 23, free and reduced lunch 59 percent and IEP students 29
each in a red bordered card reading "No source recorded", because those are the
three figures QA rejected on attempts 1, 3 and 5 of the same application.

## What I will press

The Saunemin row, to confirm it opens its page. Then the Profile tab. Neither
writes anything: both routes are read only and there is no editing control in
this change.

## What I could not verify

Whether the log renders acceptably at 200 entries. Saunemin has 204 timeline
rows and the route caps the fetch at 200, so the oldest few are not shown and
there is no paging yet. That is a deliberate limit for a first cut, not an
oversight, but nobody has seen how long the page feels at that length.
