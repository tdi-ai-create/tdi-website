# What we saw in your building rendered a heading above nothing

Date: 1 October 2026
Screens: http://localhost:3000/partners/addison-sd4 and
https://www.teachersdeserveit.com/partners/addison-sd4, the 2025-2026 year tab.

## What was wrong

The panel added yesterday renders each site visit's title and date and never
rendered the note. On Addison it printed "Observation Day 1 / Feb 24, 2026" and
stopped, so the only part worth reading was missing from the only partnership
that has content.

The cause is mine and it is the phantom field pattern: I typed the entry as
carrying `note`, `body` or `text`, and read those three in that order. No row
has ever had any of them. Every entry uses `notes`, plural. The filter above it
admits an entry on `title` alone, so the panel passed every check, typechecked,
and rendered a heading over a date.

Checked rather than guessed this time. Across all 22 semester records the only
keys present in `observation_notes` are `date`, `notes`, `title` and
`love_notes`.

## What I verified

- Measured: 22 semester records exist across 9 partnerships. Exactly one row
  has `observation_notes` content, Addison SD4, spring-2026, two entries.
- Pressed: the **2025-2026** year tab on Addison, on production, before the fix.
- Saw: "What we saw in your building ... **Observation Day 1 Feb 24, 2026
  Observation Day 2 - Indian Trail & Army Trail Mar 19, 2026**", with no note
  text between them.
- Pressed: the same tab on localhost after the fix.
- Saw: "Observation Day 1 Feb 24, 2026 **Classroom walk-throughs across all 9
  buildings to see teaching moves in action. Goal was 100% Hub logins before
  this date.**"
- Verify after deploy: https://www.teachersdeserveit.com/partners/addison-sd4

## Also checked, and not a bug

Addison's tab strip read "Overview, Our Partnership, Your Plan, Next Year" on
first load, which looked like the merge Rae asked for had regressed. It had not.
The year tabs are built from a fetch, and I had read the DOM before it resolved.
Re-read a moment later: "Overview, 2025-2026 Complete, 2026-2027 Live,
2027-2028 Proposed, Reports, Schools, Team". Our Partnership, Your Plan and
Next Year are all gone, as intended.
