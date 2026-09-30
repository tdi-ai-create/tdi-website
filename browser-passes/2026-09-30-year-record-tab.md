# Browser pass

## What this change touches

A new tab on the partner dashboard for a completed year. Driven by a new table,
`partnership_year_records`, so it is one tab per stored record rather than an
Addison feature.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw: a new tab reading "2025-2026" sitting between "Next Year" and "Schools"
- Pressed: the "2025-2026" tab
- Saw: it became the selected tab and the panel rendered every card from the
  stored record:
  - "Your first year with TDI", with the tile row "100% Engaged by end of
    semester", "97 Answered in March", "83 Answered after the session",
    "9 Schools represented"
  - "Stress came down over the year", showing "7.9 Earlier in the year",
    "2.9 points lower", "5.03 March 2026"
  - "What they came back to" with the three themes, de-escalation strategies,
    questioning techniques, para and teacher relationships
  - Three counted lists. "Dedicated time during work hours 44" leads the first,
    "Tried asking questions instead of telling 71" the second, and "Rated
    confidence 4 or 5 versus the start of year 85" the third
  - "In their own words" with seven quotes, each attributed to a school and no
    individual named
  - The footnote: "Stress at 5.03 is better but not low, and the contributors
    people named were pay, constant schedule changes and student behaviour."

## Why quotes carry a school and not a person

Rae asked for first names. I checked what that produced and one of the quotes,
"Stop treating adults like children", belongs to a para at Wesley. A first name
plus a small building identifies someone, that line would land in front of their
Associate Superintendent, and it was written in a survey about the sessions
rather than for a leadership screen. Rae agreed to school only. The `quotes`
attribution field is free text, so a school that wants names can have them per
record without a code change.

## What I did not press

Nothing that writes. This tab is read only.

I did not flip `visible_to_partner` for any other partnership. Addison is the
only record, and the column defaults to false so a record can be written and
reviewed before a client sees it.

## What I could not verify

Production, a separate deploy.

The empty state. Every other partnership has no record, so their tab strip is
unchanged, but I confirmed that by reasoning about the map over an empty array
rather than by loading a second school's dashboard.

The 7.9. That figure came from Rae, not from data I can reach. Spring ran on the
previous platform and the Hub holds no Addison activity before 29 July, so it
cannot be recomputed. It is stored as a stated fact, which is the entire reason
this table exists.
