# Browser pass

## What this change touches

The Quick Wins browse page and the filter bar it shares with Courses. A search
box that rendered no input has had its remaining machinery removed: the query
state, the props, the Search and X icon imports, a focus state and a list of
suggested topics nothing displayed.

Nothing visible should change, because none of it was visible. That is the
point, and also why this needs pressing rather than reasoning about.

## What I did

- Opened: nothing yet. See the deferral.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin, so neither localhost nor a vercel.app preview can be signed in to
  without a person typing real credentials. The previous deferred record,
  `hub-search-logging.md`, was completed on production on 29 September, so
  nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins

- Saw: done on production after the deploy, signed in as Rae. Opened
  https://www.teachersdeserveit.com/hub/quick-wins and it came up reading
  "290 quick wins" with the cards rendered and the filter row intact. No search
  box anywhere, which is the intended state rather than a regression.
- Pressed: the "Working Together" pill.
- Saw: "Showing 22 of 290 quick wins" with the subtitle "Tools for the adults in
  the building, not the students" beneath it, and the four new para tools at the
  top of the grid. So `isFiltered` still drives the count line correctly after
  the search term was taken out of it.
- Pressed: the "I am a..." dropdown, selected Para, with Working Together still
  on.
- Saw: 22 became 11, the dropdown turned navy to show it was active, and the
  shelf stayed selected. Both filters still combine.
- Opened: https://www.teachersdeserveit.com/hub/courses, which shares this
  filter bar.
- Saw: "41 courses" with its own pills (All, In Progress, Stress & Wellness,
  Classroom Management) and the In Progress row rendering course cards. Untouched,
  as intended, and now confirmed rather than assumed.
- Saw: one thing worth writing down for the next person. Both pages sat on
  "Loading your Hub..." for around twenty seconds before rendering, and the first
  click on a pill was swallowed during that window. That is the auth gate, not
  this change, but it is long enough to read as broken.

## What I did not press

The Vibe Check answers on either page. Pressing one writes a real wellbeing entry
against Rae's account and moves her dashboard, so it was skipped for today.

## What I could not verify

- Mobile width. Only desktop was opened. The pill row scrolls horizontally and
  nothing in this change touched that, but it was not looked at.
- Whether any bookmark still carries `?search=` on the Quick Wins page. That
  parameter is now ignored rather than erroring, and no link in the codebase
  produced one, but a bookmark somebody saved cannot be checked from here.

Verified without a browser: `tsc --noEmit` exited 0, `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0, and `knip`
no longer reports anything in `lib/hub/log-search.ts`.
