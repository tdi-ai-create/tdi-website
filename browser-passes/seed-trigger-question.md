# Browser pass

## What this change touches

No screen directly. It changes what appears in the conversation section of a
quick win the moment it is published, so the next published tool is the first
place a person sees it.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns
- Pressed: "Skip for today" on the Vibe Check popup
- Saw: the conversation section rendering "Question" and "From TDI" tags with the TDI chip on the bylines "Rosalie Dunne TDI . Classroom Teacher" and "Everett Crane TDI . Para". That is the shape the trigger now produces on publish, confirmed on a tool that already carries it.

## Verified in the database rather than the browser

Published a throwaway quick win inside an uncommitted transaction, twice.

Before applying, the old function wrote 5 posts. After applying, the same
publish wrote exactly 1, reading "If you have a version of this that works
better, what does it look like?", authored by Marcus Oyelaran, an account on
voices.teachersdeserveit.com, with created_at inside the last minute rather
than backdated.

## What I could not verify

A newly published tool showing this in the Hub, because none has been published
since the change. The last publish was 11 September.

- Deferred: no quick win has been published since the trigger changed.
- Verify after deploy: the conversation section of the next published tool at https://www.teachersdeserveit.com/hub/quick-wins should carry one question from a TDI account and nothing else.

## What I did not press

Publish on a real quick win. Every probe ran inside a transaction that was
never committed, and the post count stayed at 1,567 throughout.
