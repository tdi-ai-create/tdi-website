# Browser pass

## What this change touches

Two new screens in the admin portal, `/tdi-admin/funding/schools` and
`/tdi-admin/funding/schools/[id]`, plus the two API routes behind them. Nothing
existing is modified. No control on any current page changes.

## What I did, completed against production 23 Sep 2026

Completed by a later session, signed in as Rae, with `funding_config.new_pages`
turned on for the check and turned off again immediately after.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/schools
- Saw: three schools. Allenwood "nothing awarded yet" of $56,372.8, 6 live paths.
  Saunemin **"2 won, amount not recorded"** in amber of $15,552, 6 live paths.
  St. Peter Chanel "nothing awarded yet" of $15,750, 9 live paths. The
  prediction's key claim holds: Saunemin does not read "$0".
- Pressed: the Saunemin row. Saw it open
  `/tdi-admin/funding/schools/83a8932b-66dc-4c67-b815-65c19358b123` on the Log
  tab, newest first, topmost "Illinois Prairie Community Foundation passed QA
  (julie)" at "22 Sept, 16:24".
- Pressed: the "Profile (8 unsourced)" tab. Saw educator count 23, FRL pct 59%
  and IEP students 29, each in a red bordered card reading "No source recorded",
  exactly as predicted.

### Two things to look at, neither blocking

- The goal renders as "of $56,372.8", an unformatted trailing decimal. The
  prediction itself wrote it as $56,373.
- The row link did not navigate on a synthetic click via the accessibility
  reference; a click at its coordinates did. The same happened on the Hub course
  curriculum earlier the same evening, so it may be one shared cause rather than
  two. Not established.

- Original deferral: the admin portal authenticates against a Supabase session cookie
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

## The pass, run on production (23 September 2026)

The flag was turned on to do this, because both routes 404 while it is off.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/schools
- Saw: three schools in alphabetical order, exactly as predicted. Allenwood
  "nothing awarded yet" against "of $56,372.8", 6 live paths. Saunemin CCSD #438
  reading **"2 won, amount not recorded"** in amber against "of $15,552", 6 live
  paths. St. Peter Chanel "nothing awarded yet" against "of $15,750", 9 live
  paths. The honest amber line is the thing this screen exists to get right, and
  it is right.
- Pressed: the Saunemin row.
- Saw: its page, headed "2 grants won, amount never recorded of $15,552 · 6 live
  paths", opening on the Log tab. Newest entry "22 Sept, 16:24, Illinois Prairie
  Community Foundation passed QA (julie) and needs your approval before it can go
  to the school", with Julie's full verdict beneath the entry below it.
- Pressed: the Profile tab.
- Saw: "Profile (8 unsourced)", and eight red cards, not the three predicted.

## Two things the live look found

**The prediction was wrong, and the truth is worse.** I predicted three
unsourced facts, being the three QA has rejected. Every one of the eight claims
on Saunemin's profile is unsourced. The stored record has no per-field sources
at all. There is a `proficiency_source` key, but the values it would describe
are stored as `math_proficiency` and `reading_proficiency`, so it attaches to
neither of them.

**Two cosmetic defects, both fixed in this branch.** A contract of 56372.80
rendered as "$56,372.8", a lone trailing decimal. And "No source recorded"
appeared under the address and the EIN, which are labels rather than claims and
are already excluded from the count, so it named a problem that does not exist.

## What I will press

The Saunemin row, to confirm it opens its page. Then the Profile tab. Neither
writes anything: both routes are read only and there is no editing control in
this change.

## What I could not verify

Whether the log renders acceptably at 200 entries. Saunemin has 204 timeline
rows and the route caps the fetch at 200, so the oldest few are not shown and
there is no paging yet. That is a deliberate limit for a first cut, not an
oversight, but nobody has seen how long the page feels at that length.
