# Browser pass

## What this change touches

The confirmation step of `/get-started`, `app/get-started/page.tsx`. The leader
path now offers a booking link as its primary action instead of ending on "check
your inbox in 24 hours". Teacher and para path unchanged.

## What I did

Run on a local dev server rather than production or a preview, because the
control does not exist anywhere else yet. It is the real page and the real
route, not a component in isolation.

- Opened: http://localhost:3422/get-started
- Saw: the live page, "Select Your Role to Get Started", four role cards under
  "I WORK IN A CLASSROOM" and "I LEAD A SCHOOL OR DISTRICT", and the badges
  "87,000+ educators served", "21 states", "Takes 10 seconds".
- Did not submit the form. See below.
- Instead seeded the confirmation state locally: `step` to 3, `selectedRole` to
  `Building Leader`, `name` to "Sample Principal", `schoolName` to "Sample
  School". Reverted immediately after. `git diff` confirms no seed values
  survive in the committed change.
- Saw: the confirmation panel reading "You're all set." above "Thanks, Sample
  Principal. We're reviewing your answers and we'll have your custom PD plan for
  Sample School ready for you in 24 hours. You can schedule your call now to
  review it."
- Saw: a yellow "Schedule your call" button directly beneath it, above "What
  happens next", with the line "Pick a time that works. Your plan will be ready
  before it."
- Saw: "What happens next" step 3 now reads "We walk you through it on your
  call". It read "We follow up to answer any questions" before, which stops
  being true once a call is bookable on the same screen.
- **Pressed: "Schedule your call"**
- Saw: a new tab open on
  `calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0w4-V7...`
  titled **"Quick Chat with Rae Hughart"**. The confirmation page stayed open
  behind it, which is the reason for `target="_blank"`.

### The embedded calendar, second pass after Kristin's reply

Kristin asked for the booking widget embedded rather than a button, to cut the
friction of leaving the page. Checked before building it that Google permits it:
the schedule with `?gv=true` returns 200 with no `X-Frame-Options` and no
`frame-ancestors` in its CSP.

- Opened: http://localhost:3433/get-started, confirmation state seeded as above.
- Saw: the widget render inside the page under "Pick a time to walk through it",
  headed "Rae Hughart", "Quick Chat with Rae Hughart", "30 min appointments".
- Saw: real bookable slots for Wed 30 September: 10:30am, 11:00am, 11:30am,
  12:30pm, 2:30pm, 3:00pm, with "(GMT-05:00) Central Time - Chicago" shown and
  past dates struck through in the month grid.
- Saw: the fallback line beneath it, "Calendar not loading? Open it in a new
  tab.", with the short booking link behind it.

### The failure state

The change also stops the form reporting success when the submission failed, so
that state was rendered and checked the same way.

- Seeded `submitFailed` to true on step 2, leader path. Reverted after.
- Saw: a red panel directly under "Send My PD Plan", reading "That did not go
  through." above "Nothing was sent, so please press the button again. If it
  fails twice, email hello@teachersdeserveit.com and we will set your plan up by
  hand." The address is a live mailto link.
- Confirmed the form stays on step 2 rather than advancing, which is the whole
  point: before this, every failure path called `setStep(3)` and showed the
  confirmation screen.

## What I did not press

**Submit on the form.** Submitting fires three live side effects even from a
local server, because `.env.local` and the hard-coded endpoints point at the real
services: a LeadConnector webhook, a `web3forms` submission that sends mail, and
`POST /api/leads/create`. That would have put a fabricated principal and school
into the CRM and the lead queue. Seeding the confirmation state reaches the same
screen without inventing a lead.

There is already one such record in the system from an earlier manual test,
"Testing Testing" at "Testing School", visible in the screenshot on the request.

## What I could not verify

**How it renders in production.** Not deployed. Verify after deploy at
https://www.teachersdeserveit.com/get-started by completing the leader path
properly, which is also the only way to confirm the real name and school
interpolate into the new sentence.

**Whether a booking completes.** The widget lists real slots and I did not press
one, because that would put a fake meeting on the calendar. The path from
choosing a slot to a confirmed booking is unexercised.

**The embed on a narrow screen.** Checked at desktop width only. The frame is
600px tall and Google's widget is cramped on a phone, so this wants a look on
mobile after deploy.

**The teacher and para path.** Untouched by the booking button, which sits
inside `!isTeacherPath`, so a nominating teacher never sees it. The submit fix
does apply to that path, and I did not exercise it separately.

**A real failing submission.** The error state was rendered by seeding, not by
making web3forms actually fail. The `!res.ok` throw is unexercised at runtime.

**Note on the gate.** `check-browser-pass` does not require a pass for this file,
since `/get-started` is not classed as a screen someone operates. This was
written anyway because the change alters what a visitor is told after giving us
their details.
