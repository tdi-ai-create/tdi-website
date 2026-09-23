# Browser pass

## What this change touches

The Contract panel on the Leadership Dashboard, and the upcoming dates a school
sees on its own partner dashboard. Both now show planned dates, which until now
were visible only in Billing.

## Why

Rae, 23 September 2026, asked whether the dashboards carry these dates. They did
not. planned_date was read by four billing files and nothing else, so a coach
looking at St Peter Chanel read "Not yet delivered" against a visit booked for
30 November, and the school's own dashboard said "Dates will appear here as they
are confirmed" while four of their dates sat in our system.

## What I did, on the Leadership Dashboard

- Opened: http://localhost:3005/tdi-admin/leadership/8b185d9a-c7f0-407c-aa7e-faf0ac483416
  as Review Admin
- Saw: the Contract panel now reads "On-Campus Observation & F... Planned for
  Feb 22, not confirmed with them yet" against a $4,500 line marked Pending. It
  read "Not yet delivered" before this change.
- Saw: "Virtual Strategy Session (50% ... Planned for Apr 7, not confirmed with
  them yet", and "Executive Impact Session 1 (complim... Delivered Sep 22 by
  rae", so delivered lines still lead with their delivery date.
- Pressed: nothing that writes. This panel has no write controls.

## What I did, on the partner dashboard

Read the API the school's dashboard is built from, for St Peter Chanel.

- Saw: four planned events returned, which is every dated line they have.
  "2026-11-30 In-Person Observation Day (1 of 2), Confirmed with your team."
  "2027-02-22 In-Person Observation Day (2 of 2), This date is provisional. It
  is held so it does not get taken, and can move to suit you."
  "2027-04-05 Executive Impact Session (2 of 2)" and "2027-04-07 Virtual
  Strategy Session", both carrying the same provisional wording.

## The thing worth catching

Contract labels are written for us. They say "(50% off)", "(legacy pricing, 40%
off)", "discount recovery" and "Base Contract". Putting a planned date on a
school's dashboard means putting its label there too, so titles are built from
the service type instead of copied from the contract. Checked by regex against
the four returned titles: zero leaked contract wording.

The Leadership Dashboard keeps the raw labels, because that screen is ours.

## What I could not verify

How the dates render inside the partner dashboard page itself. I read the API
that feeds it rather than loading the page, because the partner view is behind a
school login and the earlier lesson here is that /hub and partner routes bounce
a local session to a login screen. The mapping from this payload into the
timeline is existing code that nothing in this change touches.

Signed in as Review Admin rather than Rae.
