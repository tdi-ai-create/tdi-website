# Browser pass

## What this change touches

`/tdi-admin/funding`. Two things.

The portal lands on the Calendar again. It was landing on Work, which was my
choice and not the one asked for.

And a grant path with no date can now carry a date we set. 16 of 22 live paths
have no published deadline, so they appeared nowhere on a calendar. They are two
different problems and the screen now says which is which.

## What I did

Run locally against the live database. Signed in as Review Admin.

- Opened: http://localhost:3000/tdi-admin/funding
- Saw: it lands on **Calendar**, and Calendar is first in the chrome, ahead of
  Work.
- Saw, under the coverage line: a button reading "16 paths have no date. Show
  them".
- Pressed: it.
- Saw: two groups, labelled. "Window open, no published deadline. The date is
  ours to choose." over the settable ones, starting with NEA Learning &
  Leadership Grant and IAA Foundation. Below them, "Window not established.
  These need the real date found, not one invented."
- Saw: "Set the target" is dimmed while the date is empty.
- Pressed: the Apply by field, typed 11/16/2026, then the Why this date field,
  typed "Verifying the control. Clear this.", then "Set the target".
- Saw: "Saved", the button became "Change the target" with "Clear it" beside
  it, and the header changed to "16 paths have no date, 1 with a target we set".
- Confirmed in the database, not from the screen:
  `internal_target_date = 2026-11-16`, the note stored, and
  **`application_closes` still null**. The funder's deadline and our intention
  are separate columns and the control only writes one of them.
- Pressed: the next-month arrow twice, to November 2026, then "Hide".
- Saw: "NEA Learning & Lead..." sitting on **16 November**, drawn solid rather
  than dashed, because nobody derived this date, somebody chose it.

## The three cases, measured before building

Of 22 live paths, 16 carry no `application_closes`:

    window open, no close date      7   the date is ours to choose
    window unknown                  6   nobody has looked it up yet
    closed_missed                   2   the window already went

Only the first group gets a target. Offering one on a path whose window nobody
has established would be inventing a deadline on top of a fact we have not
checked, and the panel says so instead.

## Cleaned up

The test target was cleared. `internal_target_date` is null on every row again,
so nothing carries a date Rae did not choose.

## What I did not press

Nothing that sends. Nothing on a school's record.

## What I could not verify

Production, because this is not merged.

Whether a target should drive a chase or a reminder. Today it draws on the
calendar and nothing else reads it. That is deliberate for a first cut: a date
that starts emailing people the moment it is typed is a different feature.

## Claim tiers

- Measured: every count and date above, from the screen and the database.
- Unverified: production, and any downstream use of the new column.
