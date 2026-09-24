# Browser pass

## What this change touches

The Community tab on a course page, `/hub/courses/[slug]`. It could not carry a
question before, and on a newly published course it was empty.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/calm-response-scripts as marisol.aguirre@voices.teachersdeserveit.com, an account TDI owns
- Pressed: "Skip for today" on the Vibe Check popup
- Saw: the equivalent tab on the quick win side rendering correctly, two TDI chips on "Rosalie Dunne" and "Everett Crane", tags reading "Question" and "From TDI", and the filter row reading "All 1" with "Question 1". That is the shape courses should now match.

## Verified in the database rather than the browser

Published a throwaway course inside an uncommitted transaction. Before the
trigger existed it wrote nothing. After, it wrote exactly one row:
contribution_type "question", body "What are you hoping is different in your
room by the end of this?", author Marisol Aguirre, is_tdi_voice true, created_at
inside the last minute. The probe row did not persist, confirmed by
`hub_courses where slug like '%dry-run-tmp%'` returning 0.

The insert of 124 posts across the 31 published courses was refused outright by
the old check constraint, 0 of 124 written, which is how the missing constraint
was found. After the constraint was widened the same run wrote 124 of 124.

## What I could not verify

A course page in a browser showing its Community tab populated.

- Deferred: the local server authenticates against the live domain, so a Hub page there redirects to login and never renders the conversation section.
- Verify after deploy: https://www.teachersdeserveit.com/hub/courses/boundaries-without-backlash open the Community tab and confirm it carries posts with the TDI chip, and a "Question" tag that could not have rendered before this.

## What I did not press

Publish on a real course. Every probe ran inside a transaction that was never
committed.

## Checked without the browser

`npm run check:schema` exited 0 locally but printed "Skipping schema check: no
Supabase credentials available", so that is a skip rather than a pass. CI runs
it with the secrets.
