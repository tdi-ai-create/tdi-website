# Browser pass

## What this change touches

The Community tab on a course page and the conversation on a lesson page. The
TDI chip did not render on either, so our posts were indistinguishable from a
member's.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/courses/boundaries-without-backlash as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns
- Pressed: "Skip for today" on the Vibe Check popup
- Pressed: the "Community" tab, since a course page opens on its Course tab and the conversation is not mounted until then
- Saw: the posts rendering with the right tags, "Question" twice and "From TDI" twice, and the filter row reading "All 3" with "Question 2"
- Saw: the bylines reading "Marisol Aguirre . Classroom Teacher", "Trevon Baptiste . Classroom Teacher", "Jarrod Levins . School Leader" and "Rosalie Dunne . Classroom Teacher", with **0 TDI chips on the page**. All four are TDI-owned accounts, and nothing on the screen said so.

That is the bug. The quick win page renders the chip correctly, so the gap was
in the two routes that never returned the flag.

## What I could not verify

The chip rendering on a course. That needs this deployed.

- Deferred: the flag is not in the course or lesson API responses in production yet.
- Verify after deploy: https://www.teachersdeserveit.com/hub/courses/boundaries-without-backlash press "Community" and confirm each of the four bylines carries a TDI chip.

## What I did not press

Nothing that writes. Posting on a course would create a real row on a real page.

## Checked without the browser

npx tsc --noEmit exited 0.
