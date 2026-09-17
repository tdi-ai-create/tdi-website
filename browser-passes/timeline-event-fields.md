# Browser pass

## What this change touches

The Partnership Timeline on `/partners/[dashboardSlug]`, and every generated report that
lists events.

## The bug

`timeline_events` stores `event_title` and `event_date`. The `TimelineEvent` interface and
all eight consumers in the page read `.title` and `.date`. Nothing errored, because both
are simply `undefined`, so the timeline rendered a coloured bullet with no text and no
date for every event.

Rae caught it on Saunemin's live dashboard: "why isnt this filled in with upcomign things
etc". The counts were right, 9 Done and 2 Coming Soon, and every label was blank.

It also silently blanked event names inside the AI generated reports at lines 1676, 1678
and 1840, which build strings like `- ${e.title} (${e.date})`. Those have been emitting
empty bullets to leaders.

## What I did

- Opened: https://www.teachersdeserveit.com/api/partners/dashboard/02f4b713-f258-4dff-a526-91565ff9a8e6
  which is the exact payload the dashboard consumes
- Saw: 11 timeline events returned. Keys on each row are `created_at, created_by,
  event_date, event_description, event_title, event_type, id, notes, partnership_id,
  sort_order, status`
- Saw: `has title? False | has event_title? True`. There is no `title` key at all
- Saw: the two upcoming rows are `'Observation Day 1 - full day on site'` and
  `'Observation Day 2 - tentative'` under `event_title`, while `.title` reads `None`.
  That is the blank bullet, proven against production rather than inferred
- Ran: `npm run typecheck`, exit 2, 17 errors all in `.next/types/validator.ts`, zero in
  source

## The fix

Normalise at the boundary in `setTimelineEvents`, mapping `event_title` to `title` and
`event_date` to `date`, rather than editing eight call sites. Falls back to the
un-prefixed names so it keeps working if the API is ever changed to map them server side.

## Deferred pass

- Deferred: `/partners/[dashboardSlug]` needs a live Supabase session and the Chrome
  profile the extension controls holds an expired token. The page renders as an empty
  body locally, so the timeline cannot be reached or signed in to here.
- Verify after deploy: https://www.teachersdeserveit.com/partners/saunemin-ccsd-438,
  Our Partnership tab, Partnership Timeline. Coming Soon should read
  "Observation Day 1 - full day on site, Oct 7, 2026" and
  "Observation Day 2 - tentative, Mar 3, 2027" instead of two empty bullets.
