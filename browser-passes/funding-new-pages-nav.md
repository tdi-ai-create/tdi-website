# Browser pass

## What this change touches

The funding portal tab row, and the headers of the two rebuilt screens. The
calendar and the school profiles were live but nothing linked to them, so the
only way to reach either was to type the URL. They are now two links in the
same row as Needs you, Schools, Funders and Awarded, and both screens link
back to the portal instead of dead-ending.

## What I did

Run locally against the live database, not on production, because the change
is not merged yet. Everything read below is real funding data, not fixtures.
Signed in as Review Admin rather than as Rae, which matters only for the
sidebar name and not for anything read here.

- Opened: http://localhost:3000/tdi-admin/funding
- Saw: the tab row now reads "Needs you 25, Schools, Funders, Awarded,
  Calendar, Profiles". Calendar and Profiles were not there before this change.
  The board beneath is unchanged: "NEEDS YOU 25 across 3 schools", "STILL TO
  FIND $87.7K", "AWARDED $0, 1 more not recorded".
- Pressed: "Calendar"
- Saw: September 2026, and the line "6 of 22 live grant paths have a confirmed
  deadline. The rest have no date yet, so they cannot appear here until
  somebody confirms a window." Five entries bunched on the 15th, both funders
  closing on the 30th, and the greyed predictions on the 24th.
- Pressed: the "Illinois Prairie Comm... approval due" entry on the 24th
- Saw: the panel opens headed "PREDICTED, NOT CONFIRMED" and reads "Passed QA
  on 2026-09-22 and waiting on a person. 2 days is the allowance before it
  reads as stuck." The only control in it is the link "Open Saunemin CCSD
  #438". There is nothing to press that changes anything, which is the
  read-only gap this change does not close.
- Pressed: "Schools" in the calendar header
- Saw: Partnership schools, three rows. Saunemin CCSD #438 reads "1 won,
  amount not recorded of $15,552", not a false zero. Allenwood reads "nothing
  awarded yet of $56,373", St. Peter Chanel "nothing awarded yet of $15,750".
- Pressed: "Saunemin CCSD #438"
- Saw: the profile opens on "1 grant won, amount never recorded of $15,552 ·
  7 live paths", with tabs "Log" and "Profile (7 unsourced)". The log's top
  entry is 22 Sept, 16:24, "Illinois Prairie Community Foundation passed QA
  (julie) -> needs your approval before it can go to the school".
- Saw: both new screens now carry a "Funding portal" link in the header, and
  the schools list carries "Calendar". Neither screen is a dead end anymore.

## Checked without the browser

- `npx tsc --noEmit` reported nothing in any funding file.
- Counted the write actions on both sides: the old portal and its components
  issue 36 POST/PATCH/DELETE calls across 10 endpoints under
  `/api/funding/`. The three rebuilt screens issue 1, to
  `/api/funding/schools/[id]/facts`.

## What I did not press

Nothing that sends or changes anything. I did not approve the Illinois Prairie
narrative, did not record an award amount, and did not edit a profile fact.
Each of those changes a real grant that a real school is waiting on.

## What I could not verify

That this looks right on production, because it is not merged. The pages
themselves are already on `main` and already deployed, so only the six links
added here are unproven in production.

Whether the "Profiles" label is the right word for Rae. The old portal already
has a tab called "Schools" that is a different screen, so the two could not
share a name.
