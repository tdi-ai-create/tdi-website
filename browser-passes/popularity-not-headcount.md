# Browser pass

## What this change touches

"What your team is working on" on the partner leadership dashboard, and the
per school list inside each building row. Both stop printing headcounts. A row
now carries a direction and a share of the staff who signed in this month, and
the two activity tiles above the list carry a share of the roster instead of a
count of it.

## What I did

Nothing in a browser. This pass is deferred, see below.

- Deferred: `next dev` and `next build` both fail here with "`turbo.createProject`
  is not supported by the wasm bindings". `node_modules/@next/swc-darwin-arm64`
  contains only a package.json and a README, with the `.node` binary missing, so
  Next falls back to WASM and the fallback cannot build. Installing it fails too:
  npm cannot write to `/Users/raehughart/.npm` and asks for
  `sudo chown -R 501:20`, which I did not run. This is a pre-existing broken
  install affecting the whole repo, not something this change caused, and it
  means the page cannot be reached locally at all.

- Verify after deploy: https://www.teachersdeserveit.com/partners/saunemin-ccsd-438-dashboard
  Read the three tiles at the top of "What your team is working on", then press
  a building row open and read the list inside it. Expect percentages in the
  first two tiles, an arrow and a percentage on each content row, and the line
  "Percentages are a share of the staff who signed in this month" beneath the
  district list. Then open the Tidioute dashboard, a school of two, and confirm
  its rows show arrows and no percentages at all.

## Evidence short of the browser

Not observations off a screen, and not a substitute for one. Recorded so the
production check knows what it should find.

`npx tsx scripts/integrity/verify-popularity-display.mts` replays the real
hub_activity_log rows for every live partnership through the same exported rules
the dashboard renders with, and prints the rows a school will read. It reported
55 rows across 8 partnerships, "Directions: 43 up, 11 down, 1 steady, 0 no
claim", and asserted that no share exceeds 100%, that no real activity reads as
zero, and that no direction is claimed on a truncated read.

It is also what caught the small school problem. Tidioute has a roster of two,
and before the floor was added its dashboard printed "100%" against
"De-Escalation Strategies for Unstructured Environments", which in a school of
two names the person who opened it.

`tsc` exited 0. Confirmed that figure means something by appending a deliberate
type error to lib/partners/popularity.ts: tsc exited 2 and named
`lib/partners/popularity.ts(84,7)`, then exited 0 again once restored.

## What I did not press

Nothing was pressed anywhere. The district panel has no controls. The building
rows do expand, and that control is exactly what the production check above has
to exercise, because the per school list is one of the two lists this change
rewrites.

## What I could not verify

Everything visual. Whether the arrow and the percentage sit correctly against a
long title, whether the fixed 4rem column wraps on a phone, and whether the grey
chosen for a downward arrow reads as calm rather than as an error state.
