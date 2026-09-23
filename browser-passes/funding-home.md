# Browser pass

## What this change touches

`/tdi-admin/funding` itself. It was the old grant board. It is now Funding
Home, the port of the Funding Home mockup: a navy chrome bar, a Calendar view,
a Schools view and a school detail with a live notes log and an editable
profile. The old board moved to `/tdi-admin/funding/board` and is reachable
from the chrome nav.

## What I did

Run locally against the live database, not on production, because the change
is not merged. Every figure below is real funding data. Signed in as Review
Admin, which affects the sidebar name and nothing read here.

- Opened: http://localhost:3000/tdi-admin/funding
- Saw: the navy chrome bar reading "TDI Funding / admin" with Calendar,
  Schools and Board, then "What has to happen, and when" and the six item
  legend: To the school, Internal step, Waiting on school, Closing or overdue,
  Decision due, Predicted. Not the old board.
- Saw: "September 2026", the chip "today · 23 Sep 2026", and the coverage line
  "6 of 22 live grant paths have a confirmed deadline." The grid runs Mon to
  Sun with all seven columns visible. The 15th carries three pills and "2 more",
  the 30th carries the two red closing pills, and the predicted entries carry
  the dashed border.
- Pressed: the 24 September cell
- Saw: the modal opens headed "2026-09-24" with three cards. The first is
  tagged DECISION DUE for St. Peter Chanel School, titled "Ask BRAF for the
  Ourso form field..." and carries the full prose, ending "The email is drafted
  below. Send it from hello@, then record the reply here." The second and third
  are tagged INTERNAL STEP plus PREDICTED and read "Passed QA on 2026-09-22 and
  waiting on a person. 2 days is the allowance before it reads as stuck."
- Pressed: the close X, then "Schools"
- Saw: three cards. Saunemin CCSD #438 reads "1 won, amount not recorded" with
  "7 live paths, 1 won, 1 without an amount". Allenwood and St. Peter Chanel
  both read "nothing awarded yet", with 6 and 9 live paths.
- Pressed: the Saunemin card
- Saw: the detail view, "Saunemin, Livingston County, IL · Gary Doughan ·
  District Contact", tabs "Notes log" and "Profile (7 unsourced)", the live
  chip "live, updates as Paperclip moves", and the log beginning 2026-09-22
  "Illinois Prairie Community Foundation passed QA (julie) -> needs your
  approval before it can go to the school".
- Pressed: "Profile (7 unsourced)"
- Saw: the field grid. Seven facts carry an amber "No source recorded":
  educator count 23, frl pct 59%, iep students 29, math proficiency 32%,
  paraprofessionals 12, reading proficiency 22%, title i status School Wide.
- Pressed: the frl pct value, which opened the inline editor with an empty
  source box, then pressed "Save" with the source still empty.
- Saw: the save was refused and the page printed the route's own words: "Say
  where this number came from. A fact with no source is what QA keeps sending
  back." The value stayed 59%. This is the one rule the screen exists for and
  the refusal is surfaced rather than swallowed.
- Opened: http://localhost:3000/tdi-admin/funding/board
- Saw: the old board intact after the move and the import rewrite. "Needs you
  25", the pipeline stats "$87.7K still to find" and "AWARDED $0, 1 more not
  recorded", and all five columns with their working controls including "Write
  to the school", "Request draft", "Open" and "Chase".

## Two layout bugs found by looking, not by typecheck

Both typechecked and both would have shipped.

- The calendar columns blew past the viewport and pushed the Board link off
  screen, because a grid track's minimum is its content and the pill labels are
  nowrap. Fixed with `min-width:0` on the track.
- The modal cards clipped their own action row, because they are flex items in
  a height-capped column and shrink below their content, and `.card` sets
  `overflow:hidden`. Fixed with `flex:0 0 auto`.

## What I did not press

Nothing that changes a grant. I did not save a profile fact with a valid
source, because that writes to a live school record and supersedes the current
value. The refusal path above exercises the same route and changes nothing.

## What I could not verify

That it looks right on production, because it is not merged.

The popup actions from the mockup, because they are not built. The cards carry
"Open this grant" and "Open <school>" rather than the mockup's gate, approve,
send and record controls. Those are the next piece and the reason the old
board still exists.

## Claim tiers

- Measured: everything under "What I did", read off the screen.
- Unverified: production rendering, and the popup actions, which do not exist.
