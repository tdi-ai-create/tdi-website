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

- Saw: done on production after the deploy, signed in as Rae. Opened
  https://www.teachersdeserveit.com/hub/search?q=paraprofesional and the page
  ran the search on mount.
- Saw: the row landed. Read straight back out of `hub_activity_log` with the
  service key: `2026-09-29T14:29:51.232834+00:00 source=global results=0
  zero=true query="paraprofesional"`. One row, not several. The logger fires,
  which is the only thing that could not be proved from the code.
- Saw: that single row is also the argument for the rest of phase four.
  "paraprofesional" with one s returns zero results on a Hub where 55 published
  tools carry the `para` tag.

### Second pass, 29 September 19:36Z, closing the debounce item

Picked up because the gate blocked an unrelated funding change behind this
record. Signed in as Rae on production.

- Pressed: the magnifier in the Hub top nav, which lands on /hub/search.
- Pressed: the search field, typed "walkthrough", then Return.
- Saw: "19 results for "walkthrough"", heading "Quick Wins (12)".
- Pressed: the field again, replaced with "qqzzxx no such tool", then Return.
- Saw: "No results for "qqzzxx no such tool"".
- Saw: both rows in `hub_activity_log`.

| Time | query | source | result_count | zero_results |
|---|---|---|---|---|
| 19:36:29Z | walkthrough | global | 19 | false |
| 19:36:43Z | qqzzxx no such tool | global | 0 | true |

The first row carries a `breakdown` of `quick_wins: 12`, `conversations: 7`,
`courses: 0`, adding to the 19 on screen. So a **non-zero** result count is now
exercised too, which the first pass could not do with a single misspelling.

**The debounce is proved.** "walkthrough" is eleven keystrokes and wrote one
row. Two settled queries, two rows, not twelve. That was the open item below and
it can be closed.

- Pressed: "More Filters" on https://www.teachersdeserveit.com/hub/quick-wins,
  looking for the browse search box to exercise the other source.
- Saw: there is no search box. Not hidden behind More Filters, not anywhere on
  the page. Confirmed three ways: the accessibility tree returned no input
  twice, and `HubFilterBar.tsx` contains no `<input>` element at all.

## What I did not press

The browse search box, because it does not exist. See below rather than reading
this as a step skipped.

## What I could not verify

**The `browse` source has never fired and currently cannot.** The Quick Wins
page keeps `searchQuery` state, filters on it, and passes `searchQuery` and
`setSearchQuery` into `HubFilterBar`, which imports a `Search` icon, holds a
`searchFocused` state and computes `matchingSuggestions` from a list of popular
topics. None of it renders. There is no input, so nothing can call
`setSearchQuery` except the `?search=` URL parameter.

So the browse half of this change is live, correct and unreachable, which is
this repo's documented dead component trap rather than a new bug. It is written
down here instead of being left to look like working coverage.

~~The remaining unverified item is the debounce.~~ **Closed on 29 September.**
It was exercised on the global search field rather than the browse box, which
does not exist: eleven keystrokes wrote one row. The debounce works. The browse
source remains unreachable and that is still the open finding here.

Verified without a browser: `tsc --noEmit` exited 0, and `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0. None of
those can tell whether a row was written.
