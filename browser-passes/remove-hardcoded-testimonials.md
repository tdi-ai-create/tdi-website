# Browser pass

## What this change touches

The "What educators are saying" block on every quick win page, every game page,
and every course page. It is removed.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns
- Pressed: "Skip for today" on the Vibe Check popup, which blocks every click until dismissed
- Saw: the conversation section carrying only our own two posts, "Rosalie Dunne TDI . Classroom Teacher . 18h ago" tagged "Question" and "Everett Crane TDI . Para . 18h ago" tagged "From TDI", with the filter row reading "All 1" and every seeded teacher gone
- Saw: below that, a quote reading "Finally something I can use in 5 minutes between classes. That's real." attributed to "-- High school math teacher, 3 days ago". Nobody said it. It is a hardcoded string in the page, which is what this change removes.

That is what the block looks like before the change. The database was already
clean at this point, which is how the hardcoded copy became visible.

## What I could not verify

The pages with the block gone. That needs this deployed.

- Deferred: the removal is in the page source and not in production yet.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts should show no "What educators are saying" heading at all, and the same for a course page and a game page.

## What I did not press

Nothing that writes.

## Checked without the browser

npx tsc --noEmit exited 0. npm run lint reports warnings only on both changed
files, all of them pre-existing unused imports, and no errors.
