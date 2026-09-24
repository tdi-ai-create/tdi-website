# Browser pass

## What this change touches

The card for a post written by TDI, in the conversation tab. The "From TDI" tag
above the name is removed, because the navy TDI badge on the byline already says
it.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/creative-ideas-rigid-seating as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns
- Pressed: "Skip for today" on the Vibe Check popup
- Saw: the four bylines reading "Trevon Baptiste TDI . Classroom Teacher", "Ingrid Vasquez-Lund TDI . Classroom Teacher", "Wendell Prosser TDI . Classroom Teacher" and "Ravi Chandrasekar TDI . Classroom Teacher", each carrying the navy badge and no time
- Saw: Wendell's and Ravi's cards each also carrying a "From TDI" tag above the name, so those two cards say TDI twice. The Question cards do not have this problem, because Question describes the post rather than repeating who wrote it.

## What I could not verify

The cards with the tag gone. That needs this deployed.

- Deferred: the change is in the component and not in production yet.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/creative-ideas-rigid-seating Wendell Prosser's and Ravi Chandrasekar's cards should carry the navy TDI badge on the byline and no tag above the name, while the Question cards keep their tag.

## A correction recorded here

An earlier screenshot of this page showed "21h ago" on every byline. Rechecked
on production after the timestamp deploy landed and the times are gone, so that
screenshot was of a cached version rather than a miss.

## What I did not press

Nothing that writes.

## Checked without the browser

npx tsc --noEmit exited 0.
