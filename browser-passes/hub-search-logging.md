# Browser pass

## What this change touches

The search box on the Quick Wins browse page and the Hub search page. Neither
looks any different. What changes is that a search now writes a row to
`hub_activity_log` with the query, where it was typed, and how many results
came back.

## What I did

- Opened: nothing yet. See the deferral.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin, so neither localhost nor a vercel.app preview can be signed in to
  without a person typing real credentials. The logger skips signed out readers
  by design, so a signed out preview could not exercise it even if the page
  loaded. The previous deferred record was completed on production on
  28 September, so nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins

- Saw:

## What I did not press

Nothing by choice.

## What I could not verify

Everything, and for this change the important check is not visual. The page
looks identical whether the logger fires or not, which is exactly the shape of
the bug this codebase keeps producing. The download logger shipped on
9 September as `void supabase.from(...).insert(...)`, looked fine, and wrote
zero rows for a fortnight.

So the pass is not "I searched and the page looked right". It is:

- Type a query on the browse page, wait for the debounce, then find the row in
  `hub_activity_log` with `action = 'hub_searched'` and read the query back off
  it.
- Do the same on the Hub search page and confirm `source` says `global`.
- Search for something that returns nothing and confirm `zero_results` is true
  and `result_count` is 0. That row is the entire reason for the change.
- Confirm one settled query produces one row, not one per keystroke.

Verified without a browser: `tsc --noEmit` exited 0, and `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0. None of
those can tell whether a row was written.
