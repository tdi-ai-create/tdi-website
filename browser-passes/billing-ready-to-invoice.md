# Browser pass

## What this change touches

A new Ready to invoice tab in Billing at /tdi-admin/billing/forecast. It places
contract lines in the month they become billable, with client money and grant
money totalled separately, and pins everything it cannot date above the
calendar.

## What I did

- Opened: http://localhost:3002/tdi-admin/billing/forecast, signed in as Review Admin
- Saw: the tab strip now reads "Contracts, Ready to invoice, Money, Documents,
  Outbox, Guardrails" with Ready to invoice active.
- Saw: the strip across the top reads "CLIENT MONEY $54,920", "DATED $6,750",
  "GRANT MONEY $97,527", "DATED $9,000", "UNDATED LINES 40 of 43 ahead of us",
  which are the same figures the database gives.
- Saw: a blue note reading "These two totals are never added together." followed
  by "Client money is gated on us delivering. Grant money is gated on a funder
  deciding, and cannot be invoiced until the award lands whatever the calendar
  says."
- Saw: the undated queue titled "Not on the calendar yet" listing 40 lines, each
  with its own reason underneath. Allenwood's "Learning Hub Membership x75" at
  $22,425.00 reads "hub membership bills on a milestone, not a visit. Not
  modelled yet." Oak Grove's three observations read "No planned date. Nobody
  has booked this line." Saunemin's "TDI Book x23 (complimentary)" reads "book
  bills on a milestone, not a visit." and shows "No charge" rather than a figure.
- Saw: a month card headed "November 2026" with "Client $6,750" and "Grant
  $9,000" side by side and never summed.
- Saw: within it, "6 Nov, Fall On-Campus Observation & Feedback (25% off), Glen
  Ellyn D41 - service 5 Nov, Client funded, $6,750.00". The ready date is the
  day after the service, which is the rule.
- Saw: "16 Nov, On-Campus Observation Visit -- discount recovery (50%) (1 of 2),
  Saunemin CCSD #438 - service 7 Oct - award expected 16 Nov, Grant funded,
  $4,500.00". A grant line sits on its award date, not its service date.
- Saw: "16 Nov ... (2 of 2), Saunemin CCSD #438 - service 3 Mar, held - award
  expected 16 Nov" carrying the warning "The award lands before the visit.
  Nothing can be invoiced until the work is delivered and marked." That is the
  case where the award date alone would promise a month the Create invoice
  button would refuse.
- Saw: the held date renders as "service 3 Mar, held" while the confirmed ones
  carry no such word, so the two do not read alike.
- Saw: the footer reads "Every date here is the day a line becomes ready to
  invoice. Nothing sends itself. Drafts wait in the Outbox until someone presses
  Send."

## The values I changed, and putting them back

Nothing in production carried a planned date, so the calendar had nothing to
render and the rules could not be seen. Four values were set temporarily:
Saunemin's two grant observations to 7 Oct confirmed and 3 Mar held, Glen
Ellyn's Fall observation to 5 Nov confirmed, and the Saunemin grant pursuit's
expected decision date to 16 Nov.

All four were reverted immediately afterwards. Counted back: lines with a
planned date 0, lines with a confidence 0, pursuits with a decision date 0.

## After reverting, pressed again

- Pressed: "Contracts" in the billing tab strip, then "Ready to invoice"
- Saw: both navigate, and Ready to invoice renders as the active tab with the
  underline. With the test values gone the strip now reads "DATED $0" under both
  ledgers and "UNDATED LINES 43 of 43 ahead of us".
- Saw: the queue blurb switched wording by itself, from "These cannot be placed
  in a month yet" to "Every line ahead of us is in here. Until these have dates
  the calendar below has nothing true to show." That is the real state of the
  business today and the screen says so rather than rendering an empty calendar.

## What I did not press

Nothing that writes. This screen has no write controls by design: a service date
is set in Contracts and a grant decision date on the pursuit.

## What I could not verify

That months sort correctly across a year boundary with more than two months
populated. Only November had rows once the grant dates collapsed onto one date.

Whether the figures hold for a paused contract, because nothing records a pause.
Every partnership reads status 'active', Oak Grove included, so undated lines
are standing in for that and the screen says so rather than filtering silently.

Signed in as Review Admin rather than Rae, so anything gated on a specific
person's permissions is not proven by this.

## Claim tiers

- Measured: every quoted string and figure above, and the revert counts.
- Unverified: multi month sorting, and paused contract behaviour.

---

# Second pass, after the grant rule changed

Rae, 22 September: funding work is only allowed once funding has been awarded.
Taken with the award date being the gate, that means the award always precedes
the visit, so a grant line can never legitimately sit in a month before its
award. It now waits in the queue with its decision date instead, and becomes
ordinary work the moment the grant lands.

## What I did

- Opened: http://localhost:3002/tdi-admin/billing/forecast, signed in as Review Admin
- Pressed: nothing that writes. Saunemin's real 7 October visit had been dated on
  the school paid line beforehand, which is the first genuine date in the system.
- Saw: the header now reads "CLIENT MONEY $54,920", "DATED $4,500", "GRANT MONEY
  $97,527", "AWARDED $0" noted "won, so it can be scheduled", and "UNDATED LINES
  42 of 43 ahead of us".
- Saw: the note now reads "Grant money stays off the calendar until the grant is
  won, because the work cannot be scheduled before then, so it waits in the queue
  with its decision date."
- Saw: a month card headed "October 2026" reading "Client $4,500" and "Grant $0",
  containing "8 Oct, On-Campus Observation & Feedback Visit 1 (50% off), Saunemin
  CCSD #438 - service 7 Oct". The ready date is the day after the visit.
- Saw: every grant line sits in the queue, Allenwood's "Learning Hub Membership
  x75" at $22,425.00 among them, each reading "Waiting on a grant with no
  expected decision date, so there is nothing to forecast against."
- Saw: no row anywhere carries the old "award lands before the visit" warning,
  because that case no longer exists.

## What I could not verify

How a grant line renders once it is actually awarded and funding_hold clears.
No grant has been won, so there is nothing in that state to look at. The path is
the same one client money takes, but it has not been seen.
