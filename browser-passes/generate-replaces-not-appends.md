# Browser pass

## What this change touches

The Auto-Generate button on the course admin page,
`app/tdi-admin/hub/production/courses/[id]` via `QuizQuestionBuilder`, and the
route behind it. Generating now retires the checks already on a lesson before
writing the new set, and the button asks before it replaces anything.

## Status

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers `/tdi-admin` with a login
  screen. The change cannot be exercised anywhere but production, and it is not
  deployed yet, so pressing the live button today would only prove the old
  append behaviour.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/hub/production/courses/0369d6db-89f2-4c90-a526-d036263b6221 open the lesson "Choosing Seating by Need", which currently carries 2 active checks, press Auto-Generate, confirm the button first reads "Replace 2?" with the amber warning rather than generating immediately, press again, and confirm the status reads "Replaced 2 with N new checks" and the lesson holds N rather than 2+N.

## What I did

- Opened:
- Pressed:
- Saw:

## The test is reversible, and that is deliberate

Retiring sets `is_active = false` and deletes nothing, so the two original
checks can be switched back on and the generated ones switched off, returning
the lesson to the state last night's rebuild left it in. The old question ids
will be recorded before pressing anything so the restore is exact rather than
approximate.

## Checked without the browser

- `npm run check:writes` exited 0. Both new writes take their error: the read of
  existing questions and the retire itself both refuse and return rather than
  carrying on, because a silent retire failure would leave the lesson serving
  two sets at once, which is the exact bug this change exists to stop.
- `npx tsc --noEmit` reports nothing in either changed file.
- The cause is measured, not assumed: every bloated lesson held an exact
  multiple of five, and the route read the highest `sort_order` then counted on
  from it. Five presses, five copies.

## Claim tiers

- Measured: the gates above, and the append behaviour in the route as it stands.
- Unverified until deploy: the warning, the replace, and the wording a person
  actually sees.
