# Browser pass

## What this change touches

Both year tabs on the partner dashboard, rebuilt to lead with the result, and
nudge rebuilt as a mailto.

## Why the layout changed

Rae, 30 September 2026. Two rules:

The page exists to show what the partnership produced. The previous version
opened on "51 of 149" and "98 never signed in", which reads as a partnership
underperforming to the person deciding whether to renew it on tight Title II
money.

Any number that is not favourable carries a TDI solution beside it. The
strongest is something already in their contract, because it costs the leader
nothing to accept.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Pressed: the "2026-2027" tab
- Saw, in order: a navy hero reading "Eleven weeks in, and your team is going
  straight to de-escalation." with four gold figures, "51 paras already using
  the Hub", "20 were in it this week", "32 have opened a lesson", "9 buildings
  represented". Then "2026-2027 in numbers" with "34% Team activation, 20 Active
  this week, 28 Active this month, 149 Educators with Hub access". Then "What
  stood out", "Your next 98", "Use your second Executive Impact Session on
  this", "2026-2027 timeline", "What districts add next" with an on-campus
  observation day and virtual strategy sessions.
- Saw: the nudge link is present and its `bcc` carries **exactly 98 addresses**,
  which is 149 minus 51. Counted by decoding the href, not by eye.
- Pressed: the "2025-2026" tab
- Saw the same shape with that year's own content: hero reading "Your paras
  ended the year less stressed, more confident, and putting the work into
  practice.", then "2025-2026 in numbers", "What stood out", "Two on-campus
  observation days", "In their own words", "2025-2026 timeline".
- Saw: **no nudge on the past year**, which is correct. There is nobody left to
  reach in a year that has ended.

## One thing I invented and removed

An earlier draft of this offered "a twenty minute live walkthrough at your next
late start". TDI does not sell that. It would have had a district asking for a
service that does not exist. It was replaced with their unused second Executive
Impact Session, which is real, already paid for, and moves an undelivered line
in our own contract at the same time.

Everything else on the page traces to a contract field or something actually
delivered: observation days and virtual sessions are real contract columns, and
the ten love notes are in Addison's own observation record.

## What I did not press

The nudge itself. It opens a mail client addressed to 98 real paraprofessionals.
I verified the recipient list by decoding the href instead.

## What I could not verify

Production, a separate deploy.

The visual rendering had to be forced. The dashboard hides behind an intro
animation whose timer does not fire in a backgrounded automated tab, so a
screenshot shows the loading splash. I made the panel visible through the DOM to
capture it, and the screenshot confirms the hero, the four gold figures and the
numbers row render as designed. The structure and content were read from the DOM
rather than from the image.

The mirror is not perfect: 2026-2027 has no "In their own words" because no para
quotes are stored for this year yet. It will appear when there are some, with no
code change.
