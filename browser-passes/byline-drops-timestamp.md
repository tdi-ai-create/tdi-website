# Browser pass

## What this change touches

Every byline in the conversation and Q&A tabs, on quick wins, games, courses and
lessons. The relative time is removed, so a byline reads name, TDI chip if ours,
then role. Posts and replies both.

## What I did

- Opened:
- Pressed:
- Saw:

Waiting on the deploy. The local attempt is written below rather than on those
lines, because a page that redirected to login is not an observation of this
change.

## The local attempt

Ran this branch on localhost:3001 and opened the tool page. The app redirected
to "/hub/login?returnUrl=%2Fhub%2Fquick-wins%2Fcalm-response-scripts" and
rendered the marketing page, h1 "Professional Development That Actually Works",
with 0 TDI chips and no conversation section at all.

The local server authenticates against the live domain, so a magic link minted
for a TDI-owned account lands on production rather than localhost, and the Hub
page never receives a session it accepts.

## What I could not verify

The byline itself.

- Deferred: the local app cannot hold a Hub session, so no byline renders there.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts the two TDI bylines should read "Rosalie Dunne TDI Classroom Teacher" and "Everett Crane TDI Para" with no "19h ago" and no other time.

## Why the time is going

Nothing on the page ages any more. A conversation showing 19h ago today shows
eight months ago by May, and a tool nobody has posted on since reads as
abandoned rather than quiet. It also removes the only surface where an invented
date could be displayed, which matters after archiving 2,472 seeded posts that
the triggers had backdated.

created_at is untouched in the database, so ordering, the admin view and any
future scorecard still work from real times.

## What I did not press

Nothing that writes.

## Checked without the browser

npx tsc --noEmit exited 0. Both getTimeAgo helpers are removed rather than left
unused, since nothing else calls them.
