# Browser pass

## What this change touches

Every byline in the conversation and Q&A tabs, on quick wins, games, courses and
lessons. The relative time is removed, so a byline reads name, TDI chip if ours,
then role. Posts and replies both.

## What I did

- Opened: http://localhost:3001/hub/quick-wins/calm-response-scripts
- Saw: the app redirected to "/hub/login?returnUrl=%2Fhub%2Fquick-wins%2Fcalm-response-scripts" and rendered the marketing page, h1 "Professional Development That Actually Works", with 0 TDI chips and no conversation section

The local server authenticates against the live domain, so a magic link minted
for a TDI-owned account lands on production rather than localhost and the Hub
page never receives a session it accepts.

- Deferred: the local app cannot hold a Hub session, so the byline cannot be seen there.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts the two TDI bylines should read "Rosalie Dunne TDI Classroom Teacher" and "Everett Crane TDI Para" with no "19h ago" or any other time.

## Why the time is going

Nothing on the page ages any more. A conversation that shows 19h ago today shows
eight months ago in May, and a tool nobody has posted on since looks abandoned
rather than quiet. Removing it also removes the only place an invented date
could be displayed, which matters after archiving 2,394 seeded posts that were
backdated by the trigger that wrote them.

created_at is untouched in the database, so ordering, the admin view and any
future scorecard still work from real timestamps.

## What I did not press

Nothing that writes.

## Checked without the browser

npx tsc --noEmit exited 0. The two getTimeAgo helpers are removed rather than
left unused, since nothing else calls them.
