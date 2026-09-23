# Browser pass

## What this change touches

The Billing screen at /tdi-admin/billing. Each contract line can now carry a
planned date, set from inside the expanded line, and the delivery column shows
that date instead of "no record" when one exists.

## What I did

- Opened: http://localhost:3002/tdi-admin/billing, signed in as Review Admin
- Saw: the header reads "NOT BILLED $54,920" and "ON FUNDING $97,527", which are
  the client money and grant money figures this work is built on, so the screen
  and the database agree.
- Pressed: the Oak Grove School District 68 contract row, then the line
  "On-Campus Observation & Feedback Visit 1 (up to 15 teachers)"
- Saw: the delivery column on that line read "no date" before anything was set,
  and the Delivery pane read "Planned for   not set" with the line "Nothing
  forecasts this line until it has a date."
- Pressed: "Set planned date"
- Saw: a dialog titled "Set planned date", subtitled "On-Campus Observation &
  Feedback Visit 1 (up to 15 teachers), Oak Grove School District 68", with a
  date field hinted "The day the service is expected to happen, not the day it
  gets invoiced." and a firmness select defaulting to "held".
- Pressed: typed 01/20/2027 into the date field, left firmness on held, pressed
  "Set date"
- Saw: a toast reading "On-Campus Observation & Feedback Visit 1 (up to 15
  teachers) is held for 2027-01-20. Nothing is confirmed with the client." The
  row pill changed from "no date" to "20 Jan held" in the faint dashed style,
  while the other five Oak Grove lines still read "no date". The Delivery pane
  read "Planned for   20 Jan 2027, held" and the button became "Change planned
  date".
- Saw: it renders as "20 Jan 2027", not 19 January, so the date-only value is
  not being shifted a day by UTC parsing.

Confirmed in the database rather than from the screenshot: one row carried
planned_date 2027-01-20 with planned_confidence 'held', delivery_state still
'scheduled' and billing_state still 'not_billed', so setting a date changed
neither delivery nor billing.

## The row I changed, and putting it back

Oak Grove's contract is paused and that date was invented for the test, so it
was reverted immediately: planned_date and planned_confidence set back to null,
then counted. Rows carrying a planned date afterwards: 0.

## What I did not press

Mark delivered, on any line. That would record delivery against a real client
contract. Also did not set a date on any line belonging to a live, unpaused
contract, because a real planned date is Rae's to decide rather than mine.

## What I could not verify

That the action refuses a delivered or cancelled line. Both branches are in the
route and return 409, but every line on this screen is currently scheduled, so
there was nothing in that state to press.

Signed in as Review Admin rather than as Rae, so anything gated on a specific
person's permissions is not proven by this.

## Claim tiers

- Measured: every quoted string and figure above, and the database read and
  revert.
- Unverified: the delivered and cancelled refusals.
