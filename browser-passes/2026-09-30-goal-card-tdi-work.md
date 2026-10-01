# Browser pass

## What this change touches

The Your Goals card on the partner dashboard Overview, and the leadership KPI
menu text that feeds it.

## Why

Rae, 30 September 2026, approving three new KPIs for Addison: "we need to also
layout how we will measure it."

Two of the four fields written on every KPI row had never reached a client.

`how_tdi_delivers` rendered on no screen at all. Not the partner dashboard, not
the admin leadership page. It is held in React state in both files and displayed
in neither. Grepped across `app`, `components`, `lib` and `scripts`: it appears
only in the two state types, the API select, and the admin menu that writes it.
So the sentence explaining what TDI does about a number was the one thing a
leader could not see, which is the exact inverse of Rae's rule that an
unfavourable number never renders without the work beside it.

`data_source` was reachable only as a fallback for an empty `benchmark_label`.
Every real partnership row has a benchmark label, so in practice the instrument
behind the figure never printed either.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw: the Your Goals card renders all three new goals. "Staff actively using
  the Hub" reads **"34% of 100%"** with a solid bar. "De-escalation strategies
  in practice" reads **"Target 85%"** and "Para and teacher working
  relationship" reads **"Target set with your team"**, both with the dashed
  never-measured bar rather than an 0% ring.
- Saw: a new always-visible block under each goal headed "What we are doing
  about this", computed background `rgb(232, 240, 253)`, which is brand light
  blue `#E8F0FD`. On the activation goal it reads "A nudge that opens your own
  email with everyone who has not started already filled in, so the message
  comes from you rather than from us."
- Pressed: the "How we measure this" summary on the first goal
- Saw: `details.open` went **false to true** and the panel measured **463px**
  tall. Its body opens "The share of your 149 paras who have done anything in
  the Hub beyond h...", confirming the "How we measure this." lead-in is
  stripped so the phrase does not print twice.
- Saw: the labels inside, in order, are "Where the number comes from" then
  "What this does not show". The first is new.

## Why the TDI work is not inside the disclosure

Rae asked for it "under each goal". A leader scanning a 34% bar does not open a
panel labelled "How we measure this" to discover we are doing something about
it, so the work sits above the fold and the measurement detail stays collapsed.

## One thing this change made dangerous, and the fix

Surfacing `how_tdi_delivers` promotes 27 rows across 7 partnerships from
internal text to client-facing copy in one deploy. I checked every one in SQL
for the two rules that would bite: **0 of 27 mention Rae** and **0 of 27 contain
an em dash or double hyphen**. They were already written in client voice.

The seed text in the admin KPI menu was not. One entry read "Personal outreach
from Rae when individual scores trend low", and that field is now printed to
clients, so any KPI added from the menu would have put Rae's name on a district
dashboard. Changed to "Personal outreach from the team".

I also rewrote Addison's own activation text. My first draft explained the low
number by describing one of our bugs, that the goal prompt never ran for
accounts created in bulk. True, and the wrong thing to put on a client card.

## What I did not press

The nudge. It opens a mail client addressed to 98 real paraprofessionals.

## What I could not verify

Production, a separate deploy.

The other six partnerships on screen. I verified their text is safe by querying
all 27 rows, not by loading six dashboards. Their goal cards change shape the
moment this deploys, so one of them is worth a look after.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so it sits at `visibility: hidden` and
a screenshot shows the loading splash. Every observation above was read from the
DOM, including the computed background colour and the 463px panel height, rather
than from an image.
